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
  FileCode,
  FileArchive,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useDiagramStore } from "../store";
import type { PaletteItem } from "../types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// Ã¢â€â‚¬Ã¢â€â‚¬ Static palette definitions Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
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
    defaultData: { label: "Note textâ€¦" },
  },
  {
    type: "imageNode",
    labelKey: "imageNode",
    icon: "image",
    category: "basic",
    defaultData: { label: "Image" },
  },
  {
    type: "svgNode",
    labelKey: "svgNode",
    icon: "svg",
    category: "basic",
    defaultData: { label: "SVG" },
  },
  {
    type: "dwgNode",
    labelKey: "dwgNode",
    icon: "cad",
    category: "basic",
    defaultData: { label: "DWG file", colorToken: "neutral" },
  },
  {
    type: "dxfNode",
    labelKey: "dxfNode",
    icon: "cad",
    category: "basic",
    defaultData: { label: "DXF file", colorToken: "neutral" },
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
  geometryCalc: Ruler,
  beamCalc: RectangleHorizontal,
  shape: Shapes,
  image: ImageIconLucide,
  svg: FileCode,
  cad: FileArchive,
};

// Category order determines render order in the palette sidebar
const CATEGORIES = ["basic", "flowchart", "shapes", "containers", "compute"] as const;

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
  geometryCalcNode: "Geometry calculator",
  beamCalcNode: "Beam section (Ix)",
  shapeNode: "Shape",
  imageNode: "Image",
  svgNode: "SVG",
  dwgNode: "DWG file",
  dxfNode: "DXF file",
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

// Ã¢â€â‚¬Ã¢â€â‚¬ NodePalette Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
export function NodePalette() {
  // next-intl: all keys live under the "Flow" namespace
  const t = useTranslations("Flow");
  const [query, setQuery] = useState("");

  const label = (item: PaletteItem) =>
    safeT(t, `nodes.${item.labelKey}`, LABEL_FALLBACKS[item.labelKey] ?? item.defaultData.label ?? item.type);

  // Filter items by translated label, then group by category.
  // Re-runs only when query or locale changes (t is stable per render).
  const grouped = useMemo(() => {
    const q = query.toLowerCase();
    const filtered = PALETTE_ITEMS.filter((item) => label(item).toLowerCase().includes(q));
    return CATEGORIES.map((cat) => ({
      cat,
      items: filtered.filter((i) => i.category === cat),
    })).filter((g) => g.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Search bar Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
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

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Grouped node list Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
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

        {/* Empty state Ã¢â‚¬â€ shown when search query matches nothing */}
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





