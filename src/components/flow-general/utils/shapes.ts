// src/components/flow-general/utils/shapes.ts
/**
 * SVG path generators for different node shapes.
 * Each function returns a path string for the given dimensions.
 */

import type { ShapeType } from "../types";

/**
 * Generate SVG path for a circle.
 */
export function circlePath(width: number, height: number): string {
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) / 2;
  return `M ${cx - r},${cy} A ${r},${r} 0 1,0 ${cx + r},${cy} A ${r},${r} 0 1,0 ${cx - r},${cy}`;
}

/**
 * Generate SVG path for a rectangle.
 */
export function rectanglePath(width: number, height: number): string {
  return `M 0,0 L ${width},0 L ${width},${height} L 0,${height} Z`;
}

/**
 * Generate SVG path for a rounded rectangle.
 */
export function roundedRectanglePath(
  width: number,
  height: number,
  radius: number = 12,
): string {
  const r = Math.min(radius, width / 2, height / 2);
  return `
    M ${r},0
    L ${width - r},0
    Q ${width},0 ${width},${r}
    L ${width},${height - r}
    Q ${width},${height} ${width - r},${height}
    L ${r},${height}
    Q 0,${height} 0,${height - r}
    L 0,${r}
    Q 0,0 ${r},0
    Z
  `;
}

/**
 * Generate SVG path for a hexagon (flat top).
 */
export function hexagonPath(width: number, height: number): string {
  const w = width;
  const h = height;
  const dx = w * 0.25; // Horizontal offset for angled sides
  return `
    M ${dx},0
    L ${w - dx},0
    L ${w},${h / 2}
    L ${w - dx},${h}
    L ${dx},${h}
    L 0,${h / 2}
    Z
  `;
}

/**
 * Generate SVG path for an octagon.
 */
export function octagonPath(width: number, height: number): string {
  const w = width;
  const h = height;
  const dx = w * 0.3; // Corner cut size
  const dy = h * 0.3;
  return `
    M ${dx},0
    L ${w - dx},0
    L ${w},${dy}
    L ${w},${h - dy}
    L ${w - dx},${h}
    L ${dx},${h}
    L 0,${h - dy}
    L 0,${dy}
    Z
  `;
}

/**
 * Generate SVG path for a diamond.
 */
export function diamondPath(width: number, height: number): string {
  const cx = width / 2;
  const cy = height / 2;
  return `M ${cx},0 L ${width},${cy} L ${cx},${height} L 0,${cy} Z`;
}

/**
 * Generate SVG path for an ellipse.
 */
export function ellipsePath(width: number, height: number): string {
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2;
  const ry = height / 2;
  return `M ${cx - rx},${cy} A ${rx},${ry} 0 1,0 ${cx + rx},${cy} A ${rx},${ry} 0 1,0 ${cx - rx},${cy}`;
}

/**
 * Get path generator function for a shape type.
 */
export function getShapePath(
  shape: ShapeType,
  width: number,
  height: number,
): string {
  switch (shape) {
    case "circle":
      return circlePath(width, height);
    case "rectangle":
      return rectanglePath(width, height);
    case "rounded-rectangle":
      return roundedRectanglePath(width, height);
    case "hexagon":
      return hexagonPath(width, height);
    case "octagon":
      return octagonPath(width, height);
    case "diamond":
      return diamondPath(width, height);
    case "ellipse":
      return ellipsePath(width, height);
    default:
      return rectanglePath(width, height);
  }
}

/**
 * Calculate handle position coordinates based on shape and handle definition.
 * Returns { x, y } in local node coordinates.
 */
export function calculateHandlePosition(
  shape: ShapeType,
  position: "top" | "right" | "bottom" | "left",
  width: number,
  height: number,
  index: number = 0,
  total: number = 1,
): { x: number; y: number } {
  const cx = width / 2;
  const cy = height / 2;

  // For shapes like hexagon and octagon, adjust positions to match angled edges
  switch (position) {
    case "top":
      return {
        x: cx + ((index - (total - 1) / 2) * width) / (total + 1),
        y: 0,
      };
    case "bottom":
      return {
        x: cx + ((index - (total - 1) / 2) * width) / (total + 1),
        y: height,
      };
    case "left":
      return {
        x: 0,
        y: cy + ((index - (total - 1) / 2) * height) / (total + 1),
      };
    case "right":
      return {
        x: width,
        y: cy + ((index - (total - 1) / 2) * height) / (total + 1),
      };
  }
}
