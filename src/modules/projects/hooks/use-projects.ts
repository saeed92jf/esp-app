// src/modules/projects/hooks/use-projects.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ProjectItem,
  ProjectFilterState,
  ProjectType,
  ProjectStatus,
} from "../types/projects.types";
import { projectsService } from "../services";

const DEFAULT_FILTERS: ProjectFilterState = {
  search: "",
  organization: "all",
  status: "all",
  projectType: "all",
};

export function useProjects(options?: {
  initialRole?: "admin" | "user";
  defaultUserName?: string;
}) {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ProjectFilterState>(DEFAULT_FILTERS);

  // Role & Persona state (Admin oversight vs User involved projects)
  const [roleMode, setRoleMode] = useState<"admin" | "user">(
    options?.initialRole || "admin"
  );
  const [currentUserName, setCurrentUserName] = useState<string>(
    options?.defaultUserName || "سعید جلیلی"
  );

  // Sync with localStorage across views
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("esp_role_perspective") as "admin" | "user" | null;
      const savedPersona = localStorage.getItem("esp_persona_name");
      if (savedRole && (savedRole === "admin" || savedRole === "user")) {
        setRoleMode(savedRole);
      }
      if (savedPersona) {
        setCurrentUserName(savedPersona);
      }
    }

    const handleSync = () => {
      const savedRole = localStorage.getItem("esp_role_perspective") as "admin" | "user" | null;
      const savedPersona = localStorage.getItem("esp_persona_name");
      if (savedRole && (savedRole === "admin" || savedRole === "user")) {
        setRoleMode(savedRole);
      }
      if (savedPersona) {
        setCurrentUserName(savedPersona);
      }
    };
    window.addEventListener("esp_role_change", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("esp_role_change", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const changeRoleMode = useCallback((role: "admin" | "user") => {
    setRoleMode(role);
    if (typeof window !== "undefined") {
      localStorage.setItem("esp_role_perspective", role);
      window.dispatchEvent(new Event("esp_role_change"));
    }
  }, []);

  const changeCurrentUserName = useCallback((name: string) => {
    setCurrentUserName(name);
    if (typeof window !== "undefined") {
      localStorage.setItem("esp_persona_name", name);
      window.dispatchEvent(new Event("esp_role_change"));
    }
  }, []);

  const setFilters = useCallback(
    (action: Partial<ProjectFilterState> | ((prev: ProjectFilterState) => ProjectFilterState)) => {
      if (typeof action === "function") {
        setFiltersState(action);
      } else {
        setFiltersState((prev) => ({ ...prev, ...action }));
      }
    },
    []
  );

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectsService.getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const organizations = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.organization) set.add(p.organization);
    });
    return Array.from(set);
  }, [projects]);

  const userProjects = useMemo(() => {
    const u = currentUserName.trim().toLowerCase();
    return projects.filter((p) => {
      const inTeam = p.team?.some((m) =>
        m.name.toLowerCase().includes(u)
      );
      const inTasks = p.tasks?.some((t) =>
        t.assignedToName?.toLowerCase().includes(u)
      );
      const inSubPackages = p.subPackages?.some((sp) =>
        sp.leadName?.toLowerCase().includes(u)
      );
      return inTeam || inTasks || inSubPackages;
    });
  }, [projects, currentUserName]);

  const stats = useMemo(() => {
    const targetSet = roleMode === "user" ? userProjects : projects;
    const total = targetSet.length;
    const active = targetSet.filter(
      (p) => p.status !== "completed" && p.status !== "on_hold"
    ).length;
    const exportCount = targetSet.filter((p) => p.projectType === "export").length;
    const internalCount = targetSet.filter((p) => p.projectType === "internal").length;
    const rdCount = targetSet.filter((p) => p.projectType === "rd").length;
    const completed = targetSet.filter((p) => p.status === "completed").length;
    const avgProgress =
      total > 0
        ? Math.round(
            targetSet.reduce((sum, p) => sum + (p.progressPercent || 0), 0) / total
          )
        : 0;

    return {
      total,
      active,
      exportCount,
      internalCount,
      rdCount,
      completed,
      avgProgress,
      allTotal: projects.length,
      userTotal: userProjects.length,
    };
  }, [projects, userProjects, roleMode]);

  const filteredProjects = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return projects.filter((p) => {
      // ── Role Filter ──
      if (roleMode === "user") {
        const u = currentUserName.trim().toLowerCase();
        const inTeam = p.team?.some((m) =>
          m.name.toLowerCase().includes(u)
        );
        const inTasks = p.tasks?.some((t) =>
          t.assignedToName?.toLowerCase().includes(u)
        );
        const inSubPackages = p.subPackages?.some((sp) =>
          sp.leadName?.toLowerCase().includes(u)
        );
        if (!inTeam && !inTasks && !inSubPackages) {
          return false;
        }
      }

      if (filters.organization !== "all" && p.organization !== filters.organization) {
        return false;
      }
      if (filters.status !== "all" && p.status !== filters.status) {
        return false;
      }
      if (filters.projectType !== "all" && p.projectType !== filters.projectType) {
        return false;
      }

      if (q) {
        const titleMatch = p.title.toLowerCase().includes(q);
        const codeMatch = p.code.toLowerCase().includes(q);
        const clientMatch = p.clientName.toLowerCase().includes(q);
        const quoteMatch = p.quotationNumber.toLowerCase().includes(q);
        const descMatch = p.description.toLowerCase().includes(q);
        const orgMatch = p.organization.toLowerCase().includes(q);

        if (
          !titleMatch &&
          !codeMatch &&
          !clientMatch &&
          !quoteMatch &&
          !descMatch &&
          !orgMatch
        ) {
          return false;
        }
      }

      return true;
    });
  }, [projects, filters, roleMode, currentUserName]);

  const createProject = useCallback(
    async (projectData: Omit<ProjectItem, "id">) => {
      const created = await projectsService.createProject(projectData);
      setProjects((prev) => [created, ...prev]);
      return created;
    },
    []
  );

  const updateProject = useCallback(async (project: ProjectItem) => {
    const updated = await projectsService.updateProject(project);
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    return updated;
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    await projectsService.deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    projects,
    isLoading,
    error,
    filters,
    setFilters,
    roleMode,
    setRoleMode: changeRoleMode,
    currentUserName,
    setCurrentUserName: changeCurrentUserName,
    filteredProjects,
    stats,
    organizations,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects: fetchProjects,
  };
}
