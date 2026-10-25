import { 
  User, 
  PendingRequest, 
  UserModuleAccess, 
  UserQueryParams, 
  RequestQueryParams,
  RequestStatus 
} from "../types/admin.types";
import { IAdminService } from "./admin.service";

const getAvatar = (gender: 'male' | 'female') => {
  return `/avatar/${gender}-01.webp`;
};

const generateWorkActivity = (): { day: number; hour: number; value: number }[] => {
  const data = [];
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 24; j++) {
      data.push({ day: i, hour: j, value: Math.floor(Math.random() * 100) });
    }
  }
  return data;
};

// Initial realistic users
const INITIAL_USERS: User[] = [
  {
    id: 'u-saeed',
    name: 'سعید جلیلی فرد',
    email: 'saeed@demo.com',
    role: 'admin',
    status: 'online',
    accountStatus: 'active',
    avatar: '/team/saeed-jalili-fard.webp',
    avatarColor: '#0284c7',
    primaryColor: 'red',
    phone: '09120000000',
    nationalId: '0012345678',
    joinedAt: '2023-01-01',
    daysInCompany: 1100,
    doneProjects: 28,
    salary: 65000,
    department: 'Engineering',
    manager: 'CEO',
    education: 'Master of Software Engineering',
    educationDegree: 'master',
    educationField: 'مهندسی نرم‌افزار',
    jobTitle: 'Senior System Administrator & Lead Engineer',
    workingFormat: { office: 60, factory: 20, mission: 10, leave: 10 },
    workActivity: generateWorkActivity(),
    modulesAccess: [
      { moduleId: 'marketing', hasAccess: true, accessLevel: 'admin', hoursSpent: '120:00:00', usagePercentage: 50 },
      { moduleId: 'projectManagement', hasAccess: true, accessLevel: 'admin', hoursSpent: '85:00:00', usagePercentage: 40 }
    ],
    recentActivities: [
      { id: 'a1', title: 'Leave form completed', date: 'Today', status: 'pending' },
      { id: 'a2', title: 'Architecture doc uploaded', date: 'Yesterday', status: 'approved', grade: 98 }
    ],
    checklists: [
      { id: 'c1', title: 'Check server logs', completed: false },
      { id: 'c2', title: 'Update permissions', completed: true }
    ],
    age: 34,
    maritalStatus: 'married',
    childrenCount: 1,
    insuranceType: 'complementary',
    isProfileCompleted: true,
    hrApproved: true,
    managerApproved: true,
  },
  {
    id: 'u-guest',
    name: 'مهمان (Guest)',
    email: 'guest@demo.com',
    role: 'user',
    status: 'online',
    accountStatus: 'active',
    avatar: getAvatar('male'),
    primaryColor: 'blue',
    phone: '09120000001',
    nationalId: '0023456789',
    joinedAt: '2026-01-01',
    daysInCompany: 30,
    doneProjects: 1,
    salary: 15000,
    department: 'Engineering',
    manager: 'سعید جلیلی فرد',
    education: 'Bachelor',
    educationDegree: 'bachelors',
    educationField: 'مهندسی کامپیوتر',
    jobTitle: 'کاربر آزمایشی سامانه',
    workingFormat: { office: 70, factory: 15, mission: 10, leave: 5 },
    workActivity: generateWorkActivity(),
    modulesAccess: [
      { moduleId: 'marketing', hasAccess: true, accessLevel: 'read', hoursSpent: '05:00:00', usagePercentage: 10 }
    ],
    recentActivities: [
      { id: 'g1', title: 'Guest session started', date: 'Today', status: 'approved' }
    ],
    checklists: [
      { id: 'gc1', title: 'Explore modules', completed: false }
    ],
    age: 26,
    maritalStatus: 'single',
    childrenCount: 0,
    insuranceType: 'none',
    isProfileCompleted: true,
    hrApproved: true,
    managerApproved: true,
  }
];

