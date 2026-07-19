import { z } from "zod";
import { MaterialSchema, BaseNodeDataSchema } from "./base.schema";

export const HeadTypeSchema = z.enum([
  "ELLIPTICAL_2_1",          // 2:1 Semi-Ellipsoidal — ASME UG-32(d)
  "TORISPHERICAL_ASME",      // Torispherical 6% (L=Do, r=0.06Do) — ASME UG-32(e)
  "TORISPHERICAL_DIN28011",  // Klöpper Head — DIN 28011 (L=Di, r=0.1Di)
  "TORISPHERICAL_KORBBOGEN", // Korbbogen — DIN 28013 (L=0.8Di, r=0.154Di)
  "HEMISPHERICAL",           // Hemispherical — ASME UG-32(c)
  "CONICAL_FLAT",            // Flat Conical
  "FLAT_PLATE",              // Flat Plate — ASME UG-34
  "STANDARD_CAP",            // Standard Cap (for nozzles)
]);
export type HeadType = z.infer<typeof HeadTypeSchema>;

export const HeadPositionSchema = z.enum(["TOP","BOTTOM","LEFT","RIGHT","NONE"]);
export type HeadPosition = z.infer<typeof HeadPositionSchema>;

export const HeadSchema = z.object({
  headId: z.string(),
  headType: HeadTypeSchema,
  position: HeadPositionSchema.default("TOP"),

  // Dimensions
  insideDiameter_mm: z.number().positive().describe("ID هد — mm"),
  thicknessAfterForming_mm: z.number().positive().describe("ضخامت بعد از فرمینگ (Min. A.F.) — mm"),
  thicknessBeforeForming_mm: z.number().positive().describe("ضخامت ورق اولیه (Before Forming B.F.) — mm"),
  straightFlange_mm: z.number().min(0).default(40).describe("طول Straight Flange (S.F.) — mm — معمولاً 38~50mm"),

  // For pipe cap
  pipeNominalSize_inch: z.string().optional(),
  pipeSchedule: z.string().optional(),
  pipeThicknessTolerance_pct: z.number().default(12.5),

  // Torispherical parameters
  crownRadius_mm: z.number().optional().describe("شعاع کروی مرکزی (Crown Radius L) — mm"),
  knuckleRadius_mm: z.number().optional().describe("شعاع Knuckle (r) — mm"),

  // Forming
  formingType: z.enum(["COLD","HOT"]).default("COLD"),
  thinningAllowance_pct: z.number().min(0).max(30).default(10)
    .describe("درصد نازکشدن در Knuckle — معمولاً 10~15% برای Cold Forming"),

  material: MaterialSchema.default("CS_A516_70"),
  blankDiameter_mm: z.number().optional().describe("قطر Blank (ورق گرد اولیه) — mm — برای Raw Weight"),

  // Raw Plate Explicit Dimensions (if user wants to override)
  rawPlateWidth_mm: z.number().optional().describe("عرض ورق خام — mm"),
  rawPlateLength_mm: z.number().optional().describe("طول ورق خام — mm"),

  // Welds
  longitudinalWeldSeams: z.number().int().min(0).default(0),
  circumferentialWeldSeams: z.number().int().min(0).default(1),
  longitudinalRadiography: z.enum(['FULL', 'SPOT', 'NONE']).default('SPOT'),
  circumferentialRadiography: z.enum(['FULL', 'SPOT', 'NONE']).default('SPOT'),

  // Segmented Head
  isSegmented: z.boolean().default(false),
  numberOfPetals: z.number().int().min(0).default(0).describe("تعداد Petal در هد چندتکه"),
  crownPieceIncluded: z.boolean().default(false),

  // Openings
  nozzleOpeningsOnHead: z.array(z.object({
    nozzleId: z.string(),
    openingDiameter_mm: z.number().positive(),
  })).default([]),
});
export type Head = z.infer<typeof HeadSchema>;

export const HeadNodeDataSchema = BaseNodeDataSchema.extend({
  heads: z.array(HeadSchema),
  
  // Calculated output
  calculatedWeight: z.number().optional(),
  internalVolume: z.number().optional(),
  rawWeight: z.number().optional(),
  area_m2: z.number().optional(),
  weldLength_m: z.number().optional(),
  electrodeWeight_kg: z.number().optional(),
  elongation_pct: z.number().optional(),
});
export type HeadNodeData = z.infer<typeof HeadNodeDataSchema>;
