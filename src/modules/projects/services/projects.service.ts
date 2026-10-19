// src/modules/projects/services/projects.service.ts
import {
  ProjectItem,
  VdisDocumentItem,
  TransmittalLetter,
  ProjectRiskItem,
  ProjectPhase,
  ProjectTeamMember,
  ProjectTaskItem,
} from "../types/projects.types";

export interface ProjectsService {
  getProjects(): Promise<ProjectItem[]>;
  getProjectById(id: string): Promise<ProjectItem | null>;
  createProject(project: Omit<ProjectItem, "id">): Promise<ProjectItem>;
  updateProject(project: ProjectItem): Promise<ProjectItem>;
  deleteProject(id: string): Promise<void>;
  
  // Phase & WBS management
  addPhase(projectId: string, phase: Omit<ProjectPhase, "id">): Promise<ProjectPhase>;
  updatePhase(projectId: string, phase: ProjectPhase): Promise<ProjectPhase>;
  
  // Team management
  addTeamMember(projectId: string, member: ProjectTeamMember): Promise<ProjectItem>;
  removeTeamMember(projectId: string, memberId: string): Promise<ProjectItem>;
  
  // VDIS Document & Transmittal Approval Workflow (Outlook style)
  uploadVdisDocument(projectId: string, doc: Omit<VdisDocumentItem, "id">): Promise<VdisDocumentItem>;
  createTransmittal(projectId: string, transmittal: Omit<TransmittalLetter, "id" | "activities">): Promise<TransmittalLetter>;
  managerApproveTransmittal(projectId: string, transmittalId: string, managerName: string, comment?: string): Promise<TransmittalLetter>;
  managerRejectTransmittal(projectId: string, transmittalId: string, managerName: string, reason: string): Promise<TransmittalLetter>;
  
  // Risks Management
  addRisk(projectId: string, risk: Omit<ProjectRiskItem, "id">): Promise<ProjectRiskItem>;
  updateRiskStatus(projectId: string, riskId: string, status: ProjectRiskItem['status']): Promise<ProjectRiskItem>;
  
  // Task management
  addTask(projectId: string, task: Omit<ProjectTaskItem, "id">): Promise<ProjectTaskItem>;
  updateTaskStatus(projectId: string, taskId: string, status: ProjectTaskItem['status']): Promise<ProjectTaskItem>;
}

export class RealProjectsService implements ProjectsService {
  private baseUrl = "/api/projects";

  async getProjects(): Promise<ProjectItem[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) throw new Error("Failed to fetch projects");
    return res.json();
  }

  async getProjectById(id: string): Promise<ProjectItem | null> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch project ${id}`);
    }
    return res.json();
  }

  async createProject(project: Omit<ProjectItem, "id">): Promise<ProjectItem> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    });
    if (!res.ok) throw new Error("Failed to create project");
    return res.json();
  }

  async updateProject(project: ProjectItem): Promise<ProjectItem> {
    const res = await fetch(`${this.baseUrl}/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    });
    if (!res.ok) throw new Error("Failed to update project");
    return res.json();
  }

  async deleteProject(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete project");
  }

  async addPhase(projectId: string, phase: Omit<ProjectPhase, "id">): Promise<ProjectPhase> {
    const res = await fetch(`${this.baseUrl}/${projectId}/phases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(phase),
    });
    if (!res.ok) throw new Error("Failed to add phase");
    return res.json();
  }

  async updatePhase(projectId: string, phase: ProjectPhase): Promise<ProjectPhase> {
    const res = await fetch(`${this.baseUrl}/${projectId}/phases/${phase.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(phase),
    });
    if (!res.ok) throw new Error("Failed to update phase");
    return res.json();
  }

  async addTeamMember(projectId: string, member: ProjectTeamMember): Promise<ProjectItem> {
    const res = await fetch(`${this.baseUrl}/${projectId}/team`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(member),
    });
    if (!res.ok) throw new Error("Failed to add team member");
    return res.json();
  }

  async removeTeamMember(projectId: string, memberId: string): Promise<ProjectItem> {
    const res = await fetch(`${this.baseUrl}/${projectId}/team/${memberId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to remove team member");
    return res.json();
  }

  async uploadVdisDocument(projectId: string, doc: Omit<VdisDocumentItem, "id">): Promise<VdisDocumentItem> {
    const res = await fetch(`${this.baseUrl}/${projectId}/vdis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doc),
    });
    if (!res.ok) throw new Error("Failed to upload VDIS document");
    return res.json();
  }

  async createTransmittal(projectId: string, transmittal: Omit<TransmittalLetter, "id" | "activities">): Promise<TransmittalLetter> {
    const res = await fetch(`${this.baseUrl}/${projectId}/transmittals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transmittal),
    });
    if (!res.ok) throw new Error("Failed to create transmittal");
    return res.json();
  }

  async managerApproveTransmittal(projectId: string, transmittalId: string, managerName: string, comment?: string): Promise<TransmittalLetter> {
    const res = await fetch(`${this.baseUrl}/${projectId}/transmittals/${transmittalId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ managerName, comment }),
    });
    if (!res.ok) throw new Error("Failed to approve transmittal");
    return res.json();
  }

  async managerRejectTransmittal(projectId: string, transmittalId: string, managerName: string, reason: string): Promise<TransmittalLetter> {
    const res = await fetch(`${this.baseUrl}/${projectId}/transmittals/${transmittalId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ managerName, reason }),
    });
    if (!res.ok) throw new Error("Failed to reject transmittal");
    return res.json();
  }

  async addRisk(projectId: string, risk: Omit<ProjectRiskItem, "id">): Promise<ProjectRiskItem> {
    const res = await fetch(`${this.baseUrl}/${projectId}/risks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(risk),
    });
    if (!res.ok) throw new Error("Failed to add risk");
    return res.json();
  }

  async updateRiskStatus(projectId: string, riskId: string, status: ProjectRiskItem['status']): Promise<ProjectRiskItem> {
    const res = await fetch(`${this.baseUrl}/${projectId}/risks/${riskId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update risk status");
    return res.json();
  }

  async addTask(projectId: string, task: Omit<ProjectTaskItem, "id">): Promise<ProjectTaskItem> {
    const res = await fetch(`${this.baseUrl}/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error("Failed to add task");
    return res.json();
  }

  async updateTaskStatus(projectId: string, taskId: string, status: ProjectTaskItem['status']): Promise<ProjectTaskItem> {
    const res = await fetch(`${this.baseUrl}/${projectId}/tasks/${taskId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update task status");
    return res.json();
  }
}
