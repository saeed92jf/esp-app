import type { UserRole } from '@/types/auth';
import adminUsersMock from "@/data/mock/admin-users.json";
import adminRequestsMock from "@/data/mock/admin-requests.json";
import { 
  User, 
  PendingRequest, 
  UserModuleAccess,
  ModuleAccessRequest, 
  UserQueryParams, 
  RequestQueryParams,
  RequestStatus,
  SystemAuditLog,
  AuditLogQueryParams
} from "../types/admin.types";
import { IAdminService } from "./admin.service";

const generateWorkActivity = (): { day: number; hour: number; value: number }[] => {
  const data = [];
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 24; j++) {
      data.push({ day: i, hour: j, value: Math.floor(Math.random() * 100) });
    }
  }
  return data;
};

// Initial clean empty stores
const INITIAL_USERS: User[] = [];
const INITIAL_REQUESTS: PendingRequest[] = [];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeText = (text?: string): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک");
};

export class FakeAdminService implements IAdminService {
  private users: User[] = [...INITIAL_USERS];
  private requests: PendingRequest[] = [...INITIAL_REQUESTS];
  private initialized = false;

  private syncFromStorage(): void {
    if (typeof window === "undefined") return;

    try {
      // Sync Users
      const rawUsers = localStorage.getItem("esp_admin_users");
      if (rawUsers) {
        try {
          const parsed = JSON.parse(rawUsers);
          // purge old dummy users
          this.users = Array.isArray(parsed)
            ? parsed.filter((u: any) => !['u-rezaei', 'u-mohammadi', 'u-karimi', 'u-nouri', 'u-moradi', 'u-req-1', 'u-ali-m', 'u-hossein-m', 'u-amir-g', 'u-sara-k', 'u-nima-t'].includes(u.id))
            : [];
        } catch {
          this.users = [];
        }
      } else {
        this.users = [];
      }

      // Also sync dynamic avatarColor and primaryColor from active session and overrides
      const rawAuth = localStorage.getItem("esp_auth_user");
      if (rawAuth) {
        const authUser = JSON.parse(rawAuth);
        const match = this.users.find(u => u.id === authUser.id || u.email?.toLowerCase() === authUser.email?.toLowerCase());
        if (match) {
          if (authUser.avatarColor) match.avatarColor = authUser.avatarColor;
          if (authUser.primaryColor) match.primaryColor = authUser.primaryColor;
          if (authUser.fullName) match.name = authUser.fullNameFa || authUser.fullName;
        }
      }
      const rawOverrides = localStorage.getItem("esp_demo_users_override");
      if (rawOverrides) {
        const overrides = JSON.parse(rawOverrides);
        overrides.forEach((o: any) => {
          const uData = o.user;
          if (uData) {
            const match = this.users.find(u => u.id === uData.id || u.email?.toLowerCase() === uData.email?.toLowerCase());
            if (match) {
              if (uData.avatarColor) match.avatarColor = uData.avatarColor;
              if (uData.primaryColor) match.primaryColor = uData.primaryColor;
              if (uData.fullName) match.name = uData.fullNameFa || uData.fullName;
            }
          }
        });
      }

      // Sync Requests
      const rawRequests = localStorage.getItem("esp_account_requests");
      if (rawRequests) {
        const storedList = JSON.parse(rawRequests);
        // Merge stored with initial if stored is a simpler structure
        const merged: PendingRequest[] = storedList.map((item: any) => {
          const existing = this.requests.find((r) => r.id === item.id || r.email === item.email);
          return {
            id: item.id || existing?.id || `req-${Date.now()}`,
            name: item.name || existing?.name || item.email.split("@")[0],
            email: item.email,
            phone: item.phone || existing?.phone || "09120000000",
            nationalId: item.nationalId || existing?.nationalId || "0010000000",
            department: item.department || existing?.department || "Engineering",
            jobTitle: item.jobTitle || existing?.jobTitle || "پرسنل سازمانی",
            requestedAt: item.requestedAt || existing?.requestedAt || new Date().toISOString(),
            status: (item.status as RequestStatus) || existing?.status || "pending",
            isProfileCompleted: item.isProfileCompleted ?? existing?.isProfileCompleted ?? false,
            hrApproved: item.hrApproved ?? existing?.hrApproved ?? false,
            hrApprovedAt: item.hrApprovedAt || existing?.hrApprovedAt,
            hrApprovedBy: item.hrApprovedBy || existing?.hrApprovedBy,
            managerApproved: item.managerApproved ?? existing?.managerApproved ?? false,
            managerApprovedAt: item.managerApprovedAt || existing?.managerApprovedAt,
            managerApprovedBy: item.managerApprovedBy || existing?.managerApprovedBy,
            rejectedAt: item.rejectedAt || existing?.rejectedAt,
            rejectedBy: item.rejectedBy || existing?.rejectedBy,
            rejectionReason: item.rejectionReason || existing?.rejectionReason,
            tempPassword: item.tempPassword || existing?.tempPassword,
          };
        });

        // Add any initial ones not in stored
        INITIAL_REQUESTS.forEach((initReq) => {
          if (!merged.some((m) => m.email === initReq.email || m.id === initReq.id)) {
            merged.push(initReq);
          }
        });

        this.requests = merged;
      } else {
        localStorage.setItem("esp_account_requests", JSON.stringify(this.requests));
      }
    } catch {
      // storage quota or parsing issue
    }
  }

