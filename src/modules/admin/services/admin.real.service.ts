import type { HttpClient } from "@/services/core/http";
import { IAdminService } from "./admin.service";
import { 
  User, 
  PendingRequest, 
  UserModuleAccess, 
  UserQueryParams, 
  RequestQueryParams 
} from "../types/admin.types";

export class RealAdminService implements IAdminService {
  constructor(private readonly http: HttpClient) {}

  async getUsers(params?: UserQueryParams): Promise<User[]> {
    const res = await this.http.get<{ data: User[] }>("/admin/users", { params });
    return res.data;
  }

  async getUserById(id: string): Promise<User | null> {
    const res = await this.http.get<{ data: User }>(`/admin/users/${id}`);
    return res.data;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const res = await this.http.patch<{ data: User }>(`/admin/users/${id}`, updates);
    return res.data;
  }

  async updateUserModules(id: string, modules: UserModuleAccess[]): Promise<User> {
    const res = await this.http.put<{ data: User }>(`/admin/users/${id}/modules`, { modules });
    return res.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.http.delete(`/admin/users/${id}`);
  }

  async searchUsers(query: string, filters?: UserQueryParams): Promise<User[]> {
    const res = await this.http.get<{ data: User[] }>("/admin/users/search", {
      params: { q: query, ...filters }
    });
    return res.data;
  }

  async getPendingRequests(params?: RequestQueryParams): Promise<PendingRequest[]> {
    const res = await this.http.get<{ data: PendingRequest[] }>("/admin/requests", { params });
    return res.data;
  }

  async searchRequests(query: string, filters?: RequestQueryParams): Promise<PendingRequest[]> {
    const res = await this.http.get<{ data: PendingRequest[] }>("/admin/requests/search", {
      params: { q: query, ...filters }
    });
    return res.data;
  }

  async approveHr(requestId: string, notes?: string): Promise<PendingRequest> {
    const res = await this.http.post<{ data: PendingRequest }>(`/admin/requests/${requestId}/approve-hr`, { notes });
    return res.data;
  }

  async approveManager(
    requestId: string, 
    options?: { tempPassword?: string; role?: 'admin' | 'user' }
  ): Promise<{ request: PendingRequest; tempPassword?: string; user: User }> {
    const res = await this.http.post<{ data: { request: PendingRequest; tempPassword?: string; user: User } }>(
      `/admin/requests/${requestId}/approve-manager`,
      options
    );
    return res.data;
  }

  async rejectRequest(requestId: string, reason: string): Promise<PendingRequest> {
    const res = await this.http.post<{ data: PendingRequest }>(`/admin/requests/${requestId}/reject`, { reason });
    return res.data;
  }

  async resendCredentials(requestId: string): Promise<{ success: boolean; tempPassword?: string }> {
    const res = await this.http.post<{ data: { success: boolean; tempPassword?: string } }>(
      `/admin/requests/${requestId}/resend-credentials`
    );
    return res.data;
  }

  async approveRequest(requestId: string): Promise<{ email: string; tempPassword: string }> {
    const res = await this.approveManager(requestId);
    return {
      email: res.request.email,
      tempPassword: res.tempPassword || "password123",
    };
  }
}
