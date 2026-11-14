// src/modules/customers/types/holdings.types.ts

export interface HoldingShareholder {
  nameFa: string;
  nameEn?: string;
  percentage: number;
  type: "governmental" | "pension_fund" | "justice_shares" | "private" | "public_market";
}

export interface HoldingSubsidiary {
  id: string;
  nameFa: string;
  nameEn?: string;
  companyAbbrv?: string;
  ownershipPercentage: number;
  tseSymbol?: string;
  industry: string;
  role: string;
  plantLocation?: string;
  capacity?: string;
  products?: string[];
  isCustomerOfEsp?: boolean;
}

export interface Holding {
  id: string;
  nameFa: string;
  nameEn: string;
  companyAbbrv: string;
  tseSymbol?: string;
  isinCode?: string;
  codalUrl?: string;
  tsetmcUrl?: string;
  logoUrl?: string;
  establishedYear: number;
  marketCapFa?: string;
  annualCapacityFa: string;
  headquartersFa: string;
  ceoNameFa: string;
  website?: string;
  descriptionFa: string;
  descriptionEn?: string;
  shareholders: HoldingShareholder[];
  subsidiaries: HoldingSubsidiary[];
  keyProducts: string[];
  strategicHighlightsFa: string[];
  tags: string[];
}
