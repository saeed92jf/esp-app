// src/lib/server/bug-reports-store.ts
import fs from "fs";
import path from "path";

export interface SmartEnvironment {
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

export interface AttachmentItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface CommentItem {
  id: string;
  userId: string;
  userName: string;
  userRole?: string;
  userAvatar?: string;
  comment: string;
  isInternal: boolean;
  createdAt: string;
}

export interface ActivityLogItem {
  id: string;
  userId: string;
  userName: string;
  action: string;
  previousValue?: string | null;
  newValue?: string | null;
  description: string;
  createdAt: string;
}

export interface BugReportItem {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  moduleId: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  priority: "Low" | "Medium" | "High" | "Urgent";
  status:
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
  reporterId: string;
  reporterName: string;
  reporterEmail?: string;
  reporterRole?: string;
  assigneeId?: string | null;
  assigneeName?: string | null;
  assigneeEmail?: string | null;
  screenshotDataUrl?: string | null;
  attachments: AttachmentItem[];
  environment?: SmartEnvironment;
  inspectedElement?: any;
  comments: CommentItem[];
  activityLogs: ActivityLogItem[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
}

export interface SupportRequestItem {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  moduleId: string;
  priority: string;
  status: string;
  attachments?: AttachmentItem[];
  userId: string;
  userName: string;
  userEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackItem {
  id: string;
  feedbackType: string;
  message: string;
  moduleId: string;
  rating: number;
  attachments?: AttachmentItem[];
  userId: string;
  userName: string;
  userEmail?: string;
  createdAt: string;
}

export interface IdeaItem {
  id: string;
  title: string;
  description: string;
  expectedBenefit?: string;
  moduleId: string;
  status: string;
  attachments?: AttachmentItem[];
  userId: string;
  userName: string;
  userEmail?: string;
  createdAt: string;
}

// ── Persistence Setup ────────────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __espServerBugReports: BugReportItem[] | undefined;
  // eslint-disable-next-line no-var
  var __espServerSupportRequests: SupportRequestItem[] | undefined;
  // eslint-disable-next-line no-var
  var __espServerFeedback: FeedbackItem[] | undefined;
  // eslint-disable-next-line no-var
  var __espServerIdeas: IdeaItem[] | undefined;
}

function getDataDir(): string {
  const envDataDir = process.env.ESP_DATA_DIR;
  if (envDataDir && fs.existsSync(envDataDir)) {
    return envDataDir;
  }
  const persistentProdDir = "C:\\ESP_DATA\\live\\data";
  if (fs.existsSync(persistentProdDir)) {
    return persistentProdDir;
  }
  const backendDataDir = path.resolve(process.cwd(), "..", "ESP-Web-Backend", "app", "data");
  if (fs.existsSync(backendDataDir)) {
    return backendDataDir;
  }
  return path.resolve(process.cwd(), "data");
}

function tryLoadJson<T>(filename: string, fallback: T[]): T[] {
  try {
    const dir = getDataDir();
    const p = path.join(dir, filename);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, "utf-8");
      return JSON.parse(content) as T[];
    }
  } catch {}
  return fallback;
}

function trySaveJson<T>(filename: string, data: T[]): void {
  try {
    const dir = getDataDir();
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const p = path.join(dir, filename);
    fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
  } catch {}
}

if (!globalThis.__espServerBugReports) {
  globalThis.__espServerBugReports = tryLoadJson<BugReportItem>("bug_reports.json", []);
}
if (!globalThis.__espServerSupportRequests) {
  globalThis.__espServerSupportRequests = tryLoadJson<SupportRequestItem>("support_requests.json", []);
}
if (!globalThis.__espServerFeedback) {
  globalThis.__espServerFeedback = tryLoadJson<FeedbackItem>("feedback.json", []);
}
if (!globalThis.__espServerIdeas) {
  globalThis.__espServerIdeas = tryLoadJson<IdeaItem>("ideas.json", []);
}

// ── Ticket Number Generation ──────────────────────────────────────────────────

function generateTicketNumber(prefix: string, list: { ticketNumber: string }[]): string {
  let max = 0;
  for (const item of list) {
    if (item.ticketNumber && item.ticketNumber.startsWith(prefix)) {
      const num = parseInt(item.ticketNumber.replace(prefix, ""), 10);
      if (!isNaN(num) && num > max) max = num;
    }
  }
  const next = max + 1;
  return `${prefix}${String(next).padStart(6, "0")}`;
}

// ── Bug Reports Operations ────────────────────────────────────────────────────

