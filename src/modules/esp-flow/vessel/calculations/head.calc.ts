/**
 * src/modules/vessel-weight/calculations/head.calc.ts
 * Pure calculation functions for head components.
 */

export interface HeadCalcResult {
  weight_kg: number;
  internalVolume_m3: number;
  depth_mm: number;
  area_m2: number;
}

/**
 * هد نیمبیضوی 2:1 (Elliptical 2:1) — ASME UG-32(d)
 */
export function calcElliptical21HeadWeight(
  ID_mm: number,
  t_af_mm: number,          // Thickness after forming
  SF_mm: number,            // Straight flange length
  density_kg_m3: number,
  nozzleAreas_mm2: number[] = []
): HeadCalcResult {
  const a = ID_mm / 2;
  const b = ID_mm / 4;           // 2:1 ratio
  const OD = ID_mm + 2 * t_af_mm;

  // Oblate spheroid surface area
  const e = Math.sqrt(1 - (b / a) ** 2);
  const A_ellipsoid_mm2 = 2 * Math.PI * a ** 2 * (1 + ((1 - e ** 2) / e) * Math.atanh(e));

  // Crown + SF volumes
  const V_crown_mm3 = A_ellipsoid_mm2 * t_af_mm;
  const V_SF_mm3 = (Math.PI / 4) * ((OD ** 2) - (ID_mm ** 2)) * SF_mm;

  const V_holes_mm3 = nozzleAreas_mm2.reduce((s, A) => s + A * t_af_mm, 0);
  const V_total_m3 = (V_crown_mm3 + V_SF_mm3 - V_holes_mm3) / 1e9;
  
  const weight_kg = V_total_m3 * density_kg_m3;
  const internalVolume_m3 = (Math.PI * ID_mm ** 3 / 24) / 1e9;

  const area_m2 = A_ellipsoid_mm2 / 1e6;

  return { weight_kg, internalVolume_m3, depth_mm: b, area_m2 };
}

/**
 * هد Torispherical (ASME 6%, Klöpper, Korbbogen)
 */
export function calcTorishericalHeadWeight(
  ID_mm: number,
  t_af_mm: number,
  SF_mm: number,
  crownRadius_mm: number,
  knuckleRadius_mm: number,
  density_kg_m3: number,
  nozzleAreas_mm2: number[] = []
): HeadCalcResult {
  const OD = ID_mm + 2 * t_af_mm;
  const L = crownRadius_mm;
  const r = knuckleRadius_mm;
  const R_i = ID_mm / 2;

  // Head depth
  const h = L - Math.sqrt((L - r) ** 2 - (R_i - r) ** 2);

  // Crown area
  const theta_c = Math.asin((R_i - r) / (L - r));
  const h_c = L * (1 - Math.cos(theta_c));
  const A_crown_mm2 = 2 * Math.PI * L * h_c;

  // Knuckle area
  const A_knuckle_mm2 = 2 * Math.PI ** 2 * r * (R_i - r) * (theta_c / (Math.PI / 2));

  // Straight Flange
  const A_SF_mm2 = Math.PI * OD * SF_mm;

  // Total volume
  const V_total_mm3 = (A_crown_mm2 + A_knuckle_mm2 + A_SF_mm2) * t_af_mm;
  const V_holes_mm3 = nozzleAreas_mm2.reduce((s, A) => s + A * t_af_mm, 0);
  const V_net_m3 = (V_total_mm3 - V_holes_mm3) / 1e9;

  // Internal volume approx
  const V_internal_m3 = (Math.PI * h / 3 * (3 * L * h - h ** 2)) / 1e9;

  const area_m2 = (A_crown_mm2 + A_knuckle_mm2) / 1e6;

  return {
    weight_kg: V_net_m3 * density_kg_m3,
    internalVolume_m3: V_internal_m3,
    depth_mm: h,
    area_m2,
  };
}

/**
 * هد نیمکروی (Hemispherical) — ASME UG-32(c)
 */
export function calcHemisphericalHeadWeight(
  ID_mm: number,
  t_af_mm: number,
  SF_mm: number,
  density_kg_m3: number
): HeadCalcResult {
  const R = ID_mm / 2;
  const A_hemi_mm2 = 2 * Math.PI * R ** 2;
  const A_SF_mm2 = Math.PI * (ID_mm + 2 * t_af_mm) * SF_mm;
  const V_m3 = ((A_hemi_mm2 + A_SF_mm2) * t_af_mm) / 1e9;
  const V_internal_m3 = ((2 / 3) * Math.PI * R ** 3) / 1e9;
  
  const area_m2 = A_hemi_mm2 / 1e6;
  return { weight_kg: V_m3 * density_kg_m3, internalVolume_m3: V_internal_m3, depth_mm: R, area_m2 };
}

/**
 * وزن Blank (ورق گرد اولیه برای Raw Weight)
 */
export function calcHeadBlankWeight(
  blankDiameter_mm: number,
  t_bf_mm: number,          // Thickness Before Forming
  density_kg_m3: number
): number {
  const A_mm2 = (Math.PI / 4) * blankDiameter_mm ** 2;
  return (A_mm2 * t_bf_mm / 1e9) * density_kg_m3;
}
