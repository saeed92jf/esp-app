import { z } from "zod";
import { MaterialSchema, BaseNodeDataSchema } from "./base.schema";

export const AttachmentTypeSchema = z.enum(["NAME_PLATE", "LIFTING_LUG", "TURNING_LUG", "INSULATION_SUPPORT"]);
export type AttachmentType = z.infer<typeof AttachmentTypeSchema>;

export const BaseAttachmentSchema = z.object({
  id: z.string(),
  type: AttachmentTypeSchema,
  material: MaterialSchema.default("CS_A516_70"),
  tag: z.string().optional(),
});

export const NamePlateSchema = BaseAttachmentSchema.extend({
  type: z.literal("NAME_PLATE"),
  width_mm: z.number().positive().default(200),
  length_mm: z.number().positive().default(300),
  thickness_mm: z.number().positive().default(3),
  bracketThickness_mm: z.number().positive().default(5),
  qty: z.number().int().positive().default(1),
});
export type NamePlateData = z.infer<typeof NamePlateSchema>;

export const LiftingLugSchema = BaseAttachmentSchema.extend({
  type: z.literal("LIFTING_LUG"),
  qty: z.number().int().positive().default(2),
  mainPlate: z.object({
    width_mm: z.number().positive().default(250),
    length_mm: z.number().positive().default(400),
    thickness_mm: z.number().positive().default(25),
  }),
  hasRepad: z.boolean().default(true),
  repad: z.object({
    width_mm: z.number().positive().default(350),
    length_mm: z.number().positive().default(500),
    thickness_mm: z.number().positive().default(15),
  }).optional(),
});
export type LiftingLugData = z.infer<typeof LiftingLugSchema>;

export const TurningLugSchema = BaseAttachmentSchema.extend({
  type: z.literal("TURNING_LUG"),
  qty: z.number().int().positive().default(1),
  mainPlate: z.object({
    width_mm: z.number().positive().default(300),
    length_mm: z.number().positive().default(500),
    thickness_mm: z.number().positive().default(30),
  }),
  hasRepad: z.boolean().default(true),
  repad: z.object({
    width_mm: z.number().positive().default(400),
    length_mm: z.number().positive().default(600),
    thickness_mm: z.number().positive().default(20),
  }).optional(),
});
export type TurningLugData = z.infer<typeof TurningLugSchema>;

export const InsulationSupportSchema = BaseAttachmentSchema.extend({
  type: z.literal("INSULATION_SUPPORT"),
  qtyOfRings: z.number().int().positive().default(4),
  vesselOuterDiameter_mm: z.number().positive().default(1000),
  ringWidth_mm: z.number().positive().default(50), // Protrusion from shell
  ringThickness_mm: z.number().positive().default(6),
});
export type InsulationSupportData = z.infer<typeof InsulationSupportSchema>;

// Discriminated union of all attachment types
export const AttachmentItemSchema = z.discriminatedUnion("type", [
  NamePlateSchema,
  LiftingLugSchema,
  TurningLugSchema,
  InsulationSupportSchema,
]);

export type AttachmentItem = z.infer<typeof AttachmentItemSchema>;

export const AttachmentsNodeDataSchema = BaseNodeDataSchema.extend({
  attachments: z.array(AttachmentItemSchema).default([]),
  totalFabricatedWeight: z.number().optional(),
});
export type AttachmentsNodeData = z.infer<typeof AttachmentsNodeDataSchema>;
