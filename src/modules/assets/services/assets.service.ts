import { 
  IndustrialAsset, 
  AssetCategory, 
  AssetLocation, 
  AssetListResponse,
  AssetStatus 
} from "../types/assets.types";

export interface AssetFilterParams {
  search?: string;
  category_id?: string;
  location_id?: string;
  status?: string;
  criticality?: string;
}

export const AssetsService = {
  async getAssets(params?: AssetFilterParams): Promise<AssetListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.category_id) searchParams.set("category_id", params.category_id);
    if (params?.location_id) searchParams.set("location_id", params.location_id);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.criticality) searchParams.set("criticality", params.criticality);

    const res = await fetch(`/api/assets?${searchParams.toString()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error("خطا در دریافت لیست تجهیزات");
    }
    return res.json();
  },

  async getAssetById(id: string): Promise<IndustrialAsset> {
    const res = await fetch(`/api/assets/${id}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error("تجهیز مورد نظر یافت نشد");
    }
    return res.json();
  },

  async getCategories(): Promise<AssetCategory[]> {
    const res = await fetch(`/api/assets/categories`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      return [];
    }
    return res.json();
  },

  async getLocations(): Promise<AssetLocation[]> {
    const res = await fetch(`/api/assets/locations`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      return [];
    }
    return res.json();
  },

  async createAsset(data: Partial<IndustrialAsset>): Promise<IndustrialAsset> {
    const res = await fetch(`/api/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "خطا در ثبت تجهیز جدید");
    }
    return res.json();
  },

  async updateAsset(id: string, data: Partial<IndustrialAsset>): Promise<IndustrialAsset> {
    const res = await fetch(`/api/assets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "خطا در ویرایش تجهیز");
    }
    return res.json();
  },

  async updateStatus(id: string, status: AssetStatus, reason?: string): Promise<IndustrialAsset> {
    const res = await fetch(`/api/assets/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "خطا در تغییر وضعیت تجهیز");
    }
    return res.json();
  },

  async deleteAsset(id: string): Promise<void> {
    const res = await fetch(`/api/assets/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error("خطا در حذف تجهیز");
    }
  }
};
