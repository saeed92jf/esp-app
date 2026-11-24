// src/config/organization.ts
// ─────────────────────────────────────────────────────────────────────────────
// کاتالوگ جامع، واحد و دوزبانه چارت سازمانی (دپارتمان‌ها و نقش‌های شغلی)
// Single Source of Truth for Organizational Chart, Departments & Roles
// ─────────────────────────────────────────────────────────────────────────────

import { ComboboxOption } from "@/components/ui/combobox";

export type OrgRoleLevel =
  | "executive"     // مدیران ارشد و هیئت مدیره
  | "management"    // مدیران دپارتمان‌ها
  | "supervisor"    // سرپرستان و روسای واحدها
  | "specialist"    // کارشناسان و مهندسان
  | "technician"    // تکنسین‌ها و اپراتورهای ارشد
  | "operator"      // اپراتورها و استادکاران
  | "general";      // نیروهای پشتیبانی و کارگران

export interface OrganizationRoleDefinition {
  id: string;
  departmentId: string;
  titleFa: string;
  titleEn: string;
  level: OrgRoleLevel;
  isManagerial?: boolean;
}

export interface OrganizationDepartmentDefinition {
  id: string;
  code: string;
  nameFa: string;
  nameEn: string;
  badgeClass: string;
  roles: OrganizationRoleDefinition[];
}

// ─── ۱. دپارتمان‌های رسمی سازمان ──────────────────────────────────────────────

