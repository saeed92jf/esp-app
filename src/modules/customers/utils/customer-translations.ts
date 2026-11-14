// src/modules/customers/utils/customer-translations.ts
import type { Customer } from "../types/customers.types";
import { isPetrochemicalCustomer } from "./petro-unifier";

/**
 * Mapping of Iranian cities, industrial hubs, and provinces to English.
 */
export const CITY_FA_TO_EN: Record<string, string> = {
  // Major Petrochemical & Refining Hubs
  "تهران": "Tehran",
  "عسلویه": "Assaluyeh",
  "بندر عسلویه": "Bandar Assaluyeh",
  "عسلویه فاز یک": "Assaluyeh Phase 1",
  "عسلویه فاز دو": "Assaluyeh Phase 2",
  "ماهشهر": "Mahshahr",
  "بندر ماهشهر": "Bandar Mahshahr",
  "بندر امام خمینی": "Bandar Imam Khomeini",
  "بندر امام": "Bandar Imam",
  "آبادان": "Abadan",
  "اهواز": "Ahvaz",
  "کنگان": "Kangan",
  "خارک": "Kharg Island",
  "جزیره خارک": "Kharg Island",
  "بندرعباس": "Bandar Abbas",
  "قشم": "Qeshm",
  "کیش": "Kish",
  "چابهار": "Chabahar",
  "مکران": "Makran",
  "لامرد": "Lamerd",
  "پارسیان": "Parsian",
  "مسجد سلیمان": "Masjed Soleyman",
  "امیدیه": "Omidiyeh",
  "بهبهان": "Behbahan",
  "گچساران": "Gachsaran",
  "دهلران": "Dehloran",
  "شوشتر": "Shushtar",
  "شوش": "Shush",
  "دزفول": "Dezful",
  "اندیمشک": "Andimeshk",
  "خرمشهر": "Khorramshahr",
  "هندیجان": "Hendijan",
  "لردگان": "Lordegan",
  "خانگیران": "Khangiran",
  "سرخس": "Sarakhs",

  // Industrial & Provincial Centers
  "اصفهان": "Isfahan",
  "شیراز": "Shiraz",
  "تبریز": "Tabriz",
  "اراک": "Arak",
  "کرمانشاه": "Kermanshah",
  "ایلام": "Ilam",
  "مشهد": "Mashhad",
  "یزد": "Yazd",
  "کرمان": "Kerman",
  "سیرجان": "Sirjan",
  "قزوین": "Qazvin",
  "کرج": "Karaj",
  "قم": "Qom",
  "سمنan": "Semnan",
  "سمنان": "Semnan",
  "زنجان": "Zanjan",
  "رشت": "Rasht",
  "ساری": "Sari",
  "ارومیه": "Urmia",
  "اردبیل": "Ardabil",
  "همدان": "Hamedan",
  "سنندج": "Sanandaj",
  "خرم آباد": "Khorramabad",
  "خرم‌آباد": "Khorramabad",
  "بجنورد": "Bojnord",
  "بیرجند": "Birjand",
  "یاسوج": "Yasuj",
  "شهرکرد": "Shahrekord",
  "زاهدان": "Zahedan",
  "گرگان": "Gorgan",

  // Secondary industrial towns
  "ساوه": "Saveh",
  "شازند": "Shazand",
  "خمین": "Khomein",
  "زرندیه": "Zarandieh",
  "مبارکه": "Mobarakeh",
  "کاشان": "Kashan",
  "شهرضا": "Shahreza",
  "زرین شهر": "Zarrinshahr",
  "زرین‌شهر": "Zarrinshahr",
  "نجف آباد": "Najafabad",
  "شاهین شهر": "Shahinshahr",
  "مورچه خورت": "Moorcheh Khort",
  "بروجن": "Borujen",
  "مهاباد": "Mahabad",
  "میاندوآب": "Miandoab",
  "مراغه": "Maragheh",
  "بناب": "Bonab",
  "مرودشت": "Marvdasht",
  "کازرون": "Kazerun",
  "جهرم": "Jahrom",
  "فسا": "Fasa",
  "داراب": "Darab",
  "استهبان": "Estahban",
  "نورآباد ممسنی": "Nurabad Mamasani",
  "جم": "Jam",
  "دیر": "Deyr",
  "بوشهر": "Bushehr",
  "آبیک": "Abyek",
  "تاکستان": "Takestan",
  "اشتهارد": "Eshtehard",
  "نظرآباد": "Nazarabad",
  "هشتگرد": "Hashtgerd",
  "پرند": "Parand",
  "ری": "Rey",
  "نکا": "Neka",
  "بابل": "Babol",
  "آمل": "Amol",
  "نوشهر": "Nowshahr",
  "رودبار": "Rudbar",
  "انزلی": "Anzali",
  "بندر انزلی": "Bandar Anzali",
  "پلدختر": "Poldokhtar",
  "دورود": "Dorud",
  "بروجرد": "Borujerd",
  "بیستون": "Bisotun",
  "اسلام آباد غرب": "Eslamabad-e Gharb",
  "سنقر": "Sonqor",
  "نیشابور": "Neyshabur",
  "سبزوار": "Sabzevar",
  "گرمسار": "Garmsar",
  "دامغان": "Damghan",
  "شاهرود": "Shahroud",
  "زرند": "Zarand",
  "بافت": "Baft",
  "رفسنجان": "Rafsanjan",
  "گلپایگان": "Golpayegan",
  "آق قلا": "Aqqala",
  "فامنین": "Famenin",
  "ملایر": "Malayer",
  "دهدشت": "Dehdasht",
  "زابل": "Zabol",
  "باوی": "Bavi",

  // International/Foreign regions
  "ایتالیا": "Italy",
  "چین": "China",
  "آلمان": "Germany",
  "فرانسه": "France",
  "هند": "India",
  "کره جنوبی": "South Korea",
  "کانادا": "Canada",
  "فیلیپین": "Philippines",
  "ازبکستان": "Uzbekistan",
  "آنکارا": "Ankara",
  "ژاپن": "Japan",
  "سوئیس": "Switzerland",
  "اسپانیا": "Spain",
  "ترکیه": "Turkey",
  "امارات": "UAE",
  "دبی": "Dubai",
};

