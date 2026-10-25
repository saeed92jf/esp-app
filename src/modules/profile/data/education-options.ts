import { ComboboxOption } from "@/components/ui/combobox";

export interface DegreeDefinition {
  key: string;
  labelFa: string;
  labelEn: string;
}

export interface StudyFieldDefinition {
  key: string;
  category: "oil_gas" | "mechanical" | "electrical" | "civil" | "project_control" | "it" | "management" | "hse";
  labelFa: string;
  labelEn: string;
}

export interface UniversityDefinition {
  key: string;
  labelFa: string;
  labelEn: string;
}

export const DEGREE_DEFINITIONS: DegreeDefinition[] = [
  { key: "diploma", labelFa: "دیپلم", labelEn: "High School Diploma" },
  { key: "associate", labelFa: "کاردانی (فوق دیپلم)", labelEn: "Associate Degree" },
  { key: "bachelor", labelFa: "کارشناسی (لیسانس)", labelEn: "Bachelor's Degree" },
  { key: "master", labelFa: "کارشناسی ارشد (فوق لیسانس)", labelEn: "Master's Degree" },
  { key: "doctorate", labelFa: "دکتری تخصصی (Ph.D.)", labelEn: "Doctorate (Ph.D.)" },
  { key: "post_doc", labelFa: "پسادکتری", labelEn: "Post-Doctorate" },
];

