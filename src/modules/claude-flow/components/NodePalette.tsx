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
  Flag,
  Hexagon,
  Search,
  Triangle,
  Cloud,
  FileText,
  Columns3,
  Timer,
  Layers,
  Hash,
  Sigma,
  Ruler,
  RectangleHorizontal,
  Shapes,
  Image as ImageIconLucide,
  Pi,
  Table,
  LayoutGrid,
  Workflow,
  Boxes,
  FileSpreadsheet,
  Grid3x3,
  BarChart3,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useDiagramStore } from "../store";
import type { PaletteItem } from "../types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// â”€â”€ Static palette definitions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      colorToken: "green",
    },
  },
  {
    type: "outputNode",
    labelKey: "outputNode",
    icon: "flag",
    category: "flowchart",
    defaultData: {
      label: "End",
      colorToken: "red",
    },
  },
  {
    type: "diamondNode",
    labelKey: "diamondNode",
    icon: "diamond",
    category: "flowchart",
    defaultData: {
      label: "Decision",
      colorToken: "amber",
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
  {
    type: "imageNode",
    labelKey: "imageNode",
    icon: "image",
    category: "basic",
    defaultData: { label: "Image" },
  },
  {
    type: "tableNode",
    labelKey: "tableNode",
    icon: "table",
    category: "basic",
    defaultData: {
      label: "Table",
      colorToken: "neutral",
      tableHasHeader: true,
      tableRows: [
        ["Column 1", "Column 2", "Column 3"],
        ["", "", ""],
        ["", "", ""],
      ],
    },
  },
  {
    type: "excelNode",
    labelKey: "excelNode",
    icon: "excel",
    category: "compute",
    defaultData: {
      label: "Excel",
      colorToken: "green",
      tableHasHeader: true,
      tableRows: [
        ["Item", "Q1", "Q2"],
        ["", "", ""],
        ["", "", ""],
      ],
    },
  },
  {
    type: "matrixNode",
    labelKey: "matrixNode",
    icon: "matrix",
    category: "compute",
    defaultData: {
      label: "Matrix",
      colorToken: "violet",
      matrixRows: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
    },
  },
  {
    type: "chartNode",
    labelKey: "chartNode",
    icon: "chart",
    category: "compute",
    defaultData: {
      label: "Chart",
      colorToken: "blue",
      chartType: "bar",
      chartRows: [
        ["", "Series A", "Series B"],
        ["Jan", "10", "18"],
        ["Feb", "14", "12"],
        ["Mar", "9", "20"],
      ],
    },
  },
  {
    type: "triangleNode",
    labelKey: "triangleNode",
    icon: "triangle",
    category: "shapes",
    defaultData: { label: "Triangle" },
  },
  {
    type: "cloudNode",
    labelKey: "cloudNode",
    icon: "cloud",
    category: "shapes",
    defaultData: { label: "Cloud", colorToken: "blue" },
  },
  {
    type: "documentNode",
    labelKey: "documentNode",
    icon: "document",
    category: "flowchart",
    defaultData: { label: "Document" },
  },
  {
    type: "predefinedProcessNode",
    labelKey: "predefinedProcessNode",
    icon: "predefinedProcess",
    category: "flowchart",
    defaultData: { label: "Subroutine" },
  },
  {
    type: "delayNode",
    labelKey: "delayNode",
    icon: "delay",
    category: "flowchart",
    defaultData: { label: "Delay", colorToken: "amber" },
  },
  {
    type: "groupNode",
    labelKey: "groupNode",
    icon: "group",
    category: "containers",
    defaultData: { label: "Sub-flow", colorToken: "neutral" },
  },
  {
    type: "numberNode",
    labelKey: "numberNode",
    icon: "number",
    category: "compute",
    defaultData: { label: "Number", value: 0 },
  },
  {
    type: "operatorNode",
    labelKey: "operatorNode",
    icon: "operator",
    category: "compute",
    defaultData: { label: "Operator", operation: "add", colorToken: "violet" },
  },
  {
    type: "constantNode",
    labelKey: "constantNode",
    icon: "constant",
    category: "compute",
    defaultData: { label: "Constant", constantKey: "pi", colorToken: "green" },
  },
  {
    type: "shapeNode",
    labelKey: "shapeNode",
    icon: "shape",
    category: "compute",
    defaultData: { label: "Shape", shapeKind: "rectangle", colorToken: "amber" },
  },
  {
    type: "geometryCalcNode",
    labelKey: "geometryCalcNode",
    icon: "geometryCalc",
    category: "compute",
    defaultData: { label: "Geometry calculator", calcShape: "rectangle", calcMode: "area", colorToken: "teal" },
  },
  {
    type: "beamCalcNode",
    labelKey: "beamCalcNode",
    icon: "beamCalc",
    category: "compute",
    defaultData: { label: "Beam section (Ix)", beamShape: "rectangle", colorToken: "blue" },
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
  flag: Flag,
  hexagon: Hexagon,
  triangle: Triangle,
  cloud: Cloud,
  document: FileText,
  predefinedProcess: Columns3,
  delay: Timer,
  group: Layers,
  number: Hash,
  operator: Sigma,
  constant: Pi,
  geometryCalc: Ruler,
  beamCalc: RectangleHorizontal,
  shape: Shapes,
  image: ImageIconLucide,
  table: Table,
  excel: FileSpreadsheet,
  matrix: Grid3x3,
  chart: BarChart3,
};

// Category order determines render order in the palette sidebar
const CATEGORIES = ["basic", "flowchart", "shapes", "containers", "compute"] as const;
const CATEGORY_ICONS: Record<(typeof CATEGORIES)[number], typeof Square> = {
  basic: LayoutGrid,
  flowchart: Workflow,
  shapes: Shapes,
  containers: Layers,
  compute: Sigma,
};

// English fallbacks for the newly-added keys, used if the project's message
// files haven't been updated yet (next-intl throws on missing keys in dev).
// Add `nodes.<labelKey>` / `palette.containers` to your translation files to
// fully localize these; until then the UI keeps working with this fallback.
const LABEL_FALLBACKS: Record<string, string> = {
  triangleNode: "Triangle",
  cloudNode: "Cloud",
  documentNode: "Document",
  predefinedProcessNode: "Subroutine",
  delayNode: "Delay",
  groupNode: "Sub-flow",
  numberNode: "Number",
  operatorNode: "Operator",
  constantNode: "Constant",
  tableNode: "Table",
  excelNode: "Excel",
  matrixNode: "Matrix",
  chartNode: "Chart",
  geometryCalcNode: "Geometry calculator",
  beamCalcNode: "Beam section (Ix)",
  shapeNode: "Shape",
  imageNode: "Image",
  svgNode: "Image",
};
const CATEGORY_FALLBACKS: Record<string, string> = {
  containers: "Containers",
  compute: "Computation",
};

function safeT(t: ReturnType<typeof useTranslations>, key: string, fallback: string): string {
  try {
    return t(key);
  } catch {
    return fallback;
  }
}

// â”€â”€ NodePalette â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function NodePalette() {
  // next-intl: all keys live under the "Flow" namespace
  const t = useTranslations("Flow");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | (typeof CATEGORIES)[number]>("all");

  const label = (item: PaletteItem) =>
    safeT(t, `nodes.${item.labelKey}`, LABEL_FALLBACKS[item.labelKey] ?? item.defaultData.label ?? item.type);

  // Filter items by translated label + active category tab, then group by category.
  // Re-runs only when query, category, or locale changes (t is stable per render).
  const grouped = useMemo(() => {
    const q = query.toLowerCase();
    const filtered = PALETTE_ITEMS.filter((item) => label(item).toLowerCase().includes(q));
    const categoriesToShow = activeCategory === "all" ? CATEGORIES : [activeCategory];
    return categoriesToShow.map((cat) => ({
      cat,
      items: filtered.filter((i) => i.category === cat),
    })).filter((g) => g.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeCategory, t]);

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
    <aside className="flex h-full border-e border-border bg-background">
      {/* ── Category rail — vertical, alongside the panel ─────────────────── */}
      <div className="flex w-10 shrink-0 flex-col items-center gap-1 border-e border-border bg-muted/30 py-3">
        <button
          onClick={() => setActiveCategory("all")}
          title={safeT(t, "global.all", "All")}
          className={cn(
            "flex size-8 items-center justify-center rounded-md transition-colors",
            activeCategory === "all" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <Boxes className="size-4" />
        </button>
        <div className="my-1 h-px w-6 bg-border" />
        {CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              title={safeT(t, `palette.${cat}`, CATEGORY_FALLBACKS[cat] ?? cat)}
              className={cn(
                "flex size-8 items-center justify-center rounded-md transition-colors",
                activeCategory === cat ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
            </button>
          );
        })}
      </div>

      {/* ── Search + grouped node list ─────────────────────────────────────── */}
      <div className="flex w-64 flex-col">
        <div className="border-b border-border p-3">
          <div className="relative">
            {/* start-2.5 is the Tailwind v4 logical-property equivalent of left-2.5 */}
            <Search className="absolute inset-s-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("palette.search")}
              className="ps-8 pe-2 text-xs"
            />
          </div>
        </div>

        {/* ── Grouped node list ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-3">
          {grouped.map(({ cat, items }) => (
            <div key={cat} className="mb-4">
              {/* Dynamic category heading: Flow.palette.<cat> */}
              <h3 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {safeT(t, `palette.${cat}`, CATEGORY_FALLBACKS[cat] ?? cat)}
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
                        {label(item)}
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
      </div>
    </aside>
  );
}

export { PALETTE_ITEMS };



