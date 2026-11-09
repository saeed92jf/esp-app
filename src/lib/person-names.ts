// src/lib/person-names.ts
/**
 * Centralized Person Name & Role Localization Engine for Euroslot Pars.
 * Translates people's names and organizational roles cleanly between Persian and English.
 */

export interface PersonNameEntry {
  fa: string;
  en: string;
}

export const KNOWN_PERSON_NAMES: Record<string, PersonNameEntry> = {
  // Saeed Jalili
  "سعید جلیلی": { fa: "سعید جلیلی", en: "Saeed Jalili" },
  "سعید جلیلی فرد": { fa: "سعید جلیلی فرد", en: "Saeed Jalili Fard" },
  "سعید جلیلی‌فرد": { fa: "سعید جلیلی‌فرد", en: "Saeed Jalili Fard" },
  "saeed jalili": { fa: "سعید جلیلی", en: "Saeed Jalili" },
  "saeed jalili fard": { fa: "سعید جلیلی فرد", en: "Saeed Jalili Fard" },
  "s.jalili": { fa: "سعید جلیلی", en: "Saeed Jalili" },
  "s.jalilifard": { fa: "سعید جلیلی فرد", en: "Saeed Jalili Fard" },
  "u-saeed": { fa: "سعید جلیلی فرد", en: "Saeed Jalili Fard" },

  // Morteza Shafiee
  "مرتضی شفیعی": { fa: "مرتضی شفیعی", en: "Morteza Shafiee" },
  "مهندس شفیعی": { fa: "مهندس شفیعی", en: "Eng. Shafiee" },
  "morteza shafiee": { fa: "مرتضی شفیعی", en: "Morteza Shafiee" },
  "eng. shafiee": { fa: "مهندس شفیعی", en: "Eng. Shafiee" },
  "mshafiee": { fa: "مرتضی شفیعی", en: "Morteza Shafiee" },
  "u-shafiee": { fa: "مرتضی شفیعی", en: "Morteza Shafiee" },

  // Milad Charmchi
  "میلاد چرمچی": { fa: "میلاد چرمچی", en: "Milad Charmchi" },
  "milad charmchi": { fa: "میلاد چرمچی", en: "Milad Charmchi" },
  "m.charmchi": { fa: "میلاد چرمچی", en: "Milad Charmchi" },
  "u-mcharmchi": { fa: "میلاد چرمچی", en: "Milad Charmchi" },

  // Alireza Masoumian
  "علیرضا معصومیان": { fa: "علیرضا معصومیان", en: "Alireza Masoumian" },
  "alireza masoumian": { fa: "علیرضا معصومیان", en: "Alireza Masoumian" },
  "a.masoumian": { fa: "علیرضا معصومیان", en: "Alireza Masoumian" },
  "u-amasoumian": { fa: "علیرضا معصومیان", en: "Alireza Masoumian" },

  // Reza Sharifi
  "رضا شریفی": { fa: "رضا شریفی", en: "Reza Sharifi" },
  "reza sharifi": { fa: "رضا شریفی", en: "Reza Sharifi" },
  "r.sharifi": { fa: "رضا شریفی", en: "Reza Sharifi" },
  "u-rsharifi": { fa: "رضا شریفی", en: "Reza Sharifi" },

  // Mehdi Abbasi
  "مهدی عباسی": { fa: "مهدی عباسی", en: "Mehdi Abbasi" },
  "mehdi abbasi": { fa: "مهدی عباسی", en: "Mehdi Abbasi" },
  "m.abbasi": { fa: "مهدی عباسی", en: "Mehdi Abbasi" },
  "u-mabbasi": { fa: "مهدی عباسی", en: "Mehdi Abbasi" },

  // Pedram Navidi
  "پدرام نویدی": { fa: "پدرام نویدی", en: "Pedram Navidi" },
  "pedram navidi": { fa: "پدرام نویدی", en: "Pedram Navidi" },
  "p.navidi": { fa: "پدرام نویدی", en: "Pedram Navidi" },
  "u-pnavidi": { fa: "پدرام نویدی", en: "Pedram Navidi" },

  // Amin Navidianfar
  "امین نویدیان‌فر": { fa: "امین نویدیان‌فر", en: "Amin Navidianfar" },
  "امین نویدیان فر": { fa: "امین نویدیان فر", en: "Amin Navidianfar" },
  "amin navidianfar": { fa: "امین نویدیان‌فر", en: "Amin Navidianfar" },
  "amin navidian-far": { fa: "امین نویدیان‌فر", en: "Amin Navidianfar" },
  "a.navidian": { fa: "امین نویدیان‌فر", en: "Amin Navidianfar" },
  "u-anavidian": { fa: "امین نویدیان‌فر", en: "Amin Navidianfar" },

  // Sajjad Jokar
  "سجاد جوکار": { fa: "سجاد جوکار", en: "Sajjad Jokar" },
  "sajjad jokar": { fa: "سجاد جوکار", en: "Sajjad Jokar" },
  "s.jokar": { fa: "سجاد جوکار", en: "Sajjad Jokar" },
  "u-sjokar": { fa: "سجاد جوکار", en: "Sajjad Jokar" },

  // Zahra Hassani
  "زهرا حسنی": { fa: "زهرا حسنی", en: "Zahra Hassani" },
  "zahra hassani": { fa: "زهرا حسنی", en: "Zahra Hassani" },
  "z.hassani": { fa: "زهرا حسنی", en: "Zahra Hassani" },
  "u-zhassani": { fa: "زهرا حسنی", en: "Zahra Hassani" },

  // Hossein Tayyar
  "حسین طیار": { fa: "حسین طیار", en: "Hossein Tayyar" },
  "hossein tayyar": { fa: "حسین طیار", en: "Hossein Tayyar" },
  "h.tayyar": { fa: "حسین طیار", en: "Hossein Tayyar" },
  "u-htayyar": { fa: "حسین طیار", en: "Hossein Tayyar" },

  // Peyman Sharifi
  "پیمان شریفی": { fa: "پیمان شریفی", en: "Peyman Sharifi" },
  "مهندس پیمان شریفی": { fa: "مهندس پیمان شریفی", en: "Eng. Peyman Sharifi" },
  "peyman sharifi": { fa: "پیمان شریفی", en: "Peyman Sharifi" },
  "eng. peyman sharifi": { fa: "مهندس پیمان شریفی", en: "Eng. Peyman Sharifi" },
  "p.sharifi": { fa: "پیمان شریفی", en: "Peyman Sharifi" },
  "u-psharifi": { fa: "پیمان شریفی", en: "Peyman Sharifi" },

  // Mohammad Saeed Khani
  "محمد سعید خانی": { fa: "محمد سعید خانی", en: "Mohammad Saeed Khani" },
  "محمد سعیدخانی": { fa: "محمد سعید خانی", en: "Mohammad Saeed Khani" },
  "محمد سعید‌خانی": { fa: "محمد سعید خانی", en: "Mohammad Saeed Khani" },
  "سعید خانی": { fa: "محمد سعید خانی", en: "Mohammad Saeed Khani" },
  "سعیدخانی": { fa: "محمد سعید خانی", en: "Mohammad Saeed Khani" },
  "mohammad saeed khani": { fa: "محمد سعید خانی", en: "Mohammad Saeed Khani" },
  "mohammad saeedkhani": { fa: "محمد سعید خانی", en: "Mohammad Saeed Khani" },
  "saeed khani": { fa: "محمد سعید خانی", en: "Mohammad Saeed Khani" },
  "saeedkhani": { fa: "محمد سعید خانی", en: "Mohammad Saeed Khani" },
  "m.saeedkhani": { fa: "محمد سعید خانی", en: "Mohammad Saeed Khani" },
  "u-msaeedkhani": { fa: "محمد سعید خانی", en: "Mohammad Saeed Khani" },

  // System
  "سیستم": { fa: "سیستم", en: "System" },
  "مدیر سیستم": { fa: "مدیر سیستم", en: "System Admin" },
  "system": { fa: "سیستم", en: "System" },
  "system admin": { fa: "مدیر سیستم", en: "System Admin" },
};