/**
 * Common English Industry to Persian translation.
 */
export const INDUSTRY_EN_TO_FA: Record<string, string> = {
  "Petrochemical": "صنایع پتروشیمی",
  "Oil Refinery": "پالایشگاه نفت",
  "Gas Refinery": "پالایشگاه گاز",
  "Condensate Refinery": "پالایشگاه میعانات",
  "Chemical Industry": "صنایع شیمیایی",
  "Engineering - Consultant": "مشاور مهندسی",
  "Holding": "هلدینگ و سرمایه‌گذاری",
  "Oil & Gas Industry": "صنایع نفت و گاز",
  "Manufacture": "تولیدی و کارخانجات",
  "Engineering": "خدمات مهندسی",
  "EPC": "پیمانکاری EPC",
  "Financial": "مالی و اعتباری",
  "Water Treatment": "تصفیه آب صنعتی",
  "Municipal Sewage": "فاضلاب و آبفا",
  "Agriculture Industry": "صنایع کشاورزی",
  "Food Industry": "صنایع غذایی",
  "Steel": "صنایع فولاد",
  "Power Plant": "نیروگاه و انرژی",
  "Mining": "معدن و صنایع معدنی",
  "Cement": "صنایع سیمان",
};

/**
 * Common Persian Industry to English translation.
 */
export const INDUSTRY_FA_TO_EN: Record<string, string> = {
  "پتروشیمی": "Petrochemical",
  "صنایع پتروشیمی": "Petrochemical",
  "پالایشگاه نفت": "Oil Refinery",
  "پالایش نفت": "Oil Refining",
  "پالایشگاهی": "Refining",
  "پالایشگاه گاز": "Gas Refinery",
  "گاز": "Gas Processing",
  "پالایشگاه میعانات": "Condensate Refinery",
  "صنایع شیمیایی": "Chemical Industry",
  "شیمیایی": "Chemicals",
  "مشاور مهندسی": "Engineering & Consulting",
  "مهندسی": "Engineering",
  "خدمات مهندسی": "Engineering Services",
  "هلدینگ": "Holding & Investment",
  "هلدینگ و سرمایه‌گذاری": "Holding & Investment",
  "صنایع نفت و گاز": "Oil & Gas Industry",
  "نفت و گاز": "Oil & Gas",
  "تولیدی و کارخانجات": "Manufacturing",
  "پیمانکاری EPC": "EPC & Contracting",
  "پیمانکاری": "Contracting",
  "مالی و اعتباری": "Financial Services",
  "تصفیه آب صنعتی": "Water Treatment",
  "آب و فاضلاب": "Water & Wastewater",
  "فاضلاب و آبفا": "Municipal Sewage",
  "صنایع کشاورزی": "Agriculture Industry",
  "صنایع غذایی": "Food Industry",
  "صنایع فولاد": "Steel & Metals",
  "فولاد": "Steel",
  "نیروگاه و انرژی": "Power & Energy",
  "نیروگاه": "Power Plant",
  "معدن و صنایع معدنی": "Mining & Minerals",
  "معدن": "Mining",
  "صنایع سیمان": "Cement Industry",
  "سیمان": "Cement",
  "دارویی": "Pharmaceuticals",
  "صنایع دارویی": "Pharmaceuticals",
};

