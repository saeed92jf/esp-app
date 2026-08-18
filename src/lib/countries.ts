export interface Country {
  name: string;
  nameFa: string;
  code: string;
  dialCode: string;
  flag: string;
  mask?: string; // Example: "000 000 0000"
  mobileMask?: string;
  examplePhone?: string;
  exampleMobile?: string;
}

export const COUNTRIES: Country[] = [
  { name: "Iran", nameFa: "ایران", code: "IR", dialCode: "+98", flag: "🇮🇷", mask: "00 0000 0000", mobileMask: "000 000 0000", examplePhone: "21 6548 9563", exampleMobile: "912 356 6548" },
  { name: "United States", nameFa: "ایالات متحده", code: "US", dialCode: "+1", flag: "🇺🇸", mask: "000 000 0000", examplePhone: "201 555 0123" },
  { name: "United Kingdom", nameFa: "انگلستان", code: "GB", dialCode: "+44", flag: "🇬🇧", mask: "0000 000000" },
  { name: "Germany", nameFa: "آلمان", code: "DE", dialCode: "+49", flag: "🇩🇪", mask: "000 0000000" },
  { name: "France", nameFa: "فرانسه", code: "FR", dialCode: "+33", flag: "🇫🇷", mask: "0 00 00 00 00" },
  { name: "Italy", nameFa: "ایتالیا", code: "IT", dialCode: "+39", flag: "🇮🇹", mask: "000 0000000" },
  { name: "Spain", nameFa: "اسپانیا", code: "ES", dialCode: "+34", flag: "🇪🇸", mask: "000 00 00 00" },
  { name: "Canada", nameFa: "کانادا", code: "CA", dialCode: "+1", flag: "🇨🇦", mask: "000 000 0000" },
  { name: "Australia", nameFa: "استرالیا", code: "AU", dialCode: "+61", flag: "🇦🇺", mask: "000 000 000" },
  { name: "United Arab Emirates", nameFa: "امارات", code: "AE", dialCode: "+971", flag: "🇦🇪", mask: "00 000 0000" },
  { name: "Turkey", nameFa: "ترکیه", code: "TR", dialCode: "+90", flag: "🇹🇷", mask: "000 000 00 00" },
  { name: "Iraq", nameFa: "عراق", code: "IQ", dialCode: "+964", flag: "🇮🇶", mask: "000 000 0000" },
  { name: "China", nameFa: "چین", code: "CN", dialCode: "+86", flag: "🇨🇳", mask: "000 0000 0000" },
  { name: "Japan", nameFa: "ژاپن", code: "JP", dialCode: "+81", flag: "🇯🇵", mask: "00 0000 0000" },
  { name: "India", nameFa: "هند", code: "IN", dialCode: "+91", flag: "🇮🇳", mask: "00000 00000" },
  { name: "Russia", nameFa: "روسیه", code: "RU", dialCode: "+7", flag: "🇷🇺", mask: "000 000-00-00" },
  { name: "Brazil", nameFa: "برزیل", code: "BR", dialCode: "+55", flag: "🇧🇷", mask: "00 00000-0000" },
  { name: "South Korea", nameFa: "کره جنوبی", code: "KR", dialCode: "+82", flag: "🇰🇷", mask: "00 0000 0000" },
  { name: "Mexico", nameFa: "مکزیک", code: "MX", dialCode: "+52", flag: "🇲🇽", mask: "000 000 0000" },
  { name: "Saudi Arabia", nameFa: "عربستان", code: "SA", dialCode: "+966", flag: "🇸🇦", mask: "00 000 0000" },
  { name: "Qatar", nameFa: "قطر", code: "QA", dialCode: "+974", flag: "🇶🇦", mask: "0000 0000" },
  { name: "Oman", nameFa: "عمان", code: "OM", dialCode: "+968", flag: "🇴🇲", mask: "0000 0000" },
  { name: "Kuwait", nameFa: "کویت", code: "KW", dialCode: "+965", flag: "🇰🇼", mask: "0000 0000" },
];

export function getCountryByCode(code: string) {
  return COUNTRIES.find(c => c.code === code) || COUNTRIES[0];
}

export function validatePhone(countryCode: string, phone: string): boolean {
  if (!phone) return true;
  const raw = phone.replace(/\D/g, "");
  if (raw.length === 0) return true;

  const lengths: Record<string, number[]> = {
    "IR": [10], // Iran without leading zero is 10 digits
    "US": [10],
    "GB": [10], // GB without leading zero is 10
    "DE": [10, 11],
    "AE": [8, 9], // AE without 0
    "TR": [10],
    "IQ": [10],
  };

  const validLengths = lengths[countryCode] || [8, 9, 10, 11, 12, 13, 14, 15];
  return validLengths.includes(raw.length);
}

export function validateMobile(countryCode: string, mobile: string): boolean {
  if (!mobile) return true;
  const raw = mobile.replace(/\D/g, "");
  if (raw.length === 0) return true;
  
  if (countryCode === "IR") {
    // 9XXXXXXXXX (10 digits)
    return raw.length === 10 && raw.startsWith("9");
  }
  
  return validatePhone(countryCode, mobile);
}

// Do not auto-remove zeros so that validation can catch them and show errors if needed
export function cleanRawPhone(countryCode: string, input: string): string {
  return input.replace(/\D/g, "");
}

export function applyMask(raw: string, mask?: string): string {
  if (!mask || !raw) return raw;
  let formatted = "";
  let rawIndex = 0;
  for (let i = 0; i < mask.length; i++) {
    if (rawIndex >= raw.length) break;
    if (mask[i] === '0') {
      formatted += raw[rawIndex];
      rawIndex++;
    } else {
      formatted += mask[i];
    }
  }
  return formatted;
}
