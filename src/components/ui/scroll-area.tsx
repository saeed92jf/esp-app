"use client"

import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function ScrollArea({
  className,
  children,
  viewportRef,
  onViewportScroll,
  viewportClassName,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  viewportRef?: React.Ref<HTMLDivElement>;
  onViewportScroll?: React.UIEventHandler<HTMLDivElement>;
  viewportClassName?: string;
}) {
  const innerViewportRef = React.useRef<HTMLDivElement>(null);

  const handleViewportRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      (innerViewportRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof viewportRef === "function") {
        viewportRef(node);
      } else if (viewportRef && "current" in viewportRef) {
        (viewportRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [viewportRef]
  );

  const handleWheel = React.useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      const vp = innerViewportRef.current;
      if (vp && vp.scrollHeight > vp.clientHeight) {
        if (!vp.contains(e.target as Node) && e.deltaY !== 0) {
          vp.scrollTop += e.deltaY;
        }
      }
    },
    []
  );

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative flex flex-col min-h-0", className)}
      onWheel={handleWheel}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={handleViewportRef}
        onScroll={onViewportScroll}
        data-slot="scroll-area-viewport"
        className={cn(
          "size-full flex-1 min-h-0 max-h-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1",
          viewportClassName
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        "data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:border-t data-[orientation=horizontal]:border-t-transparent",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5 data-[orientation=vertical]:border-s data-[orientation=vertical]:border-s-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-border"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
