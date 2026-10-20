// src/modules/tasks/types/tasks.types.ts

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed';

export type CompanyName = 'یورو اسلات پارس' | 'نانو پالایش سرام';

export type TaskScope = 'team' | 'personal';

export interface TaskAssignee {
  id: string;
  name: string;
  role: string;
  company?: CompanyName;
  companies?: CompanyName[]; // Overlapping roles in both companies
  avatar?: string;
  isLead?: boolean;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  url?: string;
  uploaderName?: string;
  isDrawing?: boolean;
}

export interface TaskCommentReply {
  id: string;
  commentId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  likes?: number;
  attachments?: TaskAttachment[];
}

export interface TaskComment {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  likes?: number;
  attachments?: TaskAttachment[];
  replies?: TaskCommentReply[];
}

export interface TaskActivity {
  id: string;
  type: 'created' | 'status_change' | 'comment_added' | 'attachment_added' | 'subtask_toggle' | 'collaborator_added' | 'collaborator_removed' | 'progress_updated';
  authorName: string;
  timestamp: string;
  details: string;
}

export interface TaskItem {
  id: string;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  company: CompanyName;
  scope?: TaskScope;
  isPersonal?: boolean;
  relatedProjectId?: string;
  relatedProjectTitle?: string;
  tags?: string[];
  createdBy: 'manager' | 'user';
  creatorName: string;
  assignedToName: string;
  assignedToRole?: string;
  assignedToAvatar?: string;
  assignees: TaskAssignee[];
  progressPercent: number;
  timelineDate?: string;
  milestoneLabel?: string;
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  completionExplanation?: string;
  isManagerDefined: boolean;
  subtasks: SubTask[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
  activities: TaskActivity[];
  estimatedHours?: number;
  loggedHours?: number;
}

export interface TaskFilterState {
  search: string;
  status: string;
  priority: string;
  category: string;
  company: string;
  assignee: string;
  scope?: "all" | "team" | "personal";
  isManagerOnly: boolean;
}

