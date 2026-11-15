// src/modules/customers/types/holdings.types.ts

export interface HoldingSubsidiary {
  id: string;
  nameFa: string;
  nameEn?: string;
  companyAbbrv?: string;
  tseSymbol?: string;
  industry: string;
  role?: string;
  plantLocation?: string;
  products?: string[];
  isCustomerOfEsp?: boolean;
  plantId?: string; // Links to PlantFacility in plants catalog
  logoUrl?: string;
  customerDirectoryId?: string;
}

export interface Holding {
  id: string;
  excelId?: number;
  nameFa: string;
  nameEn: string;
  companyAbbrv: string;
  tseSymbol?: string;
  codalUrl?: string;
  tsetmcUrl?: string;
  logoUrl?: string;
  establishedYear?: number;
  headquartersFa?: string;
  officeAddressFa?: string;
  officePhone?: string;
  postalCode?: string;
  nationalIdNumber?: string;
  economicCode?: string;
  registrationNumber?: string;
  website?: string;
  descriptionFa: string;
  descriptionEn?: string;
  subsidiaries: HoldingSubsidiary[];
  tags: string[];
}


