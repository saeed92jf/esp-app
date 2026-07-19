import { z } from "zod";
import { MaterialSchema } from "./base.schema";
import { BaseNodeDataSchema } from "./base.schema";

export const ShellTypeSchema = z.enum([
  "CYLINDRICAL",   // Cylindrical — common
  "SPHERICAL",     // Spherical — high pressure
  "CONICAL",       // Conical — transition
]);
export type ShellType = z.infer<typeof ShellTypeSchema>;

export const ShellCourseSchema = z.object({
  courseId: z.string(),
  shellType: ShellTypeSchema.default("CYLINDRICAL"),

  // Primary dimensions
  insideDiameter_mm: z.number().positive().describe("قطر داخلی (ID) — mm"),
  purchasedThickness_mm: z.number().positive().default(10).describe("ضخامت واقعی ورق یا لوله خریداری شده (پس از فرمینگ و خرید)"),
  
  // Material
  material: MaterialSchema.default("CS_A516_70"),

  length_mm: z.number().positive().describe("طول Course از TL به TL — mm"),
  numberOfCourses: z.number().int().positive().default(1),

  // For pipe
  builtFromPipe: z.boolean().default(false),
  pipeNominalSize_inch: z.string().optional(),
  pipeSchedule: z.string().optional(),
  pipeThicknessTolerance_pct: z.number().default(12.5).describe("تلرانس منفی ضخامت لوله — درصد (معمولاً 12.5)"),

  // For conical shells
  conicalLargeDiameter_mm: z.number().optional().describe("قطر بزرگ مخروط — mm"),
  conicalSmallDiameter_mm: z.number().optional().describe("قطر کوچک مخروط — mm"),
  conicalHalfApexAngle_deg: z.number().min(0).max(89).optional().describe("نیمزاویه رأس مخروط α — درجه (ASME UG-32)"),
  conicalType: z.enum(["CONCENTRIC","ECCENTRIC"]).optional(),
  conicalKnuckleRadiusLarge_mm: z.number().optional().describe("Knuckle radius در قطر بزرگ — mm"),
  conicalKnuckleRadiusSmall_mm: z.number().optional().describe("Knuckle radius در قطر کوچک — mm"),

  // Raw Plate Explicit Dimensions (if user wants to override)
  rawPlateWidth_mm: z.number().optional().describe("عرض ورق خام (جهت محاسبه دقیق طول جوش و متریال پرت) — mm"),
  rawPlateLength_mm: z.number().optional().describe("طول ورق خام — mm"),

  // Welds
  longitudinalWeldSeams: z.number().int().min(0).default(1).describe("تعداد درز جوش طولی در این Course"),
  circumferentialWeldSeams: z.number().int().min(0).default(0).describe("تعداد درز جوش محیطی (بین Courseها)"),
  longitudinalRadiography: z.enum(['FULL', 'SPOT', 'NONE']).default('SPOT'),
  circumferentialRadiography: z.enum(['FULL', 'SPOT', 'NONE']).default('SPOT'),

  // Nozzle cutouts
  nozzleOpeningsOnThisCourse: z.array(z.object({
    nozzleId: z.string(),
    openingDiameter_mm: z.number().positive(),
    openingShape: z.enum(["CIRCULAR","OBLONG"]),
    oblongLength_mm: z.number().optional(),
  })).default([]).describe("فهرست سوراخهای نازل/منهول این Course که از وزن Shell کسر میشوند"),

  corrosionAllowance_mm: z.number().min(0).default(3).describe("CA — mm — در Nominal Weight هست ولی در Corroded Weight کسر میشود"),
});
export type ShellCourse = z.infer<typeof ShellCourseSchema>;

export const ShellNodeDataSchema = BaseNodeDataSchema.extend({
  courses: z.array(ShellCourseSchema).default([]),
  
  // Calculated output
  calculatedWeight: z.number().optional(),
  rawWeight: z.number().optional(),
});
export type ShellNodeData = z.infer<typeof ShellNodeDataSchema>;
