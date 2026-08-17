"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Check, Monitor, Moon, Sun, Palette, User } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

import { cn } from "@/lib/utils";
import { PRIMARY_COLORS } from "@/config/settings";
import { usePrimaryColor } from "@/hooks/use-primary-color";

const MODE_OPTIONS = [
  { value: "system", labelKey: "system", icon: Monitor },
  { value: "user", labelKey: "user", icon: User },
] as const;

const THEME_OPTIONS = [
  { value: "light", labelKey: "light", icon: Sun },
  { value: "dark", labelKey: "dark", icon: Moon },
] as const;

export function SettingsSection() {
  const t = useTranslations("Settings");
  const tColors = useTranslations("Settings.colors");
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { colorId, setColor } = usePrimaryColor();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const mode = theme === "system" ? "system" : "user";

  const handleModeChange = (newMode: "system" | "user") => {
    if (newMode === "system") {
      setTheme("system");
    } else {
      setTheme(resolvedTheme || "light");
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    if (mode === "system") {
      toast.info(t("themeLocked"));
      return;
    }
    setTheme(newTheme);
  };

  return (
    <div className="space-y-5">
      {/* ---- Mode switcher ---- */}
      <div className="space-y-2">
        <p className="text-[11px] font-medium text-muted-foreground">{t("mode")}</p>
        <div className="relative flex bg-muted/40 p-1 rounded-xl items-center">
          {MODE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = mounted && mode === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleModeChange(opt.value)}
                className={cn(
                  "relative flex-1 flex items-center justify-center gap-1.5 h-8 text-xs font-semibold rounded-lg z-10 transition-colors",
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="settings-mode-active"
                    className="absolute inset-0 bg-primary rounded-lg -z-10 shadow-sm"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <Icon className="size-3.5" />
                <span>{t(opt.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- Theme switcher ---- */}
      <div className={cn("space-y-2 transition-opacity", mode === "system" && "opacity-50 grayscale pointer-events-none")}>
        <p className="text-[11px] font-medium text-muted-foreground">{t("theme")}</p>
        <div className="relative flex bg-muted/40 p-1 rounded-xl items-center">
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = mounted && resolvedTheme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleThemeChange(opt.value)}
                className={cn(
                  "relative flex-1 flex items-center justify-center gap-1.5 h-8 text-xs font-semibold rounded-lg z-10 transition-colors",
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="settings-theme-active"
                    className="absolute inset-0 bg-primary rounded-lg -z-10 shadow-sm"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <Icon className="size-3.5" />
                <span>{t(opt.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- Primary color swatches (Modern Hover Panel) ---- */}
      <div className="pt-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-3">
          <Palette className="size-3.5" />
          <span>{t("color")}</span>
        </div>
        
        <div className="flex w-full h-16 rounded-xl overflow-hidden bg-muted/20 border border-border/50">
          {PRIMARY_COLORS.map((preset) => {
            const active = colorId === preset.id;
            return (
              <motion.button
                key={preset.id}
                type="button"
                onClick={() => setColor(preset.id)}
                initial="initial"
                animate="animate"
                whileHover="hover"
                variants={{
                  initial: { flex: 1 },
                  animate: { flex: 1 },
                  hover: { flex: 4 }
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ backgroundColor: preset.hex }}
                className="relative h-full flex flex-col items-center justify-center overflow-hidden shrink-0 cursor-pointer transition-colors"
              >
                {active && (
                  <div className="absolute bg-black/15 inset-0 pointer-events-none" />
                )}
                <motion.div 
                  variants={{
                    initial: { opacity: 0 },
                    animate: { opacity: 0 },
                    hover: { opacity: 1, transition: { delay: 0.1, duration: 0.2 } }
                  }}
                  className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-1"
                >
                  <span className="text-xs font-bold text-white drop-shadow-md whitespace-nowrap">
                    {tColors(preset.labelKey)}
                  </span>
                  <span className="text-[10px] font-semibold text-white/95 drop-shadow-md whitespace-nowrap uppercase tracking-wider mt-0.5">
                    {preset.hex}
                  </span>
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
