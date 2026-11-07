// src/modules/projects/services/simplified-projects.service.ts
import {
  SimplifiedProject,
  SimplifiedProjectCreate,
  ProjectDocument,
} from "../types/simplified-projects.types";

class SimplifiedProjectsService {
  private baseUrl = "/api/projects";

  async getProjects(params?: {
    status?: string;
    category?: string;
    client?: string;
    search?: string;
    managerId?: string;
  }): Promise<SimplifiedProject[]> {
    const url = new URL(
      this.baseUrl,
      typeof window !== "undefined" ? window.location.origin : "http://localhost:4000"
    );
    if (params?.status) url.searchParams.set("status", params.status);
    if (params?.category) url.searchParams.set("category", params.category);
    if (params?.client) url.searchParams.set("client", params.client);
    if (params?.search) url.searchParams.set("search", params.search);
    if (params?.managerId) url.searchParams.set("manager_id", params.managerId);

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch projects");
    const data = await res.json();
    return Array.isArray(data) ? data : (data.items || data.projects || []);
  }

  async getProjectById(id: string): Promise<SimplifiedProject | null> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch project ${id}`);
    return res.json();
  }

  async createProject(project: SimplifiedProjectCreate): Promise<SimplifiedProject> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || "Failed to create project");
    }
    return res.json();
  }

  async updateProject(
    id: string,
    updates: Partial<SimplifiedProject>
  ): Promise<SimplifiedProject> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`Failed to update project ${id}`);
    return res.json();
  }

  async deleteProject(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete project ${id}`);
  }

  async addDocument(projectId: string, document: ProjectDocument): Promise<SimplifiedProject> {
    const res = await fetch(`${this.baseUrl}/${projectId}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(document),
    });
    if (!res.ok) throw new Error("Failed to add project document");
    return res.json();
  }
}

export const simplifiedProjectsService = new SimplifiedProjectsService();