function normalizeKey(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\u200c/g, " ") // replace zero-width non-joiner with space for matching
    .replace(/\s+/g, " ");
}

/**
 * Returns localized name for a person/user based on current locale.
 * If locale is 'en', returns English name.
 * If locale is 'fa', returns Persian name.
 */
export function formatPersonName(nameOrId: string | null | undefined, locale?: string): string {
  if (!nameOrId) return "";
  const isEn = locale === "en";
  const clean = nameOrId.trim();
  const normalized = normalizeKey(clean);

  // Exact lookup
  if (KNOWN_PERSON_NAMES[clean]) {
    return isEn ? KNOWN_PERSON_NAMES[clean].en : KNOWN_PERSON_NAMES[clean].fa;
  }
  if (KNOWN_PERSON_NAMES[normalized]) {
    return isEn ? KNOWN_PERSON_NAMES[normalized].en : KNOWN_PERSON_NAMES[normalized].fa;
  }

  // Check case-insensitive / partial match
  for (const [key, entry] of Object.entries(KNOWN_PERSON_NAMES)) {
    if (normalizeKey(key) === normalized) {
      return isEn ? entry.en : entry.fa;
    }
  }

  // Default fallback if unknown: return original
  return clean;
}

/**
 * Localizes organizational roles between Persian and English.
 */
