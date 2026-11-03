// src/lib/server/admin-store.ts
import adminUsersMock from "@/data/mock/admin-users.json";
import adminRequestsMock from "@/data/mock/admin-requests.json";
import type {
  User,
  PendingRequest,
  UserModuleAccess,
  UserQueryParams,
  RequestQueryParams,
  RequestStatus,
  AccountStatus,
} from "@/modules/admin/types/admin.types";

// In-memory persistent server singleton across hot-reloads
declare global {
  // eslint-disable-next-line no-var
  var __espServerAdminUsers: User[] | undefined;
  // eslint-disable-next-line no-var
  var __espServerAdminRequests: PendingRequest[] | undefined;
}

// Initialize clean empty store for real data
if (!globalThis.__espServerAdminUsers || Array.isArray(globalThis.__espServerAdminUsers)) {
  globalThis.__espServerAdminUsers = [];
}

if (!globalThis.__espServerAdminRequests || Array.isArray(globalThis.__espServerAdminRequests)) {
  globalThis.__espServerAdminRequests = [];
}

function normalizeSearchText(text?: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک");
}

// ─── Users API Store ─────────────────────────────────────────────────────────

export function getServerAdminUsers(filters?: UserQueryParams): { data: User[]; total: number } {
  let list = [...(globalThis.__espServerAdminUsers || [])];

  if (filters?.role && filters.role !== "all") {
    list = list.filter((u) => u.role === filters.role);
  }

  if (filters?.status && filters.status !== "all") {
    list = list.filter((u) => u.status === filters.status);
  }

  if (filters?.department && filters.department !== "all") {
    list = list.filter(
      (u) => u.department?.toLowerCase() === filters.department?.toLowerCase()
    );
  }

  if (filters?.company && filters.company !== "all") {
    list = list.filter(
      (u) =>
        u.company === filters.company ||
        u.companyId === filters.company ||
        (filters.company === "euroslot" && (u.company?.includes("یورو") || u.email?.endsWith("@euroslotpars.com"))) ||
        (filters.company === "npceram" && (u.company?.includes("سرام") || u.email?.endsWith("@npceram.com")))
    );
  }

  if (filters?.search && filters.search.trim()) {
    const q = normalizeSearchText(filters.search);
    list = list.filter((u) => {
      const name = normalizeSearchText(u.name || `${u.firstNameFa || ""} ${u.lastNameFa || ""}`);
      const email = normalizeSearchText(u.email);
      const phone = normalizeSearchText(u.phone);
      const natId = normalizeSearchText(u.nationalId);
      const dept = normalizeSearchText(u.department);
      const title = normalizeSearchText(u.jobTitle);
      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        natId.includes(q) ||
        dept.includes(q) ||
        title.includes(q)
      );
    });
  }

  const total = list.length;
  const page = Number(filters?.page) || 1;
  const limit = Number(filters?.limit) || 50;
  const startIndex = (page - 1) * limit;
  const paginated = list.slice(startIndex, startIndex + limit);

  return { data: paginated, total };
}

export function getServerAdminUserById(id: string): User | null {
  const users = globalThis.__espServerAdminUsers || [];
  return users.find((u) => u.id === id || u.email === id) || null;
}

