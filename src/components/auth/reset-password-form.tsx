// src/components/auth/reset-password-form.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { resetPassword } from '@/lib/fake-api';
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from '@/lib/validations/auth';
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

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // The reset token arrives as ?token=... from the emailed link.
  const token = searchParams.get('token') ?? '';

  const [done, setDone] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  async function onSubmit(values: ResetPasswordValues) {
    try {
      await resetPassword({ token, password: values.password });
      setDone(true);
      // Send the user to login shortly after the success message shows.
      setTimeout(() => router.replace('/login'), 1500);
    } catch (err) {
      form.setError('password', {
        message: err instanceof Error ? err.message : 'خطایی رخ داد.',
      });
    }
  }

  // Guard: if the link has no token at all, block the form early.
  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground text-sm">
          لینک بازیابی نامعتبر است. لطفاً دوباره درخواست دهید.
        </p>
        <Button asChild className="w-full">
          <Link href="/forgot-password">درخواست لینک جدید</Link>
        </Button>
      </div>
    );
  }

  // Success state after the password is changed.
  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="text-primary size-10" />
        <p className="font-medium">رمز عبور با موفقیت تغییر کرد</p>
        <p className="text-muted-foreground text-sm">
          در حال انتقال به صفحه ورود...
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رمز عبور جدید</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  dir="ltr"
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
                  dir="ltr"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting && (
            <Loader2 className="size-4 animate-spin" />
          )}
          تغییر رمز عبور
        </Button>
      </form>
    </Form>
  );
}
