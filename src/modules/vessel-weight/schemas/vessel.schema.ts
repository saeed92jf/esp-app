import { z } from "zod";
import { MaterialSchema, UnitSystemSchema, WeightSummarySchema, BaseNodeDataSchema } from "./base.schema";

export const VesselOrientationSchema = z.enum(["VERTICAL", "HORIZONTAL"]);
export type VesselOrientation = z.infer<typeof VesselOrientationSchema>;

export const VesselRootSchema = z.object({
  vesselTag: z.string().default("V-001"),
  orientation: VesselOrientationSchema.default("VERTICAL"),
  unitSystem: UnitSystemSchema.default("SI"),
  defaultMaterial: MaterialSchema.default("CS_A516_70"),

  // Densities for operating and hydrotest calculations
  processFluidDensity_kg_m3: z.number().positive().default(1000).describe("چگالی سیال فرآیندی (Operating)"),
  testFluidDensity_kg_m3: z.number().default(1000).describe("چگالی سیال تست (معمولاً آب 1000)"),
  defaultDiameter_mm: z.number().optional().describe("قطر پیشفرض برای انتقال به نودهای زیرین"),
  defaultLength_mm: z.number().optional().describe("طول پیشفرض برای انتقال به نودهای زیرین"),
  defaultRawPlateLength_mm: z.number().optional().describe("طول پیشفرض ورق خام (جهت محاسبه اتوماتیک درز جوش)"),
  defaultRawPlateWidth_mm: z.number().optional().describe("عرض پیشفرض ورق خام"),

  // Summaries that are populated globally
  weightSummary: WeightSummarySchema.optional(),
  
  // Validation issues
  missingInputs: z.array(z.string()).optional(),
});

export type VesselRoot = z.infer<typeof VesselRootSchema>;

export const VesselRootNodeDataSchema = BaseNodeDataSchema.extend({
  vessel: VesselRootSchema,
});

export type VesselRootNodeData = z.infer<typeof VesselRootNodeDataSchema>;

// Define a unified type for all vessel flow nodes for the store
export type VesselWeightNodeType = 
  | 'vesselRootNode'
  | 'shellNode'
  | 'headNode'
  | 'nozzleNode'
  | 'skirtNode'
  | 'saddleNode'
  | 'attachmentsNode'
  | 'internalsNode';