export const STUDY_FIELD_DEFINITIONS: StudyFieldDefinition[] = [
  // Oil, Gas & Petrochemical
  { key: "petroleum_reservoir", category: "oil_gas", labelFa: "مهندسی نفت - مخازن هیدروکربوری", labelEn: "Petroleum Engineering - Reservoir" },
  { key: "petroleum_drilling", category: "oil_gas", labelFa: "مهندسی نفت - حفاری و استخراج", labelEn: "Petroleum Engineering - Drilling" },
  { key: "petroleum_production", category: "oil_gas", labelFa: "مهندسی نفت - بهره‌برداری و تولید", labelEn: "Petroleum Engineering - Production" },
  { key: "chemical_process", category: "oil_gas", labelFa: "مهندسی شیمی - صنایع پالایش و فرآیند", labelEn: "Chemical & Process Engineering" },
  { key: "chemical_gas_refining", category: "oil_gas", labelFa: "مهندسی فرآوری و پالایش گاز", labelEn: "Gas Processing & Refining Engineering" },
  { key: "petrochemical", category: "oil_gas", labelFa: "مهندسی پتروشیمی و صنایع پلیمر", labelEn: "Petrochemical & Polymer Engineering" },

  // Mechanical, Piping & Inspection
  { key: "mechanical_fluids", category: "mechanical", labelFa: "مهندسی مکانیک - حرارت و سیالات", labelEn: "Mechanical Engineering - Thermo-Fluids" },
  { key: "mechanical_design", category: "mechanical", labelFa: "مهندسی مکانیک - طراحی کاربردی و سازه‌ها", labelEn: "Mechanical Engineering - Applied Design" },
  { key: "piping_pipeline", category: "mechanical", labelFa: "مهندسی پایپینگ و خطوط لوله انتقال", labelEn: "Piping & Pipeline Engineering" },
  { key: "materials_metallurgy", category: "mechanical", labelFa: "مهندسی مواد، متالورژی و جوشکاری", labelEn: "Materials & Metallurgy Engineering" },
  { key: "ndt_inspection", category: "mechanical", labelFa: "بازرسی فنی و آزمون‌های غیرمخرب (NDT)", labelEn: "Technical Inspection & NDT" },

  // Electrical, Instrumentation & Automation
  { key: "electrical_power", category: "electrical", labelFa: "مهندسی برق - قدرت و سیستم‌های انرژی", labelEn: "Electrical Engineering - Power Systems" },
  { key: "instrumentation_automation", category: "electrical", labelFa: "مهندسی ابزار دقیق و اتوماسیون صنعتی", labelEn: "Instrumentation & Industrial Automation" },
  { key: "control_systems", category: "electrical", labelFa: "مهندسی کنترل و سیستم‌های ابزار دقیق", labelEn: "Control Systems Engineering" },

  // Civil & Structural
  { key: "civil_structural", category: "civil", labelFa: "مهندسی عمران - سازه و محاسبات", labelEn: "Civil & Structural Engineering" },
  { key: "civil_offshore", category: "civil", labelFa: "مهندسی سازه‌های دریایی و فراساحلی", labelEn: "Offshore & Marine Structural Engineering" },

  // Project Control & Industrial Engineering
  { key: "industrial_project_control", category: "project_control", labelFa: "مهندسی صنایع - برنامه‌ریزی و کنترل پروژه", labelEn: "Industrial Engineering - Project Planning & Control" },
  { key: "project_management", category: "project_control", labelFa: "مدیریت پروژه و ساخت (ساخت و اجرا)", labelEn: "Project & Construction Management" },
  { key: "industrial_systems", category: "project_control", labelFa: "مهندسی صنایع - تحلیل سیستم‌ها و کیفیت", labelEn: "Industrial Systems & Quality Engineering" },

  // IT, Computer & Telecommunications
  { key: "computer_software", category: "it", labelFa: "مهندسی کامپیوتر - نرم‌افزار و سیستم‌ها", labelEn: "Computer Engineering - Software Systems" },
  { key: "computer_hardware_network", category: "it", labelFa: "مهندسی فناوری اطلاعات (IT) و شبکه‌های کامپیوتری", labelEn: "Information Technology & Computer Networks" },
  { key: "computer_science_data", category: "it", labelFa: "علوم کامپیوتر، هوش مصنوعی و تحلیل داده", labelEn: "Computer Science & Data Analytics" },
  { key: "telecom_industrial", category: "it", labelFa: "مهندسی مخابرات و ارتباطات صنعتی", labelEn: "Industrial Telecommunications Engineering" },

  // Administrative, Management, Commercial & Finance
  { key: "management_business", category: "management", labelFa: "مدیریت بازرگانی، تدارکات و خرید خارجی", labelEn: "Business Administration & Procurement" },
  { key: "management_hr", category: "management", labelFa: "مدیریت منابع انسانی و امور اداری", labelEn: "Human Resources & Administrative Management" },
  { key: "accounting_finance", category: "management", labelFa: "حسابداری، امور مالی و حسابرسی", labelEn: "Accounting, Finance & Auditing" },
  { key: "commercial_law", category: "management", labelFa: "حقوق تجاری و قراردادهای بین‌المللی", labelEn: "Commercial Law & International Contracts" },

  // HSE & Safety
  { key: "hse_engineering", category: "hse", labelFa: "مهندسی بهداشت، ایمنی و محیط زیست (HSE)", labelEn: "Health, Safety & Environment Engineering (HSE)" },
  { key: "industrial_safety", category: "hse", labelFa: "مهندسی ایمنی صنعتی و پدافند غیرعامل", labelEn: "Industrial Safety Engineering" },
];