export function getServerBugReports(filters?: {
  status?: string;
  severity?: string;
  priority?: string;
  category?: string;
  moduleId?: string;
  reporterId?: string;
  assigneeId?: string;
  search?: string;
}): BugReportItem[] {
  let list = tryLoadJson<BugReportItem>("bug_reports.json", globalThis.__espServerBugReports || []);
  globalThis.__espServerBugReports = list;

  if (filters?.status && filters.status !== "all") {
    list = list.filter((r) => r.status.toLowerCase() === filters.status!.toLowerCase());
  }
  if (filters?.severity && filters.severity !== "all") {
    list = list.filter((r) => r.severity.toLowerCase() === filters.severity!.toLowerCase());
  }
  if (filters?.priority && filters.priority !== "all") {
    list = list.filter((r) => r.priority.toLowerCase() === filters.priority!.toLowerCase());
  }
  if (filters?.category && filters.category !== "all") {
    list = list.filter((r) => r.category.toLowerCase() === filters.category!.toLowerCase());
  }
  if (filters?.moduleId && filters.moduleId !== "all") {
    list = list.filter((r) => r.moduleId.toLowerCase() === filters.moduleId!.toLowerCase());
  }
  if (filters?.reporterId) {
    list = list.filter((r) => r.reporterId === filters.reporterId);
  }
  if (filters?.assigneeId) {
    list = list.filter((r) => r.assigneeId === filters.assigneeId);
  }
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.ticketNumber.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.reporterName.toLowerCase().includes(q)
    );
  }

  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getServerBugReportById(idOrTicket: string): BugReportItem | null {
  const list = tryLoadJson<BugReportItem>("bug_reports.json", globalThis.__espServerBugReports || []);
  globalThis.__espServerBugReports = list;
  return (
    list.find((r) => r.id === idOrTicket || r.ticketNumber === idOrTicket) || null
  );
}

export function createServerBugReport(
  data: Omit<BugReportItem, "id" | "ticketNumber" | "status" | "priority" | "comments" | "activityLogs" | "createdAt" | "updatedAt">
): BugReportItem {
  const list = tryLoadJson<BugReportItem>("bug_reports.json", globalThis.__espServerBugReports || []);
  const now = new Date().toISOString();
  const id = `bug-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const ticketNumber = generateTicketNumber("ESP-BUG-", list);

  const report: BugReportItem = {
    ...data,
    id,
    ticketNumber,
    priority: "Medium",
    status: "New",
    comments: [],
    activityLogs: [
      {
        id: `act-${Date.now()}`,
        userId: data.reporterId,
        userName: data.reporterName,
        action: "CREATED",
        previousValue: null,
        newValue: "New",
        description: `Ticket ${ticketNumber} created with severity ${data.severity}.`,
        createdAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  list.unshift(report);
  globalThis.__espServerBugReports = list;
  trySaveJson("bug_reports.json", list);
  return report;
}

export function updateServerBugReportStatus(
  idOrTicket: string,
  newStatus: BugReportItem["status"],
  explanation: string | undefined,
  user: { id: string; name: string }
): BugReportItem | null {
  const list = tryLoadJson<BugReportItem>("bug_reports.json", globalThis.__espServerBugReports || []);
  globalThis.__espServerBugReports = list;
  const report = list.find((r) => r.id === idOrTicket || r.ticketNumber === idOrTicket);
  if (!report) return null;

  const oldStatus = report.status;
  const now = new Date().toISOString();
  report.status = newStatus;
  report.updatedAt = now;

  if (newStatus === "Resolved" && !report.resolvedAt) {
    report.resolvedAt = now;
  } else if (newStatus === "Closed" && !report.closedAt) {
    report.closedAt = now;
  }

  report.activityLogs.push({
    id: `act-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    action: "STATUS_CHANGED",
    previousValue: oldStatus,
    newValue: newStatus,
    description: explanation || `Status changed from ${oldStatus} to ${newStatus}.`,
    createdAt: now,
  });

  trySaveJson("bug_reports.json", list);
  return report;
}

