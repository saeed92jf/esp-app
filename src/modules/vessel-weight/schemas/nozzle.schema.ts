import { z } from "zod";
import { BaseNodeDataSchema } from "./base.schema";

export const NozzleSchema = z.object({
  id: z.string(),
  nozzleId: z.string(),

  // GENERAL DATA
  tag: z.string().default("N1"),
  qty: z.number().int().min(1).default(1),
  service: z.string().default("Process"),
  size: z.string().default('2"'),
  matGroup: z.string().default("Carbon Steel"),

  // COMPLETE WITH (Accessories)
  hasBlindFlange: z.boolean().default(false),
  hasDavitHinge: z.boolean().default(false),
  davitHingeType: z.enum(["DAVIT", "HINGE"]).default("DAVIT"),
  
  hasInternalDevice: z.boolean().default(false),
  internalDeviceType: z.enum(["DEFLECTOR", "VORTEX_BREAKER"]).default("DEFLECTOR"),
  
  hasInternalPipe: z.boolean().default(false),
  internalPipeLength: z.number().default(200),
  internalPipeUnitWeight: z.number().default(10), // kg/m
  
  hasExternalPipe: z.boolean().default(false),
  externalPipeLength: z.number().default(500),
  externalPipeUnitWeight: z.number().default(10), // kg/m

  // NOZZLE FLANGE
  hasFlange: z.boolean().default(true),
  flangeType: z.enum(["WN","SO","LWN","BL","LJ","SW","THR"]).default("WN"),
  flangeRef: z.enum(["ASME_B16_5", "ASME_B16_47_A", "ASME_B16_47_B", "CUSTOM"]).default("ASME_B16_5"),
  flangeForm: z.enum(["FORGING", "PLATE", "CASTING"]).default("FORGING"),
  flangeMaterial: z.string().default("SA-105"),
  flangeClass: z.enum(["150","300","400","600","900","1500","2500"]).default("150"),
  flangeSch: z.string().default("STD"),
  flangeFace: z.enum(["RF","FF","RTJ","TG"]).default("RF"),
  flangeUnitWeight: z.number().default(5), // kg/pcs
  blindFlangeUnitWeight: z.number().default(5), // kg/pcs

  // NOZZLE NECK
  hasNeck: z.boolean().default(true),
  neckForm: z.enum(["PIPE", "ROLLED_PLATE"]).default("PIPE"),
  neckMaterial: z.string().default("SA-106 B"),
  neckType: z.enum(["SEAMLESS", "WELDED"]).default("SEAMLESS"),
  neckSch: z.string().default("STD"),
  neckLength: z.number().default(150),
  neckUnitWeight: z.number().default(15), // kg/m if pipe
  neckOD: z.number().default(60.3), // mm
  neckThickness: z.number().default(3.91), // mm

  // NOZZLE REINFORCED
  hasReinforcement: z.boolean().default(false),
  reinforcementForm: z.enum(["PAD", "HUB"]).default("PAD"),
  reinforcementMaterial: z.string().default("SA-516 70"),
  
  // Pad details
  padOD: z.number().default(150), // mm
  padID: z.number().default(61.3), // mm
  padThk: z.number().default(10), // mm
  
  // Hub details
  hubThk: z.number().default(20), // mm
  hubLength: z.number().default(50), // mm
  taperLength: z.number().default(25), // mm
  
  reinforcementUnitWeight: z.number().default(0), // Usually calculated, but user can override

  // OUTPUTS
  flangeTotalWeight_kg: z.number().optional(),
  neckTotalWeight_kg: z.number().optional(),
  reinforcementTotalWeight_kg: z.number().optional(),
  accessoriesTotalWeight_kg: z.number().optional(),
  totalFabricatedWeight_kg: z.number().optional(),
});
export type Nozzle = z.infer<typeof NozzleSchema>;

export const NozzleNodeDataSchema = BaseNodeDataSchema.extend({
  nozzles: z.array(NozzleSchema),
  totalFabricatedWeight: z.number().optional(),
});
export type NozzleNodeData = z.infer<typeof NozzleNodeDataSchema>;
