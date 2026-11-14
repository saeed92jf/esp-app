"use client";

import React, { useState } from "react";
import {
  Boxes,
  Plus,
  AlertTriangle,
  FileText,
  DollarSign,
  TrendingUp,
  Percent,
  Search,
  CheckCircle2,
  Trash2,
  PackagePlus,
  RefreshCw,
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
import { RawMaterial, BomRecipe, WasteRecord } from "../types";

interface InventoryBomViewProps {
  materials: RawMaterial[];
  bomRecipes: BomRecipe[];
  wasteRecords: WasteRecord[];
  onAddMaterialStock: (materialId: string, quantity: number) => void;
  onAddWasteRecord: (waste: WasteRecord) => void;
}

export function InventoryBomView({
  materials,
  bomRecipes,
  wasteRecords,
  onAddMaterialStock,
  onAddWasteRecord,
}: InventoryBomViewProps) {
  const [activeTab, setActiveTab] = useState<"stock" | "bom" | "waste">("stock");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Quick Purchase Invoice Modal
  const [purchaseModalOpen, setPurchaseModalOpen] = useState<boolean>(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(materials[0]?.id || "");
  const [purchaseQty, setPurchaseQty] = useState<number>(1000);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);

  // Quick Waste Modal
  const [wasteModalOpen, setWasteModalOpen] = useState<boolean>(false);
  const [wasteMaterialId, setWasteMaterialId] = useState<string>(materials[0]?.id || "");
  const [wasteQty, setWasteQty] = useState<number>(100);
  const [wasteReason, setWasteReason] = useState<"spoilage" | "expired" | "damaged" | "testing">("spoilage");

  // Calculations
  const lowStockMaterials = materials.filter((m) => m.currentStock <= m.minStock);
  const totalStockValue = materials.reduce((acc, m) => acc + m.currentStock * m.unitCost, 0);

  const filteredMaterials = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSavePurchase = () => {
    if (!selectedMaterialId || purchaseQty <= 0) {
      toast.error("لطفاً ماده اولیه و مقدار معتبر را مشخص فرمایید.");
      return;
    }
    onAddMaterialStock(selectedMaterialId, purchaseQty);
    const mat = materials.find((m) => m.id === selectedMaterialId);
    toast.success(`فاکتور خرید ثبت شد: ${purchaseQty} ${mat?.unit || "واحد"} به موجودی ${mat?.name} اضافه گردید.`);
    setPurchaseModalOpen(false);
  };

  const handleSaveWaste = () => {
    const mat = materials.find((m) => m.id === wasteMaterialId);
    if (!mat || wasteQty <= 0) {
      toast.error("لطفاً مقادیر معتبر را وارد کنید.");
      return;
    }
    const costImpact = wasteQty * mat.unitCost;
    const newWaste: WasteRecord = {
      id: `wst-${Date.now()}`,
      materialId: mat.id,
      materialName: mat.name,
      quantity: wasteQty,
      unit: mat.unit,
      costImpact,
      reason: wasteReason,
      reasonLabel:
        wasteReason === "expired"
          ? "انقضای تاریخ مصرف"
          : wasteReason === "spoilage"
          ? "فساد و خرابی"
          : wasteReason === "testing"
          ? "تست و کالیبراسیون باریستا"
          : "آسیب فیزیکی",
      date: new Date().toLocaleDateString("fa-IR"),
      registeredBy: "کاربر سامانه",
    };

    onAddWasteRecord(newWaste);
    // Deduct from stock
    onAddMaterialStock(mat.id, -wasteQty);
    toast.warning(`ثبت ضایعات: ${wasteQty} ${mat.unit} از موجودی کسر گردید.`);
    setWasteModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border border-border/70 rounded-lg p-3.5 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">کل اقلام انبار مواد اولیه:</span>
            <Boxes className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-black mt-2 text-foreground fa-num">{materials.length} قلم</div>
          <p className="text-[11px] text-muted-foreground mt-1">مدیریت مواد خام تخصصی کافه</p>
        </Card>

        <Card className="border border-border/70 rounded-lg p-3.5 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">هشدار کسری موجودی:</span>
            <AlertTriangle className="size-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black mt-2 text-amber-600 dark:text-amber-400 fa-num">
            {lowStockMaterials.length} مورد
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">کمتر از نقطه سفارش بحرانی</p>
        </Card>

        <Card className="border border-border/70 rounded-lg p-3.5 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">ارزش ریالی موجودی انبار:</span>
            <DollarSign className="size-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black mt-2 text-emerald-600 dark:text-emerald-400 fa-num">
            {totalStockValue.toLocaleString("fa-IR")}
            <span className="text-xs font-medium ms-1">تومان</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">بر اساس آخرین بهای خرید میانگین</p>
        </Card>

        <Card className="border border-border/70 rounded-lg p-3.5 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">فرمول‌های ساخت فعال (BOM):</span>
            <Percent className="size-4 text-primary" />
          </div>
          <div className="text-2xl font-black mt-2 text-foreground fa-num">{bomRecipes.length} فرمول</div>
          <p className="text-[11px] text-muted-foreground mt-1">محاسبه خودکار بهای تمام‌شده Food Cost</p>
        </Card>
      </div>

      {/* Main Container */}
      <Card className="border border-border/70 bg-card rounded-lg shadow-xs overflow-hidden">
        {/* Navigation & Action Header */}
        <CardHeader className="p-4 border-b border-border/50 bg-muted/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Tabs - STRICT LOW CURVE rounded-md */}
            <div className="flex items-center gap-1.5">
              {(
                [
                  { id: "stock", label: "موجودی انبار مواد اولیه" },
                  { id: "bom", label: "فرمول ساخت و بهای تمام‌شده (BOM)" },
                  { id: "waste", label: "گزارش ضایعات و دورریز" },
                ] as const
              ).map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "h-9 px-3 rounded-md text-xs font-bold transition-all duration-150 cursor-pointer border select-none",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                        : "bg-background text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* ACTION BUTTONS - STRICT LOW CURVE (rounded-md, h-9) */}
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setPurchaseModalOpen(true)}
                className="h-9 rounded-md px-3 text-xs font-bold gap-1.5 cursor-pointer shadow-2xs"
              >
                <PackagePlus className="size-4 shrink-0" />
                ثبت فاکتور خرید جدید
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setWasteModalOpen(true)}
                className="h-9 rounded-md px-3 text-xs font-bold gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                <Trash2 className="size-4 shrink-0" />
                ثبت ضایعات
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Tab 1: Raw Materials Stock */}
        {activeTab === "stock" && (
          <CardContent className="p-4 space-y-3">
            <div className="relative max-w-sm">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی مواد اولیه، کد انبار SKU..."
                className="ps-9 h-9 text-xs rounded-md"
              />
            </div>

            <div className="overflow-x-auto rounded-md border border-border/60">
              <table className="w-full text-xs text-start">
                <thead className="bg-muted/60 text-muted-foreground font-bold border-b border-border/60">
                  <tr>
                    <th className="p-3 text-start">کد انبار</th>
                    <th className="p-3 text-start">نام ماده اولیه</th>
                    <th className="p-3 text-start">دسته‌بندی</th>
                    <th className="p-3 text-start">موجودی فعلی</th>
                    <th className="p-3 text-start">حداقل موجودی هشدار</th>
                    <th className="p-3 text-start">نرخ واحد خرید</th>
                    <th className="p-3 text-start">ارزش کل موجودی</th>
                    <th className="p-3 text-start">وضعیت انبار</th>
                    <th className="p-3 text-end">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredMaterials.map((mat) => {
                    const isLow = mat.currentStock <= mat.minStock;
                    const stockVal = mat.currentStock * mat.unitCost;
                    return (
                      <tr key={mat.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono text-[11px] text-muted-foreground">{mat.sku}</td>
                        <td className="p-3 font-bold text-foreground">{mat.name}</td>
                        <td className="p-3 text-muted-foreground">{mat.category}</td>
                        <td className="p-3 font-black fa-num">
                          {mat.currentStock.toLocaleString("fa-IR")} {mat.unit}
                        </td>
                        <td className="p-3 text-muted-foreground fa-num">
                          {mat.minStock.toLocaleString("fa-IR")} {mat.unit}
                        </td>
                        <td className="p-3 fa-num">{mat.unitCost.toLocaleString("fa-IR")} ت</td>
                        <td className="p-3 font-bold text-foreground fa-num">
                          {stockVal.toLocaleString("fa-IR")} ت
                        </td>
                        <td className="p-3">
                          {isLow ? (
                            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] rounded-md py-0.5">
                              کسری موجودی
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] rounded-md py-0.5">
                              مطلوب
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedMaterialId(mat.id);
                              setPurchaseModalOpen(true);
                            }}
                            className="h-7 px-2.5 rounded-md text-[11px] font-semibold border-primary/40 text-primary hover:bg-primary/10 cursor-pointer"
                          >
                            شارژ موجودی
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}

        {/* Tab 2: BOM Recipes & Food Cost */}
        {activeTab === "bom" && (
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bomRecipes.map((recipe) => (
                <Card key={recipe.id} className="border border-border/70 rounded-lg p-3.5 bg-card shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <h4 className="font-bold text-sm text-foreground">{recipe.menuItemName}</h4>
                    <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] rounded-md">
                      BOM فعال
                    </Badge>
                  </div>

                  <div className="space-y-1.5 my-3 text-xs">
                    <span className="text-[11px] font-bold text-muted-foreground block mb-1">
                      مواد اولیه مصرفی در هر وعده:
                    </span>
                    {recipe.ingredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1 px-2 rounded-md bg-muted/40 text-muted-foreground"
                      >
                        <span className="text-foreground">{ing.materialName}</span>
                        <span className="font-mono fa-num">
                          {ing.quantity} {ing.unit} ({ing.totalCost.toLocaleString("fa-IR")} ت)
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-border/50 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>بهای تمام‌شده هر سروینگ (Food Cost):</span>
                      <span className="font-bold text-foreground fa-num">
                        {recipe.totalCost.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>قیمت فروش پیشنهادی در منو:</span>
                      <span className="font-black text-primary fa-num">
                        {recipe.suggestedSellingPrice.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-emerald-600 font-bold pt-1">
                      <span>حاشیه سود ناخالص (Gross Margin):</span>
                      <span className="fa-num">٪{recipe.marginPercent}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        )}

        {/* Tab 3: Waste Records */}
        {activeTab === "waste" && (
          <CardContent className="p-4 space-y-3">
            <div className="overflow-x-auto rounded-md border border-border/60">
              <table className="w-full text-xs text-start">
                <thead className="bg-muted/60 text-muted-foreground font-bold border-b border-border/60">
                  <tr>
                    <th className="p-3 text-start">تاریخ ثبت</th>
                    <th className="p-3 text-start">ماده اولیه</th>
                    <th className="p-3 text-start">مقدار دورریز</th>
                    <th className="p-3 text-start">زیان ریالی</th>
                    <th className="p-3 text-start">علت ضایعات</th>
                    <th className="p-3 text-start">ثبت‌کننده</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {wasteRecords.map((w) => (
                    <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 fa-num text-muted-foreground">{w.date}</td>
                      <td className="p-3 font-bold text-foreground">{w.materialName}</td>
                      <td className="p-3 text-destructive font-bold fa-num">
                        {w.quantity} {w.unit}
                      </td>
                      <td className="p-3 text-destructive font-black fa-num">
                        {w.costImpact.toLocaleString("fa-IR")} تومان
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px] rounded-md py-0.5">
                          {w.reasonLabel}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{w.registeredBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Purchase Invoice Modal */}
      <Dialog open={purchaseModalOpen} onOpenChange={setPurchaseModalOpen}>
        <DialogContent className="max-w-md rounded-lg p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <PackagePlus className="size-5 text-primary" />
              ثبت فاکتور خرید و افزایش موجودی انبار
            </DialogTitle>
            <DialogDescription className="text-xs">
              ثبت ورود کالا و محاسبه خودکار میانگین موزون بهای تمام‌شده
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-bold text-muted-foreground block mb-1">انتخاب ماده اولیه:</label>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full h-9 rounded-md border border-border/70 bg-background px-3 text-xs"
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">
                مقدار خرید (بر حسب واحد مصرفی ماده):
              </label>
              <Input
                type="number"
                value={purchaseQty}
                onChange={(e) => setPurchaseQty(Number(e.target.value))}
                className="h-9 rounded-md text-xs fa-num"
              />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPurchaseModalOpen(false)}
              className="rounded-md h-8 text-xs cursor-pointer"
            >
              انصراف
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSavePurchase}
              className="rounded-md h-8 text-xs font-bold bg-primary text-primary-foreground cursor-pointer"
            >
              ذخیره و ثبت ورود به انبار
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Waste Registration Modal */}
      <Dialog open={wasteModalOpen} onOpenChange={setWasteModalOpen}>
        <DialogContent className="max-w-md rounded-lg p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
              <Trash2 className="size-5 text-destructive" />
              ثبت ضایعات و دورریز مواد اولیه
            </DialogTitle>
            <DialogDescription className="text-xs">
              کسر مستقیم از کاردکس انبار و ثبت زیان در سرفصل ضایعات کافه
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-bold text-muted-foreground block mb-1">انتخاب ماده دورریز شده:</label>
              <select
                value={wasteMaterialId}
                onChange={(e) => setWasteMaterialId(e.target.value)}
                className="w-full h-9 rounded-md border border-border/70 bg-background px-3 text-xs"
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">مقدار ضایعات:</label>
              <Input
                type="number"
                value={wasteQty}
                onChange={(e) => setWasteQty(Number(e.target.value))}
                className="h-9 rounded-md text-xs fa-num"
              />
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">علت ضایعات:</label>
              <select
                value={wasteReason}
                onChange={(e) =>
                  setWasteReason(e.target.value as "spoilage" | "expired" | "damaged" | "testing")
                }
                className="w-full h-9 rounded-md border border-border/70 bg-background px-3 text-xs"
              >
                <option value="spoilage">فساد، ترشیدگی یا خرابی طعم</option>
                <option value="expired">انقضای تاریخ مصرف</option>
                <option value="testing">کالیبراسیون دستگاه و تست کیفیت</option>
                <option value="damaged">آسیب فیزیکی و ریختن تصادفی</option>
              </select>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWasteModalOpen(false)}
              className="rounded-md h-8 text-xs cursor-pointer"
            >
              انصراف
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSaveWaste}
              className="rounded-md h-8 text-xs font-bold cursor-pointer"
            >
              ثبت قطعی ضایعات و کسر موجودی
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