export function createServerAdminUser(payload: Partial<User> & { password?: string; fullNameFa?: string }): User {
  const users = globalThis.__espServerAdminUsers || [];
  const fullNameFa = payload.fullNameFa || (payload.firstNameFa && payload.lastNameFa ? `${payload.firstNameFa} ${payload.lastNameFa}` : payload.name || "کاربر جدید");
  const isCorporateEuroslot = payload.email?.endsWith("@euroslotpars.com");

  const newUser: User = {
    id: payload.id || `u-${Date.now()}`,
    name: fullNameFa,
    firstNameFa: payload.firstNameFa || fullNameFa.split(" ")[0] || "کاربر",
    lastNameFa: payload.lastNameFa || fullNameFa.split(" ").slice(1).join(" ") || "جدید",
    firstName: payload.firstName || "New",
    lastName: payload.lastName || "User",
    email: payload.email || `user_${Date.now()}@euroslotpars.com`,
    role: payload.role || "user",
    status: payload.status || "online",
    accountStatus: payload.accountStatus || "active",
    avatar: payload.avatar,
    avatarColor: payload.avatarColor || (isCorporateEuroslot ? "#0284c7" : "#0d9488"),
    avatarBgColor: payload.avatarBgColor || (isCorporateEuroslot ? "#0284c7" : "#0d9488"),
    avatarMode: payload.avatarMode || "photo",
    primaryColor: payload.primaryColor || (isCorporateEuroslot ? "blue" : "teal"),
    phone: payload.phone || "09120000000",
    nationalId: payload.nationalId || "0012345678",
    department: payload.department || "engineering",
    jobTitle: payload.jobTitle || "کارشناس مهندسی",
    company: payload.company || (isCorporateEuroslot ? "یورو اسلات پارس" : "نوین پژوهان سرام"),
    companyId: payload.companyId || (isCorporateEuroslot ? "euroslot" : "npceram"),
    joinedAt: payload.joinedAt || new Date().toISOString(),
    daysInCompany: payload.daysInCompany ?? 1,
    doneProjects: payload.doneProjects ?? 0,
    salary: payload.salary ?? 380000000,
    hasOvertime: payload.hasOvertime ?? true,
    maxOvertimeHours: payload.maxOvertimeHours ?? 40,
    monthlyBonusType: payload.monthlyBonusType ?? "cash",
    monthlyBonusAmount: payload.monthlyBonusAmount ?? 25000000,
    monthlyBonusTitle: payload.monthlyBonusTitle ?? "پاداش حسن انجام کار و بهره‌وری",
    monthlyBonuses: payload.monthlyBonuses ?? [],
    score: payload.score ?? 85,
    age: payload.age ?? 30,
    maritalStatus: payload.maritalStatus ?? "single",
    childrenCount: payload.childrenCount ?? 0,
    insuranceType: payload.insuranceType ?? "complementary",
    educationDegree: payload.educationDegree ?? "master",
    educationField: payload.educationField ?? "مهندسی مکانیک",
    skills: payload.skills?.length ? payload.skills : [
      { name: "SolidWorks & AutoCAD", rate: 85 },
      { name: "P&ID / ASME Design", rate: 80 },
      { name: "Stress Analysis & Finite Element", rate: 70 },
      { name: "Project Management", rate: 75 }
    ],
    workingFormat: payload.workingFormat ?? { office: 70, factory: 20, mission: 10, leave: 0 },
    modulesAccess: payload.modulesAccess ?? [],
    recentActivities: payload.recentActivities ?? [],
    checklists: payload.checklists ?? [],
    isProfileCompleted: payload.isProfileCompleted ?? true,
    adminApproved: true,
    adminApprovedAt: new Date().toISOString(),
    managerApproved: true,
    documents: payload.documents ?? [],
    subordinates: payload.subordinates ?? [],
    manager: payload.manager,
    managerId: payload.managerId,
    employeeId: payload.employeeId || `ESP-${Math.floor(1000 + Math.random() * 9000)}`,
    workLocation: payload.workLocation || "office",
    contractType: payload.contractType || "full_time",
  };

  users.unshift(newUser);
  globalThis.__espServerAdminUsers = users;
  return newUser;
}

export function updateServerAdminUser(id: string, updates: Partial<User>): User | null {
  const users = globalThis.__espServerAdminUsers || [];
  const index = users.findIndex((u) => u.id === id || u.email.toLowerCase() === id.toLowerCase());
  if (index === -1) return null;

  const current = users[index];
  const updated: User = {
    ...current,
    ...updates,
    id: current.id, // Immutable ID
  };

  users[index] = updated;
  globalThis.__espServerAdminUsers = users;
  return updated;
}

export function updateServerUserModules(id: string, modules: UserModuleAccess[]): User | null {
  const users = globalThis.__espServerAdminUsers || [];
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  users[index].modulesAccess = modules;
  globalThis.__espServerAdminUsers = users;
  return users[index];
}

export function deleteServerAdminUser(id: string): boolean {
  const users = globalThis.__espServerAdminUsers || [];
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return false;

  users.splice(index, 1);
  globalThis.__espServerAdminUsers = users;
  return true;
}

// ─── Requests API Store ──────────────────────────────────────────────────────

