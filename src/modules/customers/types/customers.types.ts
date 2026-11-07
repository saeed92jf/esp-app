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
}

export interface CustomersListResponse {
  items: Customer[];
  total: number;
  offset: number;
  limit: number;
  industries: { name: string; count: number }[];
  cities: string[];
}

