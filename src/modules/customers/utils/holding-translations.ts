// src/modules/customers/utils/holding-translations.ts
import type { Holding, HoldingShareholder, HoldingSubsidiary } from "../types/holdings.types";

export interface HoldingEnMetadata {
  capacityEn: string;
  marketCapEn: string;
  headquartersEn: string;
  ceoEn: string;
  strategicHighlightsEn: string[];
}

export const HOLDING_EN_METADATA: Record<string, HoldingEnMetadata> = {
  pgpic: {
    capacityEn: "28.5 Million Tons/Year (Over 40% of national petrochemical capacity)",
    marketCapEn: "Over 720 Trillion Tomans (Ranked #1 by Market Cap on TSE)",
    headquartersEn: "No. 38, Karimkhan Zand St., Haft-e Tir Sq., Tehran",
    ceoEn: "Ali Askari",
    strategicHighlightsEn: [
      "Iran's largest petrochemical conglomerate and second largest in the Middle East",
      "Controls central utility networks (Mobin & Fajr Energy) in Assaluyeh and Mahshahr",
      "Supplies more than 40% of Iran's total petrochemical export volume",
      "Extensive diversified portfolio across aromatics, olefins, and downstream polymers",
    ],
  },
  tappico: {
    capacityEn: "12.4 Million Tons/Year of refined and petrochemical products",
    marketCapEn: "Apex energy investment arm of SHASTA",
    headquartersEn: "Tehran, Iran",
    ceoEn: "Babak Afgheh",
    strategicHighlightsEn: [
      "Major stakeholder in Persian Gulf Star Refinery (PGR Star)",
      "Strategic market leader in base oils, lubricants (Iranol, Pasargad), and chemicals",
      "Diversified asset base across refining, petrochemicals, and tire manufacturing",
    ],
  },
  parsan: {
    capacityEn: "23.0 Million Tons/Year of petrochemical and refinery output",
    marketCapEn: "Leading energy conglomerate of Ghadir Investment / SATA",
    headquartersEn: "Tehran, Iran",
    ceoEn: "Seyed Reza Norouz-Zadeh",
    strategicHighlightsEn: [
      "Middle East leader in urea and ammonia through Pardis, Shiraz, and Kermanshah",
      "World-scale methanol production via Zagros Petrochemical",
      "Integrated refining assets including Tabriz and Shiraz refineries",
    ],
  },
  bakhtar: {
    capacityEn: "5.8 Million Tons/Year of olefins and polyolefins",
    marketCapEn: "Premier private petrochemical conglomerate in Iran",
    headquartersEn: "Tehran, Iran",
    ceoEn: "Davoud Reza Rabbani",
    strategicHighlightsEn: [
      "Owner and operator of the 2,200 km Western Ethylene Pipeline",
      "Integrated feed network from Kavian Olefin (Olefins 11) to western provincial plants",
      "High operational efficiency with modern European process licensor technologies",
    ],
  },
  "saba-energy": {
    capacityEn: "6.2 Million Tons/Year of polymers and chemicals",
    marketCapEn: "Energy arm of the Civil Servants Pension Fund (CSPF)",
    headquartersEn: "Tehran, Iran",
    ceoEn: "Alireza Zamanpour",
    strategicHighlightsEn: [
      "Owner of Jam Petrochemical (Olefin 10, one of the world's largest olefin complexes)",
      "Market dominance in polypropylene via Jam Polypropylene (JPPC)",
      "Strategic producer of HDPE, LLDPE, and specialty chemical grades",
    ],
  },
  mapna: {
    capacityEn: "Over 65,000 MW power plant execution & mega oil/gas EPC",
    marketCapEn: "Iran's premier industrial and engineering conglomerate",
    headquartersEn: "No. 231, Mirdamad Blvd., Tehran",
    ceoEn: "Mohammad Owliya",
    strategicHighlightsEn: [
      "Designer and manufacturer of heavy industrial gas and steam turbines (TUGA)",
      "General contractor for major refinery, thermal power, and renewables projects",
      "Pioneer in high-tech process equipment, control systems, and compression trains",
    ],
  },
  ahdaf: {
    capacityEn: "Over 10 Million Tons of petroleum, petrochemical, and lube products",
    marketCapEn: "Strategic investment arm of Oil Industry Pension Funds (OPGC)",
    headquartersEn: "Tehran, Iran",
    ceoEn: "Abdolhossein Bayat",
    strategicHighlightsEn: [
      "Controlling stake in Kangan Petrochemical and Sepahan Oil Company",
      "Strategic EPC execution via OIEC (Oil Industries Engineering & Construction)",
      "High liquidity and long-term infrastructure investment mandate",
    ],
  },
  shasta: {
    capacityEn: "Over 180 subsidiaries across 9 specialized industrial holdings",
    marketCapEn: "Iran's largest multi-sector investment holding",
    headquartersEn: "Tehran, Iran",
    ceoEn: "Aref Norouzi",
    strategicHighlightsEn: [
      "Apex investment arm of Iran's Social Security Organization",
      "Spans petrochemicals (TAPPICO), pharma (TPICO), mining (Sadr Tamin), and cement",
      "Unmatched industrial footprint across all Iranian provinces",
    ],
  },
  shiran: {
    capacityEn: "220,000 Tons/Year (Largest LAB producer in the Middle East)",
    marketCapEn: "Industry benchmark on Tehran Stock Exchange",
    headquartersEn: "No. 15, Shahid Khaled Eslamboli (Vozara) St., Tehran",
    ceoEn: "Saeed Zarepour",
    strategicHighlightsEn: [
      "Produces over 75% of raw materials (LAB and normal paraffin) for Iran's detergent industry",
      "Significant export reach across 20+ countries in Asia and Europe",
      "Dedicated port export terminal in Bushehr for bulk chemical logistics",
    ],
  },
  "sepehr-energy": {
    capacityEn: "5.5 Million Tons/Year methanol & petrochemical consortium",
    marketCapEn: "Consortium of export-oriented methanol mega-complexes",
    headquartersEn: "Saadat Abad, 2nd Shahid Abghari St., Tehran",
    ceoEn: "Davood Jabbari",
    strategicHighlightsEn: [
      "Developer of Sabalan, Dena, and Siraf Energy mega-methanol plants",
      "Strategically situated in Assaluyeh Phase 2 with dedicated deepwater jetties",
      "Next-generation scale with world-class low-carbon technology packages",
    ],
  },
  gubretas: {
    capacityEn: "3.7 Million Tons/Year ammonia, urea, and phosphoric acid at Razi Complex",
    marketCapEn: "Over 30 Billion TRY on Borsa Istanbul (BIST)",
    headquartersEn: "Istanbul, Turkey / Mahshahr Petrochemical Zone",
    ceoEn: "Aykut Tekin",
    strategicHighlightsEn: [
      "Turkey's largest fertilizer company and 48.88% majority owner of Razi Petrochemical",
      "Strategically operates Iran's largest sulfur and fertilizer export terminal",
      "Major cross-border industrial integration between Iran and Turkey",
    ],
  },
  "petro-techna": {
    capacityEn: "Specialized engineering, procurement, and EPC project management",
    marketCapEn: "Private engineering and investment holding",
    headquartersEn: "Shariati St., Tehran",
    ceoEn: "Executive Engineering Management",
    strategicHighlightsEn: [
      "Specializes in surface process facilities, skids, and separation packages",
      "Engineering collaboration with domestic and international process equipment makers",
      "Direct synergies with Euroslot Pars reactor internal applications",
    ],
  },
};

