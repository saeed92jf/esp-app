// src/services/user.service.ts
import type { HttpClient } from './core/http';
import { ApiError } from './core/errors';
import { AUTH_USER_KEY } from './core/types';
import type { User } from '@/types/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UpdateProfilePayload {
  fullName?: string;
  email?: string;
  mobile?: string;
  avatar?: string;
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
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) throw new ApiError('UNAUTHORIZED', 'کاربر یافت نشد.', 401);
    return JSON.parse(raw) as User;
  }

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    await wait(500);
    const current = await this.getProfile();
    const updated: User = { ...current, ...payload };
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
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

  async getProfile(): Promise<User> {
    return this.http.get<User>('/users/me');
  }

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    return this.http.patch<User>('/users/me', payload);
  }

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await this.http.post('/users/me/change-password', payload);
  }

  async uploadAvatar(file: File): Promise<{ url: string }> {
    // آپلود فایل از الگوی JSON body پیروی نمی‌کند — fetch مستقیم با FormData
    const form = new FormData();
    form.append('avatar', file);

    const token = typeof window !== 'undefined'
      ? localStorage.getItem('esp-auth-token')
      : null;

    const res = await fetch(`${(this.http as unknown as { baseUrl: string }).baseUrl}/users/me/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });

    if (!res.ok) throw new ApiError('SERVER_ERROR', 'آپلود تصویر ناموفق بود.', res.status);
    return res.json();
  }
}
