// src/modules/customers/types/licensors.types.ts

export type LicensorCategory =
  | "all"
  | "olefin"
  | "polyolefin"
  | "methanol_syngas"
  | "aromatics"
  | "fertilizer_urea"
  | "chlor_alkali"
  | "refining_gas"
  | "general_epc"
  | "polymers_rubber"
  | "specialty_chemicals";

export interface LicensorPlantRef {
  plantId: string;
  plantNameFa: string;
  complexNameFa: string;
  unitTypeFa: string;
  nominalCapacityFa?: string;
  holdingId?: string;
  holdingNameFa?: string;
  year?: number;
}

export interface LicensorSource {
  titleFa: string;
  publisherFa: string;
  url?: string;
  isOfficial?: boolean;
}

export interface Licensor {
  id: string;
  nameFa: string;
  nameEn: string;
  countryFa: string;
  countryEn: string;
  countryCode: string; // e.g. "NL", "DE", "DK", "FR", "US", "JP", "GB", "IT", "KR"
  headquartersFa: string;
  headquartersEn: string;
  establishedYear: number;
  website: string;
  logoUrl?: string;
  processCategories: LicensorCategory[];
  keyTechnologies: string[];
  descriptionFa: string;
  descriptionEn?: string;
  licensedPlants: LicensorPlantRef[];
  espRelevanceFa: string;
  sources: LicensorSource[];

  // Extended Corporate, Contact & Operational Attributes
  licenseId?: number;
  addressEn?: string;
  addressFa?: string;
  locationEn?: string;
  locationFa?: string;
  postCode?: string;
  telNo?: string;
  email?: string;
  linkedIn?: string;
  currentSituationEn?: string;
  currentSituationFa?: string;
  historyEn?: string;
  historyFa?: string;
  contactPerson?: string;
  contactPersonEmail?: string;
  mobileContactPerson?: string;
}

