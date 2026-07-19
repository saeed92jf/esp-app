import { Nozzle } from '../schemas/nozzle.schema';

function getDensity(material: string): number {
  return material.startsWith('SS') ? 8000 : 7850;
}

export function calcNozzleWeight(n: Nozzle): Partial<Nozzle> {
  const density = getDensity(n.flangeMaterial); // simplifying for now
  
  let flangeWeight = 0;
  if (n.hasFlange) {
    flangeWeight += n.flangeUnitWeight;
    if (n.hasBlindFlange) {
      flangeWeight += n.blindFlangeUnitWeight;
    }
  }

  let neckWeight = 0;
  if (n.hasNeck) {
    // If pipe, unit weight is kg/m, length in mm
    if (n.neckForm === 'PIPE') {
      neckWeight = (n.neckLength / 1000) * n.neckUnitWeight;
    } else {
      // Rolled plate. Unit weight is just total weight input by user, or calculated by volume
      if (n.neckUnitWeight > 0) {
        neckWeight = n.neckUnitWeight;
      } else {
        const meanDia = n.neckOD - n.neckThickness;
        const volume_m3 = (Math.PI * meanDia * n.neckThickness * n.neckLength) / 1e9;
        neckWeight = volume_m3 * getDensity(n.neckMaterial);
      }
    }
  }

  let reinWeight = 0;
  if (n.hasReinforcement) {
    if (n.reinforcementUnitWeight > 0) {
      reinWeight = n.reinforcementUnitWeight;
    } else {
      const reinDensity = getDensity(n.reinforcementMaterial);
      if (n.reinforcementForm === 'PAD') {
        const area_m2 = (Math.PI / 4) * (Math.pow(n.padOD, 2) - Math.pow(n.padID, 2)) / 1e6;
        reinWeight = area_m2 * (n.padThk / 1000) * reinDensity;
      } else if (n.reinforcementForm === 'HUB') {
        // Simplified hub calculation (cylinder)
        const meanDia = n.neckOD + n.hubThk;
        const volume_m3 = (Math.PI * meanDia * n.hubThk * n.hubLength) / 1e9;
        // ignoring taper precise volume for simplicity here, just adding bounding box
        reinWeight = volume_m3 * reinDensity;
      }
    }
  }

  let accessoriesWeight = 0;
  if (n.hasInternalPipe) {
    accessoriesWeight += (n.internalPipeLength / 1000) * n.internalPipeUnitWeight;
  }
  if (n.hasExternalPipe) {
    accessoriesWeight += (n.externalPipeLength / 1000) * n.externalPipeUnitWeight;
  }
  // Rough weights for Davit/Deflector
  if (n.hasDavitHinge) accessoriesWeight += 15;
  if (n.hasInternalDevice) accessoriesWeight += 5;

  const totalPerNozzle = flangeWeight + neckWeight + reinWeight + accessoriesWeight;
  const totalWeight = totalPerNozzle * n.qty;

  return {
    flangeTotalWeight_kg: flangeWeight * n.qty,
    neckTotalWeight_kg: neckWeight * n.qty,
    reinforcementTotalWeight_kg: reinWeight * n.qty,
    accessoriesTotalWeight_kg: accessoriesWeight * n.qty,
    totalFabricatedWeight_kg: totalWeight,
  };
}
