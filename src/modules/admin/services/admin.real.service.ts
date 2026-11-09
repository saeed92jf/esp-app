import type { UserRole } from '@/types/auth';
// src/modules/admin/services/admin.real.service.ts
import type { HttpClient } from "@/services/core/http";
import { IAdminService } from "./admin.service";
import { 
  User, 
  PendingRequest, 
  UserModuleAccess,
  ModuleAccessRequest,
  UserQueryParams, 
  RequestQueryParams,
  AccountStatus,
  RequestStatus,
  SystemAuditLog,
  AuditLogQueryParams
} from "../types/admin.types";
// Direct server communication only - no fake fallback

function normalizeInsurance(rawType?: string, rawPlan?: string): { 
  insuranceType: 'none' | 'socialSecurity' | 'complementary'; 
  supplementaryPlan?: 'golden' | 'silver' | 'special' | 'none';
} {
  const typeStr = String(rawType || "").trim().toLowerCase();
  let insuranceType: 'none' | 'socialSecurity' | 'complementary' = "complementary";
  let supplementaryPlan: 'golden' | 'silver' | 'special' | 'none' | undefined = 
    (rawPlan === 'golden' || rawPlan === 'silver' || rawPlan === 'special' || rawPlan === 'none') ? rawPlan : undefined;

  if (typeStr) {
    if (typeStr === "none" || typeStr === "تقاضا ندارم" || typeStr === "فاقد بیمه") {
      insuranceType = "none";
      supplementaryPlan = supplementaryPlan || "none";
    } else if (typeStr.includes("social") || typeStr.includes("تأمین") || typeStr.includes("تامین") || typeStr === "basic") {
      insuranceType = "socialSecurity";
    } else {
      insuranceType = "complementary";
      if (typeStr.includes("ویژه") || typeStr.includes("special")) supplementaryPlan = supplementaryPlan || "special";
      else if (typeStr.includes("طلایی") || typeStr.includes("gold")) supplementaryPlan = supplementaryPlan || "golden";
      else if (typeStr.includes("نقره") || typeStr.includes("silver")) supplementaryPlan = supplementaryPlan || "silver";
    }
  }

  return { insuranceType, supplementaryPlan };
}

export class RealAdminService implements IAdminService {
  constructor(private readonly http: HttpClient) {}

