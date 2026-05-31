// src/app/(rtl)/(auth)/forgot-password/page.tsx
import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'بازیابی رمز عبور',
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">فراموشی رمز عبور</CardTitle>
          <CardDescription>
            ایمیل خود را وارد کنید تا لینک بازیابی برایتان ارسال شود.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* This form does not use useSearchParams, so no Suspense needed. */}
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
