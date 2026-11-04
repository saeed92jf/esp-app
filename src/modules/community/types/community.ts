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
  authorRole: string;
  authorAvatar?: string;
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
  authorRole: string;
  authorAvatar?: string;
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
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  attachments?: CommunityAttachment[];
}

export interface CreateReplyDto {
  content: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  attachments?: CommunityAttachment[];
}