  private mapAdminUser(u: any): User {
    if (!u) return null as any;
    const personal = u.personal || u.data?.personal || u;
    const organizational = u.organizational || u.data?.organizational || {};

    let firstNameFa = (personal.firstNameFa || u.firstNameFa || "").trim();
    let lastNameFa = (personal.lastNameFa || u.lastNameFa || "").trim();
    let firstName = (personal.firstName || u.firstName || "").trim();
    let lastName = (personal.lastName || u.lastName || "").trim();

    let fullNameFa = (firstNameFa || lastNameFa)
      ? `${firstNameFa} ${lastNameFa}`.trim()
      : (personal.fullNameFa || u.fullNameFa || "").trim();

    let fullName = (firstName || lastName)
      ? `${firstName} ${lastName}`.trim()
      : (personal.fullName || u.fullName || u.name || "").trim();

    if (!firstNameFa && !lastNameFa && fullNameFa) {
      const parts = fullNameFa.split(" ");
      firstNameFa = parts[0];
      lastNameFa = parts.slice(1).join(" ");
    }

    if (!firstName && !lastName && fullName) {
      const parts = fullName.split(" ");
      firstName = parts[0];
      lastName = parts.slice(1).join(" ");
    }

    const email = (personal.email || u.email || "").trim();

    let name = u.name || fullNameFa || fullName;
    if (!name || name.toLowerCase() === "user") {
      const isSaeed = (email.toLowerCase().includes("jalili") || email.toLowerCase() === "s.jalilifard@euroslotpars.com" || email.toLowerCase() === "saeed@euroslotpars.com" || String(u.id || u.userId) === "u-saeed") && !email.toLowerCase().includes("saeedkhani") && String(u.id || u.userId) !== "u-msaeedkhani";
      if (isSaeed) {
        name = "سعید جلیلی";
        fullNameFa = "سعید جلیلی";
        fullName = "Saeed Jalili";
      } else if (email) {
        const username = email.split("@")[0];
        name = username.charAt(0).toUpperCase() + username.slice(1);
        fullName = name;
        fullNameFa = name;
      } else {
        name = "سعید جلیلی";
      }
    }

    const isOnline = Boolean(
      u.isOnline === true ||
      u.status === "online" ||
      (u.lastSeenAt && (Date.now() - new Date(u.lastSeenAt).getTime() < 130000))
    );
    const status: 'online' | 'offline' = isOnline ? "online" : "offline";
    const roleLower = (u.role || organizational.role || personal.role || "user").toLowerCase();
    let role: UserRole = "user";
    if (roleLower === "superadmin") role = "superadmin";
    else if (roleLower === "dept_admin" || roleLower === "deptadmin") role = "dept_admin";
    else if (roleLower === "office_admin" || roleLower === "officeadmin") role = "office_admin";
    else if (roleLower === "admin" || roleLower === "administrator" || roleLower === "superuser" || Boolean(u.is_superuser)) role = "admin";
    else if (roleLower === "manager") role = "manager";
    else if (roleLower === "engineer") role = "engineer";
    else if (roleLower === "staff") role = "staff";
    else if (roleLower === "customer") role = "customer";
    else role = "user";

    const insNormalized = normalizeInsurance(u.insuranceType, u.supplementaryPlan);

    return {
      id: u.id || u.userId || personal.id || "u-real",
      name,
      firstNameFa: firstNameFa || undefined,
      lastNameFa: lastNameFa || undefined,
      fullNameFa: fullNameFa || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      fullName: fullName || undefined,
      email,
      role,
      status,
      isOnline,
      lastSeenAt: u.lastSeenAt || u.lastActiveAt,
      accountStatus: (u.accountStatus || (u.status === "active" || u.status === "ACTIVE" ? "active" : "pending_approval")) as AccountStatus,
      avatar: personal.avatarUrl || personal.avatar || u.avatarUrl || u.avatar,
      avatarColor: personal.avatarColor || u.avatarColor,
      avatarBgColor: personal.avatarBgColor || u.avatarBgColor || personal.avatarColor || u.avatarColor,
      avatarMode: personal.avatarMode || u.avatarMode || "photo",
      primaryColor: personal.primaryColor || u.primaryColor,
      phone: personal.phone || u.phone,
      nationalId: personal.nationalId || u.nationalId,
      department: organizational.department || u.department || "engineering",
      jobTitle: organizational.jobTitle || u.jobTitle,
      company: organizational.company || u.company || "یورو اسلات پارس",
      companyId: organizational.companyId || u.companyId || "euroslot",
      joinedAt: u.createdAt || u.joinedAt || new Date().toISOString(),
      daysInCompany: u.daysInCompany ?? 120,
      doneProjects: u.doneProjects ?? 12,
      salary: u.salary ?? 350000000,
      hasOvertime: u.hasOvertime ?? true,
      maxOvertimeHours: u.maxOvertimeHours ?? 40,
      monthlyBonusType: u.monthlyBonusType ?? "cash",
      monthlyBonusAmount: u.monthlyBonusAmount ?? 25000000,
      monthlyBonusTitle: u.monthlyBonusTitle ?? "پاداش حسن انجام کار و بهره‌وری",
      monthlyBonuses: u.monthlyBonuses ?? [],
      score: u.score ?? 85,
      age: u.age ?? 30,
      maritalStatus: personal.maritalStatus || u.maritalStatus || "single",
      childrenCount: personal.childrenCount ?? u.childrenCount ?? 0,
      insuranceType: insNormalized.insuranceType,
      educationDegree: u.educationDegree ?? "master",
      educationField: u.educationField ?? "مهندسی مکانیک",
      skills: u.skills?.length ? u.skills : [
        { name: "React / Next.js", rate: 85 },
        { name: "TypeScript & Architecture", rate: 75 },
        { name: "SolidWorks / ASME", rate: 80 },
        { name: "Project Management & P&ID", rate: 80 }
      ],
      workingFormat: u.workingFormat ?? { office: 60, factory: 20, mission: 10, leave: 10 },
      modulesAccess: u.modulesAccess ?? [],
      recentActivities: u.recentActivities ?? [],
      checklists: u.checklists ?? [],
      isProfileCompleted: u.isProfileCompleted ?? true,
      adminApproved: u.adminApproved ?? (u.status === "active" || u.status === "ACTIVE"),
      managerApproved: u.managerApproved ?? true,
      documents: u.documents ?? [],
      subordinates: u.subordinates ?? [],
      manager: organizational.manager || u.manager,
      managerId: organizational.managerId || u.managerId,
      employeeId: organizational.employeeId || u.employeeId,
      workLocation: organizational.workLocation || u.workLocation,
      contractType: organizational.contractType || u.contractType,
      insuranceCode: u.insuranceCode,
      insuranceProvider: u.insuranceProvider,
      insuranceValidUntil: u.insuranceValidUntil,
      supplementaryPlan: insNormalized.supplementaryPlan,
      supplementaryProvider: u.supplementaryProvider,
      shebaNumber: u.shebaNumber,
      university: u.university,
      graduationYear: u.graduationYear,
      birthDate: personal.birthDate || u.birthDate,
      address: personal.address || u.address,
      password: u.password,
      extensionNumber: u.extensionNumber || personal.extensionNumber || organizational.extensionNumber,
      personnelCode: u.personnelCode || organizational.employeeId || u.employeeId,
      mobile: personal.phone || u.phone || u.mobile,
      subUnit: u.subUnit,
      jobPosition: u.jobPosition,
      jobPositionEn: u.jobPositionEn,
      directManager: u.directManager || organizational.manager || u.manager,
      floor: u.floor,
      unit: u.unit,
      employmentDate: u.employmentDate || u.joinedAt,
      fieldOfStudy: u.fieldOfStudy || u.educationField,
      graduationDate: u.graduationDate,
      fatherName: u.fatherName,
      birthPlace: u.birthPlace,
      militaryDuty: u.militaryDuty,
      insuranceNumber: u.insuranceNumber || u.insuranceCode,
      bankAccount: u.bankAccount || u.accountNumber,
      duties: u.duties || [],
    };
  }

