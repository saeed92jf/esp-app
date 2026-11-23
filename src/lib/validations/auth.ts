import { z } from 'zod';

export function normalizeDigits(str: string): string {
  if (!str) return '';
  return str
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1776 + 48))
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1632 + 48));
}

// Accepts email, Iranian mobile (09xxxxxxxxx), or username
export const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const mobileRe = /^09\d{9}$/;

// Allowed corporate email domains: @euroslotpars.com, @npceram.com, or general corporate
export const companyEmailRe = /^[a-zA-Z0-9._%+-]+@(euroslotpars\.com|npceram\.com|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/i;

export const getLoginSchema = (t?: (key: string) => string) => {
  const trans = t || ((k: string) => k);
  return z.object({
    identifier: z
      .string()
      .trim()
      .min(1, { message: trans('required') || 'این فیلد الزامی است' })
      .transform(normalizeDigits)
      .refine(
        (v) => emailRe.test(v) || mobileRe.test(v) || v.length >= 2,
        { message: trans('invalidIdentifier') || 'شناسه کاربری یا ایمیل نامعتبر است' }
      ),
    password: z.string().min(1, { message: trans('required') || 'این فیلد الزامی است' }),
  });
};

export type LoginInput = { identifier: string; password: string };

export const getAccountRequestSchema = (t?: (key: string) => string) => {
  const trans = t || ((k: string) => k);
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, { message: trans('required') || 'این فیلد الزامی است' })
      .email({ message: trans('invalidEmail') || 'نشانی ایمیل نامعتبر است' })
      .refine((v) => companyEmailRe.test(v), {
        message: trans('errors.invalidCompanyEmail') || 'لطفاً نشانی ایمیل سازمانی معتبر وارد کنید',
      }),
  });
};

export type AccountRequestInput = { email: string };

export const getForgotPasswordSchema = (t?: (key: string) => string) => {
  const trans = t || ((k: string) => k);
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, { message: trans('required') || 'این فیلد الزامی است' })
      .email({ message: trans('invalidEmail') || 'نشانی ایمیل نامعتبر است' }),
  });
};

export type ForgotPasswordInput = { email: string };

export const getResetPasswordSchema = (t?: (key: string) => string) => {
  const trans = t || ((k: string) => k);
  return z
    .object({
      password: z.string().min(6, { message: trans('passwordTooShort') || 'رمز عبور باید حداقل ۶ کاراکتر باشد' }),
      confirmPassword: z.string().min(1, { message: trans('required') || 'این فیلد الزامی است' }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: trans('passwordsDoNotMatch') || 'رمز عبور با تکرار آن مطابقت ندارد',
      path: ['confirmPassword'],
    });
};

export type ResetPasswordInput = { password: string; confirmPassword: string };
