/**
 * src/modules/vessel-weight/calculations/shell.calc.ts
 * Pure calculation functions for shell components.
 */

/**
 * وزن استوانه (Cylindrical Shell) — ASME UG-27
 */
export function calcCylindricalShellWeight(
  ID_mm: number,
  t_purchased_mm: number,
  millTol_pct: number,
  L_mm: number,
  density_kg_m3: number,
  nozzleAreas_mm2: number[] = []
): number {
  const t = t_purchased_mm * (1 + millTol_pct / 100);
  const OD = ID_mm + 2 * t;
  const V_gross_mm3 = (Math.PI / 4) * (OD ** 2 - ID_mm ** 2) * L_mm;

  // Subtract nozzle holes
  const V_holes_mm3 = nozzleAreas_mm2.reduce((sum, A) => sum + A * t, 0);

  const V_net_m3 = (V_gross_mm3 - V_holes_mm3) / 1e9;
  return V_net_m3 * density_kg_m3;
}

/**
 * وزن Shell مخروطی (Conical Shell) — ASME UG-32(g)
 */
export function calcConicalShellWeight(
  R1_mm: number,          // Large radius
  R2_mm: number,          // Small radius
  alpha_deg: number,      // Half apex angle (for concentric)
  t_mm: number,           // Thickness
  density_kg_m3: number,
  isEccentric: boolean = false,
  H_mm?: number           // Vertical height (for eccentric)
): number {
  const alpha_rad = (alpha_deg * Math.PI) / 180;
  let Ls_mm: number;
  if (isEccentric && H_mm) {
    Ls_mm = Math.sqrt(H_mm ** 2 + (R1_mm - R2_mm) ** 2);
  } else {
    Ls_mm = (R1_mm - R2_mm) / Math.sin(alpha_rad);
  }
  const A_lateral_mm2 = Math.PI * (R1_mm + R2_mm) * Ls_mm;
  const V_m3 = (A_lateral_mm2 * t_mm) / 1e9;
  return V_m3 * density_kg_m3;
}

/**
 * وزن Knuckle در اتصال مخروط به استوانه (Toriconical)
 */
export function calcKnuckleWeight(
  R_mm: number,
  r_knuckle_mm: number,
  t_mm: number,
  density_kg_m3: number
): number {
  // Approximation Patel & Bailey
  const V_m3 = (2 * Math.PI ** 2 * R_mm * r_knuckle_mm ** 2 * t_mm) / 1e9;
  return V_m3 * density_kg_m3;
}

/**
 * وزن خالص ورق (Raw / Cutting Weight)
 */
export function calcShellRawWeight(
  ID_mm: number,
  t_mm: number,
  L_mm: number,
  numberOfLongSeams: number,
  density_kg_m3: number,
  millTol_pct: number
): number {
  const t_actual = t_mm * (1 + millTol_pct / 100);
  const OD = ID_mm + 2 * t_actual;
  const circumference = Math.PI * OD;
  // Plate dimensions with allowances (20mm brake each side, 30mm shrinkage)
  const plateWidth = circumference / numberOfLongSeams + 40;
  const plateLength = L_mm + 30;
  const V_m3 = (plateWidth * plateLength * t_actual * numberOfLongSeams) / 1e9;
  return V_m3 * density_kg_m3;
}
