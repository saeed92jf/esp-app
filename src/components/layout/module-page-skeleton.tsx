import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ModulePageSkeletonProps {
  hasSidebar?: boolean;
}

export function ModulePageSkeleton({ hasSidebar = true }: ModulePageSkeletonProps) {
  return (
    <div className="min-h-screen flex flex-col bg-panel dark:bg-background overflow-hidden animate-in fade-in duration-150">
      {/* Header Skeleton matching AppHeader height and structure */}
      <header className="h-[var(--header-height,64px)] border-b border-border/40 px-4 sm:px-6 flex items-center justify-between shrink-0 bg-panel/80 dark:bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="size-9 rounded-full ms-2" />
        </div>
      </header>

      {/* Body Skeleton */}
      <div className="flex-1 flex min-h-0">
        {hasSidebar && (
          <aside className="w-14 sm:w-16 border-e border-border/20 py-4 px-2 flex flex-col items-center gap-3 shrink-0">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="size-10 rounded-full" />
          </aside>
        )}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 rounded-full" />
              <Skeleton className="h-9 w-28 rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-44 rounded-2xl" />
          </div>
        </main>
      </div>
    </div>
  );
}