const INDUSTRY_TRANSLATIONS: Record<string, string> = {
  "PVC و DDB": "PVC & DDB",
  "آلکیلاسیون و تفکیک پارافین": "Alkylation & Paraffin Separation",
  "استایرن منومر و اتیل بنزن": "Styrene Monomer & Ethylbenzene",
  "الفین پایه نفتا و پلیمر": "Naphtha-Based Olefin & Polymers",
  "الفین، پلیمرهای استایرنی و لاستیک": "Olefins, Styrenic Polymers & Rubbers",
  "انبارش مواد شیمیایی و پایانه صادرات دریایی": "Chemical Storage & Maritime Export Terminal",
  "اوره و آمونیاک": "Urea & Ammonia",
  "اوره و آمونیاک (فاز ۱ و ۲ و ۳)": "Urea & Ammonia (Phases 1, 2 & 3)",
  "اوره و آمونیاک جزیره لاوان": "Urea & Ammonia (Lavan Island)",
  "اوره و آمونیاک غرب کشور": "Urea & Ammonia (Western Complex)",
  "اوره، آمونیاک و ملامین": "Urea, Ammonia & Melamine",
  "ایزوسیانات‌ها و پلی‌یورتان": "Isocyanates & Polyurethanes",
  "بانکداری، بیمه، تامین سرمایه و کارگزاری": "Banking, Insurance & Investment Brokerage",
  "بویلرهای بازیاب حرارتی HRSG و صنعتی": "HRSG & Industrial Heat Recovery Boilers",
  "توربین‌های گاز و بخار و کمپرسورهای فرآیندی": "Gas/Steam Turbines & Process Compressors",
  "توسعه صنایع پایین‌دستی پتروشیمی": "Downstream Petrochemical Development",
  "تولید رزین PVC و وینیل کلراید": "PVC Resin & Vinyl Chloride Monomer",
  "تولید قیر صنعتی و جاده‌ای": "Industrial & Road Bitumen Production",
  "جداسازی اتان و الفین اتان کراکر (الفین ۱۴)": "Ethane Recovery & Olefin Cracker (Olefin 14)",
  "حمل و نقل دریایی محصولات شیمیایی و گاز آمونیاک": "Maritime Chemical & Ammonia Gas Transport",
  "داروسازی و مواد اولیه دارویی": "Pharmaceuticals & Active Ingredients (API)",
  "روانکارها و روغن موتور": "Lubricants & Engine Oils",
  "روغن پایه و روانکارهای فوق‌پیشرفته": "Base Oils & Advanced Lubricants",
  "سیمان، کلینکر و مصالح ساختمانی": "Cement, Clinker & Construction Materials",
  "فولادهای آلیاژی عریض": "Wide Alloy Steels & Plates",
  "متانول مقیاس جهانی": "World-Scale Methanol",
  "متانول و اسکله اختصاصی صادرات": "Methanol & Dedicated Export Jetty",
  "متانول و اسید استیک": "Methanol & Acetic Acid",
  "متانول گرید AA (فاز ۱ و ۲)": "AA-Grade Methanol (Phases 1 & 2)",
  "متانول گرید پتروشیمی": "Petrochemical-Grade Methanol",
  "مجتمع آروماتیک": "Aromatics Complex",
  "معادن، طلا، فولاد و فلزات اساسی": "Mining, Gold, Steel & Base Metals",
  "مهندسی بسته‌های فرآیندی و مخازن نفت و گاز": "Process Package Engineering & Pressure Vessels",
  "مگا الفین اتان کراکر (فاز ۱ و ۲)": "Mega Olefin Ethane Cracker (Phases 1 & 2)",
  "مگا الفین گازی و مایع و پلیمرها": "Gas & Liquid Mega Olefin with Downstream Polymers",
  "مگا پالایشگاه میعانات گازی": "Condensate Mega-Refinery",
  "نفت، گاز، پتروشیمی و پالایشگاه": "Oil, Gas, Petrochemical & Refining",
  "واحد الفین اتان کراکر": "Ethane Cracker Olefin Unit",
  "پالایش نفت خام": "Crude Oil Refining",
  "پالایش نفت خام و تولید سوخت": "Crude Refining & Fuel Production",
  "پالایش و تفکیک گازهای همراه و فلر": "Associated Gas & Flare Recovery",
  "پتروشیمی جامع (الفین، آروماتیک، کلرآلکالی، لاستیک)": "Integrated Petrochemicals (Olefins, Aromatics, Chlor-Alkali)",
  "پلی‌اتیلن ترفتالات (PET) و اسید ترفتالیک": "Polyethylene Terephthalate (PET) & PTA",
  "پلی‌اتیلن سبک (LDPE)": "Low-Density Polyethylene (LDPE)",
  "پلی‌اتیلن سنگین (HDPE)": "High-Density Polyethylene (HDPE)",
  "پلی‌اتیلن سنگین سبک‌ساز": "HDPE Blow & Film Grades",
  "پلی‌اتیلن سنگین و خطی (LLDPE/HDPE)": "HDPE & Linear Low-Density (LLDPE)",
  "پلی‌اتیلن سنگین و سبک خطی": "HDPE & Linear Low-Density PE",
  "پلی‌پروپیلن و هموپلیمر/کوپلیمر": "Polypropylene (PP) Homopolymer & Copolymer",
  "پیمانکاری عمومی EPC مگاپروژه‌های نفت و گاز": "General EPC Contracting for Mega Oil & Gas Projects",
  "پیمانکاری عمومی EPC مگاپروژه‌های نفت، گاز و پتروشیمی": "General EPC for Oil, Gas & Petrochemical Projects",
  "کلرآلکالی و پلی وینیل کلراید (PVC)": "Chlor-Alkali & Polyvinyl Chloride (PVC)",
  "کودهای شیمیایی و نیتروژن": "Chemical & Nitrogen Fertilizers",
  "کودهای شیمیایی، آمونیاک، اوره و اسید فسفریک": "Fertilizers, Ammonia, Urea & Phosphoric Acid",
  "یوتیلیتی متمرکز": "Central Utilities",
  "یوتیلیتی متمرکز فرآیندی": "Central Process Utilities (Power, Steam & Water)",
};