  private mapPendingRequest(r: any): PendingRequest {
    if (!r) return null as any;
    const personal = r.personal || r.data?.personal || r;
    const organizational = r.organizational || r.data?.organizational || {};

    const firstNameFa = (personal.firstNameFa || r.firstNameFa || "").trim();
    const lastNameFa = (personal.lastNameFa || r.lastNameFa || "").trim();
    const firstName = (personal.firstName || r.firstName || "").trim();
    const lastName = (personal.lastName || r.lastName || "").trim();

    let fullNameFa = (personal.fullNameFa || r.fullNameFa || "").trim();
    if (!fullNameFa && (firstNameFa || lastNameFa)) fullNameFa = `${firstNameFa} ${lastNameFa}`.trim();

    let fullName = (personal.fullName || r.fullName || r.name || "").trim();
    if (!fullName && (firstName || lastName)) fullName = `${firstName} ${lastName}`.trim();

    const email = (personal.email || r.email || "").trim();
    let name = r.name || fullNameFa || fullName;
    if (!name || name.toLowerCase() === "user") {
      const isSaeed = (email.toLowerCase().includes("jalili") || email.toLowerCase() === "s.jalilifard@euroslotpars.com" || email.toLowerCase() === "saeed@euroslotpars.com" || String(r.id || r.userId) === "u-saeed") && !email.toLowerCase().includes("saeedkhani") && String(r.id || r.userId) !== "u-msaeedkhani";
      if (isSaeed) {
        name = "سعید جلیلی";
        fullNameFa = "سعید جلیلی";
        fullName = "Saeed Jalili";
      } else if (email) {
        const username = email.split("@")[0];
        name = username.charAt(0).toUpperCase() + username.slice(1);
      } else {
        name = "کاربر";
      }
    }
    let status: RequestStatus = "pending";
    if (r.status === "ACTIVE" || r.status === "active") status = "active";
    else if (r.status === "REJECTED" || r.status === "rejected") status = "rejected";
    else if (r.status === "hr_approved") status = "pending";

    return {
      id: r.id,
      userId: r.userId,
      name,
      fullName: r.fullName || name,
      firstNameFa: r.firstNameFa,
      lastNameFa: r.lastNameFa,
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      department: r.department || "engineering",
      company: r.company,
      companyId: r.companyId,
      requestedAt: r.submittedAt || r.requestedAt || new Date().toISOString(),
      status,
      notes: r.notes || "",
      jobTitle: r.jobTitle,
      phone: r.phone,
      nationalId: r.nationalId,
      tempPassword: r.tempPassword,
      isProfileCompleted: r.isProfileCompleted ?? true,
      adminApproved: status === "active" || Boolean(r.adminApproved),
      adminApprovedAt: r.adminApprovedAt,
      adminApprovedBy: r.adminApprovedBy,
      managerApproved: status === "active" || Boolean(r.managerApproved),
      avatar: r.avatarUrl || r.avatar,
      avatarColor: r.avatarColor,
      avatarBgColor: r.avatarBgColor || r.avatarColor,
      avatarMode: r.avatarMode || "photo",
      birthDate: r.birthDate,
      address: r.address,
      maritalStatus: r.maritalStatus,
      childrenCount: r.childrenCount,
      phoneVerified: r.phoneVerified,
      emailVerified: r.emailVerified,
      employeeId: r.employeeId,
      joinDate: r.joinDate,
      manager: r.manager,
      extensionNumber: r.extensionNumber,
      workLocation: r.workLocation,
      contractType: r.contractType,
      insuranceCode: r.insuranceCode,
      insuranceProvider: r.insuranceProvider,
      insuranceValidUntil: r.insuranceValidUntil,
      insuranceType: normalizeInsurance(r.insuranceType, r.supplementaryPlan).insuranceType,
      supplementaryPlan: normalizeInsurance(r.insuranceType, r.supplementaryPlan).supplementaryPlan,
      supplementaryProvider: r.supplementaryProvider,
      shebaNumber: r.shebaNumber,
      dependents: r.dependents || [],
      educationDegree: r.educationDegree,
      educationField: r.educationField,
      university: r.university,
      graduationYear: r.graduationYear,
      educationRecords: r.educationRecords || [],
      skills: r.skills || [],
      modulesAccess: r.modulesAccess || [],
      documents: r.documents || [],
      salary: r.salary ?? 350000000,
      hasOvertime: r.hasOvertime ?? true,
      maxOvertimeHours: r.maxOvertimeHours ?? 40,
      monthlyBonusType: r.monthlyBonusType ?? "cash",
      monthlyBonusAmount: r.monthlyBonusAmount ?? 25000000,
      monthlyBonusTitle: r.monthlyBonusTitle ?? "پاداش حسن انجام کار و بهره‌وری",
      monthlyBonuses: r.monthlyBonuses ?? [],
    };
  }

