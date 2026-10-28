import type { HttpClient } from "@/services/core/http";
import { IAdminService } from "./admin.service";
import { 
  User, 
  PendingRequest, 
  UserModuleAccess, 
  UserQueryParams, 
  RequestQueryParams,
  AccountStatus,
  RequestStatus
} from "../types/admin.types";

export class RealAdminService implements IAdminService {
  constructor(private readonly http: HttpClient) {}

  private mapAdminUser(u: any): User {
    if (!u) return null as any;
    const name = u.fullNameFa || u.fullName || u.name || u.email?.split("@")[0] || "User";
    const status = u.status === "active" || u.status === "ACTIVE" ? "online" : "offline";
    const roleLower = (u.role || "").toLowerCase();
    const role = (roleLower === "admin" || roleLower === "administrator" || roleLower === "superuser") ? "admin" : "user";

    return {
      id: u.id,
      name,
      firstNameFa: u.firstNameFa,
      lastNameFa: u.lastNameFa,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role,
      status,
      accountStatus: (u.status === "active" || u.status === "ACTIVE" ? "active" : "pending_approval") as AccountStatus,
      avatar: u.avatarUrl || u.avatar,
      avatarColor: u.avatarColor,
      primaryColor: u.primaryColor,
      phone: u.phone,
      nationalId: u.nationalId,
      department: u.department || "engineering",
      jobTitle: u.jobTitle,
      company: u.company,
      companyId: u.companyId,
      joinedAt: u.createdAt || u.joinedAt || new Date().toISOString(),
      daysInCompany: u.daysInCompany ?? 120,
      doneProjects: u.doneProjects ?? 12,
      salary: u.salary ?? 4500,
      score: u.score ?? 85,
      age: u.age ?? 30,
      maritalStatus: u.maritalStatus ?? "single",
      childrenCount: u.childrenCount ?? 0,
      insuranceType: u.insuranceType ?? "complementary",
      educationDegree: u.educationDegree ?? "master",
      educationField: u.educationField ?? "مهندسی مکانیک",
      skills: u.skills?.length ? u.skills : [
        { name: "React / Next.js", rate: 85 },
        { name: "TypeScript & Architecture", rate: 75 },
        { name: "Node.js / API Engineering", rate: 65 },
        { name: "Project Management & P&ID", rate: 80 }
      ],
      workingFormat: u.workingFormat ?? { office: 60, factory: 20, mission: 10, leave: 10 },
      modulesAccess: u.modulesAccess ?? [],
      recentActivities: u.recentActivities ?? [],
      checklists: u.checklists ?? [],
      isProfileCompleted: u.isProfileCompleted ?? true,
      hrApproved: u.hrApproved ?? true,
      managerApproved: u.managerApproved ?? true,
    };
  }

  private mapPendingRequest(r: any): PendingRequest {
    if (!r) return null as any;
    const name = r.fullName || r.name || r.email?.split("@")[0] || "User";
    let status: RequestStatus = "pending";
    if (r.status === "ACTIVE" || r.status === "active") status = "active";
    else if (r.status === "PENDING_MANAGER_ACCESS_GRANT" || r.status === "hr_approved") status = "hr_approved";
    else if (r.status === "REJECTED" || r.status === "rejected") status = "rejected";

    return {
      id: r.id,
      name,
      email: r.email,
      department: r.department || "engineering",
      requestedAt: r.submittedAt || r.requestedAt || new Date().toISOString(),
      status,
      notes: r.notes || "",
      jobTitle: r.jobTitle,
      phone: r.phone,
      nationalId: r.nationalId,
      tempPassword: r.tempPassword,
      isProfileCompleted: r.isProfileCompleted ?? true,
      hrApproved: status === "hr_approved" || status === "active",
      managerApproved: status === "active",
    };
  }

  async getUsers(params?: UserQueryParams): Promise<User[]> {
    const res = await this.http.get<any>("/admin/users", { params });
    const rawList = Array.isArray(res) ? res : (res?.data ?? []);
    return rawList.map((u: any) => this.mapAdminUser(u));
  }

