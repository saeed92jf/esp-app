// src/lib/audit-client.ts
/**
 * Client-Side Audit & Activity Logger.
 * Dispatches non-blocking audit trail events directly to the system audit repository.
 */

export interface LogClientActionOptions {
  action: string;
  title: string;
  titleFa?: string;
  titleEn?: string;
  description: string;
  descriptionFa?: string;
  descriptionEn?: string;
  category?:
    | "auth"
    | "admin"
    | "tasks"
    | "projects"
    | "requests"
    | "warehouse"
    | "assets"
    | "customers"
    | "system";
  severity?: "info" | "success" | "warning" | "error";
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  actorEmail?: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  metadata?: Record<string, any>;
}

export async function logClientAction(options: LogClientActionOptions): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const payload = {
      action: options.action,
      title: options.titleFa || options.title,
      titleFa: options.titleFa || options.title,
      titleEn: options.titleEn || options.title,
      description: options.descriptionFa || options.description,
      descriptionFa: options.descriptionFa || options.description,
      descriptionEn: options.descriptionEn || options.description,
      category: options.category || "system",
      severity: options.severity || "info",
      actorId: options.actorId,
      actorName: options.actorName,
      actorRole: options.actorRole,
      actorEmail: options.actorEmail,
      targetType: options.targetType,
      targetId: options.targetId,
      targetName: options.targetName,
      metadata: {
        ...options.metadata,
        clientTimestamp: new Date().toISOString(),
        url: window.location.pathname,
      },
    };

    // Fire and forget, non-blocking
    fetch("/api/admin/audit-logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Quiet fail to never disturb user experience
    });
  } catch {
    // Quiet fail
  }
}
