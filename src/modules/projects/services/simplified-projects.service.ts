// src/modules/projects/services/simplified-projects.service.ts
import {
  SimplifiedProject,
  SimplifiedProjectCreate,
  ProjectDocument,
} from "../types/simplified-projects.types";

class SimplifiedProjectsService {
  private baseUrl = "/api/projects";
  private cache = new Map<string, { data: SimplifiedProject[]; timestamp: number }>();
  private cacheTtl = 60000; // 60s memory cache

  private getCacheKey(params?: Record<string, any>): string {
    return JSON.stringify(params || {});
  }

  getCachedProjects(params?: {
    status?: string;
    category?: string;
    client?: string;
    search?: string;
    managerId?: string;
  }): SimplifiedProject[] | null {
    const key = this.getCacheKey(params);
    const entry = this.cache.get(key);
    if (!entry) return null;
    return entry.data;
  }

  hasCachedProjects(params?: {
    status?: string;
    category?: string;
    client?: string;
    search?: string;
    managerId?: string;
  }): boolean {
    return Boolean(this.getCachedProjects(params));
  }

  clearCache(): void {
    this.cache.clear();
  }

  async getProjects(params?: {
    status?: string;
    category?: string;
    client?: string;
    search?: string;
    managerId?: string;
  }, forceRefresh = false): Promise<SimplifiedProject[]> {
    const key = this.getCacheKey(params);
    const entry = this.cache.get(key);
    const now = Date.now();

    // If cache is fresh (< 10s) and not forceRefresh, return immediately
    if (!forceRefresh && entry && (now - entry.timestamp < 10000)) {
      return entry.data;
    }

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
    const result: SimplifiedProject[] = Array.isArray(data) ? data : (data.items || data.projects || []);

    this.cache.set(key, { data: result, timestamp: Date.now() });
    return result;
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
    this.clearCache();
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
    this.clearCache();
    return res.json();
  }

  async deleteProject(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete project ${id}`);
    this.clearCache();
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

