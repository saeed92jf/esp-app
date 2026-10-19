// src/modules/projects/hooks/use-project-detail.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ProjectItem,
  ProjectPhase,
  ProjectTeamMember,
  VdisDocumentItem,
  TransmittalLetter,
  ProjectRiskItem,
  ProjectTaskItem,
} from "../types/projects.types";
import { projectsService } from "../services";

export function useProjectDetail(projectId: string) {
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectsService.getProjectById(projectId);
      setProject(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load project details");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const addPhase = useCallback(
    async (phase: Omit<ProjectPhase, "id">) => {
      if (!project) return;
      await projectsService.addPhase(project.id, phase);
      await fetchProject();
    },
    [project, fetchProject]
  );

  const updatePhase = useCallback(
    async (phase: ProjectPhase) => {
      if (!project) return;
      await projectsService.updatePhase(project.id, phase);
      await fetchProject();
    },
    [project, fetchProject]
  );

  const addTeamMember = useCallback(
    async (member: ProjectTeamMember) => {
      if (!project) return;
      await projectsService.addTeamMember(project.id, member);
      await fetchProject();
    },
    [project, fetchProject]
  );

  const removeTeamMember = useCallback(
    async (memberId: string) => {
      if (!project) return;
      await projectsService.removeTeamMember(project.id, memberId);
      await fetchProject();
    },
    [project, fetchProject]
  );

  const uploadVdisDocument = useCallback(
    async (doc: Omit<VdisDocumentItem, "id">) => {
      if (!project) return;
      await projectsService.uploadVdisDocument(project.id, doc);
      await fetchProject();
    },
    [project, fetchProject]
  );

  const createTransmittal = useCallback(
    async (transmittal: Omit<TransmittalLetter, "id" | "activities">) => {
      if (!project) return;
      await projectsService.createTransmittal(project.id, transmittal);
      await fetchProject();
    },
    [project, fetchProject]
  );

  const managerApproveTransmittal = useCallback(
    async (transmittalId: string, managerName: string, comment?: string) => {
      if (!project) return;
      await projectsService.managerApproveTransmittal(
        project.id,
        transmittalId,
        managerName,
        comment
      );
      await fetchProject();
    },
    [project, fetchProject]
  );

  const managerRejectTransmittal = useCallback(
    async (transmittalId: string, managerName: string, reason: string) => {
      if (!project) return;
      await projectsService.managerRejectTransmittal(
        project.id,
        transmittalId,
        managerName,
        reason
      );
      await fetchProject();
    },
    [project, fetchProject]
  );

  const addRisk = useCallback(
    async (risk: Omit<ProjectRiskItem, "id">) => {
      if (!project) return;
      await projectsService.addRisk(project.id, risk);
      await fetchProject();
    },
    [project, fetchProject]
  );

  const updateRiskStatus = useCallback(
    async (riskId: string, status: ProjectRiskItem["status"]) => {
      if (!project) return;
      await projectsService.updateRiskStatus(project.id, riskId, status);
      await fetchProject();
    },
    [project, fetchProject]
  );

  const addTask = useCallback(
    async (task: Omit<ProjectTaskItem, "id">) => {
      if (!project) return;
      await projectsService.addTask(project.id, task);
      await fetchProject();
    },
    [project, fetchProject]
  );

  const updateTaskStatus = useCallback(
    async (taskId: string, status: ProjectTaskItem["status"]) => {
      if (!project) return;
      await projectsService.updateTaskStatus(project.id, taskId, status);
      await fetchProject();
    },
    [project, fetchProject]
  );

  return {
    project,
    isLoading,
    error,
    refreshProject: fetchProject,
    addPhase,
    updatePhase,
    addTeamMember,
    removeTeamMember,
    uploadVdisDocument,
    createTransmittal,
    managerApproveTransmittal,
    managerRejectTransmittal,
    addRisk,
    updateRiskStatus,
    addTask,
    updateTaskStatus,
  };
}
