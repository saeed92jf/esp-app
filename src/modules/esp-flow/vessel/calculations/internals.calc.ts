/**
 * src/modules/vessel-weight/calculations/internals.calc.ts
 * Pure calculation functions for internal components.
 */

export function calcDemisterPadWeight(
  OD_mm: number, ID_mm: number, t_mm: number,
  bulkDensity_kg_m3: number
): number {
  const A_mm2 = (Math.PI / 4) * (OD_mm ** 2 - ID_mm ** 2);
  const V_m3 = (A_mm2 * t_mm) / 1e9;
  return V_m3 * bulkDensity_kg_m3;
}

export function calcFlatBarGridWeight(
  diameter_mm: number,
  barWidth_mm: number,
  barHeight_mm: number,
  nLong: number,
  nTrans: number,
  density_kg_m3: number
): number {
  const barLength_mm = diameter_mm;
  const V_one_bar_m3 = (barLength_mm * barWidth_mm * barHeight_mm) / 1e9;
  const totalBars = nLong + nTrans;
  // Approximated intersection subtraction
  const intersections = nLong * nTrans;
  const V_intersection_m3 = (barWidth_mm ** 2 * barHeight_mm * intersections) / 1e9;
  return (V_one_bar_m3 * totalBars - V_intersection_m3) * density_kg_m3;
}
