"use client";

import React, { useState } from "react";
import {
  Sprout,
  Plus,
  Droplets,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  History,
  Sun,
  MapPin,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useZheenStore } from "../../store/zheen-store";
import { CafePlant } from "../../types/zheen-types";

export function ZheenPlantsView() {
  const { plants, wateringLogs, waterPlant, addPlant, employees, currentUser } = useZheenStore();

  const [showAddPlantModal, setShowAddPlantModal] = useState<boolean>(false);
  const [selectedPlantForWatering, setSelectedPlantForWatering] = useState<CafePlant | null>(null);
  const [waterNotes, setWaterNotes] = useState<string>("آبیاری با ۲ لیتر آب مقطر و غبارپاشی برگ‌ها");
  const [waterEmployee, setWaterEmployee] = useState<string>(currentUser.name);

  // New plant form state
  const [plantName, setPlantName] = useState<string>("");
  const [plantLocation, setPlantLocation] = useState<string>("سالن اصلی - کنار پنجره");
  const [plantInterval, setPlantInterval] = useState<number>(4);
  const [plantSunlight, setPlantSunlight] = useState<string>("نور ملایم فیلترشده");
  const [plantCare, setPlantCare] = useState<string>("غبارپاشی روزانه، کود مایع هر ۱۴ روز");
  const [plantAssignedId, setPlantAssignedId] = useState<string>(employees[0]?.id || "");
  const [plantEmoji, setPlantEmoji] = useState<string>("🌿");

  const handleConfirmWatering = () => {
    if (!selectedPlantForWatering) return;
    waterPlant(selectedPlantForWatering.id, waterEmployee, waterNotes);
    setSelectedPlantForWatering(null);
  };

  const handleSavePlant = () => {
    if (!plantName.trim() || plantInterval <= 0) {
      toast.error("نام گیاه و دوره تناوب آبیاری الزامی است.");
      return;
    }

    const assignedEmp = employees.find((e) => e.id === plantAssignedId);
    const todayStr = "1404/08/24";
    const nextDayNum = 24 + plantInterval;
    const nextWateredDate = `1404/08/${nextDayNum.toString().padStart(2, "0")}`;

    addPlant({
      name: plantName,
      location: plantLocation,
      wateringIntervalDays: plantInterval,
      lastWateredDate: todayStr,
      nextWateredDate,
      assignedEmployeeId: plantAssignedId,
      assignedEmployeeName: assignedEmp?.fullName || "پرسنل کافه",
      sunlightRequirement: plantSunlight,
      specialInstructions: plantCare,
      status: "Optimal",
      photoEmoji: plantEmoji,
    });

    setShowAddPlantModal(false);
  };

  const overduePlants = plants.filter((p) => p.status === "Overdue");
  const dueTodayPlants = plants.filter((p) => p.status === "DueToday");

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <Card className="rounded-lg border border-border/70 bg-card p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Sprout className="size-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-foreground">
                سیستم هوشمند آبیاری و مراقبت از فضای سبز کافه ژین
              </h3>
              <p className="text-xs text-muted-foreground">
                محاسبه خودکار دوره تناوب آبیاری، پایش گیاهان تشنه، هشدارهای معوقه و تاریخچه لاگ‌های رسیدگی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => setShowAddPlantModal(true)}
              className="h-9 px-3 rounded-md text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-2xs"
            >
              <Plus className="size-4" />
              افزودن گیاه / گلدان جدید
            </Button>
          </div>
        </div>

        {/* Status Indicators Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/50 mt-3 text-xs">
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 rounded-md py-1 px-2.5">
            کل گلدان‌های تحت نظر: {plants.length} عدد
          </Badge>
          <Badge
            className={cn(
              "rounded-md py-1 px-2.5",
              dueTodayPlants.length > 0
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 animate-pulse font-bold"
                : "bg-muted text-muted-foreground border-border/50"
            )}
          >
            نیازمند آبیاری امروز: {dueTodayPlants.length} گلدان
          </Badge>
          {overduePlants.length > 0 && (
            <Badge className="bg-destructive/15 text-destructive border-destructive/30 rounded-md py-1 px-2.5 font-black animate-bounce">
              دارای تاخیر بحرانی: {overduePlants.length} گلدان!
            </Badge>
          )}
        </div>
      </Card>

      {/* Plants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {plants.map((plant) => {
          const isOverdue = plant.status === "Overdue";
          const isDueToday = plant.status === "DueToday";

          return (
            <Card
              key={plant.id}
              className={cn(
                "rounded-lg border flex flex-col justify-between shadow-2xs transition-all overflow-hidden",
                isOverdue
                  ? "border-destructive/40 bg-destructive/5"
                  : isDueToday
                  ? "border-amber-500/40 bg-amber-500/5"
                  : "border-border/70 bg-card hover:shadow-md"
              )}
            >
              <CardHeader className="p-3.5 pb-2 border-b border-border/40 bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{plant.photoEmoji}</span>
                  {isOverdue ? (
                    <Badge className="bg-destructive text-destructive-foreground text-[10px] rounded-md py-0">
                      ۲ روز تاخیر!
                    </Badge>
                  ) : isDueToday ? (
                    <Badge className="bg-amber-500 text-white text-[10px] rounded-md py-0">
                      موعد آبیاری امروز
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] rounded-md py-0">
                      وضعیت مرطوب و شاداب
                    </Badge>
                  )}
                </div>
                <h4 className="font-bold text-sm text-foreground mt-2">{plant.name}</h4>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="size-3 text-primary shrink-0" />
                  <span className="truncate">{plant.location}</span>
                </div>
              </CardHeader>

              <CardContent className="p-3.5 space-y-2 text-xs flex-1">
                <div className="p-2 rounded-md bg-muted/30 border border-border/40 space-y-1">
                  <div className="flex justify-between text-muted-foreground text-[11px]">
                    <span>دوره تناوب آبیاری:</span>
                    <span className="font-bold text-foreground fa-num">هر {plant.wateringIntervalDays} روز</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-[11px]">
                    <span>آخرین آبدهی:</span>
                    <span className="font-mono fa-num">{plant.lastWateredDate}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-[11px]">
                    <span>موعد بعدی آبدهی:</span>
                    <span className="font-bold text-foreground fa-num">{plant.nextWateredDate}</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1 text-amber-600">
                    <Sun className="size-3" />
                    <span>{plant.sunlightRequirement}</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <User className="size-3" />
                    <span>مسئول: {plant.assignedEmployeeName}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2 mt-1">
                    {plant.specialInstructions}
                  </p>
                </div>
              </CardContent>

              {/* ACTION FOOTER - STRICT LOW CURVE (rounded-md, h-8) */}
              <CardFooter className="p-3.5 pt-2 border-t border-border/40 bg-muted/10">
                <Button
                  size="sm"
                  variant={isDueToday || isOverdue ? "default" : "outline"}
                  onClick={() => setSelectedPlantForWatering(plant)}
                  className={cn(
                    "w-full h-8 rounded-md text-xs font-bold gap-1.5 cursor-pointer",
                    isDueToday || isOverdue
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                      : "border-border/70 hover:bg-muted text-foreground"
                  )}
                >
                  <Droplets className="size-3.5 fill-current" />
                  ثبت آبیاری این گلدان
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Watering History Logs Table */}
      <Card className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-border/50 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="size-4 text-primary" />
            <h4 className="font-bold text-xs text-foreground">دفترچه ثبت سوابق آبیاری و مراقبت</h4>
          </div>
          <span className="text-[11px] text-muted-foreground fa-num">{wateringLogs.length} سابقه ثبت‌شده</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border/60">
              <tr>
                <th className="p-3 text-start">زمان آبیاری</th>
                <th className="p-3 text-start">نام گیاه / گلدان</th>
                <th className="p-3 text-start">پرسنل اقدام‌کننده</th>
                <th className="p-3 text-start">یادداشت و اقدامات انجام‌شده</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {wateringLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-muted-foreground text-[11px] fa-num">{log.wateredAt}</td>
                  <td className="p-3 font-bold text-foreground">{log.plantName}</td>
                  <td className="p-3 text-foreground font-medium">{log.employeeName}</td>
                  <td className="p-3 text-muted-foreground text-[11px]">{log.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL 1: Confirm Watering */}
      <Dialog open={!!selectedPlantForWatering} onOpenChange={() => setSelectedPlantForWatering(null)}>
        {selectedPlantForWatering && (
          <DialogContent className="max-w-md rounded-lg p-5">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-emerald-600">
                <Droplets className="size-5 text-emerald-600" />
                ثبت آبدهی: {selectedPlantForWatering.name}
              </DialogTitle>
              <DialogDescription className="text-xs">
                به‌روزرسانی خودکار تاریخچه، محاسبه موعد بعدی بر اساس تناوب {selectedPlantForWatering.wateringIntervalDays} روزه و تغییر وضعیت به شاداب
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">پرسنل انجام‌دهنده:</label>
                <select
                  value={waterEmployee}
                  onChange={(e) => setWaterEmployee(e.target.value)}
                  className="w-full h-8 rounded-md border border-border/70 bg-background px-2 text-xs"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.fullName}>
                      {e.fullName} ({e.position})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">یادداشت و مشاهدات:</label>
                <Input
                  value={waterNotes}
                  onChange={(e) => setWaterNotes(e.target.value)}
                  placeholder="مثال: غبارپاشی برگ‌ها، بررسی رطوبت زهکشی..."
                  className="h-8 rounded-md text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPlantForWatering(null)}
                className="rounded-md h-8 text-xs cursor-pointer"
              >
                انصراف
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleConfirmWatering}
                className="rounded-md h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                تایید ثبت آبیاری
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* MODAL 2: Add New Plant */}
      <Dialog open={showAddPlantModal} onOpenChange={setShowAddPlantModal}>
        <DialogContent className="max-w-md rounded-lg p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Sprout className="size-5 text-emerald-600" />
              شناسنامه‌دار کردن گلدان جدید در کافه
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="font-bold text-muted-foreground block mb-1">نام گیاه:</label>
                <Input
                  value={plantName}
                  onChange={(e) => setPlantName(e.target.value)}
                  placeholder="مثال: زاموفیلیا بلک"
                  className="h-8 rounded-md text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-muted-foreground block mb-1">آیکون اموجی:</label>
                <Input
                  value={plantEmoji}
                  onChange={(e) => setPlantEmoji(e.target.value)}
                  className="h-8 rounded-md text-xs text-center text-base"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">موقعیت قرارگیری در کافه:</label>
              <Input
                value={plantLocation}
                onChange={(e) => setPlantLocation(e.target.value)}
                placeholder="مثال: کانتر اصلی بار سرد"
                className="h-8 rounded-md text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">دوره تناوب آبیاری (روز):</label>
                <Input
                  type="number"
                  value={plantInterval}
                  onChange={(e) => setPlantInterval(Number(e.target.value))}
                  className="h-8 rounded-md text-xs fa-num"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">مسئول رسیدگی:</label>
                <select
                  value={plantAssignedId}
                  onChange={(e) => setPlantAssignedId(e.target.value)}
                  className="w-full h-8 rounded-md border border-border/70 bg-background px-2 text-xs"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">نیاز نوری و تهویه:</label>
              <Input
                value={plantSunlight}
                onChange={(e) => setPlantSunlight(e.target.value)}
                placeholder="مثال: نور غیرمستقیم فیلترشده"
                className="h-8 rounded-md text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">دستورالعمل ویژه مراقبت:</label>
              <Input
                value={plantCare}
                onChange={(e) => setPlantCare(e.target.value)}
                placeholder="دستورالعمل خاک، غبارپاشی و کود..."
                className="h-8 rounded-md text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddPlantModal(false)}
              className="rounded-md h-8 text-xs cursor-pointer"
            >
              انصراف
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSavePlant}
              className="rounded-md h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            >
              ثبت شناسنامه گلدان
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
