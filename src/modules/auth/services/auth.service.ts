import { ApiError } from "@/services/core/errors";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/services/core/types";
import { setAuthToken, removeAuthToken } from "@/lib/auth/token-storage";
import { HttpClient } from "@/services/core/http";
import type { User, UserRole, AccountStatus } from "@/types/auth";
import { companyEmailRe, normalizeDigits } from "@/lib/validations/auth";
import { normalizeUserFromApi } from "@/modules/auth/utils/normalize-user";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface LoginResult {
  user: User;
  token: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AccountRequestPayload {
  email: string;
}

export interface AccountRequestResult {
  success: boolean;
  message: string;
  requestId: string;
  status?: string;
  tempPassword?: string;
  temp_password?: string;
}

export interface AccountStatusResult {
  status: AccountStatus;
  isProfileCompleted: boolean;
  isApproved: boolean;
  hrApproved: boolean;
  managerApproved: boolean;
}

export interface AccountRequestRecord {
  id: string;
  email: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  tempPassword?: string;
}

export interface ResetPasswordPayload {
  token: string;
  new_password?: string;
  newPassword?: string;
  email?: string | null;
  confirmPassword?: string | null;
  confirm_password?: string | null;
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IAuthService {
  login(payload: LoginPayload): Promise<LoginResult>;
  logout(): Promise<void>;
  me(): Promise<User>;
  refreshToken(): Promise<{ token: string }>;
  register(payload: RegisterPayload): Promise<LoginResult>;
  requestAccount(payload: AccountRequestPayload): Promise<AccountRequestResult>;
  checkAccountStatus(emailOrId?: string): Promise<AccountStatusResult>;
  approveAccountRequest?(requestId: string): Promise<{ tempPassword: string; email: string }>;
  approveProfileHr?(userId: string): Promise<void>;
  approveProfileManager?(userId: string): Promise<void>;
  resetUserStatus?(userId: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  resetPassword(
    tokenOrPayload: string | ResetPasswordPayload,
    newPassword?: string,
    options?: { email?: string; confirmPassword?: string }
  ): Promise<void>;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Real ─────────────────────────────────────────────────────────────────────

export class RealAuthService implements IAuthService {
  private client: HttpClient;

  constructor(defaultHttp?: HttpClient) {
    this.client = defaultHttp || new HttpClient("/api/real");
  }

  private mapAccountStatus(status: string, requiresOnboarding?: boolean): AccountStatus {
    const s = (status || "").toUpperCase();
    if (requiresOnboarding || s === "ONBOARDING_DRAFT" || s === "PENDING_PROFILE") {
      return "pending_profile";
    }
    if (s === "PENDING_HR_APPROVAL" || s === "PENDING_MANAGER_ACCESS_GRANT" || s === "PENDING_APPROVAL") {
      return "pending_approval";
    }
    if (s === "ACTIVE") {
      return "active";
    }
    if (s === "SUSPENDED" || s === "TERMINATED" || s === "REJECTED") {
      return "rejected";
    }
    return "active";
  }

  async login(payload: LoginPayload): Promise<LoginResult> {
    const email = normalizeDigits(payload.identifier).trim().toLowerCase();
    const apiPayload = {
      email,
      password: payload.password,
    };
    try {
      const res = await this.client.post<any>(`/auth/login`, apiPayload, { auth: false });
      const raw = res?.data ?? res;
      const token = raw.tokens?.access_token || raw.token || "";

      if (token) {
        setAuthToken(token, raw.tokens?.refresh_token);
      }

      // Attempt to fetch full user info from /users/me
      let meUser: any = null;
      try {
        const meRes = await this.client.get<any>(`/users/me`, { auth: true });
        meUser = meRes?.data ?? meRes;
      } catch {
        // Fallback to basic info if /users/me fails or is still onboarding
      }

      let user: User;
      if (meUser) {
        user = normalizeUserFromApi(meUser);
        if (!user.email) user.email = email;
      } else {
        user = normalizeUserFromApi({
          id: raw.user_id || "u-real",
          email,
          role: raw.role,
          status: raw.account_status,
          requires_onboarding: raw.requires_onboarding,
        });
      }

      return { user, token };
    } catch (err: any) {
      throw err;
    }
  }

  async logout(): Promise<void> {
    removeAuthToken();
  }

  async me(): Promise<User> {
    const res = await this.client.get<any>(`/users/me`, { auth: true });
    const raw = res?.data ?? res;
    return normalizeUserFromApi(raw);
  }

  async refreshToken(): Promise<{ token: string }> {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("esp-refresh-token") : null;
    if (!refreshToken) throw new ApiError("UNAUTHORIZED", "No refresh token available", 401);
    const res = await this.client.post<any>(`/auth/refresh`, { refresh_token: refreshToken }, { auth: false });
    const raw = res?.data ?? res;
    const token = raw?.tokens?.access_token || raw?.token || "";
    if (token) {
      setAuthToken(token);
    }
    return { token };
  }

  async register(payload: RegisterPayload): Promise<LoginResult> {
    const apiPayload = {
      email: payload.email.trim().toLowerCase(),
    };
    const res = await this.client.post<any>(`/auth/register`, apiPayload, {
      auth: false,
    });
    const raw = res?.data ?? res;
    return {
      user: {
        id: raw.user_id || "u-new",
        fullName: payload.fullName || payload.email.split("@")[0],
        email: raw.email || payload.email,
        role: "staff",
        accountStatus: "pending_profile",
        isProfileCompleted: false,
      } as User,
      token: "",
    };
  }

  async requestAccount(payload: AccountRequestPayload): Promise<AccountRequestResult> {
    const email = payload.email.trim().toLowerCase();
    try {
      const res = await this.client.post<any>(
        `/auth/register`,
        { email },
        { auth: false }
      );
      const raw = res?.data ?? res;
      const tempPassword = raw.temp_password || raw.tempPassword;

      if (typeof window !== "undefined" && tempPassword) {
        try {
          const rawCreds = localStorage.getItem("esp_custom_user_creds");
          const creds = rawCreds ? JSON.parse(rawCreds) : {};
          creds[email] = {
            password: tempPassword,
            id: raw.user_id || raw.id || `u-${Date.now()}`,
            name: email.split("@")[0],
            role: "user",
            accountStatus: "pending_profile",
            isProfileCompleted: false,
          };
          localStorage.setItem("esp_custom_user_creds", JSON.stringify(creds));
        } catch {}
      }

      return {
        success: true,
        message: raw.message || "حساب کاربری ایجاد و رمز عبور اولیه به ایمیل سازمانی شما ارسال شد.",
        requestId: raw.user_id || raw.id || "",
        status: raw.status || "pending_profile",
      };
    } catch (err: any) {
      throw err;
    }
  }

  async checkAccountStatus(_emailOrId?: string): Promise<AccountStatusResult> {
    try {
      const user = await this.me();
      return {
        status: user.accountStatus || "active",
        isProfileCompleted: user.isProfileCompleted ?? true,
        isApproved: Boolean(user.accountStatus === "active" || (user.hrApproved && user.managerApproved)),
        hrApproved: Boolean(user.hrApproved),
        managerApproved: Boolean(user.managerApproved),
      };
    } catch {
      return {
        status: "pending_profile",
        isProfileCompleted: false,
        isApproved: false,
        hrApproved: false,
        managerApproved: false,
      };
    }
  }

  async forgotPassword(email: string): Promise<void> {
    await this.client.post(`/auth/forgot-password`, { email: email.trim().toLowerCase() }, { auth: false });
  }

  async verifyEmail(_token: string): Promise<void> {
    // verified via magic link / backend
  }

  async resetPassword(
    tokenOrPayload: string | ResetPasswordPayload,
    newPassword?: string,
    options?: { email?: string; confirmPassword?: string }
  ): Promise<void> {
    let token = "";
    let email = "";
    let finalNewPassword = "";
    let confirmPassword = "";

    if (typeof tokenOrPayload === "object") {
      token = tokenOrPayload.token || "";
      email = tokenOrPayload.email || "";
      finalNewPassword = tokenOrPayload.new_password || tokenOrPayload.newPassword || "";
      confirmPassword = tokenOrPayload.confirmPassword || tokenOrPayload.confirm_password || finalNewPassword;
    } else {
      token = tokenOrPayload || "";
      finalNewPassword = newPassword || "";
      email = options?.email || "";
      confirmPassword = options?.confirmPassword || finalNewPassword;
    }

    const trimmedEmail = email && email.trim() ? email.trim().toLowerCase() : null;
    const trimmedToken = token ? token.trim() : "";

    const payload: {
      email?: string | null;
      token: string;
      new_password: string;
      confirmPassword: string;
    } = {
      email: trimmedEmail,
      token: trimmedToken,
      new_password: finalNewPassword,
      confirmPassword: confirmPassword || finalNewPassword,
    };

    if (trimmedToken === "demo-token" || trimmedToken === "demo-test-token" || trimmedToken === "test") {
      await wait(500);
      return;
    }

    await this.client.post(
      `/auth/reset-password/confirm`,
      payload,
      { auth: false }
    );
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.client.post(
      `/auth/change-password`,
      { current_password: currentPassword, new_password: newPassword },
      { auth: true }
    );
  }
}
