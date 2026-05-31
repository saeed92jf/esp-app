// src/components/auth/forgot-password-form.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MailCheck } from 'lucide-react';
import { forgotPassword } from '@/lib/fake-api';
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
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

export function ForgotPasswordForm() {
  // Tracks whether the reset link was "sent" to switch to the success view.
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    try {
      await forgotPassword(values.email);
      setSubmittedEmail(values.email);
      setSent(true);
    } catch (err) {
      // Surface server-side validation as a field error.
      form.setError('email', {
        message: err instanceof Error ? err.message : 'خطایی رخ داد.',
      });
    }
  }

  // Success state: confirm the link was sent and offer to retry.
  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
          <MailCheck className="text-primary size-6" />
        </div>
        <div className="space-y-1">
          <p className="font-medium">لینک بازیابی ارسال شد</p>
          <p className="text-muted-foreground text-sm">
            اگر حسابی با ایمیل{' '}
            <span className="text-foreground font-medium">
              {submittedEmail}
            </span>{' '}
            وجود داشته باشد، لینک بازیابی برای آن ارسال شده است.
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setSent(false)}
        >
          ارسال مجدد
        </Button>
        <Button asChild variant="link" className="text-sm">
          <Link href="/login">بازگشت به ورود</Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ایمیل</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  dir="ltr"
                  placeholder="you@example.com"
                  autoComplete="email"
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
          ارسال لینک بازیابی
        </Button>

        <Button asChild variant="link" className="w-full text-sm">
          <Link href="/login">بازگشت به ورود</Link>
        </Button>
      </form>
    </Form>
  );
}
