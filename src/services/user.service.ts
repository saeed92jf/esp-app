// src/services/user.service.ts
import type { HttpClient } from './core/http';
import { ApiError } from './core/errors';
import { AUTH_USER_KEY } from './core/types';
import type { User } from '@/types/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UpdateProfilePayload {
  fullName?: string;
  fullNameFa?: string;
  email?: string;
  mobile?: string;
  avatar?: string;
  avatarColor?: string;
  primaryColor?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IUserService {
  getProfile(): Promise<User>;
  updateProfile(payload: UpdateProfilePayload): Promise<User>;
  changePassword(payload: ChangePasswordPayload): Promise<void>;
  uploadAvatar(file: File): Promise<{ url: string }>;
}

// ─── Fake ─────────────────────────────────────────────────────────────────────

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class FakeUserService implements IUserService {
  async getProfile(): Promise<User> {
    await wait(300);
    if (typeof window === 'undefined') throw new ApiError('UNAUTHORIZED', 'Not authenticated', 401);
    const raw = localStorage.getItem(AUTH_USER_KEY) || localStorage.getItem('esp_auth_user');
    if (!raw) throw new ApiError('UNAUTHORIZED', 'کاربر یافت نشد.', 401);
    return JSON.parse(raw) as User;
  }

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    await wait(500);
    const current = await this.getProfile();
    const updated: User = { ...current, ...payload };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
        localStorage.setItem('esp_auth_user', JSON.stringify(updated));

        localStorage.removeItem('esp_demo_users_override');
      } catch {}
    }
    return updated;
  }

  async changePassword(): Promise<void> {
    await wait(500);
    // در fake mode هیچ چیزی واقعاً عوض نمی‌شود
  }

  async uploadAvatar(file: File): Promise<{ url: string }> {
    await wait(800);
    // در fake mode از URL.createObjectURL استفاده می‌کنیم (فقط در همان session کار می‌کند)
    return { url: URL.createObjectURL(file) };
  }
}

// ─── Real ─────────────────────────────────────────────────────────────────────

export class RealUserService implements IUserService {
  constructor(private http: HttpClient) {}

  private mapUser(raw: any): User {
    const s = (raw.status || "active").toLowerCase();
    return {
      id: raw.id,
      fullName: raw.fullName || raw.full_name || raw.email?.split("@")[0] || "User",
      fullNameFa: raw.fullNameFa || raw.full_name_fa,
      email: raw.email,
      role: (raw.role === "admin" ? "admin" : "staff") as any,
      avatar: raw.avatarUrl || raw.avatar,
      avatarColor: raw.avatarColor,
      primaryColor: raw.primaryColor || "blue",
      accountStatus: s === "active" ? "active" : "pending_approval",
      isProfileCompleted: true,
      hrApproved: s === "active",
      managerApproved: s === "active",
    };
  }

  async getProfile(): Promise<User> {
    const res = await this.http.get<any>('/users/me');
    const raw = res?.data ?? res;
    return this.mapUser(raw);
  }

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const res = await this.http.patch<any>('/users/me', payload);
    const raw = res?.data ?? res;
    return this.mapUser(raw);
  }

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await this.http.post('/auth/change-password', {
      current_password: payload.currentPassword,
      new_password: payload.newPassword,
    });
  }

  async uploadAvatar(file: File): Promise<{ url: string }> {
    const form = new FormData();
    form.append('avatar', file);

    const token = typeof window !== 'undefined'
      ? localStorage.getItem('esp-auth-token')
      : null;

    const res = await fetch(`/api/real/users/me/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });

    if (!res.ok) throw new ApiError('SERVER_ERROR', 'آپلود تصویر ناموفق بود.', res.status);
    const json = await res.json();
    return json?.data ?? json;
  }
}
