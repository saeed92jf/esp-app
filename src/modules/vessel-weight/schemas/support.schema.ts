import { z } from "zod";
import { MaterialSchema, BaseNodeDataSchema } from "./base.schema";

export const SupportTypeSchema = z.enum(["SKIRT", "LEG", "LUG", "SADDLE"]);
export type SupportType = z.infer<typeof SupportTypeSchema>;

// Skirt
export const SkirtSchema = z.object({
  topMaterial: MaterialSchema.default("CS_A516_70"),
  bottomMaterial: MaterialSchema.default("CS_A516_70"),
  height_mm: z.number().min(0).default(2000), 
  
  skirtShell: z.object({
    innerDiameter_mm: z.number().default(1000),
    thickness_mm: z.number().default(10),
  }),

  // Base Ring
  baseRing: z.object({
    innerDiameter_mm: z.number().default(1000),
    outerDiameter_mm: z.number().default(1200),
    thickness_mm: z.number().default(20),
  }),

  // Gusset Plate
  gussetPlate: z.object({
    qty: z.number().default(12),
    length_mm: z.number().default(200),
    width_mm: z.number().default(150),
    thickness_mm: z.number().default(15),
  }),

  // Top Section (Exclusive: Top Plate OR Top Ring)
  hasTopPlate: z.boolean().default(false),
  topPlate: z.object({
    width_mm: z.number().default(1200),
    length_mm: z.number().default(1200),
    thickness_mm: z.number().default(20),
  }),
  
  hasTopRing: z.boolean().default(false),
  topRing: z.object({
    innerDiameter_mm: z.number().default(1000),
    outerDiameter_mm: z.number().default(1200),
    thickness_mm: z.number().default(20),
  }),

  // Template / Gauge Plate
  hasTemplatePlate: z.boolean().default(false),
  templatePlate: z.object({
    innerDiameter_mm: z.number().default(1050),
    outerDiameter_mm: z.number().default(1250),
    thickness_mm: z.number().default(5),
  }),
});
export type SkirtData = z.infer<typeof SkirtSchema>;

// Leg
export const LegSchema = z.object({
  column: z.object({
    type: z.string().default("PIPE"), // e.g. PIPE, I-Beam
    qty: z.number().default(4),
    profileSize: z.string().default("DN150"), 
    linearWeight_kg_m: z.number().default(30), 
    height_mm: z.number().default(1500),
  }),
  basePlate: z.object({ width_mm: z.number().default(200), length_mm: z.number().default(200), thickness_mm: z.number().default(15), qty: z.number().default(4) }),
  coverPlate: z.object({ width_mm: z.number().default(150), length_mm: z.number().default(150), thickness_mm: z.number().default(10), qty: z.number().default(4) }),
  reinforcePlate: z.object({ width_mm: z.number().default(150), length_mm: z.number().default(150), thickness_mm: z.number().default(10), qty: z.number().default(4) }),
});
export type LegData = z.infer<typeof LegSchema>;

// Lug
export const LugSchema = z.object({
  basePlate: z.object({ width_mm: z.number().default(200), length_mm: z.number().default(200), thickness_mm: z.number().default(15), qty: z.number().default(4) }),
  gussetPlate: z.object({ width_mm: z.number().default(150), length_mm: z.number().default(150), thickness_mm: z.number().default(10), qty: z.number().default(8) }),
  topPlate: z.object({ width_mm: z.number().default(150), length_mm: z.number().default(150), thickness_mm: z.number().default(10), qty: z.number().default(4) }),
  reinforcePlate: z.object({ width_mm: z.number().default(200), length_mm: z.number().default(200), thickness_mm: z.number().default(15), qty: z.number().default(4) }),
});
export type LugData = z.infer<typeof LugSchema>;

// Saddle
export const SaddleSchema = z.object({
  numberOfSaddles: z.number().default(2),
  basePlate: z.object({ width_mm: z.number().default(300), length_mm: z.number().default(1500), thickness_mm: z.number().default(20), qty: z.number().default(2) }),
  wearPlate: z.object({ width_mm: z.number().default(400), length_mm: z.number().default(1600), thickness_mm: z.number().default(15), qty: z.number().default(2) }),
  webPlate: z.object({ width_mm: z.number().default(300), length_mm: z.number().default(1500), thickness_mm: z.number().default(12), qty: z.number().default(2) }),
  ribPlate: z.object({ width_mm: z.number().default(150), length_mm: z.number().default(300), thickness_mm: z.number().default(10), qty: z.number().default(8) }),
});
export type SaddleData = z.infer<typeof SaddleSchema>;

export const SupportNodeDataSchema = BaseNodeDataSchema.extend({
  supportType: SupportTypeSchema.default("SKIRT"),
  material: MaterialSchema.default("CS_A516_70"), // Global fallback for general plates
  
  skirt: SkirtSchema.optional(),
  leg: LegSchema.optional(),
  lug: LugSchema.optional(),
  saddle: SaddleSchema.optional(),

  // Computed weights
  totalFabricatedWeight: z.number().optional(),
});
export type SupportNodeData = z.infer<typeof SupportNodeDataSchema>;
