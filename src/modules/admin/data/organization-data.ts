// src/modules/admin/data/organization-data.ts
// ─────────────────────────────────────────────────────────────────────────────
// کاتالوگ جامع دپارتمان‌ها، بخش‌ها و سمت‌های شغلی بر اساس شرکت (Euroslot Pars vs NPCeram)
// ─────────────────────────────────────────────────────────────────────────────

import { CompanyId } from "../utils/company";
import { ComboboxOption } from "@/components/ui/combobox";

export interface DepartmentDefinition {
  id: string;
  nameFa: string;
  nameEn: string;
  companyIds: CompanyId[];
}

export interface JobTitleDefinition {
  id: string;
  titleFa: string;
  titleEn: string;
  departmentId: string;
  companyIds: CompanyId[];
  isManagerial?: boolean;
}

// ─── ۱. لیست دپارتمان‌ها ──────────────────────────────────────────────────────

export const ALL_DEPARTMENTS: DepartmentDefinition[] = [
  // دپارتمان‌های ویژه یورواسلات پارس
  {
    id: "engineering",
    nameFa: "مهندسی (مکانیک، پروسس و پکیج)",
    nameEn: "Engineering",
    companyIds: ["euroslot"],
  },
  {
    id: "factoryDetail",
    nameFa: "مهندسی کارخانه (شاپ دراوینگ و دیتیل)",
    nameEn: "Factory Detail Engineering",
    companyIds: ["euroslot"],
  },
  {
    id: "factoryQc",
    nameFa: "کنترل کیفیت کارخانه (QC و بازرسی)",
    nameEn: "Factory Quality Control",
    companyIds: ["euroslot"],
  },
  {
    id: "factory",
    nameFa: "مدیریت کارخانه و خطوط ساخت",
    nameEn: "Factory & Manufacturing",
    companyIds: ["euroslot"],
  },
  {
    id: "projectControl",
    nameFa: "کنترل و مدیریت پروژه‌ها",
    nameEn: "Project Management & Control",
    companyIds: ["euroslot"],
  },
  {
    id: "procurement",
    nameFa: "تامین و بازرگانی (خرید)",
    nameEn: "Procurement & Supply Chain",
    companyIds: ["euroslot"],
  },
  {
    id: "it",
    nameFa: "فناوری اطلاعات و ارتباطات (IT)",
    nameEn: "Information Technology (IT)",
    companyIds: ["euroslot"],
  },
  {
    id: "hseq",
    nameFa: "ایمنی، بهداشت و تضمین کیفیت (HSEQ)",
    nameEn: "HSEQ & Quality Assurance",
    companyIds: ["euroslot"],
  },

  // دپارتمان‌های مشترک یا اختصاصی نانو پالایش
  {
    id: "rAndD",
    nameFa: "تحقیق و توسعه (R&D)",
    nameEn: "Research & Development (R&D)",
    companyIds: ["euroslot", "npceram"],
  },
  {
    id: "marketDevelopment",
    nameFa: "توسعه بازار و فروش",
    nameEn: "Market Development & Sales",
    companyIds: ["euroslot", "npceram"],
  },
  {
    id: "administrative",
    nameFa: "مالی و اداری",
    nameEn: "Finance & Administration",
    companyIds: ["euroslot", "npceram"],
  },
  {
    id: "production",
    nameFa: "تولید و آزمایشگاه نانوپالایش",
    nameEn: "Production & Nanomaterials Lab",
    companyIds: ["npceram"],
  },
];

// ─── ۲. عناوین و سمت‌های شغلی ───────────────────────────────────────────────────

