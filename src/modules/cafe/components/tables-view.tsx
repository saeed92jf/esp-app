"use client";

import React, { useState } from "react";
import { Users, Clock, Coffee, Plus, CheckCircle2, AlertCircle, Ban } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { TableItem } from "../types";

interface TablesViewProps {
  tables: TableItem[];
  onSelectTableForOrder: (tableNumber: string) => void;
  onUpdateTableStatus: (tableId: string, status: "Free" | "Occupied" | "Reserved") => void;
}

export function TablesView({
  tables,
  onSelectTableForOrder,
  onUpdateTableStatus,
}: TablesViewProps) {
  const [selectedSection, setSelectedSection] = useState<string>("all");

  const sections = [
    { id: "all", label: "همه بخش‌ها" },
    { id: "main_hall", label: "سالن اصلی" },
    { id: "vip_lounge", label: "بخش VIP و تشریفات" },
    { id: "terrace", label: "تراس و فضای باز" },
  ];

  const filteredTables = tables.filter(
    (t) => selectedSection === "all" || t.section === selectedSection
  );

  const stats = {
    total: tables.length,
    free: tables.filter((t) => t.status === "Free").length,
    occupied: tables.filter((t) => t.status === "Occupied").length,
    reserved: tables.filter((t) => t.status === "Reserved").length,
  };

  return (
    <div className="space-y-4">
      {/* Top Section Filter & KPIs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-card border border-border/70 rounded-lg shadow-xs">
        {/* Filter buttons - low curve rounded-md */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {sections.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setSelectedSection(sec.id)}
              className={cn(
                "h-8 px-3 rounded-md text-xs font-semibold shrink-0 transition-all border cursor-pointer select-none",
                selectedSection === sec.id
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                  : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
              )}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Status Counts */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 rounded-md py-1 px-2.5">
            خالی: {stats.free}
          </Badge>
          <Badge className="bg-primary/15 text-primary border-primary/30 rounded-md py-1 px-2.5">
            اشغال: {stats.occupied}
          </Badge>
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 rounded-md py-1 px-2.5">
            رزرو: {stats.reserved}
          </Badge>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTables.map((tbl) => {
          const isFree = tbl.status === "Free";
          const isOccupied = tbl.status === "Occupied";
          const isReserved = tbl.status === "Reserved";

          return (
            <Card
              key={tbl.id}
              className={cn(
                "border rounded-lg transition-all duration-150 flex flex-col justify-between hover:shadow-md",
                isFree && "border-emerald-500/30 bg-card",
                isOccupied && "border-primary/50 bg-primary/5",
                isReserved && "border-amber-500/30 bg-amber-500/5"
              )}
            >
              <CardHeader className="p-3.5 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-foreground">
                      میز {tbl.number}
                    </span>
                    <Badge variant="outline" className="text-[10px] rounded-md py-0 text-muted-foreground">
                      {tbl.sectionLabel}
                    </Badge>
                  </div>

                  <Badge
                    className={cn(
                      "text-[10px] font-bold rounded-md px-2 py-0.5",
                      isFree && "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
                      isOccupied && "bg-primary text-primary-foreground border-primary",
                      isReserved && "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
                    )}
                  >
                    {isFree ? "خالی" : isOccupied ? "در حال سرو" : "رزرو شده"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{tbl.name}</p>
              </CardHeader>

              <CardContent className="p-3.5 pt-1 space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    ظرفیت:
                  </span>
                  <span className="font-bold text-foreground fa-num">{tbl.capacity} نفر</span>
                </div>

                {isOccupied && (
                  <div className="flex items-center justify-between text-muted-foreground bg-primary/10 p-1.5 rounded-md border border-primary/20">
                    <span className="flex items-center gap-1.5 text-primary font-semibold">
                      <Clock className="size-3.5" />
                      مدت نشستن:
                    </span>
                    <span className="font-bold text-primary fa-num">{tbl.activeMinutes || 15} دقیقه</span>
                  </div>
                )}
              </CardContent>

              {/* ACTION BUTTONS - LOW CURVE rounded-md */}
              <CardFooter className="p-3.5 pt-2 border-t border-border/40 bg-muted/20 flex items-center justify-between gap-2">
                {isFree ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      onSelectTableForOrder(tbl.number);
                      toast.info(`میز ${tbl.number} برای ثبت سفارش انتخاب شد.`);
                    }}
                    className="w-full h-8 rounded-md text-xs font-semibold gap-1.5 cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    ثبت سفارش این میز
                  </Button>
                ) : isOccupied ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onUpdateTableStatus(tbl.id, "Free");
                      toast.success(`میز ${tbl.number} با موفقیت تخلیه و آماده پذیرایی شد.`);
                    }}
                    className="w-full h-8 rounded-md text-xs font-semibold border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer"
                  >
                    <CheckCircle2 className="size-3.5 me-1" />
                    تخلیه و آزادسازی میز
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onUpdateTableStatus(tbl.id, "Occupied");
                      toast.success(`میز ${tbl.number} اشغال شد.`);
                    }}
                    className="w-full h-8 rounded-md text-xs font-semibold border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 cursor-pointer"
                  >
                    شروع پذیرایی رزرو
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
