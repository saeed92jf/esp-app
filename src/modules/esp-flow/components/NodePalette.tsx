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
  Workflow,
  Boxes,
  FileSpreadsheet,
  Grid3x3,
  BarChart3,
  Scale,
  Cylinder,
  Box,
  Disc,
  Target,
  Settings,
  ArrowDownToLine,
  Paperclip,
  Link,
  Layers as LayersIcon,
  Filter,
  ClipboardList,
  FileSliders,
  Paintbrush,
  Flame,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useDiagramStore } from "../store";
import type { PaletteItem, PaletteCategory } from "../types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// ── Static palette definitions ───────────────────────────────────────────
// defaultData values are merged into node data on drop; colors use Tailwind-safe hex values
//
// Category restructure: the old "basic/flowchart/shapes/containers" split is
// gone. Every ordinary, no-computation shape now lives under a single
// "diagram" category (general-purpose flowchart/diagram building blocks).
// Nodes that carry or derive numeric values live under "compute". "weight"
// is a reserved, currently-empty category for future weight-calculation
// nodes — see the empty-state message further down.
const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: "defaultNode",
    labelKey: "defaultNode",
    icon: "square",
    category: "diagram",
    defaultData: { label: "Process" },
  },
  {
    type: "inputNode",
    labelKey: "inputNode",
    icon: "arrowRight",
    category: "diagram",
    defaultData: {
      label: "Start",
      colorToken: "green",
    },
  },
  {
    type: "outputNode",
    labelKey: "outputNode",
    icon: "flag",
    category: "diagram",
    defaultData: {
      label: "End",
      colorToken: "red",
    },
  },
  {
    type: "diamondNode",
    labelKey: "diamondNode",
    icon: "diamond",
    category: "diagram",
    defaultData: {
      label: "Decision",
      colorToken: "amber",
    },
  },
  {
    type: "cylinderNode",
    labelKey: "cylinderNode",
    icon: "database",
    category: "diagram",
    defaultData: { label: "Database" },
  },
  {
    type: "parallelogramNode",
    labelKey: "parallelogramNode",
    icon: "square",
    category: "diagram",
    defaultData: { label: "I/O" },
  },
  {
    type: "circleNode",
    labelKey: "circleNode",
    icon: "circle",
    category: "diagram",
    defaultData: { label: "Circle" },
  },
  {
    type: "hexagonNode",
    labelKey: "hexagonNode",
    icon: "hexagon",
    category: "diagram",
    defaultData: { label: "Hexagon" },
  },
  {
    type: "textNode",
    labelKey: "textNode",
    icon: "type",
    category: "diagram",
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
    category: "diagram",
    defaultData: { label: "Note text…" },
  },
  {
    type: "imageNode",
    labelKey: "imageNode",
    icon: "image",
    category: "diagram",
    defaultData: { label: "Image" },
  },
  {
    type: "tableNode",
    labelKey: "tableNode",
    icon: "table",
    category: "diagram",
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
    category: "diagram",
    defaultData: { label: "Triangle" },
  },
  {
    type: "cloudNode",
    labelKey: "cloudNode",
    icon: "cloud",
    category: "diagram",
    defaultData: { label: "Cloud", colorToken: "blue" },
  },
  {
    type: "documentNode",
    labelKey: "documentNode",
    icon: "document",
    category: "diagram",
    defaultData: { label: "Document" },
  },
  {
    type: "predefinedProcessNode",
    labelKey: "predefinedProcessNode",
    icon: "predefinedProcess",
    category: "diagram",
    defaultData: { label: "Subroutine" },
  },
  {
    type: "delayNode",
    labelKey: "delayNode",
    icon: "delay",
    category: "diagram",
    defaultData: { label: "Delay", colorToken: "amber" },
  },
  {
    type: "groupNode",
    labelKey: "groupNode",
    icon: "group",
    category: "diagram",
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
  // ── Weight calculation nodes (vessel-weight module) ─────────────────
  // Sub-group: Project
  {
    type: "projectSettingsNode",
    labelKey: "projectSettingsNode",
    icon: "settings",
    category: "weight",
    subGroup: "project",
    defaultData: { label: "Project Settings" },
  },
  {
    type: "projectDataNode",
    labelKey: "projectDataNode",
    icon: "projectData",
    category: "weight",
    subGroup: "project",
    defaultData: { label: "Project Data" },
  },
  {
    type: "generalDataNode",
    labelKey: "generalDataNode",
    icon: "generalData",
    category: "weight",
    subGroup: "project",
    defaultData: { label: "General Data" },
  },
  // Sub-group: Material
  {
    type: "materialListNode",
    labelKey: "materialListNode",
    icon: "fileSpreadsheet",
    category: "weight",
    subGroup: "material",
    defaultData: { label: "Material Specification Schedule" },
  },
  // Sub-group: Body
  {
    type: "shellNode",
    labelKey: "shellNode",
    icon: "shellSection",
    category: "weight",
    subGroup: "body",
    defaultData: { label: "Shell Section" },
  },
  {
    type: "headNode",
    labelKey: "headNode",
    icon: "head",
    category: "weight",
    subGroup: "body",
    defaultData: { label: "Head" },
  },
  {
    type: "nozzleNode",
    labelKey: "nozzleNode",
    icon: "nozzle",
    category: "weight",
    subGroup: "body",
    defaultData: { label: "Nozzle" },
  },
  {
    type: "supportNode",
    labelKey: "supportNode",
    icon: "support",
    category: "weight",
    subGroup: "body",
    defaultData: { label: "Support" },
  },
  {
    type: "attachmentsNode",
    labelKey: "attachmentsNode",
    icon: "attachments",
    category: "weight",
    subGroup: "body",
    defaultData: { label: "Attachments" },
  },
  {
    type: "jacketNode",
    labelKey: "jacketNode",
    icon: "layers",
    category: "weight",
    subGroup: "body",
    defaultData: { label: "Jacket" },
  },
  // Sub-group: Internals
  {
    type: "mistEliminatorNode",
    labelKey: "mistEliminatorNode",
    icon: "mistEliminator",
    category: "weight",
    subGroup: "internals",
    defaultData: { label: "Mist Eliminator" },
  },
  {
    type: "internalsNode",
    labelKey: "internalsNode",
    icon: "internals",
    category: "weight",
    subGroup: "internals",
    defaultData: { label: "Internals" },
  },
  // Sub-group: Reports & Outputs
  {
    type: "regenVacuumSteamoutNode",
    labelKey: "regenVacuumSteamoutNode",
    icon: "flame",
    category: "weight",
    subGroup: "misc",
    defaultData: { label: "Regen / Vacuum / Steam Out" },
  },
  {
    type: "surfacePrepNode",
    labelKey: "surfacePrepNode",
    icon: "paintbrush",
    category: "weight",
    subGroup: "misc",
    defaultData: { label: "Surface Preparation" },
  },
  {
    type: "outputHubNode",
    labelKey: "outputHubNode",
    icon: "outputHub",
    category: "weight",
    subGroup: "misc",
    defaultData: { label: "Output Hub" },
  },
  {
    type: "mtoNode",
    labelKey: "mtoNode",
    icon: "fileSpreadsheet",
    category: "weight",
    subGroup: "misc",
    defaultData: { label: "Material Take-Off (MTO)" },
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
  // vessel-weight icons
  vesselRoot: Database,
  shellSection: Cylinder,
  head: Disc,
  nozzle: Target,
  support: ArrowDownToLine,
  attachments: Paperclip,
  outputHub: Link,
  mistEliminator: Filter,
  internals: LayersIcon,
  projectData: ClipboardList,
  generalData: FileSliders,
  settings: Settings,
  jacket: LayersIcon,
  regen: Flame,
  surfacePrep: Paintbrush,
  paintbrush: Paintbrush,
  flame: Flame,
  weight: Scale,
  fileSpreadsheet: FileSpreadsheet,
};

// Category order determines render order in the palette sidebar. "All" was
// removed entirely — the rail now only ever shows these three, and the
// default active category is "diagram".
const CATEGORIES: PaletteCategory[] = ["diagram", "compute", "weight"];
const CATEGORY_ICONS: Record<PaletteCategory, typeof Square> = {
  diagram: Workflow,
  compute: Sigma,
  weight: Scale,
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
  // vessel-weight
  shellNode: "Shell Section",
  headNode: "Head",
  nozzleNode: "Nozzle",
  supportNode: "Support",
  attachmentsNode: "Attachments",
  outputHubNode: "Output Hub",
  mistEliminatorNode: "Mist Eliminator",
  internalsNode: "Internals",
  projectDataNode: "Project Data",
  projectSettingsNode: "Project Settings",
  generalDataNode: "General Data Body",
  jacketNode: "Jacket",
  regenVacuumSteamoutNode: "Regen / Vacuum / Steam Out",
  surfacePrepNode: "Surface Preparation",
  materialListNode: "Material Specification Schedule",
  mtoNode: "Material Take-Off (MTO)",
};
const CATEGORY_FALLBACKS: Record<PaletteCategory, string> = {
  diagram: "Diagram",
  compute: "Computation",
  weight: "Weight calculations",
};

const WEIGHT_SUBGROUPS: { key: string; label: string }[] = [
  { key: "project", label: "Project" },
  { key: "material", label: "Material" },
  { key: "body", label: "Body" },
  { key: "internals", label: "Internals" },
  { key: "misc", label: "Misc / Outputs" },
];

function safeT(t: ReturnType<typeof useTranslations>, key: string, fallback: string): string {
  try {
    return t(key);
  } catch {
    return fallback;
  }
}

// ── NodePalette ─────────────────────────────────────────────────────────
export function NodePalette() {
  // next-intl: all keys live under the "Flow" namespace
  const t = useTranslations("Flow");
  const [query, setQuery] = useState("");
  // Default tab is "diagram" now that the "All" tab no longer exists.
  const [activeCategory, setActiveCategory] = useState<PaletteCategory>("diagram");

  const label = (item: PaletteItem) =>
    safeT(t, `nodes.${item.labelKey}`, LABEL_FALLBACKS[item.labelKey] ?? item.defaultData.label ?? item.type);

  // For the weight category, build one group per sub-group (in defined order).
  // For other categories, one flat group as before.
  const grouped = useMemo(() => {
    const q = query.toLowerCase();
    const filtered = PALETTE_ITEMS.filter(
      (item) => item.category === activeCategory && label(item).toLowerCase().includes(q),
    );
    if (filtered.length === 0) return [];

    if (activeCategory === "weight") {
      return WEIGHT_SUBGROUPS
        .map(({ key, label: sgLabel }) => ({
          cat: activeCategory,
          subGroup: key,
          subGroupLabel: sgLabel,
          items: filtered.filter((i) => (i as any).subGroup === key),
        }))
        .filter((g) => g.items.length > 0);
    }

    return [{ cat: activeCategory, subGroup: null, subGroupLabel: null, items: filtered }];
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
    <aside className="flex h-full border-r border-border/50 bg-gradient-to-b from-card to-card/50 backdrop-blur-xl shadow-2xl fa-num">
      {/* ── Category rail — vertical, alongside the panel ── */}
      <div className="flex w-10 shrink-0 flex-col items-center gap-1 border-e border-border bg-muted/30 py-3">
        {CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              title={safeT(t, `palette.${cat}`, CATEGORY_FALLBACKS[cat])}
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

      {/* ── Search + grouped node list ── */}
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

        {/* ── Grouped node list ── */}
        <div className="flex-1 overflow-y-auto p-3">
        {grouped.map(({ cat, subGroup, subGroupLabel, items }) => (
          <div key={subGroup ?? cat} className="mb-4">
            {/* Sub-group heading (weight) or category heading (others) */}
            {subGroupLabel ? (
              <div className="mb-2 flex items-center gap-2 px-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {subGroupLabel}
                </span>
                <div className="flex-1 border-t border-border/50" />
              </div>
            ) : (
              <h3 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {safeT(t, `palette.${cat}`, CATEGORY_FALLBACKS[cat])}
              </h3>
            )}

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
                      "flex cursor-grab flex-col items-center gap-1.5 rounded-xl",
                      "border border-border/50 bg-card/40 px-2 py-3 text-center",
                      // Interaction
                      "transition-all duration-300 hover:bg-card/80 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 group",
                      "active:cursor-grabbing active:shadow-sm active:translate-y-0",
                    )}
                  >
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                    <span className="text-[11px] font-medium leading-tight text-foreground">
                      {label(item)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

          {grouped.length === 0 && activeCategory !== "weight" && (
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
