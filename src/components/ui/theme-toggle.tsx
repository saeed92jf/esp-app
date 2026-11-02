"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { HEADER_ICON_BUTTON_CLASS, HEADER_ICON_CLASS } from "@/lib/constants";
import { SunDim, MoonStars } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const tHeader = useTranslations("Header");
  const isDark = mounted && resolvedTheme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            HEADER_ICON_BUTTON_CLASS,
            "relative group cursor-pointer select-none",
            className
          )}
          onClick={handleToggle}
          aria-label="Toggle Dark Mode"
        >
          <div className="relative flex items-center justify-center w-full h-full pointer-events-none">
            <SunDim
              weight="duotone"
              className={cn(
                "absolute transition-all duration-300 ease-out",
                HEADER_ICON_CLASS,
                isDark
                  ? "opacity-0 scale-50 -rotate-90"
                  : "opacity-100 scale-100 rotate-0"
              )}
            />
            <MoonStars
              weight="duotone"
              className={cn(
                "absolute transition-all duration-300 ease-out",
                HEADER_ICON_CLASS,
                isDark
                  ? "opacity-100 scale-100 rotate-0"
                  : "opacity-0 scale-50 rotate-90"
              )}
            />
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        {tHeader("theme")}
      </TooltipContent>
    </Tooltip>
  );
}