/**
 * Unit types translations (Fa to En).
 */
export const UNIT_TYPE_FA_TO_EN: Record<string, string> = {
  "واحد الفین": "Olefin Steam Cracker",
  "واحد الفین (اتیلن / پروپیلن)": "Olefin Cracker (Ethylene / Propylene)",
  "واحد الفین (اتان/نفتا کراکر)": "Olefin Steam Cracker",
  "واحد آروماتیک": "Aromatics Complex",
  "مجتمع آروماتیک": "Aromatics Complex",
  "واحد متانول": "Methanol Plant",
  "واحد اوره و آمونیاک": "Urea & Ammonia Plant",
  "واحد اوره": "Urea Plant",
  "واحد آمونیاک": "Ammonia Plant",
  "واحد پلیمری": "Polymer Plant",
  "واحد پلیمری / PET / PVC": "Polymer / PET / PVC Plant",
  "واحد پلی‌اتیلن": "Polyethylene Unit",
  "واحد پلی‌پروپیلن": "Polypropylene Unit",
  "واحد PVC": "PVC Resin Plant",
  "واحد PET": "PET Plant",
  "واحد PTA": "PTA Unit",
  "واحد اسید استیک": "Acetic Acid Unit",
  "واحد اسید نیتریک": "Nitric Acid Unit",
  "واحد اسید سولفوریک": "Sulfuric Acid Unit",
  "واحد یوتیلیتی": "Central Utility",
  "یوتیلیتی متمرکز فرآیندی": "Central Utility",
  "پالایشگاه نفت و میعانات": "Petroleum & Condensate Refinery",
  "پتروپالایشگاه": "Petro-Refinery Complex",
  "صنایع شیمیایی و واسطه": "Chemicals & Intermediates",
  "واحد تفکیک میعانات": "Condensate Splitter",
  "پتروشیمی": "Petrochemical Complex",
  "پالایشگاه": "Refinery Complex",
};

/**
 * Returns clean customer name depending on current locale.
 * In English mode, strictly returns the English name with ZERO Persian characters.
 */
export function getCustomerDisplayName(customer: Customer, isRtl: boolean): string {
  if (isRtl) {
    return customer.persian_title_fa || customer.company_name_en;
  }
  // English mode
  if (customer.company_name_en && customer.company_name_en.trim()) {
    return customer.company_name_en.trim();
  }
  if (customer.company_abbrv) {
    return customer.company_abbrv;
  }
  // Fallback: clean romanized or fallback
  return "Industrial Client";
}

/**
 * Returns subtitle for client card.
 * In Persian: returns English name if available and distinct.
 * In English: returns Abbreviation, or Process/Industry, NEVER Persian text.
 */
export function getCustomerDisplaySubtitle(customer: Customer, isRtl: boolean): string | null {
  if (isRtl) {
    if (customer.company_name_en && customer.company_name_en !== customer.persian_title_fa) {
      return customer.company_name_en;
    }
    return null;
  }

  // English mode: MUST NEVER BE PERSIAN!
  if (customer.company_abbrv) {
    return customer.company_abbrv;
  }

  if (customer.process_type) {
    return `${customer.process_type} Complex`;
  }

  const indEn = getCustomerDisplayIndustry(customer.industry, false);
  if (indEn && indEn !== "Industrial") {
    const cityEn = getCustomerDisplayCity(customer.city, false);
    return cityEn ? `${indEn} • ${cityEn}` : indEn;
  }

  const cityEn = getCustomerDisplayCity(customer.city, false);
  if (cityEn) {
    return `Based in ${cityEn}`;
  }

  return null;
}

/**
 * Translates an industry string between Persian and English.
 */
export function getCustomerDisplayIndustry(industry?: string | null, isRtl = false): string | null {
  if (!industry || industry.trim() === "" || industry === "N/A" || industry === "—") {
    return null;
  }

  const clean = industry.trim();

  if (isRtl) {
    // English to Persian mapping
    if (INDUSTRY_EN_TO_FA[clean]) {
      return INDUSTRY_EN_TO_FA[clean];
    }
    return clean;
  }

  // English mode: Persian to English mapping
  if (INDUSTRY_FA_TO_EN[clean]) {
    return INDUSTRY_FA_TO_EN[clean];
  }

  // If already in English (contains latin characters and no arabic/persian)
  const hasPersian = /[\u0600-\u06FF]/.test(clean);
  if (!hasPersian) {
    return clean;
  }

  // Common partial matches
  if (clean.includes("پتروشیمی")) return "Petrochemical";
  if (clean.includes("پالایش")) return "Refining";
  if (clean.includes("نفت") || clean.includes("گاز")) return "Oil & Gas";
  if (clean.includes("فولاد")) return "Steel & Metals";
  if (clean.includes("نیروگاه")) return "Power & Energy";
  if (clean.includes("شیمیایی")) return "Chemicals";
  if (clean.includes("سیمان")) return "Cement";
  if (clean.includes("معدن")) return "Mining";
  if (clean.includes("مهندسی") || clean.includes("EPC")) return "EPC & Engineering";

  return "Industrial";
}

