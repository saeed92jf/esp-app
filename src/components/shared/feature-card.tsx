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
  barClassName?: string;
  ringClassName?: string;
  isRtl?: boolean;
  className?: string;
  /** Remove the card border when true. */
  noBorder?: boolean;
  /** Icon badge corner radius: 'xl' (default square-ish) or 'full' (circle). */
  iconRounded?: "xl" | "full";
}

export function FeatureCard({
  href,
  icon: Icon,
  title,
  description,
  cta,
  badge,
  iconClassName,
  barClassName,
  ringClassName,
  isRtl = false,
  className,
  noBorder = false,
  iconRounded = "xl",
}: FeatureCardProps) {
  return (
    <Link href={href} className={cn("group block h-full", className)}>
      <Card
        className={cn(
          "relative h-full overflow-hidden shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none",
          noBorder ? "border-transparent" : "border-border/50",
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
                "bg-muted ring-border/50 flex size-12 items-center justify-center ring-1 transition-all duration-300 ease-out",
                "group-hover:scale-105 group-hover:ring-2",
                "motion-reduce:transform-none motion-reduce:transition-none",
                iconRounded === "full" ? "rounded-full" : "rounded-xl",
                ringClassName,
              )}
            >
              <Icon className={cn("size-6", iconClassName)} strokeWidth={2} />
            </span>
          )}

          <h3 className="text-sm leading-tight font-semibold">{title}</h3>

          {description && (
            <p className="text-muted-foreground text-xs leading-relaxed">
              {description}
            </p>
          )}

          {badge && (
            <span className="text-muted-foreground text-xs">{badge}</span>
          )}

          {cta && (
            <span className="text-primary mt-1 inline-flex items-center gap-1 text-sm font-medium opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100">
              {cta}
              <ArrowRight className={cn("size-4", isRtl && "rotate-180")} />
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
