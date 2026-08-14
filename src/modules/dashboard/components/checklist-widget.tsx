"use client";

import { useTranslations } from "next-intl";
import { CheckSquare, Circle, CheckCircle2 } from "lucide-react";
import type { ChecklistItem } from "../services/dashboard.service";
import { cn } from "@/lib/utils";

export function ChecklistWidget({ items }: { items: ChecklistItem[] }) {
  const t = useTranslations("Dashboard.checklist");

  return (
    <div className="bg-card rounded-xl rounded-br-none border border-border/50 p-4 @sm:p-5 @md:p-6 flex flex-col h-full min-h-0 fa-num">
      <h3 className="mb-3 @sm:mb-4 font-semibold text-base @sm:text-lg shrink-0">{t("title")}</h3>

      {items && items.length > 0 ? (
        <ul className="space-y-2 @sm:space-y-3 flex-1 min-h-0 overflow-y-auto pe-1 custom-scrollbar">
          {items.map((item) => (
            <li
              key={item.id}
              className="group flex items-start gap-2 @sm:gap-3 p-2 @sm:p-2.5 rounded-xl hover:bg-muted/40 transition-all duration-300 cursor-pointer"
            >
              <div className="mt-1 shrink-0 transition-all duration-300 group-hover:scale-110">
                {item.completed ? (
                  <CheckCircle2 className="size-4 @sm:size-5 text-emerald-500" />
                ) : (
                  <Circle className="size-4 @sm:size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate text-xs @sm:text-sm font-medium transition-colors duration-300",
                    item.completed
                      ? "text-muted-foreground line-through opacity-70"
                      : "text-foreground group-hover:text-primary"
                  )}
                >
                  {item.title}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4 @sm:p-6 opacity-70">
          <CheckSquare className="size-8 @sm:size-12 mb-2 @sm:mb-3 opacity-20" />
          <p className="text-xs @sm:text-sm font-medium">{t("empty")}</p>
        </div>
      )}
    </div>
  );
}
