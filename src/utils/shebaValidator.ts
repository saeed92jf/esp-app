/**
 * Utility for Iranian Sheba (IBAN) validation, digit counting, and formatting.
 * Iranian Sheba format: IR + 24 numeric digits = 26 characters total.
 */

/**
 * Normalize any input string:
 * - Converts Persian (۰-۹) and Arabic (٠-٩) digits to ASCII (0-9)
 * - Converts to uppercase
 * - Strips any spaces, dashes, or non-alphanumeric characters
 */
export function normalizeSheba(input: string | null | undefined): string {
  if (!input) return "";
  let val = String(input).trim();

  // Convert Persian and Arabic digits to ASCII
  val = val.replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
  val = val.replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660));

  // Remove spaces, hyphens, and other punctuation
  val = val.replace(/[\s\-_/.]/g, "").toUpperCase();

  // If user only typed digits, prepend IR
  if (/^\d+$/.test(val)) {
    val = `IR${val}`;
  } else if (!val.startsWith("IR")) {
    // Keep only alphanumeric and enforce IR if leading
    val = val.replace(/[^A-Z0-9]/g, "");
    if (!val.startsWith("IR") && val.length > 0) {
      val = `IR${val.replace(/^[^0-9]+/, "")}`;
    }
  }

  // Max length is 26 characters (IR + 24 digits)
  return val.slice(0, 26);
}

/**
 * Extract just the digits portion of Sheba (up to 24 digits).
 */
export function getShebaDigits(sheba: string | null | undefined): string {
  const norm = normalizeSheba(sheba);
  return norm.startsWith("IR") ? norm.slice(2) : norm.replace(/\D/g, "");
}

/**
 * Validate Iranian Sheba:
 * 1. Must start with 'IR'
 * 2. Digits length must be exactly 24 digits
 * 3. Standard ISO 7064 Mod 97-10 checksum validation
 */
export interface ShebaValidationResult {
  isValid: boolean;
  digitCount: number;
  isCompleteLength: boolean;
  errorKey?: "shebaEmpty" | "shebaIncomplete" | "shebaInvalidFormat" | "shebaInvalidChecksum";
}

export function validateSheba(sheba: string | null | undefined): ShebaValidationResult {
  const normalized = normalizeSheba(sheba);
  const digits = getShebaDigits(normalized);
  const digitCount = digits.length;
  const isCompleteLength = digitCount === 24;

  if (!normalized || digitCount === 0) {
    return {
      isValid: false,
      digitCount: 0,
      isCompleteLength: false,
      errorKey: "shebaEmpty",
    };
  }

  if (digitCount < 24) {
    return {
      isValid: false,
      digitCount,
      isCompleteLength: false,
      errorKey: "shebaIncomplete",
    };
  }

  if (!/^IR\d{24}$/.test(normalized)) {
    return {
      isValid: false,
      digitCount,
      isCompleteLength,
      errorKey: "shebaInvalidFormat",
    };
  }

  // ISO 7064 Mod 97-10 check:
  // Move first 4 characters (IR + 2 check digits) to the end:
  // 'IR' -> '1827'
  // Resulting string: [22 digits of account] + '1827' + [2 check digits]
  const checkDigits = normalized.slice(2, 4);
  const bban = normalized.slice(4);
  const rearranged = bban + "1827" + checkDigits;

  let remainder = 0;
  for (let i = 0; i < rearranged.length; i++) {
    remainder = (remainder * 10 + parseInt(rearranged[i], 10)) % 97;
  }

  const isValid = remainder === 1;

  return {
    isValid,
    digitCount: 24,
    isCompleteLength: true,
    errorKey: isValid ? undefined : "shebaInvalidChecksum",
  };
}

/**
 * Format Sheba into readable 4-character blocks:
 * e.g. "IR12 0120 0000 0000 1234 5678 90"
 */
export function formatSheba(sheba: string | null | undefined): string {
  const norm = normalizeSheba(sheba);
  if (!norm) return "";
  return norm.replace(/(.{4})/g, "$1 ").trim();
}
