// src/components/auth/register-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { registerSchema, type RegisterValues } from '@/lib/validations/auth';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Submit handler: registers via AuthProvider then redirects.
  async function onSubmit(values: RegisterValues) {
    setServerError(null);
    try {
      // confirmPassword is intentionally not sent to the API layer.
      const { confirmPassword, ...payload } = values;
      void confirmPassword;
      await registerUser(payload);
      router.push('/dashboard');
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : 'ثبت‌نام ناموفق بود',
      );
    }
  }

  const isLoading = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نام و نام خانوادگی</FormLabel>
              <FormControl>
                <Input
                  placeholder="مثال: علی رضایی"
                  autoComplete="name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>شماره موبایل</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  inputMode="numeric"
                  placeholder="09xxxxxxxxx"
                  autoComplete="tel"
                  dir="ltr"
                  className="text-start"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رمز عبور</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تکرار رمز عبور</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError && (
          <p className="text-destructive text-sm font-medium">{serverError}</p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="ms-2 size-4 animate-spin" />}
          ثبت‌نام
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          قبلاً ثبت‌نام کرده‌اید؟{' '}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            ورود
          </Link>
        </p>
      </form>
    </Form>
  );
}
