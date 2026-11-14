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
  nameFa: string;
  nameEn: string;
  code: string; // e.g. "OLEFIN-10", "AROMATIC-4", "METHANOL-MEGA"
  processType: PlantProcessType;
  complexNameFa: string;
  complexNameEn?: string;
  holdingId?: string;
  holdingNameFa?: string;
  logoUrl?: string;
  locationZone: "assaluyeh" | "mahshahr" | "other_provinces";
  locationFa: string;
  cityFa: string;
  provinceFa: string;
  feedstockFa: string;
  feedstockSourceFa?: string;
  nominalCapacityFa: string;
  licensors: string[];
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
  sources?: {
    titleFa: string;
    publisherFa: string;
    url?: string;
    isOfficial?: boolean;
  }[];
}