export function formatRoleName(role: string | null | undefined, locale?: string): string {
  if (!role) return "";
  const isEn = locale === "en";
  const norm = role.trim().toLowerCase();

  switch (norm) {
    case "superadmin":
    case "super_admin":
    case "مدیر ارشد":
    case "مدیر کل":
      return isEn ? "Super Admin" : "مدیر ارشد";
    case "admin":
    case "مدیر":
    case "مدیریت":
    case "manager":
    case "owner":
    case "مالک":
      return isEn ? "Admin" : "مدیر";
    case "engineer":
    case "مهندس":
    case "expert":
    case "کارشناس":
      return isEn ? "Engineer" : "کارشناس";
    case "user":
    case "کاربر":
      return isEn ? "User" : "کاربر";
    case "reviewer":
    case "بازبین":
    case "ناظر":
      return isEn ? "Reviewer" : "ناظر";
    case "hr":
    case "منابع انسانی":
      return isEn ? "HR Manager" : "منابع انسانی";
    default:
      return role;
  }
}

/**
 * Localizes job titles between Persian and English.
 */
export function formatJobTitle(title: string | null | undefined, locale?: string): string {
  if (!title) return "";
  const isEn = locale === "en";
  const clean = title.trim();
  const norm = clean.toLowerCase().replace(/[\u200c\s]/g, "");

  if (norm.includes("مدیرمهندسی") || norm === "engineeringmanager") return isEn ? "Engineering Manager" : "مدیر مهندسی";
  if (norm.includes("مدیرعامل") || norm === "managingdirector" || norm === "ceo") return isEn ? "Managing Director" : "مدیر عامل";
  if (norm.includes("توسعهبازار") || norm.includes("marketdevelopment")) return isEn ? "Market Development & Sales Manager" : "مدیر توسعه بازار و فروش";
  if (norm.includes("سرپرستفنی") || norm.includes("technicalsupervisor")) return isEn ? "Technical Supervisor" : "سرپرست فنی";
  if (norm.includes("مدیرارشدسیستم") || norm.includes("leadsystemadmin")) return isEn ? "Lead System Administrator" : "مدیر ارشد سیستم";
  if (norm.includes("مدیرفنی") || norm.includes("technicalmanager")) return isEn ? "Technical & Engineering Manager" : "مدیر فنی و مهندسی";
  if (norm.includes("کارشناسارشد") || norm === "seniorexpert" || norm === "seniorspecialist") return isEn ? "Senior Specialist" : "کارشناس ارشد";
  if (norm === "کارشناس" || norm === "expert" || norm === "specialist") return isEn ? "Specialist" : "کارشناس";
  if (norm.includes("مکانیک") || norm.includes("mechanical")) return isEn ? "Mechanical Specialist" : "کارشناس مکانیک";
  if (norm.includes("فرآیند") || norm.includes("پروسس") || norm.includes("process")) return isEn ? "Process Specialist" : "کارشناس فرآیند";
  if (norm.includes("ابزاردقیق") || norm.includes("instrumentation")) return isEn ? "Instrumentation Specialist" : "کارشناس ابزار دقیق";
  if (norm.includes("برق") || norm.includes("electrical")) return isEn ? "Electrical Specialist" : "کارشناس برق";
  if (norm.includes("سوپرادمین") || norm.includes("superadmin")) return isEn ? "Super Administrator" : "سوپر ادمین";

  return clean;
}

