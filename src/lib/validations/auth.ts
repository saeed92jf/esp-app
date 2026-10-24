// src/lib/validations/auth.ts
import { z } from 'zod';

// identifier accepts an Iranian mobile (09xxxxxxxxx) OR a basic email.
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRe = /^09\d{9}$/;

export const getLoginSchema = (t: (key: string) => string) => z.object({
  identifier: z
    .string()
    .trim()
    .min(1, { message: t('required') })
    .refine((v) => emailRe.test(v) || mobileRe.test(v) || ['saeed', 'guest', 'gust'].includes(v.toLowerCase()), { message: t('invalidIdentifier') }),
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

