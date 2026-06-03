// src/lib/validations/auth.ts
import { z } from 'zod';

// identifier accepts an Iranian mobile (09xxxxxxxxx) OR a basic email.
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRe = /^09\d{9}$/;

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1)
    .refine((v) => emailRe.test(v) || mobileRe.test(v), 'INVALID_IDENTIFIER'),
  password: z.string().min(4),
});

export type LoginInput = z.infer<typeof loginSchema>;
