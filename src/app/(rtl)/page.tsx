// src/app/(rtl)/page.tsx
import Link from 'next/link';
import { ArrowLeft, Gauge, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Static feature data. Kept outside the component so it isn't re-created
// on every render and stays easy to extend later.
const FEATURES = [
  {
    icon: Zap,
    title: 'اتصال بی‌درنگ',
    description: 'ارتباط لحظه‌ای با دستگاه‌های ESP از طریق WebSocket.',
  },
  {
    icon: Gauge,
    title: 'پایش زنده',
    description: 'نمایش وضعیت سنسورها و مصرف انرژی به صورت آنی.',
  },
  {
    icon: ShieldCheck,
    title: 'امنیت داده',
    description: 'احراز هویت امن و رمزنگاری ارتباطات کاربری.',
  },
] as const;

// Landing page (RTL group). Server Component by default — no client hooks
// needed here, which keeps the initial payload small.
export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 py-12">
      {/* Hero section */}
      <section className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          مدیریت هوشمند دستگاه‌های شما
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg text-balance">
          پلتفرمی یکپارچه برای کنترل، پایش و مدیریت دستگاه‌های ESP در یک داشبورد
          ساده و سریع.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/dashboard">
              شروع کنید
              {/* Logical icon: points to the reading direction's "forward" */}
              <ArrowLeft className="ms-2 size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">ورود به حساب</Link>
          </Button>
        </div>
      </section>

      {/* Features grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardHeader>
              <Icon className="text-primary size-8" />
              <CardTitle className="mt-2">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}
