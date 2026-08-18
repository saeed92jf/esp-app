export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
  mask?: string; // Example: "000 000 0000"
}

export const COUNTRIES: Country[] = [
  { name: "Iran", code: "IR", dialCode: "+98", flag: "🇮🇷", mask: "000 000 0000" },
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸", mask: "000 000 0000" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧", mask: "0000 000000" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪", mask: "000 0000000" },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷", mask: "0 00 00 00 00" },
  { name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹", mask: "000 0000000" },
  { name: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸", mask: "000 00 00 00" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦", mask: "000 000 0000" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺", mask: "000 000 000" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪", mask: "00 000 0000" },
  { name: "Turkey", code: "TR", dialCode: "+90", flag: "🇹🇷", mask: "000 000 00 00" },
  { name: "Iraq", code: "IQ", dialCode: "+964", flag: "🇮🇶", mask: "000 000 0000" },
  { name: "China", code: "CN", dialCode: "+86", flag: "🇨🇳", mask: "000 0000 0000" },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵", mask: "00 0000 0000" },
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳", mask: "00000 00000" },
  { name: "Russia", code: "RU", dialCode: "+7", flag: "🇷🇺", mask: "000 000-00-00" },
  { name: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷", mask: "00 00000-0000" },
  { name: "South Korea", code: "KR", dialCode: "+82", flag: "🇰🇷", mask: "00 0000 0000" },
  { name: "Mexico", code: "MX", dialCode: "+52", flag: "🇲🇽", mask: "000 000 0000" },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦", mask: "00 000 0000" },
  { name: "Qatar", code: "QA", dialCode: "+974", flag: "🇶🇦", mask: "0000 0000" },
  { name: "Oman", code: "OM", dialCode: "+968", flag: "🇴🇲", mask: "0000 0000" },
  { name: "Kuwait", code: "KW", dialCode: "+965", flag: "🇰🇼", mask: "0000 0000" },
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

// Remove leading zeros for country codes that typically drop the trunk prefix (0) internationally
export function cleanRawPhone(countryCode: string, input: string): string {
  let raw = input.replace(/\D/g, "");
  if (["IR", "GB", "DE", "AE", "TR"].includes(countryCode)) {
    raw = raw.replace(/^0+/, "");
  }
  return raw;
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
