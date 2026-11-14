// src/modules/customers/utils/plant-translations.ts
import type { PlantFacility, PlantProcessType } from "../types/plants.types";
import { formatLocaleNumber } from "@/lib/format-number";

const PRODUCT_TRANSLATIONS: Record<string, string> = {
  "اتیلن پلیمری": "Polymer-Grade Ethylene",
  "پروپیلن شیمیایی": "Chemical-Grade Propylene",
  "برش‌های C4 و بنزن پیرولیز": "C4 Cuts & Pyrolysis Benzene",
  "متانول گرید صنعتی AA": "AA-Grade Industrial Methanol",
  "پلی‌اتیلن سبک خطی LLDPE": "Linear Low-Density PE (LLDPE)",
  "پلی‌اتیلن سبک فیلم و اکستروژن": "Low-Density PE (LDPE Film)",
  "پلی‌اتیلن سنگین گرید بادی، فیلم و لوله": "High-Density PE (HDPE Pipe/Film)",
  "پلی‌پروپیلن نساجی، هوموپلیمر و کوپلیمر": "Polypropylene (PP Copolymer)",
  "اتیل بنزن": "Ethylbenzene",
  "پودر PVC گرید سوسپانسیون": "Suspension PVC Resin",
  "S-PVC": "S-PVC",
  "E-PVC": "E-PVC",
  "کود اوره کشاورزی گرانول": "Granular Urea Fertilizer",
  "آمونیاک مایع صنعتی": "Industrial Liquid Ammonia",
  "گرانول پلیمری ABS مهندسی": "Engineering ABS Polymer",
  "۱و۳-بوتادین استخراجی": "1,3-Butadiene",
  "بنزن": "Benzene",
  "پارا زایلین": "Para-Xylene (p-Xylene)",
  "ارتو زایلین": "Ortho-Xylene (o-Xylene)",
  "رافینیت": "Raffinate",
  "پلی‌استایرن معمولی (GPPS)": "General Purpose Polystyrene (GPPS)",
  "پلی‌استایرن مقاوم (HIPS)": "High Impact Polystyrene (HIPS)",
  "پلی‌استایرن انبساطی (EPS)": "Expandable Polystyrene (EPS)",
  "لاستیک مصنوعی SBR": "Synthetic SBR Rubber",
  "آلکیل بنزن خطی LAB": "Linear Alkyl Benzene (LAB)",
  "آلکیلات سنگین HAB": "Heavy Alkylate (HAB)",
  "نرمال پارافین": "Normal Paraffin",
  "برق صنعتی": "Industrial Power (Electricity)",
  "بخار فشارقوی": "High-Pressure Steam",
  "آب DM": "Demineralized Water (DM)",
  "پلی‌اتیلن سنگین (HDPE)": "High-Density Polyethylene (HDPE)",
  "پلی‌اتیلن سبک (LDPE)": "Low-Density Polyethylene (LDPE)",
  "پلی‌پروپیلن (PP)": "Polypropylene (PP)",
  "استایرن منومر": "Styrene Monomer (SM)",
  "اسید ترفتالیک خالص (PTA)": "Purified Terephthalic Acid (PTA)",
  "پلی‌اتیلن ترفتالات (PET)": "Polyethylene Terephthalate (PET)",
  "دی اتیلن گلایکول (DEG)": "Diethylene Glycol (DEG)",
  "مونو اتیلن گلایکول (MEG)": "Monoethylene Glycol (MEG)",
  "تری اتیلن گلایکول (TEG)": "Triethylene Glycol (TEG)",
  "اتیلن اکساید (EO)": "Ethylene Oxide (EO)",
  "کود سولفات آمونیوم": "Ammonium Sulfate Fertilizer",
  "اسید نیتریک": "Nitric Acid",
  "اسید سولفوریک": "Sulfuric Acid",
  "اسید فسفریک": "Phosphoric Acid",
  "گوگرد گرانول": "Granular Sulfur",
  "کاستیک سودا (سود سوزآور)": "Caustic Soda (NaOH)",
  "گاز کلر مایع": "Liquid Chlorine Gas",
  "اسید کلریدریک": "Hydrochloric Acid (HCl)",
  "اتیلن دی کلراید (EDC)": "Ethylene Dichloride (EDC)",
  "وینیل کلراید منومر (VCM)": "Vinyl Chloride Monomer (VCM)",
  "ایزوسیانات MDI": "Methylene Diphenyl Diisocyanate (MDI)",
  "ایزوسیانات TDI": "Toluene Diisocyanate (TDI)",
  "پلی ال (Polyol)": "Polyether Polyols",
  "بنزین پیرولیز": "Pyrolysis Gasoline (PyGas)",
  "روغن پایه موتور": "Base Lube Oils",
  "قیر صنعتی": "Industrial Bitumen",
  "گاز مایع LPG": "Liquefied Petroleum Gas (LPG)",
  "پنتان": "Pentane Plus (C5+)",
};

