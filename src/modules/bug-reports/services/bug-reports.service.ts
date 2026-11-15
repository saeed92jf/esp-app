// src/modules/bug-reports/services/bug-reports.service.ts
import type {
  BugReport,
  BugReportsAnalytics,
  BugStatus,
  BugPriority,
  SupportRequest,
  FeedbackSubmission,
  IdeaSubmission,
} from "../types";

let cacheReports: BugReport[] | null = null;
let cacheAnalytics: BugReportsAnalytics | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60_000; // 1 minute

function notifyBugReportsUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("esp:bug-reports-updated"));
  }
}

export const bugReportsService = {
  getCachedReports(): BugReport[] | null {
    return cacheReports;
  },

  getCachedAnalytics(): BugReportsAnalytics | null {
    return cacheAnalytics;
  },

  clearCache() {
    cacheReports = null;
    cacheAnalytics = null;
    cacheTimestamp = 0;
  },

  invalidateCache() {
    this.clearCache();
  },

  async getBugReports(
    filters?: {
      status?: string;
      severity?: string;
      priority?: string;
      category?: string;
      moduleId?: string;
      reporterId?: string;
      assigneeId?: string;
      search?: string;
    },
    isSilent = false
  ): Promise<BugReport[]> {
    if (!isSilent && cacheReports && Date.now() - cacheTimestamp < CACHE_TTL_MS && !filters?.search) {
      // Invalidate if filters are complex, or return filtered cached
    }

    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.severity) params.set("severity", filters.severity);
    if (filters?.priority) params.set("priority", filters.priority);
    if (filters?.category) params.set("category", filters.category);
    if (filters?.moduleId) params.set("moduleId", filters.moduleId);
    if (filters?.reporterId) params.set("reporterId", filters.reporterId);
    if (filters?.assigneeId) params.set("assigneeId", filters.assigneeId);
    if (filters?.search) params.set("search", filters.search);

    const res = await fetch(`/api/bug-reports?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch bug reports");
    const data: BugReport[] = await res.json();

    if (!filters?.search && !filters?.status && !filters?.severity) {
      cacheReports = data;
      cacheTimestamp = Date.now();
    }
    return data;
  },

  async getMyBugReports(userId: string): Promise<BugReport[]> {
    const res = await fetch(`/api/bug-reports/my?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error("Failed to fetch my bug reports");
    return res.json();
  },

  async getBugReportById(idOrTicket: string): Promise<BugReport> {
    const res = await fetch(`/api/bug-reports/${encodeURIComponent(idOrTicket)}`);
    if (!res.ok) throw new Error("Failed to fetch bug report details");
    return res.json();
  },

  async getAnalytics(): Promise<BugReportsAnalytics> {
    const res = await fetch("/api/bug-reports/analytics");
    if (!res.ok) throw new Error("Failed to fetch bug reports analytics");
    const data = await res.json();
    cacheAnalytics = data;
    return data;
  },

  async createBugReport(payload: Partial<BugReport>): Promise<BugReport> {
    const res = await fetch("/api/bug-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to create bug report");
    }
    const created = await res.json();
    bugReportsService.clearCache();
    notifyBugReportsUpdated();
    return created;
  },

  async updateStatus(
    reportId: string,
    status: BugStatus,
    explanation: string | undefined,
    user: { id: string; name: string }
  ): Promise<BugReport> {
    const res = await fetch(`/api/bug-reports/${encodeURIComponent(reportId)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, explanation, userId: user.id, userName: user.name }),
    });
    if (!res.ok) throw new Error("Failed to update status");
    const updated = await res.json();
    bugReportsService.clearCache();
    notifyBugReportsUpdated();
    return updated;
  },

  async assignReport(
    reportId: string,
    assignee: { id?: string | null; name?: string | null; email?: string | null },
    user: { id: string; name: string }
  ): Promise<BugReport> {
    const res = await fetch(`/api/bug-reports/${encodeURIComponent(reportId)}/assign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assigneeId: assignee.id,
        assigneeName: assignee.name,
        assigneeEmail: assignee.email,
        userId: user.id,
        userName: user.name,
      }),
    });
    if (!res.ok) throw new Error("Failed to assign bug report");
    const updated = await res.json();
    bugReportsService.clearCache();
    notifyBugReportsUpdated();
    return updated;
  },

  async changePriority(
    reportId: string,
    priority: BugPriority,
    user: { id: string; name: string }
  ): Promise<BugReport> {
    const res = await fetch(`/api/bug-reports/${encodeURIComponent(reportId)}/priority`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority, userId: user.id, userName: user.name }),
    });
    if (!res.ok) throw new Error("Failed to change priority");
    const updated = await res.json();
    bugReportsService.clearCache();
    notifyBugReportsUpdated();
    return updated;
  },

  async addComment(
    reportId: string,
    comment: string,
    isInternal: boolean,
    user: { id: string; name: string; role?: string; avatar?: string }
  ) {
    const res = await fetch(`/api/bug-reports/${encodeURIComponent(reportId)}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comment,
        isInternal,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        userAvatar: user.avatar,
      }),
    });
    if (!res.ok) throw new Error("Failed to post comment");
    notifyBugReportsUpdated();
    return res.json();
  },

  async uploadAttachment(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/bug-reports/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to upload attachment");
    }
    return res.json();
  },

  // ── Support Request ──────────────────────────────────────────────────────────
  async getSupportRequests(userId?: string): Promise<SupportRequest[]> {
    const params = new URLSearchParams();
    if (userId) params.set("userId", userId);
    const res = await fetch(`/api/support-requests?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch support requests");
    return res.json();
  },

  async createSupportRequest(payload: Partial<SupportRequest>): Promise<SupportRequest> {
    const res = await fetch("/api/support-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to submit support request");
    }
    notifyBugReportsUpdated();
    return res.json();
  },

  async updateSupportRequestStatus(
    id: string,
    status: string,
    adminResponse?: string,
    adminName?: string
  ): Promise<SupportRequest> {
    const res = await fetch(`/api/support-requests/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminResponse, adminName }),
    });
    if (!res.ok) throw new Error("Failed to update support request status");
    notifyBugReportsUpdated();
    return res.json();
  },

  async deleteSupportRequest(id: string): Promise<boolean> {
    const res = await fetch(`/api/support-requests/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    notifyBugReportsUpdated();
    return res.ok;
  },

  // ── Feedback ─────────────────────────────────────────────────────────────────
  async getFeedback(userId?: string): Promise<FeedbackSubmission[]> {
    const params = new URLSearchParams();
    if (userId) params.set("userId", userId);
    const res = await fetch(`/api/feedback?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch feedback");
    return res.json();
  },

  async createFeedback(payload: Partial<FeedbackSubmission>): Promise<FeedbackSubmission> {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to submit feedback");
    }
    notifyBugReportsUpdated();
    return res.json();
  },

  async deleteFeedback(id: string): Promise<boolean> {
    const res = await fetch(`/api/feedback/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    notifyBugReportsUpdated();
    return res.ok;
  },

  // ── Ideas ────────────────────────────────────────────────────────────────────
  async getIdeas(userId?: string): Promise<IdeaSubmission[]> {
    const params = new URLSearchParams();
    if (userId) params.set("userId", userId);
    const res = await fetch(`/api/ideas?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch ideas");
    return res.json();
  },

  async createIdea(payload: Partial<IdeaSubmission>): Promise<IdeaSubmission> {
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to submit idea");
    }
    notifyBugReportsUpdated();
    return res.json();
  },

  async updateIdeaStatus(id: string, status: string): Promise<IdeaSubmission> {
    const res = await fetch(`/api/ideas/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update idea status");
    notifyBugReportsUpdated();
    return res.json();
  },

  async deleteIdea(id: string): Promise<boolean> {
    const res = await fetch(`/api/ideas/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    notifyBugReportsUpdated();
    return res.ok;
  },

  // ── Bug Report Deletion ──────────────────────────────────────────────────────
  async deleteBugReport(idOrTicket: string): Promise<boolean> {
    const res = await fetch(`/api/bug-reports/${encodeURIComponent(idOrTicket)}`, {
      method: "DELETE",
    });
    bugReportsService.clearCache();
    notifyBugReportsUpdated();
    return res.ok;
  },

  async deleteAllBugReports(): Promise<boolean> {
    const res = await fetch("/api/bug-reports", {
      method: "DELETE",
    });
    bugReportsService.clearCache();
    notifyBugReportsUpdated();
    return res.ok;
  },

  // ── Bulk Deletion All Categories ─────────────────────────────────────────────
  async deleteAllSupportRequests(): Promise<boolean> {
    const res = await fetch("/api/support-requests", {
      method: "DELETE",
    });
    notifyBugReportsUpdated();
    return res.ok;
  },

  async deleteAllFeedback(): Promise<boolean> {
    const res = await fetch("/api/feedback", {
      method: "DELETE",
    });
    notifyBugReportsUpdated();
    return res.ok;
  },

  async deleteAllIdeas(): Promise<boolean> {
    const res = await fetch("/api/ideas", {
      method: "DELETE",
    });
    notifyBugReportsUpdated();
    return res.ok;
  },

  async deleteAllIssues(): Promise<boolean> {
    const res = await fetch("/api/bug-reports?scope=everything", {
      method: "DELETE",
    });
    bugReportsService.clearCache();
    notifyBugReportsUpdated();
    return res.ok;
  },
};