export const ALL_JOB_TITLES: JobTitleDefinition[] = [
  // ═════════════════════════════════════════════════════════════════════════════
  // الف) سمت‌های شرکت نانو پالایش (NPCeram) — ساختار چابک
  // ═════════════════════════════════════════════════════════════════════════════
  {
    id: "npc_ceo",
    titleFa: "مدیر عامل نانو پالایش",
    titleEn: "Managing Director / CEO",
    departmentId: "administrative",
    companyIds: ["npceram"],
    isManagerial: true,
  },
  {
    id: "npc_rnd_deputy",
    titleFa: "معاونت تحقیق و توسعه نانو پالایش",
    titleEn: "R&D Deputy / Vice President",
    departmentId: "rAndD",
    companyIds: ["npceram"],
    isManagerial: true,
  },
  {
    id: "npc_rnd_formulation_expert",
    titleFa: "کارشناس ارشد فرمولاسیون نانو و سرامیک",
    titleEn: "Senior Nanoceramics Formulation Specialist",
    departmentId: "rAndD",
    companyIds: ["npceram"],
  },
  {
    id: "npc_rnd_lab_analyst",
    titleFa: "کارشناس آزمایشگاه و آنالیز مواد نانو",
    titleEn: "Nanomaterials Laboratory Analyst",
    departmentId: "rAndD",
    companyIds: ["npceram"],
  },
  {
    id: "npc_mkt_manager",
    titleFa: "مدیر توسعه بازار نانو پالایش",
    titleEn: "Market Development Manager",
    departmentId: "marketDevelopment",
    companyIds: ["npceram"],
    isManagerial: true,
  },
  {
    id: "npc_sales_specialist",
    titleFa: "کارشناس فروش و امور مشتریان نانوپالایش",
    titleEn: "Sales & Client Specialist",
    departmentId: "marketDevelopment",
    companyIds: ["npceram"],
  },
  {
    id: "npc_prod_supervisor",
    titleFa: "سرپرست تولید و آزمایشگاه نانوپالایش",
    titleEn: "Production & Lab Supervisor",
    departmentId: "production",
    companyIds: ["npceram"],
    isManagerial: true,
  },
  {
    id: "npc_prod_specialist",
    titleFa: "کارشناس تولید و فرآوری نانو",
    titleEn: "Processing & Production Specialist",
    departmentId: "production",
    companyIds: ["npceram"],
  },
  {
    id: "npc_qc_specialist",
    titleFa: "کارشناس کنترل کیفیت نانوپالایش (QC)",
    titleEn: "Quality Control Specialist",
    departmentId: "production",
    companyIds: ["npceram"],
  },
  {
    id: "npc_admin_finance",
    titleFa: "کارشناس امور مالی و اداری نانوپالایش",
    titleEn: "Finance & Administrative Specialist",
    departmentId: "administrative",
    companyIds: ["npceram"],
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // الف-۰) سمت‌های مدیریت ارشد هلدینگ و بالادستی گروه (Holding / Group Executives)
  // ═════════════════════════════════════════════════════════════════════════════
  {
    id: "group_chairman",
    titleFa: "رئیس هیئت مدیره گروه",
    titleEn: "Group Chairman of the Board",
    departmentId: "administrative",
    companyIds: ["euroslot", "npceram", "holding"],
    isManagerial: true,
  },
  {
    id: "group_ceo",
    titleFa: "مدیرعامل گروه / هلدینگ",
    titleEn: "Group CEO / Managing Director",
    departmentId: "administrative",
    companyIds: ["euroslot", "npceram", "holding"],
    isManagerial: true,
  },
  {
    id: "group_board_member",
    titleFa: "عضو هیئت مدیره گروه",
    titleEn: "Group Board Member",
    departmentId: "administrative",
    companyIds: ["euroslot", "npceram", "holding"],
    isManagerial: true,
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // ب) سمت‌های شرکت یورواسلات پارس (Euroslot Pars)
  // ═════════════════════════════════════════════════════════════════════════════

  // ۱. هیئت مدیره و مدیریت عامل
  {
    id: "esp_chairman",
    titleFa: "رئیس هیئت مدیره",
    titleEn: "Chairman of the Board",
    departmentId: "administrative",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "esp_ceo",
    titleFa: "مدیر عامل",
    titleEn: "Chief Executive Officer (CEO)",
    departmentId: "administrative",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "esp_vp_engineering",
    titleFa: "معاونت مهندسی و پژوهش",
    titleEn: "Engineering & Research VP",
    departmentId: "engineering",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "esp_vp_factory",
    titleFa: "مدیر کارخانه",
    titleEn: "Factory Manager",
    departmentId: "factory",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "esp_vp_admin",
    titleFa: "معاونت اداری و مالی",
    titleEn: "Administrative & Financial VP",
    departmentId: "administrative",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "esp_vp_procurement",
    titleFa: "معاونت تامین و خرید",
    titleEn: "Procurement VP",
    departmentId: "procurement",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "esp_vp_hseq",
    titleFa: "معاونت HSEQ",
    titleEn: "HSEQ VP",
    departmentId: "hseq",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "esp_vp_market",
    titleFa: "معاونت توسعه بازار",
    titleEn: "Market Development VP",
    departmentId: "marketDevelopment",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "esp_vp_projects",
    titleFa: "معاونت اجرایی پروژه‌ها",
    titleEn: "Executive Project Manager",
    departmentId: "projectControl",
    companyIds: ["euroslot"],
    isManagerial: true,
  },

  // ۲. مهندسی (Engineering)
  {
    id: "eng_manager",
    titleFa: "مدیر دپارتمان مهندسی",
    titleEn: "Engineering Manager",
    departmentId: "engineering",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "eng_assistant",
    titleFa: "دستیار / معاون مدیر مهندسی",
    titleEn: "Engineering Assistant / Deputy",
    departmentId: "engineering",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  // مهندسی پکیج (Package)
  {
    id: "pkg_mech_head",
    titleFa: "رئیس بخش مکانیک پکیج",
    titleEn: "Package Mechanical Section Head",
    departmentId: "engineering",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "pkg_mech_asst",
    titleFa: "دستیار بخش مکانیک پکیج",
    titleEn: "Package Mechanical Assistant",
    departmentId: "engineering",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "pkg_mech_expert",
    titleFa: "کارشناس مکانیک پکیج",
    titleEn: "Package Mechanical Expert",
    departmentId: "engineering",
    companyIds: ["euroslot"],
  },
  {
    id: "pkg_proc_head",
    titleFa: "رئیس بخش فرآیند / پروسس پکیج",
    titleEn: "Package Process Section Head",
    departmentId: "engineering",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "pkg_proc_expert",
    titleFa: "کارشناس فرآیند / پروسس پکیج",
    titleEn: "Package Process Expert",
    departmentId: "engineering",
    companyIds: ["euroslot"],
  },
  {
    id: "pkg_rotary_expert",
    titleFa: "کارشناس تجهیزات دوار پکیج (Rotary)",
    titleEn: "Rotary Equipment Specialist",
    departmentId: "engineering",
    companyIds: ["euroslot"],
  },
  {
    id: "pkg_inst_expert",
    titleFa: "کارشناس ابزار دقیق پکیج (Instrumentation)",
    titleEn: "Instrumentation Specialist",
    departmentId: "engineering",
    companyIds: ["euroslot"],
  },
  {
    id: "pkg_piping_stress",
    titleFa: "کارشناس تحلیل تنش و پایپینگ (Piping Stress)",
    titleEn: "Piping Stress & Layout Specialist",
    departmentId: "engineering",
    companyIds: ["euroslot"],
  },
  {
    id: "pkg_elec_expert",
    titleFa: "کارشناس برق و سیستم‌های قدرت (Electrical)",
    titleEn: "Electrical Specialist",
    departmentId: "engineering",
    companyIds: ["euroslot"],
  },
  {
    id: "pkg_civil_expert",
    titleFa: "کارشناس سازه و سیویل پکیج (Civil & Structural)",
    titleEn: "Civil & Structural Specialist",
    departmentId: "engineering",
    companyIds: ["euroslot"],
  },
  {
    id: "pkg_plc_expert",
    titleFa: "کارشناس کنترل و پی‌ال‌سی (PLC)",
    titleEn: "PLC & Control Systems Specialist",
    departmentId: "engineering",
    companyIds: ["euroslot"],
  },
  // انتقال جرم و جداسازی (Mass Transfer / Separation)
  {
    id: "mt_mech_head",
    titleFa: "رئیس بخش مکانیک انتقال جرم و جداسازی",
    titleEn: "Mass Transfer Mechanical Section Head",
    departmentId: "engineering",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "mt_mech_asst",
    titleFa: "دستیار بخش مکانیک انتقال جرم",
    titleEn: "Mass Transfer Mechanical Assistant",
    departmentId: "engineering",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "mt_mech_expert",
    titleFa: "کارشناس مکانیک انتقال جرم و جداسازی",
    titleEn: "Mass Transfer Mechanical Expert",
    departmentId: "engineering",
    companyIds: ["euroslot"],
  },
  {
    id: "mt_proc_head",
    titleFa: "رئیس بخش پروسس انتقال جرم",
    titleEn: "Mass Transfer Process Section Head",
    departmentId: "engineering",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "mt_proc_expert",
    titleFa: "کارشناس پروسس انتقال جرم و جداسازی",
    titleEn: "Mass Transfer Process Expert",
    departmentId: "engineering",
    companyIds: ["euroslot"],
  },
  // راکتور و فیلتراسیون (Reactor / Filtration)
  {
    id: "rf_mech_head",
    titleFa: "رئیس بخش مکانیک راکتور و فیلتراسیون",
    titleEn: "Reactor & Filtration Mechanical Section Head",
    departmentId: "engineering",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "rf_mech_asst",
    titleFa: "دستیار بخش مکانیک راکتور و فیلتراسیون",
    titleEn: "Reactor & Filtration Mechanical Assistant",
    departmentId: "engineering",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "rf_mech_expert",
    titleFa: "کارشناس مکانیک راکتور و فیلتراسیون",
    titleEn: "Reactor & Filtration Mechanical Expert",
    departmentId: "engineering",
    companyIds: ["euroslot"],
  },
  {
    id: "rf_proc_head",
    titleFa: "رئیس بخش پروسس راکتور و فیلتراسیون",
    titleEn: "Reactor & Filtration Process Section Head",
    departmentId: "engineering",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "rf_proc_expert",
    titleFa: "کارشناس پروسس راکتور و فیلتراسیون",
    titleEn: "Reactor & Filtration Process Expert",
    departmentId: "engineering",
    companyIds: ["euroslot"],
  },
  {
    id: "cad_supervisor",
    titleFa: "سرپرست بخش طراحی محصول و درفتینگ",
    titleEn: "Product Design Section Supervisor",
    departmentId: "engineering",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "cad_specialist",
    titleFa: "کارشناس ارشد مدل‌سازی سه‌بعدی و نقشه‌کشی (CAD)",
    titleEn: "Senior 3D CAD Modeler",
    departmentId: "engineering",
    companyIds: ["euroslot"],
  },

  // ۳. تحقیق و توسعه مستقل یورواسلات (R&D under Engineering VP)
  {
    id: "esp_rnd_manager",
    titleFa: "مدیر دپارتمان تحقیق و توسعه (R&D)",
    titleEn: "R&D Department Manager",
    departmentId: "rAndD",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "esp_rnd_deputy",
    titleFa: "معاون / جانشین دپارتمان R&D",
    titleEn: "R&D Deputy",
    departmentId: "rAndD",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "esp_rnd_cfd_expert",
    titleFa: "کارشناس ارشد مکانیک محاسباتی و شبیه‌سازی (CFD/FEA)",
    titleEn: "CFD & FEA Simulation Specialist",
    departmentId: "rAndD",
    companyIds: ["euroslot"],
  },
  {
    id: "esp_rnd_materials_expert",
    titleFa: "کارشناس مهندسی متالورژی و متریال پیشرفته",
    titleEn: "Materials & Metallurgy Specialist",
    departmentId: "rAndD",
    companyIds: ["euroslot"],
  },
  {
    id: "esp_rnd_dev_expert",
    titleFa: "کارشناس توسعه محصول جدید",
    titleEn: "New Product Development Specialist",
    departmentId: "rAndD",
    companyIds: ["euroslot"],
  },
  {
    id: "esp_rnd_pilot_tech",
    titleFa: "کاردان فنی و اپراتور پایلوت تحقیقاتی",
    titleEn: "R&D Technician & Pilot Operator",
    departmentId: "rAndD",
    companyIds: ["euroslot"],
  },

  // ۴. مهندسی کارخانه / دفتر فنی (Factory Detail Engineering)
  {
    id: "fact_tech_supervisor",
    titleFa: "سرپرست دفتر فنی کارخانه",
    titleEn: "Factory Technical Office Supervisor",
    departmentId: "factoryDetail",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "fact_detail_expert",
    titleFa: "کارشناس ارشد تبدیل نقشه‌ها به شاپ دراوینگ ساخت",
    titleEn: "Senior Shop Detail Engineer",
    departmentId: "factoryDetail",
    companyIds: ["euroslot"],
  },
  {
    id: "fact_cutting_expert",
    titleFa: "کارشناس کاتینگ پلن و بهینه‌سازی برش (Nesting)",
    titleEn: "Cutting Plan & Nesting Specialist",
    departmentId: "factoryDetail",
    companyIds: ["euroslot"],
  },
  {
    id: "fact_bom_expert",
    titleFa: "کارشناس تهیه پارت‌لیست ساخت و BOM کارگاهی",
    titleEn: "Manufacturing BOM Specialist",
    departmentId: "factoryDetail",
    companyIds: ["euroslot"],
  },
  {
    id: "fact_draftsman",
    titleFa: "نقشه‌کش کارگاهی کارخانه",
    titleEn: "Factory CAD Draftsman",
    departmentId: "factoryDetail",
    companyIds: ["euroslot"],
  },

  // ۵. کنترل کیفیت کارخانه (Factory QC)
  {
    id: "qc_supervisor",
    titleFa: "سرپرست کنترل کیفیت کارخانه (QC)",
    titleEn: "Factory Quality Control Supervisor",
    departmentId: "factoryQc",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "qc_dim_expert",
    titleFa: "کارشناس کنترل کیفیت ساخت و ابعادبرداری",
    titleEn: "Dimensional QC Specialist",
    departmentId: "factoryQc",
    companyIds: ["euroslot"],
  },
  {
    id: "qc_weld_inspector",
    titleFa: "بازرس جوش و اتصالات (CWI)",
    titleEn: "Welding Inspector",
    departmentId: "factoryQc",
    companyIds: ["euroslot"],
  },
  {
    id: "qc_ndt_specialist",
    titleFa: "کارشناس آزمون‌های غیرمخرب (NDT Level II)",
    titleEn: "NDT Specialist (PT, MT, UT, RT)",
    departmentId: "factoryQc",
    companyIds: ["euroslot"],
  },
  {
    id: "qc_incoming_inspector",
    titleFa: "بازرس کنترل کیفیت متریال ورودی",
    titleEn: "Incoming Material QC Inspector",
    departmentId: "factoryQc",
    companyIds: ["euroslot"],
  },
  {
    id: "qc_mdr_specialist",
    titleFa: "کارشناس تدوین مدارک کیفی نهایی (Final Dossier / MDR)",
    titleEn: "Final Dossier / MDR Specialist",
    departmentId: "factoryQc",
    companyIds: ["euroslot"],
  },

  // ۶. خطوط تولید کارخانه (Factory Manufacturing)
  {
    id: "fact_prod_supervisor",
    titleFa: "سرپرست / مدیر تولید کارخانه",
    titleEn: "Production Supervisor / Manager",
    departmentId: "factory",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "fact_workshop_supervisor",
    titleFa: "سرپرست کارگاه ساخت",
    titleEn: "Workshop Supervisor",
    departmentId: "factory",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "fact_ppc_supervisor",
    titleFa: "سرپرست برنامه‌ریزی و کنترل تولید کارخانه",
    titleEn: "Production Planning Supervisor",
    departmentId: "factory",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "fact_warehouse_supervisor",
    titleFa: "سرپرست انبارها و کنترل موجودی متریال",
    titleEn: "Factory Warehouses Supervisor",
    departmentId: "factory",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "fact_maint_supervisor",
    titleFa: "سرپرست نگهداری و تعمیرات نت (Maintenance)",
    titleEn: "Maintenance Supervisor",
    departmentId: "factory",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "fact_lead_cnc",
    titleFa: "مسئول خط ماشین‌کاری و CNC",
    titleEn: "CNC Supervisor / Lead",
    departmentId: "factory",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "fact_lead_welding",
    titleFa: "مسئول خط جوشکاری تخصصی",
    titleEn: "Welding Supervisor",
    departmentId: "factory",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "fact_lead_spot_weld",
    titleFa: "مسئول ایستگاه نقطه‌جوش",
    titleEn: "Spot Welding Supervisor",
    departmentId: "factory",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "fact_lead_assembly",
    titleFa: "مسئول خط مونتاژ",
    titleEn: "Assembly Supervisor",
    departmentId: "factory",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "fact_lead_acid",
    titleFa: "مسئول خط اسیدشویی و پاسیویشن",
    titleEn: "Acid Washing Supervisor",
    departmentId: "factory",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "fact_lead_pack",
    titleFa: "مسئول واحد بسته‌بندی، پالت‌بندی و نجاری",
    titleEn: "Packaging & Carpentry Supervisor",
    departmentId: "factory",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "fact_lead_install",
    titleFa: "سرپرست تیم بازرسی، نصب و تست در سایت",
    titleEn: "Site Installation & Testing Lead",
    departmentId: "factory",
    companyIds: ["euroslot"],
    isManagerial: true,
  },

  // ۷. فناوری اطلاعات و ارتباطات (IT)
  {
    id: "it_manager",
    titleFa: "مدیر فناوری اطلاعات (IT)",
    titleEn: "IT Manager",
    departmentId: "it",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "it_infra_supervisor",
    titleFa: "سرپرست زیرساخت، شبکه و سرور",
    titleEn: "Network & Infrastructure Supervisor",
    departmentId: "it",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "it_sec_specialist",
    titleFa: "کارشناس امنیت سایبری و داده‌ها",
    titleEn: "Cybersecurity Specialist",
    departmentId: "it",
    companyIds: ["euroslot"],
  },
  {
    id: "it_support",
    titleFa: "کارشناس پشتیبانی سیستم‌ها و هلپ‌دسک",
    titleEn: "IT Support / Helpdesk Specialist",
    departmentId: "it",
    companyIds: ["euroslot"],
  },
  {
    id: "it_erp_dev",
    titleFa: "کارشناس توسعه نرم‌افزار، ERP و دیتابیس",
    titleEn: "ERP & Software Developer",
    departmentId: "it",
    companyIds: ["euroslot"],
  },

  // ۸. کنترل پروژه یورواسلات (Project Control)
  {
    id: "pc_manager",
    titleFa: "مدیر برنامه‌ریزی و کنترل پروژه",
    titleEn: "Project Control Manager",
    departmentId: "projectControl",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "pc_supervisor",
    titleFa: "سرپرست برنامه‌ریزی و کنترل پروژه",
    titleEn: "PPC Supervisor",
    departmentId: "projectControl",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "pc_senior_specialist",
    titleFa: "کارشناس ارشد برنامه‌ریزی و کنترل پروژه (PPC)",
    titleEn: "Senior PPC Specialist",
    departmentId: "projectControl",
    companyIds: ["euroslot"],
  },
  {
    id: "pc_outsourcing",
    titleFa: "کارشناس امور برون‌سپاری و پیمانکاران فرعی",
    titleEn: "Outsourcing Affairs Supervisor",
    departmentId: "projectControl",
    companyIds: ["euroslot"],
  },
  {
    id: "pc_dcc",
    titleFa: "کارشناس کنترل مستندات و مدارک مهندسی (DCC)",
    titleEn: "Document Controller (DCC)",
    departmentId: "projectControl",
    companyIds: ["euroslot"],
  },

  // ۹. توسعه بازار و فروش یورواسلات (Market Development)
  {
    id: "mkt_sales_manager",
    titleFa: "مدیر فروش مهندسی و بازاریابی",
    titleEn: "Engineering Sales Manager",
    departmentId: "marketDevelopment",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "mkt_senior_sales",
    titleFa: "کارشناس ارشد فروش مهندسی",
    titleEn: "Senior Sales Engineer",
    departmentId: "marketDevelopment",
    companyIds: ["euroslot"],
  },
  {
    id: "mkt_tender_expert",
    titleFa: "کارشناس برآورد فنی-مالی و مناقصات",
    titleEn: "Tender & Cost Estimation Specialist",
    departmentId: "marketDevelopment",
    companyIds: ["euroslot"],
  },
  {
    id: "mkt_comms",
    titleFa: "کارشناس مارکتینگ و ارتباطات",
    titleEn: "Marketing & Communications Specialist",
    departmentId: "marketDevelopment",
    companyIds: ["euroslot"],
  },

  // ۱۰. تامین و خرید یورواسلات (Procurement)
  {
    id: "prc_internal_mgr",
    titleFa: "مدیر خرید و تدارکات داخلی",
    titleEn: "Internal Purchasing Manager",
    departmentId: "procurement",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "prc_external_mgr",
    titleFa: "مدیر بازرگانی و خرید خارجی",
    titleEn: "Foreign Procurement Manager",
    departmentId: "procurement",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "prc_foreign_expert",
    titleFa: "کارشناس ارشد بازرگانی خارجی و ثبت سفارش",
    titleEn: "Senior Foreign Procurement Specialist",
    departmentId: "procurement",
    companyIds: ["euroslot"],
  },
  {
    id: "prc_customs",
    titleFa: "کارشناس ترخیص و امور گمرکی",
    titleEn: "Customs Clearance Specialist",
    departmentId: "procurement",
    companyIds: ["euroslot"],
  },
  {
    id: "prc_domestic_expert",
    titleFa: "کارشناس خرید و تدارکات داخلی",
    titleEn: "Domestic Purchasing Specialist",
    departmentId: "procurement",
    companyIds: ["euroslot"],
  },

  // ۱۱. اداری و مالی یورواسلات (Finance & Administration)
  {
    id: "adm_fin_mgr",
    titleFa: "مدیر مالی",
    titleEn: "Financial Manager",
    departmentId: "administrative",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "adm_chief_accountant",
    titleFa: "رئیس حسابداری",
    titleEn: "Chief Accountant",
    departmentId: "administrative",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "adm_fin_accountant",
    titleFa: "کارشناس حسابداری مالی و مالیاتی",
    titleEn: "Financial & Tax Accountant",
    departmentId: "administrative",
    companyIds: ["euroslot"],
  },
  {
    id: "adm_cost_accountant",
    titleFa: "کارشناس حسابداری صنعتی و بهای تمام‌شده",
    titleEn: "Cost Accountant",
    departmentId: "administrative",
    companyIds: ["euroslot"],
  },
  {
    id: "adm_bank_supervisor",
    titleFa: "سرپرست امور بانکی، اعتبارات و ضمانت‌نامه‌ها",
    titleEn: "Banking Affairs Supervisor",
    departmentId: "administrative",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "adm_hr_mgr",
    titleFa: "مدیر اداری و منابع انسانی",
    titleEn: "HR & Administrative Manager",
    departmentId: "administrative",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "adm_hr_specialist",
    titleFa: "کارشناس منابع انسانی، کارگزینی و بیمه",
    titleEn: "HR & Payroll Specialist",
    departmentId: "administrative",
    companyIds: ["euroslot"],
  },
  {
    id: "adm_fact_admin_mgr",
    titleFa: "مدیر اداری و پشتیبانی مالی کارخانه",
    titleEn: "Factory Admin & Financial Manager",
    departmentId: "administrative",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "adm_security_supervisor",
    titleFa: "مسئول حراست و انتظامات کارخانه",
    titleEn: "Security Supervisor",
    departmentId: "administrative",
    companyIds: ["euroslot"],
    isManagerial: true,
  },

  // ۱۲. ایمنی و بهداشت HSEQ
  {
    id: "hseq_qa_supervisor",
    titleFa: "سرپرست تضمین کیفیت (QA)",
    titleEn: "Quality Assurance Supervisor",
    departmentId: "hseq",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "hseq_qa_specialist",
    titleFa: "کارشناس تضمین کیفیت و سیستم‌های مدیریت یکپارچه (IMS)",
    titleEn: "QA & IMS Specialist",
    departmentId: "hseq",
    companyIds: ["euroslot"],
  },
  {
    id: "hseq_hse_supervisor",
    titleFa: "سرپرست ایمنی و بهداشت شغلی (HSE)",
    titleEn: "HSE Supervisor",
    departmentId: "hseq",
    companyIds: ["euroslot"],
    isManagerial: true,
  },
  {
    id: "hseq_env_specialist",
    titleFa: "کارشناس بهداشت حرفه‌ای و محیط زیست",
    titleEn: "Occupational Health & Environment Specialist",
    departmentId: "hseq",
    companyIds: ["euroslot"],
  },
];

// ─── ۳. توابع کمکی فیلتر بر اساس شرکت ──────────────────────────────────────────

/**
 * دریافت لیست دپارتمان‌های فیلتر شده بر اساس شرکت
 */
export function getDepartmentsForCompany(companyId: CompanyId, isRtl: boolean = true): ComboboxOption[] {
  return ALL_DEPARTMENTS
    .filter((d) => companyId === "holding" || d.companyIds.includes(companyId) || d.companyIds.includes("holding"))
    .map((d) => ({
      value: d.id,
      label: isRtl ? d.nameFa : d.nameEn,
    }));
}

/**
 * دریافت لیست سمت‌های شغلی فیلتر شده بر اساس شرکت و دپارتمان (آبشاری)
 */
export function getJobTitlesForDepartment(
  companyId: CompanyId,
  departmentId?: string,
  isRtl: boolean = true
): ComboboxOption[] {
  let list = ALL_JOB_TITLES.filter(
    (t) => companyId === "holding" || t.companyIds.includes(companyId) || t.companyIds.includes("holding")
  );
  if (departmentId) {
    list = list.filter((t) => t.departmentId === departmentId);
  }

  return list.map((t) => ({
    value: isRtl ? t.titleFa : t.titleEn,
    label: isRtl ? t.titleFa : t.titleEn,
  }));
}

/**
 * دریافت کلیه پست‌های مدیریتی و سرپرستی سازمان برای فیلد «مدیر مستقیم»
 * بر اساس شرکت و همراه با وضعیت انتساب نام شخص
 */
export function getManagerialTitlesForCompany(
  companyId: CompanyId,
  isRtl: boolean = true
): ComboboxOption[] {
  return ALL_JOB_TITLES
    .filter(
      (t) =>
        (companyId === "holding" || t.companyIds.includes(companyId) || t.companyIds.includes("holding")) &&
        t.isManagerial
    )
    .map((t) => ({
      value: isRtl ? t.titleFa : t.titleEn,
      label: isRtl ? t.titleFa : t.titleEn,
    }));
}

/**
 * دریافت پست‌های مدیریتی به همراه نام شخص متصدی در صورت وجود
 * خروجی: «عنوان سمت - نام شخص» یا در صورت خالی بودن فقط «عنوان سمت»
 */
export function getManagerialTitlesWithOccupants(
  companyId: CompanyId,
  users: Array<{ name?: string; firstNameFa?: string; lastNameFa?: string; jobTitle?: string }> = [],
  isRtl: boolean = true
): ComboboxOption[] {
  const managers = ALL_JOB_TITLES.filter(
    (t) =>
      (companyId === "holding" || t.companyIds.includes(companyId) || t.companyIds.includes("holding")) &&
      t.isManagerial
  );

  return managers.map((t) => {
    const title = isRtl ? t.titleFa : t.titleEn;
    const occupant = users.find((u) => {
      const uTitle = (u.jobTitle || "").trim().toLowerCase();
      return (
        uTitle === t.titleFa.toLowerCase() ||
        uTitle === t.titleEn.toLowerCase() ||
        (uTitle.startsWith(t.titleFa.toLowerCase()) && uTitle.length > t.titleFa.length)
      );
    });

    let occupantName = "";
    if (occupant) {
      const faName = `${occupant.firstNameFa || ""} ${occupant.lastNameFa || ""}`.trim();
      occupantName = isRtl
        ? faName || occupant.name || ""
        : occupant.name || faName || "";
    }

    const label = occupantName ? `${title} - ${occupantName}` : title;
    return {
      value: label,
      label: label,
      hint: occupantName
        ? isRtl
          ? "تخصیص‌یافته"
          : "Assigned"
        : isRtl
        ? "پست خالی"
        : "Vacant",
      hintClassName: occupantName
        ? "text-emerald-600 bg-emerald-500/15 dark:text-emerald-400"
        : "text-amber-600 bg-amber-500/15 dark:text-amber-400",
    };
  });
}

/**
 * ارائه‌دهندگان بیمه تکمیلی معتبر
 */
export const SUPPLEMENTARY_INSURANCE_PROVIDERS: ComboboxOption[] = [
  { value: "SOS", label: "کمک‌رسان ایران (SOS)" },
  { value: "Dana", label: "بیمه دانا (Dana)" },
  { value: "Saman", label: "بیمه سامان (Saman)" },
  { value: "Alborz", label: "بیمه البرز (Alborz)" },
  { value: "Iran", label: "بیمه ایران (Iran)" },
  { value: "Asia", label: "بیمه آسیا (Asia)" },
  { value: "Parsian", label: "بیمه پارسیان (Parsian)" },
  { value: "Pasargad", label: "بیمه پاسارگاد (Pasargad)" },
  { value: "Karafarin", label: "بیمه کارآفرین (Karafarin)" },
  { value: "Novin", label: "بیمه نوین (Novin)" },
  { value: "Ma", label: "بیمه ما (Ma)" },
];

/**
 * ارائه‌دهندگان بیمه پایه (اصلی)
 */
export const BASIC_INSURANCE_PROVIDERS: ComboboxOption[] = [
  { value: "socialSecurity", label: "تامین اجتماعی (Social Security)" },
  { value: "healthInsurance", label: "بیمه سلامت / خدمات درمانی (Health Insurance)" },
  { value: "armedForces", label: "بیمه خدمات درمانی نیروهای مسلح" },
  { value: "oilRetirement", label: "صندوق بازنشستگی صنعت نفت" },
  { value: "other", label: "سایر صندوق‌های بیمه‌ای و بازنشستگی" },
];
