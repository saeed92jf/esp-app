// src/modules/warehouse/components/WarehouseLocationsView.tsx
"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MapPin,
  Warehouse,
  Thermometer,
  Droplets,
  Layers,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLocaleNumber } from "@/lib/format-number";
import { WarehouseBay } from "../types/warehouse.types";
import { MOCK_WAREHOUSE_BAYS } from "../data/warehouse-data";

export function WarehouseLocationsView() {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const t = useTranslations("Warehouse");

  const [bays] = useState<WarehouseBay[]>(MOCK_WAREHOUSE_BAYS);
  const [selectedBay, setSelectedBay] = useState<WarehouseBay | null>(null);
  const [isBayModalOpen, setIsBayModalOpen] = useState(false);

  const totalBays = bays.length;
  const avgOccupancy = Math.round(
    bays.reduce((acc, b) => acc + b.occupancyRate, 0) / (totalBays || 1)
  );
  const totalRacks = bays.reduce((acc, b) => acc + b.rackCount, 0);
  const climateCount = bays.filter((b) => b.temperatureControlled || b.humidityControlled).length;

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Warehouse className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {t("metrics.totalBays")}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(totalBays, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{t("units.zones")}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Layers className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {t("metrics.occupancyRate")}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(avgOccupancy, isRtl)}٪
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <MapPin className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {t("metrics.activeRacks")}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(totalRacks, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{t("units.racks")}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Thermometer className="size-5.5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {t("metrics.climateControlled")}
            </div>
            <div className={cn("text-lg sm:text-xl font-bold tracking-tight tabular-nums text-foreground", isRtl && "fa-num")}>
              {formatLocaleNumber(climateCount, isRtl)}{" "}
              <span className="text-xs font-normal text-muted-foreground font-sans">{t("units.controlled")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bay / Zone Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bays.map((bay) => {
          const isHigh = bay.occupancyRate >= 80;
          return (
            <div
              key={bay.id}
              className="p-5 rounded-2xl bg-card border border-border/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-primary/10 text-primary">
                    {bay.code}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] py-0.5 px-2 font-semibold",
                      isHigh
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    )}
                  >
                    {isHigh
                      ? isRtl ? "نزدیک به تکمیل" : "Near Capacity"
                      : isRtl ? "ظرفیت نرمال" : "Normal Capacity"}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {isRtl ? bay.nameFa : bay.nameEn}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {isRtl ? bay.descriptionFa : bay.descriptionEn}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t("metrics.occupancyRate")}:</span>
                    <span className="font-bold font-mono text-foreground">{bay.occupancyRate}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        bay.occupancyRate >= 85
                          ? "bg-rose-500"
                          : bay.occupancyRate >= 70
                          ? "bg-amber-500"
                          : "bg-primary"
                      )}
                      style={{ width: `${bay.occupancyRate}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {formatLocaleNumber(bay.capacityCurrent, isRtl)} / {formatLocaleNumber(bay.capacityMax, isRtl)}{" "}
                      {isRtl ? bay.unitFa : bay.unitEn}
                    </span>
                    <span>
                      {formatLocaleNumber(bay.itemCount, isRtl)} {t("units.skus")}
                    </span>
                  </div>
                </div>

                {/* Environmental & Specs Badges */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px]">
                  {bay.temperatureControlled && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium">
                      <Thermometer className="size-3" />
                      <span>{isRtl ? "کنترل دما" : "Temp Controlled"}</span>
                    </span>
                  )}
                  {bay.humidityControlled && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 font-medium">
                      <Droplets className="size-3" />
                      <span>{isRtl ? "رطوبت مجاز (<۴۰٪)" : "RH < 40%"}</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-medium">
                    <Layers className="size-3" />
                    <span>
                      {formatLocaleNumber(bay.rackCount, isRtl)} {isRtl ? "قفسه و پالت" : "Racks"}
                    </span>
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground truncate pe-2">
                  <UserCheck className="size-3.5 text-primary shrink-0" />
                  <span className="truncate">{isRtl ? bay.supervisorFa : bay.supervisorEn}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    setSelectedBay(bay);
                    setIsBayModalOpen(true);
                  }}
                  className="rounded-xl text-xs gap-1 cursor-pointer shrink-0"
                >
                  <Eye className="size-3.5" />
                  <span>{t("actions.viewItems")}</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bay Details / Racks Modal */}
      {selectedBay && (
        <Dialog open={isBayModalOpen} onOpenChange={setIsBayModalOpen}>
          <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border border-border/80 shadow-2xl bg-card">
            <div className="bg-muted/40 p-5 sm:p-6 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Warehouse className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                    {isRtl ? selectedBay.nameFa : selectedBay.nameEn}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground font-sans">
                    {isRtl ? selectedBay.descriptionFa : selectedBay.descriptionEn}
                  </DialogDescription>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="text-xs font-bold text-foreground flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                <span>{isRtl ? "قفسه‌ها، پالت‌ها و جایگاه‌های فعال این زون:" : "Active Racks & Pallets in this Bay:"}</span>
              </div>

              <div className="space-y-2.5">
                {selectedBay.racks.map((rk) => (
                  <div
                    key={rk.id}
                    className="p-3 rounded-2xl bg-muted/20 border border-border/60 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-mono font-bold text-primary">{rk.code}</div>
                      <div className="text-muted-foreground font-medium">{rk.label}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold tabular-nums text-foreground">
                        {formatLocaleNumber(rk.currentItems, isRtl)} {isRtl ? "قلم قطعه" : "items"}
                      </span>
                      {rk.status === "full" ? (
                        <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30">
                          {isRtl ? "تکمیل" : "Full"}
                        </Badge>
                      ) : rk.status === "near_full" ? (
                        <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                          {isRtl ? "نیمه‌پر" : "Near Full"}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                          {isRtl ? "عادی" : "Normal"}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 text-xs flex items-center justify-between">
                <span className="text-muted-foreground">{isRtl ? "سرپرست و مسئول جایگاه:" : "Bay Supervisor:"}</span>
                <span className="font-bold text-foreground">{isRtl ? selectedBay.supervisorFa : selectedBay.supervisorEn}</span>
              </div>
            </div>

            <DialogFooter className="p-4 sm:p-5 bg-muted/30 border-t border-border/60 flex items-center justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsBayModalOpen(false)}
                className="rounded-xl px-4 text-xs font-semibold cursor-pointer"
              >
                {t("actions.close")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
