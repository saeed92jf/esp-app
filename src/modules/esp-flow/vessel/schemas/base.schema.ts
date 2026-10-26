import { z } from "zod";
import { MaterialSchema } from "../data/materialDatabase";

export { MaterialSchema };

// Base unit system for calculations and inputs
export const UnitSystemSchema = z.enum(["SI", "Imperial"]);
export type UnitSystem = z.infer<typeof UnitSystemSchema>;

// Shared schemas across multiple components
export const NodePositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

// The standard 6-condition weight summary produced by the aggregator
export const WeightSummarySchema = z.object({
  fabricatedWeight: z.number().describe("وزن ساختهشده (Empty) — kg"),
  erectionWeight: z.number().describe("وزن نصب (Empty + Internals) — kg"),
  shippingWeight: z.number().describe("وزن حملونقل — kg"),
  operatingWeight: z.number().describe("وزن عملیاتی — kg"),
  hydrotestWeight: z.number().describe("وزن هیدروتست (آب کامل) — kg"),
  rawWeight: z.number().describe("وزن ورق اولیه (Blank/Cutting) — kg"),
});
export type WeightSummary = z.infer<typeof WeightSummarySchema>;

// All nodes share this base payload
export const BaseNodeDataSchema = z.object({
  label: z.string().optional(),
  status: z.enum(["Complete", "Preliminary"]).default("Preliminary"),
  excludeFromWeight: z.boolean().default(false),
});
