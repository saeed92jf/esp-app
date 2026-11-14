// src/modules/customers/types/customers.types.ts

export interface Customer {
  id: string;
  company_name_en: string;
  persian_title_fa: string;
  company_abbrv?: string | null;
  industry?: string | null;
  industry_id?: number | null;
  website?: string | null;
  city?: string | null;
  tel_code1?: string | null;
  tel_code2?: string | null;
  plant_address_en?: string | null;
  plant_address_fa?: string | null;
  office_address_en?: string | null;
  office_address_fa?: string | null;
  postal_code?: string | null;
  economic_code?: string | null;
  national_id_number?: string | null;
  registration_number?: string | null;
  logo_url?: string | null;
  created_at?: string;
  updated_at?: string;
  is_custom?: boolean;

  // Petrochemical & Industrial Plant extensions
  is_petrochemical?: boolean | null;
  process_type?: string | null;
  plant_code?: string | null;
  complex_name_fa?: string | null;
  unit_type_fa?: string | null;
  phase_fa?: string | null;
  holding_id?: string | null;
  holding_name_fa?: string | null;
  owner1_fa?: string | null;
  owner2_fa?: string | null;
  nominal_capacity_fa?: string | null;
  capacity_tons_per_year?: number | null;
  feedstock_fa?: string | null;
  feedstock_source_fa?: string | null;
  licensors?: string[] | null;
  engineering_companies?: string[] | null;
  main_products_fa?: string[] | null;
  reactor_or_furnace_info_fa?: string | null;
  esp_installed_base?: string | null;
  location_zone?: "assaluyeh" | "mahshahr" | "other_provinces" | string | null;
  status?: "operational" | "expansion" | "under_construction" | string | null;
  commissioned_year?: number | null;
  tse_symbol?: string | null;
  codal_url?: string | null;
}

export interface CustomerOption {
  value: string;
  label: string;
  id: string;
  company_name_en?: string;
  logo_url?: string | null;
  industry?: string | null;
  city?: string | null;
  is_custom?: boolean;
  is_petrochemical?: boolean;
  process_type?: string | null;
  holding_name_fa?: string | null;
  tse_symbol?: string | null;
  plant_code?: string | null;
}

export interface CustomerCreateInput {
  persian_title_fa: string;
  company_name_en?: string;
  company_abbrv?: string;
  industry?: string;
  industry_id?: number;
  city?: string;
  website?: string;
  tel_code1?: string;
  tel_code2?: string;
  office_address_fa?: string;
  office_address_en?: string;
  plant_address_fa?: string;
  plant_address_en?: string;
  postal_code?: string;
  economic_code?: string;
  national_id_number?: string;
  registration_number?: string;
  logo_url?: string;

  // Petrochemical & Industrial Plant extensions
  is_petrochemical?: boolean;
  process_type?: string;
  plant_code?: string;
  complex_name_fa?: string;
  unit_type_fa?: string;
  phase_fa?: string;
  holding_id?: string;
  holding_name_fa?: string;
  owner1_fa?: string;
  owner2_fa?: string;
  nominal_capacity_fa?: string;
  capacity_tons_per_year?: number;
  feedstock_fa?: string;
  feedstock_source_fa?: string;
  licensors?: string[];
  engineering_companies?: string[];
  main_products_fa?: string[];
  reactor_or_furnace_info_fa?: string;
  esp_installed_base?: string;
  location_zone?: "assaluyeh" | "mahshahr" | "other_provinces" | string;
  status?: "operational" | "expansion" | "under_construction" | string;
  commissioned_year?: number;
  tse_symbol?: string;
  codal_url?: string;
}

export interface CustomersListResponse {
  items: Customer[];
  total: number;
  offset: number;
  limit: number;
  industries: { name: string; count: number }[];
  cities: string[];
}

