import type { NodeShape } from "../types/diagram.types";
// Maps each NodeShape to its Tailwind CSS classes for layout and clip-path
export function getNodeShapeClasses(shape: NodeShape): string {
  switch (shape) {
    case "circle":
      return "rounded-full aspect-square";
    case "diamond":
      return "rotate-45";
    case "parallelogram":
      return "skew-x-12";
    case "hexagon":
      return ""; // handled via clip-path in getNodeShapeStyle
    case "cylinder":
      return "rounded-t-full rounded-b-full";
    case "rounded":
      return "rounded-2xl";
    case "rectangle":
    default:
      return "rounded-none";
  }
}
// Returns inline CSS style overrides for shapes that require clip-path
export function getNodeShapeStyle(shape: NodeShape): React.CSSProperties {
  switch (shape) {
    case "hexagon":
      return {
        clipPath:
          "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
      };
    case "parallelogram":
      return {
        clipPath: "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)",
      };
    default:
      return {};
  }
}
// Returns the human-readable display name for a shape
export function getShapeDisplayName(shape: NodeShape): string {
  const names: Record<NodeShape, string> = {
    rectangle: "Rectangle",
    rounded: "Rounded",
    circle: "Circle",
    diamond: "Diamond",
    parallelogram: "Parallelogram",
    hexagon: "Hexagon",
    cylinder: "Cylinder",
    custom: "Custom",
  };
  return names[shape] ?? shape;
}
// All shapes available in the node palette (excludes "custom")
export const AVAILABLE_SHAPES: NodeShape[] = [
  "rectangle",
  "rounded",
  "circle",
  "diamond",
  "parallelogram",
  "hexagon",
  "cylinder",
];
