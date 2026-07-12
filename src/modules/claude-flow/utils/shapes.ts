// src/modules/claude-flow/utils/shapes.ts
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SVG geometry builders for diagram node shapes.
//
// Why SVG instead of CSS clip-path (the previous approach in BaseNode.tsx):
//  - clip-path draws a straight-line polygon on top of a rectangular border,
//    so hexagon/diamond/parallelogram borders come out uneven in thickness
//    and get visibly blurry at fractional zoom levels.
//  - A handful of shapes (cylinder, folded-corner note) cannot be expressed
//    as a single convex/concave polygon at all.
//  - A real <path>/<ellipse> stays crisp at any zoom and scales correctly
//    when the node is resized non-uniformly via <NodeResizer>.
//
// Reference: https://reactflow.dev/api-reference (NodeResizer, NodeProps)
//            https://xyflow.com/ (custom node guide recommends SVG/canvas
//            for anything beyond a plain rounded rectangle)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import type { DiagramNodeType } from "../types";

export type ShapeGeometry =
  | { kind: "path"; path: string }
  | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number }
  | {
      kind: "cylinder";
      bodyPath: string;
      capCx: number;
      capCy: number;
      capRx: number;
      capRy: number;
    }
  | { kind: "note"; outline: string; fold: string }
  | {
      kind: "predefinedProcess";
      outer: string;
      barX1: number;
      barX2: number;
      barTop: number;
      barBottom: number;
    }
  | { kind: "none" };

/** Default pixel size used the first time a node of a given shape is created. */
export const SHAPE_DEFAULT_SIZE: Record<
  DiagramNodeType,
  { width: number; height: number }
> = {
  defaultNode: { width: 160, height: 60 },
  inputNode: { width: 130, height: 52 },
  outputNode: { width: 130, height: 52 },
  circleNode: { width: 90, height: 90 },
  diamondNode: { width: 150, height: 100 },
  cylinderNode: { width: 120, height: 90 },
  parallelogramNode: { width: 160, height: 60 },
  hexagonNode: { width: 160, height: 70 },
  textNode: { width: 140, height: 36 },
  noteNode: { width: 160, height: 70 },
  triangleNode: { width: 120, height: 100 },
  cloudNode: { width: 160, height: 100 },
  documentNode: { width: 150, height: 80 },
  predefinedProcessNode: { width: 170, height: 64 },
  delayNode: { width: 140, height: 64 },
  groupNode: { width: 320, height: 220 },
  numberNode: { width: 140, height: 56 },
  operatorNode: { width: 160, height: 104 },
  constantNode: { width: 190, height: 150 },
  geometryCalcNode: { width: 220, height: 370 },
  beamCalcNode: { width: 240, height: 390 },
  shapeNode: { width: 200, height: 330 },
  imageNode: { width: 220, height: 160 },
  svgNode: { width: 220, height: 160 },
  dwgNode: { width: 200, height: 90 },
  dxfNode: { width: 200, height: 90 },
};

/** Rounded-rectangle outline, inset by `inset` so a thick stroke never clips. */
function roundedRect(w: number, h: number, r: number, inset: number): string {
  const rr = Math.max(0, Math.min(r, w / 2 - inset, h / 2 - inset));
  return (
    `M ${inset + rr},${inset} ` +
    `H ${w - inset - rr} ` +
    `A ${rr},${rr} 0 0 1 ${w - inset},${inset + rr} ` +
    `V ${h - inset - rr} ` +
    `A ${rr},${rr} 0 0 1 ${w - inset - rr},${h - inset} ` +
    `H ${inset + rr} ` +
    `A ${rr},${rr} 0 0 1 ${inset},${h - inset - rr} ` +
    `V ${inset + rr} ` +
    `A ${rr},${rr} 0 0 1 ${inset + rr},${inset} Z`
  );
}

/** Full "stadium" / pill shape used for the Start & End terminator nodes. */
function stadium(w: number, h: number, inset: number): string {
  return roundedRect(w, h, h / 2, inset);
}

/**
 * Resolves the SVG geometry for a given node shape and pixel size.
 * `borderRadius` only affects `defaultNode`, mirroring the per-node
 * "Corner Radius" setting already exposed in the settings panel.
 */
