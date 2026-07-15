export type ShapeType = "cuboids" | "pyramids";

export type HeroFlowData = {
  color: string;
  shape: ShapeType;
  zoom: number;
};

// Global theme color variable mapping using Tailwind CSS v4 custom properties
export const FLOW_THEME = {
  color: "var(--color-primary)",
  light: "var(--color-primary-100)",
} as const;
