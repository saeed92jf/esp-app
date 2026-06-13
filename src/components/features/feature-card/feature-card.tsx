"use client";

import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  href: string;
  icon?: LucideIcon;
  title: string;
  description?: string;
  cta?: string;
  badge?: string;
  iconClassName?: string;
  iconBgClassName?: string;
  cardBgClassName?: string;
  barClassName?: string;
  borderClassName?: string; // ← جایگزین ringClassName
  isRtl?: boolean;
  className?: string;
}

export function FeatureCard({
  href,
  icon: Icon,
  title,
  description,
  cta,
  badge,
  iconClassName,
  iconBgClassName,
  cardBgClassName,
  barClassName,
  borderClassName,
  isRtl = false,
  className,
}: FeatureCardProps) {
  return (
    <Link href={href} className={cn("group block h-full", className)}>
      <Card
        className={cn(
          "relative h-full overflow-hidden shadow-sm",
          "border border-border/50 transition-[border-color,background-color,box-shadow,transform] duration-300 ease-out",
          "hover:shadow-lg",
          "motion-reduce:transform-none motion-reduce:transition-none",
          cardBgClassName,
          borderClassName,
        )}
      >
        {barClassName && (
          <span
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 h-0.5 scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100",
              isRtl ? "origin-right" : "origin-left",
              barClassName,
            )}
          />
        )}

        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          {Icon && (
            <span
              className={cn(
                "flex size-12 items-center justify-center rounded-xl",
                "ring-1 ring-border/50 transition-all duration-300 ease-out",
                "group-hover:scale-105 group-hover:ring-0",
                "motion-reduce:transform-none motion-reduce:transition-none",
                // bg: "bg-muted group-hover:bg-sky-500"
                iconBgClassName ?? "bg-muted",
              )}
            >
              <Icon
                className={cn(
                  "size-6 transition-colors duration-300",
                  // "text-sky-500 group-hover:text-white"
                  iconClassName ?? "text-muted-foreground",
                )}
                strokeWidth={2}
              />
            </span>
          )}

          <h3 className="text-lg font-semibold leading-tight">{title}</h3>

          {description && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}

          {/* badge */}
          {badge && (
            <span className="text-xs text-muted-foreground">{badge}</span>
          )}

          {cta && (
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100">
              {cta}
              <ArrowRight className={cn("size-4", isRtl && "rotate-180")} />
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