/**
 * Translates Iranian cities and multi-part location strings into English.
 */
export function getCustomerDisplayCity(city?: string | null, isRtl = false): string | null {
  if (!city || city.trim() === "" || city === "N/A" || city === "—") {
    return null;
  }

  const clean = city.trim();

  if (isRtl) {
    return clean;
  }

  // If already pure English/Latin without Persian script
  if (!/[\u0600-\u06FF]/.test(clean)) {
    return clean;
  }

  // Direct lookup
  if (CITY_FA_TO_EN[clean]) {
    return CITY_FA_TO_EN[clean];
  }

  // Handle hyphenated or compound locations like "خوزستان - بندر ماهشهر" or "بوشهر - عسلویه"
  if (clean.includes("-") || clean.includes("–") || clean.includes("،") || clean.includes(",")) {
    const parts = clean
      .split(/[-–،,]/)
      .map((p) => p.trim())
      .filter(Boolean);

    const translatedParts = parts.map((p) => {
      if (CITY_FA_TO_EN[p]) return CITY_FA_TO_EN[p];
      // strip province prefixes if any
      const stripped = p
        .replace(/استان\s*/g, "")
        .replace(/شهرستان\s*/g, "")
        .replace(/بندر\s*/g, "Bandar ")
        .trim();
      return CITY_FA_TO_EN[stripped] || p;
    });

    // If reverse order like Province - City, let's format nicely as "City, Province"
    if (translatedParts.length === 2) {
      const [part1, part2] = translatedParts;
      const provinceNames = ["Khuzestan", "Bushehr", "Fars", "Isfahan", "Markazi", "Mazandaran", "Gilan", "Hormozgan", "Kerman", "Kermanshah", "Alborz", "Golestan", "Sistan", "Tehran", "Qazvin"];
      if (provinceNames.includes(part1) && !provinceNames.includes(part2)) {
        return `${part2}, ${part1}`;
      }
      return `${part1} - ${part2}`;
    }

    const filtered = translatedParts.filter((p) => !/[\u0600-\u06FF]/.test(p));
    if (filtered.length > 0) {
      return filtered.join(", ");
    }
  }

  // Check substring matches
  for (const [fa, en] of Object.entries(CITY_FA_TO_EN)) {
    if (clean.includes(fa)) {
      return en;
    }
  }

  // Safe fallback to prevent Persian letters leaking in English mode
  return "Iran";
}

/**
 * Returns the badge details (text and whether it is a petrochemical unit) for a customer card.
 */
export function getCustomerDisplayProcessBadge(
  customer: Customer,
  isRtl = false
): { label: string; isPetro: boolean } | null {
  const isPetro = isPetrochemicalCustomer(customer);

  if (isPetro) {
    if (isRtl) {
      const label =
        customer.unit_type_fa ||
        (customer.process_type ? `واحد ${customer.process_type}` : "پتروشیمی");
      return { label, isPetro: true };
    }

    // English mode
    if (customer.unit_type_fa && UNIT_TYPE_FA_TO_EN[customer.unit_type_fa]) {
      return { label: UNIT_TYPE_FA_TO_EN[customer.unit_type_fa], isPetro: true };
    }

    if (customer.process_type) {
      const pt = customer.process_type.toLowerCase();
      if (pt.includes("olefin")) return { label: "Olefin Steam Cracker", isPetro: true };
      if (pt.includes("aromatic")) return { label: "Aromatics Complex", isPetro: true };
      if (pt.includes("methanol")) return { label: "Methanol Plant", isPetro: true };
      if (pt.includes("urea") || pt.includes("ammonia")) return { label: "Urea & Ammonia", isPetro: true };
      if (pt.includes("polymer") || pt.includes("pe") || pt.includes("pp") || pt.includes("pvc")) return { label: "Polymer Facility", isPetro: true };
      if (pt.includes("refin")) return { label: "Refinery Plant", isPetro: true };
      if (pt.includes("utility")) return { label: "Central Utility", isPetro: true };
      return { label: `${customer.process_type} Unit`, isPetro: true };
    }

    return { label: "Petro Complex", isPetro: true };
  }

  // Non-petrochemical: show industry badge if present
  const ind = getCustomerDisplayIndustry(customer.industry, isRtl);
  if (ind) {
    return { label: ind, isPetro: false };
  }

  return null;
}

