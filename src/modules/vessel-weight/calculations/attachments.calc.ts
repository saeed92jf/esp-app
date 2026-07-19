/**
 * src/modules/vessel-weight/calculations/attachments.calc.ts
 * Weight calculations for various external attachments.
 */

import type { 
  AttachmentItem, 
  NamePlateData, 
  LiftingLugData, 
  TurningLugData, 
  InsulationSupportData 
} from '../schemas/attachments.schema';

function getDensity(material: string): number {
  return material.startsWith('SS') ? 8000 : 7850;
}

export function calcNamePlateWeight(data: NamePlateData): number {
  const density = getDensity(data.material);
  // Volume of name plate + equivalent volume of bracket
  const plateV = (data.width_mm * data.length_mm * data.thickness_mm) / 1e9;
  const bracketV = (data.width_mm * data.length_mm * data.bracketThickness_mm) / 1e9;
  return (plateV + bracketV) * density * data.qty;
}

export function calcLiftingLugWeight(data: LiftingLugData): number {
  const density = getDensity(data.material);
  const mainV = (data.mainPlate.width_mm * data.mainPlate.length_mm * data.mainPlate.thickness_mm) / 1e9;
  let repadV = 0;
  if (data.hasRepad && data.repad) {
    repadV = (data.repad.width_mm * data.repad.length_mm * data.repad.thickness_mm) / 1e9;
  }
  return (mainV + repadV) * density * data.qty;
}

export function calcTurningLugWeight(data: TurningLugData): number {
  const density = getDensity(data.material);
  const mainV = (data.mainPlate.width_mm * data.mainPlate.length_mm * data.mainPlate.thickness_mm) / 1e9;
  let repadV = 0;
  if (data.hasRepad && data.repad) {
    repadV = (data.repad.width_mm * data.repad.length_mm * data.repad.thickness_mm) / 1e9;
  }
  return (mainV + repadV) * density * data.qty;
}

export function calcInsulationSupportWeight(data: InsulationSupportData): number {
  const density = getDensity(data.material);
  const id_mm = data.vesselOuterDiameter_mm;
  const od_mm = id_mm + (2 * data.ringWidth_mm);
  
  if (od_mm <= id_mm) return 0;

  const area_mm2 = (Math.PI / 4) * (od_mm ** 2 - id_mm ** 2);
  const V_m3 = (area_mm2 * data.ringThickness_mm) / 1e9;
  
  return V_m3 * density * data.qtyOfRings;
}

export function calcAttachmentWeight(item: AttachmentItem): number {
  switch (item.type) {
    case 'NAME_PLATE':
      return calcNamePlateWeight(item as NamePlateData);
    case 'LIFTING_LUG':
      return calcLiftingLugWeight(item as LiftingLugData);
    case 'TURNING_LUG':
      return calcTurningLugWeight(item as TurningLugData);
    case 'INSULATION_SUPPORT':
      return calcInsulationSupportWeight(item as InsulationSupportData);
    default:
      return 0;
  }
}
