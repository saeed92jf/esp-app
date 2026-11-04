import type { CommunityPost, CommunityReply, CreatePostDto, CreateReplyDto, CommunityAttachment } from '../types/community';

const API_BASE = '/api/real/community';

export class CommunityService {
  async getPosts(category?: string, search?: string): Promise<CommunityPost[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    if (search) params.set('search', search);

    const url = `${API_BASE}/posts${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch posts: ${res.statusText}`);
    }
    return res.json();
  }

  async getPostDetail(postId: string): Promise<CommunityPost> {
    const res = await fetch(`${API_BASE}/posts/${postId}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch post detail: ${res.statusText}`);
    }
    return res.json();
  }

  async createPost(dto: CreatePostDto): Promise<CommunityPost> {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create post');
    }
    return res.json();
  }

  async addReply(postId: string, dto: CreateReplyDto): Promise<CommunityReply> {
    const res = await fetch(`${API_BASE}/posts/${postId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to add reply');
    }
    return res.json();
  }

  async toggleLike(postId: string, userId?: string): Promise<{ postId: string; likes: number; isLiked: boolean }> {
    const url = `${API_BASE}/posts/${postId}/like${userId ? `?user_id=${userId}` : ''}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      throw new Error('Failed to toggle like');
    }
    return res.json();
  }

  async uploadAttachment(file: File): Promise<CommunityAttachment> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to upload attachment');
    }
    return res.json();
  }
}

export const communityService = new CommunityService();