/**
 * Localizes field of study / academic majors between Persian and English.
 */
export function formatFieldOfStudy(field: string | null | undefined, locale?: string): string {
  if (!field) return "";
  const isEn = locale === "en";
  const clean = field.trim();
  if (clean === "--" || clean === "-") return clean;
  const norm = clean.toLowerCase().replace(/[\u200c\s]/g, "");

  if (norm.includes("مکانیک") || norm.includes("mechanical")) return isEn ? "Mechanical Engineering" : "مهندسی مکانیک";
  if (norm.includes("شیمی") || norm.includes("نفت") || norm.includes("chemical") || norm.includes("petroleum")) return isEn ? "Chemical & Petroleum Engineering" : "مهندسی شیمی و نفت";
  if (norm.includes("نرم‌افزار") || norm.includes("نرافزار") || norm.includes("کامپیوتر") || norm.includes("software") || norm.includes("computer")) return isEn ? "Software & Computer Engineering" : "مهندسی نرم‌افزار و کامپیوتر";
  if (norm.includes("برق") || norm.includes("electrical")) return isEn ? "Electrical Engineering" : "مهندسی برق";
  if (norm.includes("عمران") || norm.includes("سازه") || norm.includes("civil") || norm.includes("structural")) return isEn ? "Civil & Structural Engineering" : "مهندسی عمران و سازه";
  if (norm.includes("صنایع") || norm.includes("industrial")) return isEn ? "Industrial Engineering" : "مهندسی صنایع";
  if (norm.includes("متالورژی") || norm.includes("مواد") || norm.includes("materials")) return isEn ? "Materials Science & Metallurgy" : "مهندسی مواد و متالورژی";
  if (norm.includes("مدیریت") || norm.includes("بازرگانی") || norm.includes("mba") || norm.includes("business")) return isEn ? "Business & Industrial Management" : "مدیریت بازرگانی و صنعتی";

  return clean;
}

/**
 * Localizes university names between Persian and English.
 */
export function formatUniversity(uni: string | null | undefined, locale?: string): string {
  if (!uni) return "";
  const isEn = locale === "en";
  const clean = uni.trim();
  if (clean === "--" || clean === "-") return clean;
  const norm = clean.toLowerCase().replace(/[\u200c\s]/g, "");

  if (norm.includes("مالکاشتر") || norm.includes("malekashtar")) return isEn ? "Malek Ashtar University of Technology" : "دانشگاه صنعتی مالک اشتر";
  if (norm.includes("شیراز") || norm.includes("shiraz")) return isEn ? "Shiraz University" : "دانشگاه شیراز";
  if (norm.includes("علموصنعت") || norm.includes("علموصنعت") || norm.includes("iust")) return isEn ? "Iran University of Science & Technology" : "دانشگاه علم و صنعت ایران";
  if (norm.includes("علوموتحقیقات") || norm.includes("srbiau")) return isEn ? "IAU Science & Research Branch" : "دانشگاه آزاد واحد علوم و تحقیقات";
  if (norm.includes("شهرری") || norm.includes("shahrerey")) return isEn ? "IAU Shahr-e-Rey Branch" : "دانشگاه آزاد واحد شهرری";
  if (norm.includes("خواجهنصیر") || norm.includes("kntu")) return isEn ? "K. N. Toosi University of Technology" : "دانشگاه صنعتی خواجه نصیرالدین طوسی";
  if (norm.includes("شریف") || norm.includes("sharif")) return isEn ? "Sharif University of Technology" : "دانشگاه صنعتی شریف";
  if (norm.includes("امیرکبیر") || norm.includes("پلیتکنیک") || norm.includes("aut")) return isEn ? "Amirkabir University of Technology" : "دانشگاه صنعتی امیرکبیر";
  if (norm.includes("تهران") || norm.includes("universityoftehran")) return isEn ? "University of Tehran" : "دانشگاه تهران";
  if (norm.includes("بهشتی") || norm.includes("sbu")) return isEn ? "Shahid Beheshti University" : "دانشگاه شهید بهشتی";
  if (norm.includes("اصفهان") || norm.includes("iut")) return isEn ? "Isfahan University of Technology" : "دانشگاه صنعتی اصفهان";
  if (norm.includes("فردوسی") || norm.includes("fum")) return isEn ? "Ferdowsi University of Mashhad" : "دانشگاه فردوسی مشهد";
  if (norm.includes("تبریز") || norm.includes("tabriz")) return isEn ? "University of Tabriz" : "دانشگاه تبریز";

  return clean;
}

