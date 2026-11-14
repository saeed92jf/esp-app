// src/modules/customers/types/plants.types.ts

export type PlantProcessType =
  | "olefin"
  | "aromatic"
  | "methanol"
  | "urea_ammonia"
  | "polymer"
  | "refinery"
  | "utility"
  | "chemicals";

export interface PlantFacility {
  id: string;
  excelId?: number;
  nameFa: string;
  nameEn: string;
  code: string; // e.g. "OLEFIN-10", "AROMATIC-4", "METHANOL-MEGA"
  processType: PlantProcessType;
  complexNameFa: string;
  complexNameEn?: string;
  phaseFa?: string;
  unitTypeFa?: string;
  unitTypeEn?: string;
  holdingId?: string;
  holdingNameFa?: string;
  holdingNameEn?: string;
  owner1Fa?: string;
  owner2Fa?: string;
  logoUrl?: string;
  locationZone: "assaluyeh" | "mahshahr" | "other_provinces";
  locationFa: string;
  cityFa: string;
  provinceFa: string;
  feedstockFa: string;
  feedstockSourceFa?: string;
  nominalCapacityFa: string;
  capacityTonsPerYear?: number; // Numeric capacity in metric tons per year for precise sorting
  licensors: string[];
  engineeringCompanies?: string[];
  mainProductsFa: string[];
  commissionedYear?: number;
  tseSymbol?: string;
  status: "operational" | "expansion" | "under_construction";
  descriptionFa: string;
  reactorOrFurnaceInfoFa?: string;
  espInstalledBase?: string;
  website?: string;
  codalUrl?: string;
  customerDirectoryId?: string; // Links to customer ID in Euroslot directory
  customerFieldId?: string;
  sources?: {
    titleFa: string;
    publisherFa: string;
    url?: string;
    isOfficial?: boolean;
  }[];
}