export const ORGANIZATION_DEPARTMENTS: OrganizationDepartmentDefinition[] = [
  {
    id: "executive_board",
    code: "EXEC",
    nameFa: "مدیریت ارشد و هیئت مدیره",
    nameEn: "Executive Board & Management",
    badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25",
    roles: [
      { id: "chairman", departmentId: "executive_board", titleFa: "رئیس هیئت مدیره", titleEn: "Chairman of the Board", level: "executive", isManagerial: true },
      { id: "vice_chairman", departmentId: "executive_board", titleFa: "نایب رئیس هیئت مدیره", titleEn: "Vice Chairman", level: "executive", isManagerial: true },
      { id: "board_member", departmentId: "executive_board", titleFa: "سهامدار و عضو هیئت مدیره", titleEn: "Shareholder & Board Member", level: "executive", isManagerial: true },
      { id: "ceo", departmentId: "executive_board", titleFa: "مدیر عامل", titleEn: "Chief Executive Officer (CEO)", level: "executive", isManagerial: true },
      { id: "vp_projects", departmentId: "executive_board", titleFa: "معاونت اجرایی پروژه‌ها", titleEn: "Executive VP of Projects", level: "executive", isManagerial: true },
      { id: "vp_engineering", departmentId: "executive_board", titleFa: "معاونت مهندسی و پژوهش", titleEn: "VP of Engineering & Research", level: "executive", isManagerial: true },
      { id: "ceo_office_head", departmentId: "executive_board", titleFa: "مسئول دفتر مدیرعامل", titleEn: "Executive Assistant to CEO", level: "specialist" },
    ],
  },
  {
    id: "engineering",
    code: "ENG",
    nameFa: "مهندسی و طراحی",
    nameEn: "Engineering & Design",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25",
    roles: [
      { id: "eng_manager", departmentId: "engineering", titleFa: "مدیر دپارتمان مهندسی", titleEn: "Engineering Department Manager", level: "management", isManagerial: true },
      { id: "mech_manager", departmentId: "engineering", titleFa: "مدیر مهندسی مکانیک", titleEn: "Mechanical Engineering Manager", level: "management", isManagerial: true },
      { id: "sr_mech_engineer", departmentId: "engineering", titleFa: "کارشناس ارشد مهندسی مکانیک", titleEn: "Senior Mechanical Engineer", level: "specialist" },
      { id: "mech_engineer", departmentId: "engineering", titleFa: "کارشناس مهندسی مکانیک", titleEn: "Mechanical Engineer", level: "specialist" },
      { id: "eng_specialist", departmentId: "engineering", titleFa: "کارشناس مهندسی", titleEn: "Engineering Specialist", level: "specialist" },
      { id: "cad_designer", departmentId: "engineering", titleFa: "طراح و نقشه‌کش صنعتی", titleEn: "Industrial Design & CAD Specialist", level: "specialist" },
      { id: "graphic_designer", departmentId: "engineering", titleFa: "طراح و گرافیست", titleEn: "Graphic Designer", level: "specialist" },
    ],
  },
  {
    id: "process_engineering",
    code: "PROC",
    nameFa: "مهندسی فرآیند",
    nameEn: "Process Engineering",
    badgeClass: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/25",
    roles: [
      { id: "proc_manager", departmentId: "process_engineering", titleFa: "مدیر مهندسی فرآیند", titleEn: "Process Engineering Manager", level: "management", isManagerial: true },
      { id: "sr_proc_engineer", departmentId: "process_engineering", titleFa: "کارشناس ارشد فرآیند", titleEn: "Senior Process Engineer", level: "specialist" },
      { id: "proc_engineer", departmentId: "process_engineering", titleFa: "مهندس فرآیند", titleEn: "Process Engineer", level: "specialist" },
      { id: "proc_specialist", departmentId: "process_engineering", titleFa: "کارشناس فرآیند", titleEn: "Process Specialist", level: "specialist" },
      { id: "filtration_specialist", departmentId: "process_engineering", titleFa: "کارشناس فیلتراسیون", titleEn: "Filtration Specialist", level: "specialist" },
    ],
  },
  {
    id: "project_control",
    code: "PCO",
    nameFa: "برنامه‌ریزی و کنترل پروژه",
    nameEn: "Project Planning & Control",
    badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25",
    roles: [
      { id: "project_manager", departmentId: "project_control", titleFa: "مدیر پروژه", titleEn: "Project Manager", level: "management", isManagerial: true },
      { id: "pco_supervisor", departmentId: "project_control", titleFa: "سرپرست برنامه‌ریزی و کنترل پروژه", titleEn: "Project Planning & Control Supervisor", level: "supervisor", isManagerial: true },
      { id: "pco_specialist", departmentId: "project_control", titleFa: "کارشناس برنامه‌ریزی و کنترل پروژه", titleEn: "Project Planning & Control Specialist", level: "specialist" },
      { id: "planning_specialist", departmentId: "project_control", titleFa: "کارشناس برنامه‌ریزی", titleEn: "Planning Specialist", level: "specialist" },
    ],
  },
  {
    id: "market_development",
    code: "MKT",
    nameFa: "توسعه بازار و فروش",
    nameEn: "Market Development & Sales",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
    roles: [
      { id: "mkt_manager", departmentId: "market_development", titleFa: "مدیر توسعه بازار و فروش", titleEn: "Market Development & Sales Manager", level: "management", isManagerial: true },
      { id: "mkt_sup_sep", departmentId: "market_development", titleFa: "سرپرست توسعه بازار - بخش جداکننده‌ها", titleEn: "Market Dev Supervisor - Separators", level: "supervisor", isManagerial: true },
      { id: "mkt_sup_reactor", departmentId: "market_development", titleFa: "سرپرست توسعه بازار - بخش راکتور", titleEn: "Market Dev Supervisor - Reactors", level: "supervisor", isManagerial: true },
      { id: "mkt_sup_filter", departmentId: "market_development", titleFa: "سرپرست توسعه بازار - بخش فیلتر", titleEn: "Market Dev Supervisor - Filters", level: "supervisor", isManagerial: true },
      { id: "mkt_specialist", departmentId: "market_development", titleFa: "کارشناس توسعه بازار", titleEn: "Market Development Specialist", level: "specialist" },
      { id: "sales_specialist", departmentId: "market_development", titleFa: "کارشناس فروش", titleEn: "Sales Specialist", level: "specialist" },
      { id: "adv_specialist", departmentId: "market_development", titleFa: "کارشناس تبلیغات و مارکتینگ", titleEn: "Marketing & Advertising Specialist", level: "specialist" },
    ],
  },
  {
    id: "factory_manufacturing",
    code: "FACT",
    nameFa: "تولید و عملیات کارخانه",
    nameEn: "Factory & Manufacturing",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25",
    roles: [
      { id: "factory_manager", departmentId: "factory_manufacturing", titleFa: "مدیر کارخانه", titleEn: "Factory Manager", level: "management", isManagerial: true },
      { id: "workshop_sup", departmentId: "factory_manufacturing", titleFa: "سرپرست کارگاه", titleEn: "Workshop Supervisor", level: "supervisor", isManagerial: true },
      { id: "prod_sup", departmentId: "factory_manufacturing", titleFa: "سرپرست تولید", titleEn: "Production Supervisor", level: "supervisor", isManagerial: true },
      { id: "welding_foreman", departmentId: "factory_manufacturing", titleFa: "فورمن جوش", titleEn: "Welding Foreman", level: "supervisor", isManagerial: true },
      { id: "welder_saw", departmentId: "factory_manufacturing", titleFa: "جوشکار زیر پودری", titleEn: "Submerged Arc Welder (SAW)", level: "operator" },
      { id: "welder_elec", departmentId: "factory_manufacturing", titleFa: "جوشکار برق و آرگون", titleEn: "Electric & TIG Welder", level: "operator" },
      { id: "welder_g1", departmentId: "factory_manufacturing", titleFa: "جوشکار درجه ۱", titleEn: "Welder Grade 1", level: "operator" },
      { id: "welder_g2", departmentId: "factory_manufacturing", titleFa: "جوشکار درجه ۲", titleEn: "Welder Grade 2", level: "operator" },
      { id: "welder_asst", departmentId: "factory_manufacturing", titleFa: "کمک جوشکار", titleEn: "Assistant Welder", level: "operator" },
      { id: "machining_sup", departmentId: "factory_manufacturing", titleFa: "سرپرست ماشین‌کاری و CNC", titleEn: "Machining & CNC Supervisor", level: "supervisor", isManagerial: true },
      { id: "cnc_operator", departmentId: "factory_manufacturing", titleFa: "اپراتور دستگاه CNC", titleEn: "CNC Machine Operator", level: "operator" },
      { id: "cnc_asst", departmentId: "factory_manufacturing", titleFa: "کمک اپراتور CNC", titleEn: "Assistant CNC Operator", level: "operator" },
      { id: "lathe_machinist", departmentId: "factory_manufacturing", titleFa: "تراشکار", titleEn: "Lathe Machinist", level: "operator" },
      { id: "milling_machinist", departmentId: "factory_manufacturing", titleFa: "فرزکار", titleEn: "Milling Machinist", level: "operator" },
      { id: "drill_operator", departmentId: "factory_manufacturing", titleFa: "اپراتور دستگاه دریل", titleEn: "Drill Machine Operator", level: "operator" },
      { id: "press_operator", departmentId: "factory_manufacturing", titleFa: "اپراتور پرس و برشکاری", titleEn: "Press & Cutting Operator", level: "operator" },
      { id: "cutter_operator", departmentId: "factory_manufacturing", titleFa: "برشکار", titleEn: "Flame Cutter", level: "operator" },
      { id: "grinder", departmentId: "factory_manufacturing", titleFa: "سنگ‌زن و پلیسه‌گیر", titleEn: "Grinder & Deburrer", level: "operator" },
      { id: "polisher", departmentId: "factory_manufacturing", titleFa: "پولیش‌کار", titleEn: "Polisher", level: "operator" },
      { id: "acid_wash_operator", departmentId: "factory_manufacturing", titleFa: "اپراتور اسیدواش", titleEn: "Acid Wash Operator", level: "operator" },
      { id: "laser_operator", departmentId: "factory_manufacturing", titleFa: "اپراتور لیزر حکاکی", titleEn: "Laser Engraving Operator", level: "operator" },
      { id: "assembly_sup", departmentId: "factory_manufacturing", titleFa: "سرپرست مونتاژ", titleEn: "Assembly Supervisor", level: "supervisor", isManagerial: true },
      { id: "assembler_g1", departmentId: "factory_manufacturing", titleFa: "مونتاژکار درجه ۱", titleEn: "Assembler Grade 1", level: "operator" },
      { id: "assembler_g2", departmentId: "factory_manufacturing", titleFa: "مونتاژکار درجه ۲", titleEn: "Assembler Grade 2", level: "operator" },
      { id: "assembler_g3", departmentId: "factory_manufacturing", titleFa: "مونتاژکار درجه ۳", titleEn: "Assembler Grade 3", level: "operator" },
      { id: "assembler_asst", departmentId: "factory_manufacturing", titleFa: "کمک مونتاژکار", titleEn: "Assistant Assembler", level: "operator" },
      { id: "plant_electrician", departmentId: "factory_manufacturing", titleFa: "برق‌کار صنعتی کارخانه", titleEn: "Industrial Factory Electrician", level: "technician" },
      { id: "facilities_tech", departmentId: "factory_manufacturing", titleFa: "مسئول تأسیسات و تعمیرات", titleEn: "Facilities & Maintenance Technician", level: "technician" },
      { id: "carpentry_sup", departmentId: "factory_manufacturing", titleFa: "سرپرست نجاری و بسته‌بندی", titleEn: "Carpentry & Packaging Supervisor", level: "supervisor", isManagerial: true },
      { id: "carpenter", departmentId: "factory_manufacturing", titleFa: "نجار صنعتی", titleEn: "Industrial Carpenter", level: "operator" },
      { id: "carpenter_asst", departmentId: "factory_manufacturing", titleFa: "کمک نجار", titleEn: "Assistant Carpenter", level: "operator" },
      { id: "factory_tech_worker", departmentId: "factory_manufacturing", titleFa: "کارگر فنی کارخانه", titleEn: "Factory Technical Worker", level: "operator" },
      { id: "factory_general_worker", departmentId: "factory_manufacturing", titleFa: "کارگر ساده کارخانه", titleEn: "Factory General Worker", level: "general" },
    ],
  },
  {
    id: "factory_detail",
    code: "DTL",
    nameFa: "مهندسی کارخانه",
    nameEn: "Factory Detail Engineering",
    badgeClass: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25",
    roles: [
      { id: "tech_office_sup", departmentId: "factory_detail", titleFa: "سرپرست دفتر فنی", titleEn: "Technical Office Supervisor", level: "supervisor", isManagerial: true },
      { id: "tech_office_specialist", departmentId: "factory_detail", titleFa: "کارشناس دفتر فنی", titleEn: "Technical Office Specialist", level: "specialist" },
      { id: "shop_drawing_specialist", departmentId: "factory_detail", titleFa: "کارشناس شاپ دراوینگ و دیتیل", titleEn: "Shop Drawing Specialist", level: "specialist" },
    ],
  },
  {
    id: "factory_qc",
    code: "QC",
    nameFa: "کنترل کیفیت کارخانه",
    nameEn: "Factory Quality Control",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25",
    roles: [
      { id: "qc_manager", departmentId: "factory_qc", titleFa: "مدیر کنترل کیفیت", titleEn: "Quality Control Manager", level: "management", isManagerial: true },
      { id: "qc_sup", departmentId: "factory_qc", titleFa: "سرپرست کنترل کیفیت", titleEn: "Quality Control Supervisor", level: "supervisor", isManagerial: true },
      { id: "qc_inspector", departmentId: "factory_qc", titleFa: "کارشناس کنترل کیفیت (QC)", titleEn: "Quality Control Inspector", level: "specialist" },
      { id: "prod_control_specialist", departmentId: "factory_qc", titleFa: "کارشناس کنترل تولید", titleEn: "Production Control Specialist", level: "specialist" },
    ],
  },
  {
    id: "procurement",
    code: "PROCUR",
    nameFa: "تدارکات، ساخت و خرید",
    nameEn: "Procurement & Supply Chain",
    badgeClass: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/25",
    roles: [
      { id: "proc_manager", departmentId: "procurement", titleFa: "مدیر تدارکات و بازرگانی", titleEn: "Procurement & Commercial Manager", level: "management", isManagerial: true },
      { id: "proc_sup", departmentId: "procurement", titleFa: "مسئول تدارکات و ساخت", titleEn: "Procurement & Manufacturing Lead", level: "supervisor", isManagerial: true },
      { id: "foreign_proc_specialist", departmentId: "procurement", titleFa: "کارشناس خرید خارجی", titleEn: "Foreign Procurement Specialist", level: "specialist" },
      { id: "domestic_comm_specialist", departmentId: "procurement", titleFa: "کارشناس بازرگانی داخلی", titleEn: "Domestic Commercial Specialist", level: "specialist" },
      { id: "purchasing_specialist", departmentId: "procurement", titleFa: "کارشناس خرید و تدارکات", titleEn: "Purchasing & Procurement Specialist", level: "specialist" },
      { id: "commercial_clerk", departmentId: "procurement", titleFa: "کارمند بازرگانی", titleEn: "Commercial Clerk", level: "specialist" },
    ],
  },
  {
    id: "it_systems",
    code: "IT",
    nameFa: "فناوری اطلاعات (انفورماتیک)",
    nameEn: "Information Technology (IT)",
    badgeClass: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/25",
    roles: [
      { id: "it_manager", departmentId: "it_systems", titleFa: "مدیر فناوری اطلاعات", titleEn: "Information Technology Manager", level: "management", isManagerial: true },
      { id: "it_sup", departmentId: "it_systems", titleFa: "سرپرست فناوری اطلاعات", titleEn: "IT Infrastructure Supervisor", level: "supervisor", isManagerial: true },
      { id: "network_specialist", departmentId: "it_systems", titleFa: "کارشناس فناوری اطلاعات و شبکه", titleEn: "Network & IT Specialist", level: "specialist" },
      { id: "software_specialist", departmentId: "it_systems", titleFa: "کارشناس نرم‌افزار و سامانه", titleEn: "Software & Systems Specialist", level: "specialist" },
      { id: "it_clerk", departmentId: "it_systems", titleFa: "کارمند فناوری اطلاعات", titleEn: "IT Support Clerk", level: "technician" },
    ],
  },
  {
    id: "hseq",
    code: "HSEQ",
    nameFa: "ایمنی، بهداشت و محیط زیست",
    nameEn: "HSEQ & Safety",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
    roles: [
      { id: "hseq_manager", departmentId: "hseq", titleFa: "مدیر ایمنی، بهداشت و محیط زیست", titleEn: "HSEQ Manager", level: "management", isManagerial: true },
      { id: "hse_sup", departmentId: "hseq", titleFa: "سرپرست ایمنی و بهداشت", titleEn: "Safety & Health Supervisor", level: "supervisor", isManagerial: true },
      { id: "hse_specialist", departmentId: "hseq", titleFa: "کارشناس ایمنی و بهداشت (HSE)", titleEn: "HSE Officer / Specialist", level: "specialist" },
      { id: "qa_sup", departmentId: "hseq", titleFa: "سرپرست تضمین کیفیت", titleEn: "Quality Assurance (QA) Supervisor", level: "supervisor", isManagerial: true },
    ],
  },
  {
    id: "finance",
    code: "FIN",
    nameFa: "مالی و حسابداری",
    nameEn: "Finance & Accounting",
    badgeClass: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/25",
    roles: [
      { id: "cfo", departmentId: "finance", titleFa: "مدیر مالی", titleEn: "Chief Financial Officer (CFO)", level: "management", isManagerial: true },
      { id: "finance_sup", departmentId: "finance", titleFa: "سرپرست اداری و مالی", titleEn: "Finance & Admin Supervisor", level: "supervisor", isManagerial: true },
      { id: "banking_sup", departmentId: "finance", titleFa: "سرپرست امور بانکی", titleEn: "Banking & Treasury Supervisor", level: "supervisor", isManagerial: true },
      { id: "sr_accountant", departmentId: "finance", titleFa: "کارشناس ارشد مالی", titleEn: "Senior Accountant", level: "specialist" },
      { id: "accountant", departmentId: "finance", titleFa: "حسابدار", titleEn: "Accountant", level: "specialist" },
      { id: "receivables_clerk", departmentId: "finance", titleFa: "کارشناس پیگیری وصول مطالبات", titleEn: "Accounts Receivable Specialist", level: "specialist" },
    ],
  },
  {
    id: "admin_hr",
    code: "HR",
    nameFa: "اداری و منابع انسانی",
    nameEn: "Administration & HR",
    badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25",
    roles: [
      { id: "hr_manager", departmentId: "admin_hr", titleFa: "مدیر امور اداری", titleEn: "HR & Administrative Manager", level: "management", isManagerial: true },
      { id: "admin_sup", departmentId: "admin_hr", titleFa: "سرپرست امور اداری", titleEn: "Administrative Affairs Supervisor", level: "supervisor", isManagerial: true },
      { id: "office_head", departmentId: "admin_hr", titleFa: "مسئول دفتر و دبیرخانه", titleEn: "Office & Secretariat Coordinator", level: "specialist" },
      { id: "admin_clerk", departmentId: "admin_hr", titleFa: "کارمند اداری", titleEn: "Administrative Clerk", level: "specialist" },
      { id: "head_chef", departmentId: "admin_hr", titleFa: "سر آشپز", titleEn: "Head Chef", level: "operator" },
      { id: "asst_cook", departmentId: "admin_hr", titleFa: "کمک آشپز", titleEn: "Assistant Cook", level: "general" },
      { id: "hospitality", departmentId: "admin_hr", titleFa: "نیروی خدمات و تشریفات", titleEn: "Hospitality & Services Staff", level: "general" },
      { id: "courier", departmentId: "admin_hr", titleFa: "تحصیلدار و پیک سازمانی", titleEn: "Corporate Courier", level: "general" },
      { id: "driver", departmentId: "admin_hr", titleFa: "راننده سازمان", titleEn: "Company Driver", level: "general" },
      { id: "security_guard", departmentId: "admin_hr", titleFa: "نگهبان", titleEn: "Security Guard", level: "general" },
      { id: "night_guard", departmentId: "admin_hr", titleFa: "نگهبان شب", titleEn: "Night Security Guard", level: "general" },
      { id: "gardener", departmentId: "admin_hr", titleFa: "باغبان و متصدی فضای سبز", titleEn: "Landscaping & Gardening Staff", level: "general" },
    ],
  },
  {
    id: "warehouse_logistics",
    code: "WH",
    nameFa: "انبار و لجستیک",
    nameEn: "Warehouse & Logistics",
    badgeClass: "bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/25",
    roles: [
      { id: "warehouse_sup", departmentId: "warehouse_logistics", titleFa: "سرپرست انبار", titleEn: "Warehouse Supervisor", level: "supervisor", isManagerial: true },
      { id: "warehouse_keeper", departmentId: "warehouse_logistics", titleFa: "انباردار", titleEn: "Warehouse Keeper", level: "specialist" },
      { id: "warehouse_asst", departmentId: "warehouse_logistics", titleFa: "کمک انباردار", titleEn: "Assistant Warehouse Keeper", level: "operator" },
      { id: "warehouse_clerk", departmentId: "warehouse_logistics", titleFa: "کارمند انبار", titleEn: "Warehouse Clerk", level: "specialist" },
      { id: "forklift_driver", departmentId: "warehouse_logistics", titleFa: "راننده لیفتراک", titleEn: "Forklift Driver", level: "operator" },
      { id: "logistics_driver", departmentId: "warehouse_logistics", titleFa: "راننده نیسان و ترابری", titleEn: "Logistics & Transport Driver", level: "operator" },
      { id: "warehouse_worker", departmentId: "warehouse_logistics", titleFa: "کارگر انبار", titleEn: "Warehouse Worker", level: "general" },
    ],
  },
  {
    id: "rnd",
    code: "RND",
    nameFa: "تحقیق و توسعه",
    nameEn: "Research & Development (R&D)",
    badgeClass: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/25",
    roles: [
      { id: "rnd_manager", departmentId: "rnd", titleFa: "مدیر تحقیق و توسعه", titleEn: "R&D Manager", level: "management", isManagerial: true },
      { id: "rnd_specialist", departmentId: "rnd", titleFa: "کارشناس تحقیق و توسعه", titleEn: "R&D Specialist", level: "specialist" },
      { id: "lab_analyst", departmentId: "rnd", titleFa: "کارشناس آزمایشگاه و آنالیز مواد", titleEn: "Laboratory & Materials Analyst", level: "specialist" },
      { id: "formulation_specialist", departmentId: "rnd", titleFa: "کارشناس فرمولاسیون و فرآوری", titleEn: "Formulation & Processing Specialist", level: "specialist" },
    ],
  },
];

