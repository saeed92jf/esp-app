"use client";

import React, { useMemo, useState } from "react";
import type { DragEvent } from "react";
import {
  Square,
  Circle,
  Diamond,
  Database,
  Type,
  StickyNote,
  ArrowRightCircle,
  Octagon,
  Hexagon,
  Search,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useDiagramStore } from "../store";
import type { PaletteItem } from "../types";
import { cn } from "@/lib/utils";

// ── Static palette definitions ────────────────────────────────────────────────
// defaultData values are merged into node data on drop; colors use Tailwind-safe hex values
const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: "defaultNode",
    labelKey: "defaultNode",
    icon: "square",
    category: "basic",
    defaultData: { label: "Process" },
  },
  {
    type: "inputNode",
    labelKey: "inputNode",
    icon: "arrowRight",
    category: "flowchart",
    defaultData: {
      label: "Start",
      backgroundColor: "#dcfce7",
      borderColor: "#22c55e",
    },
  },
  {
    type: "outputNode",
    labelKey: "outputNode",
    icon: "octagon",
    category: "flowchart",
    defaultData: {
      label: "End",
      backgroundColor: "#fee2e2",
      borderColor: "#ef4444",
    },
  },
  {
    type: "diamondNode",
    labelKey: "diamondNode",
    icon: "diamond",
    category: "flowchart",
    defaultData: {
      label: "Decision",
      backgroundColor: "#fef9c3",
      borderColor: "#eab308",
    },
  },
  {
    type: "cylinderNode",
    labelKey: "cylinderNode",
    icon: "database",
    category: "flowchart",
    defaultData: { label: "Database" },
  },
  {
    type: "parallelogramNode",
    labelKey: "parallelogramNode",
    icon: "square",
    category: "flowchart",
    defaultData: { label: "I/O" },
  },
  {
    type: "circleNode",
    labelKey: "circleNode",
    icon: "circle",
    category: "shapes",
    defaultData: { label: "Circle" },
  },
  {
    type: "hexagonNode",
    labelKey: "hexagonNode",
    icon: "hexagon",
    category: "shapes",
    defaultData: { label: "Hexagon" },
  },
  {
    type: "textNode",
    labelKey: "textNode",
    icon: "type",
    category: "basic",
    defaultData: {
      label: "Text",
      backgroundColor: "transparent",
      borderWidth: 0,
    },
  },
  {
    type: "noteNode",
    labelKey: "noteNode",
    icon: "note",
    category: "basic",
    defaultData: { label: "Note text…" },
  },
];

// Map icon string keys to Lucide components; Square is the fallback
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  square: Square,
  circle: Circle,
  diamond: Diamond,
  database: Database,
  type: Type,
  note: StickyNote,
  arrowRight: ArrowRightCircle,
  octagon: Octagon,
  hexagon: Hexagon,
};

// Category order determines render order in the palette sidebar
const CATEGORIES = ["basic", "flowchart", "shapes"] as const;

// ── NodePalette ───────────────────────────────────────────────────────────────
export function NodePalette() {
  // next-intl: all keys live under the "Flow" namespace
  const t = useTranslations("Flow");
  const [query, setQuery] = useState("");

  // Filter items by translated label, then group by category.
  // Re-runs only when query or locale changes (t is stable per render).
  const grouped = useMemo(() => {
    const q = query.toLowerCase();
    const filtered = PALETTE_ITEMS.filter((item) =>
      t(`nodes.${item.labelKey}`).toLowerCase().includes(q),
    );
    return CATEGORIES.map((cat) => ({
      cat,
      items: filtered.filter((i) => i.category === cat),
    })).filter((g) => g.items.length > 0);
  }, [query, t]);

  // Encode the full PaletteItem into the drag event so the canvas drop handler
  // can reconstruct the node without a separate lookup.
  const onDragStart = (event: DragEvent<HTMLDivElement>, item: PaletteItem) => {
    event.dataTransfer.setData(
      "application/diagram-node",
      JSON.stringify(item),
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="flex h-full w-64 flex-col border-e border-border bg-background">
      {/* ── Search bar ─────────────────────────────────────────────────────── */}
      <div className="border-b border-border p-3">
        <div className="relative">
          {/* start-2.5 is the Tailwind v4 logical-property equivalent of left-2.5 */}
          <Search className="absolute inset-s-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("palette.search")}
            className={cn(
              "w-full rounded-md border border-input bg-background py-1.5 ps-8 pe-2 text-xs",
              "text-foreground placeholder:text-muted-foreground",
              "outline-none focus:border-primary focus:ring-1 focus:ring-primary",
            )}
          />
        </div>
      </div>

      {/* ── Grouped node list ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3">
        {grouped.map(({ cat, items }) => (
          <div key={cat} className="mb-4">
            {/* Dynamic category heading: Flow.palette.<cat> */}
            <h3 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t(`palette.${cat}`)}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {items.map((item) => {
                const Icon = ICONS[item.icon] ?? Square;
                return (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, item)}
                    title={t("palette.dragToAdd")}
                    className={cn(
                      // Base layout
                      "flex cursor-grab flex-col items-center gap-1.5 rounded-lg",
                      "border border-border px-2 py-3 text-center",
                      // Interaction: subtle bg lift on hover, shadow on active drag
                      "transition-colors hover:bg-accent hover:border-primary/40",
                      "active:cursor-grabbing active:shadow-xs",
                    )}
                  >
                    {/* Icon: muted-foreground keeps it secondary; primary on hover via group */}
                    <Icon className="h-5 w-5 text-muted-foreground" />

                    {/* Dynamic node label: Flow.nodes.<labelKey> */}
                    <span className="text-[11px] font-medium leading-tight text-foreground">
                      {t(`nodes.${item.labelKey}`)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Empty state — shown when search query matches nothing */}
        {grouped.length === 0 && (
          <p className="px-1 py-6 text-center text-xs text-muted-foreground">
            {t("global.noResults")}
          </p>
        )}
      </div>
    </aside>
  );
}

export { PALETTE_ITEMS };
