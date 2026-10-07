import React from "react";
import type {
  Icon as PhosphorIcon,
  IconProps as PhosphorIconProps,
  IconWeight,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/**
 * Global default weight for all module/app icons.
 * "duotone" renders a soft 20%-opacity tinted body + crisp outline,
 * and works seamlessly with the module gradient fills (resolveNavIconGradient).
 */
export const APP_ICON_DEFAULT_WEIGHT: IconWeight = "duotone";

export interface AppIconProps extends Omit<PhosphorIconProps, "ref"> {
  icon?: PhosphorIcon | null;
  /** @deprecated use `weight` instead. `solid={false}` maps to "regular". */
  solid?: boolean;
}

/**
 * A central wrapper for module/app icons.
 * Defaults to APP_ICON_DEFAULT_WEIGHT to maintain consistency across the site.
 */
export function AppIcon({ icon: Icon, className, solid, weight, ...props }: AppIconProps) {
  if (!Icon) return null;

  const resolvedWeight: IconWeight =
    weight ?? (solid === false ? "regular" : solid === true ? "fill" : APP_ICON_DEFAULT_WEIGHT);

  return (
    <Icon
      className={cn("shrink-0", className)}
      weight={resolvedWeight}
      {...props}
    />
  );
}
