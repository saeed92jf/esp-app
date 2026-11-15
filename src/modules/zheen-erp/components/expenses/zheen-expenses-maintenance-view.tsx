"use client";

import React, { useState } from "react";
import {
  DollarSign,
  Wrench,
  CreditCard,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Building,
  Zap,
  Wifi,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useZheenStore } from "../../store/zheen-store";
import { ExpenseCategory, RecurrenceType } from "../../types/zheen-types";

export function ZheenExpensesMaintenanceView() {
  const {
    operatingExpenses,
    equipmentMaintenance,
    installments,
    payExpense,
    addOperatingExpense,
    addMaintenanceRecord,
    completeMaintenance,
    payInstallment,
    setActiveTab: setGlobalErpTab,
  } = useZheenStore();

  const [activeTab, setActiveTab] = useState<"expenses" | "maintenance" | "installments">("expenses");

  // Add expense modal state
  const [showAddExpenseModal, setShowAddExpenseModal] = useState<boolean>(false);
  const [expTitle, setExpTitle] = useState<string>("");
  const [expCat, setExpCat] = useState<ExpenseCategory>("Electricity");
  const [expAmount, setExpAmount] = useState<number>(5000000);
  const [expDueDate, setExpDueDate] = useState<string>("1404/08/30");
  const [expRecurrence, setExpRecurrence] = useState<RecurrenceType>("Monthly");
  const [expNotes, setExpNotes] = useState<string>("");

  // Add maintenance modal state
  const [showAddMaintModal, setShowAddMaintModal] = useState<boolean>(false);
  const [maintEquipment, setMaintEquipment] = useState<string>("");
  const [maintDesc, setMaintDesc] = useState<string>("");
  const [maintProvider, setMaintProvider] = useState<string>("");
  const [maintPhone, setMaintPhone] = useState<string>("");
  const [maintCost, setMaintCost] = useState<number>(4500000);
  const [maintDate, setMaintDate] = useState<string>("1404/08/25");

  const handleSaveExpense = () => {
    if (!expTitle.trim() || expAmount <= 0) {
      toast.error("لطفاً عنوان و مبلغ هزینه را به درستی وارد فرمایید.");
      return;
    }

    addOperatingExpense({
      title: expTitle,
      category: expCat,
      categoryTitleFa:
        expCat === "Rent"
          ? "اجاره ملک"
          : expCat === "Electricity"
          ? "برق"
          : expCat === "Internet"
          ? "اینترنت"
          : "هزینه عمومی",
      amount: expAmount,
      dueDate: expDueDate,
      paymentStatus: "Pending",
      recurrence: expRecurrence,
      notes: expNotes,
    });

    setShowAddExpenseModal(false);
  };

  const handleSaveMaintenance = () => {
    if (!maintEquipment.trim() || maintCost <= 0) {
      toast.error("نام دستگاه و هزینه را مشخص فرمایید.");
      return;
    }

    addMaintenanceRecord({
      equipmentName: maintEquipment,
      serviceDescription: maintDesc,
      serviceProvider: maintProvider,
      servicePhone: maintPhone,
      serviceDate: maintDate,
      cost: maintCost,
      status: "Completed",
    });

    setShowAddMaintModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Switcher */}
      <Card className="rounded-lg border border-border/70 bg-card p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
              <DollarSign className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-foreground">
                هزینه‌های جاری ماهانه، تعمیرات و تعهدات اقساط
              </h3>
              <p className="text-xs text-muted-foreground">
                مدیریت قبوض، اجاره، سرویس‌های دوره‌ای ماشین‌آلات و برنامه تسویه اقساط تجهیزات
              </p>
            </div>
          </div>

          {/* Subtab Buttons - STRICT LOW CURVE rounded-md */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-md bg-muted/60 border border-border/60">
            {(
              [
                { id: "expenses", label: `هزینه‌های جاری ماهانه (${operatingExpenses.length})` },
                { id: "maintenance", label: `تعمیر و نگهداری تجهیزات (${equipmentMaintenance.length})` },
                { id: "installments", label: `اقساط و تعهدات مالی (${installments.length})` },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "h-8 px-3 rounded-md text-xs font-bold transition-all border cursor-pointer select-none",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                      : "bg-background text-muted-foreground border-border/60 hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accounting Standard Distinction Alert */}
        <div className="mt-3 pt-3 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-md bg-muted/40 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="size-2 rounded-full bg-amber-500 shrink-0" />
            <span>
              <strong className="text-foreground">تمایز استاندارد حسابداری:</strong> هزینه‌های این بخش مربوط به مخارج جاری دوره (OPEX نظیر قبوض و اجاره) و استهلاک تجهیزات است. هزینه‌های جانبی مستقیم خرید مواد اولیه (کرایه باربری، انعام و تخلیه) در بخش مجزای «هزینه‌های جانبی انبار (Landed Costs)» بر بهای تمام‌شده کالاها سرشکن می‌شوند.
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setGlobalErpTab("inventory")}
            className="h-7 px-2.5 rounded-md text-[11px] font-bold text-amber-700 dark:text-amber-300 border-amber-500/40 hover:bg-amber-500/10 shrink-0 cursor-pointer"
          >
            مشاهده هزینه‌های جانبی خرید (Landed Costs) ←
          </Button>
        </div>
      </Card>

      {/* TAB 1: OPERATING EXPENSES */}
      {activeTab === "expenses" && (
        <Card className="rounded-lg border border-border/70 bg-card shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-border/50 bg-muted/20 flex items-center justify-between">
            <h4 className="font-bold text-xs text-foreground">جدول هزینه‌های جاری و قبوض ماهانه</h4>
            <Button
              size="sm"
              variant="default"
              onClick={() => setShowAddExpenseModal(true)}
              className="h-8 px-3 rounded-md text-xs font-bold gap-1.5 bg-primary text-primary-foreground cursor-pointer"
            >
              <Plus className="size-3.5" />
              ثبت هزینه جدید
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border/60">
                <tr>
                  <th className="p-3 text-start">شرح هزینه</th>
                  <th className="p-3 text-start">سرفصل</th>
                  <th className="p-3 text-start">دوره تکرار</th>
                  <th className="p-3 text-start">مبلغ ریالی</th>
                  <th className="p-3 text-start">سررسید پرداخت</th>
                  <th className="p-3 text-start">وضعیت تسویه</th>
                  <th className="p-3 text-start">توضیحات</th>
                  <th className="p-3 text-end">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {operatingExpenses.map((exp) => {
                  const isPaid = exp.paymentStatus === "Paid";
                  return (
                    <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-bold text-foreground">{exp.title}</td>
                      <td className="p-3 text-muted-foreground">{exp.categoryTitleFa}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px] rounded-md py-0">
                          {exp.recurrence === "Monthly"
                            ? "ماهانه"
                            : exp.recurrence === "Yearly"
                            ? "سالانه"
                            : "یک‌باره"}
                        </Badge>
                      </td>
                      <td className="p-3 font-black text-foreground fa-num">
                        {exp.amount.toLocaleString("fa-IR")} تومان
                      </td>
                      <td className="p-3 text-muted-foreground fa-num">{exp.dueDate}</td>
                      <td className="p-3">
                        {isPaid ? (
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] rounded-md py-0.5">
                            پرداخت شده ({exp.paymentDate})
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] rounded-md py-0.5">
                            در انتظار پرداخت
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground text-[11px]">{exp.notes || "-"}</td>
                      <td className="p-3 text-end">
                        {!isPaid && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => payExpense(exp.id)}
                            className="h-7 px-2.5 rounded-md text-[11px] font-semibold border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer"
                          >
                            <CheckCircle2 className="size-3 me-1 text-emerald-600" />
                            ثبت پرداخت
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: EQUIPMENT MAINTENANCE */}
      {activeTab === "maintenance" && (
        <Card className="rounded-lg border border-border/70 bg-card shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-border/50 bg-muted/20 flex items-center justify-between">
            <h4 className="font-bold text-xs text-foreground">شناسنامه تعمیر و نگهداری ماشین‌آلات کافه</h4>
            <Button
              size="sm"
              variant="default"
              onClick={() => setShowAddMaintModal(true)}
              className="h-8 px-3 rounded-md text-xs font-bold gap-1.5 bg-primary text-primary-foreground cursor-pointer"
            >
              <Plus className="size-3.5" />
              ثبت سابقه سرویس
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border/60">
                <tr>
                  <th className="p-3 text-start">نام دستگاه</th>
                  <th className="p-3 text-start">شرح سرویس / قطعه تعویض‌شده</th>
                  <th className="p-3 text-start">تکنسین / شرکت سرویس‌دهنده</th>
                  <th className="p-3 text-start">تاریخ انجام</th>
                  <th className="p-3 text-start">هزینه تعمیرات</th>
                  <th className="p-3 text-start">موعد سرویس بعدی</th>
                  <th className="p-3 text-start">وضعیت</th>
                  <th className="p-3 text-end">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {equipmentMaintenance.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-bold text-foreground">{m.equipmentName}</td>
                    <td className="p-3 text-muted-foreground">{m.serviceDescription}</td>
                    <td className="p-3">
                      <span className="font-medium text-foreground block">{m.serviceProvider}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{m.servicePhone}</span>
                    </td>
                    <td className="p-3 text-muted-foreground fa-num">{m.serviceDate}</td>
                    <td className="p-3 font-bold text-foreground fa-num">
                      {m.cost.toLocaleString("fa-IR")} تومان
                    </td>
                    <td className="p-3 text-muted-foreground fa-num">{m.nextScheduledDate || "-"}</td>
                    <td className="p-3">
                      {m.status === "Completed" ? (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] rounded-md py-0.5">
                          انجام شده
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] rounded-md py-0.5">
                          رزرو شده
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-end">
                      {m.status === "Scheduled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => completeMaintenance(m.id)}
                          className="h-7 px-2.5 rounded-md text-[11px] font-semibold border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer"
                        >
                          تکمیل سرویس
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: INSTALLMENTS & FINANCIAL OBLIGATIONS */}
      {activeTab === "installments" && (
        <Card className="rounded-lg border border-border/70 bg-card shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-border/50 bg-muted/20">
            <h4 className="font-bold text-xs text-foreground">کاردکس تعهدات مالی و اقساط خرید تجهیزات</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border/60">
                <tr>
                  <th className="p-3 text-start">عنوان تعهد / دستگاه</th>
                  <th className="p-3 text-start">نوع طرف‌حساب</th>
                  <th className="p-3 text-start">مبلغ کل تعهد</th>
                  <th className="p-3 text-start">تعداد کل اقساط</th>
                  <th className="p-3 text-start">مبلغ هر قسط</th>
                  <th className="p-3 text-start">اقساط پرداخت‌شده</th>
                  <th className="p-3 text-start">مانده تعهد</th>
                  <th className="p-3 text-start">سررسید قسط بعدی</th>
                  <th className="p-3 text-end">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {installments.map((inst) => (
                  <tr key={inst.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <span className="font-bold text-foreground block">{inst.title}</span>
                      {inst.reminderNotes && (
                        <span className="text-[10px] text-muted-foreground">{inst.reminderNotes}</span>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {inst.targetType === "Equipment"
                        ? "خرید اقساطی تجهیزات"
                        : inst.targetType === "Supplier"
                        ? "تامین‌کننده دانه و مواد"
                        : "تسهیلات بانکی"}
                    </td>
                    <td className="p-3 font-bold text-foreground fa-num">
                      {inst.totalAmount.toLocaleString("fa-IR")} ت
                    </td>
                    <td className="p-3 text-muted-foreground fa-num">{inst.installmentCount} قسط</td>
                    <td className="p-3 font-bold text-primary fa-num">
                      {inst.installmentAmount.toLocaleString("fa-IR")} تومان
                    </td>
                    <td className="p-3 font-black text-emerald-600 fa-num">
                      {inst.paidInstallments} از {inst.installmentCount}
                    </td>
                    <td className="p-3 font-black text-rose-600 fa-num">
                      {inst.outstandingBalance.toLocaleString("fa-IR")} تومان
                    </td>
                    <td className="p-3 text-muted-foreground fa-num">{inst.nextDueDate}</td>
                    <td className="p-3 text-end">
                      {inst.status === "Active" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => payInstallment(inst.id)}
                          className="h-7 px-2.5 rounded-md text-[11px] font-semibold border-primary/40 text-primary hover:bg-primary/10 cursor-pointer"
                        >
                          پرداخت قسط بعدی
                        </Button>
                      ) : (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] rounded-md py-0.5">
                          کاملاً تسویه شده
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL 1: Add Expense */}
      <Dialog open={showAddExpenseModal} onOpenChange={setShowAddExpenseModal}>
        <DialogContent className="max-w-md rounded-lg p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Plus className="size-5 text-primary" />
              ثبت هزینه جاری جدید
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-bold text-muted-foreground block mb-1">شرح هزینه:</label>
              <Input
                value={expTitle}
                onChange={(e) => setExpTitle(e.target.value)}
                placeholder="مثال: هزینه بسته‌بندی ویژه نوروز"
                className="h-8 rounded-md text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">سرفصل هزینه:</label>
              <select
                value={expCat}
                onChange={(e) => setExpCat(e.target.value as ExpenseCategory)}
                className="w-full h-8 rounded-md border border-border/70 bg-background px-2 text-xs"
              >
                <option value="Rent">اجاره ملک</option>
                <option value="Electricity">برق</option>
                <option value="Water">آب</option>
                <option value="Gas">گاز</option>
                <option value="Internet">اینترنت و شبکه</option>
                <option value="Cleaning">خدمات نظافت</option>
                <option value="Software">نرم‌افزار و IT</option>
                <option value="Advertising">تبلیغات و مارکتینگ</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">مبلغ ریالی (تومان):</label>
              <Input
                type="number"
                value={expAmount}
                onChange={(e) => setExpAmount(Number(e.target.value))}
                className="h-8 rounded-md text-xs fa-num"
              />
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">سررسید پرداخت:</label>
              <Input
                value={expDueDate}
                onChange={(e) => setExpDueDate(e.target.value)}
                className="h-8 rounded-md text-xs fa-num"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddExpenseModal(false)}
              className="rounded-md h-8 text-xs cursor-pointer"
            >
              انصراف
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveExpense}
              className="rounded-md h-8 text-xs font-bold bg-primary text-primary-foreground cursor-pointer"
            >
              ذخیره هزینه
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Add Maintenance */}
      <Dialog open={showAddMaintModal} onOpenChange={setShowAddMaintModal}>
        <DialogContent className="max-w-md rounded-lg p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Wrench className="size-5 text-primary" />
              ثبت سابقه تعمیر و نگهداری دستگاه
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-bold text-muted-foreground block mb-1">نام دستگاه:</label>
              <Input
                value={maintEquipment}
                onChange={(e) => setMaintEquipment(e.target.value)}
                placeholder="مثال: فر کانوکشن پخت کیک"
                className="h-8 rounded-md text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">شرح خدمات انجام‌شده:</label>
              <Input
                value={maintDesc}
                onChange={(e) => setMaintDesc(e.target.value)}
                placeholder="مثال: تعویض المنت حرارتی و فن کانوکشن"
                className="h-8 rounded-md text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">تعمیرکار / شرکت:</label>
                <Input
                  value={maintProvider}
                  onChange={(e) => setMaintProvider(e.target.value)}
                  className="h-8 rounded-md text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-muted-foreground block mb-1">شماره تماس:</label>
                <Input
                  value={maintPhone}
                  onChange={(e) => setMaintPhone(e.target.value)}
                  className="h-8 rounded-md text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">هزینه فاکتور (تومان):</label>
              <Input
                type="number"
                value={maintCost}
                onChange={(e) => setMaintCost(Number(e.target.value))}
                className="h-8 rounded-md text-xs fa-num"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddMaintModal(false)}
              className="rounded-md h-8 text-xs cursor-pointer"
            >
              انصراف
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveMaintenance}
              className="rounded-md h-8 text-xs font-bold bg-primary text-primary-foreground cursor-pointer"
            >
              ثبت سابقه
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
