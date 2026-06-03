'use client';

import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  /** Destination route for the card. */
  href: string;
  /** Optional leading icon. */
  icon?: LucideIcon;
  /** Main title (already-translated string). */
  title: string;
  /** Optional supporting description (already-translated string). */
  description?: string;
  /** Optional call-to-action label that fades in on hover. */
  cta?: string;
  /** Optional small hint badge (e.g. "login required"). */
  badge?: string;
  /** Tailwind color class for the icon, e.g. "text-blue-500". */
  iconClassName?: string;
  /** Tailwind color class for the top accent bar, e.g. "bg-blue-500". */
  barClassName?: string;
  /** Hover ring color class, e.g. "group-hover:ring-blue-500/40". */
  ringClassName?: string;
  /** RTL flag: flips the CTA arrow and the accent-bar wipe origin. */
  isRtl?: boolean;
  /** Extra classes for the outer link wrapper (used to control width). */
  className?: string;
}

/**
 * FeatureCard — a minimal, engineering-style navigation card.
 *
 * Shared across the Home and Welcome pages to keep the UX consistent.
 * Visuals: neutral square icon badge, soft border + shadow, a thin top
 * accent bar that wipes in on hover, and an optional CTA that fades in.
 * The hover lift is intentionally tiny (-0.5) for a precise, calm feel.
 */
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
}: FeatureCardProps) {
  return (
    <Link href={href} className={cn('group block h-full', className)}>
      <Card className="border-border/50 relative h-full overflow-hidden shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none">
        {/* Engineering accent: a thin top bar that wipes in from the start
            edge on hover. The origin flips for RTL so it grows correctly. */}
        {barClassName && (
          <span
            className={cn(
              'pointer-events-none absolute inset-x-0 top-0 h-0.5 scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100',
              isRtl ? 'origin-right' : 'origin-left',
              barClassName,
            )}
          />
        )}

        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          {/* Neutral square badge; only the icon itself carries color.
              Subtle scale + ring on hover for a tactile, precise feel. */}
          {Icon && (
            <span
              className={cn(
                'bg-muted ring-border/50 flex size-12 items-center justify-center rounded-xl ring-1 transition-all duration-300 ease-out',
                'group-hover:scale-105 group-hover:ring-2',
                'motion-reduce:transform-none motion-reduce:transition-none',
                ringClassName,
              )}
            >
              <Icon className={cn('size-6', iconClassName)} strokeWidth={2} />
            </span>
          )}

          {/* Title — small and balanced. */}
          <h3 className="text-sm leading-tight font-semibold">{title}</h3>

          {/* Optional description — rendered only when provided. */}
          {description && (
            <p className="text-muted-foreground text-xs leading-relaxed">
              {description}
            </p>
          )}

          {/* Optional hint badge (e.g. access requirement). */}
          {badge && (
            <span className="text-muted-foreground text-xs">{badge}</span>
          )}

          {/* Optional CTA — opacity-only fade keeps the motion minimal. */}
          {cta && (
            <span className="text-primary mt-1 inline-flex items-center gap-1 text-sm font-medium opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100">
              {cta}
              <ArrowRight className={cn('size-4', isRtl && 'rotate-180')} />
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