  async getUserById(id: string): Promise<User | null> {
    const res = await this.http.get<any>(`/admin/users/${id}`);
    const raw = res?.data ?? res;
    return raw ? this.mapAdminUser(raw) : null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const backendRole = updates.role === "admin" ? "admin" : (updates.role === "user" ? "staff" : updates.role);
    const res = await this.http.patch<any>(`/admin/users/${id}`, {
      role: backendRole,
      accountStatus: updates.accountStatus,
    });
    const raw = res?.data ?? res;
    return this.mapAdminUser(raw);
  }

  async updateUserModules(id: string, modules: UserModuleAccess[]): Promise<User> {
    await this.http.put(`/admin/users/${id}/modules`, {
      modules: modules.map(m => ({
        moduleId: m.moduleId,
        hasAccess: m.hasAccess,
        permission: m.accessLevel || "read"
      }))
    });
    const user = await this.getUserById(id);
    return user!;
  }

  async deleteUser(id: string): Promise<void> {
    await this.http.delete(`/admin/users/${id}`);
  }

  async searchUsers(query: string, filters?: UserQueryParams): Promise<User[]> {
    const res = await this.http.get<any>("/admin/users", {
      params: { search: query, ...filters }
    });
    const rawList = Array.isArray(res) ? res : (res?.data ?? []);
    return rawList.map((u: any) => this.mapAdminUser(u));
  }

  async getPendingRequests(params?: RequestQueryParams): Promise<PendingRequest[]> {
    const res = await this.http.get<any>("/admin/requests", { params });
    const rawList = Array.isArray(res) ? res : (res?.data ?? []);
    return rawList.map((r: any) => this.mapPendingRequest(r));
  }

  async searchRequests(query: string, filters?: RequestQueryParams): Promise<PendingRequest[]> {
    const res = await this.http.get<any>("/admin/requests", {
      params: { status: filters?.status }
    });
    const rawList = Array.isArray(res) ? res : (res?.data ?? []);
    const filtered = rawList.filter((r: any) => 
      !query.trim() || 
      r.fullName?.toLowerCase().includes(query.toLowerCase()) || 
      r.email?.toLowerCase().includes(query.toLowerCase())
    );
    return filtered.map((r: any) => this.mapPendingRequest(r));
  }

  async approveHr(requestId: string, notes?: string): Promise<PendingRequest> {
    const res = await this.http.post<any>(`/admin/requests/${requestId}/approve-hr`, { notes: notes || "" });
    const raw = res?.data ?? res;
    return this.mapPendingRequest(raw);
  }

  async approveManager(
    requestId: string, 
    options?: { tempPassword?: string; role?: "admin" | "user"; modulesAccess?: UserModuleAccess[] }
  ): Promise<{ request: PendingRequest; tempPassword?: string; user: User }> {
    const res = await this.http.post<any>(
      `/admin/requests/${requestId}/approve-manager`,
      {
        tempPassword: options?.tempPassword,
        role: options?.role || "staff",
      }
    );
    const raw = res?.data ?? res;
    return {
      request: this.mapPendingRequest(raw.request || raw),
      tempPassword: raw.tempPassword,
      user: this.mapAdminUser(raw.user || raw),
    };
  }

  async rejectRequest(requestId: string, reason: string): Promise<PendingRequest> {
    const res = await this.http.post<any>(`/admin/requests/${requestId}/reject`, { reason });
    const raw = res?.data ?? res;
    return this.mapPendingRequest(raw);
  }

  async resendCredentials(requestId: string): Promise<{ success: boolean; tempPassword?: string }> {
    const res = await this.http.post<any>(
      `/admin/requests/${requestId}/resend-credentials`
    );
    const raw = res?.data ?? res;
    return { success: raw?.success ?? true };
  }

  async approveRequest(requestId: string): Promise<{ email: string; tempPassword: string }> {
    const res = await this.approveManager(requestId);
    return {
      email: res.request.email,
      tempPassword: res.tempPassword || "password123",
    };
  }

  async updateRequest(requestId: string, updates: Partial<PendingRequest>): Promise<PendingRequest> {
    const res = await this.http.put<any>(`/admin/requests/${requestId}`, updates);
    const raw = res?.data ?? res;
    return this.mapPendingRequest(raw);
  }
}