/**
 * Localizes work locations between Persian and English.
 */
export function formatWorkLocation(loc: string | null | undefined, locale?: string): string {
  if (!loc) return "";
  const isEn = locale === "en";
  const clean = loc.trim();
  const norm = clean.toLowerCase().replace(/[\u200c\s]/g, "");

  if (norm.includes("دفترتهران") || norm === "tehranoffice") return isEn ? "Tehran Office" : "دفتر تهران";
  if (norm.includes("دفترمرکزی") || norm === "office" || norm === "centraloffice") return isEn ? "Central Office" : "دفتر مرکزی";
  if (norm.includes("کارخانه") || norm === "factory" || norm === "plant") return isEn ? "Factory Plant" : "کارخانه";
  if (norm.includes("دورکاری") || norm === "remote") return isEn ? "Remote" : "دورکاری";
  if (norm.includes("ترکیبی") || norm.includes("هیبرید") || norm === "hybrid") return isEn ? "Hybrid" : "ترکیبی (هیبرید)";
  if (norm.includes("اصفهان") || norm === "isfahanoffice") return isEn ? "Isfahan Office" : "دفتر اصفهان";
  if (norm.includes("سایت") || norm.includes("پروژه") || norm === "site") return isEn ? "Project Site" : "سایت پروژه";

  return clean;
}

/**
 * Localizes education degrees between Persian and English.
 */
export function formatEducation(degree: string | null | undefined, locale?: string): string {
  if (!degree) return "";
  const isEn = locale === "en";
  const clean = degree.trim();
  const norm = clean.toLowerCase().replace(/[\u200c\s]/g, "");

  if (norm.includes("فوقلیسانس") || norm.includes("ارشد") || norm === "master") return isEn ? "Master's" : "کارشناسی ارشد";
  if (norm.includes("لیسانس") || norm.includes("کارشناسی") || norm === "bachelor") return isEn ? "Bachelor's" : "کارشناسی";
  if (norm.includes("دکتری") || norm.includes("دکترا") || norm === "phd") return isEn ? "Ph.D." : "دکتری";
  if (norm.includes("کاردانی") || norm.includes("فوقدیپلم") || norm === "associate") return isEn ? "Associate Degree" : "کاردانی";
  if (norm.includes("دیپلم") || norm === "diploma") return isEn ? "High School Diploma" : "دیپلم";

  return clean;
}

/**
 * Localizes direct manager strings like "M.Shafiee (مدیر مهندسی)".
 */
export function formatDirectManager(manager: string | null | undefined, locale?: string): string {
  if (!manager) return "-";
  const clean = manager.trim();
  if (clean === "-" || clean === "--") return "-";

  // Parse pattern: "Name (Title)"
  const match = clean.match(/^([^(]+)(?:\(([^)]+)\))?$/);
  if (match) {
    const rawName = match[1].trim();
    const rawTitle = match[2]?.trim();

    const formattedName = formatPersonName(rawName, locale);
    if (!rawTitle) return formattedName;

    const formattedTitle = formatJobTitle(rawTitle, locale);
    return `${formattedName} (${formattedTitle})`;
  }

  return clean;
}

