// src/modules/diagram-editor/components/NodePalette/NodePalette.tsx
// Node palette panel for dragging/adding new nodes to the canvas
// Displays available node shapes grouped by category

"use client";

import React, { useState } from "react";
import { useDiagramStore } from "../../store/diagramStore";
import { AVAILABLE_SHAPES } from "../../utils/nodeShapes";
import { DEFAULT_NODE_STYLE } from "../../constants/defaults";
import type { NodeShape, DiagramNodeData } from "../../types/diagram.types";
import { nanoid } from "nanoid";

// Shape category groupings for organized display
const SHAPE_CATEGORIES: Record<string, NodeShape[]> = {
  basic: ["rectangle", "rounded-rectangle", "circle", "ellipse", "diamond"],
  flow: ["parallelogram", "trapezoid", "hexagon", "octagon"],
  document: ["cylinder", "cloud", "star", "cross"],
  arrow: ["arrow-right", "arrow-left", "arrow-up", "arrow-down"],
};

const CATEGORY_LABELS: Record<string, string> = {
  basic: "اشکال پایه",
  flow: "جریان",
  document: "سند",
  arrow: "پیکان",
};

export const NodePalette: React.FC = () => {
  const { addNode, viewport } = useDiagramStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["basic"]),
  );

  // Toggle category expansion state
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Add a new node at the center of the current viewport
  const handleAddNode = (shape: NodeShape) => {
    const centerX = (-viewport.x + window.innerWidth / 2) / viewport.zoom;
    const centerY = (-viewport.y + window.innerHeight / 2) / viewport.zoom;

    const newNodeData: DiagramNodeData = {
      label: getShapeLabel(shape),
      shape,
      style: { ...DEFAULT_NODE_STYLE },
      description: "",
      animated: false,
    };

    addNode({
      id: nanoid(),
      type: "custom",
      position: {
        x: centerX - 60,
        y: centerY - 30,
      },
      data: newNodeData,
    });
  };

  // Handle drag start for drag-to-canvas functionality
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    shape: NodeShape,
  ) => {
    e.dataTransfer.setData("application/diagram-node-shape", shape);
    e.dataTransfer.effectAllowed = "copy";
  };

  // Get display label for shape (Persian labels)
  const getShapeLabel = (shape: NodeShape): string => {
    const labels: Record<NodeShape, string> = {
      rectangle: "مستطیل",
      "rounded-rectangle": "مستطیل گرد",
      circle: "دایره",
      ellipse: "بیضی",
      diamond: "لوزی",
      parallelogram: "متوازی‌الاضلاع",
      trapezoid: "ذوزنقه",
      hexagon: "شش‌ضلعی",
      octagon: "هشت‌ضلعی",
      cylinder: "استوانه",
      cloud: "ابر",
      star: "ستاره",
      cross: "صلیب",
      "arrow-right": "پیکان راست",
      "arrow-left": "پیکان چپ",
      "arrow-up": "پیکان بالا",
      "arrow-down": "پیکان پایین",
    };
    return labels[shape] ?? shape;
  };

  // Filter shapes based on search query
  const filteredCategories = Object.entries(SHAPE_CATEGORIES).reduce(
    (acc, [category, shapes]) => {
      const filtered = shapes.filter(
        (shape) =>
          searchQuery === "" ||
          shape.includes(searchQuery.toLowerCase()) ||
          getShapeLabel(shape).includes(searchQuery),
      );
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
      return acc;
    },
    {} as Record<string, NodeShape[]>,
  );

  return (
    <div
      className="flex flex-col h-full bg-background border-e border-border"
      role="complementary"
      aria-label="پنل اشکال"
    >
      {/* Panel header */}
      <div className="p-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground mb-2">اشکال</h2>
        {/* Search input */}
        <input
          type="search"
          placeholder="جستجوی شکل..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-2 py-1.5 text-xs rounded-md border border-input bg-background
                     text-foreground placeholder:text-muted-foreground
                     focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label="جستجوی شکل"
        />
      </div>

      {/* Shape categories list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {Object.entries(filteredCategories).map(([category, shapes]) => (
          <div key={category} className="rounded-md overflow-hidden">
            {/* Category header toggle */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-2 py-1.5
                         text-xs font-medium text-muted-foreground
                         hover:bg-accent hover:text-accent-foreground
                         rounded-md transition-colors"
              aria-expanded={expandedCategories.has(category)}
              aria-controls={`category-${category}`}
            >
              <span>{CATEGORY_LABELS[category] ?? category}</span>
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${
                  expandedCategories.has(category) ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Shapes grid — collapsible */}
            {expandedCategories.has(category) && (
              <div
                id={`category-${category}`}
                className="grid grid-cols-3 gap-1 mt-1 mb-2"
                role="list"
              >
                {shapes.map((shape) => (
                  <ShapeTile
                    key={shape}
                    shape={shape}
                    label={getShapeLabel(shape)}
                    onAdd={() => handleAddNode(shape)}
                    onDragStart={(e) => handleDragStart(e, shape)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Empty state when no shapes match search */}
        {Object.keys(filteredCategories).length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            شکلی یافت نشد
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Shape Tile Sub-component ─────────────────────────────────────────────────

interface ShapeTileProps {
  shape: NodeShape;
  label: string;
  onAdd: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
}

const ShapeTile: React.FC<ShapeTileProps> = ({
  shape,
  label,
  onAdd,
  onDragStart,
}) => {
  return (
    <div
      role="listitem"
      draggable
      onDragStart={onDragStart}
      onClick={onAdd}
      title={`افزودن ${label}`}
      className="flex flex-col items-center gap-1 p-2 rounded-md cursor-grab
                 hover:bg-accent hover:text-accent-foreground
                 active:cursor-grabbing active:scale-95
                 transition-all duration-150 select-none"
      aria-label={`افزودن ${label}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onAdd();
        }
      }}
    >
      {/* Shape preview SVG */}
      <ShapePreview shape={shape} />
      <span className="text-[10px] text-muted-foreground text-center leading-tight line-clamp-2">
        {label}
      </span>
    </div>
  );
};

// ─── Shape Preview SVG ────────────────────────────────────────────────────────

interface ShapePreviewProps {
  shape: NodeShape;
}

const ShapePreview: React.FC<ShapePreviewProps> = ({ shape }) => {
  // Renders a small SVG preview for each shape type
  const commonProps = {
    fill: "currentColor",
    className: "text-primary/60",
  };

  const svgProps = {
    width: 32,
    height: 24,
    viewBox: "0 0 32 24",
    "aria-hidden": true as const,
  };

  switch (shape) {
    case "rectangle":
      return (
        <svg {...svgProps}>
          <rect x="2" y="4" width="28" height="16" rx="0" {...commonProps} />
        </svg>
      );
    case "rounded-rectangle":
      return (
        <svg {...svgProps}>
          <rect x="2" y="4" width="28" height="16" rx="4" {...commonProps} />
        </svg>
      );
    case "circle":
      return (
        <svg {...svgProps}>
          <circle cx="16" cy="12" r="10" {...commonProps} />
        </svg>
      );
    case "ellipse":
      return (
        <svg {...svgProps}>
          <ellipse cx="16" cy="12" rx="14" ry="8" {...commonProps} />
        </svg>
      );
    case "diamond":
      return (
        <svg {...svgProps}>
          <polygon points="16,2 30,12 16,22 2,12" {...commonProps} />
        </svg>
      );
    case "parallelogram":
      return (
        <svg {...svgProps}>
          <polygon points="6,20 26,20 30,4 10,4" {...commonProps} />
        </svg>
      );
    case "trapezoid":
      return (
        <svg {...svgProps}>
          <polygon points="6,20 26,20 22,4 10,4" {...commonProps} />
        </svg>
      );
    case "hexagon":
      return (
        <svg {...svgProps}>
          <polygon points="16,2 28,8 28,16 16,22 4,16 4,8" {...commonProps} />
        </svg>
      );
    case "octagon":
      return (
        <svg {...svgProps}>
          <polygon
            points="10,2 22,2 30,10 30,14 22,22 10,22 2,14 2,10"
            {...commonProps}
          />
        </svg>
      );
    case "cylinder":
      return (
        <svg {...svgProps}>
          <rect x="4" y="7" width="24" height="12" {...commonProps} />
          <ellipse cx="16" cy="7" rx="12" ry="4" {...commonProps} />
        </svg>
      );
    case "cloud":
      return (
        <svg {...svgProps}>
          <path
            d="M8 18 Q4 18 4 14 Q4 11 7 10 Q7 6 11 6 Q13 4 16 5 Q18 3 21 5 Q25 5 26 9 Q29 10 29 13 Q29 18 25 18 Z"
            {...commonProps}
          />
        </svg>
      );
    case "star":
      return (
        <svg {...svgProps}>
          <polygon
            points="16,2 19,9 27,9 21,14 23,22 16,17 9,22 11,14 5,9 13,9"
            {...commonProps}
          />
        </svg>
      );
    case "cross":
      return (
        <svg {...svgProps}>
          <path
            d="M12 2 h8 v8 h8 v8 h-8 v8 h-8 v-8 h-8 v-8 h8 Z"
            {...commonProps}
          />
        </svg>
      );
    case "arrow-right":
      return (
        <svg {...svgProps}>
          <polygon
            points="2,8 20,8 20,4 30,12 20,20 20,16 2,16"
            {...commonProps}
          />
        </svg>
      );
    case "arrow-left":
      return (
        <svg {...svgProps}>
          <polygon
            points="30,8 12,8 12,4 2,12 12,20 12,16 30,16"
            {...commonProps}
          />
        </svg>
      );
    case "arrow-up":
      return (
        <svg {...svgProps}>
          <polygon
            points="8,22 8,10 4,10 16,2 28,10 24,10 24,22"
            {...commonProps}
          />
        </svg>
      );
    case "arrow-down":
      return (
        <svg {...svgProps}>
          <polygon
            points="8,2 8,14 4,14 16,22 28,14 24,14 24,2"
            {...commonProps}
          />
        </svg>
      );
    default:
      return (
        <svg {...svgProps}>
          <rect x="2" y="4" width="28" height="16" rx="2" {...commonProps} />
        </svg>
      );
  }
};
