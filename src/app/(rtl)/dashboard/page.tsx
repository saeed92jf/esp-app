// src/app/(rtl)/dashboard/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User2, Activity, Bell } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Sign out then send the user back to the login screen.
  function handleLogout() {
    logout();
    router.replace('/login');
  }

  // Small summary cards shown on the dashboard landing.
  const stats = [
    { title: 'فعالیت‌ها', value: '۱۲', icon: Activity },
    { title: 'اعلان‌ها', value: '۳', icon: Bell },
    { title: 'پروفایل', value: 'تکمیل', icon: User2 },
  ];

  return (
    <div className="space-y-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            خوش آمدید، {user?.fullName ?? 'کاربر'}
          </h1>
          <p className="text-muted-foreground text-sm">
            این نمای کلی حساب کاربری شماست.
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="ms-2 size-4" />
          خروج
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <item.icon className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>اطلاعات حساب</CardTitle>
          <CardDescription>جزئیات حساب کاربری فعلی</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">نام</span>
            <span className="font-medium">{user?.fullName}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">شماره موبایل</span>
            <span className="font-medium" dir="ltr">
              {user?.phone}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">شناسه کاربر</span>
            <span className="font-mono text-xs" dir="ltr">
              {user?.id}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
