// src/services/user.service.ts
import type { HttpClient } from './core/http';
import { ApiError } from './core/errors';
import { AUTH_USER_KEY } from './core/types';
import type { User } from '@/types/auth';
import { normalizeUserFromApi } from '@/modules/auth/utils/normalize-user';

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

// ─── Real ─────────────────────────────────────────────────────────────────────

export class RealUserService implements IUserService {
  constructor(private http: HttpClient) {}

  private mapUser(raw: any): User {
    return normalizeUserFromApi(raw);
  }

  async getProfile(): Promise<User> {
    const res = await this.http.get<any>('/users/me');
    const raw = res?.data ?? res;
    return this.mapUser(raw);
  }

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const body: any = {
      ...payload,
      personal: {
        ...(payload.fullName ? { fullName: payload.fullName } : {}),
        ...(payload.fullNameFa ? { fullNameFa: payload.fullNameFa } : {}),
        ...(payload.email ? { email: payload.email } : {}),
        ...(payload.mobile ? { phone: payload.mobile } : {}),
        ...(payload.avatar !== undefined ? { avatar: payload.avatar, avatarUrl: payload.avatar } : {}),
        ...(payload.avatarColor ? { avatarColor: payload.avatarColor } : {}),
        ...(payload.primaryColor ? { primaryColor: payload.primaryColor } : {}),
      },
    };

    if (payload.primaryColor && typeof window !== 'undefined') {
      try {
        localStorage.setItem('esp-global-primary-color', payload.primaryColor);
        await this.http.patch<any>('/users/me/preferences', { primaryColor: payload.primaryColor }).catch(() => {});
      } catch {}
    }

    const res = await this.http.patch<any>('/users/me', body);
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
