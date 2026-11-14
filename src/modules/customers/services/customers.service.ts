// src/modules/customers/services/customers.service.ts
import {
  Customer,
  CustomerOption,
  CustomerCreateInput,
  CustomersListResponse,
} from "../types/customers.types";

export interface CustomersQueryParams {
  search?: string;
  industry?: string;
  city?: string;
  has_logo?: boolean;
  limit?: number;
  offset?: number;
}

class CustomersService {
  private baseUrl = "/api/customers";
  private cache = new Map<string, { data: CustomersListResponse; timestamp: number }>();

  private getCacheKey(params?: Record<string, any>): string {
    return JSON.stringify(params || {});
  }

  getCachedCustomers(params?: CustomersQueryParams): CustomersListResponse | null {
    const key = this.getCacheKey(params);
    const entry = this.cache.get(key);
    if (!entry) return null;
    return entry.data;
  }

  hasCachedCustomers(params?: CustomersQueryParams): boolean {
    return Boolean(this.getCachedCustomers(params));
  }

  clearCache(): void {
    this.cache.clear();
  }

  async getCustomers(params?: CustomersQueryParams, forceRefresh = false): Promise<CustomersListResponse> {
    const key = this.getCacheKey(params);
    const entry = this.cache.get(key);
    const now = Date.now();

    if (!forceRefresh && entry && (now - entry.timestamp < 10000)) {
      return entry.data;
    }

    const url = new URL(this.baseUrl, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    if (params?.search) url.searchParams.set("search", params.search);
    if (params?.industry) url.searchParams.set("industry", params.industry);
    if (params?.city) url.searchParams.set("city", params.city);
    if (params?.has_logo !== undefined) url.searchParams.set("has_logo", String(params.has_logo));
    if (params?.limit !== undefined) url.searchParams.set("limit", String(params.limit));
    if (params?.offset !== undefined) url.searchParams.set("offset", String(params.offset));

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to fetch customers: ${res.statusText}`);
    }

    const data: CustomersListResponse = await res.json();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  async getCustomerOptions(search?: string, limit = 400): Promise<CustomerOption[]> {
    const url = new URL(`${this.baseUrl}/options`, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    if (search) url.searchParams.set("search", search);
    url.searchParams.set("limit", String(limit));

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  }

  async getCustomer(id: string): Promise<Customer> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to fetch customer: ${res.statusText}`);
    }

    return await res.json();
  }

  async createCustomer(payload: CustomerCreateInput): Promise<Customer> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to create customer: ${res.statusText}`);
    }

    this.clearCache();
    return await res.json();
  }

  async updateCustomer(id: string, payload: Partial<CustomerCreateInput>): Promise<Customer> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to update customer: ${res.statusText}`);
    }

    this.clearCache();
    return await res.json();
  }

  async deleteCustomer(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to delete customer: ${res.statusText}`);
    }

    this.clearCache();
  }

  async uploadLogo(file: File): Promise<{ url: string; fileName: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${this.baseUrl}/upload-logo`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to upload logo: ${res.statusText}`);
    }

    return await res.json();
  }
}

export const customersService = new CustomersService();

