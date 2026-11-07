// src/modules/projects/components/projects-page-container.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  Kanban,
  PlusCircle,
  RefreshCw,
  AlertCircle,
  Layers,
  FolderKanban,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import type { SimplifiedProject } from "../types/simplified-projects.types";
import { simplifiedProjectsService } from "../services/simplified-projects.service";
import { ProjectRoadmapView } from "./simplified/ProjectRoadmapView";
import { ProjectCreateWizard } from "./simplified/ProjectCreateWizard";
import { ProjectDetailView } from "./simplified/ProjectDetailView";

type ProjectTab = "roadmap" | "create";

interface NavItem {
  id: ProjectTab;
  labelFa: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
}

function isAdminRole(role?: string): boolean {
  return role === "superadmin" || role === "admin";
}

export function ProjectsPageContainer() {
  const { user } = useAuth();
  const locale = useLocale();
  const isRtl = locale === "fa";
  const isAdmin = isAdminRole(user?.role);

  const [projects, setProjects] = useState<SimplifiedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ProjectTab>("roadmap");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<SimplifiedProject | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await simplifiedProjectsService.getProjects();
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProjects();
    setIsRefreshing(false);
  };

  const handleProjectCreated = (newProject: SimplifiedProject) => {
    setProjects((prev) => [newProject, ...prev]);
    setActiveTab("roadmap");
    setSelectedProject(newProject);
  };

  const handleProjectUpdated = (updatedProject: SimplifiedProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    if (selectedProject?.id === updatedProject.id) {
      setSelectedProject(updatedProject);
    }
  };

  const handleProjectDeleted = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }
  };

  // Nav Items: 1. نقشه راه و وضعیت کلی پروژه‌ها, 2. ساخت پروژه جدید
  const navItems: NavItem[] = useMemo(() => {
    return [
      { id: "roadmap", labelFa: "نقشه راه کلی پروژه‌ها", labelEn: "Overall Roadmap", icon: Layers },
      { id: "create", labelFa: "ساخت پروژه جدید", labelEn: "New Project", icon: PlusCircle },
    ];
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-full bg-panel dark:bg-background font-sans w-full relative">
      {/* ── 1. Top Unified Header ── */}
      <AppHeader
        tag={isRtl ? "مدیریت پروژه‌ها" : "Projects Management"}
        subTag={
          selectedProject
            ? selectedProject.name
            : activeTab === "create"
            ? isRtl ? "ساخت پروژه جدید" : "Create New Project"
            : isRtl ? "نقشه راه و وضعیت کلی پروژه‌ها" : "Overall Project Roadmap"
        }
        onToggleMenu={() => setSidebarOpen(!sidebarOpen)}
        isMenuOpen={sidebarOpen}
        logoHref="/"
      />

      <div className="flex flex-1 w-full relative">
        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── 2. Unified Collapsible Sidebar Navigation ── */}
        <aside
          className={cn(
            "flex flex-col shrink-0 sticky top-[var(--header-height)] self-start max-h-[calc(100dvh-var(--header-height)-var(--footer-height))] bg-panel/95 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none z-30 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto overflow-x-hidden border-none py-6",
            "absolute md:sticky start-0 top-0 md:top-[var(--header-height)]",
            sidebarOpen
              ? "w-64 translate-x-0 opacity-100 shadow-xl md:shadow-none"
              : "max-md:-translate-x-full max-md:rtl:translate-x-full max-md:opacity-0 max-md:pointer-events-none md:translate-x-0 md:rtl:translate-x-0 rtl:md:translate-x-0 md:opacity-100 md:pointer-events-auto w-[52px] sm:w-[64px]"
          )}
        >
          <TooltipProvider>
            <nav
              className={cn(
                "flex flex-col gap-2.5 w-full ps-[5px] sm:ps-[11px] items-start transition-all duration-300",
                sidebarOpen ? "pe-3 sm:pe-4" : "pe-[5px] sm:pe-[11px]"
              )}
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id && !selectedProject;
                const label = isRtl ? item.labelFa : item.labelEn;

                const buttonElement = (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedProject(null);
                      setActiveTab(item.id);
                      if (typeof window !== "undefined" && window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={cn(
                      "group relative flex items-center rounded-full outline-none cursor-pointer select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shrink-0",
                      sidebarOpen ? "w-full h-[42px]" : "w-[42px] h-[42px]",
                      isActive
                        ? "bg-primary text-white border-primary shadow-xs ring-1 ring-primary/30"
                        : "bg-foreground/[0.03] hover:bg-foreground/[0.08] text-foreground/70 hover:text-foreground border border-border/30 hover:border-border/60"
                    )}
                    aria-label={label}
                  >
                    {/* Fixed 42px circle icon */}
                    <div className="size-[42px] shrink-0 flex items-center justify-center">
                      <Icon
                        className={cn(
                          "size-5 shrink-0 transition-colors duration-150",
                          isActive ? "text-white" : "text-foreground/60 group-hover:text-foreground"
                        )}
                      />
                    </div>

                    {/* Smooth horizontal expansion label */}
                    <span
                      className={cn(
                        "inline-block text-sm whitespace-nowrap truncate overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none",
                        isActive ? "font-semibold text-white" : "font-medium text-foreground/75 group-hover:text-foreground",
                        sidebarOpen
                          ? "opacity-100 max-w-[170px] pe-3 ps-1"
                          : "opacity-0 max-w-0 pe-0 ps-0 pointer-events-none"
                      )}
                    >
                      {label}
                    </span>
                  </button>
                );

                if (!sidebarOpen) {
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
                      <TooltipContent side={isRtl ? "left" : "right"} className="text-xs font-medium">
                        {label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return buttonElement;
              })}
            </nav>
          </TooltipProvider>
        </aside>

        {/* ── 3. Main Content Area ── */}
        <main className="flex-1 bg-transparent w-full relative z-10 px-4 sm:px-8 py-6 max-w-7xl mx-auto">
          {/* Header Action / Summary Toolbar */}
          {!selectedProject && (
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
                    <span>{isRtl ? "نقشه راه و مدیریت پروژه‌ها" : "Projects Roadmap & Workflow"}</span>
                    {isAdmin && (
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary font-semibold">
                        {isRtl ? "پنل مدیریت" : "Admin Panel"}
                      </Badge>
                    )}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {activeTab === "create"
                      ? isRtl
                        ? "فرم ساده ثبت و تعریف پروژه جدید همراه با زمان‌بندی و مستندات"
                        : "Simple project wizard with schedule breakdown and document uploads"
                      : isRtl
                      ? "رصد پیشرفت قراردادها، وضعیت فازهای مهندسی و ساخت، و کانبان پروژه‌ها"
                      : "Monitor contract progress, engineering DFA, fabrication, and deliverable status"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing || isLoading}
                    className="rounded-xl gap-2 text-xs h-9 cursor-pointer"
                  >
                    <RefreshCw className={cn("size-3.5", (isRefreshing || isLoading) && "animate-spin")} />
                    <span>{isRtl ? "به‌روزرسانی" : "Refresh"}</span>
                  </Button>

                  {activeTab !== "create" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedProject(null);
                        setActiveTab("create");
                      }}
                      className="rounded-xl gap-1.5 text-xs h-9 font-bold bg-primary text-white shadow-xs cursor-pointer"
                    >
                      <PlusCircle className="size-4" />
                      <span>{isRtl ? "پروژه جدید" : "New Project"}</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && !isRefreshing && (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <RefreshCw className="size-8 animate-spin text-primary" />
              <p className="text-sm font-medium">{isRtl ? "در حال دریافت اطلاعات پروژه‌ها..." : "Loading projects..."}</p>
            </div>
          )}

          {/* Error state */}
          {!isLoading && error && (
            <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3 my-4">
              <AlertCircle className="size-5 shrink-0" />
              <div className="flex-1 text-sm font-semibold">{error}</div>
              <Button variant="outline" size="sm" onClick={fetchProjects} className="rounded-xl">
                {isRtl ? "تلاش مجدد" : "Retry"}
              </Button>
            </div>
          )}

          {/* Main Views */}
          {!isLoading && !error && (
            <div>
              {selectedProject ? (
                <ProjectDetailView
                  project={selectedProject}
                  isAdmin={isAdmin}
                  onProjectUpdated={handleProjectUpdated}
                  onProjectDeleted={handleProjectDeleted}
                  onBack={() => setSelectedProject(null)}
                />
              ) : activeTab === "create" ? (
                <ProjectCreateWizard
                  currentUser={user || ({} as any)}
                  onProjectCreated={handleProjectCreated}
                  onCancel={() => setActiveTab("roadmap")}
                />
              ) : (
                <ProjectRoadmapView
                  projects={projects}
                  onSelectProject={(proj) => setSelectedProject(proj)}
                  onCreateNewClick={() => setActiveTab("create")}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