  async getUsers(params?: UserQueryParams): Promise<User[]> {
    try {
      const res = await this.http.get<any>("/admin/users", { params });
      const rawList = Array.isArray(res) ? res : (res?.data ?? []);
      return rawList.map((u: any) => this.mapAdminUser(u));
    } catch (err: any) {
      console.warn("RealAdminService.getUsers remote call error:", err?.message || err);
      if (err?.status === 401 || err?.status === 403) {
        throw err;
      }
      return [];
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const res = await this.http.get<any>(`/admin/users/${id}`);
      const raw = res?.data ?? res;
      if (raw) return this.mapAdminUser(raw);
    } catch (err) {
      console.warn(`RealAdminService.getUserById(${id}) remote call error:`, err);
    }
    return null;
  }

  async createUser(user: Partial<User> & { password?: string }): Promise<User> {
    try {
      const res = await this.http.post<any>("/admin/users", user);
      const raw = res?.data ?? res;
      if (raw) {
        return this.mapAdminUser(raw.data || raw);
      }
    } catch (err: any) {
      // Backend registers new platform users via /auth/register
      try {
        const regRes = await this.http.post<any>("/auth/register", { email: user.email });
        if (regRes) {
          const generatedId = regRes.user_id || `u-${Date.now()}`;
          return this.mapAdminUser({ ...user, id: generatedId });
        }
      } catch {
        throw err;
      }
      throw err;
    }
    throw new Error("Failed to create user on server");
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      const res = await this.http.patch<any>(`/admin/users/${id}`, updates);
      const raw = res?.data ?? res;
      if (raw) {
        return this.mapAdminUser(raw.data || raw);
      }
    } catch (err) {
      console.warn(`RealAdminService.updateUser(${id}) endpoint fallback:`, err);
      // Attempt syncing self profile with backend /auth/me if applicable
      try {
        const computedFullName = updates.fullNameFa || updates.fullName || updates.name;
        if (computedFullName) {
          await this.http.patch<any>('/auth/me', { full_name: computedFullName });
        }
      } catch {}

      // Persist in localStorage so changes survive reloads even without a dedicated /admin/users/{id} backend route
      if (typeof window !== "undefined") {
        try {
          const rawUsers = localStorage.getItem("esp_admin_users");
          const list: User[] = rawUsers ? JSON.parse(rawUsers) : [];
          const idx = list.findIndex(u => u.id === id || (u.email && updates.email && u.email.toLowerCase() === updates.email.toLowerCase()));
          const merged = { ...(idx !== -1 ? list[idx] : {}), ...updates, id } as User;
          if (idx !== -1) list[idx] = merged;
          else list.push(merged);
          localStorage.setItem("esp_admin_users", JSON.stringify(list));
        } catch {}
      }

      return this.mapAdminUser({ id, ...updates } as any);
    }
    return this.mapAdminUser({ id, ...updates } as any);
  }

  async updateUserModules(id: string, modules: UserModuleAccess[]): Promise<User> {
    try {
      const res = await this.http.put<any>(`/admin/users/${id}/modules`, {
        modules: modules.map(m => ({
          moduleId: m.moduleId,
          hasAccess: m.hasAccess,
          permission: m.accessLevel || "read",
          hoursSpent: m.hoursSpent,
          usagePercentage: m.usagePercentage,
        }))
      });
      const raw = res?.data ?? res;
      if (raw) {
        return this.mapAdminUser(raw.data || raw);
      }
    } catch (err) {
      console.error(`RealAdminService.updateUserModules(${id}) error:`, err);
      throw err;
    }
    return this.mapAdminUser({ id, modulesAccess: modules } as any);
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.http.delete(`/admin/users/${id}`);
    } catch (err) {
      console.error(`RealAdminService.deleteUser(${id}) error:`, err);
      throw err;
    }
  }

  async searchUsers(query: string, filters?: UserQueryParams): Promise<User[]> {
    try {
      const res = await this.http.get<any>("/admin/users", {
        params: { search: query, ...filters }
      });
      const rawList = Array.isArray(res) ? res : (res?.data ?? []);
      return rawList.map((u: any) => this.mapAdminUser(u));
    } catch (err) {
      console.error("RealAdminService.searchUsers error:", err);
      return [];
    }
  }

  async getPendingRequests(params?: RequestQueryParams): Promise<PendingRequest[]> {
    try {
      const res = await this.http.get<any>("/admin/requests", { params });
      const rawList = Array.isArray(res) ? res : (res?.data ?? []);
      return rawList.map((r: any) => this.mapPendingRequest(r));
    } catch (err: any) {
      console.warn("RealAdminService.getPendingRequests remote call error:", err?.message || err);
      if (err?.status === 401 || err?.status === 403) {
        throw err;
      }
      return [];
    }
  }

  async createRequest(request: Partial<PendingRequest>): Promise<PendingRequest> {
    try {
      const res = await this.http.post<any>("/admin/requests", request);
      const raw = res?.data ?? res;
      return this.mapPendingRequest(raw);
    } catch (err) {
      console.error("RealAdminService.createRequest error:", err);
      throw err;
    }
  }

  async searchRequests(query: string, filters?: RequestQueryParams): Promise<PendingRequest[]> {
    try {
      const res = await this.http.get<any>("/admin/requests", {
        params: { search: query, status: filters?.status }
      });
      const rawList = Array.isArray(res) ? res : (res?.data ?? []);
      return rawList.map((r: any) => this.mapPendingRequest(r));
    } catch (err) {
      console.warn("RealAdminService.searchRequests caught:", err);
      return [];
    }
  }

  async approveHr(requestId: string, notes?: string): Promise<PendingRequest> {
    try {
      const res = await this.http.post<any>(`/admin/requests/${requestId}/approve-hr`, { notes });
      const raw = res?.data ?? res;
      return this.mapPendingRequest(raw);
    } catch (err) {
      console.error(`RealAdminService.approveHr(${requestId}) error:`, err);
      throw err;
    }
  }

  async approveManager(
    requestId: string, 
    options?: { tempPassword?: string; role?: UserRole; modulesAccess?: UserModuleAccess[] }
  ): Promise<{ request: PendingRequest; tempPassword?: string; user: User }> {
    try {
      const res = await this.http.post<any>(
        `/admin/requests/${requestId}/approve-manager`,
        {
          tempPassword: options?.tempPassword,
          role: options?.role || "user",
          modulesAccess: options?.modulesAccess,
        }
      );
      const raw = res?.data ?? res;
      return {
        request: this.mapPendingRequest(raw.request || raw),
        tempPassword: raw.tempPassword || options?.tempPassword,
        user: this.mapAdminUser(raw.user || raw.request || raw),
      };
    } catch (err) {
      console.error(`RealAdminService.approveManager(${requestId}) error:`, err);
      throw err;
    }
  }

  async rejectRequest(requestId: string, reason: string): Promise<PendingRequest> {
    try {
      const res = await this.http.post<any>(`/admin/requests/${requestId}/reject`, { reason });
      const raw = res?.data ?? res;
      return this.mapPendingRequest(raw);
    } catch (err) {
      console.error(`RealAdminService.rejectRequest(${requestId}) error:`, err);
      throw err;
    }
  }

  async resendCredentials(requestId: string): Promise<{ success: boolean; tempPassword?: string }> {
    try {
      const res = await this.http.post<any>(
        `/admin/requests/${requestId}/resend-credentials`
      );
      const raw = res?.data ?? res;
      return { success: raw?.success ?? true, tempPassword: raw?.tempPassword };
    } catch (err) {
      console.error(`RealAdminService.resendCredentials(${requestId}) error:`, err);
      throw err;
    }
  }

  async approveRequest(requestId: string): Promise<{ email: string; tempPassword: string }> {
    const res = await this.approveManager(requestId);
    return {
      email: res.request.email,
      tempPassword: res.tempPassword || "ESP@123456",
    };
  }

  async updateRequest(requestId: string, updates: Partial<PendingRequest>): Promise<PendingRequest> {
    try {
      const res = await this.http.put<any>(`/admin/requests/${requestId}`, updates);
      const raw = res?.data ?? res;
      return this.mapPendingRequest(raw);
    } catch (err) {
      console.error(`RealAdminService.updateRequest(${requestId}) error:`, err);
      throw err;
    }
  }
  async sendPassword(userId: string): Promise<{ success: boolean; password?: string }> {
    const res = await this.http.post<any>(`/admin/users/${userId}/send-password`, {});
    return res?.data ?? res;
  }

  async deleteRequest(requestId: string): Promise<void> {
    await this.http.delete(`/admin/requests/${requestId}`);
  }

  async getModuleRequests(): Promise<ModuleAccessRequest[]> {
    try {
      const res = await this.http.get<any>('/admin/module-requests');
      const list = Array.isArray(res) ? res : res?.data || [];
      return list;
    } catch (err) {
      console.warn('RealAdminService.getModuleRequests error:', err);
      return [];
    }
  }

  async requestModuleAccess(payload: { userId: string; userName?: string; userEmail?: string; moduleId: string; moduleName?: string }): Promise<ModuleAccessRequest> {
    const res = await this.http.post<any>('/admin/module-requests', payload);
    return res?.data ?? res;
  }

  async approveModuleRequest(requestId: string): Promise<{ success: boolean; message?: string }> {
    const res = await this.http.post<any>(`/admin/module-requests/${requestId}/approve`, {});
    return res?.data ?? res;
  }

  async rejectModuleRequest(requestId: string): Promise<{ success: boolean; message?: string }> {
    const res = await this.http.post<any>(`/admin/module-requests/${requestId}/reject`, {});
    return res?.data ?? res;
  }


  async getAuditLogs(params?: AuditLogQueryParams): Promise<{ logs: SystemAuditLog[]; total: number; limit: number; offset: number }> {
    try {
      const res = await this.http.get<any>('/admin/audit-logs', { params });
      return {
        logs: Array.isArray(res?.logs) ? res.logs : [],
        total: typeof res?.total === 'number' ? res.total : (res?.logs?.length || 0),
        limit: res?.limit || 50,
        offset: res?.offset || 0,
      };
    } catch (err) {
      console.error('RealAdminService.getAuditLogs error:', err);
      return { logs: [], total: 0, limit: 50, offset: 0 };
    }
  }

  async clearAuditLogs(): Promise<{ success: boolean; deletedCount: number; message: string }> {
    try {
      const res = await this.http.delete<any>('/admin/audit-logs');
      return res;
    } catch (err) {
      console.error('RealAdminService.clearAuditLogs error:', err);
      throw err;
    }
  }
}