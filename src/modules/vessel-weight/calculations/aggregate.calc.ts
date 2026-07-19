/**
 * src/modules/vessel-weight/calculations/aggregate.calc.ts
 * Aggregates all node weights into the 6 standard weight conditions.
 */

import type { WeightSummary } from "../schemas/base.schema";

export interface AggregateInput {
  fabricatedWeight_kg: number;
  internalsWeight_kg: number;
  shippedInternalsWeight_kg: number;
  internalVolume_m3: number;
  operatingFluidDensity_kg_m3: number;
  hydrotestFluidDensity_kg_m3: number; // usually 1000 for water
  rawMaterialWeight_kg: number;
}

/**
 * Produces the final 6-condition weight summary for the vessel.
 */
export function aggregateVesselWeights(input: AggregateInput): WeightSummary {
  const {
    fabricatedWeight_kg,
    internalsWeight_kg,
    shippedInternalsWeight_kg,
    internalVolume_m3,
    operatingFluidDensity_kg_m3,
    hydrotestFluidDensity_kg_m3,
    rawMaterialWeight_kg,
  } = input;

  // Operating fluid weight
  const operatingFluidWeight = internalVolume_m3 * operatingFluidDensity_kg_m3;
  
  // Hydrotest water weight
  const hydrotestFluidWeight = internalVolume_m3 * hydrotestFluidDensity_kg_m3;

  return {
    fabricatedWeight: fabricatedWeight_kg,
    erectionWeight: fabricatedWeight_kg + internalsWeight_kg,
    shippingWeight: fabricatedWeight_kg + shippedInternalsWeight_kg,
    operatingWeight: fabricatedWeight_kg + internalsWeight_kg + operatingFluidWeight,
    hydrotestWeight: fabricatedWeight_kg + internalsWeight_kg + hydrotestFluidWeight,
    rawWeight: rawMaterialWeight_kg,
  };
}
