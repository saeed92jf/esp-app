export type ShapeType = "lapJoint" | "weldNeck";

export type HeroFlowData = {
  rotation: number;
  shape: ShapeType;
  zoom: number;
};

// Global theme color variable mapping using Tailwind CSS v4 custom properties
export const FLOW_THEME = {
  color: "var(--color-primary)",
  light: "var(--color-primary-100)",
} as const;
