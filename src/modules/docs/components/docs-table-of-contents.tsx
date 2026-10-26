// src/modules/docs/components/docs-table-of-contents.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { DocSection } from "../types/docs.types";
import { ListTree, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocsTableOfContentsProps {
  sections: DocSection[];
}

export function DocsTableOfContents({ sections }: DocsTableOfContentsProps) {
  const t = useTranslations("Docs");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const [activeSectionId, setActiveSectionId] = useState<string>(
    sections[0]?.id || ""
  );

  useEffect(() => {
    if (!sections.length) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSectionId(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offsetTop = el.offsetTop - 90;
      window.scrollTo({ top: offsetTop, behavior: "smooth" });
      setActiveSectionId(id);
    }
  };

  if (!sections || sections.length < 2) {
    return null;
  }

  return (
    <div className="w-56 xl:w-64 shrink-0 hidden lg:block sticky top-[calc(var(--header-height)+16px)] max-h-[calc(100dvh-var(--header-height)-var(--footer-height)-24px)] overflow-y-auto no-scrollbar ps-4">
      <div className="space-y-3 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground/90 uppercase tracking-wider">
          <ListTree className="size-4 text-primary" />
          <span>{t("onThisPage")}</span>
        </div>

        <nav className="flex flex-col gap-1 border-s-2 border-border/60 ps-3">
          {sections.map((section) => {
            const isActive = activeSectionId === section.id;
            const title = isRtl ? section.titleFa : section.titleEn;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => handleScrollTo(section.id)}
                className={cn(
                  "text-xs text-start py-1.5 px-2 rounded-lg transition-all duration-150 cursor-pointer block truncate w-full",
                  isActive
                    ? "font-bold text-primary bg-primary/10 -ms-3.5 border-s-2 border-primary ps-3"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 font-medium"
                )}
                title={title}
              >
                {title}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