// ─── ۲. آرایه مسطح کلیه نقش‌های سازمانی ────────────────────────────────────────

export const ORGANIZATION_ROLES: OrganizationRoleDefinition[] = ORGANIZATION_DEPARTMENTS.flatMap(
  (dept) => dept.roles
);

// ─── ۳. توابع کمکی تبدیل به گزینه‌های Combobox ──────────────────────────────────

/**
 * دریافت لیست کلیه دپارتمان‌ها به صورت گزینه‌های شیک برای Combobox
 */
export function getOrganizationDepartmentOptions(isRtl: boolean = true): ComboboxOption[] {
  return ORGANIZATION_DEPARTMENTS.map((dept) => ({
    value: dept.nameFa,
    label: isRtl ? dept.nameFa : dept.nameEn,
    hint: dept.code,
    hintClassName: "font-mono text-[10px] uppercase font-bold",
  }));
}

/**
 * دریافت لیست نقش‌های شغلی فیلتر شده بر اساس دپارتمان برای Combobox (به صورت آبشاری)
 */
export function getOrganizationRoleOptions(
  departmentNameOrId?: string,
  isRtl: boolean = true
): ComboboxOption[] {
  let roles = ORGANIZATION_ROLES;

  if (departmentNameOrId && departmentNameOrId.trim()) {
    const norm = departmentNameOrId.trim().toLowerCase();
    const matchedDept = ORGANIZATION_DEPARTMENTS.find(
      (d) =>
        d.id.toLowerCase() === norm ||
        d.nameFa.toLowerCase() === norm ||
        d.nameEn.toLowerCase() === norm ||
        d.code.toLowerCase() === norm
    );
    if (matchedDept) {
      roles = matchedDept.roles;
    }
  }

  return roles.map((role) => ({
    value: role.titleFa,
    label: isRtl ? role.titleFa : role.titleEn,
    hint: isRtl
      ? ORGANIZATION_DEPARTMENTS.find((d) => d.id === role.departmentId)?.nameFa
      : ORGANIZATION_DEPARTMENTS.find((d) => d.id === role.departmentId)?.nameEn,
    hintClassName: "text-[10px] opacity-70",
  }));
}

