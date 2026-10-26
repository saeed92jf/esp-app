/**
 * src/modules/vessel-weight/calculations/mistEliminator.calc.ts
 */

import type { DemisterData, MistEliminatorItem } from '../schemas/mistEliminator.schema';

const YORK_DENSITIES: Record<string, number> = {
  'York_431': 144, // kg/m3
  'York_421': 192,
  'York_432': 193,
};

function getDensity(material: string): number {
  return material.startsWith('SS') ? 8000 : 7850;
}

// Helper: Circular segment area from center
// Area from x=0 to x
function circleHalfArea(x: number, r: number) {
  if (Math.abs(x) >= r) return (Math.PI * r * r) / 4 * Math.sign(x);
  return 0.5 * (x * Math.sqrt(r * r - x * x) + r * r * Math.asin(x / r));
}

function calculateCircularSegments(D: number, maxWidth: number, handling: 'ENDS' | 'MIDDLE') {
  const totalSegs = Math.ceil(D / maxWidth);
  if (totalSegs <= 1) return [{ width: D, xStart: -D/2, xEnd: D/2 }];

  let widths: number[] = [];
  
  if (handling === 'ENDS') {
    const midCount = totalSegs - 2;
    const midTotal = midCount * maxWidth;
    const endWidth = (D - midTotal) / 2;
    widths.push(endWidth);
    for (let i = 0; i < midCount; i++) widths.push(maxWidth);
    widths.push(endWidth);
  } else {
    // MIDDLE handling
    const endCount = 2; // always 2 ends
    const endTotal = endCount * maxWidth;
    const midCount = totalSegs - 2;
    if (midCount > 0) {
      const midWidth = (D - endTotal) / midCount;
      widths.push(maxWidth);
      for (let i = 0; i < midCount; i++) widths.push(midWidth);
      widths.push(maxWidth);
    } else {
      widths = [D/2, D/2]; // fallback
    }
  }

  const segments = [];
  let currentX = -D/2;
  for (const w of widths) {
    segments.push({ width: w, xStart: currentX, xEnd: currentX + w });
    currentX += w;
  }
  return segments;
}

export function calcDemisterWeight(data: DemisterData) {
  const metalDensity = getDensity(data.material);
  const meshDensity = data.yorkStyle === 'Custom' ? data.customDensity_kg_m3 : (YORK_DENSITIES[data.yorkStyle] || 144);
  
  const D = data.shape === 'CIRCLE' || data.shape === 'CIRCLE_SEGMENT' ? data.diameter_mm - 2 * data.edgeGap_mm : data.width_mm;
  const L = data.shape === 'RECTANGLE' ? data.length_mm : D;
  const R = D / 2;

  let totalMeshVol = 0;
  let totalBarLength = 0;
  let totalHorizRodLength = 0;
  let totalVertRods = 0;

  let segmentsData: { width: number, xStart: number, xEnd: number }[] = [];

  if (data.shape === 'CIRCLE' || data.shape === 'CIRCLE_SEGMENT') {
    segmentsData = calculateCircularSegments(D, data.maxSegmentWidth_mm, data.remainderHandling);
    
    for (const seg of segmentsData) {
      // Area
      const area = (circleHalfArea(seg.xEnd, R) - circleHalfArea(seg.xStart, R)) * 2; // *2 for top and bottom half
      totalMeshVol += (area * data.padThickness_mm) / 1e9; // m3

      // Chords
      const chordStart = 2 * Math.sqrt(Math.max(0, R*R - seg.xStart*seg.xStart));
      const chordEnd = 2 * Math.sqrt(Math.max(0, R*R - seg.xEnd*seg.xEnd));
      
      // Arc length
      const thetaStart = Math.asin(Math.max(-1, Math.min(1, seg.xStart/R)));
      const thetaEnd = Math.asin(Math.max(-1, Math.min(1, seg.xEnd/R)));
      const arcLen = R * (thetaEnd - thetaStart) * 2; // *2 for top and bottom arc
      
      const perimeter = arcLen + chordStart + chordEnd;
      const middleBar = (chordStart + chordEnd) / 2; // approximate perpendicular bar length
      
      totalBarLength += perimeter + middleBar;

      // Horizontal Rods
      const rodCount = Math.floor(middleBar / data.rodSpacing_mm);
      totalHorizRodLength += rodCount * seg.width;
      
      // Vertical Rods (4 per horiz rod as requested)
      totalVertRods += rodCount * 4;
    }
  } else {
    // Rectangle
    segmentsData = calculateCircularSegments(L, data.maxSegmentWidth_mm, data.remainderHandling);
    for (const seg of segmentsData) {
      const area = D * seg.width;
      totalMeshVol += (area * data.padThickness_mm) / 1e9;
      
      const perimeter = 2 * D + 2 * seg.width;
      const middleBar = D;
      
      totalBarLength += perimeter + middleBar;
      
      const rodCount = Math.floor(D / data.rodSpacing_mm);
      totalHorizRodLength += rodCount * seg.width;
      totalVertRods += rodCount * 4;
    }
  }

  // Weight Calculation
  const meshWeight = totalMeshVol * meshDensity;
  
  // Bar weight
  const frameMultiplier = data.hasFrame ? (data.frameSides === '2' ? 2 : 1) : 0;
  const barArea = (data.barWidth_mm * data.barThickness_mm) / 1e6; // m2
  const barWeight = totalBarLength * frameMultiplier * 1e-3 * barArea * metalDensity;

  // Rod weight
  const horizRodArea = (Math.PI * Math.pow(data.horizontalRodDia_mm, 2)) / 4 / 1e6;
  const horizRodWeight = totalHorizRodLength * frameMultiplier * 1e-3 * horizRodArea * metalDensity;

  const vertRodLen = data.padThickness_mm + (frameMultiplier * data.barThickness_mm);
  const vertRodArea = (Math.PI * Math.pow(data.verticalRodDia_mm, 2)) / 4 / 1e6;
  const vertRodWeight = totalVertRods * vertRodLen * 1e-3 * vertRodArea * metalDensity;

  const gridWeight = barWeight + horizRodWeight + vertRodWeight;

  // Beams
  let beamsWeight = 0;
  if (data.needsSupportBeams && data.supportBeams) {
    for (const b of data.supportBeams) {
      beamsWeight += b.qty * (b.length_mm / 1000) * b.linearWeight_kg_m;
    }
  }

  const totalVertRodsLength = totalVertRods * vertRodLen; // mm
  const branchesPer6m = (length_mm: number) => Math.ceil(length_mm / 6000);

  return {
    meshWeight,
    gridWeight,
    beamsWeight,
    totalWeight: meshWeight + gridWeight + beamsWeight,
    metrics: {
      totalBarLength: totalBarLength * frameMultiplier, // mm
      barBranches_6m: branchesPer6m(totalBarLength * frameMultiplier),
      totalHorizRodLength: totalHorizRodLength * frameMultiplier, // mm
      horizRodBranches_6m: branchesPer6m(totalHorizRodLength * frameMultiplier),
      totalVertRods,
      totalVertRodsLength,
      vertRodBranches_6m: branchesPer6m(totalVertRodsLength),
      segments: segmentsData,
    }
  };
}
