// src/app/(rtl)/(auth)/reset-password/page.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Loader2 } from 'lucide-react';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'تغییر رمز عبور',
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">تنظیم رمز عبور جدید</CardTitle>
          <CardDescription>
            رمز عبور جدید خود را وارد و تأیید کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* ResetPasswordForm reads ?token via useSearchParams. */}
          <Suspense
            fallback={
              <div className="flex justify-center py-6">
                <Loader2 className="text-muted-foreground size-6 animate-spin" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