/**
 * بازیابی شیء مشخصات دپارتمان بر اساس هر رشته خام (نام فارسی، انگلیسی یا کد)
 */
export function resolveOrganizationDepartment(raw?: string): OrganizationDepartmentDefinition {
  if (!raw || !raw.trim()) {
    return ORGANIZATION_DEPARTMENTS[1]; // default to Engineering
  }
  const clean = raw.trim().toLowerCase();
  const found = ORGANIZATION_DEPARTMENTS.find(
    (d) =>
      d.id.toLowerCase() === clean ||
      d.nameFa.toLowerCase() === clean ||
      d.nameEn.toLowerCase() === clean ||
      d.code.toLowerCase() === clean ||
      clean.includes(d.nameFa.toLowerCase()) ||
      clean.includes(d.id.toLowerCase())
  );
  return found || ORGANIZATION_DEPARTMENTS[1];
}

/**
 * بازیابی شیء مشخصات نقش شغلی بر اساس هر رشته خام
 */
export function resolveOrganizationRole(
  rawTitle?: string,
  departmentHint?: string
): OrganizationRoleDefinition {
  if (!rawTitle || !rawTitle.trim()) {
    return (
      ORGANIZATION_ROLES.find((r) => r.id === "eng_specialist") ||
      ORGANIZATION_ROLES[0]
    );
  }
  const clean = rawTitle.trim().toLowerCase();

  // 1. Direct titleFa or titleEn match
  const exact = ORGANIZATION_ROLES.find(
    (r) => r.titleFa.toLowerCase() === clean || r.titleEn.toLowerCase() === clean || r.id === clean
  );
  if (exact) return exact;

  // 2. Fuzzy match within department if departmentHint is provided
  let pool = ORGANIZATION_ROLES;
  if (departmentHint) {
    const dept = resolveOrganizationDepartment(departmentHint);
    pool = dept.roles;
  }

  const partial = pool.find(
    (r) => clean.includes(r.titleFa.toLowerCase()) || r.titleFa.toLowerCase().includes(clean)
  );
  if (partial) return partial;

  // 3. Fallback across all roles
  const globalPartial = ORGANIZATION_ROLES.find(
    (r) => clean.includes(r.titleFa.toLowerCase()) || r.titleFa.toLowerCase().includes(clean)
  );
  return (
    globalPartial ||
    pool[0] ||
    ORGANIZATION_ROLES[0]
  );
}
