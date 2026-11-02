// src/lib/validations/auth.ts
import { z } from 'zod';

export function normalizeDigits(str: string): string {
  if (!str) return '';
  return str
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1776 + 48))
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1632 + 48));
}

// identifier accepts an Iranian mobile (09xxxxxxxxx), an email, or a username/account
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRe = /^09\d{9}$/;

export const getLoginSchema = (t: (key: string) => string) => z.object({
  identifier: z
    .string()
    .trim()
    .min(1, { message: t('required') })
    .transform(normalizeDigits)
    .refine(
      (v) => emailRe.test(v) || mobileRe.test(v) || v.toLowerCase() === 'saeed' || v.length >= 2,
      { message: t('invalidIdentifier') }
    ),
  password: z.string().min(1, { message: t('required') }),
});

export type LoginInput = { identifier: string; password: string };

// Allowed corporate email domains: @euroslotpars.com and @npceram.com
export const companyEmailRe = /^[a-zA-Z0-9._%+-]+@(euroslotpars\.com|npceram\.com)$/i;

export const getAccountRequestSchema = (t: (key: string) => string) => z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: t('required') })
    .email({ message: t('invalidEmail') })
    .refine((v) => companyEmailRe.test(v), {
      message: t('errors.invalidCompanyEmail'),
    }),
});

export type AccountRequestInput = { email: string };
