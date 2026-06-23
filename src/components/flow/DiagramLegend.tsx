// src/components/flow/DiagramLegend.tsx
// Shows all standard-type colour indicators as an overlay legend.

import { STANDARD_COLORS, type StandardType } from "@/types/nodes";

const LEGEND_ITEMS: { type: StandardType; shape: "circle" | "hexagon" }[] = [
  { type: "API", shape: "circle" },
  { type: "ASME", shape: "hexagon" },
  { type: "ASTM", shape: "hexagon" },
  { type: "NACE", shape: "hexagon" },
  { type: "NBIC", shape: "hexagon" },
  { type: "TEMA", shape: "hexagon" },
  { type: "AHRI", shape: "hexagon" },
  { type: "MSS", shape: "hexagon" },
  { type: "STI", shape: "hexagon" },
  { type: "ANSI", shape: "hexagon" },
  { type: "PFI", shape: "hexagon" },
  { type: "OTHER", shape: "hexagon" },
];

const HEX_PATH =
  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

export default function DiagramLegend() {
  return (
    <div
      className="
        absolute top-4 right-4 z-10
        bg-card border border-border
        rounded-lg shadow-md px-4 py-3
        flex flex-col gap-1.5 text-xs text-foreground
        max-h-[50vh] overflow-y-auto
      "
    >
      <p className="font-semibold text-foreground mb-1">Legend</p>

      {LEGEND_ITEMS.map(({ type, shape }) => (
        <div key={type} className="flex items-center gap-2">
          <div
            className="w-5 h-5 shrink-0"
            style={{
              backgroundColor: STANDARD_COLORS[type],
              borderRadius: shape === "circle" ? "50%" : undefined,
              clipPath: shape === "hexagon" ? HEX_PATH : undefined,
            }}
          />
          <span className="text-muted-foreground">
            {type}
            {type === "API" && (
              <span className="ml-1 text-[10px] opacity-60">(circle)</span>
            )}
          </span>
        </div>
      ))}

      <div className="mt-2 pt-2 border-t border-border space-y-1.5">
        {/* Hub */}
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 shrink-0 bg-amber-600"
            style={{
              clipPath:
                "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
            }}
          />
          <span className="text-muted-foreground">Hub</span>
        </div>
        {/* Category */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 shrink-0 rounded-sm bg-blue-600" />
          <span className="text-muted-foreground">Category</span>
        </div>
        {/* Subcategory */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 shrink-0 rounded-sm bg-violet-600" />
          <span className="text-muted-foreground">Subcategory</span>
        </div>
      </div>
    </div>
  );
}