const SHAREHOLDER_TRANSLATIONS: Record<string, string> = {
  "اتحادیه تعاونی‌های اعتباری کشاورزی ترکیه (Tarım Kredi Kooperatifleri)": "Agricultural Credit Cooperatives of Turkey (Tarım Kredi)",
  "سازمان تامین اجتماعی (دولت و بیمه‌شدگان)": "Social Security Organization (SSO)",
  "سایر سرمایه‌گذاران نهادی": "Other Institutional Investors",
  "سایر سهامداران حقوقی و بازار سرمایه": "Public Float & Institutional Investors",
  "سرمایه‌گذاران حقیقی و حقوقی بورس": "Public Market & Retail Investors",
  "سرمایه‌گذاری آتیه صبا": "Atieh Saba Investment Co.",
  "سرمایه‌گذاری ساتا": "SATA Investment Co.",
  "سرمایه‌گذاری نفت و گاز و پتروشیمی تامین (تاپیکو)": "TAPPICO Holding",
  "سهام عدالت و سهامداران حقوقی و بورس": "Justice Shares & Public Float",
  "سهامداران حقیقی و حقوقی بازار سرمایه": "Public Capital Market Investors",
  "سهامداران خصوصی و متخصصان صنعت مهندسی نفت": "Private Shareholders & Petroleum Engineers",
  "سهامداران شناور بازار سرمایه": "Tehran Stock Exchange Free Float",
  "سهامداران شناور در بورس استانبول (Borsa Istanbul - GUBRF)": "Borsa Istanbul Free Float (BIST: GUBRF)",
  "شرکت سرمایه‌گذاری اهداف (وابسته به صندوق بازنشستگی نفت)": "Ahdaf Investment Co. (Oil Pension Fund)",
  "شرکت سرمایه‌گذاری تامین آتیه مسکن": "Tamin Atieh Maskan Investment Co.",
  "شرکت سرمایه‌گذاری تامین اجتماعی (شستا)": "Social Security Investment Co. (SHASTA)",
  "شرکت سرمایه‌گذاری تدبیر و امید وابسته به آستان قدس رضوی": "Tadbir & Omid Investment (AQR)",
  "شرکت سرمایه‌گذاری صنایع برق و آب صبا": "Saba Power & Water Industries Investment",
  "شرکت سرمایه‌گذاری غدیر (ساتا / نیروهای مسلح)": "Ghadir Investment Co. (SATA)",
  "شرکت ملی صنایع پتروشیمی (NPC - دولت)": "National Petrochemical Company (NPC - State)",
  "شرکت ملی صنایع پتروشیمی (NPC)": "National Petrochemical Company (NPC)",
  "شرکت گروه سرمایه‌گذاری آتیه دماوند (بانک صنعت و معدن)": "Atieh Damavand Investment (Bank of Industry & Mine)",
  "شرکت‌های سرمایه‌گذاری استانی (سهام عدالت)": "Provincial Investment Companies (Justice Shares)",
  "صندوق بازنشستگی و پس‌انداز کارکنان صنعت نفت": "Oil Industry Pension & Savings Fund",
  "صندوق بازنشستگی کشوری": "Civil Servants Pension Fund (CSPF)",
  "صندوق بازنشستگی کشوری (وزارت رفاه)": "Civil Servants Pension Fund (CSPF)",
  "صندوق بازنشستگی، پس‌انداز و رفاه کارکنان صنعت نفت (OPIC)": "Oil Personnel Pension & Welfare Fund (OPIC)",
  "صندوق بیمه اجتماعی کشاورزان، روستائیان و عشایر": "Farmers, Villagers & Nomads Social Insurance Fund",
  "صندوق سرمایه‌گذاری بازارگردانی صبا": "Saba Market-Making Investment Fund",
  "صندوق‌های بازنشستگی و بیمه سلامت": "Pension & Health Insurance Funds",
  "صندوق‌های بازنشستگی و سایر سهامداران بورس": "Pension Funds & TSE Market Float",
  "صندوق‌های سرمایه‌گذاری و سهامداران خرد بورس تهران": "Mutual Funds & Retail TSE Investors",
  "موسسه صندوق ذخیره فرهنگیان": "Farhangian Reserve Fund",
  "گروه سرمایه‌گذاری و توسعه باختر (بخش خصوصی)": "Bakhtar Investment & Development Group (Private)",
  "گروه مالی سپهر صادرات (بانک صادرات ایران)": "Sepehr Saderat Financial Group (Bank Saderat)",
};

