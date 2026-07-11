// src/modules/claude-flow/utils/geometry.ts
// ─────────────────────────────────────────────────────────────────────────
// Formulas backing the two calculator nodes (geometryCalcNode, beamCalcNode).
// Pure functions, no React/store dependency, so they're easy to unit test.
// ─────────────────────────────────────────────────────────────────────────

export type GeometryShape =
  | "rectangle"
  | "square"
  | "circle"
  | "triangle"
  | "cylinder"
  | "sphere"
  | "cuboid"
  | "hollowCircle"
  | "iBeam";
export type GeometryMode = "perimeter" | "area" | "volume";

/** Which numeric inputs each shape needs, in display order. Keys match the ones read in computeGeometry.
 *  NOTE: rectangle/triangle/hollowCircle/iBeam intentionally share the exact same field keys as
 *  BEAM_SHAPE_FIELDS below — this is what lets a single shapeNode feed either calculator
 *  without any field-name translation (see components/nodes/BaseNode.tsx's ShapeNode). */
export const GEOMETRY_SHAPE_FIELDS: Record<GeometryShape, { key: string; label: string }[]> = {
  rectangle: [
    { key: "width", label: "Width" },
    { key: "height", label: "Height" },
  ],
  square: [{ key: "side", label: "Side" }],
  circle: [{ key: "radius", label: "Radius" }],
  triangle: [
    { key: "sideA", label: "Side a" },
    { key: "sideB", label: "Side b" },
    { key: "sideC", label: "Side c" },
    { key: "base", label: "Base" },
    { key: "height", label: "Height" },
  ],
  cylinder: [
    { key: "radius", label: "Radius" },
    { key: "height", label: "Height" },
  ],
  sphere: [{ key: "radius", label: "Radius" }],
  cuboid: [
    { key: "width", label: "Width" },
    { key: "height", label: "Height" },
    { key: "depth", label: "Depth" },
  ],
  hollowCircle: [
    { key: "outerDiameter", label: "Outer diameter (D)" },
    { key: "innerDiameter", label: "Inner diameter (d)" },
  ],
  iBeam: [
    { key: "flangeWidth", label: "Flange width (B)" },
    { key: "totalHeight", label: "Total height (H)" },
    { key: "flangeThickness", label: "Flange thickness (tf)" },
    { key: "webThickness", label: "Web thickness (tw)" },
  ],
};

/** Which modes make physical sense for each shape (2D-only shapes have no volume, etc.). */
export const GEOMETRY_SHAPE_MODES: Record<GeometryShape, GeometryMode[]> = {
  rectangle: ["perimeter", "area"],
  square: ["perimeter", "area"],
  circle: ["perimeter", "area"],
  triangle: ["perimeter", "area"],
  cylinder: ["perimeter", "area", "volume"],
  sphere: ["area", "volume"],
  cuboid: ["perimeter", "area", "volume"],
  hollowCircle: ["perimeter", "area"],
  iBeam: ["perimeter", "area"],
};

export function computeGeometry(shape: GeometryShape, mode: GeometryMode, inputs: Record<string, number>): number | null {
  const n = (key: string) => inputs[key] ?? 0;

  switch (shape) {
    case "rectangle": {
      const w = n("width");
      const h = n("height");
      if (mode === "perimeter") return 2 * (w + h);
      if (mode === "area") return w * h;
      return null;
    }
    case "square": {
      const a = n("side");
      if (mode === "perimeter") return 4 * a;
      if (mode === "area") return a * a;
      return null;
    }
    case "circle": {
      const r = n("radius");
      if (mode === "perimeter") return 2 * Math.PI * r; // circumference
      if (mode === "area") return Math.PI * r * r;
      return null;
    }
    case "triangle": {
      const a = n("sideA");
      const b = n("sideB");
      const c = n("sideC");
      const base = n("base");
      const height = n("height");
      if (mode === "perimeter") return a + b + c;
      if (mode === "area") return 0.5 * base * height;
      return null;
    }
    case "cylinder": {
      const r = n("radius");
      const h = n("height");
      if (mode === "perimeter") return 2 * Math.PI * r; // base circumference
      if (mode === "area") return 2 * Math.PI * r * (r + h); // total surface area
      if (mode === "volume") return Math.PI * r * r * h;
      return null;
    }
    case "sphere": {
      const r = n("radius");
      if (mode === "area") return 4 * Math.PI * r * r; // surface area
      if (mode === "volume") return (4 / 3) * Math.PI * r ** 3;
      return null;
    }
    case "cuboid": {
      const w = n("width");
      const h = n("height");
      const d = n("depth");
      if (mode === "perimeter") return 4 * (w + h + d); // sum of all edges
      if (mode === "area") return 2 * (w * h + w * d + h * d); // total surface area
      if (mode === "volume") return w * h * d;
      return null;
    }
    case "hollowCircle": {
      const D = n("outerDiameter");
      const d = n("innerDiameter");
      const R = D / 2;
      const r = d / 2;
      if (mode === "perimeter") return Math.PI * (D + d); // outer + inner circumference
      if (mode === "area") return Math.PI * (R * R - r * r); // annulus area
      return null;
    }
    case "iBeam": {
      const B = n("flangeWidth");
      const H = n("totalHeight");
      const tf = n("flangeThickness");
      const tw = n("webThickness");
      if (mode === "perimeter") return 4 * B + 2 * H - 2 * tw; // full outline perimeter
      if (mode === "area") return 2 * (B * tf) + (H - 2 * tf) * tw; // two flanges + web
      return null;
    }
    default:
      return null;
  }
}

