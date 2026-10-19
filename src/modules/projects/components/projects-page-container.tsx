// src/modules/projects/components/projects-page-container.tsx
"use client";

import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ProjectsListPage } from "./projects-list-page";
import { ProjectWorkspacePage } from "./workspace/project-workspace-page";

export function ProjectsPageContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const projectId = searchParams.get("id");
  const tab = searchParams.get("tab") as any;

  const handleSelectProject = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("id", id);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground fa-num">
      <div className="container mx-auto py-6 px-4 md:px-6">
        {projectId ? (
          <ProjectWorkspacePage
            projectId={projectId}
            initialTab={tab || "overview"}
          />
        ) : (
          <ProjectsListPage onSelectProject={handleSelectProject} />
        )}
      </div>
    </div>
  );
}
