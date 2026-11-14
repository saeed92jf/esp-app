"use client";

import React, { useState } from "react";
import {
  DollarSign,
  Package,
  Layers,
  TrendingUp,
  Percent,
  Sparkles,
  ShoppingBag,
  Bike,
  UtensilsCrossed,
  Info,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ProductPackagingConfig } from "../../types/zheen-types";

export function ZheenCostingPackagingView() {
  const { productCostAnalyses, packagingConfigs, updatePackagingConfig } = useZheenStore();

  const [selectedConfigForEdit, setSelectedConfigForEdit] = useState<ProductPackagingConfig | null>(null);

  return (
    <div className="space-y-4">
      {/* Top Description Card */}
      <Card className="rounded-lg border border-border/70 bg-card p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
              <DollarSign className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-foreground">
                تحلیل بهای تمام‌شده و سودآوری به تفکیک کانال‌های فروش
              </h3>
              <p className="text-xs text-muted-foreground">
                محاسبه ۱۲ عامل هزینه، تفکیک ملزومات بسته‌بندی سالن، بیرون‌بر و اسنپ‌فود و تعیین نقطه سر‌به‌سر
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="text-[11px] rounded-md py-1 border-primary/40 text-primary">
              قاعده عدم شمارش مضاعف هزینه‌ها رعایت شده است
            </Badge>
          </div>
        </div>
      </Card>

      {/* Products Cost Breakdown Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {productCostAnalyses.map((prod) => (
          <Card key={prod.menuItemId} className="rounded-lg border border-border/70 bg-card shadow-xs overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-foreground">{prod.productName}</h4>
                <span className="text-xs text-muted-foreground">{prod.category}</span>
              </div>

              <div className="text-end">
                <span className="text-[10px] text-muted-foreground block">قیمت مصوب فروش در منو:</span>
                <span className="text-base font-black text-primary fa-num">
                  {prod.sellingPrice.toLocaleString("fa-IR")} تومان
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3.5 text-xs">
              {/* Cost Factor Tree (Production vs Packaging) */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-md bg-muted/30 border border-border/40">
                <div>
                  <span className="text-[10px] text-muted-foreground block">بهای تمام‌شده تولید (بدون بسته‌بندی):</span>
                  <span className="font-bold text-foreground fa-num">
                    {prod.portionCost.toLocaleString("fa-IR")} تومان
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">نقطه سر‌به‌سر فروش ماهانه:</span>
                  <span className="font-bold text-foreground fa-num">
                    {prod.breakEvenPortions} اسلایس / لیوان
                  </span>
                </div>
              </div>

              {/* 3 Channels Comparison Table */}
              <div>
                <span className="font-bold text-muted-foreground block mb-1.5">
                  مقایسه حاشیه سود به تفکیک کانال فروش:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {/* Channel 1: DineIn */}
                  <div className="p-2.5 rounded-md border border-border/60 bg-card flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-border/40 text-muted-foreground">
                      <UtensilsCrossed className="size-3.5 text-primary" />
                      <span className="font-bold text-[11px] text-foreground">سرو در سالن</span>
                    </div>

                    <div className="space-y-1 my-2 text-[11px]">
                      <div className="flex justify-between text-muted-foreground">
                        <span>هزینه بسته‌بندی:</span>
                        <span className="font-mono fa-num">{prod.dineInPackagingCost.toLocaleString("fa-IR")} ت</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>بهای تمام‌شده کل:</span>
                        <span className="font-mono fa-num">
                          {(prod.portionCost + prod.dineInPackagingCost).toLocaleString("fa-IR")} ت
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-emerald-600 pt-1 border-t border-border/30">
                        <span>سود ناخالص:</span>
                        <span className="fa-num">{prod.dineInProfit.toLocaleString("fa-IR")} ت</span>
                      </div>
                    </div>

                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] rounded-md py-0.5 justify-center fa-num">
                      حاشیه سود: ٪{prod.dineInMarginPercent}
                    </Badge>
                  </div>

                  {/* Channel 2: Takeaway */}
                  <div className="p-2.5 rounded-md border border-border/60 bg-card flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-border/40 text-muted-foreground">
                      <ShoppingBag className="size-3.5 text-amber-600" />
                      <span className="font-bold text-[11px] text-foreground">تحویل بیرون‌بر</span>
                    </div>

                    <div className="space-y-1 my-2 text-[11px]">
                      <div className="flex justify-between text-muted-foreground">
                        <span>هزینه بسته‌بندی:</span>
                        <span className="font-mono fa-num">{prod.takeawayPackagingCost.toLocaleString("fa-IR")} ت</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>بهای تمام‌شده کل:</span>
                        <span className="font-mono fa-num">
                          {(prod.portionCost + prod.takeawayPackagingCost).toLocaleString("fa-IR")} ت
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-amber-600 pt-1 border-t border-border/30">
                        <span>سود ناخالص:</span>
                        <span className="fa-num">{prod.takeawayProfit.toLocaleString("fa-IR")} ت</span>
                      </div>
                    </div>

                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] rounded-md py-0.5 justify-center fa-num">
                      حاشیه سود: ٪{prod.takeawayMarginPercent}
                    </Badge>
                  </div>

                  {/* Channel 3: Delivery */}
                  <div className="p-2.5 rounded-md border border-border/60 bg-card flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-border/40 text-muted-foreground">
                      <Bike className="size-3.5 text-blue-600" />
                      <span className="font-bold text-[11px] text-foreground">اسنپ‌فود / پیک</span>
                    </div>

                    <div className="space-y-1 my-2 text-[11px]">
                      <div className="flex justify-between text-muted-foreground">
                        <span>هزینه بسته‌بندی:</span>
                        <span className="font-mono fa-num">{prod.deliveryPackagingCost.toLocaleString("fa-IR")} ت</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>بهای تمام‌شده کل:</span>
                        <span className="font-mono fa-num">
                          {(prod.portionCost + prod.deliveryPackagingCost).toLocaleString("fa-IR")} ت
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-blue-600 pt-1 border-t border-border/30">
                        <span>سود ناخالص:</span>
                        <span className="fa-num">{prod.deliveryProfit.toLocaleString("fa-IR")} ت</span>
                      </div>
                    </div>

                    <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 text-[10px] rounded-md py-0.5 justify-center fa-num">
                      حاشیه سود: ٪{prod.deliveryMarginPercent}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Button - STRICT LOW CURVE (rounded-md, h-8) */}
              <div className="pt-2 border-t border-border/40 flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const cfg = packagingConfigs.find((c) => c.menuItemId === prod.recipeId);
                    if (cfg) setSelectedConfigForEdit(cfg);
                  }}
                  className="h-8 rounded-md text-xs font-semibold gap-1.5 border-border/70 hover:bg-muted cursor-pointer"
                >
                  <Edit3 className="size-3.5 text-primary" />
                  ویرایش ترکیب ملزومات بسته‌بندی
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MODAL: Edit Packaging Combo */}
      <Dialog open={!!selectedConfigForEdit} onOpenChange={() => setSelectedConfigForEdit(null)}>
        {selectedConfigForEdit && (
          <DialogContent className="max-w-md rounded-lg p-5">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Package className="size-5 text-primary" />
                پیکربندی اقلام بسته‌بندی: {selectedConfigForEdit.productName}
              </DialogTitle>
              <DialogDescription className="text-xs">
                تعیین ملزومات مصرفی به ازای هر بار فروش بیرون‌بر یا ارسال پیک
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <span className="font-bold text-muted-foreground block">اقلام پکیج بیرون‌بر (Takeaway):</span>
              <div className="space-y-1.5 border border-border/50 rounded-md p-2 bg-muted/20">
                {selectedConfigForEdit.takeawayItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span>{item.packagingItemName}</span>
                    <span className="font-mono fa-num">
                      {item.quantity} عدد ({item.totalCost.toLocaleString("fa-IR")} ت)
                    </span>
                  </div>
                ))}
              </div>

              <span className="font-bold text-muted-foreground block">اقلام پکیج دلیوری و اسنپ‌فود:</span>
              <div className="space-y-1.5 border border-border/50 rounded-md p-2 bg-muted/20">
                {selectedConfigForEdit.deliveryItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span>{item.packagingItemName}</span>
                    <span className="font-mono fa-num">
                      {item.quantity} عدد ({item.totalCost.toLocaleString("fa-IR")} ت)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedConfigForEdit(null)}
                className="rounded-md h-8 text-xs cursor-pointer"
              >
                بستن
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