// Initial realistic requests covering all stages
const INITIAL_REQUESTS: PendingRequest[] = [
  {
    id: "req-1",
    name: "محمد محمدی",
    email: "m.mohammadi@euroslotpars.com",
    avatar: getAvatar("male"),
    phone: "09121112233",
    nationalId: "0019876543",
    department: "engineering",
    jobTitle: "مهندس متالورژی و متریال",
    requestedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    status: "pending",
    isProfileCompleted: true,
    hrApproved: false,
    managerApproved: false,
    firstNameFa: "محمد",
    lastNameFa: "محمدی",
    firstName: "Mohammad",
    lastName: "Mohammadi",
    birthDate: "1368/04/15",
    address: "تهران، شهرک غرب، بلوار پاک‌نژاد، کوچه نگار، پلاک ۱۲",
    maritalStatus: "married",
    childrenCount: 1,
    phoneVerified: true,
    emailVerified: true,
    employeeId: "ESP-4028",
    joinDate: "1402/10/01",
    manager: "سعید جلیلی فرد",
    extensionNumber: "104",
    workLocation: "factory",
    contractType: "full_time",
    insuranceCode: "1098453210",
    insuranceProvider: "تامین اجتماعی",
    insuranceValidUntil: "1405/12/29",
    supplementaryPlan: "golden",
    supplementaryProvider: "کمک‌رسان ایران (SOS)",
    shebaNumber: "IR980120000000012345678901",
    dependents: [
      { id: "dep-1", fullName: "زهرا حسینی", relationship: "spouse", nationalId: "0018765432" },
      { id: "dep-2", fullName: "امیرعلی محمدی", relationship: "child", nationalId: "0029876541" }
    ],
    educationDegree: "master",
    educationField: "مهندسی مواد و متالورژی",
    university: "دانشگاه صنعتی شریف",
    graduationYear: "1394",
    skills: [
      { id: "s-1", name: "متالورژی فیزیکی و نسوز", level: 5 },
      { id: "s-2", name: "طراحی کوره صنعتی", level: 4 },
      { id: "s-3", name: "کنترل کیفیت متریال", level: 4 }
    ]
  },
  {
    id: "req-2",
    name: "کیوان کریمی",
    email: "k.karimi@npceram.com",
    avatar: getAvatar("male"),
    phone: "09123334455",
    nationalId: "0028765432",
    department: "projectControl",
    jobTitle: "کارشناس ارشد کنترل پروژه",
    requestedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    status: "pending",
    isProfileCompleted: true,
    hrApproved: false,
    managerApproved: false,
    firstNameFa: "کیوان",
    lastNameFa: "کریمی",
    firstName: "Keyvan",
    lastName: "Karimi",
    birthDate: "1372/08/20",
    address: "اصفهان، خیابان چهارباغ بالا، مجتمع کوثر",
    maritalStatus: "single",
    childrenCount: 0,
    phoneVerified: true,
    emailVerified: true,
    employeeId: "NPC-3012",
    joinDate: "1403/01/15",
    manager: "علیرضا رضایی",
    extensionNumber: "215",
    workLocation: "office",
    contractType: "contractual",
    insuranceCode: "2087654312",
    insuranceProvider: "تامین اجتماعی",
    insuranceValidUntil: "1406/06/31",
    supplementaryPlan: "silver",
    supplementaryProvider: "بیمه ایران",
    shebaNumber: "IR550170000000109876543210",
    dependents: [],
    educationDegree: "bachelors",
    educationField: "مهندسی صنایع",
    university: "دانشگاه صنعتی امیرکبیر",
    graduationYear: "1396",
    skills: [
      { id: "s-4", name: "Primavera P6", level: 5 },
      { id: "s-5", name: "مدیریت چابک و اسکرام", level: 4 },
      { id: "s-6", name: "برنامه‌ریزی و کنترل هزینه (EVM)", level: 4 }
    ]
  },
  {
    id: "req-3",
    name: "سارا رضایی",
    email: "s.rezaei@euroslotpars.com",
    avatar: getAvatar("female"),
    phone: "09125556677",
    nationalId: "0037654321",
    department: "marketDevelopment",
    jobTitle: "مدیر توسعه بازار بین‌الملل",
    requestedAt: new Date(Date.now() - 3600000 * 32).toISOString(),
    status: "hr_approved",
    isProfileCompleted: true,
    hrApproved: true,
    hrApprovedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    hrApprovedBy: "واحد منابع انسانی (HR)",
    managerApproved: false,
    firstNameFa: "سارا",
    lastNameFa: "رضایی",
    firstName: "Sara",
    lastName: "Rezaei",
    birthDate: "1370/11/05",
    address: "تهران، پاسداران، خیابان گلستان پنجم، پلاک ۲۸",
    maritalStatus: "single",
    childrenCount: 0,
    phoneVerified: true,
    emailVerified: true,
    employeeId: "ESP-2055",
    joinDate: "1402/08/01",
    manager: "سعید جلیلی فرد",
    extensionNumber: "120",
    workLocation: "remote",
    contractType: "full_time",
    insuranceCode: "3056781290",
    insuranceProvider: "تامین اجتماعی",
    insuranceValidUntil: "1406/10/30",
    supplementaryPlan: "special",
    supplementaryProvider: "بیمه دانا",
    shebaNumber: "IR120560000000009876543211",
    dependents: [],
    educationDegree: "master",
    educationField: "مدیریت کسب و کار بین‌الملل (MBA)",
    university: "دانشگاه تهران",
    graduationYear: "1395",
    skills: [
      { id: "s-7", name: "مذاکرات تجاری بین‌الملل", level: 5 },
      { id: "s-8", name: "توسعه بازارهای صادراتی", level: 5 },
      { id: "s-9", name: "تسلط کامل به زبان انگلیسی و آلمانی", level: 5 }
    ]
  },
  {
    id: "req-4",
    name: "علی نوری",
    email: "a.nouri@euroslotpars.com",
    avatar: getAvatar("male"),
    phone: "09128889900",
    nationalId: "0046543210",
    department: "engineering",
    jobTitle: "تکنسین ارشد خط تولید",
    requestedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    status: "active",
    isProfileCompleted: true,
    hrApproved: true,
    hrApprovedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    hrApprovedBy: "واحد منابع انسانی (HR)",
    managerApproved: true,
    managerApprovedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    managerApprovedBy: "مدیر ارشد سیستم",
    tempPassword: "Esp@User2026",
    firstNameFa: "علی",
    lastNameFa: "نوری",
    firstName: "Ali",
    lastName: "Nouri",
    birthDate: "1365/02/12",
    address: "کرج، مهرشهر، فاز ۲، خیابان ۲۰۵",
    maritalStatus: "married",
    childrenCount: 2,
    phoneVerified: true,
    emailVerified: true,
    employeeId: "ESP-1018",
    joinDate: "1400/03/01",
    manager: "محمد محمدی",
    extensionNumber: "140",
    workLocation: "factory",
    contractType: "full_time",
    insuranceCode: "4098123456",
    insuranceProvider: "تامین اجتماعی",
    insuranceValidUntil: "1407/01/01",
    supplementaryPlan: "golden",
    supplementaryProvider: "کمک‌رسان ایران (SOS)",
    shebaNumber: "IR340620000000007890123456",
    dependents: [
      { id: "dep-3", fullName: "فاطمه رضایی", relationship: "spouse", nationalId: "0041239876" },
      { id: "dep-4", fullName: "سینا نوری", relationship: "child", nationalId: "0059871234" }
    ],
    educationDegree: "diploma",
    educationField: "مکانیک خودرو و ماشین‌آلات",
    university: "هنرستان شهید بهشتی",
    graduationYear: "1384",
    skills: [
      { id: "s-10", name: "تعمیر و نگهداری هیدرولیک", level: 5 },
      { id: "s-11", name: "تجهیزات و خطوط اتوماتیک", level: 4 }
    ]
  },
  {
    id: "req-5",
    name: "فرزاد مرادی",
    email: "f.moradi@npceram.com",
    avatar: getAvatar("male"),
    phone: "09127778899",
    nationalId: "0055432109",
    department: "administrative",
    jobTitle: "کارشناس امور اداری",
    requestedAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    status: "rejected",
    isProfileCompleted: false,
    hrApproved: false,
    managerApproved: false,
    rejectedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    rejectedBy: "واحد منابع انسانی (HR)",
    rejectionReason: "عدم تایید مدارک شناسایی و عدم تطابق اطلاعات با پرسنل فعال کارخانه",
    firstNameFa: "فرزاد",
    lastNameFa: "مرادی",
    firstName: "Farzad",
    lastName: "Moradi",
    birthDate: "1374/06/18",
    address: "یزد، بلوار جمهوری، کوچه ارکیده",
    maritalStatus: "single",
    childrenCount: 0,
    phoneVerified: false,
    emailVerified: true,
    employeeId: "NPC-9011",
    joinDate: "1403/02/01",
    manager: "علیرضا رضایی",
    extensionNumber: "105",
    workLocation: "office",
    contractType: "part_time",
    insuranceCode: "5012349876",
    insuranceProvider: "تامین اجتماعی",
    insuranceValidUntil: "1404/12/29",
    supplementaryPlan: "none",
    shebaNumber: "IR770150000000001234567890",
    dependents: [],
    educationDegree: "bachelors",
    educationField: "مدیریت دولتی",
    university: "دانشگاه یزد",
    graduationYear: "1398",
    skills: [
      { id: "s-12", name: "اتوماسیون اداری و مکاتبات", level: 4 }
    ]
  },
];

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
        this.users = JSON.parse(rawUsers);
      } else {
        localStorage.setItem("esp_admin_users", JSON.stringify(this.users));
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

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    await wait(250);
    this.syncFromStorage();
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error(`User with id ${id} not found`);
    }

    const updated = { ...this.users[index], ...updates };
    this.users[index] = updated;
    this.saveToStorage();
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
    options?: { tempPassword?: string; role?: 'admin' | 'user' }
  ): Promise<{ request: PendingRequest; tempPassword?: string; user: User }> {
    await wait(400);
    this.syncFromStorage();

    const req = this.requests.find((r) => r.id === requestId);
    if (!req) {
      throw new Error(`Request with ID ${requestId} not found`);
    }

    const tempPassword = options?.tempPassword || "Esp@" + Math.floor(100000 + Math.random() * 900000);

    req.hrApproved = true;
    req.managerApproved = true;
    req.managerApprovedAt = new Date().toISOString();
    req.managerApprovedBy = "مدیر سیستم (System Admin)";
    req.status = "active";
    req.tempPassword = tempPassword;

    // Create or activate User in Users list
    let existingUser = this.users.find((u) => u.email.toLowerCase() === req.email.toLowerCase());
    if (!existingUser) {
      const newUser: User = {
        id: `u-${Date.now()}`,
        name: req.name || req.email.split("@")[0],
        email: req.email,
        role: options?.role || "user",
        status: "offline",
        accountStatus: "active",
        avatar: req.avatar || getAvatar("male"),
        phone: req.phone || "09120000000",
        nationalId: req.nationalId || "0010000000",
        department: req.department || "Engineering",
        jobTitle: req.jobTitle || "پرسنل سازمانی",
        joinedAt: new Date().toISOString().split("T")[0],
        daysInCompany: 1,
        doneProjects: 0,
        salary: 20000,
        workingFormat: { office: 80, factory: 10, mission: 5, leave: 5 },
        workActivity: generateWorkActivity(),
        modulesAccess: [
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
      existingUser.hrApproved = true;
      existingUser.managerApproved = true;
    }

    this.saveToStorage();

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
}

export const AdminFakeService = new FakeAdminService();
