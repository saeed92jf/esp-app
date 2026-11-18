export type AssetStatus = 
  | "OPERATIONAL"
  | "STANDBY"
  | "UNDER_MAINTENANCE"
  | "OUT_OF_SERVICE"
  | "COMMISSIONING"
  | "DECOMMISSIONED";

export type AssetCriticality = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ParameterTemplate {
  key: string;
  name_fa: string;
  name_en: string;
  unit: string;
  type: "string" | "number" | "boolean" | "select";
  options?: string[];
}

export interface AssetCategory {
  id: string;
  name_fa: string;
  name_en: string;
  code: string;
  parent_id: string | null;
  description?: string;
  icon?: string;
  parameter_templates: ParameterTemplate[];
}

export interface AssetLocation {
  id: string;
  name_fa: string;
  name_en: string;
  code: string;
  parent_id: string | null;
  type: "PLANT" | "WORKSHOP" | "LINE" | "STATION" | "UTILITY";
  description?: string;
}

export interface AssetDocument {
  id: string;
  title: string;
  file_type: string;
  file_name: string;
  file_url: string;
  created_at: string;
}

export interface SparePartLink {
  part_code: string;
  description_fa: string;
  description_en?: string;
  minimum_stock: number;
  current_stock_ref: number;
  warehouse_sku?: string;
}

export interface IndustrialAsset {
  id: string;
  tag_number: string;
  name_fa: string;
  name_en?: string;
  category_id: string;
  location_id: string;
  status: AssetStatus;
  criticality: AssetCriticality;
  serial_number?: string;
  manufacturer?: string;
  model_number?: string;
  year_built?: number;
  installation_date?: string;
  parent_asset_id?: string | null;
  specifications: Record<string, any>;
  description?: string;
  documents: AssetDocument[];
  spare_parts: SparePartLink[];
  created_at: string;
  updated_at: string;
}

export interface AssetListResponse {
  items: IndustrialAsset[];
  total: number;
}
