"use client";

import React from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CreditCard,
  PieChart,
  BarChart3,
  UtensilsCrossed,
  ArrowUpRight,
  Star,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Order, MenuItem } from "../types";

interface ReportsViewProps {
  orders: Order[];
  menuItems: MenuItem[];
}

export function ReportsView({ orders, menuItems }: ReportsViewProps) {
  const totalRevenue = orders.reduce((acc, o) => acc + o.grandTotal, 0);
  const totalItemsSold = orders.reduce(
    (acc, o) => acc + o.items.reduce((sum, i) => sum + i.quantity, 0),
    0
  );
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  // Breakdown by channel
  const channelBreakdown = {
    DineIn: orders.filter((o) => o.type === "DineIn").reduce((acc, o) => acc + o.grandTotal, 0),
    Takeaway: orders.filter((o) => o.type === "Takeaway").reduce((acc, o) => acc + o.grandTotal, 0),
    Delivery: orders.filter((o) => o.type === "Delivery").reduce((acc, o) => acc + o.grandTotal, 0),
    SnappFood: orders.filter((o) => o.type === "SnappFood").reduce((acc, o) => acc + o.grandTotal, 0),
  };

  // Top items
  const itemCounts: Record<string, number> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
    });
  });

  const sortedItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border border-border/70 rounded-lg p-3.5 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">کل فروش امروز:</span>
            <DollarSign className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-black mt-2 text-primary fa-num">
            {totalRevenue.toLocaleString("fa-IR")}
            <span className="text-xs font-medium ms-1">تومان</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <ArrowUpRight className="size-3" />
            +۱۸.۴٪ نسبت به روز گذشته
          </p>
        </Card>

        <Card className="border border-border/70 rounded-lg p-3.5 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">تعداد فاکتورهای صادره:</span>
            <ShoppingBag className="size-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black mt-2 text-foreground fa-num">{orders.length} فاکتور</div>
          <p className="text-[11px] text-muted-foreground mt-1 fa-num">مجموع {totalItemsSold} سروینگ</p>
        </Card>

        <Card className="border border-border/70 rounded-lg p-3.5 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">میانگین مبلغ هر سفارش:</span>
            <TrendingUp className="size-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black mt-2 text-foreground fa-num">
            {avgOrderValue.toLocaleString("fa-IR")}
            <span className="text-xs font-medium ms-1">تومان</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">شاخص سبد خرید مشتریان</p>
        </Card>

        <Card className="border border-border/70 rounded-lg p-3.5 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">تسویه کارتخوان PC-POS:</span>
            <CreditCard className="size-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black mt-2 text-purple-600 dark:text-purple-400 fa-num">
            ٪۸۴.۵
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">سهم تراکنش‌های الکترونیک بانکی</p>
        </Card>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales by Channel */}
        <Card className="border border-border/70 bg-card rounded-lg p-4 shadow-xs">
          <CardHeader className="p-0 pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <PieChart className="size-4 text-primary" />
              توزیع درآمد بر اساس کانال‌های فروش
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 pt-3 space-y-3">
            {[
              { label: "سرو در سالن کافه", value: channelBreakdown.DineIn, color: "bg-primary" },
              { label: "سفارش آنلاین اسنپ‌فود", value: channelBreakdown.SnappFood, color: "bg-pink-600" },
              { label: "تحویل بیرون‌بر (Takeaway)", value: channelBreakdown.Takeaway, color: "bg-amber-600" },
              { label: "ارسال اختصاصی پیک کافه", value: channelBreakdown.Delivery, color: "bg-emerald-600" },
            ].map((ch, idx) => {
              const pct = totalRevenue > 0 ? Math.round((ch.value / totalRevenue) * 100) : 0;
              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="font-medium text-foreground">{ch.label}</span>
                    <span className="font-mono fa-num">
                      {ch.value.toLocaleString("fa-IR")} تومان (٪{pct})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-md bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-md transition-all", ch.color)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Top 5 Products */}
        <Card className="border border-border/70 bg-card rounded-lg p-4 shadow-xs">
          <CardHeader className="p-0 pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Star className="size-4 text-amber-500 fill-amber-500" />
              محبوب‌ترین و پرفروش‌ترین اقلام منو
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 pt-3 space-y-2.5">
            {sortedItems.map(([name, count], idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-md bg-muted/40 border border-border/40 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary border-primary/30 size-6 p-0 rounded-md flex items-center justify-center font-bold fa-num">
                    {idx + 1}
                  </Badge>
                  <span className="font-bold text-foreground">{name}</span>
                </div>
                <div className="flex items-center gap-1 font-bold text-muted-foreground">
                  <span className="fa-num">{count}</span>
                  <span>سفارش</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
