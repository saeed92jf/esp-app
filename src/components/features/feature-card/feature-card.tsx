"use client";

import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { useAuthModal } from "@/modules/auth/hooks/use-auth-modal";

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
  borderClassName?: string;
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
  const { user } = useAuth();
  const { openModal } = useAuthModal();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      e.preventDefault();
      e.stopPropagation();
      openModal();
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={cn("group block h-full", className)}>
      <Card
        className={cn(
          "relative h-full overflow-hidden shadow-sm border border-border/50",
          borderClassName,
        )}
      >
        {cardBgClassName && (
          <span 
            className={cn(
              "absolute inset-0 z-0 pointer-events-none",
              cardBgClassName
            )} 
            aria-hidden="true" 
          />
        )}
        {barClassName && (
          <span
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 h-0.5 scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100",
              isRtl ? "origin-right" : "origin-left",
              barClassName,
            )}
          />
        )}

        <CardContent className="relative z-10 flex flex-col items-center gap-3 p-6 text-center">
          {Icon && (
            <span className="flex items-center justify-center mb-2 sm:mb-3">
              <Icon
                className={cn(
                  "size-12",
                  iconClassName ?? "text-muted-foreground",
                )}
                strokeWidth={1.5}
              />
            </span>
          )}

          <h3 className="text-lg font-semibold leading-tight">{title}</h3>

          {description && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}

          {badge && (
            <span className="text-xs text-muted-foreground">{badge}</span>
          )}

          {cta && (
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100">
              {cta}
              <ArrowRight className={cn("size-4", isRtl && "rotate-180")} />
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
