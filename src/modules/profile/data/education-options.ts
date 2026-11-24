// src/modules/profile/data/education-options.ts
// ─────────────────────────────────────────────────────────────────────────────
// کاتالوگ جامع، رسمی و دوزبانه مقاطع تحصیلی، رشته‌ها و دانشگاه‌ها (ESP Education Catalog)
// ─────────────────────────────────────────────────────────────────────────────

import { ComboboxOption } from "@/components/ui/combobox";

export interface DegreeDefinition {
  key: string;
  labelFa: string;
  labelEn: string;
}

export interface StudyFieldDefinition {
  key: string;
  category:
    | "oil_gas"
    | "mechanical"
    | "electrical"
    | "civil"
    | "project_control"
    | "it"
    | "management"
    | "hse"
    | "science"
    | "vocational"
    | "general";
  labelFa: string;
  labelEn: string;
}

export interface UniversityDefinition {
  key: string;
  labelFa: string;
  labelEn: string;
}

// ─── ۱. مقاطع و درجات تحصیلی (Education Degrees) ──────────────────────────────

export const DEGREE_DEFINITIONS: DegreeDefinition[] = [
  { key: "doctorate", labelFa: "دکتری تخصصی (Ph.D.)", labelEn: "Doctorate (Ph.D.)" },
  { key: "post_doc", labelFa: "پسادکتری", labelEn: "Post-Doctorate" },
  { key: "master", labelFa: "کارشناسی ارشد (فوق لیسانس)", labelEn: "Master's Degree" },
  { key: "bachelor", labelFa: "کارشناسی (لیسانس)", labelEn: "Bachelor's Degree" },
  { key: "associate", labelFa: "کاردانی (فوق دیپلم)", labelEn: "Associate Degree" },
  { key: "diploma", labelFa: "دیپلم متوسطه", labelEn: "High School Diploma" },
  { key: "below_diploma", labelFa: "زیر دیپلم (متوسطه)", labelEn: "Secondary Education (Incomplete)" },
  { key: "middle_school", labelFa: "سیکل (دوره اول متوسطه / راهنمایی)", labelEn: "Middle School (Junior High)" },
  { key: "elementary", labelFa: "ابتدایی", labelEn: "Elementary / Primary School" },
  { key: "other", labelFa: "سایر مدارک / دوره‌های تخصصی", labelEn: "Other / Specialized Courses" },
];

// ─── ۲. رشته‌های تحصیلی (Fields of Study) ────────────────────────────────────

