"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function TooltipProvider({
  delayDuration = 200,
  skipDelayDuration = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  React.useEffect(() => {
    // Globally suppress browser native tooltips by removing title attribute on mouseover
    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.("[title]");
      if (target && target.hasAttribute("title")) {
        const titleVal = target.getAttribute("title");
        if (titleVal) {
          target.setAttribute("data-native-title", titleVal);
          target.removeAttribute("title");
        }
      }
    };

    document.addEventListener("mouseover", handleMouseOver, {
      capture: true,
      passive: true,
    });

    return () => {
      document.removeEventListener("mouseover", handleMouseOver, {
        capture: true,
      });
    };
  }, []);

  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      {...props}
    >
      {children}
    </TooltipPrimitive.Provider>
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 8,
  showArrow = false,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & { showArrow?: boolean }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-[200] overflow-hidden rounded-md bg-neutral-900/95 dark:bg-neutral-950/95 text-white font-medium backdrop-blur-md px-2.5 py-1 text-xs border border-white/10 shadow-lg select-none",
          className
        )}
        {...props}
      >
        {children}
        {showArrow && (
          <TooltipPrimitive.Arrow className="fill-neutral-900 stroke-white/10 z-50 size-2.5" />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