export function getHoldingDisplayName(holding: Holding, isRtl: boolean): string {
  if (isRtl) return holding.nameFa;
  return holding.nameEn || holding.nameFa;
}

export function getHoldingDisplayDescription(holding: Holding, isRtl: boolean): string {
  if (isRtl) return holding.descriptionFa;
  return holding.descriptionEn || "Major industrial and petrochemical conglomerate managing strategic production assets in Iran.";
}

export function getHoldingDisplayCapacity(holding: Holding, isRtl: boolean): string {
  if (isRtl) return holding.annualCapacityFa;
  const meta = HOLDING_EN_METADATA[holding.id];
  if (meta?.capacityEn) return meta.capacityEn;
  return "Industrial Production Capacity";
}

export function getHoldingDisplayMarketCap(holding: Holding, isRtl: boolean): string {
  if (isRtl) return holding.marketCapFa || "پیشرو در تالار بورس اوراق بهادار تهران";
  const meta = HOLDING_EN_METADATA[holding.id];
  if (meta?.marketCapEn) return meta.marketCapEn;
  return "Listed Conglomerate on Stock Exchange";
}

export function getHoldingDisplayHeadquarters(holding: Holding, isRtl: boolean): string {
  if (isRtl) return holding.headquartersFa;
  const meta = HOLDING_EN_METADATA[holding.id];
  if (meta?.headquartersEn) return meta.headquartersEn;
  return "Tehran, Iran";
}