export const STUDY_FIELD_DEFINITIONS: StudyFieldDefinition[] = [
  // Oil, Gas, Process & Chemical
  { key: "petroleum_reservoir", category: "oil_gas", labelFa: "مهندسی نفت - مخازن هیدروکربوری", labelEn: "Petroleum Engineering - Reservoir" },
  { key: "petroleum_drilling", category: "oil_gas", labelFa: "مهندسی نفت - حفاری و استخراج", labelEn: "Petroleum Engineering - Drilling" },
  { key: "petroleum_production", category: "oil_gas", labelFa: "مهندسی نفت - بهره‌برداری و تولید", labelEn: "Petroleum Engineering - Production" },
  { key: "chemical_petroleum", category: "oil_gas", labelFa: "مهندسی شیمی و نفت", labelEn: "Chemical & Petroleum Engineering" },
  { key: "chemical_process", category: "oil_gas", labelFa: "مهندسی شیمی - صنایع پالایش و فرآیند", labelEn: "Chemical & Process Engineering" },
  { key: "chemical_gas_refining", category: "oil_gas", labelFa: "مهندسی فرآوری و پالایش گاز", labelEn: "Gas Processing & Refining Engineering" },
  { key: "petrochemical", category: "oil_gas", labelFa: "مهندسی پتروشیمی و صنایع پلیمر", labelEn: "Petrochemical & Polymer Engineering" },
  { key: "chemistry", category: "science", labelFa: "شیمی کاربردی و محض", labelEn: "Applied & Pure Chemistry" },

  // Mechanical, Materials, Piping & Inspection
  { key: "mechanical_general", category: "mechanical", labelFa: "مهندسی مکانیک", labelEn: "Mechanical Engineering" },
  { key: "mechanical_fluids", category: "mechanical", labelFa: "مهندسی مکانیک - حرارت و سیالات", labelEn: "Mechanical Engineering - Thermo-Fluids" },
  { key: "mechanical_design", category: "mechanical", labelFa: "مهندسی مکانیک - طراحی کاربردی و سازه‌ها", labelEn: "Mechanical Engineering - Applied Design" },
  { key: "piping_pipeline", category: "mechanical", labelFa: "مهندسی پایپینگ و خطوط لوله انتقال", labelEn: "Piping & Pipeline Engineering" },
  { key: "materials_metallurgy", category: "mechanical", labelFa: "مهندسی مواد، متالورژی و جوشکاری", labelEn: "Materials & Metallurgy Engineering" },
  { key: "ndt_inspection", category: "mechanical", labelFa: "بازرسی فنی و آزمون‌های غیرمخرب (NDT)", labelEn: "Technical Inspection & NDT" },
  { key: "technology_engineering", category: "mechanical", labelFa: "مهندسی تکنولوژی و ساخت", labelEn: "Technology & Manufacturing Engineering" },
  { key: "aerospace_engineering", category: "mechanical", labelFa: "مهندسی هوافضا", labelEn: "Aerospace Engineering" },
  { key: "railway_engineering", category: "mechanical", labelFa: "مهندسی راه‌آهن و حمل و نقل", labelEn: "Railway Engineering" },

  // Electrical, Instrumentation & Optics
  { key: "electrical_power", category: "electrical", labelFa: "مهندسی برق", labelEn: "Electrical Engineering" },
  { key: "instrumentation_automation", category: "electrical", labelFa: "مهندسی ابزار دقیق و اتوماسیون صنعتی", labelEn: "Instrumentation & Industrial Automation" },
  { key: "control_systems", category: "electrical", labelFa: "مهندسی کنترل و سیستم‌های ابزار دقیق", labelEn: "Control Systems Engineering" },
  { key: "electro_optics", category: "electrical", labelFa: "مهندسی اپتیک و لیزر (الکترواپتیک)", labelEn: "Electro-Optics & Laser Engineering" },

  // Civil, Structural & Surveying
  { key: "civil_structural", category: "civil", labelFa: "مهندسی عمران و سازه", labelEn: "Civil & Structural Engineering" },
  { key: "civil_offshore", category: "civil", labelFa: "مهندسی سازه‌های دریایی و فراساحلی", labelEn: "Offshore & Marine Structural Engineering" },
  { key: "surveying_geomatics", category: "civil", labelFa: "مهندسی نقشه‌برداری و ژئوماتیک", labelEn: "Surveying & Geomatics Engineering" },

  // Industrial Engineering & Project Control
  { key: "industrial_project_control", category: "project_control", labelFa: "مهندسی صنایع و تحلیل سیستم‌ها", labelEn: "Industrial Engineering" },
  { key: "project_management", category: "project_control", labelFa: "مدیریت پروژه و ساخت (ساخت و اجرا)", labelEn: "Project & Construction Management" },
  { key: "industrial_systems", category: "project_control", labelFa: "مهندسی صنایع - کیفیت و بهره‌وری", labelEn: "Industrial Systems & Quality" },

  // IT, Computer & Telecommunications
  { key: "computer_software", category: "it", labelFa: "مهندسی کامپیوتر و نرم‌افزار", labelEn: "Computer Engineering & Software" },
  { key: "computer_hardware_network", category: "it", labelFa: "مهندسی فناوری اطلاعات (IT) و شبکه‌های کامپیوتری", labelEn: "Information Technology (IT) Engineering" },
  { key: "computer_science_data", category: "it", labelFa: "علوم کامپیوتر، هوش مصنوعی و تحلیل داده", labelEn: "Computer Science & Data Analytics" },
  { key: "telecom_industrial", category: "it", labelFa: "مهندسی مخابرات و ارتباطات صنعتی", labelEn: "Industrial Telecommunications Engineering" },

  // Management, Accounting, Commercial & Admin
  { key: "accounting_finance", category: "management", labelFa: "حسابداری و امور مالی", labelEn: "Accounting & Finance" },
  { key: "management_general", category: "management", labelFa: "مدیریت و بازرگانی", labelEn: "Business Administration & Management" },
  { key: "management_hr", category: "management", labelFa: "مدیریت منابع انسانی و امور اداری", labelEn: "Human Resources Management" },
  { key: "office_admin", category: "management", labelFa: "امور اداری، دفتری و منشی‌گری", labelEn: "Office Administration & Secretarial" },
  { key: "commercial_law", category: "management", labelFa: "حقوق تجاری و قراردادهای بین‌المللی", labelEn: "Commercial Law & International Contracts" },

  // Sciences, Agriculture & Arts
  { key: "mathematics", category: "science", labelFa: "ریاضی و آمار", labelEn: "Mathematics & Statistics" },
  { key: "math_physics", category: "science", labelFa: "ریاضی و فیزیک", labelEn: "Mathematics & Physics" },
  { key: "experimental_sciences", category: "science", labelFa: "علوم تجربی", labelEn: "Experimental & Natural Sciences" },
  { key: "humanities", category: "general", labelFa: "علوم انسانی و معارف", labelEn: "Humanities & Social Sciences" },
  { key: "agricultural_engineering", category: "general", labelFa: "مهندسی کشاورزی و منابع طبیعی", labelEn: "Agricultural Engineering" },
  { key: "graphic_design", category: "general", labelFa: "طراحی گرافیک و ارتباط تصویری", labelEn: "Graphic Design & Visual Arts" },
  { key: "english_language", category: "general", labelFa: "زبان و ادبیات انگلیسی", labelEn: "English Language & Literature" },

  // Vocational, High School & Technical
  { key: "vocational_technical", category: "vocational", labelFa: "فنی و حرفه‌ای", labelEn: "Technical & Vocational" },
  { key: "technical_school", category: "vocational", labelFa: "هنرستان فنی", labelEn: "Technical High School" },
  { key: "kardanesh", category: "vocational", labelFa: "شاخه کاردانش و مهارت", labelEn: "Vocational & Applied Skills (Kardanesh)" },

  // HSE & Safety
  { key: "hse_engineering", category: "hse", labelFa: "مهندسی بهداشت، ایمنی و محیط زیست (HSE)", labelEn: "Health, Safety & Environment (HSE)" },
  { key: "industrial_safety", category: "hse", labelFa: "مهندسی ایمنی صنعتی و پدافند غیرعامل", labelEn: "Industrial Safety Engineering" },
  { key: "other", category: "general", labelFa: "سایر رشته‌ها و گرایش‌های تحصیلی", labelEn: "Other Fields of Study" },
];

