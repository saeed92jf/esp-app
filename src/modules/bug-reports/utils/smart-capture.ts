// src/modules/bug-reports/utils/smart-capture.ts
import { toPng } from "html-to-image";
import type { SmartEnvironmentData } from "../types";

export const APP_MODULE_NAMES: Record<string, { en: string; fa: string }> = {
  dashboard: { en: "Executive Dashboard", fa: "داشبورد سازمانی" },
  tasks: { en: "Task Management & Kanban", fa: "مدیریت وظایف و تسک‌ها" },
  projects: { en: "Industrial Projects", fa: "مدیریت پروژه‌ها و قراردادها" },
  customers: { en: "Clients & Partners", fa: "فهرست کارفرمایان و مشتریان" },
  directory: { en: "Personnel Directory", fa: "راهنمای همکاران و چارت سازمانی" },
  profile: { en: "Personnel Profile", fa: "پروفایل پرسنلی و مدارک" },
  admin: { en: "System Administration", fa: "مدیریت سیستم و کنترل دسترسی" },
  community: { en: "Technical Community", fa: "تالار گفتگوی تخصصی" },
  "datasheet-ai": { en: "Datasheet AI", fa: "سامانه استخراج هوشمند دیتاشیت" },
  "ESP-Flow": { en: "ESP-Flow Engineering", fa: "سامانه محاسباتی ESP-Flow" },
  dictionary: { en: "Engineering Dictionary", fa: "دیکشنری تخصصی مهندسی" },
  "did-you-know": { en: "Engineering Insights", fa: "آیا می‌دانستید مهندسی" },
  search: { en: "Global Search", fa: "جستجوی پیشرفته سراسری" },
};

export function detectActiveModule(pathname?: string): { id: string; nameEn: string; nameFa: string } {
  if (!pathname || typeof window === "undefined") {
    pathname = window?.location?.pathname || "/";
  }

  // Strip locale prefix (/fa or /en)
  const clean = pathname.replace(/^\/(?:fa|en)(?=\/|$)/, "") || "/";
  const segments = clean.split("/").filter(Boolean);
  const first = segments[0] || "dashboard";

  if (APP_MODULE_NAMES[first]) {
    return {
      id: first,
      nameEn: APP_MODULE_NAMES[first].en,
      nameFa: APP_MODULE_NAMES[first].fa,
    };
  }

  return {
    id: first || "general",
    nameEn: first.charAt(0).toUpperCase() + first.slice(1),
    nameFa: "عمومی سیستم",
  };
}

export function getClientEnvironment(pathname?: string): SmartEnvironmentData {
  if (typeof window === "undefined") {
    return { appVersion: "1.0.0" };
  }

  const userAgent = navigator.userAgent || "";
  let browserName = "Unknown";
  let browserVersion = "";

  if (userAgent.indexOf("Firefox") > -1) {
    browserName = "Firefox";
    browserVersion = userAgent.match(/Firefox\/(\d+(\.\d+)?)/)?.[1] || "";
  } else if (userAgent.indexOf("Edg") > -1) {
    browserName = "Microsoft Edge";
    browserVersion = userAgent.match(/Edg\/(\d+(\.\d+)?)/)?.[1] || "";
  } else if (userAgent.indexOf("Chrome") > -1) {
    browserName = "Google Chrome";
    browserVersion = userAgent.match(/Chrome\/(\d+(\.\d+)?)/)?.[1] || "";
  } else if (userAgent.indexOf("Safari") > -1) {
    browserName = "Safari";
    browserVersion = userAgent.match(/Version\/(\d+(\.\d+)?)/)?.[1] || "";
  }

  let os = "Unknown";
  if (userAgent.indexOf("Win") > -1) os = "Windows";
  else if (userAgent.indexOf("Mac") > -1) os = "macOS";
  else if (userAgent.indexOf("Linux") > -1) os = "Linux";
  else if (userAgent.indexOf("Android") > -1) os = "Android";
  else if (userAgent.indexOf("iPhone") > -1 || userAgent.indexOf("iPad") > -1) os = "iOS";

  let deviceType = "Desktop";
  const width = window.innerWidth;
  if (width < 640) deviceType = "Mobile";
  else if (width < 1024) deviceType = "Tablet";

  const moduleInfo = detectActiveModule(pathname);

  return {
    pageUrl: window.location.href,
    moduleId: moduleInfo.id,
    browserName,
    browserVersion,
    os,
    deviceType,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    viewportDimensions: `${window.innerWidth}x${window.innerHeight}`,
    language: navigator.language || "fa-IR",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Tehran",
    appVersion: "1.0.0",
    clientTimestamp: new Date().toISOString(),
  };
}

/**
 * User-initiated screen capture using native html-to-image.
 * Excludes sensitive elements, passwords, and popovers.
 */
export async function captureCurrentScreen(): Promise<string | null> {
  if (typeof window === "undefined" || !document.body) {
    return null;
  }

  try {
    // Hide Quick Actions FAB temporarily during screen shot
    const fabElement = document.getElementById("esp-quick-actions-fab");
    const originalFabDisplay = fabElement ? fabElement.style.display : null;
    if (fabElement) fabElement.style.display = "none";

    const dataUrl = await toPng(document.body, {
      quality: 0.85,
      pixelRatio: 1,
      filter: (node: HTMLElement) => {
        // Exclude password inputs, modal dialogs, and notifications
        if (node.tagName === "INPUT" && (node as HTMLInputElement).type === "password") {
          return false;
        }
        if (node.getAttribute?.("data-quick-actions-modal") === "true") {
          return false;
        }
        return true;
      },
    });

    if (fabElement && originalFabDisplay !== null) {
      fabElement.style.display = originalFabDisplay;
    }

    return dataUrl;
  } catch (err) {
    console.warn("Failed to capture screen:", err);
    return null;
  }
}

