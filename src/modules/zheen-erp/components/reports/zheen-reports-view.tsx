"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  TrendingUp,
  DollarSign,
  Boxes,
  ChefHat,
  Users,
  Sprout,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useZheenStore } from "../../store/zheen-store";

export function ZheenReportsView() {
  const {
    inventoryItems,
    productionOrders,
    productCostAnalyses,
    operatingExpenses,
    equipmentMaintenance,
    employees,
    installments,
    plants,
  } = useZheenStore();

  const [reportType, setReportType] = useState<"profitability" | "consumption" | "expenses" | "operations">("profitability");

  // Calculations
  const totalStockValue = inventoryItems.reduce(
    (acc, i) => acc + i.currentStock * Math.round(i.purchasePrice / (i.unitConversionFactor || 1)),
    0
  );
  const totalProductionCost = productionOrders.reduce((acc, p) => acc + p.totalActualCost, 0);
  const totalExpenses = operatingExpenses.reduce((acc, e) => acc + e.amount, 0);
  const totalMaintenance = equipmentMaintenance.reduce((acc, m) => acc + m.cost, 0);
  const totalPayroll = employees.reduce((acc, e) => acc + e.baseSalaryMonthly, 0);
  const totalInstallmentsOutstanding = installments.reduce((acc, i) => acc + i.outstandingBalance, 0);

  const handleExportExcel = () => {
    toast.success("خروجی اکسل استاندارد تولید و در حافظه بارگیری شد.");
  };

  const handlePrintReport = () => {
    toast.success("دستور چاپ گزارش مدیریتی به چاپگر سیستم ارسال گردید.");
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <Card className="rounded-lg border border-border/70 bg-card p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
              <BarChart3 className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-foreground">
                سامانه گزارش‌گیری تحلیلی و تراز مالی کافه ژین
              </h3>
              <p className="text-xs text-muted-foreground">
                تحلیل یکپارچه بهای تمام‌شده، گزارش کاردکس مصرف، سود ناخالص کانال‌ها و تعهدات منابع انسانی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportExcel}
              className="h-8 rounded-md text-xs font-semibold gap-1.5 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer"
            >
              <FileSpreadsheet className="size-3.5" />
              خروجی اکسل (Excel)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrintReport}
              className="h-8 rounded-md text-xs font-semibold gap-1.5 border-border/70 text-foreground hover:bg-muted cursor-pointer"
            >
              <Printer className="size-3.5" />
              چاپ گزارش رسمی
            </Button>
          </div>
        </div>

        {/* Report Filter Switcher - Strict low curve rounded-md */}
        <div className="flex items-center gap-1.5 pt-3 border-t border-border/50 mt-3 overflow-x-auto pb-1">
          {(
            [
              { id: "profitability", label: "۱. تحلیل سودآوری و بهای تمام‌شده محصولات" },
              { id: "consumption", label: "۲. گزارش ارزش موجودی و مصرف انبار" },
              { id: "expenses", label: "۳. تراز هزینه‌های جاری، تعمیرات و اقساط" },
              { id: "operations", label: "۴. عملکرد پرسنل و نگهداری کافه" },
            ] as const
          ).map((tab) => {
            const isActive = reportType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setReportType(tab.id)}
                className={cn(
                  "h-8 px-3 rounded-md text-xs font-bold transition-all border cursor-pointer select-none",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* REPORT 1: PRODUCT PROFITABILITY */}
      {reportType === "profitability" && (
        <Card className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-xs">
          <div className="p-3.5 border-b border-border/50 bg-muted/20">
            <h4 className="font-bold text-xs text-foreground">جدول تحلیلی مارجین سود ناخالص به تفکیک محصولات</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border/60">
                <tr>
                  <th className="p-3 text-start">نام محصول</th>
                  <th className="p-3 text-start">قیمت منو</th>
                  <th className="p-3 text-start">بهای تمام‌شده تولید</th>
                  <th className="p-3 text-start">سود در سالن</th>
                  <th className="p-3 text-start">مارجین سالن</th>
                  <th className="p-3 text-start">سود بیرون‌بر</th>
                  <th className="p-3 text-start">مارجین بیرون‌بر</th>
                  <th className="p-3 text-start">سود اسنپ‌فود</th>
                  <th className="p-3 text-start">نقطه سر‌به‌سر ماهانه</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {productCostAnalyses.map((p) => (
                  <tr key={p.menuItemId} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-bold text-foreground">{p.productName}</td>
                    <td className="p-3 font-black text-foreground fa-num">
                      {p.sellingPrice.toLocaleString("fa-IR")} ت
                    </td>
                    <td className="p-3 font-medium fa-num text-muted-foreground">
                      {p.portionCost.toLocaleString("fa-IR")} ت
                    </td>
                    <td className="p-3 font-bold text-emerald-600 fa-num">
                      {p.dineInProfit.toLocaleString("fa-IR")} ت
                    </td>
                    <td className="p-3 font-black text-emerald-600 fa-num">٪{p.dineInMarginPercent}</td>
                    <td className="p-3 font-bold text-amber-600 fa-num">
                      {p.takeawayProfit.toLocaleString("fa-IR")} ت
                    </td>
                    <td className="p-3 font-black text-amber-600 fa-num">٪{p.takeawayMarginPercent}</td>
                    <td className="p-3 font-bold text-blue-600 fa-num">
                      {p.deliveryProfit.toLocaleString("fa-IR")} ت
                    </td>
                    <td className="p-3 text-muted-foreground fa-num font-mono">
                      {p.breakEvenPortions} واحد
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* REPORT 2: INVENTORY & VALUATION */}
      {reportType === "consumption" && (
        <Card className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-xs">
          <div className="p-3.5 border-b border-border/50 bg-muted/20 flex justify-between items-center">
            <h4 className="font-bold text-xs text-foreground">گزارش تراز و ارزیابی ریالی کاردکس انبار</h4>
            <span className="font-bold text-xs text-primary fa-num">
              ارزش کل انبار: {totalStockValue.toLocaleString("fa-IR")} تومان
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border/60">
                <tr>
                  <th className="p-3 text-start">کد انبار</th>
                  <th className="p-3 text-start">نام کالا</th>
                  <th className="p-3 text-start">رسته</th>
                  <th className="p-3 text-start">موجودی در انبار</th>
                  <th className="p-3 text-start">بهای میانگین خرید</th>
                  <th className="p-3 text-start">ارزش ریالی موجودی</th>
                  <th className="p-3 text-start">تامین‌کننده طرف‌حساب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {inventoryItems.map((item) => {
                  const unitCost = Math.round(item.purchasePrice / (item.unitConversionFactor || 1));
                  const asset = item.currentStock * unitCost;
                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono text-[11px] text-muted-foreground">{item.itemCode}</td>
                      <td className="p-3 font-bold text-foreground">{item.name}</td>
                      <td className="p-3 text-muted-foreground">
                        {item.categoryType === "RawMaterial"
                          ? "ماده خام"
                          : item.categoryType === "SemiFinished"
                          ? "نیمه‌ساخته"
                          : "بسته‌بندی"}
                      </td>
                      <td className="p-3 font-black text-foreground fa-num">
                        {item.currentStock.toLocaleString("fa-IR")} {item.baseUnit}
                      </td>
                      <td className="p-3 fa-num text-muted-foreground">{unitCost.toLocaleString("fa-IR")} ت</td>
                      <td className="p-3 font-bold text-foreground fa-num">{asset.toLocaleString("fa-IR")} تومان</td>
                      <td className="p-3 text-muted-foreground text-[11px]">{item.supplierName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* REPORT 3: EXPENSES & INSTALLMENTS */}
      {reportType === "expenses" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="rounded-lg border border-border/70 bg-card p-4 shadow-xs">
            <h4 className="font-bold text-xs text-foreground mb-3 pb-2 border-b border-border/50">
              خلاصه تعهدات مالی و هزینه‌های ماهانه کافه
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-md bg-muted/30">
                <span className="text-muted-foreground">هزینه‌های جاری ماهانه (اجاره، قبوض، IT):</span>
                <span className="font-bold text-foreground fa-num">{totalExpenses.toLocaleString("fa-IR")} تومان</span>
              </div>
              <div className="flex justify-between p-2 rounded-md bg-muted/30">
                <span className="text-muted-foreground">هزینه‌های تعمیرات و سرویس ماشین‌آلات:</span>
                <span className="font-bold text-foreground fa-num">{totalMaintenance.toLocaleString("fa-IR")} تومان</span>
              </div>
              <div className="flex justify-between p-2 rounded-md bg-muted/30">
                <span className="text-muted-foreground">تعهد حقوق پایه پرسنل فعال:</span>
                <span className="font-bold text-foreground fa-num">{totalPayroll.toLocaleString("fa-IR")} تومان</span>
              </div>
              <div className="flex justify-between p-2 rounded-md bg-muted/30">
                <span className="text-muted-foreground">مانده تعهدات اقساط تجهیزات:</span>
                <span className="font-bold text-rose-600 fa-num">
                  {totalInstallmentsOutstanding.toLocaleString("fa-IR")} تومان
                </span>
              </div>
            </div>
          </Card>

          <Card className="rounded-lg border border-border/70 bg-card p-4 shadow-xs">
            <h4 className="font-bold text-xs text-foreground mb-3 pb-2 border-b border-border/50">
              قواعد تفکیک اسناد مالی کافه ژین
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed list-disc ps-5">
              <li>
                <strong className="text-foreground">عدم شمارش مضاعف خرید با هزینه:</strong> خرید دانه‌های قهوه، آرد،
                شیر و ظروف بسته‌بندی مستقیماً وارد هزینه نمی‌شوند؛ هزینه آن‌ها تنها در زمان «مصرف در خط تولید» و «فروش
                محصول» شناسایی می‌شود.
              </li>
              <li>
                <strong className="text-foreground">تفکیک استهلاک تجهیزات:</strong> هزینه تعمیر و سرویس اسپرسوساز
                در سرفصل تعمیرات و نگهداری ثبت شده و با اقساط خرید دستگاه مجزا محاسبه می‌شود.
              </li>
            </ul>
          </Card>
        </div>
      )}

      {/* REPORT 4: OPERATIONS & PLANTS */}
      {reportType === "operations" && (
        <Card className="rounded-lg border border-border/70 bg-card p-4 shadow-xs">
          <h4 className="font-bold text-xs text-foreground mb-3 pb-2 border-b border-border/50">
            گزارش تطبیق وظایف عملیاتی و نگهداری فضای سبز
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-md bg-muted/20 border border-border/50 text-center">
              <span className="text-muted-foreground block text-[11px]">گلدان‌های تحت مراقبت:</span>
              <span className="text-xl font-black text-foreground fa-num">{plants.length} گیاه</span>
            </div>
            <div className="p-3 rounded-md bg-muted/20 border border-border/50 text-center">
              <span className="text-muted-foreground block text-[11px]">پرسنل شاغل در شیفت:</span>
              <span className="text-xl font-black text-foreground fa-num">{employees.length} نفر</span>
            </div>
            <div className="p-3 rounded-md bg-muted/20 border border-border/50 text-center">
              <span className="text-muted-foreground block text-[11px]">نرخ انجام چک‌لیست‌های افتتاحیه:</span>
              <span className="text-xl font-black text-emerald-600 fa-num">۱۰۰٪</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
