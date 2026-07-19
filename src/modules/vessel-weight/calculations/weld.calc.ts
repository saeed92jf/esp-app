/**
 * src/modules/vessel-weight/calculations/weld.calc.ts
 * Calculation functions for Weld lengths and Electrode consumption.
 */

/**
 * Calculates the length of longitudinal and circumferential seams for a cylindrical shell.
 */
export function calcShellWeldLengths(
  ID_mm: number,
  L_mm: number,
  longSeamsCount: number,
  circSeamsCount: number,
  rawPlateLength_mm?: number,
  rawPlateWidth_mm?: number
): { longWeldLength_m: number; circWeldLength_m: number; totalLength_m: number; actualLongSeams: number; actualCircSeams: number } {
  const OD_m = ID_mm / 1000;
  
  let actualLongSeams = longSeamsCount;
  let actualCircSeams = circSeamsCount;

  if (rawPlateLength_mm && rawPlateLength_mm > 0 && rawPlateWidth_mm && rawPlateWidth_mm > 0) {
    const circ_mm = Math.PI * ID_mm;
    // Number of plates needed around the circumference
    actualLongSeams = Math.ceil(circ_mm / rawPlateLength_mm);
    // If it's exactly 1 plate, it's 1 seam to close it. If >1, it's N seams.
    if (actualLongSeams === 0) actualLongSeams = 1;
    
    // Number of plates needed along the length
    const rings = Math.ceil(L_mm / rawPlateWidth_mm);
    actualCircSeams = rings > 0 ? rings - 1 : 0;
  }

  const circWeld_m = (Math.PI * OD_m) * actualCircSeams;
  const longWeld_m = (L_mm / 1000) * actualLongSeams;
  
  return {
    longWeldLength_m: longWeld_m,
    circWeldLength_m: circWeld_m,
    totalLength_m: longWeld_m + circWeld_m,
    actualLongSeams,
    actualCircSeams
  };
}

/**
 * Calculates electrode consumption (kg) using an empirical formula based on plate thickness.
 * Assuming single V-groove for < 20mm and double V-groove for >= 20mm.
 * A rough empirical factor is 0.015 * t for kg per meter of weld (simplified).
 */
export function calcElectrodeConsumption(
  totalWeldLength_m: number,
  thickness_mm: number
): number {
  if (totalWeldLength_m <= 0 || thickness_mm <= 0) return 0;
  
  let kgPerMeter = 0;
  // Very simple empirical lookup for weld deposit weight
  if (thickness_mm <= 6) kgPerMeter = 0.2;
  else if (thickness_mm <= 10) kgPerMeter = 0.4;
  else if (thickness_mm <= 15) kgPerMeter = 0.8;
  else if (thickness_mm <= 20) kgPerMeter = 1.2;
  else if (thickness_mm <= 30) kgPerMeter = 1.8;
  else kgPerMeter = 2.5 + (thickness_mm - 30) * 0.1;

  // Add 30% for electrode waste/stub ends
  const efficiencyMultiplier = 1.3;
  return totalWeldLength_m * kgPerMeter * efficiencyMultiplier;
}

/**
 * Calculates basic Area and Volume for Cylindrical Shell
 */
export function calcShellGeometry(
  ID_mm: number,
  length_mm: number
): { area_m2: number; volume_m3: number } {
  const r_m = (ID_mm / 2) / 1000;
  const L_m = length_mm / 1000;
  const area_m2 = 2 * Math.PI * r_m * L_m;
  const volume_m3 = Math.PI * (r_m ** 2) * L_m;
  return { area_m2, volume_m3 };
}
