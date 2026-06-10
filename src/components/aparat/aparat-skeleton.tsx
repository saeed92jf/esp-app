"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AparatSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Generic skeleton component used across Aparat UI.
 * Accepts all standard div props including className.
 */
export function AparatSkeleton({ className, ...props }: AparatSkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}
