// src/app/(rtl)/(auth)/login/page.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Loader2 } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'ورود',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ورود به حساب</CardTitle>
          <CardDescription>
            برای ادامه، ایمیل و رمز عبور خود را وارد کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* LoginForm reads ?redirect via useSearchParams. */}
          <Suspense
            fallback={
              <div className="flex justify-center py-6">
                <Loader2 className="text-muted-foreground size-6 animate-spin" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
