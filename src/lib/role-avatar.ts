// src/lib/role-avatar.ts
// ─────────────────────────────────────────────────────────────────────────────
// Distinctive, vibrant role rings and glow metadata for user avatars across ESP platform.
// Each role has its signature gradient ring and lighting effect.
// ─────────────────────────────────────────────────────────────────────────────

import type { UserRole } from "@/types/auth";

export interface RoleRingConfig {
  ringClass: string;
  bgGradient: string;
  glowShadow: string;
  glowHover: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  labelEn: string;
  labelFa: string;
}

export const ROLE_RING_CONFIGS: Record<string, RoleRingConfig> = {
  superadmin: {
    ringClass: "p-[2px] bg-[conic-gradient(from_0deg,#ef4444,#f97316,#eab308,#22c55e,#06b6d4,#3b82f6,#a855f7,#ec4899,#ef4444)] shadow-[0_0_12px_rgba(239,68,68,0.4)]",
    bgGradient: "bg-[conic-gradient(from_0deg,#ef4444,#f97316,#eab308,#22c55e,#06b6d4,#3b82f6,#a855f7,#ec4899,#ef4444)]",
    glowShadow: "shadow-[0_0_14px_rgba(239,68,68,0.45)]",
    glowHover: "from-red-500 via-amber-500 to-blue-500",
    badgeBg: "bg-rose-500/15",
    badgeText: "text-rose-700 dark:text-rose-300",
    badgeBorder: "border-rose-500/35",
    labelEn: "Super Administrator",
    labelFa: "سوپر ادمین سیستم",
  },
  admin: {
    ringClass: "p-[2px] bg-[linear-gradient(135deg,#b45309,#f59e0b,#fef08a,#fbbf24,#d97706,#fbbf24)] shadow-[0_0_10px_rgba(245,158,11,0.45)]",
    bgGradient: "bg-[linear-gradient(135deg,#b45309,#f59e0b,#fef08a,#fbbf24,#d97706,#fbbf24)]",
    glowShadow: "shadow-[0_0_12px_rgba(245,158,11,0.45)]",
    glowHover: "from-amber-600 via-yellow-400 to-amber-500",
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-800 dark:text-amber-300",
    badgeBorder: "border-amber-500/35",
    labelEn: "System Administrator",
    labelFa: "مدیر ارشد سامانه (ادمین)",
  },
  dept_admin: {
    ringClass: "p-[2px] bg-[linear-gradient(135deg,#3730a3,#6366f1,#c7d2fe,#818cf8,#4338ca,#818cf8)] shadow-[0_0_10px_rgba(99,102,241,0.45)]",
    bgGradient: "bg-[linear-gradient(135deg,#3730a3,#6366f1,#c7d2fe,#818cf8,#4338ca,#818cf8)]",
    glowShadow: "shadow-[0_0_12px_rgba(99,102,241,0.4)]",
    glowHover: "from-indigo-600 via-purple-500 to-indigo-400",
    badgeBg: "bg-indigo-500/10",
    badgeText: "text-indigo-700 dark:text-indigo-300",
    badgeBorder: "border-indigo-500/25",
    labelEn: "Department Admin",
    labelFa: "ادمین دپارتمان",
  },
  office_admin: {
    ringClass: "p-[2px] bg-[linear-gradient(135deg,#0f766e,#14b8a6,#99f6e4,#2dd4bf,#0d9488,#2dd4bf)] shadow-[0_0_10px_rgba(20,184,166,0.45)]",
    bgGradient: "bg-[linear-gradient(135deg,#0f766e,#14b8a6,#99f6e4,#2dd4bf,#0d9488,#2dd4bf)]",
    glowShadow: "shadow-[0_0_12px_rgba(20,184,166,0.4)]",
    glowHover: "from-teal-600 via-emerald-400 to-cyan-500",
    badgeBg: "bg-teal-500/10",
    badgeText: "text-teal-700 dark:text-teal-300",
    badgeBorder: "border-teal-500/25",
    labelEn: "Office Admin",
    labelFa: "ادمین اداری",
  },
  manager: {
    ringClass: "p-[2px] bg-[linear-gradient(135deg,#6b21a8,#a855f7,#f3e8ff,#c084fc,#7e22ce,#c084fc)] shadow-[0_0_10px_rgba(168,85,247,0.4)]",
    bgGradient: "bg-[linear-gradient(135deg,#6b21a8,#a855f7,#f3e8ff,#c084fc,#7e22ce,#c084fc)]",
    glowShadow: "shadow-[0_0_12px_rgba(168,85,247,0.35)]",
    glowHover: "from-purple-600 via-fuchsia-400 to-purple-500",
    badgeBg: "bg-purple-500/10",
    badgeText: "text-purple-700 dark:text-purple-300",
    badgeBorder: "border-purple-500/25",
    labelEn: "Department Manager",
    labelFa: "مدیر واحد / سرپرست",
  },
  engineer: {
    ringClass: "p-[2px] bg-[linear-gradient(135deg,#0369a1,#0ea5e9,#bae6fd,#38bdf8,#0284c7,#38bdf8)] shadow-[0_0_10px_rgba(14,165,233,0.4)]",
    bgGradient: "bg-[linear-gradient(135deg,#0369a1,#0ea5e9,#bae6fd,#38bdf8,#0284c7,#38bdf8)]",
    glowShadow: "shadow-[0_0_12px_rgba(14,165,233,0.35)]",
    glowHover: "from-sky-600 via-cyan-400 to-blue-500",
    badgeBg: "bg-sky-500/10",
    badgeText: "text-sky-700 dark:text-sky-300",
    badgeBorder: "border-sky-500/25",
    labelEn: "Technical Engineer",
    labelFa: "مهندس و کارشناس فنی",
  },
  staff: {
    ringClass: "p-[2px] bg-[linear-gradient(135deg,#047857,#10b981,#a7f3d0,#34d399,#059669,#34d399)] shadow-[0_0_10px_rgba(16,185,129,0.4)]",
    bgGradient: "bg-[linear-gradient(135deg,#047857,#10b981,#a7f3d0,#34d399,#059669,#34d399)]",
    glowShadow: "shadow-[0_0_12px_rgba(16,185,129,0.35)]",
    glowHover: "from-emerald-600 via-green-400 to-teal-500",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    badgeBorder: "border-emerald-500/25",
    labelEn: "Corporate Staff",
    labelFa: "پرسنل سازمانی",
  },
  customer: {
    ringClass: "p-[2px] bg-[linear-gradient(135deg,#c2410c,#f97316,#ffedd5,#fb923c,#ea580c,#fb923c)] shadow-[0_0_10px_rgba(249,115,22,0.4)]",
    bgGradient: "bg-[linear-gradient(135deg,#c2410c,#f97316,#ffedd5,#fb923c,#ea580c,#fb923c)]",
    glowShadow: "shadow-[0_0_12px_rgba(249,115,22,0.35)]",
    glowHover: "from-orange-600 via-amber-400 to-orange-500",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-700 dark:text-amber-300",
    badgeBorder: "border-amber-500/25",
    labelEn: "Client / Customer",
    labelFa: "کارفرما و مشتری",
  },
  user: {
    ringClass: "p-[2px] bg-[linear-gradient(135deg,#475569,#94a3b8,#f1f5f9,#64748b,#334155,#94a3b8)] shadow-[0_0_8px_rgba(100,116,139,0.3)]",
    bgGradient: "bg-[linear-gradient(135deg,#475569,#94a3b8,#f1f5f9,#64748b,#334155,#94a3b8)]",
    glowShadow: "shadow-[0_0_8px_rgba(100,116,139,0.25)]",
    glowHover: "from-slate-500 via-zinc-400 to-slate-600",
    badgeBg: "bg-slate-500/10",
    badgeText: "text-slate-700 dark:text-slate-300",
    badgeBorder: "border-slate-500/25",
    labelEn: "Standard User",
    labelFa: "کاربر استاندارد پایه",
  },
};

