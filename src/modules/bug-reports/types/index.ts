// src/modules/bug-reports/types/index.ts

export type BugSeverity = "Low" | "Medium" | "High" | "Critical";
export type BugPriority = "Low" | "Medium" | "High" | "Urgent";
export type BugStatus =
  | "New"
  | "Under Review"
  | "Confirmed"
  | "Assigned"
  | "In Progress"
  | "Testing"
  | "Resolved"
  | "Closed"
  | "Rejected"
  | "Reopened";

export type BugCategory =
  | "UI / UX"
  | "Functionality"
  | "Performance"
  | "Authentication"
  | "Data / Database"
  | "Integration"
  | "Security"
  | "Other";

export interface InspectedElementData {
  tagName: string;
  id?: string;
  className?: string;
  selector: string;
  xpath?: string;
  textSnippet?: string;
  role?: string;
  ariaLabel?: string;
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
    bottom: number;
    right: number;
  };
  viewport: {
    width: number;
    height: number;
    scrollX: number;
    scrollY: number;
  };
  htmlSnippet?: string;
}

export interface SmartEnvironmentData {
  pageUrl?: string;
  moduleId?: string;
  browserName?: string;
  browserVersion?: string;
  os?: string;
  deviceType?: string;
  screenResolution?: string;
  viewportDimensions?: string;
  language?: string;
  timezone?: string;
  appVersion?: string;
  clientTimestamp?: string;
}

export interface BugAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface BugComment {
  id: string;
  userId: string;
  userName: string;
  userRole?: string;
  userAvatar?: string;
  comment: string;
  isInternal: boolean;
  createdAt: string;
}

export interface BugActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  previousValue?: string | null;
  newValue?: string | null;
  description: string;
  createdAt: string;
}

export interface BugReport {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: BugCategory | string;
  moduleId: string;
  severity: BugSeverity;
  priority: BugPriority;
  status: BugStatus;
  reporterId: string;
  reporterName: string;
  reporterEmail?: string;
  reporterRole?: string;
  assigneeId?: string | null;
  assigneeName?: string | null;
  assigneeEmail?: string | null;
  screenshotDataUrl?: string | null;
  attachments: BugAttachment[];
  environment?: SmartEnvironmentData;
  inspectedElement?: InspectedElementData;
  comments: BugComment[];
  activityLogs: BugActivityLog[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
}

export interface BugReportsAnalytics {
  total: number;
  new: number;
  inProgress: number;
  resolved: number;
  critical: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  byModule: Record<string, number>;
  byCategory: Record<string, number>;
}

export interface SupportRequest {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  moduleId: string;
  priority: string;
  status: string;
  attachments?: BugAttachment[];
  userId: string;
  userName: string;
  userEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackSubmission {
  id: string;
  feedbackType: string;
  message: string;
  moduleId: string;
  rating: number;
  attachments?: BugAttachment[];
  userId: string;
  userName: string;
  userEmail?: string;
  createdAt: string;
}

export interface IdeaSubmission {
  id: string;
  title: string;
  description: string;
  expectedBenefit?: string;
  moduleId: string;
  status: string;
  attachments?: BugAttachment[];
  userId: string;
  userName: string;
  userEmail?: string;
  createdAt: string;
}

