// src/components/global-quick-actions/quick-actions-registry.ts
import React from "react";
import { Bug, Headset, MessageSquare, Lightbulb, Target } from "lucide-react";
import type { User } from "@/types/auth";

export interface QuickActionDef {
  id: string;
  titleEn: string;
  titleFa: string;
  descriptionEn?: string;
  descriptionFa?: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accentColor?: string;
  badge?: {
    type?: "dot-count" | "text" | "chevron";
    dotColor?: string;
    textEn?: string;
    textFa?: string;
    count?: number;
  };
  order: number;
  isAuthorized?: (user: User | null) => boolean;
}

const DEFAULT_QUICK_ACTIONS: QuickActionDef[] = [
  {
    id: "bug-report",
    titleEn: "Report a Bug",
    titleFa: "گزارش خطا و اشکال",
    descriptionEn: "Report a technical problem or error.",
    descriptionFa: "ثبت اشکال فنی یا خطا در عملکرد سیستم.",
    icon: Bug,
    accentColor: "#EC2527",
    badge: {
      type: "dot-count",
      dotColor: "#EC2527",
    },
    order: 1,
  },
  {
    id: "bug-hunter",
    titleEn: "Element Hunter",
    titleFa: "نشانه‌گیر خطا (Hunter)",
    descriptionEn: "Point and inspect any element on the page.",
    descriptionFa: "نشانه‌گیری مستقیم المان یا بخش مشکل‌دار در صفحه.",
    icon: Target,
    accentColor: "#EC2527",
    badge: {
      type: "text",
      textEn: "Inspect",
      textFa: "اشاره",
    },
    order: 2,
  },
  {
    id: "support-request",
    titleEn: "Support Request",
    titleFa: "درخواست پشتیبانی",
    descriptionEn: "Request assistance from support team.",
    descriptionFa: "راهنمایی و پشتیبانی فنی اداری.",
    icon: Headset,
    accentColor: "#0284c7",
    badge: {
      type: "text",
      textEn: "24/7",
      textFa: "پشتیبانی",
    },
    order: 3,
  },
  {
    id: "feedback",
    titleEn: "Send Feedback",
    titleFa: "ارسال بازخورد",
    descriptionEn: "Share your experience.",
    descriptionFa: "نظرات و پیشنهادات جهت بهبود.",
    icon: MessageSquare,
    accentColor: "#10b981",
    badge: {
      type: "text",
      textEn: "Rate",
      textFa: "امتیازدهی",
    },
    order: 4,
  },
  {
    id: "suggest-idea",
    titleEn: "Suggest an Idea",
    titleFa: "پیشنهاد ایده",
    descriptionEn: "Propose new features.",
    descriptionFa: "ارائه قابلیت یا بهبود جدید.",
    icon: Lightbulb,
    accentColor: "#f59e0b",
    badge: {
      type: "text",
      textEn: "New",
      textFa: "نوآوری",
    },
    order: 5,
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
