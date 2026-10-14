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
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  const tHeader = useTranslations("Header");

  if (!mounted) {
    return <button className={cn(HEADER_ICON_BUTTON_CLASS, className)} />;
  }

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
      className={cn(HEADER_ICON_BUTTON_CLASS, "relative group", className)}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle Dark Mode"
    >
      <div className="relative flex items-center justify-center w-full h-full">
        <SunDim
          weight="duotone"
          className={cn(
            "absolute transition-all duration-500 ease-out",
            HEADER_ICON_CLASS,
            isDark
              ? "opacity-0 scale-50 -rotate-90"
              : "opacity-100 scale-100 rotate-0"
          )}
        />
        <MoonStars
          weight="duotone"
          className={cn(
            "absolute transition-all duration-500 ease-out",
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
    </TooltipProvider>
  );
}