// ─── ۳. دانشگاه‌ها و موسسات آموزش عالی (Universities) ─────────────────────────

export const UNIVERSITY_DEFINITIONS: UniversityDefinition[] = [
  // Top State Technical & Comprehensive Universities
  { key: "sharif", labelFa: "دانشگاه صنعتی شریف", labelEn: "Sharif University of Technology" },
  { key: "tehran", labelFa: "دانشگاه تهران", labelEn: "University of Tehran" },
  { key: "amirkabir", labelFa: "دانشگاه صنعتی امیرکبیر (پلی‌تکنیک تهران)", labelEn: "Amirkabir University of Technology" },
  { key: "iust", labelFa: "دانشگاه علم و صنعت ایران", labelEn: "Iran University of Science and Technology" },
  { key: "kntu", labelFa: "دانشگاه صنعتی خواجه نصیرالدین طوسی", labelEn: "K. N. Toosi University of Technology" },
  { key: "beheshti", labelFa: "دانشگاه شهید بهشتی", labelEn: "Shahid Beheshti University" },
  { key: "modares", labelFa: "دانشگاه تربیت مدرس", labelEn: "Tarbiat Modares University" },
  { key: "iut", labelFa: "دانشگاه صنعتی اصفهان", labelEn: "Isfahan University of Technology" },
  { key: "isfahan", labelFa: "دانشگاه اصفهان", labelEn: "University of Isfahan" },
  { key: "shiraz", labelFa: "دانشگاه شیراز", labelEn: "Shiraz University" },
  { key: "tabriz", labelFa: "دانشگاه تبریز", labelEn: "University of Tabriz" },
  { key: "sut", labelFa: "دانشگاه صنعتی سهند تبریز", labelEn: "Sahand University of Technology" },
  { key: "ferdowsi", labelFa: "دانشگاه فردوسی مشهد", labelEn: "Ferdowsi University of Mashhad" },
  { key: "put", labelFa: "دانشگاه صنعت نفت (اهواز / آبادان / محمودآباد)", labelEn: "Petroleum University of Technology (PUT)" },
  { key: "pgu", labelFa: "دانشگاه خلیج فارس بوشهر", labelEn: "Persian Gulf University (Bushehr)" },
  { key: "shahrood", labelFa: "دانشگاه صنعتی شاهرود", labelEn: "Shahrood University of Technology" },
  { key: "nit", labelFa: "دانشگاه صنعتی نوشیروانی بابل", labelEn: "Babol Noshirvani University of Technology" },
  { key: "guilan", labelFa: "دانشگاه گیلان", labelEn: "University of Guilan" },
  { key: "urmia", labelFa: "دانشگاه ارومیه", labelEn: "Urmia University" },
  { key: "arak", labelFa: "دانشگاه اراک", labelEn: "Arak University" },
  { key: "tafresh", labelFa: "دانشگاه تفرش", labelEn: "Tafresh University" },
  { key: "alzahra", labelFa: "دانشگاه الزهرا", labelEn: "Alzahra University" },
  { key: "ikiu", labelFa: "دانشگاه بین‌المللی امام خمینی (ره)", labelEn: "Imam Khomeini International University" },
  { key: "mut", labelFa: "دانشگاه صنعتی مالک اشتر", labelEn: "Malek Ashtar University of Technology" },
  { key: "uast", labelFa: "دانشگاه جامع علمی کاربردی", labelEn: "University of Applied Science and Technology" },
  { key: "arak_med", labelFa: "دانشگاه علوم پزشکی اراک", labelEn: "Arak University of Medical Sciences" },
  { key: "lorestan", labelFa: "دانشگاه لرستان", labelEn: "Lorestan University" },
  { key: "uma", labelFa: "دانشگاه محقق اردبیلی", labelEn: "University of Mohaghegh Ardabili" },
  { key: "malayer", labelFa: "دانشگاه ملایر", labelEn: "Malayer University" },
  { key: "art_tehran", labelFa: "دانشگاه هنر تهران", labelEn: "Tehran University of Art" },
  { key: "pnu", labelFa: "دانشگاه پیام نور", labelEn: "Payame Noor University" },

  // Islamic Azad University Branches
  { key: "ia_srbau", labelFa: "دانشگاه آزاد اسلامی واحد علوم و تحقیقات", labelEn: "Islamic Azad University - Science & Research Branch" },
  { key: "ia_south_tehran", labelFa: "دانشگاه آزاد اسلامی واحد تهران جنوب", labelEn: "Islamic Azad University - South Tehran Branch" },
  { key: "ia_central_tehran", labelFa: "دانشگاه آزاد اسلامی واحد تهران مرکز", labelEn: "Islamic Azad University - Central Tehran Branch" },
  { key: "ia_north_tehran", labelFa: "دانشگاه آزاد اسلامی واحد تهران شمال", labelEn: "Islamic Azad University - North Tehran Branch" },
  { key: "ia_west_tehran", labelFa: "دانشگاه آزاد اسلامی واحد تهران غرب", labelEn: "Islamic Azad University - West Tehran Branch" },
  { key: "ia_karaj", labelFa: "دانشگاه آزاد اسلامی واحد کرج", labelEn: "Islamic Azad University - Karaj Branch" },
  { key: "ia_arak", labelFa: "دانشگاه آزاد اسلامی واحد اراک", labelEn: "Islamic Azad University - Arak Branch" },
  { key: "ia_islamshahr", labelFa: "دانشگاه آزاد اسلامی واحد اسلامشهر", labelEn: "Islamic Azad University - Islamshahr Branch" },
  { key: "ia_eqlid", labelFa: "دانشگاه آزاد اسلامی واحد اقلید", labelEn: "Islamic Azad University - Eqlid Branch" },
  { key: "ia_bandarabbas", labelFa: "دانشگاه آزاد اسلامی واحد بندرعباس", labelEn: "Islamic Azad University - Bandar Abbas Branch" },
  { key: "ia_takestan", labelFa: "دانشگاه آزاد اسلامی واحد تاکستان", labelEn: "Islamic Azad University - Takestan Branch" },
  { key: "ia_dezful", labelFa: "دانشگاه آزاد اسلامی واحد دزفول", labelEn: "Islamic Azad University - Dezful Branch" },
  { key: "ia_rasht", labelFa: "دانشگاه آزاد اسلامی واحد رشت", labelEn: "Islamic Azad University - Rasht Branch" },
  { key: "ia_saveh", labelFa: "دانشگاه آزاد اسلامی واحد ساوه", labelEn: "Islamic Azad University - Saveh Branch" },
  { key: "ia_semnan", labelFa: "دانشگاه آزاد اسلامی واحد سمنان", labelEn: "Islamic Azad University - Semnan Branch" },
  { key: "ia_shahrerey", labelFa: "دانشگاه آزاد اسلامی واحد یادگار امام (شهرری)", labelEn: "Islamic Azad University - Shahr-e-Rey Branch" },
  { key: "ia_tabas", labelFa: "دانشگاه آزاد اسلامی واحد طبس", labelEn: "Islamic Azad University - Tabas Branch" },
  { key: "ia_qaemshahr", labelFa: "دانشگاه آزاد اسلامی واحد قائم‌شهر", labelEn: "Islamic Azad University - Qaemshahr Branch" },
  { key: "ia_maragheh", labelFa: "دانشگاه آزاد اسلامی واحد مراغه", labelEn: "Islamic Azad University - Maragheh Branch" },
  { key: "ia_roudehen", labelFa: "دانشگاه آزاد اسلامی واحد رودهن", labelEn: "Islamic Azad University - Roudehen Branch" },
  { key: "ia_other", labelFa: "دانشگاه آزاد اسلامی (سایر واحدها)", labelEn: "Islamic Azad University (Other Branches)" },

  // General & Secondary
  { key: "high_school", labelFa: "دبیرستان", labelEn: "High School" },
  { key: "foreign", labelFa: "دانشگاه‌های بین‌المللی و خارج از کشور", labelEn: "International & Foreign Universities" },
  { key: "other", labelFa: "سایر دانشگاه‌ها و موسسات آموزش عالی", labelEn: "Other Universities & Higher Education Institutions" },
];

