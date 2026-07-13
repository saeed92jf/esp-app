import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerSize = "default" | "wide" | "narrow";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  size?: ContainerSize;
};

type FullWidthProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

const containerSizeClasses: Record<ContainerSize, string> = {
  narrow: "max-w-3xl",
  default: "max-w-7xl",
  wide: "max-w-screen-2xl",
};

/**
 * Standard constrained layout container used across the project.
 * It keeps content aligned with a single horizontal rhythm and
 * provides responsive inline paddings for mobile, tablet, and desktop.
 */
export function Container({
  children,
  className,
  size = "default",
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        containerSizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Full-width wrapper for sections that must span the viewport width,
 * such as hero canvases, visual flows, banners, and background-heavy blocks.
 */
export function FullWidth({ children, className, ...props }: FullWidthProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      {children}
    </div>
  );
}