export function getShapeGeometry(
  shape: DiagramNodeType,
  width: number,
  height: number,
  borderRadius = 8,
): ShapeGeometry {
  const inset = 1;
  const w = Math.max(width, 8);
  const h = Math.max(height, 8);

  switch (shape) {
    case "inputNode":
    case "outputNode":
      return { kind: "path", path: stadium(w, h, inset) };

    case "diamondNode":
      return {
        kind: "path",
        path: `M ${w / 2},${inset} L ${w - inset},${h / 2} L ${w / 2},${h - inset} L ${inset},${h / 2} Z`,
      };

    case "hexagonNode": {
      const dx = Math.min(w * 0.22, 32);
      return {
        kind: "path",
        path: `M ${dx},${inset} L ${w - dx},${inset} L ${w - inset},${h / 2} L ${w - dx},${h - inset} L ${dx},${h - inset} L ${inset},${h / 2} Z`,
      };
    }

    case "parallelogramNode": {
      const skew = Math.min(w * 0.18, 28);
      return {
        kind: "path",
        path: `M ${skew},${inset} L ${w - inset},${inset} L ${w - skew},${h - inset} L ${inset},${h - inset} Z`,
      };
    }

    case "circleNode":
      return {
        kind: "ellipse",
        cx: w / 2,
        cy: h / 2,
        rx: Math.max(1, w / 2 - inset),
        ry: Math.max(1, h / 2 - inset),
      };

    case "cylinderNode": {
      const ry = Math.min(14, h * 0.22);
      const top = inset + ry;
      const bottom = h - inset - ry;
      const rx = w / 2 - inset;
      // Body: left side down, bottom arc, right side up, top arc back to start.
      // The top cap is redrawn as its own <ellipse> on top so the "rim" reads
      // correctly regardless of fill/stroke colors.
      const bodyPath =
        `M ${inset},${top} ` +
        `L ${inset},${bottom} ` +
        `A ${rx},${ry} 0 0 0 ${w - inset},${bottom} ` +
        `L ${w - inset},${top} ` +
        `A ${rx},${ry} 0 0 0 ${inset},${top} Z`;
      return { kind: "cylinder", bodyPath, capCx: w / 2, capCy: top, capRx: rx, capRy: ry };
    }

    case "noteNode": {
      const fold = Math.min(18, w * 0.15, h * 0.4);
      const outline =
        `M ${inset},${inset} ` +
        `L ${w - fold - inset},${inset} ` +
        `L ${w - inset},${inset + fold} ` +
        `L ${w - inset},${h - inset} ` +
        `L ${inset},${h - inset} Z`;
      const fold_ =
        `M ${w - fold - inset},${inset} ` +
        `L ${w - fold - inset},${inset + fold} ` +
        `L ${w - inset},${inset + fold}`;
      return { kind: "note", outline, fold: fold_ };
    }

    case "textNode":
      return { kind: "none" };

    case "triangleNode":
      return {
        kind: "path",
        path: `M ${w / 2},${inset} L ${w - inset},${h - inset} L ${inset},${h - inset} Z`,
      };

    case "cloudNode": {
      // Rough cloud silhouette built from overlapping bumps, scaled to the bounding box.
      const path =
        `M ${w * 0.25},${h * 0.78} ` +
        `C ${w * 0.04},${h * 0.78} ${w * 0.0},${h * 0.42} ${w * 0.22},${h * 0.38} ` +
        `C ${w * 0.2},${h * 0.12} ${w * 0.52},${h * 0.02} ${w * 0.62},${h * 0.26} ` +
        `C ${w * 0.8},${h * 0.1} ${w * 1.0},${h * 0.32} ${w * 0.86},${h * 0.48} ` +
        `C ${w * 1.0},${h * 0.54} ${w * 0.96},${h * 0.78} ${w * 0.75},${h * 0.78} Z`;
      return { kind: "path", path };
    }

    case "documentNode": {
      // Rectangle with a single wavy bottom edge, like a "document" flowchart symbol.
      const waveH = Math.min(14, h * 0.18);
      const path =
        `M ${inset},${inset} ` +
        `L ${w - inset},${inset} ` +
        `L ${w - inset},${h - inset - waveH} ` +
        `C ${w * 0.75},${h - inset} ${w * 0.25},${h - inset - waveH * 2} ${inset},${h - inset - waveH} Z`;
      return { kind: "path", path };
    }

    case "predefinedProcessNode": {
      const barInset = Math.min(14, w * 0.12);
      return {
        kind: "predefinedProcess",
        outer: roundedRect(w, h, 4, inset),
        barX1: barInset,
        barX2: w - barInset,
        barTop: inset,
        barBottom: h - inset,
      };
    }

    case "delayNode": {
      // "D" shape — flat left edge, fully rounded right edge.
      const r = h / 2 - inset;
      const path =
        `M ${inset},${inset} ` +
        `L ${w - r - inset},${inset} ` +
        `A ${r},${r} 0 0 1 ${w - r - inset},${h - inset} ` +
        `L ${inset},${h - inset} Z`;
      return { kind: "path", path };
    }

    case "groupNode":
      // Rendered by its own component (GroupNode), not through ShapeCanvas/SVG.
      return { kind: "none" };

    case "numberNode":
    case "operatorNode":
    case "constantNode":
      // Rendered by their own components (NumberNode/OperatorNode/ConstantNode), not through ShapeCanvas/SVG.
      return { kind: "none" };

    case "geometryCalcNode":
    case "beamCalcNode":
      // Rendered by their own components, not through ShapeCanvas/SVG.
      return { kind: "none" };

    case "shapeNode":
      // Rendered by its own component, not through ShapeCanvas/SVG.
      return { kind: "none" };

    case "imageNode":
      // Rendered by its own component, not through ShapeCanvas/SVG.
      return { kind: "none" };

    case "svgNode":
    case "dwgNode":
    case "dxfNode":
      // Rendered by their own components, not through ShapeCanvas/SVG.
      return { kind: "none" };

    case "defaultNode":
    default:
      return { kind: "path", path: roundedRect(w, h, borderRadius, inset) };
  }
}