  private saveToStorage(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("esp_admin_users", JSON.stringify(this.users));
      localStorage.setItem("esp_account_requests", JSON.stringify(this.requests));
    } catch {
      // ignore
    }
  }

  constructor() {
    this.syncFromStorage();
  }

  // ─── Users ─────────────────────────────────────────────────────────────

  async getUsers(params?: UserQueryParams): Promise<User[]> {
    await wait(200);
    this.syncFromStorage();

    let list = [...this.users];

    if (params?.search) {
      const q = normalizeText(params.search);
      list = list.filter((u) => 
        normalizeText(u.name).includes(q) ||
        normalizeText(u.email).includes(q) ||
        normalizeText(u.phone).includes(q) ||
        normalizeText(u.nationalId).includes(q) ||
        normalizeText(u.department).includes(q) ||
        normalizeText(u.jobTitle).includes(q)
      );
    }

    if (params?.department && params.department !== "all") {
      list = list.filter((u) => u.department?.toLowerCase() === params.department?.toLowerCase());
    }

    if (params?.role && params.role !== "all") {
      list = list.filter((u) => u.role === params.role);
    }

    if (params?.status && params.status !== "all") {
      list = list.filter((u) => u.status === params.status);
    }

    return list;
  }

  async getUserById(id: string): Promise<User | null> {
    await wait(150);
    this.syncFromStorage();
    return this.users.find((u) => u.id === id) || null;
  }

  async createUser(user: Partial<User> & { password?: string }): Promise<User> {
    await wait(250);
    this.syncFromStorage();

    const id = user.id || `u_${Date.now()}`;
    const name = user.name || user.email?.split("@")[0] || "کاربر جدید";
    const newUser: User = {
      id,
      name,
      firstNameFa: user.firstNameFa || "",
      lastNameFa: user.lastNameFa || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      role: user.role || "user",
      status: "offline",
      accountStatus: "active",
      avatar: user.avatar || "",
      avatarColor: user.avatarColor || "#0284c7",
      phone: user.phone || "",
      nationalId: user.nationalId || "",
      department: user.department || "engineering",
      company: user.company || "یورواسلات پارس",
      companyId: user.companyId || "euroslot",
      jobTitle: user.jobTitle || "پرسنل سازمانی",
      workLocation: user.workLocation || "office",
      manager: user.manager || "",
      joinedAt: user.joinedAt || new Date().toISOString().split("T")[0],
      daysInCompany: 1,
      doneProjects: 0,
      salary: user.salary ?? 350000000,
      hasOvertime: user.hasOvertime ?? true,
      maxOvertimeHours: user.maxOvertimeHours ?? 40,
      monthlyBonusType: user.monthlyBonusType || "cash",
      monthlyBonusAmount: user.monthlyBonusAmount ?? 25000000,
      monthlyBonusTitle: user.monthlyBonusTitle || "پاداش حسن انجام کار و بهره‌وری",
      monthlyBonuses: user.monthlyBonuses || [],
      age: user.age || 30,
      maritalStatus: user.maritalStatus || "single",
      childrenCount: user.childrenCount ?? 0,
      insuranceType: user.insuranceType || "socialSecurity",
      educationDegree: user.educationDegree || "bachelors",
      educationField: user.educationField || "",
      workingFormat: user.workingFormat || { office: 80, factory: 10, mission: 5, leave: 5 },
      workActivity: generateWorkActivity(),
      modulesAccess: user.modulesAccess && user.modulesAccess.length > 0 ? user.modulesAccess : [
        { moduleId: "/dashboard/projects", hasAccess: true, accessLevel: "read", hoursSpent: "00:00:00", usagePercentage: 0 },
        { moduleId: "/dashboard/tasks", hasAccess: true, accessLevel: "read", hoursSpent: "00:00:00", usagePercentage: 0 }
      ],
      recentActivities: [
        { id: `act-${Date.now()}`, title: "حساب کاربری توسط مدیر ایجاد شد", date: "هم‌اکنون", status: "approved" }
      ],
      checklists: [],
      skills: user.skills || [],
      isProfileCompleted: true,
      adminApproved: true,
      managerApproved: true,
      documents: user.documents || [],
    };

    this.users = this.users.filter((u) => u.email.toLowerCase() !== newUser.email.toLowerCase());
    this.users.unshift(newUser);
    this.saveToStorage();

    if (typeof window !== "undefined" && user.email && user.password) {
      try {
        const rawCreds = localStorage.getItem("esp_custom_user_creds");
        const creds = rawCreds ? JSON.parse(rawCreds) : {};
        creds[user.email.toLowerCase()] = {
          password: user.password,
          role: newUser.role,
          name: newUser.name,
          accountStatus: "active"
        };
        localStorage.setItem("esp_custom_user_creds", JSON.stringify(creds));
      } catch {}
    }

    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    await wait(250);
    this.syncFromStorage();
    let index = this.users.findIndex((u) => u.id === id || (u.email && updates.email && u.email.toLowerCase() === updates.email.toLowerCase()) || (u.email && u.email.toLowerCase() === id.toLowerCase()));
    if (index === -1) {
      if (typeof window !== "undefined") {
        try {
          const rawAuth = localStorage.getItem("esp_auth_user");
          if (rawAuth) {
            const authUser = JSON.parse(rawAuth);
            if (authUser.id === id || (authUser.email && (authUser.email.toLowerCase() === id.toLowerCase() || (updates.email && authUser.email.toLowerCase() === updates.email.toLowerCase())))) {
              const newEntry: User = { ...authUser, ...updates, id: authUser.id || id };
              this.users.push(newEntry);
              index = this.users.length - 1;
            }
          }
        } catch {}
      }
    }
    if (index === -1) {
      const fallbackUser: User = {
        id,
        name: updates.name || "User",
        email: updates.email || `${id}@euroslotpars.com`,
        role: updates.role || "user",
        status: "online",
        accountStatus: "active",
        ...updates,
      } as any;
      this.users.push(fallbackUser);
      index = this.users.length - 1;
    }

    const updated = { ...this.users[index], ...updates };
    this.users[index] = updated;
    this.saveToStorage();

    // Sync credentials if role was updated
    if (typeof window !== "undefined" && updated.email && updates.role) {
      try {
        const rawCreds = localStorage.getItem("esp_custom_user_creds");
        const creds = rawCreds ? JSON.parse(rawCreds) : {};
        if (creds[updated.email.toLowerCase()]) {
          creds[updated.email.toLowerCase()].role = updates.role;
          localStorage.setItem("esp_custom_user_creds", JSON.stringify(creds));
        }
      } catch {}
    }

    // If currently logged-in user matches this ID or email, immediately update active auth session
    if (typeof window !== "undefined") {
      try {
        const rawAuth = localStorage.getItem("esp_auth_user");
        if (rawAuth) {
          const authUser = JSON.parse(rawAuth);
          if (authUser.id === id || (authUser.email && authUser.email?.toLowerCase() === updated.email?.toLowerCase())) {
            const updatedAuth = {
              ...authUser,
              ...updates,
              fullNameFa: updates.fullNameFa || authUser.fullNameFa,
              fullName: updates.fullName || authUser.fullName,
              name: updates.name || authUser.name,
              mobile: updates.phone || authUser.mobile,
              department: updates.department || authUser.department,
              jobTitle: updates.jobTitle || authUser.jobTitle,
              role: updates.role || authUser.role,
            };
            localStorage.setItem("esp_auth_user", JSON.stringify(updatedAuth));
            localStorage.setItem("esp-auth-user", JSON.stringify(updatedAuth));
          }
        }
      } catch {}
    }

    return updated;
  }

  async updateUserModules(id: string, modules: UserModuleAccess[]): Promise<User> {
    return this.updateUser(id, { modulesAccess: modules });
  }

  async deleteUser(id: string): Promise<void> {
    await wait(200);
    this.syncFromStorage();
    this.users = this.users.filter((u) => u.id !== id);
    this.saveToStorage();
  }

  async searchUsers(query: string, filters?: UserQueryParams): Promise<User[]> {
    return this.getUsers({ ...filters, search: query });
  }

  // ─── Requests & Approvals ──────────────────────────────────────────────

  async getPendingRequests(params?: RequestQueryParams): Promise<PendingRequest[]> {
    await wait(200);
    this.syncFromStorage();

    let list = [...this.requests];

    if (params?.status && params.status !== "all") {
      list = list.filter((r) => r.status === params.status);
    }

    if (params?.domain) {
      const dom = params.domain.toLowerCase().trim();
      list = list.filter((r) => r.email.toLowerCase().includes(dom));
    }

    if (params?.search) {
      const q = normalizeText(params.search);
      list = list.filter((r) =>
        normalizeText(r.name).includes(q) ||
        normalizeText(r.email).includes(q) ||
        normalizeText(r.phone).includes(q) ||
        normalizeText(r.nationalId).includes(q) ||
        normalizeText(r.department).includes(q) ||
        normalizeText(r.jobTitle).includes(q) ||
        normalizeText(r.id).includes(q)
      );
    }

    // Sort by requestedAt descending by default
    list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

    return list;
  }

  async createRequest(request: Partial<PendingRequest>): Promise<PendingRequest> {
    await wait(200);
    this.syncFromStorage();
    const newReq: PendingRequest = {
      id: request.id || `req-${Date.now()}`,
      userId: request.userId || `u-${Date.now()}`,
      name: request.name || "کاربر",
      email: request.email || "",
      status: "pending",
      requestedAt: new Date().toISOString(),
      requestType: request.requestType || "edit_profile",
      ...request,
    };
    this.requests.unshift(newReq);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("esp_account_requests", JSON.stringify(this.requests));
      } catch {}
    }
    return newReq;
  }

  async searchRequests(query: string, filters?: RequestQueryParams): Promise<PendingRequest[]> {
    return this.getPendingRequests({ ...filters, search: query });
  }

  async approveHr(requestId: string, notes?: string): Promise<PendingRequest> {
    await wait(350);
    this.syncFromStorage();

    const req = this.requests.find((r) => r.id === requestId);
    if (!req) {
      throw new Error(`Request with ID ${requestId} not found`);
    }

    req.hrApproved = true;
    req.hrApprovedAt = new Date().toISOString();
    req.hrApprovedBy = "واحد منابع انسانی (HR)";
    req.status = "hr_approved";
    if (notes) req.notes = notes;

    this.saveToStorage();

    // If current logged-in demo user matches this email, update their session too
    if (typeof window !== "undefined") {
      try {
        const rawAuth = localStorage.getItem("esp_auth_user");
        if (rawAuth) {
          const authUser = JSON.parse(rawAuth);
          if (authUser.email?.toLowerCase() === req.email.toLowerCase()) {
            authUser.hrApproved = true;
            localStorage.setItem("esp_auth_user", JSON.stringify(authUser));
          }
        }
      } catch {}
    }

    return { ...req };
  }

  async approveManager(
    requestId: string, 
    options?: { tempPassword?: string; role?: UserRole; modulesAccess?: UserModuleAccess[] }
  ): Promise<{ request: PendingRequest; tempPassword?: string; user: User }> {
    await wait(400);
    this.syncFromStorage();

    const req = this.requests.find((r) => r.id === requestId);
    if (!req) {
      throw new Error(`Request with ID ${requestId} not found`);
    }

    const tempPassword = options?.tempPassword || "Esp@" + Math.floor(100000 + Math.random() * 900000);
    const targetRole = options?.role || req.role || "user";
    req.role = targetRole;
    req.hrApproved = true;
    req.managerApproved = true;
    req.managerApprovedAt = new Date().toISOString();
    req.managerApprovedBy = "مدیر سیستم (System Admin)";
    req.status = "active";
    req.tempPassword = tempPassword;
    if (options?.modulesAccess) {
      req.modulesAccess = options.modulesAccess;
    }

    // Create or activate User in Users list
    let existingUser = this.users.find((u) => u.email.toLowerCase() === req.email.toLowerCase());
    if (!existingUser) {
      const newUser: User = {
        id: `u-${Date.now()}`,
        name: req.name || req.email.split("@")[0],
        email: req.email,
        role: targetRole,
        status: "offline",
        accountStatus: "active",
        avatar: "",
        avatarColor: "#0284c7",
        phone: req.phone || "09120000000",
        nationalId: req.nationalId || "0010000000",
        department: req.department || "Engineering",
        company: req.company || (req.email.toLowerCase().includes("npceram") ? "نانو پالایش" : "یورواسلات پارس"),
        companyId: req.companyId || (req.email.toLowerCase().includes("npceram") ? "npceram" : "euroslot"),
        jobTitle: req.jobTitle || "پرسنل سازمانی",
        workLocation: req.workLocation || "office",
        joinedAt: new Date().toISOString().split("T")[0],
        daysInCompany: 1,
        doneProjects: 0,
        salary: req.salary ?? 350000000,
        hasOvertime: req.hasOvertime ?? true,
        maxOvertimeHours: req.maxOvertimeHours ?? 40,
        monthlyBonusType: req.monthlyBonusType ?? "cash",
        monthlyBonusAmount: req.monthlyBonusAmount ?? 25000000,
        monthlyBonusTitle: req.monthlyBonusTitle ?? "پاداش حسن انجام کار و بهره‌وری",
        monthlyBonuses: req.monthlyBonuses ?? [],
        workingFormat: { office: 80, factory: 10, mission: 5, leave: 5 },
        workActivity: generateWorkActivity(),
        modulesAccess: options?.modulesAccess || req.modulesAccess || [
          { moduleId: "marketing", hasAccess: true, accessLevel: "read", hoursSpent: "00:00:00", usagePercentage: 0 }
        ],
        recentActivities: [
          { id: `act-${Date.now()}`, title: "حساب کاربری فعال شد", date: "هم‌اکنون", status: "approved" }
        ],
        checklists: [],
        skills: [],
        isProfileCompleted: true,
        hrApproved: true,
        managerApproved: true,
      };
      this.users.unshift(newUser);
      existingUser = newUser;
    } else {
      existingUser.accountStatus = "active";
      existingUser.role = targetRole;
      existingUser.hrApproved = true;
      existingUser.managerApproved = true;
      if (req.salary !== undefined) existingUser.salary = req.salary;
      if (req.hasOvertime !== undefined) existingUser.hasOvertime = req.hasOvertime;
      if (req.maxOvertimeHours !== undefined) existingUser.maxOvertimeHours = req.maxOvertimeHours;
      if (req.monthlyBonusType) existingUser.monthlyBonusType = req.monthlyBonusType;
      if (req.monthlyBonusAmount !== undefined) existingUser.monthlyBonusAmount = req.monthlyBonusAmount;
      if (req.monthlyBonusTitle) existingUser.monthlyBonusTitle = req.monthlyBonusTitle;
      if (req.monthlyBonuses) existingUser.monthlyBonuses = req.monthlyBonuses;
      if (options?.modulesAccess) {
        existingUser.modulesAccess = options.modulesAccess;
      } else if (req.modulesAccess) {
        existingUser.modulesAccess = req.modulesAccess;
      }
    }

    this.saveToStorage();

    // Persist custom credentials for direct login
    if (typeof window !== "undefined" && req.email) {
      try {
        const rawCreds = localStorage.getItem("esp_custom_user_creds");
        const creds = rawCreds ? JSON.parse(rawCreds) : {};
        creds[req.email.toLowerCase()] = {
          password: tempPassword,
          role: targetRole,
          name: req.name,
          accountStatus: "active"
        };
        localStorage.setItem("esp_custom_user_creds", JSON.stringify(creds));
      } catch {}
    }

    // If current logged-in demo user matches this email, activate their session too
    if (typeof window !== "undefined") {
      try {
        const rawAuth = localStorage.getItem("esp_auth_user");
        if (rawAuth) {
          const authUser = JSON.parse(rawAuth);
          if (authUser.email?.toLowerCase() === req.email.toLowerCase()) {
            authUser.accountStatus = "active";
            authUser.hrApproved = true;
            authUser.managerApproved = true;
            localStorage.setItem("esp_auth_user", JSON.stringify(authUser));
          }
        }
      } catch {}
    }

    return { request: { ...req }, tempPassword, user: existingUser };
  }

  async rejectRequest(requestId: string, reason: string): Promise<PendingRequest> {
    await wait(300);
    this.syncFromStorage();

    const req = this.requests.find((r) => r.id === requestId);
    if (!req) {
      throw new Error(`Request with ID ${requestId} not found`);
    }

    req.status = "rejected";
    req.rejectedAt = new Date().toISOString();
    req.rejectedBy = "واحد بررسی اداری / منابع انسانی";
    req.rejectionReason = reason || "درخواست مورد تایید قرار نگرفت.";

    this.saveToStorage();

    // If current logged-in demo user matches this email, update status to rejected
    if (typeof window !== "undefined") {
      try {
        const rawAuth = localStorage.getItem("esp_auth_user");
        if (rawAuth) {
          const authUser = JSON.parse(rawAuth);
          if (authUser.email?.toLowerCase() === req.email.toLowerCase()) {
            authUser.accountStatus = "rejected";
            localStorage.setItem("esp_auth_user", JSON.stringify(authUser));
          }
        }
      } catch {}
    }

    return { ...req };
  }

  async resendCredentials(requestId: string): Promise<{ success: boolean; tempPassword?: string }> {
    await wait(300);
    this.syncFromStorage();
    const req = this.requests.find((r) => r.id === requestId);
    if (!req) {
      throw new Error(`Request with ID ${requestId} not found`);
    }

    const tempPassword = req.tempPassword || "Esp@" + Math.floor(100000 + Math.random() * 900000);
    req.tempPassword = tempPassword;
    this.saveToStorage();

    return { success: true, tempPassword };
  }

  async approveRequest(requestId: string): Promise<{ email: string; tempPassword: string }> {
    const res = await this.approveManager(requestId);
    return {
      email: res.request.email,
      tempPassword: res.tempPassword || "password123",
    };
  }

  async updateRequest(requestId: string, updates: Partial<PendingRequest>): Promise<PendingRequest> {
    await wait(250);
    this.syncFromStorage();
    const idx = this.requests.findIndex((r) => r.id === requestId);
    if (idx === -1) {
      throw new Error(`Request with ID ${requestId} not found`);
    }
    const updated = { ...this.requests[idx], ...updates };
    this.requests[idx] = updated;
    this.saveToStorage();
    return { ...updated };
  }
  async sendPassword(userId: string): Promise<{ success: boolean; password?: string }> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const user = this.users.find(u => u.id === userId);
    return { success: true, password: user?.password || 'EspDev2026!' };
  }

  async deleteRequest(requestId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    this.requests = this.requests.filter(r => r.id !== requestId);
    this.saveToStorage();
  }

  async getModuleRequests(): Promise<ModuleAccessRequest[]> {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('esp_module_requests');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async requestModuleAccess(payload: { userId: string; userName?: string; userEmail?: string; moduleId: string; moduleName?: string }): Promise<ModuleAccessRequest> {
    const list = await this.getModuleRequests();
    const newReq: ModuleAccessRequest = {
      id: 'mreq_' + Date.now(),
      userId: payload.userId,
      userName: payload.userName || 'کاربر',
      userEmail: payload.userEmail || '',
      moduleId: payload.moduleId,
      moduleName: payload.moduleName || payload.moduleId,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };
    list.unshift(newReq);
    if (typeof window !== 'undefined') {
      localStorage.setItem('esp_module_requests', JSON.stringify(list));
    }
    return newReq;
  }

  async approveModuleRequest(requestId: string): Promise<{ success: boolean; message?: string }> {
    const list = await this.getModuleRequests();
    const target = list.find(r => r.id === requestId);
    if (target) {
      target.status = 'approved';
      target.reviewedAt = new Date().toISOString();
      if (typeof window !== 'undefined') {
        localStorage.setItem('esp_module_requests', JSON.stringify(list));
      }
    }
    return { success: true, message: 'درخواست تایید شد.' };
  }

  async rejectModuleRequest(requestId: string): Promise<{ success: boolean; message?: string }> {
    const list = await this.getModuleRequests();
    const target = list.find(r => r.id === requestId);
    if (target) {
      target.status = 'rejected';
      target.reviewedAt = new Date().toISOString();
      if (typeof window !== 'undefined') {
        localStorage.setItem('esp_module_requests', JSON.stringify(list));
      }
    }
    return { success: true, message: 'درخواست رد شد.' };
  }

  async getAuditLogs(_params?: AuditLogQueryParams): Promise<{ logs: SystemAuditLog[]; total: number; limit: number; offset: number }> {
    return { logs: [], total: 0, limit: 50, offset: 0 };
  }

  async clearAuditLogs(): Promise<{ success: boolean; deletedCount: number; message: string }> {
    return { success: true, deletedCount: 0, message: "Cleared" };
  }
}

export const AdminFakeService = new FakeAdminService();
export { INITIAL_USERS, INITIAL_REQUESTS };
