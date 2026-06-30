// src/services/auth.service.ts
import { ApiError } from './core/errors';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from './core/types';
import type { HttpClient } from './core/http';
import type { User, UserRole } from '@/types/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  identifier: string;   // email یا موبایل
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
}

// ─── Fake ─────────────────────────────────────────────────────────────────────

const FAKE_DELAY = 600;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const DEMO_USERS = [
  { email: 'admin@demo.com',    mobile: '09120000001', password: 'admin1234',
    user: { id:'u-admin', fullName:'Morteza Shafiee', email:'admin@demo.com', mobile:'09120000001', avatar:'', role:'admin' as UserRole } },
  { email: 'engineer@demo.com', mobile: '09120000002', password: 'engineer1234',
    user: { id:'u-engineer', fullName:'Saeed Jalili Fard', email:'engineer@demo.com', mobile:'09120000002', avatar:'', role:'engineer' as UserRole } },
  { email: 'staff@demo.com',    mobile: '09120000003', password: 'staff1234',
    user: { id:'u-staff', fullName:'Morteza Saeedi', email:'staff@demo.com', mobile:'09120000003', avatar:'', role:'staff' as UserRole } },
  { email: 'customer@demo.com', mobile: '09120000004', password: 'customer1234',
    user: { id:'u-customer', fullName:'Allaye Mahestan', email:'customer@demo.com', mobile:'09120000004', avatar:'', role:'customer' as UserRole } },
];
export { DEMO_USERS };

export class FakeAuthService implements IAuthService {
  async login({ identifier, password }: LoginPayload): Promise<LoginResult> {
    await wait(FAKE_DELAY);
    const id = identifier.trim().toLowerCase();
    const match = DEMO_USERS.find(
      (c) => (c.email === id || c.mobile === id) && c.password === password,
    );
    if (!match) throw new ApiError('INVALID_CREDENTIALS', 'ایمیل/موبایل یا رمز عبور اشتباه است.', 401);
    const token = `fake-token-${match.user.id}-${Date.now()}`;
    return { user: match.user, token };
  }

  async logout(): Promise<void> {
    await wait(200);
  }

  async me(): Promise<User> {
    await wait(300);
    if (typeof window === 'undefined') throw new ApiError('UNAUTHORIZED', 'Not authenticated', 401);
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) throw new ApiError('UNAUTHORIZED', 'کاربر یافت نشد.', 401);
    return JSON.parse(raw) as User;
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
      role: payload.role ?? 'customer',
    };
    return { user: newUser, token: `fake-token-${newUser.id}` };
  }
}

// ─── Real ─────────────────────────────────────────────────────────────────────

export class RealAuthService implements IAuthService {
  constructor(private http: HttpClient) {}

  async login(payload: LoginPayload): Promise<LoginResult> {
    return this.http.post<LoginResult>('/auth/login', payload, { auth: false });
  }

  async logout(): Promise<void> {
    await this.http.post('/auth/logout');
  }

  async me(): Promise<User> {
    return this.http.get<User>('/auth/me');
  }

  async refreshToken(): Promise<{ token: string }> {
    return this.http.post('/auth/refresh', undefined, { auth: false });
  }

  async register(payload: RegisterPayload): Promise<LoginResult> {
    return this.http.post<LoginResult>('/auth/register', payload, { auth: false });
  }
}
