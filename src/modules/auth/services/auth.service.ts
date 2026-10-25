import { ApiError } from "@/services/core/errors";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/services/core/types";
import { HttpClient } from "@/services/core/http";
import type { User, UserRole, AccountStatus } from "@/types/auth";
import { companyEmailRe } from "@/lib/validations/auth";

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

const DEMO_USERS: Array<{ email: string; mobile: string; password: string; user: User }> = [
  {
    email: "saeed@demo.com",
    mobile: "09120000000",
    password: "saeed",
    user: {
      id: "u-saeed",
      fullName: "Saeed Jalili Fard",
      fullNameFa: "سعید جلیلی فرد",
      email: "saeed@demo.com",
      mobile: "09120000000",
      avatar: "/team/saeed-jalili-fard.webp",
      role: "admin",
      primaryColor: "red",
      accountStatus: "active",
      isProfileCompleted: true,
      hrApproved: true,
      managerApproved: true,
    },
  },
  {
    email: "guest@demo.com",
    mobile: "09120000001",
    password: "guest",
    user: {
      id: "u-guest",
      fullName: "Guest User",
      fullNameFa: "کاربر مهمان (Gust)",
      email: "guest@demo.com",
      mobile: "09120000001",
      avatar: "/avatar/male-01.webp",
      role: "customer",
      primaryColor: "blue",
      accountStatus: "active",
      isProfileCompleted: true,
      hrApproved: true,
      managerApproved: true,
    },
  },
  {
    email: "newuser@euroslotpars.com",
    mobile: "09121111111",
    password: "password123",
    user: {
      id: "u-newuser",
      fullName: "کاربر جدید (بدون پروفایل)",
      fullNameFa: "کاربر جدید (بدون پروفایل)",
      email: "newuser@euroslotpars.com",
      mobile: "09121111111",
      role: "staff",
      primaryColor: "orange",
      accountStatus: "pending_profile",
      isProfileCompleted: false,
      hrApproved: false,
      managerApproved: false,
    },
  },
  {
    email: "pending@npceram.com",
    mobile: "09122222222",
    password: "password123",
    user: {
      id: "u-pending",
      fullName: "احمد رضایی",
      fullNameFa: "احمد رضایی",
      email: "pending@npceram.com",
      mobile: "09122222222",
      role: "staff",
      primaryColor: "green",
      accountStatus: "pending_approval",
      isProfileCompleted: true,
      hrApproved: true,
      managerApproved: false,
    },
  },
];
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

  constructor(defaultHttp: HttpClient) {
    this.client = new HttpClient("/api/real");
  }

  async login(payload: LoginPayload): Promise<LoginResult> {
    const apiPayload = {
      email: payload.identifier,
      password: payload.password,
    };
    const res = await this.client.post<any>(`/auth/login`, apiPayload, { auth: false });
    return {
      user: {
        id: res.user.id,
        fullName: res.user.full_name || res.user.fullName || res.user.email,
        fullNameFa: res.user.full_name_fa || res.user.fullNameFa,
        email: res.user.email,
        role: res.user.role || "staff",
        accountStatus: res.user.account_status || res.user.accountStatus || "active",
        isProfileCompleted: res.user.is_profile_completed ?? res.user.isProfileCompleted ?? true,
        hrApproved: res.user.hr_approved ?? res.user.hrApproved ?? true,
        managerApproved: res.user.manager_approved ?? res.user.managerApproved ?? true,
      } as User,
      token: res.tokens?.access_token || res.token || "",
    };
  }

  async logout(): Promise<void> {
    await this.client.post(`/auth/logout`);
  }

  async me(): Promise<User> {
    const res = await this.client.get<any>(`/auth/me`);
    return {
      id: res.id,
      fullName: res.full_name || res.fullName || res.email,
      fullNameFa: res.full_name_fa || res.fullNameFa,
      email: res.email,
      role: res.role || "staff",
      accountStatus: res.account_status || res.accountStatus || "active",
      isProfileCompleted: res.is_profile_completed ?? res.isProfileCompleted ?? true,
      hrApproved: res.hr_approved ?? res.hrApproved ?? true,
      managerApproved: res.manager_approved ?? res.managerApproved ?? true,
    } as User;
  }

  async refreshToken(): Promise<{ token: string }> {
    return this.client.post(`/auth/refresh`, undefined, { auth: false });
  }

  async register(payload: RegisterPayload): Promise<LoginResult> {
    const apiPayload = {
      email: payload.email,
      password: payload.password,
      full_name: payload.fullName,
    };
    const res = await this.client.post<any>(`/auth/register`, apiPayload, {
      auth: false,
    });
    const rawUser = res.user || res;
    return {
      user: {
        id: rawUser.id,
        fullName: rawUser.full_name || rawUser.email,
        email: rawUser.email,
        role: rawUser.role || "customer",
        accountStatus: "active",
        isProfileCompleted: true,
      } as User,
      token: res.tokens?.access_token || "",
    };
  }

  async requestAccount(payload: AccountRequestPayload): Promise<AccountRequestResult> {
    return this.client.post<AccountRequestResult>(
      `/auth/account-request`,
      { email: payload.email },
      { auth: false }
    );
  }

  async checkAccountStatus(_emailOrId?: string): Promise<AccountStatusResult> {
    return this.client.get<AccountStatusResult>(`/auth/account-status`);
  }

  async forgotPassword(email: string): Promise<void> {
    await this.client.post(`/auth/forgot-password`, { email }, { auth: false });
  }

  async verifyEmail(token: string): Promise<void> {
    await this.client.post(`/auth/verify-email`, { token }, { auth: false });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.client.post(`/auth/reset-password`, { token, new_password: newPassword }, { auth: false });
  }
}