export function getHoldingDisplayCeo(holding: Holding, isRtl: boolean): string {
  if (isRtl) return holding.ceoNameFa;
  const meta = HOLDING_EN_METADATA[holding.id];
  if (meta?.ceoEn) return meta.ceoEn;
  return holding.ceoNameFa;
}

export function getHoldingDisplayHighlights(holding: Holding, isRtl: boolean): string[] {
  if (isRtl) return holding.strategicHighlightsFa;
  const meta = HOLDING_EN_METADATA[holding.id];
  if (meta?.strategicHighlightsEn && meta.strategicHighlightsEn.length > 0) {
    return meta.strategicHighlightsEn;
  }
  return [
    "Leading industrial conglomerate with strategic national infrastructure",
    "Comprehensive production integration with primary and downstream units",
    "Close technical synergy with Euroslot Pars high-precision filtration solutions",
  ];
}

export function getShareholderDisplayName(sh: HoldingShareholder, isRtl: boolean): string {
  if (isRtl) return sh.nameFa;
  if (sh.nameEn) return sh.nameEn;
  if (SHAREHOLDER_TRANSLATIONS[sh.nameFa]) return SHAREHOLDER_TRANSLATIONS[sh.nameFa];
  return sh.nameFa;
}

export function getSubsidiaryDisplayName(sub: HoldingSubsidiary, isRtl: boolean): string {
  if (isRtl) return sub.nameFa;
  if (sub.nameEn) return sub.nameEn;
  return sub.companyAbbrv || sub.nameFa;
}

export function getSubsidiaryDisplayIndustry(sub: HoldingSubsidiary, isRtl: boolean): string {
  if (isRtl) return sub.industry;
  if (INDUSTRY_TRANSLATIONS[sub.industry]) return INDUSTRY_TRANSLATIONS[sub.industry];
  return sub.industry;
}