export const UNIVERSITY_DEFINITIONS: UniversityDefinition[] = [
  { key: "put", labelFa: "دانشگاه صنعت نفت (اهواز / آبادان / محمودآباد)", labelEn: "Petroleum University of Technology (PUT)" },
  { key: "sharif", labelFa: "دانشگاه صنعتی شریف", labelEn: "Sharif University of Technology" },
  { key: "tehran", labelFa: "دانشگاه تهران", labelEn: "University of Tehran" },
  { key: "amirkabir", labelFa: "دانشگاه صنعتی امیرکبیر (پلی‌تکنیک تهران)", labelEn: "Amirkabir University of Technology" },
  { key: "iust", labelFa: "دانشگاه علم و صنعت ایران", labelEn: "Iran University of Science and Technology" },
  { key: "kntu", labelFa: "دانشگاه صنعتی خواجه نصیرالدین طوسی", labelEn: "K. N. Toosi University of Technology" },
  { key: "beheshti", labelFa: "دانشگاه شهید بهشتی", labelEn: "Shahid Beheshti University" },
  { key: "modares", labelFa: "دانشگاه تربیت مدرس", labelEn: "Tarbiat Modares University" },
  { key: "iut", labelFa: "دانشگاه صنعتی اصفهان", labelEn: "Isfahan University of Technology" },
  { key: "shiraz", labelFa: "دانشگاه شیراز", labelEn: "Shiraz University" },
  { key: "tabriz", labelFa: "دانشگاه تبریز", labelEn: "University of Tabriz" },
  { key: "ferdowsi", labelFa: "دانشگاه فردوسی مشهد", labelEn: "Ferdowsi University of Mashhad" },
  { key: "pgu", labelFa: "دانشگاه خلیج فارس بوشهر", labelEn: "Persian Gulf University (Bushehr)" },
  { key: "shahrood", labelFa: "دانشگاه صنعتی شاهرود", labelEn: "Shahrood University of Technology" },
  { key: "sut", labelFa: "دانشگاه صنعتی سهند تبریز", labelEn: "Sahand University of Technology" },
  { key: "nit", labelFa: "دانشگاه صنعتی نوشیروانی بابل", labelEn: "Babol Noshirvani University of Technology" },
  { key: "isfahan", labelFa: "دانشگاه اصفهان", labelEn: "University of Isfahan" },
  { key: "ia_srbau", labelFa: "دانشگاه آزاد اسلامی - واحد علوم و تحقیقات", labelEn: "Islamic Azad University - Science & Research Branch" },
  { key: "ia_south_tehran", labelFa: "دانشگاه آزاد اسلامی - واحد تهران جنوب", labelEn: "Islamic Azad University - South Tehran Branch" },
  { key: "ia_central_tehran", labelFa: "دانشگاه آزاد اسلامی - واحد تهران مرکز", labelEn: "Islamic Azad University - Central Tehran Branch" },
  { key: "ia_other", labelFa: "دانشگاه آزاد اسلامی (سایر واحدها)", labelEn: "Islamic Azad University (Other Branches)" },
  { key: "pnu", labelFa: "دانشگاه پیام نور", labelEn: "Payame Noor University" },
  { key: "foreign", labelFa: "دانشگاه‌های بین‌المللی و خارج از کشور", labelEn: "International & Foreign Universities" },
];

/**
 * Returns localized Combobox options for Degrees
 */
export function getDegreeOptions(locale: string): ComboboxOption[] {
  const isFa = locale === "fa";
  return DEGREE_DEFINITIONS.map(d => ({
    value: d.key,
    label: isFa ? d.labelFa : d.labelEn,
    triggerLabel: isFa ? d.labelFa : d.labelEn,
  }));
}

/**
 * Returns localized Combobox options for Fields of Study, with search terms
 */
export function getStudyFieldOptions(locale: string, manualLabel?: string): ComboboxOption[] {
  const isFa = locale === "fa";
  const options: ComboboxOption[] = STUDY_FIELD_DEFINITIONS.map(f => ({
    value: f.key,
    label: isFa ? f.labelFa : f.labelEn,
    triggerLabel: isFa ? f.labelFa : f.labelEn,
    searchTerms: [f.labelFa, f.labelEn, f.key],
  }));

  // Option to switch to manual entry
  options.push({
    value: "__manual__",
    label: manualLabel || (isFa ? "سایر / ورود دستی رشته..." : "Other / Manual Entry..."),
    triggerLabel: manualLabel || (isFa ? "سایر / ورود دستی" : "Other / Manual"),
  });

  return options;
}

/**
 * Returns localized Combobox options for Universities, with search terms
 */
