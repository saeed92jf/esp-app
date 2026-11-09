// src/modules/projects/types/project-letters.types.ts
// Official Letters & Correspondence Workflow for Euroslot Pars Projects

export type LetterStatus = "pending_approval" | "approved" | "rejected" | "sent";
export type LetterPriority = "normal" | "urgent" | "confidential";
export type LetterType = "official" | "transmittal" | "commercial" | "technical";

export interface LetterAttachment {
  id?: string;
  fileName: string;
  fileSize?: string;
  fileType?: string;
  url: string; // Base64 data URL
  uploadedAt?: string;
  uploadedBy?: string;
}

export interface ManagerReview {
  decision: "approved" | "rejected";
  reviewerId?: string;
  reviewerName: string;
  reviewerRole?: string;
  reviewedAt: string;
  comment: string;
  attachmentFile?: LetterAttachment;
}

export interface ProjectLetter {
  id: string;
  projectId: string;
  projectName: string;
  espNumber: string;
  letterNumber: string;       // e.g. "ESP-1405/ADM-042"
  subject: string;            // e.g. "ارسال نقشه‌های چیدمان جهت تایید کارفرما (DFA)"
  recipient: string;          // e.g. "شرکت پرگاس ایران - سرکار خانم کاویانی"
  senderDepartment: string;   // e.g. "بخش اداری و مکاتبات"
  date: string;               // Jalali or formatted date string
  priority: LetterPriority;   // "normal" | "urgent" | "confidential"
  letterType: LetterType;     // "official" | "transmittal" | "commercial" | "technical"
  description?: string;
  status: LetterStatus;       // "pending_approval" | "approved" | "rejected" | "sent"
  draftBy: {
    userId?: string;
    userName: string;
    userRole?: string;
    createdAt: string;
  };
  draftFile?: LetterAttachment;
  managerReview?: ManagerReview;
  sentInfo?: {
    sentAt?: string;
    trackingNumber?: string;
    notes?: string;
    sentBy?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface CreateLetterPayload {
  projectId: string;
  projectName?: string;
  espNumber?: string;
  letterNumber: string;
  subject: string;
  recipient: string;
  senderDepartment?: string;
  date?: string;
  priority?: LetterPriority;
  letterType?: LetterType;
  description?: string;
  draftFile?: LetterAttachment;
  draftBy?: {
    userId?: string;
    userName: string;
    userRole?: string;
  };
}

export interface ManagerReviewPayload {
  decision: "approved" | "rejected";
  comment: string;
  reviewerId?: string;
  reviewerName: string;
  reviewerRole?: string;
  attachmentFile?: LetterAttachment;
}
