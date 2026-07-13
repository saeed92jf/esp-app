export type ShapeType = "cuboids" | "pyramids";

export type HeroFlowData = {
  color: string;
  shape: ShapeType;
  zoom: number;
};

export const FLOW_THEME = {
  color: "var(--color-primary)",
  light: "var(--color-primary-100)",
};
