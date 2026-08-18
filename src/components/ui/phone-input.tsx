import * as React from "react"
import { useState } from "react"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Combobox } from "@/components/ui/combobox"
import { 
  COUNTRIES, 
  getCountryByCode, 
  validatePhone, 
  validateMobile, 
  cleanRawPhone, 
  applyMask, 
  toEnglishDigits 
} from "@/lib/countries"

export interface PhoneInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  errorText?: string;
  isMobile?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  placeholder,
  errorText = "Invalid number",
  isMobile = false,
}: PhoneInputProps) {
  const t = useTranslations("Common");
  const locale = useLocale();
  const isFa = locale === "fa";
  const [touched, setTouched] = useState(false);
  const hasValue = Boolean(value && value.trim().length > 0);
  
  const resolvedErrorText = errorText === "Invalid number" ? (t ? t("invalidNumber") : errorText) : errorText;
  
  const [countryCode, setCountryCode] = useState("IR");
  const [phoneRaw, setPhoneRaw] = useState(value);
  
  React.useEffect(() => {
    if (value && value.includes(" ")) {
      const parts = value.split(" ");
      const maybeDialCode = parts[0];
      const matchedCountry = COUNTRIES.find(c => c.dialCode === maybeDialCode);
      if (matchedCountry) {
        setCountryCode(matchedCountry.code);
        const rawPart = parts.slice(1).join(" ");
        const maskToUse = isMobile && matchedCountry.mobileMask ? matchedCountry.mobileMask : matchedCountry.mask;
        setPhoneRaw(applyMask(cleanRawPhone(matchedCountry.code, rawPart), maskToUse));
      } else {
        setPhoneRaw(value);
      }
    } else {
      setPhoneRaw(value);
    }
  }, [value, isMobile]);

  const currentCountry = getCountryByCode(countryCode);

  const isValid = hasValue && (isMobile ? validateMobile(countryCode, phoneRaw) : validatePhone(countryCode, phoneRaw));
  const isInvalid = touched && hasValue && !isValid;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawDigits = cleanRawPhone(countryCode, e.target.value);
    
    const maskToUse = isMobile && currentCountry.mobileMask ? currentCountry.mobileMask : currentCountry.mask;
    if (maskToUse) {
      const maxDigits = maskToUse.replace(/\D/g, "").length;
      if (rawDigits.length > maxDigits && rawDigits.startsWith("0")) {
        rawDigits = rawDigits.slice(1);
      }
      if (rawDigits.length > maxDigits) {
        rawDigits = rawDigits.slice(0, maxDigits);
      }
    }

    const formatted = applyMask(rawDigits, maskToUse);
    
    setPhoneRaw(formatted);
    
    if (formatted) {
      onChange(`${currentCountry.dialCode} ${toEnglishDigits(formatted)}`);
    } else {
      onChange("");
    }
  };

  const handleCountryChange = (newCode: string) => {
    setCountryCode(newCode);
    const c = getCountryByCode(newCode);
    const rawDigits = cleanRawPhone(newCode, phoneRaw);
    let finalFormatted = "";
    const maskToUse = isMobile && c.mobileMask ? c.mobileMask : c.mask;
    if (maskToUse) {
      const maxDigits = maskToUse.replace(/\D/g, "").length;
      const truncated = rawDigits.slice(0, maxDigits);
      finalFormatted = applyMask(truncated, maskToUse);
    } else {
      finalFormatted = rawDigits;
    }
    
    setPhoneRaw(finalFormatted);
    if (finalFormatted) {
      onChange(`${c.dialCode} ${toEnglishDigits(finalFormatted)}`);
    } else {
      onChange("");
    }
  };

  const options = COUNTRIES.map(c => {
    const displayName = isFa ? c.nameFa : c.name;
    return {
      value: c.code,
      label: `${displayName} (${c.dialCode})`,
      triggerLabel: c.dialCode,
      searchTerms: [c.name, c.nameFa, c.dialCode, c.code],
      icon: (
        <img 
          src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`} 
          alt={displayName} 
          className="w-4 h-3 object-cover rounded-[2px]" 
        />
      )
    };
  });

  const resolvedPlaceholder = placeholder || (isMobile ? (currentCountry.exampleMobile || currentCountry.mobileMask || "000 000 0000") : (currentCountry.examplePhone || currentCountry.mask || "000 000 0000"));

  return (
    <div className="space-y-0.5 w-full min-w-0 font-sans">
      <div
        className={`relative flex items-center h-7 w-full min-w-0 rounded-lg border bg-white dark:bg-black transition-colors ${
          isInvalid
            ? "border-destructive ring-1 ring-destructive"
            : "border-input focus-within:border-form-primary"
        }`}
      >
        <div className="h-full border-r border-border/50 flex items-center shrink-0">
           <Combobox
            options={options}
            value={countryCode}
            onChange={handleCountryChange}
            className="h-full border-0 shadow-none bg-transparent w-[100px] px-1 text-[11px] [&>button]:h-full [&>button]:px-1"
            showSearch={true}
          />
        </div>
        
        <input
          type="tel"
          value={phoneRaw}
          onChange={handlePhoneChange}
          onBlur={() => setTouched(true)}
          placeholder={resolvedPlaceholder}
          className="h-full text-xs flex-1 min-w-0 bg-transparent border-0 outline-none font-sans px-2 placeholder:text-muted-foreground/50 text-foreground rtl:text-right ltr:text-left"
          dir="ltr"
        />
        {isValid && (
          <CheckCircle2 className="size-3.5 shrink-0 text-form-primary mx-2" />
        )}
      </div>
      {isInvalid && (
        <div className="text-[10px] text-destructive flex items-center gap-1 font-medium px-1">
          <AlertCircle className="size-3 shrink-0" />
          {resolvedErrorText}
        </div>
      )}
    </div>
  );
}
