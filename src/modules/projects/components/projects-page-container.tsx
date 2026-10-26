// src/modules/projects/components/projects-page-container.tsx
"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  FolderKanban,
  TrendingUp,
  PlusCircle,
  Building2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  FileText,
  Layers,
  Kanban,
  Send,
  AlertTriangle,
  Compass,
  Target,
  BarChart3,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProjectsListPage, type ProjectsListTab } from "./projects-list-page";
import { ProjectWorkspacePage } from "./workspace/project-workspace-page";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  labelFa: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function ProjectsPageContainer() {
  const t = useTranslations("Projects");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const projectId = searchParams?.get("id");
  const activeWorkspaceTab = (searchParams?.get("tab") as any) || "overview";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeListTab, setActiveListTab] = useState<ProjectsListTab>("projects");

  // When clicking on a project in the list
  const handleSelectProject = (id: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.set("id", id);
    params.set("tab", "overview");
    router.push(`${pathname}?${params.toString()}`);
  };

  // When returning from workspace to all projects
  const handleBackToProjects = () => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.delete("id");
    params.delete("tab");
    router.push(`${pathname}?${params.toString()}`);
  };

  // When clicking a tab inside workspace
  const handleWorkspaceTabChange = (newTab: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.set("tab", newTab);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Nav Items for Projects List View
  const listNavItems: NavItem[] = [
    {
      id: "projects",
      labelFa: "پروژه‌ها و گردش کار",
      labelEn: "Projects & Workflow",
      icon: FolderKanban,
    },
    {
      id: "analytics",
      labelFa: "نقشه راه و آنالیز",
      labelEn: "Roadmap & Analytics",
      icon: TrendingUp,
    },
    {
      id: "create",
      labelFa: "تعریف پروژه",
      labelEn: "New Project",
      icon: PlusCircle,
    },
    {
      id: "companies",
      labelFa: "تفکیک شرکتی",
      labelEn: "Company Portfolio",
      icon: Building2,
    },
    {
      id: "settings",
      labelFa: "نقش و پرسپکتیو",
      labelEn: "Role & Perspective",
      icon: ShieldCheck,
    },
  ];

  // Nav Items when inside a Project Workspace
  const workspaceNavItems: NavItem[] = [
    {
      id: "back",
      labelFa: "بازگشت به پروژه‌ها",
      labelEn: "Back to Projects",
      icon: isRtl ? ArrowRight : ArrowLeft,
    },
    {
      id: "overview",
      labelFa: "شناسنامه پروژه",
      labelEn: "Overview",
      icon: FileText,
    },
    {
      id: "phases",
      labelFa: "فازها و WBS",
      labelEn: "WBS & Phases",
      icon: Layers,
    },
    {
      id: "boards",
      labelFa: "تخته و وظایف",
      labelEn: "Boards & Tasks",
      icon: Kanban,
    },
    {
      id: "vdis",
      labelFa: "اسناد مهندسی VDIS",
      labelEn: "VDIS Documents",
      icon: Send,
    },
    {
      id: "risks",
      labelFa: "ریسک‌ها و مسایل",
      labelEn: "Risks & Issues",
      icon: AlertTriangle,
    },
    {
      id: "roadmap",
      labelFa: "نقشه راه Miro",
      labelEn: "Miro Roadmap",
      icon: Compass,
    },
    {
      id: "strategic",
      labelFa: "اهداف استراتژیک OKRs",
      labelEn: "Strategic OKRs",
      icon: Target,
    },
    {
      id: "reports",
      labelFa: "گزارشات و KPI",
      labelEn: "Reports & KPIs",
      icon: BarChart3,
    },
  ];

  const currentNavItems = projectId ? workspaceNavItems : listNavItems;

  const handleNavClick = (itemId: string) => {
    if (projectId) {
      if (itemId === "back") {
        handleBackToProjects();
      } else {
        handleWorkspaceTabChange(itemId);
      }
    } else {
      setActiveListTab(itemId as ProjectsListTab);
    }
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-var(--header-height,0px))] bg-panel dark:bg-background font-sans w-full relative fa-num">
      {/* ── 1. Top Unified Header (AppHeader with tag="projects" and subTag) ── */}
      <AppHeader
        tag="projects"
        subTag={projectId ? (activeWorkspaceTab || "overview") : undefined}
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

        {/* ── 2. Unified Expandable Sidebar Navigation (matching Tasks layout) ── */}
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
              {currentNavItems.map((item: NavItem) => {
                const Icon = item.icon;
                const isActive = projectId
                  ? item.id !== "back" && activeWorkspaceTab === item.id
                  : activeListTab === item.id;
                const label = isRtl ? item.labelFa : item.labelEn;

                const buttonElement = (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      "group relative flex items-center rounded-full outline-none cursor-pointer select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shrink-0",
                      sidebarOpen ? "w-full h-[42px]" : "w-[42px] h-[42px]",
                      isActive
                        ? "bg-primary text-white border-primary shadow-xs ring-1 ring-primary/30"
                        : "bg-foreground/[0.03] hover:bg-foreground/[0.08] text-foreground/70 hover:text-foreground border border-border/30 hover:border-border/60"
                    )}
                    aria-label={label}
                  >
                    {/* Fixed 42px circle icon aligned with header button */}
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
        <main className="flex-1 bg-transparent w-full relative z-10 px-3 sm:px-6">
          <div className="pb-10 max-w-7xl mx-auto w-full">
            {projectId ? (
              <ProjectWorkspacePage
                projectId={projectId}
                initialTab={activeWorkspaceTab}
                activeTab={activeWorkspaceTab}
                onTabChange={handleWorkspaceTabChange}
                onBackToProjects={handleBackToProjects}
              />
            ) : (
              <ProjectsListPage
                onSelectProject={handleSelectProject}
                activeTab={activeListTab}
                onTabChange={setActiveListTab}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
