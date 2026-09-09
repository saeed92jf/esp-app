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
    .refine((v) => emailRe.test(v) || mobileRe.test(v), { message: t('invalidIdentifier') }),
  password: z.string().min(1, { message: t('required') }),
});

export type LoginInput = { identifier: string; password: string };
