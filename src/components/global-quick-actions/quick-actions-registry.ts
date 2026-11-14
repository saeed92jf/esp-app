// src/components/global-quick-actions/quick-actions-registry.ts
import React from "react";
import { Bug, Headset, MessageSquare, Lightbulb, ShieldAlert, FileText, Lock } from "lucide-react";
import type { User } from "@/types/auth";

export interface QuickActionDef {
  id: string;
  titleEn: string;
  titleFa: string;
  descriptionEn: string;
  descriptionFa: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: string;
  order: number;
  isAuthorized?: (user: User | null) => boolean;
}

const DEFAULT_QUICK_ACTIONS: QuickActionDef[] = [
  {
    id: "bug-report",
    titleEn: "Report a Bug",
    titleFa: "گزارش خطا یا باگ",
    descriptionEn: "Report a technical problem or application error.",
    descriptionFa: "ثبت اشکال فنی، خطا در صفحه یا رفتار نادرست سامانه.",
    icon: Bug,
    accentColor: "#EC2527",
    order: 1,
  },
  {
    id: "support-request",
    titleEn: "Support Request",
    titleFa: "درخواست پشتیبانی",
    descriptionEn: "Request assistance from the support team.",
    descriptionFa: "ارسال درخواست راهنمایی یا دریافت پشتیبانی فنی اداری.",
    icon: Headset,
    accentColor: "#0284c7",
    order: 2,
  },
  {
    id: "feedback",
    titleEn: "Send Feedback",
    titleFa: "ارسال بازخورد",
    descriptionEn: "Share your feedback and experience.",
    descriptionFa: "انتقادات، پیشنهادات و نظرات شما جهت بهبود سامانه.",
    icon: MessageSquare,
    accentColor: "#10b981",
    order: 3,
  },
  {
    id: "suggest-idea",
    titleEn: "Suggest an Idea",
    titleFa: "پیشنهاد ایده جدید",
    descriptionEn: "Suggest a new feature or improvement.",
    descriptionFa: "ارائه قابلیت جدید، ابزار مهندسی یا بهبود فرآیندها.",
    icon: Lightbulb,
    accentColor: "#f59e0b",
    order: 4,
  },
];

let customRegistry: QuickActionDef[] = [...DEFAULT_QUICK_ACTIONS];

export function registerQuickAction(action: QuickActionDef) {
  const existingIdx = customRegistry.findIndex((a) => a.id === action.id);
  if (existingIdx >= 0) {
    customRegistry[existingIdx] = action;
  } else {
    customRegistry.push(action);
  }
  customRegistry.sort((a, b) => a.order - b.order);
}

export function getAuthorizedQuickActions(user: User | null): QuickActionDef[] {
  return customRegistry.filter((action) => {
    if (action.isAuthorized) {
      return action.isAuthorized(user);
    }
    return true;
  });
}

export function getQuickActionById(id: string): QuickActionDef | undefined {
  return customRegistry.find((a) => a.id === id);
}

