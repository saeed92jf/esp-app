"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { HEADER_ICON_BUTTON_CLASS, HEADER_ICON_CLASS } from "@/lib/constants";
import { SunDim, MoonStars } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <button className={cn(HEADER_ICON_BUTTON_CLASS, className)} />;
  }

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  return (
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
              ? "opacity-0 scale-50 -rotate-90 group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-0"
              : "opacity-100 scale-100 rotate-0 group-hover:opacity-0 group-hover:scale-50 group-hover:-rotate-90"
          )}
        />
        <MoonStars
          weight="duotone"
          className={cn(
            "absolute transition-all duration-500 ease-out",
            HEADER_ICON_CLASS,
            isDark
              ? "opacity-100 scale-100 rotate-0 group-hover:opacity-0 group-hover:scale-50 group-hover:rotate-90"
              : "opacity-0 scale-50 rotate-90 group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-0"
          )}
        />
      </div>
    </button>
  );
}
