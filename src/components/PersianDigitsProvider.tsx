"use client";

import { usePersianDigits } from "@/hooks/usePersianDigits";

interface PersianDigitsProviderProps {
  enabled?: boolean;
  selectors?: string[];
}

export function PersianDigitsProvider({ 
  enabled = true, 
  selectors = ['.fa-num', '.persian-digits'] 
}: PersianDigitsProviderProps) {
  usePersianDigits(enabled, selectors);
  
  // This component doesn't render anything, it just acts as an enabler for the hook
  return null;
}
