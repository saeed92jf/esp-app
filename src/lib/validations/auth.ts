// src/lib/validations/auth.ts
import { z } from 'zod';

// Iranian mobile pattern: starts with 09 followed by 9 digits.
const phoneRegex = /^09\d{9}$/;

// Login schema: identifier (phone) + password.
export const loginSchema = z.object({
  phone: z
    .string()
    .min(1, 'شماره موبایل را وارد کنید')
    .regex(phoneRegex, 'شماره موبایل معتبر نیست'),
  password: z
    .string()
    .min(1, 'رمز عبور را وارد کنید')
    .min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
});

// Register schema with password confirmation refinement.
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'نام و نام خانوادگی را وارد کنید')
      .min(3, 'نام باید حداقل ۳ کاراکتر باشد'),
    phone: z
      .string()
      .min(1, 'شماره موبایل را وارد کنید')
      .regex(phoneRegex, 'شماره موبایل معتبر نیست'),
    password: z
      .string()
      .min(1, 'رمز عبور را وارد کنید')
      .min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
    confirmPassword: z.string().min(1, 'تکرار رمز عبور را وارد کنید'),
  })
  // Cross-field validation: both passwords must match.
  .refine((data) => data.password === data.confirmPassword, {
    message: 'رمز عبور و تکرار آن یکسان نیستند',
    path: ['confirmPassword'],
  });

// Forgot-password schema: email is used for the recovery link.
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'ایمیل را وارد کنید')
    .email('ایمیل واردشده معتبر نیست'),
});

// Reset-password schema with confirmation matching.
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'رمز عبور را وارد کنید')
      .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
    confirmPassword: z.string().min(1, 'تکرار رمز عبور را وارد کنید'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    // Attach the error to the confirmation field for inline display.
    message: 'رمز عبور و تکرار آن یکسان نیستند',
    path: ['confirmPassword'],
  });

// Inferred TypeScript types — single source of truth from the schemas.
export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
