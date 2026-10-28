import projectPhasesMock from "@/data/mock/project-phases.json";
import projectsMock from "@/data/mock/projects.json";
// src/modules/projects/services/fake-projects.service.ts
import { ProjectsService } from "./projects.service";
import {
  ProjectItem,
  VdisDocumentItem,
  TransmittalLetter,
  ProjectRiskItem,
  ProjectPhase,
  ProjectTeamMember,
  ProjectTaskItem,
} from "../types/projects.types";

const STORAGE_KEY = "esp_projects_data_v3";

export const DEFAULT_PROJECT_PHASES: ProjectPhase[] = projectPhasesMock as unknown as ProjectPhase[];

export const INITIAL_PROJECTS: ProjectItem[] = projectsMock as unknown as ProjectItem[];

export class FakeProjectsService implements ProjectsService {
  private projects: ProjectItem[] = [];

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.projects = JSON.parse(stored);
          return;
        }
      } catch {}
    }
    this.projects = [...INITIAL_PROJECTS];
    this.persist();
  }

  private persist() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.projects));
        window.dispatchEvent(
          new CustomEvent("esp_projects_change", { detail: this.projects })
        );
      } catch {}
    }
  }

  async getProjects(): Promise<ProjectItem[]> {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.projects = JSON.parse(stored);
        }
      } catch {}
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.projects]), 80);
    });
  }

  async getProjectById(id: string): Promise<ProjectItem | null> {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.projects = JSON.parse(stored);
        }
      } catch {}
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = this.projects.find((p) => p.id === id || p.code === id);
        resolve(found ? { ...found } : null);
      }, 70);
    });
  }

  async createProject(projectData: Omit<ProjectItem, "id">): Promise<ProjectItem> {
    return new Promise((resolve) => {
      const newProj: ProjectItem = {
        ...projectData,
        id: `prj-${Date.now()}`,
        phases: projectData.phases?.length ? projectData.phases : DEFAULT_PROJECT_PHASES,
        vdisDocuments: projectData.vdisDocuments || [],
        transmittals: projectData.transmittals || [],
        risks: projectData.risks || [],
        tasks: projectData.tasks || [],
        strategicGoals: projectData.strategicGoals || [],
        roadmapNodes: projectData.roadmapNodes || [],
      };
      this.projects.unshift(newProj);
      this.persist();
      setTimeout(() => resolve(newProj), 120);
    });
  }

  async updateProject(project: ProjectItem): Promise<ProjectItem> {
    return new Promise((resolve, reject) => {
      const idx = this.projects.findIndex((p) => p.id === project.id);
      if (idx === -1) return reject(new Error("Project not found"));
      this.projects[idx] = { ...project };
      this.persist();
      setTimeout(() => resolve(this.projects[idx]), 100);
    });
  }

  async deleteProject(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const idx = this.projects.findIndex((p) => p.id === id);
      if (idx === -1) return reject(new Error("Project not found"));
      this.projects.splice(idx, 1);
      this.persist();
      setTimeout(() => resolve(), 100);
    });
  }

  async addPhase(projectId: string, phaseData: Omit<ProjectPhase, "id">): Promise<ProjectPhase> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));
      const newPhase: ProjectPhase = {
        ...phaseData,
        id: `ph-${Date.now()}`,
        isCustom: true,
      };
      proj.phases = proj.phases || [];
      proj.phases.push(newPhase);
      this.persist();
      setTimeout(() => resolve(newPhase), 100);
    });
  }

  async updatePhase(projectId: string, phase: ProjectPhase): Promise<ProjectPhase> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));
      const idx = (proj.phases || []).findIndex((p) => p.id === phase.id);
      if (idx === -1) return reject(new Error("Phase not found"));
      proj.phases[idx] = { ...phase };
      this.persist();
      setTimeout(() => resolve(proj.phases[idx]), 100);
    });
  }

  async addTeamMember(projectId: string, member: ProjectTeamMember): Promise<ProjectItem> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));
      proj.team = proj.team || [];
      proj.team.push(member);
      this.persist();
      setTimeout(() => resolve({ ...proj }), 100);
    });
  }

  async removeTeamMember(projectId: string, memberId: string): Promise<ProjectItem> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));
      proj.team = (proj.team || []).filter((m) => m.id !== memberId);
      this.persist();
      setTimeout(() => resolve({ ...proj }), 100);
    });
  }

  async uploadVdisDocument(projectId: string, doc: Omit<VdisDocumentItem, "id">): Promise<VdisDocumentItem> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));
      const newDoc: VdisDocumentItem = {
        ...doc,
        id: `vdis-${Date.now()}`,
      };
      proj.vdisDocuments = proj.vdisDocuments || [];
      proj.vdisDocuments.unshift(newDoc);
      this.persist();
      setTimeout(() => resolve(newDoc), 120);
    });
  }

  async createTransmittal(
    projectId: string,
    transmittal: Omit<TransmittalLetter, "id" | "activities">
  ): Promise<TransmittalLetter> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));

      const newTr: TransmittalLetter = {
        ...transmittal,
        id: `tr-${Date.now()}`,
        status: "pending_manager",
        activities: [
          {
            id: `act-${Date.now()}`,
            timestamp: new Intl.DateTimeFormat("fa-IR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date()),
            author: transmittal.senderName,
            action: "ترنسمیتال جدید تنظیم و جهت بررسی و تایید به کارتابل مدیر بالادستی ارسال شد.",
          },
        ],
      };

      proj.transmittals = proj.transmittals || [];
      proj.transmittals.unshift(newTr);
      this.persist();
      setTimeout(() => resolve(newTr), 150);
    });
  }

  async managerApproveTransmittal(
    projectId: string,
    transmittalId: string,
    managerName: string,
    comment?: string
  ): Promise<TransmittalLetter> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));
      const tr = (proj.transmittals || []).find((t) => t.id === transmittalId);
      if (!tr) return reject(new Error("Transmittal not found"));

      tr.status = "approved_sent";
      tr.approverManagerName = managerName;
      tr.approvalDate = new Intl.DateTimeFormat("fa-IR").format(new Date());
      tr.sentDate = tr.approvalDate;

      tr.activities = tr.activities || [];
      tr.activities.unshift({
        id: `act-${Date.now()}`,
        timestamp: new Intl.DateTimeFormat("fa-IR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
        author: managerName,
        action: "ترنسمیتال توسط مدیر بالادستی تایید و با موفقیت به کارفرما ارسال گردید.",
        comment,
      });

      // Update associated documents status to transmitted
      if (tr.documents && tr.documents.length > 0) {
        tr.documents.forEach((d) => {
          const docInProj = proj.vdisDocuments?.find((vd) => vd.id === d.id);
          if (docInProj) {
            docInProj.status = "transmitted";
            docInProj.transmittedDate = tr.sentDate;
            docInProj.transmittalNumber = tr.transmittalNo;
          }
        });
      }

      this.persist();
      setTimeout(() => resolve(tr), 150);
    });
  }

  async managerRejectTransmittal(
    projectId: string,
    transmittalId: string,
    managerName: string,
    reason: string
  ): Promise<TransmittalLetter> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));
      const tr = (proj.transmittals || []).find((t) => t.id === transmittalId);
      if (!tr) return reject(new Error("Transmittal not found"));

      tr.status = "rejected";
      tr.activities = tr.activities || [];
      tr.activities.unshift({
        id: `act-${Date.now()}`,
        timestamp: new Intl.DateTimeFormat("fa-IR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
        author: managerName,
        action: "ترنسمیتال توسط مدیر رد شد و جهت اصلاح عودت یافت.",
        comment: reason,
      });

      this.persist();
      setTimeout(() => resolve(tr), 150);
    });
  }

  async addRisk(projectId: string, risk: Omit<ProjectRiskItem, "id">): Promise<ProjectRiskItem> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));
      const newRisk: ProjectRiskItem = {
        ...risk,
        id: `risk-${Date.now()}`,
      };
      proj.risks = proj.risks || [];
      proj.risks.unshift(newRisk);
      this.persist();
      setTimeout(() => resolve(newRisk), 100);
    });
  }

  async updateRiskStatus(
    projectId: string,
    riskId: string,
    status: ProjectRiskItem['status']
  ): Promise<ProjectRiskItem> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));
      const r = (proj.risks || []).find((x) => x.id === riskId);
      if (!r) return reject(new Error("Risk not found"));
      r.status = status;
      this.persist();
      setTimeout(() => resolve(r), 100);
    });
  }

  async addTask(projectId: string, task: Omit<ProjectTaskItem, "id">): Promise<ProjectTaskItem> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));
      const newTask: ProjectTaskItem = {
        ...task,
        id: `pt-${Date.now()}`,
      };
      proj.tasks = proj.tasks || [];
      proj.tasks.unshift(newTask);
      this.persist();
      setTimeout(() => resolve(newTask), 100);
    });
  }

  async updateTaskStatus(
    projectId: string,
    taskId: string,
    status: ProjectTaskItem['status']
  ): Promise<ProjectTaskItem> {
    return new Promise((resolve, reject) => {
      const proj = this.projects.find((p) => p.id === projectId);
      if (!proj) return reject(new Error("Project not found"));
      const t = (proj.tasks || []).find((x) => x.id === taskId);
      if (!t) return reject(new Error("Task not found"));
      t.status = status;
      if (status === "done") t.progressPercent = 100;
      this.persist();
      setTimeout(() => resolve(t), 100);
    });
  }
}

export const fakeProjectsService = new FakeProjectsService();
