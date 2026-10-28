import { ApiError } from "@/services/core/errors";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/services/core/types";
import { HttpClient } from "@/services/core/http";
import type { User, UserRole, AccountStatus } from "@/types/auth";
import { companyEmailRe } from "@/lib/validations/auth";
import authUsersMock from "@/data/mock/auth-users.json";

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
  resetPassword(token: string, newPassword: string): Promise<void>;
}

// ─── Fake ─────────────────────────────────────────────────────────────────────

const FAKE_DELAY = 600;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const DEMO_USERS: Array<{ email: string; mobile: string; password: string; user: User }> = authUsersMock as unknown as Array<{ email: string; mobile: string; password: string; user: User }>;
export { DEMO_USERS };

const ACCOUNT_REQUESTS_KEY = "esp_account_requests";

export class FakeAuthService implements IAuthService {
  async login({ identifier, password }: LoginPayload): Promise<LoginResult> {
    await wait(FAKE_DELAY);
    const id = identifier.trim().toLowerCase();
    const isSaeed = id === "saeed@demo.com" || id === "saeed" || id === "09120000000";
    const isGuest =
      id === "guest@demo.com" ||
      id === "gust@demo.com" ||
      id === "guest" ||
      id === "gust" ||
      id === "09120000001";

    // First check in-memory or persisted users
    let dynamicUsers = [...DEMO_USERS];
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("esp_demo_users_override");
        if (stored) {
          const parsed = JSON.parse(stored);
          dynamicUsers = parsed;
        }
      } catch {
        // ignore
      }
    }

    const match = dynamicUsers.find((c) => {
      if (c.user.id === "u-saeed" && isSaeed) {
        return c.password === password;
      }
      if (c.user.id === "u-guest" && isGuest) {
        return password === "guest" || password === "gust";
      }
      return (
        (c.email.toLowerCase() === id || c.mobile === id) &&
        (c.password === password || (c.user.id === "u-guest" && (password === "guest" || password === "gust")))
      );
    });

    if (!match)
      throw new ApiError(
        "INVALID_CREDENTIALS",
        "ایمیل/موبایل یا رمز عبور اشتباه است.",
        401,
      );

    const token = `fake-token-${match.user.id}-${Date.now()}`;
    return { user: { ...match.user }, token };
  }

  async logout(): Promise<void> {
    await wait(200);
  }

  async me(): Promise<User> {
    await wait(300);
    if (typeof window === "undefined")
      throw new ApiError("UNAUTHORIZED", "Not authenticated", 401);
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) throw new ApiError("UNAUTHORIZED", "کاربر یافت نشد.", 401);

    let parsed = JSON.parse(raw) as User;

    // Sync with DEMO_USERS to inject latest properties if it's a demo user
    const demoMatch = DEMO_USERS.find((d) => d.user.id === parsed.id);
    if (demoMatch) {
      parsed = { ...demoMatch.user, ...parsed };
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(parsed));
    }

    return parsed;
  }

  async refreshToken(): Promise<{ token: string }> {
    await wait(200);
    return { token: `fake-token-refresh-${Date.now()}` };
  }

  async register(payload: RegisterPayload): Promise<LoginResult> {
    await wait(FAKE_DELAY);
    const newUser: User = {
      id: `u-${Date.now()}`,
      fullName: payload.fullName,
      email: payload.email,
      role: payload.role ?? "customer",
      primaryColor: "blue",
      accountStatus: "active",
      isProfileCompleted: true,
    };
    return { user: newUser, token: `fake-token-${newUser.id}` };
  }

  async requestAccount(payload: AccountRequestPayload): Promise<AccountRequestResult> {
    await wait(FAKE_DELAY);
    const email = payload.email.trim().toLowerCase();

    if (!companyEmailRe.test(email)) {
      throw new ApiError(
        "VALIDATION_ERROR",
        "تنها ایمیل‌های سازمانی با پسوند euroslotpars.com@ یا npceram.com@ مجاز هستند.",
        400
      );
    }

    const requestId = `req-${Date.now()}`;
    const newRequest: AccountRequestRecord = {
      id: requestId,
      email,
      requestedAt: new Date().toISOString(),
      status: "pending",
    };

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(ACCOUNT_REQUESTS_KEY);
        const existing: AccountRequestRecord[] = raw ? JSON.parse(raw) : [];
        existing.unshift(newRequest);
        localStorage.setItem(ACCOUNT_REQUESTS_KEY, JSON.stringify(existing));
      } catch {
        // ignore
      }
    }

    return {
      success: true,
      message: "درخواست حساب کاربری با موفقیت ثبت شد و به مدیر سیستم ارسال گردید.",
      requestId,
    };
  }

  async checkAccountStatus(emailOrId?: string): Promise<AccountStatusResult> {
    await wait(300);
    let user: User | null = null;

    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      if (raw) user = JSON.parse(raw);

      const targetEmail = (emailOrId || user?.email || "").toLowerCase();
      if (targetEmail) {
        const rawReqs = localStorage.getItem(ACCOUNT_REQUESTS_KEY);
        if (rawReqs) {
          try {
            const reqs = JSON.parse(rawReqs);
            const matched = reqs.find((r: any) => r.email?.toLowerCase() === targetEmail || r.id === emailOrId);
            if (matched) {
              const hrApproved = Boolean(matched.hrApproved || user?.hrApproved);
              const managerApproved = Boolean(matched.managerApproved || matched.status === "active" || user?.managerApproved);
              const isProfileCompleted = Boolean(matched.isProfileCompleted ?? user?.isProfileCompleted);
              const status: AccountStatus = matched.status === "rejected" 
                ? "rejected" 
                : (managerApproved ? "active" : (hrApproved ? "pending_approval" : (isProfileCompleted ? "pending_approval" : "pending_profile")));
              
              return {
                status,
                isProfileCompleted,
                isApproved: status === "active" || (hrApproved && managerApproved),
                hrApproved,
                managerApproved,
              };
            }
          } catch {
            // ignore
          }
        }
      }
    }

    const status: AccountStatus = user?.accountStatus ?? "pending_profile";
    const isProfileCompleted = Boolean(user?.isProfileCompleted);
    const hrApproved = Boolean(user?.hrApproved);
    const managerApproved = Boolean(user?.managerApproved);
    const isApproved = status === "active" || (hrApproved && managerApproved);

    return {
      status,
      isProfileCompleted,
      isApproved,
      hrApproved,
      managerApproved,
    };
  }

  // Demo helpers for testing approvals
  async approveAccountRequest(requestId: string): Promise<{ tempPassword: string; email: string }> {
    await wait(400);
    const tempPassword = "password123";
    let targetEmail = "user@euroslotpars.com";

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(ACCOUNT_REQUESTS_KEY);
        if (raw) {
          const list: AccountRequestRecord[] = JSON.parse(raw);
          const req = list.find((r) => r.id === requestId);
          if (req) {
            req.status = "approved";
            req.tempPassword = tempPassword;
            targetEmail = req.email;
            localStorage.setItem(ACCOUNT_REQUESTS_KEY, JSON.stringify(list));
          }
        }
      } catch {
        // ignore
      }
    }

    return { tempPassword, email: targetEmail };
  }

  async approveProfileHr(userId: string): Promise<void> {
    await wait(400);
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      if (raw) {
        const user: User = JSON.parse(raw);
        if (user.id === userId || !userId) {
          user.hrApproved = true;
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        }
      }
    }
  }

  async approveProfileManager(userId: string): Promise<void> {
    await wait(400);
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      if (raw) {
        const user: User = JSON.parse(raw);
        if (user.id === userId || !userId) {
          user.managerApproved = true;
          user.hrApproved = true;
          user.accountStatus = "active";
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        }
      }
    }
  }

  async resetUserStatus(userId: string): Promise<void> {
    await wait(300);
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      if (raw) {
        const user: User = JSON.parse(raw);
        user.accountStatus = "pending_profile";
        user.isProfileCompleted = false;
        user.hrApproved = false;
        user.managerApproved = false;
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      }
    }
  }

  async forgotPassword(_email: string): Promise<void> {
    await wait(FAKE_DELAY);
  }

  async verifyEmail(_token: string): Promise<void> {
    await wait(FAKE_DELAY);
  }

  async resetPassword(_token: string, _newPassword: string): Promise<void> {
    await wait(FAKE_DELAY);
  }
}

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
    const email = payload.identifier.trim().toLowerCase();
    const apiPayload = {
      email,
      password: payload.password,
    };
    const res = await this.client.post<any>(`/auth/login`, apiPayload, { auth: false });
    const raw = res?.data ?? res;
    const token = raw.tokens?.access_token || raw.token || "";

    if (typeof window !== "undefined" && token) {
      try {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        if (raw.tokens?.refresh_token) {
          localStorage.setItem("esp-refresh-token", raw.tokens.refresh_token);
        }
      } catch {}
    }

    // Attempt to fetch full user info from /users/me
    let meUser: any = null;
    try {
      const meRes = await this.client.get<any>(`/users/me`, { auth: true });
      meUser = meRes?.data ?? meRes;
    } catch {
      // Fallback to basic info if /users/me fails or is still onboarding
    }

    const isCompleted = !raw.requires_onboarding;
    const status = raw.account_status || meUser?.status || "active";

    const userRoleRaw = (meUser?.role || raw?.role || "").toLowerCase();
    const isAdmin = userRoleRaw === "admin" || userRoleRaw === "administrator" || userRoleRaw === "superuser" || Boolean(meUser?.is_superuser || raw?.is_superuser);

    const user: User = {
      id: raw.user_id || meUser?.id || "u-real",
      fullName: meUser?.fullName || meUser?.full_name || email.split("@")[0],
      fullNameFa: meUser?.fullNameFa || meUser?.full_name_fa,
      email: email,
      role: (isAdmin ? "admin" : "staff") as UserRole,
      avatar: meUser?.avatarUrl || meUser?.avatar,
      avatarColor: meUser?.avatarColor,
      primaryColor: meUser?.primaryColor || "blue",
      accountStatus: this.mapAccountStatus(status, raw.requires_onboarding),
      isProfileCompleted: isCompleted,
      hrApproved: status === "ACTIVE" || status === "active" || status === "PENDING_MANAGER_ACCESS_GRANT",
      managerApproved: status === "ACTIVE" || status === "active",
    };

    return { user, token };
  }

  async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem("esp-refresh-token");
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem("esp_auth_user");
        localStorage.removeItem("esp_demo_users_override");
      } catch {}
    }
  }

  async me(): Promise<User> {
    const res = await this.client.get<any>(`/users/me`, { auth: true });
    const raw = res?.data ?? res;
    const status = raw.status || "active";
    const userRoleRaw = (raw.role || "").toLowerCase();
    const isAdmin = userRoleRaw === "admin" || userRoleRaw === "administrator" || userRoleRaw === "superuser" || Boolean(raw.is_superuser);

    return {
      id: raw.id,
      fullName: raw.fullName || raw.full_name || raw.email?.split("@")[0] || "User",
      fullNameFa: raw.fullNameFa || raw.full_name_fa,
      email: raw.email,
      role: (isAdmin ? "admin" : "staff") as UserRole,
      avatar: raw.avatarUrl || raw.avatar,
      avatarColor: raw.avatarColor,
      primaryColor: raw.primaryColor || "blue",
      accountStatus: this.mapAccountStatus(status, false),
      isProfileCompleted: true,
      hrApproved: status === "active" || status === "ACTIVE",
      managerApproved: status === "active" || status === "ACTIVE",
    };
  }

  async refreshToken(): Promise<{ token: string }> {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("esp-refresh-token") : null;
    if (!refreshToken) throw new ApiError("UNAUTHORIZED", "No refresh token available", 401);
    const res = await this.client.post<any>(`/auth/refresh`, { refresh_token: refreshToken }, { auth: false });
    const raw = res?.data ?? res;
    const token = raw?.tokens?.access_token || raw?.token || "";
    if (typeof window !== "undefined" && token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
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
    const res = await this.client.post<any>(
      `/auth/register`,
      { email: payload.email.trim().toLowerCase() },
      { auth: false }
    );
    const raw = res?.data ?? res;
    return {
      success: true,
      message: raw.message || "درخواست حساب کاربری شما با موفقیت ثبت شد.",
      requestId: raw.user_id || "",
    };
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
    await this.client.post(`/auth/reset-password`, { email: email.trim().toLowerCase() }, { auth: false });
  }

  async verifyEmail(_token: string): Promise<void> {
    // verified via magic link / backend
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.client.post(
      `/auth/reset-password/confirm`,
      { token, new_password: newPassword },
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