export function assignServerBugReport(
  idOrTicket: string,
  assignee: { id?: string | null; name?: string | null; email?: string | null },
  user: { id: string; name: string }
): BugReportItem | null {
  const list = tryLoadJson<BugReportItem>("bug_reports.json", globalThis.__espServerBugReports || []);
  globalThis.__espServerBugReports = list;
  const report = list.find((r) => r.id === idOrTicket || r.ticketNumber === idOrTicket);
  if (!report) return null;

  const oldAssignee = report.assigneeName || "Unassigned";
  const now = new Date().toISOString();

  report.assigneeId = assignee.id || null;
  report.assigneeName = assignee.name || null;
  report.assigneeEmail = assignee.email || null;
  report.updatedAt = now;

  if (assignee.id && report.status === "New") {
    report.status = "Assigned";
  }

  report.activityLogs.push({
    id: `act-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    action: "ASSIGNED",
    previousValue: oldAssignee,
    newValue: assignee.name || "Unassigned",
    description: `Assigned to ${assignee.name || "Unassigned"}.`,
    createdAt: now,
  });

  trySaveJson("bug_reports.json", list);
  return report;
}

export function changeServerBugReportPriority(
  idOrTicket: string,
  priority: BugReportItem["priority"],
  user: { id: string; name: string }
): BugReportItem | null {
  const list = tryLoadJson<BugReportItem>("bug_reports.json", globalThis.__espServerBugReports || []);
  globalThis.__espServerBugReports = list;
  const report = list.find((r) => r.id === idOrTicket || r.ticketNumber === idOrTicket);
  if (!report) return null;

  const oldPriority = report.priority;
  const now = new Date().toISOString();
  report.priority = priority;
  report.updatedAt = now;

  report.activityLogs.push({
    id: `act-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    action: "PRIORITY_CHANGED",
    previousValue: oldPriority,
    newValue: priority,
    description: `Priority changed from ${oldPriority} to ${priority}.`,
    createdAt: now,
  });

  trySaveJson("bug_reports.json", list);
  return report;
}

export function addServerBugReportComment(
  idOrTicket: string,
  data: {
    comment: string;
    isInternal: boolean;
    userId: string;
    userName: string;
    userRole?: string;
    userAvatar?: string;
  }
): CommentItem | null {
  const list = tryLoadJson<BugReportItem>("bug_reports.json", globalThis.__espServerBugReports || []);
  globalThis.__espServerBugReports = list;
  const report = list.find((r) => r.id === idOrTicket || r.ticketNumber === idOrTicket);
  if (!report) return null;

  const now = new Date().toISOString();
  const comment: CommentItem = {
    id: `comm-${Date.now()}`,
    userId: data.userId,
    userName: data.userName,
    userRole: data.userRole,
    userAvatar: data.userAvatar,
    comment: data.comment,
    isInternal: data.isInternal,
    createdAt: now,
  };

  report.comments.push(comment);
  report.updatedAt = now;

  report.activityLogs.push({
    id: `act-${Date.now()}`,
    userId: data.userId,
    userName: data.userName,
    action: "COMMENT_ADDED",
    previousValue: null,
    newValue: data.isInternal ? "Internal" : "Public",
    description: data.isInternal ? "Added an internal note." : "Added a comment.",
    createdAt: now,
  });

  trySaveJson("bug_reports.json", list);
  return comment;
}

export function getServerBugReportsAnalytics() {
  const reports = tryLoadJson<BugReportItem>("bug_reports.json", globalThis.__espServerBugReports || []);
  globalThis.__espServerBugReports = reports;
  const total = reports.length;

  const byStatus: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  const byModule: Record<string, number> = {};
  const byCategory: Record<string, number> = {};

  let newCount = 0;
  let inProgressCount = 0;
  let resolvedCount = 0;
  let criticalCount = 0;

  for (const r of reports) {
    const st = r.status || "New";
    const sev = r.severity || "Medium";
    const mod = r.moduleId || "General";
    const cat = r.category || "Other";

    byStatus[st] = (byStatus[st] || 0) + 1;
    bySeverity[sev] = (bySeverity[sev] || 0) + 1;
    byModule[mod] = (byModule[mod] || 0) + 1;
    byCategory[cat] = (byCategory[cat] || 0) + 1;

    if (st === "New") newCount++;
    else if (["In Progress", "Assigned", "Under Review", "Confirmed", "Testing", "Reopened"].includes(st)) inProgressCount++;
    else if (["Resolved", "Closed"].includes(st)) resolvedCount++;

    if (sev === "Critical") criticalCount++;
  }

  return {
    total,
    new: newCount,
    inProgress: inProgressCount,
    resolved: resolvedCount,
    critical: criticalCount,
    byStatus,
    bySeverity,
    byModule,
    byCategory,
  };
}

// ── Support Requests Operations ───────────────────────────────────────────────

