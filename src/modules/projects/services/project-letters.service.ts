// src/modules/projects/services/project-letters.service.ts
import {
  ProjectLetter,
  CreateLetterPayload,
  ManagerReviewPayload,
} from "../types/project-letters.types";

class ProjectLettersService {
  private baseUrl = "/api/projects";

  async getLetters(params?: {
    status?: string;
    projectId?: string;
    search?: string;
  }): Promise<ProjectLetter[]> {
    const url = new URL(
      `${this.baseUrl}/letters`,
      typeof window !== "undefined" ? window.location.origin : "http://localhost:4000"
    );
    if (params?.status && params.status !== "all") url.searchParams.set("status", params.status);
    if (params?.projectId && params.projectId !== "all") url.searchParams.set("projectId", params.projectId);
    if (params?.search) url.searchParams.set("search", params.search);

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch project letters");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  async getProjectLetters(projectId: string): Promise<ProjectLetter[]> {
    const res = await fetch(`${this.baseUrl}/${projectId}/letters`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch project letters");
    return res.json();
  }

  async createLetter(projectId: string, payload: CreateLetterPayload): Promise<ProjectLetter> {
    const res = await fetch(`${this.baseUrl}/${projectId}/letters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || "Failed to create project letter");
    }
    return res.json();
  }

  async reviewLetter(letterId: string, payload: ManagerReviewPayload): Promise<ProjectLetter> {
    const res = await fetch(`${this.baseUrl}/letters/${letterId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || "Failed to submit manager review");
    }
    return res.json();
  }

  async markLetterSent(
    letterId: string,
    payload: { trackingNumber?: string; notes?: string; sentBy?: string }
  ): Promise<ProjectLetter> {
    const res = await fetch(`${this.baseUrl}/letters/${letterId}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || "Failed to mark letter sent");
    }
    return res.json();
  }

  async deleteLetter(letterId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/letters/${letterId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete project letter");
  }
}

export const projectLettersService = new ProjectLettersService();