export function getUniversityOptions(locale: string, manualLabel?: string): ComboboxOption[] {
  const isFa = locale === "fa";
  const options: ComboboxOption[] = UNIVERSITY_DEFINITIONS.map(u => ({
    value: u.key,
    label: isFa ? u.labelFa : u.labelEn,
    triggerLabel: isFa ? u.labelFa : u.labelEn,
    searchTerms: [u.labelFa, u.labelEn, u.key],
  }));

  // Option to switch to manual entry
  options.push({
    value: "__manual__",
    label: manualLabel || (isFa ? "سایر / ورود دستی نام دانشگاه..." : "Other / Manual Entry..."),
    triggerLabel: manualLabel || (isFa ? "سایر / ورود دستی" : "Other / Manual"),
  });

  return options;
}

/**
 * Returns graduation years for Combobox based on locale
 */
export function getGraduationYearOptions(locale: string): ComboboxOption[] {
  const isFa = locale === "fa";
  if (isFa) {
    const years: ComboboxOption[] = [];
    for (let y = 1405; y >= 1350; y--) {
      years.push({
        value: y.toString(),
        label: y.toString(),
      });
    }
    return years;
  } else {
    const years: ComboboxOption[] = [];
    for (let y = 2026; y >= 1970; y--) {
      years.push({
        value: y.toString(),
        label: y.toString(),
      });
    }
    return years;
  }
}

/**
 * Resolves a stored degree value (which may be a key or legacy Persian/English text) to the localized label.
 */
export function resolveDegreeLabel(degreeValue: string | undefined, locale: string): string {
  if (!degreeValue) return "";
  const isFa = locale === "fa";
  const match = DEGREE_DEFINITIONS.find(
    d => d.key === degreeValue ||
         d.labelFa === degreeValue ||
         d.labelEn === degreeValue ||
         degreeValue.includes(d.labelFa) ||
         degreeValue.includes(d.key)
  );
  if (match) {
    return isFa ? match.labelFa : match.labelEn;
  }
  // Common legacy string fallbacks
  if (degreeValue === "کارشناسی" || degreeValue === "لیسانس") {
    return isFa ? "کارشناسی (لیسانس)" : "Bachelor's Degree";
  }
  if (degreeValue === "کارشناسی ارشد" || degreeValue === "فوق لیسانس") {
    return isFa ? "کارشناسی ارشد (فوق لیسانس)" : "Master's Degree";
  }
  if (degreeValue === "دکتری" || degreeValue === "دکتری تخصصی") {
    return isFa ? "دکتری تخصصی (Ph.D.)" : "Doctorate (Ph.D.)";
  }
  if (degreeValue === "کاردانی" || degreeValue === "فوق دیپلم") {
    return isFa ? "کاردانی (فوق دیپلم)" : "Associate Degree";
  }
  if (degreeValue === "دیپلم") {
    return isFa ? "دیپلم" : "High School Diploma";
  }
  return degreeValue;
}

/**
 * Resolves a stored field of study value (key or custom string) to the localized label.
 */
export function resolveStudyFieldLabel(fieldValue: string | undefined, locale: string): string {
  if (!fieldValue) return "";
  const isFa = locale === "fa";
  const match = STUDY_FIELD_DEFINITIONS.find(
    f => f.key === fieldValue || f.labelFa === fieldValue || f.labelEn === fieldValue
  );
  if (match) {
    return isFa ? match.labelFa : match.labelEn;
  }
  return fieldValue;
}

/**
 * Resolves a stored university value (key or custom string) to the localized label.
 */
export function resolveUniversityLabel(uniValue: string | undefined, locale: string): string {
  if (!uniValue) return "";
  const isFa = locale === "fa";
  const match = UNIVERSITY_DEFINITIONS.find(
    u => u.key === uniValue || u.labelFa === uniValue || u.labelEn === uniValue
  );
  if (match) {
    return isFa ? match.labelFa : match.labelEn;
  }
  return uniValue;
}