export function getServerAdminRequests(filters?: RequestQueryParams): { data: PendingRequest[]; total: number } {
  let list = [...(globalThis.__espServerAdminRequests || [])];

  if (filters?.status && filters.status !== "all") {
    list = list.filter((r) => r.status === filters.status);
  }

  if (filters?.search && filters.search.trim()) {
    const q = normalizeSearchText(filters.search);
    list = list.filter((r) => {
      const name = normalizeSearchText(r.name || r.fullName || "");
      const email = normalizeSearchText(r.email);
      const phone = normalizeSearchText(r.phone);
      const dept = normalizeSearchText(r.department);
      return name.includes(q) || email.includes(q) || phone.includes(q) || dept.includes(q);
    });
  }

  return { data: list, total: list.length };
}

export function getServerAdminRequestById(id: string): PendingRequest | null {
  const reqs = globalThis.__espServerAdminRequests || [];
  return reqs.find((r) => r.id === id) || null;
}

export function createServerAdminRequest(payload: Partial<PendingRequest>): PendingRequest {
  const reqs = globalThis.__espServerAdminRequests || [];
  const newReq: PendingRequest = {
    id: payload.id || `req-${Date.now()}`,
    userId: payload.userId || `u-${Date.now()}`,
    name: payload.name || payload.fullName || "متقاضی جدید",
    fullName: payload.fullName || payload.name || "متقاضی جدید",
    firstNameFa: payload.firstNameFa,
    lastNameFa: payload.lastNameFa,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email || `applicant_${Date.now()}@euroslotpars.com`,
    phone: payload.phone || "09120000000",
    nationalId: payload.nationalId || "0012345678",
    department: payload.department || "engineering",
    company: payload.company || "یورو اسلات پارس",
    companyId: payload.companyId || "euroslot",
    jobTitle: payload.jobTitle || "کارشناس مهندسی مکانیک",
    requestedAt: payload.requestedAt || new Date().toISOString(),
    status: (payload.status as RequestStatus) || "pending",
    requestType: payload.requestType || "edit_profile",
    requestTag: payload.requestTag,
    notes: payload.notes || "",
    salary: payload.salary ?? 350000000,
    hasOvertime: payload.hasOvertime ?? true,
    maxOvertimeHours: payload.maxOvertimeHours ?? 40,
    monthlyBonusType: payload.monthlyBonusType ?? "cash",
    monthlyBonusAmount: payload.monthlyBonusAmount ?? 25000000,
    monthlyBonusTitle: payload.monthlyBonusTitle ?? "پاداش بهره‌وری و حسن انجام کار",
    monthlyBonuses: payload.monthlyBonuses ?? [],
    modulesAccess: payload.modulesAccess ?? [],
    documents: payload.documents ?? [],
    isProfileCompleted: true,
    adminApproved: false,
    managerApproved: false,
    avatarColor: payload.avatarColor || "#0284c7",
    avatarBgColor: payload.avatarBgColor || "#0284c7",
    avatarMode: payload.avatarMode || "photo",
  };

  reqs.unshift(newReq);
  globalThis.__espServerAdminRequests = reqs;
  return newReq;
}

export function updateServerAdminRequest(id: string, updates: Partial<PendingRequest>): PendingRequest | null {
  const reqs = globalThis.__espServerAdminRequests || [];
  const index = reqs.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updated: PendingRequest = {
    ...reqs[index],
    ...updates,
    id: reqs[index].id,
  };

  reqs[index] = updated;
  globalThis.__espServerAdminRequests = reqs;
  return updated;
}

export function approveServerAdminRequestHr(id: string, notes?: string): PendingRequest | null {
  const reqs = globalThis.__espServerAdminRequests || [];
  const req = reqs.find((r) => r.id === id);
  if (!req) return null;

  req.adminApproved = true;
  req.adminApprovedAt = new Date().toISOString();
  req.adminApprovedBy = "سعید جلیلی فرد (ادمین)";
  if (notes) req.notes = (req.notes ? `${req.notes} | ` : "") + notes;

  globalThis.__espServerAdminRequests = reqs;
  return req;
}

