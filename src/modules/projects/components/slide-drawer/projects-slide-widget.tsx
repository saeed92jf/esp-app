// src/modules/projects/components/slide-drawer/projects-slide-widget.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useProjects } from "../../hooks/use-projects";
import {
  FolderKanban,
  ArrowLeft,
  ExternalLink,
  Plus,
  Send,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function ProjectsSlideWidget() {
  const t = useTranslations("Projects");
  const router = useRouter();
  const { projects, isLoading } = useProjects();

  return (
    <div className="space-y-4 fa-num">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <FolderKanban className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">
            {t("title")}
          </h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1"
          onClick={() => router.push("/fa/dashboard/projects")}
        >
          <span>مدیریت کامل</span>
          <ArrowLeft className="w-3 h-3" />
        </Button>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            در حال بارگذاری پروژه‌ها...
          </div>
        ) : (
          projects.slice(0, 4).map((project) => (
            <div
              key={project.id}
              onClick={() =>
                router.push(`/fa/dashboard/projects?id=${project.id}`)
              }
              className="p-3 rounded-xl border border-border/60 bg-card/50 hover:bg-card hover:border-primary/40 transition-colors cursor-pointer space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="font-semibold text-xs text-foreground line-clamp-1">
                    {project.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-muted-foreground" />
                    <span>{project.clientName}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] border-primary/20 text-primary">
                  {project.organization}
                </Badge>
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">پیشرفت:</span>
                  <span className="font-semibold text-foreground fa-num">
                    %{project.progressPercent}
                  </span>
                </div>
                <Progress value={project.progressPercent} className="h-1.5" />
              </div>

              {/* Footer info */}
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/30">
                <span className="font-mono">{project.code}</span>
                <span className="flex items-center gap-1 text-primary hover:underline">
                  <span>ورود به فضای کار</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <Button
        className="w-full text-xs h-8 gap-1.5 font-medium"
        onClick={() => router.push("/fa/dashboard/projects")}
      >
        <FolderKanban className="w-3.5 h-3.5" />
        <span>مشاهده همه پروژه‌ها و ترنسمیتال‌ها</span>
      </Button>
    </div>
  );
}
