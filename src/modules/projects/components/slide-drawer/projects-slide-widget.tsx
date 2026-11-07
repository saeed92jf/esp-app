// src/modules/projects/components/slide-drawer/projects-slide-widget.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  FolderKanban,
  ArrowLeft,
  ExternalLink,
  Plus,
  Building2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { simplifiedProjectsService } from "../../services/simplified-projects.service";
import type { SimplifiedProject } from "../../types/simplified-projects.types";

export function ProjectsSlideWidget() {
  const t = useTranslations("Projects");
  const router = useRouter();

  const [projects, setProjects] = useState<SimplifiedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await simplifiedProjectsService.getProjects();
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects in ProjectsSlideWidget:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();

    const handleSync = () => {
      fetchProjects();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("esp_projects_change", handleSync);
      window.addEventListener("storage", handleSync);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("esp_projects_change", handleSync);
        window.removeEventListener("storage", handleSync);
      }
    };
  }, [fetchProjects]);

  return (
    <div className="space-y-4 fa-num">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <FolderKanban className="size-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">
            پروژه‌ها و قراردادها
          </h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1 cursor-pointer"
          onClick={() => router.push("/projects")}
        >
          <span>مدیریت کامل</span>
          <ArrowLeft className="size-3 rtl:rotate-180" />
        </Button>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <RefreshCw className="size-3.5 animate-spin text-primary" />
            <span>در حال بارگذاری پروژه‌ها...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            هیچ پروژه‌ای تعریف نشده است.
          </div>
        ) : (
          projects.slice(0, 5).map((project) => (
            <div
              key={project.id}
              onClick={() => router.push(`/projects?id=${project.id}`)}
              className="p-3 rounded-xl border border-border/60 bg-white dark:bg-card hover:bg-white dark:hover:bg-card shadow-2xs hover:border-primary/40 transition-colors cursor-pointer space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="font-semibold text-xs text-foreground line-clamp-1">
                    {project.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Building2 className="size-3 text-muted-foreground/70" />
                    <span className="truncate">{project.client}</span>
                  </div>
                </div>
                {project.category && (
                  <Badge variant="outline" className="text-[9px] border-primary/20 text-primary shrink-0">
                    {project.category}
                  </Badge>
                )}
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground text-[10px]">پیشرفت:</span>
                  <span className="font-semibold text-foreground fa-num text-xs">
                    %{project.progressPercentage}
                  </span>
                </div>
                <Progress value={project.progressPercentage} className="h-1.5" />
              </div>

              {/* Footer info */}
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/30">
                <span className="font-mono text-[10px] bg-muted/40 px-1.5 py-0.5 rounded border border-border/30">
                  {project.espNumber}
                </span>
                <span className="flex items-center gap-1 text-primary hover:underline font-medium">
                  <span>ورود به فضای کار</span>
                  <ExternalLink className="size-2.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <Button
        className="w-full text-xs h-8 gap-1.5 font-medium cursor-pointer"
        onClick={() => router.push("/projects")}
      >
        <FolderKanban className="size-3.5" />
        <span>مشاهده همه پروژه‌ها و ترنسمیتال‌ها</span>
      </Button>
    </div>
  );
}