export function approveServerAdminRequestManager(
  id: string,
  options?: { tempPassword?: string; role?: any; modulesAccess?: UserModuleAccess[] }
): { request: PendingRequest; tempPassword: string; user: User } | null {
  const reqs = globalThis.__espServerAdminRequests || [];
  const req = reqs.find((r) => r.id === id);
  if (!req) return null;

  const tempPassword = options?.tempPassword || `ESP@${Math.floor(100000 + Math.random() * 900000)}`;

  const targetRole = options?.role || req.role || "user";
  req.role = targetRole;
  req.status = "active";
  req.adminApproved = true;
  req.adminApprovedAt = new Date().toISOString();
  req.managerApproved = true;
  req.tempPassword = tempPassword;
  if (options?.modulesAccess) {
    req.modulesAccess = options.modulesAccess;
  }

  // Check if user already exists or provision into active users list
  const users = globalThis.__espServerAdminUsers || [];
  const existingIndex = users.findIndex(
    (u) => u.email.toLowerCase() === req.email.toLowerCase() || (req.userId && u.id === req.userId)
  );

  let user: User;
  if (existingIndex !== -1) {
    users[existingIndex] = {
      ...users[existingIndex],
      accountStatus: "active",
      role: targetRole,
      modulesAccess: options?.modulesAccess || req.modulesAccess || users[existingIndex].modulesAccess,
      adminApproved: true,
      managerApproved: true,
      department: req.department || users[existingIndex].department,
      jobTitle: req.jobTitle || users[existingIndex].jobTitle,
      salary: req.salary ?? users[existingIndex].salary,
    };
    user = users[existingIndex];
    globalThis.__espServerAdminUsers = users;
  } else {
    user = createServerAdminUser({
      id: req.userId || `u-${req.id.replace('req-', '')}`,
      name: req.fullName || req.name,
      firstNameFa: req.firstNameFa,
      lastNameFa: req.lastNameFa,
      firstName: req.firstName,
      lastName: req.lastName,
      email: req.email,
      phone: req.phone,
      nationalId: req.nationalId,
      role: targetRole,
      status: "online",
      accountStatus: "active",
      department: req.department,
      jobTitle: req.jobTitle,
      company: req.company,
      companyId: req.companyId,
      salary: req.salary,
      hasOvertime: req.hasOvertime,
      maxOvertimeHours: req.maxOvertimeHours,
      monthlyBonusType: req.monthlyBonusType,
      monthlyBonusAmount: req.monthlyBonusAmount,
      monthlyBonusTitle: req.monthlyBonusTitle,
      monthlyBonuses: req.monthlyBonuses,
      modulesAccess: req.modulesAccess,
      documents: req.documents,
      avatar: req.avatar,
      avatarColor: req.avatarColor,
      avatarBgColor: req.avatarBgColor,
      avatarMode: req.avatarMode,
      isProfileCompleted: true,
      adminApproved: true,
      managerApproved: true,
    });
  }

  globalThis.__espServerAdminRequests = reqs.filter((r) => r.id !== id);
  return { request: req, tempPassword, user };
}

export function rejectServerAdminRequest(id: string, reason: string): PendingRequest | null {
  const reqs = globalThis.__espServerAdminRequests || [];
  const req = reqs.find((r) => r.id === id);
  if (!req) return null;

  req.status = "rejected";
  req.notes = (req.notes ? `${req.notes} | ` : "") + `علت رد: ${reason}`;
  globalThis.__espServerAdminRequests = reqs.filter((r) => r.id !== id);
  return req;
}

export function resendServerAdminRequestCredentials(id: string): { success: boolean; tempPassword: string } | null {
  const reqs = globalThis.__espServerAdminRequests || [];
  const req = reqs.find((r) => r.id === id);
  if (!req) return null;

  const tempPassword = req.tempPassword || `ESP@${Math.floor(100000 + Math.random() * 900000)}`;
  req.tempPassword = tempPassword;
  globalThis.__espServerAdminRequests = reqs;
  return { success: true, tempPassword };
}

export function deleteServerAdminRequest(id: string): boolean {
  const reqs = globalThis.__espServerAdminRequests || [];
  const initialLen = reqs.length;
  globalThis.__espServerAdminRequests = reqs.filter((r) => r.id !== id);
  return globalThis.__espServerAdminRequests.length < initialLen;
}
