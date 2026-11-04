import type { CommunityPost, CommunityReply, CreatePostDto, CreateReplyDto, CommunityAttachment } from '../types/community';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '@/services/core/types';

const API_BASE = '/api/real/community';

function getAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...extra,
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const userRaw = localStorage.getItem(AUTH_USER_KEY) || localStorage.getItem('esp_auth_user');
    if (userRaw) {
      try {
        const u = JSON.parse(userRaw);
        if (u.id) headers['x-user-id'] = u.id;
        if (u.email) headers['x-user-email'] = u.email;
      } catch {
        // ignore parse errors
      }
    }
  }

  return headers;
}

export class CommunityService {
  async getPosts(category?: string, search?: string): Promise<CommunityPost[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    if (search) params.set('search', search);

    const url = `${API_BASE}/posts${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Failed to fetch posts: ${res.statusText}`);
    }
    return res.json();
  }

  async getPostDetail(postId: string): Promise<CommunityPost> {
    const res = await fetch(`${API_BASE}/posts/${postId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Failed to fetch post detail: ${res.statusText}`);
    }
    return res.json();
  }

  async createPost(dto: CreatePostDto): Promise<CommunityPost> {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'خطا در ایجاد گفتگو');
    }
    return res.json();
  }

  async deletePost(postId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/posts/${postId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'خطا در حذف گفتگو');
    }
  }

  async addReply(postId: string, dto: CreateReplyDto): Promise<CommunityReply> {
    const res = await fetch(`${API_BASE}/posts/${postId}/replies`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'خطا در ثبت پاسخ');
    }
    return res.json();
  }

  async deleteReply(postId: string, replyId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/posts/${postId}/replies/${replyId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'خطا در حذف پاسخ');
    }
  }

  async toggleLike(postId: string, userId?: string): Promise<{ postId: string; likes: number; isLiked: boolean }> {
    const url = `${API_BASE}/posts/${postId}/like${userId ? `?user_id=${userId}` : ''}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'خطا در ثبت واکنش');
    }
    return res.json();
  }

  async uploadAttachment(file: File): Promise<CommunityAttachment> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = getAuthHeaders();
    delete headers['Content-Type'];

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'خطا در آپلود فایل');
    }
    return res.json();
  }
}

export const communityService = new CommunityService();
