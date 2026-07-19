import { z } from "zod";
import { MaterialSchema, BaseNodeDataSchema } from "./base.schema";

export const DemisterPadSchema = z.object({
  padType: z.enum(["WIRE_MESH_KNITTED","VANE_PACK","FIBER_BED"]),
  shape: z.enum(["CIRCULAR","ANNULAR"]),
  outerDiameter_mm: z.number().positive(),
  innerDiameter_mm: z.number().default(0),
  padThickness_mm: z.number().positive().default(150),
  bulkDensity_kg_m3: z.number().positive(),
  wireDiameter_mm: z.number().optional(),
  voidFraction_pct: z.number().min(90).max(99.9).default(97),
  wireMaterial: MaterialSchema,

  supportGrid: z.object({
    type: z.enum(["FLAT_BAR_GRID","GRATING","PERFORATED_PLATE"]),
    diameter_mm: z.number().positive(),
    thickness_mm: z.number().positive(),
    barSpacing_mm: z.number().positive().default(200),
    barProfile_mm: z.tuple([z.number(), z.number()]),
    numberOfBarsLong: z.number().int().positive(),
    numberOfBarsTransverse: z.number().int().positive(),
    gridMaterial: MaterialSchema,
  }),

  supportRing: z.object({
    innerDiameter_mm: z.number().positive(),
    width_mm: z.number().positive().default(50),
    thickness_mm: z.number().positive().default(8),
    material: MaterialSchema,
    connectionType: z.enum(["WELDED","BOLTED"]),
  }),

  tieDownClips: z.object({
    quantity: z.number().int().min(4).max(12).default(6),
    clipDimensions_mm: z.tuple([z.number(), z.number(), z.number()]),
    boltSize_mm: z.number().positive().default(12),
    numberOfBoltsPerClip: z.number().int().default(1),
    material: MaterialSchema,
  }),
});

export const TrayTypeSchema = z.enum([
  "SIEVE",
  "VALVE_FIXED",
  "VALVE_FLOAT",
  "BUBBLE_CAP",
  "DUAL_FLOW",
]);

export const TraySchema = z.object({
  trayId: z.string(),
  trayType: TrayTypeSchema,
  trayNumber: z.number().int().positive(),

  deck: z.object({
    innerDiameter_mm: z.number().positive(),
    thickness_mm: z.number().positive(),
    holeAreaFraction_pct: z.number().min(0).max(50).optional(),
    holeDiameter_mm: z.number().positive().optional(),
    material: MaterialSchema,
    passConfiguration: z.enum(["SINGLE","DOUBLE","TRIPLE","FOUR_PASS"]).default("SINGLE"),
  }),

  valves: z.object({
    quantity: z.number().int().positive(),
    weightPerValve_kg: z.number().positive(),
    material: MaterialSchema,
  }).optional(),

  bubbleCaps: z.object({
    quantity: z.number().int().positive(),
    weightPerCap_kg: z.number().positive(),
    material: MaterialSchema,
  }).optional(),
});

export const InternalsNodeDataSchema = BaseNodeDataSchema.extend({
  demister: DemisterPadSchema.optional(),
  trays: z.array(TraySchema).default([]),
  
  // Custom fixed weight internals
  customInternalsWeight_kg: z.number().optional(),

  // Computed outputs
  calculatedWeight: z.number().optional(),
});
export type InternalsNodeData = z.infer<typeof InternalsNodeDataSchema>;
