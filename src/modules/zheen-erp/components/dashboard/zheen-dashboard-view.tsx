"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Boxes,
  ChefHat,
  DollarSign,
  CheckSquare,
  Sprout,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  CreditCard,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useZheenStore } from "../../store/zheen-store";

export function ZheenDashboardView() {
  const {
    inventoryItems,
    productionOrders,
    operatingExpenses,
    installments,
    contracts,
    tasks,
    plants,
    waterPlant,
    setActiveTab,
    notifications,
  } = useZheenStore();

  // 1. Calculations
  const totalStockValue = inventoryItems.reduce(
    (acc, item) =>
      acc + item.currentStock * Math.round(item.purchasePrice / (item.unitConversionFactor || 1)),
    0
  );

  const lowStockCount = inventoryItems.filter((i) => i.currentStock <= i.minStockLevel).length;

  const todayProductionCost = productionOrders.reduce((acc, o) => acc + o.totalActualCost, 0);
  const todayPortionsProduced = productionOrders.reduce((acc, o) => acc + o.actualYieldQuantity, 0);

  const totalMonthlyExpenses = operatingExpenses.reduce((acc, e) => acc + e.amount, 0);
  const activeInstallmentsTotal = installments.reduce((acc, i) => acc + i.outstandingBalance, 0);

  const completedTasksCount = tasks.filter((t) => t.status === "Completed").length;
  const plantsNeedingWater = plants.filter((p) => p.status === "DueToday" || p.status === "Overdue");

  return (
    <div className="space-y-5">
      {/* Top Banner with Café Brand & Live System Status */}
      <div className="relative overflow-hidden rounded-lg border border-primary/30 bg-gradient-to-r from-card via-card to-primary/5 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-['Anta'] text-lg font-black tracking-wider text-foreground">
                ZHEEN CAFÉ ENTERPRISE ERP
              </span>
              <Badge className="rounded-md border-emerald-500/30 bg-emerald-500/15 text-[10px] text-emerald-700 dark:text-emerald-300">
                پایگاه‌داده متمرکز و یکپارچه
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              مدیریت زنجیره تامین، خط تولید و فرآوری، بهای تمام‌شده چندکاناله، منابع انسانی و نگهداری کافه ژین
            </p>
          </div>

          {/* Quick Nav Action Pills - Strict low curve rounded-md */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveTab("production")}
              className="h-8 rounded-md text-xs font-semibold border-primary/40 text-primary hover:bg-primary/10 gap-1.5 cursor-pointer"
            >
              <ChefHat className="size-3.5" />
              دستور تولید جدید
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveTab("inventory")}
              className="h-8 rounded-md text-xs font-semibold border-border/70 text-foreground hover:bg-muted gap-1.5 cursor-pointer"
            >
              <Boxes className="size-3.5 text-primary" />
              ورود کالا به انبار
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveTab("plants")}
              className="h-8 rounded-md text-xs font-semibold border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 gap-1.5 cursor-pointer"
            >
              <Sprout className="size-3.5 text-emerald-600" />
              رسیدگی به گیاهان ({plantsNeedingWater.length})
            </Button>
          </div>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. Inventory Asset */}
        <Card className="rounded-lg border border-border/70 bg-card p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold">ارزش کل موجودی انبار:</span>
            <Boxes className="size-4 text-primary" />
          </div>
          <div className="text-xl font-black mt-2 text-foreground fa-num">
            {totalStockValue.toLocaleString("fa-IR")}
            <span className="text-[10px] font-medium ms-1 text-muted-foreground">تومان</span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-1 pt-1 border-t border-border/40">
            <span className="text-muted-foreground">{inventoryItems.length} قلم کالا</span>
            {lowStockCount > 0 ? (
              <span className="text-amber-600 font-bold fa-num">{lowStockCount} قلم کسری!</span>
            ) : (
              <span className="text-emerald-600 font-bold">موجودی کافی</span>
            )}
          </div>
        </Card>

        {/* 2. Today's Production */}
        <Card className="rounded-lg border border-border/70 bg-card p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold">تولیدات شیفت امروز:</span>
            <ChefHat className="size-4 text-primary" />
          </div>
          <div className="text-xl font-black mt-2 text-foreground fa-num">
            {todayPortionsProduced}
            <span className="text-[10px] font-medium ms-1 text-muted-foreground">سروینگ/اسلایس</span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-1 pt-1 border-t border-border/40 text-muted-foreground">
            <span>بهای تمام‌شده:</span>
            <span className="font-bold text-foreground fa-num">
              {todayProductionCost.toLocaleString("fa-IR")} ت
            </span>
          </div>
        </Card>

        {/* 3. Monthly Financial Expenses */}
        <Card className="rounded-lg border border-border/70 bg-card p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold">هزینه‌های جاری ماهانه:</span>
            <DollarSign className="size-4 text-rose-500" />
          </div>
          <div className="text-xl font-black mt-2 text-foreground fa-num">
            {totalMonthlyExpenses.toLocaleString("fa-IR")}
            <span className="text-[10px] font-medium ms-1 text-muted-foreground">تومان</span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-1 pt-1 border-t border-border/40 text-muted-foreground">
            <span>اجاره، قبوض، IT</span>
            <span className="text-primary font-bold">تفکیک شفاف</span>
          </div>
        </Card>

        {/* 4. Active Tasks & Checklists */}
        <Card className="rounded-lg border border-border/70 bg-card p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold">چک‌لیست‌های افتتاحیه/اختتامیه:</span>
            <CheckSquare className="size-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black mt-2 text-emerald-600 dark:text-emerald-400 fa-num">
            {completedTasksCount} / {tasks.length}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-1 pt-1 border-t border-border/40 text-muted-foreground">
            <span>تسک‌های تاییدشده:</span>
            <span className="font-bold text-foreground fa-num">
              {tasks.filter((t) => t.managerVerified).length} مورد
            </span>
          </div>
        </Card>

        {/* 5. Plant Watering Status */}
        <Card className="rounded-lg border border-border/70 bg-card p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold">گیاهان نیازمند آب:</span>
            <Sprout className="size-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black mt-2 text-foreground fa-num">
            {plantsNeedingWater.length}
            <span className="text-[10px] font-medium ms-1 text-muted-foreground">گلدان</span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-1 pt-1 border-t border-border/40">
            <span className="text-muted-foreground">کل گلدان‌ها: {plants.length}</span>
            {plantsNeedingWater.some((p) => p.status === "Overdue") ? (
              <span className="text-destructive font-black">هشدار تاخیر!</span>
            ) : (
              <span className="text-emerald-600 font-bold">وضعیت شاداب</span>
            )}
          </div>
        </Card>
      </div>

      {/* Central Notification & Alert Ticker */}
      {notifications.length > 0 && (
        <Card className="rounded-lg border border-border/70 bg-muted/30 p-3.5">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-amber-500 animate-ping" />
              <h4 className="text-xs font-bold text-foreground">مرکز هشدارهای هوشمند سامانه</h4>
              <Badge variant="outline" className="text-[10px] rounded-md py-0 fa-num">
                {notifications.length} رویداد فعال
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground">بررسی و اقدام فوری</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {notifications.slice(0, 6).map((notif) => (
              <div
                key={notif.id}
                onClick={() => setActiveTab(notif.linkTab)}
                className="flex items-start gap-2.5 p-2 rounded-md bg-card border border-border/60 hover:border-primary/50 transition-colors cursor-pointer group"
              >
                <div
                  className={cn(
                    "size-7 rounded-md shrink-0 flex items-center justify-center mt-0.5",
                    notif.severity === "destructive" && "bg-destructive/15 text-destructive",
                    notif.severity === "warning" && "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                    notif.severity === "info" && "bg-primary/15 text-primary"
                  )}
                >
                  <AlertTriangle className="size-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h5 className="text-[11px] font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {notif.title}
                    </h5>
                    <span className="text-[9px] text-muted-foreground shrink-0">{notif.timestamp}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5 leading-relaxed">
                    {notif.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Split: Left (Production & Costing) / Right (Plant care & Tasks) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT 2 COLS: Production Orders & Inventory Criticals */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recent Production Batch Orders */}
          <Card className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-xs">
            <CardHeader className="p-3.5 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <ChefHat className="size-4 text-primary" />
                <CardTitle className="text-xs font-bold">آخرین بچ‌های تولید و فرآوری</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("production")}
                className="h-7 px-2 text-[11px] text-primary hover:bg-primary/10 rounded-md cursor-pointer"
              >
                مشاهده همه
                <ArrowLeft className="size-3 ms-1" />
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead className="bg-muted/40 text-muted-foreground font-bold border-b border-border/50">
                    <tr>
                      <th className="p-2.5 text-start">شماره بچ</th>
                      <th className="p-2.5 text-start">نام محصول</th>
                      <th className="p-2.5 text-start">تعداد برنامه‌ریزی / واقعی</th>
                      <th className="p-2.5 text-start">هزینه کل مواد + دستمزد</th>
                      <th className="p-2.5 text-start">بهای تمام‌شده هر اسلایس</th>
                      <th className="p-2.5 text-start">ضایعات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {productionOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-2.5 font-mono text-[11px] text-muted-foreground">{ord.orderNumber}</td>
                        <td className="p-2.5 font-bold text-foreground">{ord.recipeName}</td>
                        <td className="p-2.5 font-bold text-foreground fa-num">
                          {ord.plannedQuantity} / {ord.actualYieldQuantity} {ord.yieldUnit}
                        </td>
                        <td className="p-2.5 font-bold text-foreground fa-num">
                          {ord.totalActualCost.toLocaleString("fa-IR")} تومان
                        </td>
                        <td className="p-2.5 font-black text-primary fa-num">
                          {ord.actualCostPerPortion.toLocaleString("fa-IR")} تومان
                        </td>
                        <td className="p-2.5">
                          {ord.wasteQuantity > 0 ? (
                            <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[10px] rounded-md py-0.5 fa-num">
                              {ord.wasteQuantity} عدد ({ord.wasteReason})
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] rounded-md py-0.5">
                              بدون ضایعات
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Critical Inventory Low-Stock Items */}
          <Card className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-xs">
            <CardHeader className="p-3.5 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="size-4 text-primary" />
                <CardTitle className="text-xs font-bold">اقلام زیر نقطه سفارش بحرانی انبار</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("inventory")}
                className="h-7 px-2 text-[11px] text-primary hover:bg-primary/10 rounded-md cursor-pointer"
              >
                مدیریت کاردکس
                <ArrowLeft className="size-3 ms-1" />
              </Button>
            </CardHeader>

            <CardContent className="p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {inventoryItems.slice(0, 4).map((item) => {
                  const isLow = item.currentStock <= item.minStockLevel;
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "p-2.5 rounded-md border flex items-center justify-between gap-2 text-xs",
                        isLow ? "bg-amber-500/10 border-amber-500/30" : "bg-muted/20 border-border/50"
                      )}
                    >
                      <div>
                        <span className="font-bold text-foreground block">{item.name}</span>
                        <span className="text-[10px] text-muted-foreground">{item.storageLocation}</span>
                      </div>
                      <div className="text-end">
                        <span className="font-mono font-bold text-foreground block fa-num">
                          {item.currentStock.toLocaleString("fa-IR")} {item.baseUnit}
                        </span>
                        <span className="text-[10px] text-muted-foreground block fa-num">
                          نقطه سفارش: {item.minStockLevel.toLocaleString("fa-IR")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT 1 COL: Plants & Operations Checklist */}
        <div className="space-y-4">
          {/* Plants Care Widget */}
          <Card className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-xs">
            <CardHeader className="p-3.5 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Sprout className="size-4 text-emerald-600" />
                <CardTitle className="text-xs font-bold">برنامه آبیاری و نگهداری گیاهان</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("plants")}
                className="h-7 px-2 text-[11px] text-primary hover:bg-primary/10 rounded-md cursor-pointer"
              >
                مشاهده همه
                <ArrowLeft className="size-3 ms-1" />
              </Button>
            </CardHeader>

            <CardContent className="p-3 space-y-2">
              {plants.map((plt) => {
                const isDue = plt.status === "DueToday";
                const isOverdue = plt.status === "Overdue";
                return (
                  <div
                    key={plt.id}
                    className={cn(
                      "p-2 rounded-md border flex items-center justify-between gap-2 text-xs transition-colors",
                      isOverdue
                        ? "bg-destructive/10 border-destructive/30"
                        : isDue
                        ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-muted/20 border-border/40"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{plt.photoEmoji}</span>
                      <div className="min-w-0">
                        <h6 className="font-bold text-foreground text-[11px] truncate">{plt.name}</h6>
                        <span className="text-[10px] text-muted-foreground block truncate">
                          {plt.location} (هر {plt.wateringIntervalDays} روز)
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {isDue || isOverdue ? (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => waterPlant(plt.id, "کاربر سامانه")}
                          className="h-7 px-2 text-[10px] font-bold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                        >
                          ثبت آبیاری
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-[10px] rounded-md py-0.5 text-muted-foreground">
                          موعد: {plt.nextWateredDate}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Daily Checklist Snapshot */}
          <Card className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-xs">
            <CardHeader className="p-3.5 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="size-4 text-primary" />
                <CardTitle className="text-xs font-bold">چک‌لیست‌های افتتاحیه و شیفت</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("operations")}
                className="h-7 px-2 text-[11px] text-primary hover:bg-primary/10 rounded-md cursor-pointer"
              >
                تمام تسک‌ها
                <ArrowLeft className="size-3 ms-1" />
              </Button>
            </CardHeader>

            <CardContent className="p-3 space-y-2">
              {tasks.slice(0, 4).map((t) => {
                const isDone = t.status === "Completed";
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/20 border border-border/40 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={cn(
                          "size-5 rounded-md flex items-center justify-center shrink-0 border",
                          isDone
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-border/80 bg-background"
                        )}
                      >
                        {isDone && <CheckCircle2 className="size-3.5" />}
                      </div>
                      <span
                        className={cn(
                          "font-medium truncate text-[11px]",
                          isDone ? "line-through text-muted-foreground" : "text-foreground"
                        )}
                      >
                        {t.title}
                      </span>
                    </div>

                    <span className="text-[10px] text-muted-foreground shrink-0 fa-num">
                      {t.dueTime}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
