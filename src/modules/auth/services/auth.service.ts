import { ApiError } from "@/services/core/errors";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/services/core/types";
import { HttpClient } from "@/services/core/http";
import type { User, UserRole } from "@/types/auth";

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

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IAuthService {
  login(payload: LoginPayload): Promise<LoginResult>;
  logout(): Promise<void>;
  me(): Promise<User>;
  refreshToken(): Promise<{ token: string }>;
  register(payload: RegisterPayload): Promise<LoginResult>;
  forgotPassword(email: string): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
}

// ─── Fake ─────────────────────────────────────────────────────────────────────

const FAKE_DELAY = 600;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const DEMO_USERS = [
  {
    email: "admin@demo.com",
    mobile: "09120000001",
    password: "admin1234",
    user: {
      id: "u-admin",
      fullName: "Morteza Shafiee",
      fullNameFa: "مرتضی شفیعی",
      email: "admin@demo.com",
      mobile: "09120000001",
      avatar: "",
      role: "admin" as UserRole,
    },
  },
  {
    email: "engineer@demo.com",
    mobile: "09120000002",
    password: "engineer1234",
    user: {
      id: "u-engineer",
      fullName: "Saeed Jalili Fard",
      fullNameFa: "سعید جلیلی‌فرد",
      email: "engineer@demo.com",
      mobile: "09120000002",
      avatar: "",
      role: "admin" as UserRole,
    },
  },
  {
    email: "staff@demo.com",
    mobile: "09120000003",
    password: "staff1234",
    user: {
      id: "u-staff",
      fullName: "Morteza Saeedi",
      fullNameFa: "مرتضی سعیدی",
      email: "staff@demo.com",
      mobile: "09120000003",
      avatar: "",
      role: "staff" as UserRole,
    },
  },
  {
    email: "customer@demo.com",
    mobile: "09120000004",
    password: "customer1234",
    user: {
      id: "u-customer",
      fullName: "Allaye Mahestan",
      fullNameFa: "آلیاژ مهستان",
      email: "customer@demo.com",
      mobile: "09120000004",
      avatar: "",
      role: "customer" as UserRole,
    },
  },
];
export { DEMO_USERS };

export class FakeAuthService implements IAuthService {
  async login({ identifier, password }: LoginPayload): Promise<LoginResult> {
    await wait(FAKE_DELAY);
    const id = identifier.trim().toLowerCase();
    const match = DEMO_USERS.find(
      (c) => (c.email === id || c.mobile === id) && c.password === password,
    );
    if (!match)
      throw new ApiError(
        "INVALID_CREDENTIALS",
        "ایمیل/موبایل یا رمز عبور اشتباه است.",
        401,
      );
    const token = `fake-token-${match.user.id}-${Date.now()}`;
    return { user: match.user, token };
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
    const demoMatch = DEMO_USERS.find(d => d.user.id === parsed.id);
    if (demoMatch) {
      parsed = { ...parsed, ...demoMatch.user };
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
    };
    return { user: newUser, token: `fake-token-${newUser.id}` };
  }

  async forgotPassword(_email: string): Promise<void> {
    await wait(FAKE_DELAY);
    return;
  }

  async verifyEmail(_token: string): Promise<void> {
    await wait(FAKE_DELAY);
    return;
  }

  async resetPassword(_token: string, _newPassword: string): Promise<void> {
    await wait(FAKE_DELAY);
    return;
  }
}

// ─── Real ─────────────────────────────────────────────────────────────────────

export class RealAuthService implements IAuthService {
  private client: HttpClient;

  constructor(defaultHttp: HttpClient) {
    this.client = new HttpClient("/api/real");
  }

  async login(payload: LoginPayload): Promise<LoginResult> {
    // API returns { user, tokens: { access_token, refresh_token } }
    const apiPayload = {
      email: payload.identifier,
      password: payload.password
    };
    const res = await this.client.post<any>(`/auth/login`, apiPayload, { auth: false });
    return {
      user: {
        id: res.user.id,
        fullName: res.user.full_name || res.user.email,
        email: res.user.email,
        role: res.user.role || "customer",
      } as User,
      token: res.tokens.access_token,
    };
  }

  async logout(): Promise<void> {
    await this.client.post(`/auth/logout`);
  }

  async me(): Promise<User> {
    const res = await this.client.get<any>(`/auth/me`);
    return {
      id: res.id,
      fullName: res.full_name || res.email,
      email: res.email,
      role: res.role || "customer",
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
    // Assuming API might not return token on register, or it does if it logs in automatically?
    // According to standard behavior, we'll map it similar to login if it does, else we just return the user.
    const rawUser = res.user || res;
    return {
      user: {
        id: rawUser.id,
        fullName: rawUser.full_name || rawUser.email,
        email: rawUser.email,
        role: rawUser.role || "customer",
      } as User,
      token: res.tokens?.access_token || "",
    };
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
