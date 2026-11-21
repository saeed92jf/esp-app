// src/modules/warehouse/services/warehouse.service.ts
import { WarehouseItem, StockStatus } from "../types/warehouse.types";

export interface WarehouseFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  status?: string;
  location?: string;
}

export interface WarehouseListResponse {
  items: WarehouseItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  metrics: {
    totalSkus: number;
    inStockCount: number;
    inProgressCount: number;
    bookedCount: number;
    lowStockCount: number;
  };
}

export const WarehouseService = {
  async getItems(params?: WarehouseFilterParams): Promise<WarehouseListResponse> {
    const sp = new URLSearchParams();
    if (params?.page) sp.set("page", params.page.toString());
    if (params?.pageSize) sp.set("pageSize", params.pageSize.toString());
    if (params?.search) sp.set("search", params.search);
    if (params?.category) sp.set("category", params.category);
    if (params?.status) sp.set("status", params.status);
    if (params?.location) sp.set("location", params.location);

    const res = await fetch(`/api/warehouse?${sp.toString()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("خطا در دریافت اقلام انبار");
    }

    return res.json();
  },

  async createItem(data: Partial<WarehouseItem>): Promise<{ success: boolean; item: WarehouseItem }> {
    const res = await fetch(`/api/warehouse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("خطا در ثبت قطعه جدید انبار");
    }

    return res.json();
  },
};