/**
 * Returns the full ring styling classes (padding + background gradient + glow shadow).
 */
export function getRoleRingClass(role?: string | null): string {
  if (!role) return ROLE_RING_CONFIGS.user.ringClass;
  const key = role.toLowerCase();
  return (ROLE_RING_CONFIGS[key] || ROLE_RING_CONFIGS.user).ringClass;
}

/**
 * Returns only the background gradient class for custom-padded or absolute containers.
 */
export function getRoleGradient(role?: string | null): string {
  if (!role) return ROLE_RING_CONFIGS.user.bgGradient;
  const key = role.toLowerCase();
  return (ROLE_RING_CONFIGS[key] || ROLE_RING_CONFIGS.user).bgGradient;
}

/**
 * Returns the ambient glow shadow class for hover or static highlight.
 */
export function getRoleGlowShadow(role?: string | null): string {
  if (!role) return ROLE_RING_CONFIGS.user.glowShadow;
  const key = role.toLowerCase();
  return (ROLE_RING_CONFIGS[key] || ROLE_RING_CONFIGS.user).glowShadow;
}

/**
 * Returns the hover aura gradient (for motion hover glow layers).
 */
export function getRoleGlowHover(role?: string | null): string {
  if (!role) return ROLE_RING_CONFIGS.user.glowHover;
  const key = role.toLowerCase();
  return (ROLE_RING_CONFIGS[key] || ROLE_RING_CONFIGS.user).glowHover;
}

/**
 * Returns the full badge classes for role tags.
 */
export function getRoleBadgeClass(role?: string | null): string {
  if (!role) return `${ROLE_RING_CONFIGS.user.badgeBg} ${ROLE_RING_CONFIGS.user.badgeText} ${ROLE_RING_CONFIGS.user.badgeBorder}`;
  const key = role.toLowerCase();
  const c = ROLE_RING_CONFIGS[key] || ROLE_RING_CONFIGS.user;
  return `${c.badgeBg} ${c.badgeText} ${c.badgeBorder}`;
}

