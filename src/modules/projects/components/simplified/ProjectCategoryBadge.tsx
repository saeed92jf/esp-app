// src/modules/projects/components/simplified/ProjectCategoryBadge.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { ProjectCategory } from "../../types/simplified-projects.types";

interface CategoryIconProps {
  className?: string;
  category: ProjectCategory | string;
}

export function ProjectCategoryIcon({ category, className = "size-6" }: CategoryIconProps) {
  switch (category) {
    case "COLUMN INT.":
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Column with Dome and Trays */}
          <path d="M16 14C16 9.58 19.58 6 24 6C28.42 6 32 9.58 32 14V38H16V14Z" />
          <path d="M16 38L12 42M32 38L36 42" />
          <path d="M20 18H28M20 24H28M20 30H28" />
          <path d="M24 6V3" />
        </svg>
      );

    case "SEPARATOR INT.":
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Horizontal Separator Vessel */}
          <path d="M12 16H36C40.42 16 44 19.58 44 24C44 28.42 40.42 32 36 32H12C7.58 32 4 28.42 4 24C4 19.58 7.58 16 12 16Z" />
          <path d="M14 32V38M34 32V38" />
          <path d="M10 38H18M30 38H38" />
          <path d="M24 16V10M20 10H28" />
          <path d="M20 24H28" strokeDasharray="2 2" />
        </svg>
      );

    case "FILTRATION":
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Wedge Wire / Filter Screen with Flow Arrows */}
          <path d="M18 8V40M24 8V40" />
          <path d="M12 14L8 16M12 24L8 24M12 34L8 32" />
          <path d="M30 16L38 16M38 16L34 12M38 16L34 20" />
          <path d="M30 32L38 32M38 32L34 28M38 32L34 36" />
          <circle cx="10" cy="12" r="1.5" fill="currentColor" />
          <circle cx="10" cy="28" r="1.5" fill="currentColor" />
          <circle cx="14" cy="20" r="1.5" fill="currentColor" />
        </svg>
      );

    case "REACTOR INT.":
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Vertical Reactor Vessel with Catalyst Bed */}
          <path d="M14 16C14 11 18.5 7 24 7C29.5 7 34 11 34 16V36C34 38 32 40 29 41H19C16 40 14 38 14 36V16Z" />
          <path d="M24 7V4M20 4H28" />
          <path d="M14 26H34" strokeDasharray="3 2" />
          <path d="M14 32H34" />
          <path d="M14 36L10 43M34 36L38 43" />
        </svg>
      );

    case "SPECIAL ITEMS":
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Special Equipment / Heat Exchanger / Tower */}
          <path d="M12 12C12 9 15 7 18 7H22C25 7 28 9 28 12V39H12V12Z" />
          <path d="M28 20H38V34H28" />
          <circle cx="33" cy="27" r="4" strokeDasharray="3 2" />
          <path d="M8 39H32" />
          <path d="M18 16H22M18 24H22M18 32H22" />
        </svg>
      );

    case "MISCELLANEOUS":
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Piping Spool / Flanged Cross Section */}
          <path d="M18 8H30V40H18V8Z" />
          <path d="M12 18H18V30H12V18Z" />
          <path d="M18 14L30 26M30 14L18 26M18 28L30 40M30 28L18 40" strokeWidth="1.5" />
          <path d="M16 6H32M16 42H32M10 16V32" />
        </svg>
      );

    case "PROCESSING PKG.":
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Dual Vessel Processing Skid Package */}
          <path d="M8 14C8 10 11 8 15 8C19 8 22 10 22 14V36H8V14Z" />
          <path d="M26 14C26 10 29 8 33 8C37 8 40 10 40 14V36H26V14Z" />
          <path d="M22 22H26M22 30H26" />
          <path d="M5 40H43" strokeWidth="2.8" />
          <path d="M38 18H44V26H40" />
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      );
  }
}

interface ProjectCategoryBadgeProps {
  category: ProjectCategory | string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProjectCategoryBadge({
  category,
  size = "md",
  className,
}: ProjectCategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-bold tracking-tight rounded-xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 select-none",
        size === "sm" && "text-[10px] px-2 py-0.5",
        size === "md" && "text-xs px-2.5 py-1",
        size === "lg" && "text-sm px-3.5 py-1.5",
        className
      )}
    >
      <ProjectCategoryIcon
        category={category}
        className={cn(
          size === "sm" && "size-3.5",
          size === "md" && "size-4",
          size === "lg" && "size-5"
        )}
      />
      <span>{category}</span>
    </span>
  );
}