export function getServerSupportRequests(userId?: string): SupportRequestItem[] {
  let list = tryLoadJson<SupportRequestItem>("support_requests.json", globalThis.__espServerSupportRequests || []);
  globalThis.__espServerSupportRequests = list;
  if (userId) {
    list = list.filter((r) => r.userId === userId);
  }
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createServerSupportRequest(
  data: Omit<SupportRequestItem, "id" | "ticketNumber" | "status" | "createdAt" | "updatedAt">
): SupportRequestItem {
  const list = tryLoadJson<SupportRequestItem>("support_requests.json", globalThis.__espServerSupportRequests || []);
  const now = new Date().toISOString();
  const id = `sup-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const ticketNumber = generateTicketNumber("ESP-SUP-", list);

  const req: SupportRequestItem = {
    ...data,
    id,
    ticketNumber,
    status: "Open",
    createdAt: now,
    updatedAt: now,
  };

  list.unshift(req);
  globalThis.__espServerSupportRequests = list;
  trySaveJson("support_requests.json", list);
  return req;
}

export function updateServerSupportRequestStatus(
  id: string,
  status: string
): SupportRequestItem | null {
  const list = tryLoadJson<SupportRequestItem>("support_requests.json", globalThis.__espServerSupportRequests || []);
  const idx = list.findIndex((r) => r.id === id || r.ticketNumber === id);
  if (idx === -1) return null;
  list[idx] = {
    ...list[idx],
    status,
    updatedAt: new Date().toISOString(),
  };
  globalThis.__espServerSupportRequests = list;
  trySaveJson("support_requests.json", list);
  return list[idx];
}

export function deleteServerSupportRequest(id: string): boolean {
  let list = tryLoadJson<SupportRequestItem>("support_requests.json", globalThis.__espServerSupportRequests || []);
  const initialLen = list.length;
  list = list.filter((r) => r.id !== id && r.ticketNumber !== id);
  if (list.length === initialLen) return false;
  globalThis.__espServerSupportRequests = list;
  trySaveJson("support_requests.json", list);
  return true;
}

// ── Feedback Operations ───────────────────────────────────────────────────────

export function getServerFeedback(userId?: string): FeedbackItem[] {
  let list = tryLoadJson<FeedbackItem>("feedback.json", globalThis.__espServerFeedback || []);
  globalThis.__espServerFeedback = list;
  if (userId) {
    list = list.filter((r) => r.userId === userId);
  }
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createServerFeedback(
  data: Omit<FeedbackItem, "id" | "createdAt">
): FeedbackItem {
  const list = tryLoadJson<FeedbackItem>("feedback.json", globalThis.__espServerFeedback || []);
  const now = new Date().toISOString();
  const id = `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const item: FeedbackItem = {
    ...data,
    id,
    createdAt: now,
  };

  list.unshift(item);
  globalThis.__espServerFeedback = list;
  trySaveJson("feedback.json", list);
  return item;
}

export function deleteServerFeedback(id: string): boolean {
  let list = tryLoadJson<FeedbackItem>("feedback.json", globalThis.__espServerFeedback || []);
  const initialLen = list.length;
  list = list.filter((f) => f.id !== id);
  if (list.length === initialLen) return false;
  globalThis.__espServerFeedback = list;
  trySaveJson("feedback.json", list);
  return true;
}

// ── Ideas Operations ──────────────────────────────────────────────────────────

export function getServerIdeas(userId?: string): IdeaItem[] {
  let list = tryLoadJson<IdeaItem>("ideas.json", globalThis.__espServerIdeas || []);
  globalThis.__espServerIdeas = list;
  if (userId) {
    list = list.filter((r) => r.userId === userId);
  }
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createServerIdea(
  data: Omit<IdeaItem, "id" | "status" | "createdAt">
): IdeaItem {
  const list = tryLoadJson<IdeaItem>("ideas.json", globalThis.__espServerIdeas || []);
  const now = new Date().toISOString();
  const id = `idea-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const item: IdeaItem = {
    ...data,
    id,
    status: "Proposed",
    createdAt: now,
  };

  list.unshift(item);
  globalThis.__espServerIdeas = list;
  trySaveJson("ideas.json", list);
  return item;
}

export function updateServerIdeaStatus(
  id: string,
  status: string
): IdeaItem | null {
  const list = tryLoadJson<IdeaItem>("ideas.json", globalThis.__espServerIdeas || []);
  const idx = list.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  list[idx] = {
    ...list[idx],
    status,
  };
  globalThis.__espServerIdeas = list;
  trySaveJson("ideas.json", list);
  return list[idx];
}

export function deleteServerIdea(id: string): boolean {
  let list = tryLoadJson<IdeaItem>("ideas.json", globalThis.__espServerIdeas || []);
  const initialLen = list.length;
  list = list.filter((i) => i.id !== id);
  if (list.length === initialLen) return false;
  globalThis.__espServerIdeas = list;
  trySaveJson("ideas.json", list);
  return true;
}

