// src/app/(rtl)/register/page.tsx
import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'ثبت‌نام',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ایجاد حساب کاربری</CardTitle>
          <CardDescription>
            برای ساخت حساب جدید، فرم زیر را تکمیل کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
