export interface CommunityAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

export interface CommunityReply {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorNameFa?: string;
  authorNameEn?: string;
  authorEmail?: string;
  authorRole: string;
  authorAvatar?: string | null;
  authorAvatarColor?: string;
  authorAvatarMode?: string;
  authorDepartment?: string;
  attachments?: CommunityAttachment[];
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  titleFa?: string;
  content: string;
  category: 'all' | 'general' | 'engineering' | 'quality' | 'announcements' | string;
  authorId: string;
  authorName: string;
  authorNameFa?: string;
  authorNameEn?: string;
  authorEmail?: string;
  authorRole: string;
  authorAvatar?: string | null;
  authorAvatarColor?: string;
  authorAvatarMode?: string;
  authorDepartment?: string;
  pinned?: boolean;
  likes: number;
  likedBy?: string[];
  attachments?: CommunityAttachment[];
  repliesCount: number;
  replies?: CommunityReply[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePostDto {
  title: string;
  content: string;
  category: string;
  authorId?: string;
  authorEmail?: string;
  authorName?: string;
  authorNameFa?: string;
  authorNameEn?: string;
  authorRole?: string;
  authorAvatar?: string | null;
  attachments?: CommunityAttachment[];
}

export interface CreateReplyDto {
  content: string;
  authorId?: string;
  authorEmail?: string;
  authorName?: string;
  authorNameFa?: string;
  authorNameEn?: string;
  authorRole?: string;
  authorAvatar?: string | null;
  attachments?: CommunityAttachment[];
}
