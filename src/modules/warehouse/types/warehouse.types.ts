// src/modules/warehouse/types/warehouse.types.ts

export type WarehouseTab = "inventory" | "locations" | "transactions" | "receipts";

export type StockStatus = "in_stock" | "low_stock" | "critical";

export interface WarehouseItem {
  id: string;
  sku: string;
  nameFa: string;
  nameEn: string;
  categoryFa: string;
  categoryEn: string;
  location: string;
  quantity: number;
  unitFa: string;
  unitEn: string;
  minLevel: number;
  status: StockStatus;
  lastUpdated: string;
  materialGrade?: string;
  weightKg?: number;
  lotNumber?: string;
  supplierFa?: string;
  supplierEn?: string;
  notesFa?: string;
  notesEn?: string;
}

export interface BayRack {
  id: string;
  code: string;
  label: string;
  currentItems: number;
  status: "normal" | "full" | "near_full";
}

export interface WarehouseBay {
  id: string;
  code: string;
  nameFa: string;
  nameEn: string;
  descriptionFa: string;
  descriptionEn: string;
  type: string;
  occupancyRate: number;
  capacityMax: number;
  capacityCurrent: number;
  unitFa: string;
  unitEn: string;
  rackCount: number;
  itemCount: number;
  supervisorFa: string;
  supervisorEn: string;
  temperatureControlled: boolean;
  humidityControlled: boolean;
  racks: BayRack[];
}

export type MovementType = "inbound" | "outbound" | "transfer" | "return";
export type MovementStatus = "completed" | "pending_qc" | "in_progress";

export interface WarehouseTransaction {
  id: string;
  transId: string;
  type: MovementType;
  sku: string;
  itemNameFa: string;
  itemNameEn: string;
  quantity: number;
  unitFa: string;
  unitEn: string;
  fromLocation: string;
  toLocation: string;
  referenceDoc: string;
  operatorFa: string;
  operatorEn: string;
  date: string;
  time: string;
  status: MovementStatus;
}

export type VoucherType = "mrv" | "sio" | "transfer" | "stock_count";
export type VoucherStatus = "approved" | "pending_qc" | "draft";

export interface VoucherLineItem {
  sku: string;
  nameFa: string;
  nameEn: string;
  qty: number;
  unitFa: string;
  unitEn: string;
}

export interface WarehouseVoucher {
  id: string;
  voucherNo: string;
  type: VoucherType;
  titleFa: string;
  titleEn: string;
  counterpartyFa: string;
  counterpartyEn: string;
  issueDate: string;
  itemCount: number;
  totalQuantity: number;
  status: VoucherStatus;
  items: VoucherLineItem[];
}
