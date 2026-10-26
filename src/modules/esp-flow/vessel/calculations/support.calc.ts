/**
 * src/modules/vessel-weight/calculations/support.calc.ts
 * Pure calculation functions for support types (Skirt, Leg, Lug, Saddle).
 */

export function calcRectPlateWeight(width_mm: number, length_mm: number, thickness_mm: number, qty: number, density_kg_m3: number): number {
  if (width_mm <= 0 || length_mm <= 0 || thickness_mm <= 0 || qty <= 0) return 0;
  const V_m3 = (width_mm * length_mm * thickness_mm) / 1e9;
  return V_m3 * density_kg_m3 * qty;
}

export function calcAnnularRingWeight(id_mm: number, od_mm: number, thickness_mm: number, qty: number, density_kg_m3: number): number {
  if (id_mm <= 0 || od_mm <= id_mm || thickness_mm <= 0 || qty <= 0) return 0;
  const area_mm2 = (Math.PI / 4) * (od_mm ** 2 - id_mm ** 2);
  const V_m3 = (area_mm2 * thickness_mm) / 1e9;
  return V_m3 * density_kg_m3 * qty;
}

export function calcCylinderWeight(id_mm: number, thickness_mm: number, height_mm: number, qty: number, density_kg_m3: number): number {
  if (id_mm <= 0 || thickness_mm <= 0 || height_mm <= 0 || qty <= 0) return 0;
  const od_mm = id_mm + 2 * thickness_mm;
  const area_mm2 = (Math.PI / 4) * (od_mm ** 2 - id_mm ** 2);
  const V_m3 = (area_mm2 * height_mm) / 1e9;
  return V_m3 * density_kg_m3 * qty;
}

export function calcLegColumnWeight(height_mm: number, linearWeight_kg_m: number, qty: number): number {
  if (height_mm <= 0 || linearWeight_kg_m <= 0 || qty <= 0) return 0;
  return (height_mm / 1000) * linearWeight_kg_m * qty;
}