const FEEDSTOCK_TRANSLATIONS: Record<string, string> = {
  "گاز طبیعی": "Natural Gas",
  "گاز اتان": "Ethane Gas",
  "مایعات گازی NGL": "NGL & Gas Condensates",
  "نفتا": "Naphtha",
  "برش‌های سبک و سنگین نفتی": "Light & Heavy Petroleum Cuts",
  "بنزن و اتیلن": "Benzene & Ethylene",
  "پروپیلن": "Propylene",
  "اتیلن": "Ethylene",
  "پارا زایلین": "Para-Xylene",
  "سنتز گاز (Syngas)": "Synthesis Gas (Syngas)",
  "نمک صنعتی (کلرید سدیم)": "Industrial Salt (NaCl)",
  "میعانات گازی پارس جنوبی": "South Pars Gas Condensate",
  "رافینیت": "Raffinate Feed",
};

export function getPlantDisplayName(plant: PlantFacility, isRtl: boolean): string {
  if (isRtl) return plant.nameFa;
  return plant.nameEn || plant.nameFa;
}

export function getPlantDisplayComplex(plant: PlantFacility, isRtl: boolean): string {
  if (isRtl) return plant.complexNameFa;
  return plant.complexNameEn || plant.complexNameFa;
}

export function getPlantDisplayProcessLabel(type: PlantProcessType, isRtl: boolean): string {
  switch (type) {
    case "olefin":
      return isRtl ? "واحد الفین (اتان/نفتا کراکر)" : "Olefin Steam Cracker";
    case "aromatic":
      return isRtl ? "مجتمع آروماتیک" : "Aromatics Complex";
    case "methanol":
      return isRtl ? "واحد متانول" : "Methanol Plant";
    case "urea_ammonia":
      return isRtl ? "واحد اوره و آمونیاک" : "Urea & Ammonia Plant";
    case "polymer":
      return isRtl ? "واحد پلیمری / PET / PVC" : "Polymer Plant";
    case "refinery":
      return isRtl ? "پالایشگاه نفت و میعانات" : "Refinery Plant";
    case "chemicals":
      return isRtl ? "صنایع شیمیایی و واسطه" : "Chemicals & Intermediates";
    case "utility":
      return isRtl ? "یوتیلیتی متمرکز فرآیندی" : "Central Utility";
    default:
      return isRtl ? "واحد فرآیندی" : "Process Plant";
  }
}

export function getPlantDisplayZoneLabel(zone: "assaluyeh" | "mahshahr" | "other_provinces" | string, isRtl: boolean): string {
  switch (zone) {
    case "assaluyeh":
      return isRtl ? "عسلویه (PSEEZ)" : "Assaluyeh PSEEZ";
    case "mahshahr":
      return isRtl ? "ماهشهر (PETZONE)" : "Mahshahr PETZONE";
    case "other_provinces":
    default:
      return isRtl ? "سایر استان‌ها" : "Provincial Site";
  }
}

export function getPlantDisplayDescription(plant: PlantFacility, isRtl: boolean): string {
  if (isRtl) return plant.descriptionFa;
  const proc = getPlantDisplayProcessLabel(plant.processType, false);
  const cap = plant.capacityTonsPerYear
    ? `${formatLocaleNumber(plant.capacityTonsPerYear, false)} Tons/Year`
    : "nominal industrial capacity";
  const zone = getPlantDisplayZoneLabel(plant.locationZone, false);
  const complex = plant.complexNameEn || plant.complexNameFa;
  return `${plant.nameEn} is an operational ${proc.toLowerCase()} facility of ${complex} with design capacity of ${cap}, located in ${zone}.`;
}

export function getPlantDisplayCapacity(plant: PlantFacility, isRtl: boolean): string {
  if (isRtl) return plant.nominalCapacityFa;
  if (plant.capacityTonsPerYear) {
    if (plant.capacityTonsPerYear >= 1_000_000) {
      const m = (plant.capacityTonsPerYear / 1_000_000).toFixed(1).replace(/\.0$/, "");
      return `${m} M Tons/Yr`;
    }
    const k = Math.round(plant.capacityTonsPerYear / 1000);
    return `${k} K Tons/Yr`;
  }
  return "Operational Capacity";
}

export function getPlantDisplayFeedstock(plant: PlantFacility, isRtl: boolean): string {
  if (isRtl) return plant.feedstockFa;
  if (FEEDSTOCK_TRANSLATIONS[plant.feedstockFa]) {
    return FEEDSTOCK_TRANSLATIONS[plant.feedstockFa];
  }
  return "Hydrocarbon Feedstock";
}

export function getPlantDisplayProduct(prod: string, isRtl: boolean): string {
  if (isRtl) return prod;
  if (PRODUCT_TRANSLATIONS[prod]) return PRODUCT_TRANSLATIONS[prod];
  return prod;
}

export function getPlantDisplayHolding(plant: PlantFacility, isRtl: boolean): string {
  if (isRtl) return plant.holdingNameFa || "هلدینگ";
  return plant.holdingNameEn || plant.holdingId?.toUpperCase() || "Holding";
}

export function getPlantDisplayYear(plant: PlantFacility, isRtl: boolean): string {
  if (!plant.commissionedYear) return isRtl ? "نامشخص" : "N/A";
  if (isRtl) return `احداث ${formatLocaleNumber(plant.commissionedYear, true)}`;
  const gregYear = plant.commissionedYear < 1600 ? plant.commissionedYear + 621 : plant.commissionedYear;
  return `Est. ${gregYear}`;
}