// ─── ۴. نگاشت‌های جامع نرمال‌سازی برای داده‌های موروثی و کاربری ─────────────────

function cleanLookupKey(str: string): string {
  if (!str) return "";
  return str
    .trim()
    .replace(/[\u200c\u200f\u200e\uFEFF]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const DEGREE_LOOKUP_MAP: Record<string, { fa: string; en: string }> = {
  "دکتری": { fa: "دکتری تخصصی (Ph.D.)", en: "Doctorate (Ph.D.)" },
  "دکترا": { fa: "دکتری تخصصی (Ph.D.)", en: "Doctorate (Ph.D.)" },
  "phd": { fa: "دکتری تخصصی (Ph.D.)", en: "Doctorate (Ph.D.)" },
  "doctorate": { fa: "دکتری تخصصی (Ph.D.)", en: "Doctorate (Ph.D.)" },
  "کارشناسی ارشد": { fa: "کارشناسی ارشد (فوق لیسانس)", en: "Master's Degree" },
  "فوق لیسانس": { fa: "کارشناسی ارشد (فوق لیسانس)", en: "Master's Degree" },
  "ارشد": { fa: "کارشناسی ارشد (فوق لیسانس)", en: "Master's Degree" },
  "master": { fa: "کارشناسی ارشد (فوق لیسانس)", en: "Master's Degree" },
  "masters": { fa: "کارشناسی ارشد (فوق لیسانس)", en: "Master's Degree" },
  "کارشناسی": { fa: "کارشناسی (لیسانس)", en: "Bachelor's Degree" },
  "لیسانس": { fa: "کارشناسی (لیسانس)", en: "Bachelor's Degree" },
  "bachelor": { fa: "کارشناسی (لیسانس)", en: "Bachelor's Degree" },
  "bachelors": { fa: "کارشناسی (لیسانس)", en: "Bachelor's Degree" },
  "کاردانی": { fa: "کاردانی (فوق دیپلم)", en: "Associate Degree" },
  "فوق دیپلم": { fa: "کاردانی (فوق دیپلم)", en: "Associate Degree" },
  "associate": { fa: "کاردانی (فوق دیپلم)", en: "Associate Degree" },
  "دیپلم": { fa: "دیپلم متوسطه", en: "High School Diploma" },
  "diploma": { fa: "دیپلم متوسطه", en: "High School Diploma" },
  "متوسطه": { fa: "زیر دیپلم (متوسطه)", en: "Secondary Education (Incomplete)" },
  "زیر دیپلم": { fa: "زیر دیپلم (متوسطه)", en: "Secondary Education (Incomplete)" },
  "below_diploma": { fa: "زیر دیپلم (متوسطه)", en: "Secondary Education (Incomplete)" },
  "سیکل": { fa: "سیکل (راهنمایی)", en: "Middle School (Junior High)" },
  "راهنمایی": { fa: "سیکل (راهنمایی)", en: "Middle School (Junior High)" },
  "middle_school": { fa: "سیکل (راهنمایی)", en: "Middle School (Junior High)" },
  "ابتدائی": { fa: "ابتدایی", en: "Elementary / Primary School" },
  "ابتدایی": { fa: "ابتدایی", en: "Elementary / Primary School" },
  "پایان ابتدایی": { fa: "ابتدایی", en: "Elementary / Primary School" },
  "elementary": { fa: "ابتدایی", en: "Elementary / Primary School" },
  "—": { fa: "ثبت نشده", en: "Not Specified" },
  "-": { fa: "ثبت نشده", en: "Not Specified" },
};

const FIELD_LOOKUP_MAP: Record<string, { fa: string; en: string }> = {
  "مهندسی مکانیک": { fa: "مهندسی مکانیک", en: "Mechanical Engineering" },
  "مکانیک": { fa: "مهندسی مکانیک", en: "Mechanical Engineering" },
  "mechanical": { fa: "مهندسی مکانیک", en: "Mechanical Engineering" },
  "مهندسی صنایع": { fa: "مهندسی صنایع", en: "Industrial Engineering" },
  "صنایع": { fa: "مهندسی صنایع", en: "Industrial Engineering" },
  "مهندسی عمران": { fa: "مهندسی عمران", en: "Civil Engineering" },
  "عمران": { fa: "مهندسی عمران", en: "Civil Engineering" },
  "مهندسی برق": { fa: "مهندسی برق", en: "Electrical Engineering" },
  "برق": { fa: "مهندسی برق", en: "Electrical Engineering" },
  "مهندسی کامپیوتر": { fa: "مهندسی کامپیوتر", en: "Computer Engineering" },
  "کامپیوتر": { fa: "مهندسی کامپیوتر", en: "Computer Engineering" },
  "نرم افزار": { fa: "مهندسی کامپیوتر و نرم‌افزار", en: "Computer Software Engineering" },
  "مهندسی فناوری اطلاعات": { fa: "مهندسی فناوری اطلاعات (IT)", en: "Information Technology (IT) Engineering" },
  "it": { fa: "مهندسی فناوری اطلاعات (IT)", en: "Information Technology (IT) Engineering" },
  "مهندسی مواد": { fa: "مهندسی مواد و متالورژی", en: "Materials & Metallurgy Engineering" },
  "متالورژی": { fa: "مهندسی مواد و متالورژی", en: "Materials & Metallurgy Engineering" },
  "مهندسی کشاورزی": { fa: "مهندسی کشاورزی", en: "Agricultural Engineering" },
  "مهندسی هوافضا": { fa: "مهندسی هوافضا", en: "Aerospace Engineering" },
  "مهندسی الکترواپتیک": { fa: "مهندسی اپتیک و لیزر (الکترواپتیک)", en: "Electro-Optics & Laser Engineering" },
  "مهندسی بهداشت": { fa: "مهندسی بهداشت حرفه‌ای و ایمنی (HSE)", en: "Health, Safety & Environment (HSE)" },
  "hse": { fa: "مهندسی بهداشت، ایمنی و محیط زیست (HSE)", en: "Health, Safety & Environment (HSE)" },
  "مهندسی تکنولژی": { fa: "مهندسی تکنولوژی و ساخت", en: "Technology & Manufacturing Engineering" },
  "مهندسی راه آهن": { fa: "مهندسی راه‌آهن و حمل و نقل", en: "Railway Engineering" },
  "مهندسی شیمی یانفت": { fa: "مهندسی شیمی و نفت", en: "Chemical & Petroleum Engineering" },
  "مهندسی شیمی و نفت": { fa: "مهندسی شیمی و نفت", en: "Chemical & Petroleum Engineering" },
  "مهندسی شیمی": { fa: "مهندسی شیمی", en: "Chemical Engineering" },
  "مهندسی نفت": { fa: "مهندسی نفت", en: "Petroleum Engineering" },
  "شیمی": { fa: "شیمی کاربردی و محض", en: "Applied & Pure Chemistry" },
  "حسابداری": { fa: "حسابداری و امور مالی", en: "Accounting & Finance" },
  "مدیریت": { fa: "مدیریت و بازرگانی", en: "Business Administration & Management" },
  "مدیریت بازرگانی": { fa: "مدیریت بازرگانی", en: "Business Administration" },
  "مدیریت صنعتی": { fa: "مدیریت صنعتی", en: "Industrial Management" },
  "اموراداری -دفتری منشیگری": { fa: "امور اداری و دفتری", en: "Office Administration & Secretarial" },
  "امور اداری": { fa: "امور اداری و دفتری", en: "Office Administration" },
  "علوم انسانی": { fa: "علوم انسانی و معارف", en: "Humanities & Social Sciences" },
  "علوم تجربی": { fa: "علوم تجربی", en: "Experimental & Natural Sciences" },
  "تجربی": { fa: "علوم تجربی", en: "Experimental Sciences" },
  "ریاضی": { fa: "ریاضی و آمار", en: "Mathematics & Statistics" },
  "ریاضی و فیزیک": { fa: "ریاضی و فیزیک", en: "Mathematics & Physics" },
  "زبان انگلیسی": { fa: "زبان و ادبیات انگلیسی", en: "English Language & Literature" },
  "نقشه برداری": { fa: "مهندسی نقشه‌برداری و ژئوماتیک", en: "Surveying & Geomatics Engineering" },
  "گرافیک": { fa: "طراحی گرافیک و ارتباط تصویری", en: "Graphic Design & Visual Arts" },
  "فنی": { fa: "رشته‌های فنی و مهارتی", en: "Technical & Vocational" },
  "هنرستان": { fa: "هنرستان فنی", en: "Technical High School" },
  "کارودانش": { fa: "شاخه کاردانش", en: "Vocational & Applied Skills (Kardanesh)" },
  "—": { fa: "ثبت نشده", en: "Not Specified" },
  "-": { fa: "ثبت نشده", en: "Not Specified" },
};

const UNI_LOOKUP_MAP: Record<string, { fa: string; en: string }> = {
  "دانشگاه صنعتی شریف": { fa: "دانشگاه صنعتی شریف", en: "Sharif University of Technology" },
  "دانشگاه تهران": { fa: "دانشگاه تهران", en: "University of Tehran" },
  "دانشگاه علم وصنعت ایران": { fa: "دانشگاه علم و صنعت ایران", en: "Iran University of Science and Technology" },
  "دانشگاه علم و صنعت ایران": { fa: "دانشگاه علم و صنعت ایران", en: "Iran University of Science and Technology" },
  "دانشگاه صنعتی خواجه نصیرالدین طوسی": { fa: "دانشگاه صنعتی خواجه نصیرالدین طوسی", en: "K. N. Toosi University of Technology" },
  "دانشگاه صنعتی امیرکبیر": { fa: "دانشگاه صنعتی امیرکبیر (پلی‌تکنیک)", en: "Amirkabir University of Technology" },
  "دانشگاه شهید بهشتی": { fa: "دانشگاه شهید بهشتی", en: "Shahid Beheshti University" },
  "دانشگاه تربیت مدرس": { fa: "دانشگاه تربیت مدرس", en: "Tarbiat Modares University" },
  "دانشگاه صنعتی اصفهان": { fa: "دانشگاه صنعتی اصفهان", en: "Isfahan University of Technology" },
  "دانشگاه اصفهان": { fa: "دانشگاه اصفهان", en: "University of Isfahan" },
  "دانشگاه شیراز": { fa: "دانشگاه شیراز", en: "Shiraz University" },
  "دانشگاه تبریز": { fa: "دانشگاه تبریز", en: "University of Tabriz" },
  "دانشگاه صنعتی سهند": { fa: "دانشگاه صنعتی سهند تبریز", en: "Sahand University of Technology" },
  "دانشگاه فردوسی مشهد": { fa: "دانشگاه فردوسی مشهد", en: "Ferdowsi University of Mashhad" },
  "دانشگاه صنعت نفت": { fa: "دانشگاه صنعت نفت", en: "Petroleum University of Technology (PUT)" },
  "دانشگاه شاهرود": { fa: "دانشگاه شاهرود", en: "Shahrood University of Technology" },
  "دانشگاه صنعتی شاهرود": { fa: "دانشگاه صنعتی شاهرود", en: "Shahrood University of Technology" },
  "دانشگاه گیلان": { fa: "دانشگاه گیلان", en: "University of Guilan" },
  "دانشگاه ارومیه": { fa: "دانشگاه ارومیه", en: "Urmia University" },
  "دانشگاه اراک": { fa: "دانشگاه اراک", en: "Arak University" },
  "دانشگاه تفرش": { fa: "دانشگاه تفرش", en: "Tafresh University" },
  "دانشگاه الزهرا": { fa: "دانشگاه الزهرا", en: "Alzahra University" },
  "دانشگاه بین المللی امام خمینی(ره)": { fa: "دانشگاه بین‌المللی امام خمینی (ره)", en: "Imam Khomeini International University" },
  "دانشگاه صنعتی مالک اشتر": { fa: "دانشگاه صنعتی مالک اشتر", en: "Malek Ashtar University of Technology" },
  "دانشگاه علمی کاربردی": { fa: "دانشگاه جامع علمی کاربردی", en: "University of Applied Science and Technology" },
  "دانشگاه علوم پزشکی استان مرکزی": { fa: "دانشگاه علوم پزشکی اراک", en: "Arak University of Medical Sciences" },
  "دانشگاه لرستان": { fa: "دانشگاه لرستان", en: "Lorestan University" },
  "دانشگاه محقق اردبیلی": { fa: "دانشگاه محقق اردبیلی", en: "University of Mohaghegh Ardabili" },
  "دانشگاه ملایر": { fa: "دانشگاه ملایر", en: "Malayer University" },
  "دانشگاه هنر": { fa: "دانشگاه هنر تهران", en: "Tehran University of Art" },
  "دانشگاه پیام نور": { fa: "دانشگاه پیام نور", en: "Payame Noor University" },
  "دبیرستان": { fa: "دبیرستان", en: "High School" },
  "دانشگاه آزاد واحد اراک": { fa: "دانشگاه آزاد اسلامی واحد اراک", en: "Islamic Azad University - Arak Branch" },
  "دانشگاه آزاد واحد اسلامشهر": { fa: "دانشگاه آزاد اسلامی واحد اسلامشهر", en: "Islamic Azad University - Islamshahr Branch" },
  "دانشگاه آزاد واحد اقلید": { fa: "دانشگاه آزاد اسلامی واحد اقلید", en: "Islamic Azad University - Eqlid Branch" },
  "دانشگاه آزاد واحد بندرعباس": { fa: "دانشگاه آزاد اسلامی واحد بندرعباس", en: "Islamic Azad University - Bandar Abbas Branch" },
  "دانشگاه آزاد واحد تاکستان": { fa: "دانشگاه آزاد اسلامی واحد تاکستان", en: "Islamic Azad University - Takestan Branch" },
  "دانشگاه آزاد واحد تهران شمال": { fa: "دانشگاه آزاد اسلامی واحد تهران شمال", en: "Islamic Azad University - North Tehran Branch" },
  "دانشگاه آزاد واحد تهران مرکزی": { fa: "دانشگاه آزاد اسلامی واحد تهران مرکز", en: "Islamic Azad University - Central Tehran Branch" },
  "دانشگاه آزاد واحد تهران مرکز": { fa: "دانشگاه آزاد اسلامی واحد تهران مرکز", en: "Islamic Azad University - Central Tehran Branch" },
  "دانشگاه آزاد واحد دزفول": { fa: "دانشگاه آزاد اسلامی واحد دزفول", en: "Islamic Azad University - Dezful Branch" },
  "دانشگاه آزاد واحد رشت": { fa: "دانشگاه آزاد اسلامی واحد رشت", en: "Islamic Azad University - Rasht Branch" },
  "دانشگاه آزاد واحد ساوه": { fa: "دانشگاه آزاد اسلامی واحد ساوه", en: "Islamic Azad University - Saveh Branch" },
  "دانشگاه آزاد واحد سمنان": { fa: "دانشگاه آزاد اسلامی واحد سمنان", en: "Islamic Azad University - Semnan Branch" },
  "دانشگاه آزاد واحد شهرری": { fa: "دانشگاه آزاد اسلامی واحد یادگار امام (شهرری)", en: "Islamic Azad University - Shahr-e-Rey Branch" },
  "دانشگاه آزاد واحد طبس": { fa: "دانشگاه آزاد اسلامی واحد طبس", en: "Islamic Azad University - Tabas Branch" },
  "دانشگاه آزاد واحد علوم و تحقیقات": { fa: "دانشگاه آزاد اسلامی واحد علوم و تحقیقات", en: "Islamic Azad University - Science & Research Branch" },
  "دانشگاه آزاد واحد قائمشهر": { fa: "دانشگاه آزاد اسلامی واحد قائم‌شهر", en: "Islamic Azad University - Qaemshahr Branch" },
  "دانشگاه آزاد واحد مراغه": { fa: "دانشگاه آزاد اسلامی واحد مراغه", en: "Islamic Azad University - Maragheh Branch" },
  "دانشگاه آزاد واحد کرج": { fa: "دانشگاه آزاد اسلامی واحد کرج", en: "Islamic Azad University - Karaj Branch" },
  "دانشگاه آزاداسلامی واحد کرج": { fa: "دانشگاه آزاد اسلامی واحد کرج", en: "Islamic Azad University - Karaj Branch" },
  "دانشگاه آزاداسلامی واحد تهران جنوب": { fa: "دانشگاه آزاد اسلامی واحد تهران جنوب", en: "Islamic Azad University - South Tehran Branch" },
  "دانشگاه آزاداسلامی واحد تهران غرب": { fa: "دانشگاه آزاد اسلامی واحد تهران غرب", en: "Islamic Azad University - West Tehran Branch" },
  "دانشگاه آزاداسلامی واحد رودهن": { fa: "دانشگاه آزاد اسلامی واحد رودهن", en: "Islamic Azad University - Roudehen Branch" },
  "—": { fa: "ثبت نشده", en: "Not Specified" },
  "-": { fa: "ثبت نشده", en: "Not Specified" },
};

// ─── ۵. گزینه‌های کومبوباکس (Combobox Options) ───────────────────────────────

export function getDegreeOptions(locale: string): ComboboxOption[] {
  const isFa = locale === "fa";
  return DEGREE_DEFINITIONS.map((d) => ({
    value: isFa ? d.labelFa : d.key,
    label: isFa ? d.labelFa : d.labelEn,
    triggerLabel: isFa ? d.labelFa : d.labelEn,
  }));
}

export function getStudyFieldOptions(locale: string, manualLabel?: string): ComboboxOption[] {
  const isFa = locale === "fa";
  const options: ComboboxOption[] = STUDY_FIELD_DEFINITIONS.map((f) => ({
    value: isFa ? f.labelFa : f.key,
    label: isFa ? f.labelFa : f.labelEn,
    triggerLabel: isFa ? f.labelFa : f.labelEn,
    searchTerms: [f.labelFa, f.labelEn, f.key],
  }));

  options.push({
    value: "__manual__",
    label: manualLabel || (isFa ? "سایر / ورود دستی رشته..." : "Other / Manual Entry..."),
    triggerLabel: manualLabel || (isFa ? "سایر / ورود دستی" : "Other / Manual"),
  });

  return options;
}

export function getUniversityOptions(locale: string, manualLabel?: string): ComboboxOption[] {
  const isFa = locale === "fa";
  const options: ComboboxOption[] = UNIVERSITY_DEFINITIONS.map((u) => ({
    value: isFa ? u.labelFa : u.key,
    label: isFa ? u.labelFa : u.labelEn,
    triggerLabel: isFa ? u.labelFa : u.labelEn,
    searchTerms: [u.labelFa, u.labelEn, u.key],
  }));

  options.push({
    value: "__manual__",
    label: manualLabel || (isFa ? "سایر / ورود دستی نام دانشگاه..." : "Other / Manual Entry..."),
    triggerLabel: manualLabel || (isFa ? "سایر / ورود دستی" : "Other / Manual"),
  });

  return options;
}

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

// ─── ۶. توابع حل و تطبیق دوزبانه (Bilingual Resolvers) ─────────────────────────

export function resolveDegreeLabel(degreeValue: string | undefined, locale: string): string {
  if (!degreeValue) return "";
  const isFa = locale === "fa";
  const raw = degreeValue.trim();
  if (raw === "—" || raw === "-") return isFa ? "" : "";

  // 1. Check definition list
  const def = DEGREE_DEFINITIONS.find(
    (d) =>
      d.key.toLowerCase() === raw.toLowerCase() ||
      d.labelFa === raw ||
      d.labelEn.toLowerCase() === raw.toLowerCase()
  );
  if (def) return isFa ? def.labelFa : def.labelEn;

  // 2. Check normalization map
  const cleaned = cleanLookupKey(raw);
  if (DEGREE_LOOKUP_MAP[raw]) {
    return isFa ? DEGREE_LOOKUP_MAP[raw].fa : DEGREE_LOOKUP_MAP[raw].en;
  }
  if (DEGREE_LOOKUP_MAP[cleaned]) {
    return isFa ? DEGREE_LOOKUP_MAP[cleaned].fa : DEGREE_LOOKUP_MAP[cleaned].en;
  }

  // 3. Substring matching
  for (const [k, v] of Object.entries(DEGREE_LOOKUP_MAP)) {
    if (k && cleaned.includes(cleanLookupKey(k))) {
      return isFa ? v.fa : v.en;
    }
  }

  // 4. Strict English guarantee: If English requested and still Persian chars present, fallback cleanly
  if (!isFa && /[\u0600-\u06FF]/.test(raw)) {
    return "Higher Education Degree";
  }

  return raw;
}

export function resolveStudyFieldLabel(fieldValue: string | undefined, locale: string): string {
  if (!fieldValue) return "";
  const isFa = locale === "fa";
  const raw = fieldValue.trim();
  if (raw === "—" || raw === "-") return isFa ? "" : "";

  // 1. Check definition list
  const def = STUDY_FIELD_DEFINITIONS.find(
    (f) =>
      f.key.toLowerCase() === raw.toLowerCase() ||
      f.labelFa === raw ||
      f.labelEn.toLowerCase() === raw.toLowerCase()
  );
  if (def) return isFa ? def.labelFa : def.labelEn;

  // 2. Check normalization map
  const cleaned = cleanLookupKey(raw);
  if (FIELD_LOOKUP_MAP[raw]) {
    return isFa ? FIELD_LOOKUP_MAP[raw].fa : FIELD_LOOKUP_MAP[raw].en;
  }
  if (FIELD_LOOKUP_MAP[cleaned]) {
    return isFa ? FIELD_LOOKUP_MAP[cleaned].fa : FIELD_LOOKUP_MAP[cleaned].en;
  }

  // 3. Substring matching
  for (const [k, v] of Object.entries(FIELD_LOOKUP_MAP)) {
    if (k && cleaned.includes(cleanLookupKey(k))) {
      return isFa ? v.fa : v.en;
    }
  }

  // 4. Strict English guarantee: If English requested and still Persian chars present, fallback cleanly
  if (!isFa && /[\u0600-\u06FF]/.test(raw)) {
    return "Engineering & Specialized Field";
  }

  return raw;
}

export function resolveUniversityLabel(uniValue: string | undefined, locale: string): string {
  if (!uniValue) return "";
  const isFa = locale === "fa";
  const raw = uniValue.trim();
  if (raw === "—" || raw === "-") return isFa ? "" : "";

  // 1. Check definition list
  const def = UNIVERSITY_DEFINITIONS.find(
    (u) =>
      u.key.toLowerCase() === raw.toLowerCase() ||
      u.labelFa === raw ||
      u.labelEn.toLowerCase() === raw.toLowerCase()
  );
  if (def) return isFa ? def.labelFa : def.labelEn;

  // 2. Check normalization map
  const cleaned = cleanLookupKey(raw);
  if (UNI_LOOKUP_MAP[raw]) {
    return isFa ? UNI_LOOKUP_MAP[raw].fa : UNI_LOOKUP_MAP[raw].en;
  }
  if (UNI_LOOKUP_MAP[cleaned]) {
    return isFa ? UNI_LOOKUP_MAP[cleaned].fa : UNI_LOOKUP_MAP[cleaned].en;
  }

  // 3. Substring matching
  for (const [k, v] of Object.entries(UNI_LOOKUP_MAP)) {
    if (k && cleaned.includes(cleanLookupKey(k))) {
      return isFa ? v.fa : v.en;
    }
  }

  // 4. Strict English guarantee: If English requested and still Persian chars present, fallback cleanly
  if (!isFa && /[\u0600-\u06FF]/.test(raw)) {
    return "Accredited University";
  }

  return raw;
}
