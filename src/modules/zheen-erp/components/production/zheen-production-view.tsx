"use client";

import React, { useState } from "react";
import {
  ChefHat,
  Plus,
  Layers,
  ArrowRight,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  Percent,
  Play,
  RotateCcw,
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
import { Recipe, RecipeIngredient } from "../../types/zheen-types";

export function ZheenProductionView() {
  const {
    recipes,
    productionOrders,
    inventoryItems,
    executeProductionOrder,
    currentUser,
  } = useZheenStore();

  const [activeSubTab, setActiveSubTab] = useState<"recipes" | "orders">("recipes");
  const [selectedRecipeForProd, setSelectedRecipeForProd] = useState<Recipe | null>(null);

  // Production execution form state
  const [plannedQty, setPlannedQty] = useState<number>(12);
  const [actualQty, setActualQty] = useState<number>(12);
  const [laborCost, setLaborCost] = useState<number>(45000);
  const [overheadCost, setOverheadCost] = useState<number>(25000);
  const [wasteReason, setWasteReason] = useState<string>("افت رطوبت و سوختگی لبه‌های قالب");
  const [operatorName, setOperatorName] = useState<string>("سارا کیانی (سرقناد)");

  // Shortage preview state
  const shortages = React.useMemo(() => {
    if (!selectedRecipeForProd) return [];
    const list: { name: string; required: number; available: number; unit: string }[] = [];
    selectedRecipeForProd.ingredients.forEach((ing) => {
      const inv = inventoryItems.find((i) => i.id === ing.inventoryItemId);
      const req = ing.quantity * (plannedQty / (selectedRecipeForProd.portionCount || 1));
      const avail = inv?.currentStock || 0;
      if (avail < req) {
        list.push({
          name: ing.inventoryItemName,
          required: req,
          available: avail,
          unit: ing.unit,
        });
      }
    });
    return list;
  }, [selectedRecipeForProd, plannedQty, inventoryItems]);

  const handleStartProduction = () => {
    if (!selectedRecipeForProd) return;

    if (shortages.length > 0) {
      toast.error("امکان ثبت تولید به دلیل کسری مواد اولیه در انبار وجود ندارد!");
      return;
    }

    const result = executeProductionOrder({
      recipeId: selectedRecipeForProd.id,
      plannedQuantity: plannedQty,
      actualYieldQuantity: actualQty,
      allocatedLaborCost: laborCost,
      allocatedOverheadCost: overheadCost,
      operatorName,
      wasteReason: actualQty < plannedQty ? wasteReason : undefined,
    });

    if (result.success) {
      setSelectedRecipeForProd(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <Card className="rounded-lg border border-border/70 bg-card p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ChefHat className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-foreground">
                فرمولاسیون چندسطحی (BOM) و خط تولید کافه
              </h3>
              <p className="text-xs text-muted-foreground">
                پشتیبانی از ترکیب مواد خام در نیمه‌ساخته‌ها، تبدیل کیک به اسلایس، کسر خودکار انبار و محاسبه ضایعات واقعی
              </p>
            </div>
          </div>

          {/* Subtabs - STRICT LOW CURVE rounded-md */}
          <div className="flex items-center gap-1.5 p-1 rounded-md bg-muted/60 border border-border/60">
            <button
              type="button"
              onClick={() => setActiveSubTab("recipes")}
              className={cn(
                "h-8 px-3 rounded-md text-xs font-bold transition-all border cursor-pointer select-none",
                activeSubTab === "recipes"
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                  : "bg-background text-muted-foreground border-border/60 hover:text-foreground"
              )}
            >
              کاتالوگ فرمول‌های ساخت BOM ({recipes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab("orders")}
              className={cn(
                "h-8 px-3 rounded-md text-xs font-bold transition-all border cursor-pointer select-none",
                activeSubTab === "orders"
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                  : "bg-background text-muted-foreground border-border/60 hover:text-foreground"
              )}
            >
              سوابق بچ‌های تولید واقعی ({productionOrders.length})
            </button>
          </div>
        </div>
      </Card>

      {/* SUBTAB 1: RECIPES CATALOG */}
      {activeSubTab === "recipes" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {recipes.map((recipe) => (
            <Card
              key={recipe.id}
              className="rounded-lg border border-border/70 bg-card flex flex-col justify-between shadow-xs overflow-hidden"
            >
              <CardHeader className="p-4 border-b border-border/50 bg-muted/20">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-foreground">{recipe.name}</h4>
                      <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] rounded-md font-mono">
                        {recipe.recipeCode}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground mt-0.5 block">{recipe.category}</span>
                  </div>

                  <Badge variant="outline" className="text-[10px] rounded-md text-muted-foreground">
                    زمان پخت: {recipe.cookTimeMinutes} دقیقه
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3 flex-1 text-xs">
                {/* Ingredients Breakdown Table */}
                <div>
                  <span className="font-bold text-muted-foreground block mb-1.5">
                    مواد اولیه و نیمه‌ساخته‌های مصرفی:
                  </span>
                  <div className="border border-border/50 rounded-md overflow-hidden">
                    <table className="w-full text-[11px]">
                      <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border/50">
                        <tr>
                          <th className="p-2 text-start">ماده مصرفی</th>
                          <th className="p-2 text-center">مقدار در بچ</th>
                          <th className="p-2 text-end">فی واحد</th>
                          <th className="p-2 text-end">هزینه کل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {recipe.ingredients.map((ing) => (
                          <tr key={ing.id} className="hover:bg-muted/20">
                            <td className="p-2 font-medium text-foreground">{ing.inventoryItemName}</td>
                            <td className="p-2 text-center font-mono fa-num">
                              {ing.quantity} {ing.unit}
                            </td>
                            <td className="p-2 text-end text-muted-foreground fa-num">
                              {ing.unitCost.toLocaleString("fa-IR")}
                            </td>
                            <td className="p-2 text-end font-bold text-foreground fa-num">
                              {ing.totalCost.toLocaleString("fa-IR")} ت
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Instructions */}
                <div className="p-2.5 rounded-md bg-muted/20 border border-border/40">
                  <span className="font-bold text-muted-foreground block mb-1 text-[11px]">
                    دستورالعمل و الزامات پخت:
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-line">
                    {recipe.instructions}
                  </p>
                </div>

                {/* Yield & Portions Info */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/40 text-center">
                  <div className="p-2 rounded-md bg-muted/30">
                    <span className="text-[10px] text-muted-foreground block">خروجی مورد انتظار:</span>
                    <span className="font-bold text-foreground fa-num">
                      {recipe.expectedYieldQuantity} {recipe.yieldUnit}
                    </span>
                  </div>
                  <div className="p-2 rounded-md bg-muted/30">
                    <span className="text-[10px] text-muted-foreground block">تعداد اسلایس / سهم:</span>
                    <span className="font-bold text-primary fa-num">{recipe.portionCount} سهم</span>
                  </div>
                  <div className="p-2 rounded-md bg-muted/30">
                    <span className="text-[10px] text-muted-foreground block">بهای کل مواد خام:</span>
                    <span className="font-bold text-foreground fa-num">
                      {recipe.totalRawMaterialCost.toLocaleString("fa-IR")} ت
                    </span>
                  </div>
                </div>
              </CardContent>

              {/* ACTION FOOTER - STRICT LOW CURVE (rounded-md, h-9) */}
              <CardFooter className="p-4 pt-2 border-t border-border/50 bg-muted/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-muted-foreground">بهای تمام‌شده هر اسلایس:</span>
                  <span className="text-sm font-black text-foreground ms-1.5 fa-num">
                    {Math.round(recipe.totalRawMaterialCost / (recipe.portionCount || 1)).toLocaleString(
                      "fa-IR"
                    )}{" "}
                    تومان
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    setSelectedRecipeForProd(recipe);
                    setPlannedQty(recipe.portionCount || 12);
                    setActualQty(recipe.portionCount || 12);
                  }}
                  className="h-9 px-3 rounded-md text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs cursor-pointer"
                >
                  <Play className="size-3.5 fill-current" />
                  اجرا و ثبت بچ پخت
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* SUBTAB 2: PRODUCTION ORDERS HISTORY */}
      {activeSubTab === "orders" && (
        <Card className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-xs">
          <div className="p-3 border-b border-border/50 bg-muted/20">
            <h4 className="font-bold text-xs text-foreground">گزارش تاریخچه بچ‌های تولید شده در کافه</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border/60">
                <tr>
                  <th className="p-3 text-start">کد سفارش تولید</th>
                  <th className="p-3 text-start">نام محصول</th>
                  <th className="p-3 text-start">تاریخ تولید</th>
                  <th className="p-3 text-start">تعداد اسلایس اسمی / واقعی</th>
                  <th className="p-3 text-start">هزینه مواد خام</th>
                  <th className="p-3 text-start">دستمزد و سربار</th>
                  <th className="p-3 text-start">بهای تمام‌شده کل</th>
                  <th className="p-3 text-start">بهای واقعی هر اسلایس</th>
                  <th className="p-3 text-start">ضایعات و علت</th>
                  <th className="p-3 text-start">اپراتور</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {productionOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-foreground text-[11px]">{ord.orderNumber}</td>
                    <td className="p-3 font-bold text-foreground">{ord.recipeName}</td>
                    <td className="p-3 text-muted-foreground text-[11px] fa-num">{ord.productionDate}</td>
                    <td className="p-3 font-bold fa-num">
                      {ord.plannedQuantity} / {ord.actualYieldQuantity} {ord.yieldUnit}
                    </td>
                    <td className="p-3 font-medium fa-num">{ord.totalRawMaterialCost.toLocaleString("fa-IR")} ت</td>
                    <td className="p-3 font-medium fa-num text-muted-foreground">
                      {(ord.allocatedLaborCost + ord.allocatedOverheadCost).toLocaleString("fa-IR")} ت
                    </td>
                    <td className="p-3 font-bold text-foreground fa-num">
                      {ord.totalActualCost.toLocaleString("fa-IR")} ت
                    </td>
                    <td className="p-3 font-black text-primary fa-num">
                      {ord.actualCostPerPortion.toLocaleString("fa-IR")} تومان
                    </td>
                    <td className="p-3">
                      {ord.wasteQuantity > 0 ? (
                        <div className="space-y-0.5">
                          <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[10px] rounded-md py-0 fa-num">
                            {ord.wasteQuantity} عدد ضایعات ({ord.wasteCostImpact.toLocaleString("fa-IR")} ت)
                          </Badge>
                          <span className="text-[10px] text-muted-foreground block line-clamp-1">
                            علت: {ord.wasteReason}
                          </span>
                        </div>
                      ) : (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] rounded-md py-0">
                          بدون ضایعات
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground text-[11px]">{ord.operatorName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL: Execute Production Order with Shortage Detection */}
      <Dialog open={!!selectedRecipeForProd} onOpenChange={() => setSelectedRecipeForProd(null)}>
        {selectedRecipeForProd && (
          <DialogContent className="max-w-lg rounded-lg p-5">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <ChefHat className="size-5 text-primary" />
                ثبت و اجرای دستور پخت: {selectedRecipeForProd.name}
              </DialogTitle>
              <DialogDescription className="text-xs">
                کسر خودکار مواد اولیه از کاردکس انبار، محاسبه بهای تمام‌شده بر اساس بازدهی واقعی و ثبت ضایعات
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              {/* Shortages Alert if any */}
              {shortages.length > 0 && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="size-4" />
                    هشدار کسری مواد اولیه در انبار:
                  </div>
                  <ul className="list-disc ps-5 space-y-0.5 text-[11px]">
                    {shortages.map((s, idx) => (
                      <li key={idx}>
                        {s.name} - موجودی: {s.available} {s.unit} (نیاز: {s.required} {s.unit})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">
                    تعداد برنامه‌ریزی‌شده (Planned Yield):
                  </label>
                  <Input
                    type="number"
                    value={plannedQty}
                    onChange={(e) => setPlannedQty(Number(e.target.value))}
                    className="h-8 rounded-md text-xs fa-num"
                  />
                  <span className="text-[10px] text-muted-foreground">مثلاً ۱۲ اسلایس</span>
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">
                    تعداد خروجی سالم محقق‌شده (Actual Yield):
                  </label>
                  <Input
                    type="number"
                    value={actualQty}
                    onChange={(e) => setActualQty(Number(e.target.value))}
                    className="h-8 rounded-md text-xs fa-num"
                  />
                  <span className="text-[10px] text-muted-foreground">مثلاً ۱۰ اسلایس سالم</span>
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">
                    دستمزد مستقیم سرقناد/باریستا (تومان):
                  </label>
                  <Input
                    type="number"
                    value={laborCost}
                    onChange={(e) => setLaborCost(Number(e.target.value))}
                    className="h-8 rounded-md text-xs fa-num"
                  />
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">سربار انرژی و گاز فر (تومان):</label>
                  <Input
                    type="number"
                    value={overheadCost}
                    onChange={(e) => setOverheadCost(Number(e.target.value))}
                    className="h-8 rounded-md text-xs fa-num"
                  />
                </div>
              </div>

              {actualQty < plannedQty && (
                <div>
                  <label className="font-bold text-rose-600 block mb-1">
                    علت بروز ضایعات ({plannedQty - actualQty} اسلایس کسری):
                  </label>
                  <Input
                    value={wasteReason}
                    onChange={(e) => setWasteReason(e.target.value)}
                    placeholder="مثال: سوختگی لبه‌های قالب یا افت حین برش"
                    className="h-8 rounded-md text-xs border-destructive/40"
                  />
                </div>
              )}

              {/* Dynamic Cost Projection */}
              <div className="p-3 bg-muted/40 border border-border/50 rounded-md space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>هزینه مواد خام مصرفی:</span>
                  <span className="font-bold fa-num">
                    {selectedRecipeForProd.totalRawMaterialCost.toLocaleString("fa-IR")} تومان
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>جمع هزینه‌های تولید (مواد + دستمزد + سربار):</span>
                  <span className="font-bold fa-num">
                    {(selectedRecipeForProd.totalRawMaterialCost + laborCost + overheadCost).toLocaleString(
                      "fa-IR"
                    )}{" "}
                    تومان
                  </span>
                </div>
                <div className="flex justify-between font-black text-sm pt-1 border-t border-border/50 text-primary">
                  <span>بهای تمام‌شده بازتوزیع‌شده هر اسلایس سالم:</span>
                  <span className="fa-num">
                    {actualQty > 0
                      ? Math.round(
                          (selectedRecipeForProd.totalRawMaterialCost + laborCost + overheadCost) / actualQty
                        ).toLocaleString("fa-IR")
                      : 0}{" "}
                    تومان
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRecipeForProd(null)}
                className="rounded-md h-8 text-xs cursor-pointer"
              >
                انصراف
              </Button>
              <Button
                variant="default"
                size="sm"
                disabled={shortages.length > 0}
                onClick={handleStartProduction}
                className="rounded-md h-8 text-xs font-bold bg-primary text-primary-foreground cursor-pointer"
              >
                تایید نهایی و کسر از انبار
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
