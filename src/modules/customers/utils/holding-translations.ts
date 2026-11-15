// src/modules/customers/utils/holding-translations.ts
import type { Holding, HoldingSubsidiary } from "../types/holdings.types";

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

export function getHoldingDisplayName(holding: Holding, isRtl: boolean): string {
  if (isRtl) return holding.nameFa;
  return holding.nameEn || holding.nameFa;
}

export function getHoldingDisplayDescription(holding: Holding, isRtl: boolean): string {
  if (isRtl) return holding.descriptionFa;
  return holding.descriptionEn || "Major industrial and petrochemical conglomerate managing strategic production assets in Iran.";
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
