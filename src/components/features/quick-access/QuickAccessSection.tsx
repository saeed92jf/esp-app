"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { useQuickAccess, QUICK_ACCESS_MAX } from "@/hooks/use-quick-access";
import { NAVIGATION, type NavColor } from "@/config/navigation";
import { GoogleShortcutTile } from "./GoogleShortcutTile";
import { GoogleAddShortcutTile } from "./GoogleAddShortcutTile";
import { GoogleShortcutModal } from "./GoogleShortcutModal";
import { cn } from "@/lib/utils";

interface QuickAccessSectionProps {
  className?: string;
  maxItems?: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
};

export function QuickAccessSection({
  className,
  maxItems = QUICK_ACCESS_MAX,
}: QuickAccessSectionProps) {
  const tItems = useTranslations("Menu.items");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    items,
    hydrated,
    isSelected,
    isFull,
    toggle,
    removeShortcut,
    reset,
    selectedHrefs,
  } = useQuickAccess();

  return (
    <section
      aria-label="Quick Access Shortcuts"
      className={cn("w-full max-w-3xl mx-auto select-none", className)}
    >
      {/* Grid / Flex Layout matching Google Chrome Shortcuts */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3.5">
        {!hydrated ? (
          /* Skeletons matching exact Google tile structure */
          Array.from({ length: 5 }).map((_, i) => {
            const isMobileHidden = i >= 3;
            return (
              <motion.div
                key={i}
                variants={fadeUp}
                className={cn(
                  "flex flex-col items-center justify-start w-[72px] sm:w-[96px] h-[84px] sm:h-[104px] p-1.5 sm:p-2 rounded-2xl animate-pulse",
                  isMobileHidden && "hidden sm:flex"
                )}
              >
                <div className="size-10 sm:size-11 rounded-full bg-muted/60" />
                <div className="mt-1.5 sm:mt-2.5 h-3 w-14 rounded-md bg-muted/60" />
              </motion.div>
            );
          })
        ) : (
          <>
            {/* Active Shortcuts */}
            {items.map((item, index) => {
              let title = item.labelKey;
              try {
                title = tItems(item.labelKey);
              } catch {
                // fallback
              }

              // Resolve item color from navigation configuration
              const group = NAVIGATION.find((g) =>
                g.items.some((i) => i.href === item.href)
              );
              const effectiveColor = (item.color ??
                group?.color ??
                "sky") as NavColor;

              const isMobileHidden = index >= 3;

              return (
                <motion.div key={item.href} variants={fadeUp} className={cn(isMobileHidden && "hidden sm:block")}>
                  <GoogleShortcutTile
                    href={item.href}
                    icon={item.icon}
                    color={effectiveColor}
                    title={title}
                    onEdit={() => setIsModalOpen(true)}
                    onRemove={(href) => removeShortcut(href)}
                  />
                </motion.div>
              );
            })}

            {/* Add / Customize Shortcut Tile */}
            {items.length < maxItems ? (
              <motion.div variants={fadeUp}>
                <GoogleAddShortcutTile onClick={() => setIsModalOpen(true)} />
              </motion.div>
            ) : (
              <motion.div variants={fadeUp} className="sm:hidden">
                <GoogleAddShortcutTile onClick={() => setIsModalOpen(true)} />
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Google M3 Shortcut Customizer Modal */}
      <GoogleShortcutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isSelected={isSelected}
        isFull={isFull}
        onToggle={toggle}
        onReset={reset}
        selectedCount={selectedHrefs.length}
      />
    </section>
  );
}
