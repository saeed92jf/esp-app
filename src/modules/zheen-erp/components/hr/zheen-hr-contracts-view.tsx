"use client";

import React, { useState } from "react";
import {
  Users,
  FileCheck,
  Plus,
  DollarSign,
  Calendar,
  AlertTriangle,
  Clock,
  Phone,
  ShieldAlert,
  RotateCcw,
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
import { Employee, EmployeeContract } from "../../types/zheen-types";

export function ZheenHrContractsView() {
  const { employees, contracts, addEmployee, renewContract } = useZheenStore();

  const [activeTab, setActiveTab] = useState<"employees" | "contracts">("employees");

  // Add employee modal state
  const [showAddEmpModal, setShowAddEmpModal] = useState<boolean>(false);
  const [empName, setEmpName] = useState<string>("");
  const [empCode, setEmpCode] = useState<string>("EMP-05");
  const [empPos, setEmpPos] = useState<string>("باریستا بار سرد");
  const [empPhone, setEmpPhone] = useState<string>("0912");
  const [empSalary, setEmpSalary] = useState<number>(22000000);
  const [empSchedule, setEmpSchedule] = useState<string>("شیفت عصر (۱۶:۰۰ الی ۲۴:۰۰)");

  // Contract renewal modal state
  const [selectedContractForRenew, setSelectedContractForRenew] = useState<EmployeeContract | null>(null);
  const [newEndDate, setNewEndDate] = useState<string>("1405/09/10");
  const [renewNotes, setRenewNotes] = useState<string>("تمدید یک‌ساله با توافق افزایش پایه حقوق");

  const handleCreateEmployee = () => {
    if (!empName.trim() || empSalary <= 0) {
      toast.error("لطفاً نام و حقوق پرسنل را به درستی وارد فرمایید.");
      return;
    }

    addEmployee({
      fullName: empName,
      employeeCode: empCode,
      position: empPos,
      phone: empPhone,
      hireDate: new Date().toLocaleDateString("fa-IR"),
      status: "Active",
      baseSalaryMonthly: empSalary,
      hourlyRate: Math.round(empSalary / 192),
      workingSchedule: empSchedule,
    });

    setShowAddEmpModal(false);
  };

  const handleConfirmRenewal = () => {
    if (!selectedContractForRenew) return;
    renewContract(selectedContractForRenew.id, newEndDate, renewNotes);
    setSelectedContractForRenew(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <Card className="rounded-lg border border-border/70 bg-card p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-foreground">
                مدیریت منابع انسانی، دستمزد و قراردادهای استخدامی
              </h3>
              <p className="text-xs text-muted-foreground">
                پرونده پرسنلی، شیفت‌های کاری، تعهدات حقوق و دستمزد و هشدار هوشمند سررسید انقضای قراردادها
              </p>
            </div>
          </div>

          {/* Subtab Buttons - STRICT LOW CURVE rounded-md */}
          <div className="flex items-center gap-1.5 p-1 rounded-md bg-muted/60 border border-border/60">
            <button
              type="button"
              onClick={() => setActiveTab("employees")}
              className={cn(
                "h-8 px-3 rounded-md text-xs font-bold transition-all border cursor-pointer select-none",
                activeTab === "employees"
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                  : "bg-background text-muted-foreground border-border/60 hover:text-foreground"
              )}
            >
              فهرست پرسنل فعال ({employees.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("contracts")}
              className={cn(
                "h-8 px-3 rounded-md text-xs font-bold transition-all border cursor-pointer select-none",
                activeTab === "contracts"
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                  : "bg-background text-muted-foreground border-border/60 hover:text-foreground"
              )}
            >
              قراردادهای کاری و اخطارها ({contracts.length})
            </button>
          </div>
        </div>
      </Card>

      {/* TAB 1: EMPLOYEES DIRECTORY */}
      {activeTab === "employees" && (
        <Card className="rounded-lg border border-border/70 bg-card shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-border/50 bg-muted/20 flex items-center justify-between">
            <h4 className="font-bold text-xs text-foreground">پرونده پرسنلی و شرایط دستمزد</h4>
            <Button
              size="sm"
              variant="default"
              onClick={() => setShowAddEmpModal(true)}
              className="h-8 px-3 rounded-md text-xs font-bold gap-1.5 bg-primary text-primary-foreground cursor-pointer"
            >
              <Plus className="size-3.5" />
              افزودن پرسنل جدید
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border/60">
                <tr>
                  <th className="p-3 text-start">کد پرسنلی</th>
                  <th className="p-3 text-start">نام و نام خانوادگی</th>
                  <th className="p-3 text-start">سمت و بخش</th>
                  <th className="p-3 text-start">شماره تماس</th>
                  <th className="p-3 text-start">حقوق پایه ماهانه</th>
                  <th className="p-3 text-start">نرخ هر ساعت</th>
                  <th className="p-3 text-start">برنامه شیفت کاری</th>
                  <th className="p-3 text-start">وضعیت اشتغال</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-foreground text-[11px]">{emp.employeeCode}</td>
                    <td className="p-3 font-bold text-foreground">{emp.fullName}</td>
                    <td className="p-3 text-muted-foreground">{emp.position}</td>
                    <td className="p-3 font-mono text-muted-foreground text-[11px]">{emp.phone}</td>
                    <td className="p-3 font-black text-foreground fa-num">
                      {emp.baseSalaryMonthly.toLocaleString("fa-IR")} تومان
                    </td>
                    <td className="p-3 font-medium text-muted-foreground fa-num">
                      {emp.hourlyRate.toLocaleString("fa-IR")} ت/ساعت
                    </td>
                    <td className="p-3 text-muted-foreground text-[11px]">{emp.workingSchedule}</td>
                    <td className="p-3">
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] rounded-md py-0.5">
                        شاغل و فعال
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: CONTRACTS & EXPIRATION ALERTS */}
      {activeTab === "contracts" && (
        <Card className="rounded-lg border border-border/70 bg-card shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-border/50 bg-muted/20">
            <h4 className="font-bold text-xs text-foreground">قراردادهای کاری و پایش سررسید انقضا</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border/60">
                <tr>
                  <th className="p-3 text-start">شماره قرارداد</th>
                  <th className="p-3 text-start">نام پرسنل</th>
                  <th className="p-3 text-start">تاریخ شروع</th>
                  <th className="p-3 text-start">تاریخ خاتمه</th>
                  <th className="p-3 text-start">ساعت کار هفتگی</th>
                  <th className="p-3 text-start">شرایط و مفاد حقوق</th>
                  <th className="p-3 text-start">وضعیت قرارداد</th>
                  <th className="p-3 text-end">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {contracts.map((c) => {
                  const isExpiring = c.status === "ExpiringSoon";
                  return (
                    <tr
                      key={c.id}
                      className={cn(
                        "hover:bg-muted/30 transition-colors",
                        isExpiring && "bg-amber-500/5"
                      )}
                    >
                      <td className="p-3 font-mono font-bold text-foreground text-[11px]">{c.contractNumber}</td>
                      <td className="p-3 font-bold text-foreground">{c.employeeName}</td>
                      <td className="p-3 text-muted-foreground text-[11px] fa-num">{c.startDate}</td>
                      <td className="p-3 font-bold fa-num text-foreground">{c.endDate}</td>
                      <td className="p-3 text-muted-foreground fa-num">{c.weeklyHours} ساعت</td>
                      <td className="p-3 text-muted-foreground text-[11px] max-w-xs truncate">{c.salaryTerms}</td>
                      <td className="p-3">
                        {isExpiring ? (
                          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] rounded-md py-0.5">
                            انقضا در ۳۰ روز آینده
                          </Badge>
                        ) : c.status === "Renewed" ? (
                          <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] rounded-md py-0.5">
                            تمدید شده
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] rounded-md py-0.5">
                            دارای اعتبار
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedContractForRenew(c)}
                          className="h-7 px-2.5 rounded-md text-[11px] font-semibold border-primary/40 text-primary hover:bg-primary/10 gap-1 cursor-pointer"
                        >
                          <RotateCcw className="size-3" />
                          تمدید قرارداد
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL 1: Add Employee */}
      <Dialog open={showAddEmpModal} onOpenChange={setShowAddEmpModal}>
        <DialogContent className="max-w-md rounded-lg p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Users className="size-5 text-primary" />
              تشکیل پرونده استخدامی پرسنل جدید
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-bold text-muted-foreground block mb-1">نام و نام خانوادگی:</label>
              <Input
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
                placeholder="مثال: علی حسینی"
                className="h-8 rounded-md text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">کد پرسنلی:</label>
                <Input
                  value={empCode}
                  onChange={(e) => setEmpCode(e.target.value)}
                  className="h-8 rounded-md text-xs font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-muted-foreground block mb-1">سمت کاری:</label>
                <Input
                  value={empPos}
                  onChange={(e) => setEmpPos(e.target.value)}
                  className="h-8 rounded-md text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">شماره تماس همراه:</label>
              <Input
                value={empPhone}
                onChange={(e) => setEmpPhone(e.target.value)}
                className="h-8 rounded-md text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">حقوق پایه ماهانه (تومان):</label>
              <Input
                type="number"
                value={empSalary}
                onChange={(e) => setEmpSalary(Number(e.target.value))}
                className="h-8 rounded-md text-xs fa-num"
              />
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">برنامه شیفت کاری:</label>
              <Input
                value={empSchedule}
                onChange={(e) => setEmpSchedule(e.target.value)}
                className="h-8 rounded-md text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddEmpModal(false)}
              className="rounded-md h-8 text-xs cursor-pointer"
            >
              انصراف
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleCreateEmployee}
              className="rounded-md h-8 text-xs font-bold bg-primary text-primary-foreground cursor-pointer"
            >
              ثبت پرونده
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Renew Contract */}
      <Dialog open={!!selectedContractForRenew} onOpenChange={() => setSelectedContractForRenew(null)}>
        {selectedContractForRenew && (
          <DialogContent className="max-w-md rounded-lg p-5">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <RotateCcw className="size-5 text-primary" />
                تمدید قرارداد کاری: {selectedContractForRenew.employeeName}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>شماره قرارداد جاری:</span>
                <span className="font-mono font-bold text-foreground">
                  {selectedContractForRenew.contractNumber}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>تاریخ انقضای فعلی:</span>
                <span className="font-bold text-amber-600 fa-num">{selectedContractForRenew.endDate}</span>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">تاریخ خاتمه دوره تمدید جدید:</label>
                <Input
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="h-8 rounded-md text-xs fa-num"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">مفاد توافق و یادداشت تمدید:</label>
                <Input
                  value={renewNotes}
                  onChange={(e) => setRenewNotes(e.target.value)}
                  className="h-8 rounded-md text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedContractForRenew(null)}
                className="rounded-md h-8 text-xs cursor-pointer"
              >
                انصراف
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleConfirmRenewal}
                className="rounded-md h-8 text-xs font-bold bg-primary text-primary-foreground cursor-pointer"
              >
                تایید تمدید قرارداد
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
