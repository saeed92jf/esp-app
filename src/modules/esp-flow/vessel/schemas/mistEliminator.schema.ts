import { z } from "zod";
import { MaterialSchema, BaseNodeDataSchema } from "./base.schema";

export const MistShapeSchema = z.enum(["CIRCLE", "CIRCLE_SEGMENT", "RECTANGLE"]);
export const RemainderHandlingSchema = z.enum(["ENDS", "MIDDLE"]);

export const YorkStyleSchema = z.enum(["York_431", "York_421", "York_432", "Custom"]);

export const BeamProfileSchema = z.object({
  profileName: z.string().default("I-Beam 100x50"),
  qty: z.number().int().positive().default(1),
  length_mm: z.number().positive().default(1000),
  linearWeight_kg_m: z.number().positive().default(10),
});

export const DemisterSchema = z.object({
  id: z.string(),
  type: z.literal("DEMISTER"),
  tag: z.string().default("ME-001"),
  shape: MistShapeSchema.default("CIRCLE"),
  
  // Dimensions
  diameter_mm: z.number().positive().default(1500),
  width_mm: z.number().positive().default(1500), // for rectangle
  length_mm: z.number().positive().default(1500), // for rectangle

  padThickness_mm: z.number().positive().default(150),
  maxSegmentWidth_mm: z.number().positive().default(400),
  remainderHandling: RemainderHandlingSchema.default("ENDS"),
  
  material: MaterialSchema.default("SS_304"),
  yorkStyle: YorkStyleSchema.default("York_431"),
  customDensity_kg_m3: z.number().positive().default(144), // used if YorkStyle is Custom

  hasFrame: z.boolean().default(true),
  frameSides: z.enum(["1", "2"]).default("2"), // 1 side or 2 sides
  edgeGap_mm: z.number().nonnegative().default(15),
  
  barWidth_mm: z.number().positive().default(25),
  barThickness_mm: z.number().positive().default(3),
  
  rodSpacing_mm: z.number().positive().default(150),
  horizontalRodDia_mm: z.number().positive().default(6),
  verticalRodDia_mm: z.number().positive().default(6),

  needsSupportBeams: z.boolean().default(false),
  supportBeams: z.array(BeamProfileSchema).default([]),
});
export type DemisterData = z.infer<typeof DemisterSchema>;

export const MistEliminatorItemSchema = z.discriminatedUnion("type", [
  DemisterSchema,
  // Later we can add VanePackSchema, CycloneSchema here
]);
export type MistEliminatorItem = z.infer<typeof MistEliminatorItemSchema>;

export const MistEliminatorNodeDataSchema = BaseNodeDataSchema.extend({
  equipments: z.array(MistEliminatorItemSchema).default([]),
  totalFabricatedWeight: z.number().optional(),
});
export type MistEliminatorNodeData = z.infer<typeof MistEliminatorNodeDataSchema>;