// ── Second moment of area (moment of inertia) for beam cross-sections ──────
// Ix is about the horizontal centroidal axis — the standard value used for
// bending-stiffness calculations (I in the beam-bending formula σ = M·y/I).

export type BeamShape = "rectangle" | "circle" | "hollowCircle" | "triangle" | "iBeam";

export const BEAM_SHAPE_FIELDS: Record<BeamShape, { key: string; label: string }[]> = {
  rectangle: [
    { key: "width", label: "Width (b)" },
    { key: "height", label: "Height (h)" },
  ],
  circle: [{ key: "diameter", label: "Diameter (d)" }],
  hollowCircle: [
    { key: "outerDiameter", label: "Outer diameter (D)" },
    { key: "innerDiameter", label: "Inner diameter (d)" },
  ],
  triangle: [
    { key: "base", label: "Base (b)" },
    { key: "height", label: "Height (h)" },
  ],
  iBeam: [
    { key: "flangeWidth", label: "Flange width (B)" },
    { key: "totalHeight", label: "Total height (H)" },
    { key: "flangeThickness", label: "Flange thickness (tf)" },
    { key: "webThickness", label: "Web thickness (tw)" },
  ],
};

export function computeSecondMomentOfArea(shape: BeamShape, inputs: Record<string, number>): number | null {
  const n = (key: string) => inputs[key] ?? 0;

  switch (shape) {
    case "rectangle": {
      const b = n("width");
      const h = n("height");
      return (b * h ** 3) / 12;
    }
    case "circle": {
      const d = n("diameter");
      return (Math.PI * d ** 4) / 64;
    }
    case "hollowCircle": {
      const D = n("outerDiameter");
      const d = n("innerDiameter");
      return (Math.PI * (D ** 4 - d ** 4)) / 64;
    }
    case "triangle": {
      const b = n("base");
      const h = n("height");
      // About the centroidal axis (h/3 from the base)
      return (b * h ** 3) / 36;
    }
    case "iBeam": {
      const B = n("flangeWidth");
      const H = n("totalHeight");
      const tf = n("flangeThickness");
      const tw = n("webThickness");
      const innerHeight = H - 2 * tf;
      return (B * H ** 3 - (B - tw) * innerHeight ** 3) / 12;
    }
    default:
      return null;
  }
}

/** Whether a shapeNode's chosen shape also has a defined beam (Ix) formula. */
export function isBeamCompatible(shape: GeometryShape): shape is BeamShape {
  return shape in BEAM_SHAPE_FIELDS;
}

/** Converts a shapeNode's {shapeKind, shapeInputs} into the field set computeSecondMomentOfArea
 *  expects. Only "circle" needs translation (radius → diameter) — every other shared shape
 *  (rectangle/triangle/hollowCircle/iBeam) already uses identical field keys in both catalogs. */
export function toBeamInputs(shape: GeometryShape, inputs: Record<string, number>): Record<string, number> {
  if (shape === "circle") return { diameter: 2 * (inputs.radius ?? 0) };
  return inputs;
}
