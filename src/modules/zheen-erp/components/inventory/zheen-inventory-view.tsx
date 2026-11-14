"use client";

import React, { useState } from "react";
import {
  Boxes,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  History,
  Calculator,
  PackagePlus,
  Trash2,
  RefreshCw,
  Sliders,
  DollarSign,
  Calendar,
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
import { InventoryCategoryType, InventoryItem, StockTransactionType, UnitType } from "../../types/zheen-types";

export function ZheenInventoryView() {
  const {
    inventoryItems,
    stockTransactions,
    addInventoryItem,
    adjustStock,
    currentUser,
  } = useZheenStore();

  const [activeCategoryTab, setActiveCategoryTab] = useState<InventoryCategoryType>("RawMaterial");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showTransactionModal, setShowTransactionModal] = useState<boolean>(false);
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState<boolean>(false);

  // Transaction form state
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [txType, setTxType] = useState<StockTransactionType>("Purchase");
  const [txQuantity, setTxQuantity] = useState<number>(1000);
  const [txReason, setTxReason] = useState<string>("شارژ موجودی طبق فاکتور تامین‌کننده");

  // New item form state
  const [newItemCode, setNewItemCode] = useState<string>("RAW-012");
  const [newItemName, setNewItemName] = useState<string>("");
  const [newItemCatType, setNewItemCatType] = useState<InventoryCategoryType>("RawMaterial");
  const [newItemCatName, setNewItemCatName] = useState<string>("لبنیات و پروتئین");
  const [newItemBaseUnit, setNewItemBaseUnit] = useState<UnitType>("g");
  const [newItemPurchaseUnit, setNewItemPurchaseUnit] = useState<UnitType>("kg");
  const [newItemConversion, setNewItemConversion] = useState<number>(1000);
  const [newItemPrice, setNewItemPrice] = useState<number>(65000);
  const [newItemStock, setNewItemStock] = useState<number>(10000);
  const [newItemMinStock, setNewItemMinStock] = useState<number>(3000);
  const [newItemLocation, setNewItemLocation] = useState<string>("سردخانه مرکزی");
  const [newItemSupplier, setNewItemSupplier] = useState<string>("بازرگانی پارس");

  // Unit converter tool state
  const [calcAmount, setCalcAmount] = useState<number>(2.5);
  const [calcFrom, setCalcFrom] = useState<"kg" | "l" | "pack">("kg");

  const filteredItems = inventoryItems.filter((item) => {
    const matchesCat = item.categoryType === activeCategoryTab;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleExecuteTransaction = () => {
    if (!selectedItemId || txQuantity <= 0) {
      toast.error("لطفاً کالا و مقدار معتبر را وارد فرمایید.");
      return;
    }
    const isDeduction =
      txType === "Consumption" || txType === "Waste" || txType === "Return" || txType === "ProductionInput";
    const signedQty = isDeduction ? -Math.abs(txQuantity) : Math.abs(txQuantity);

    const success = adjustStock(selectedItemId, signedQty, txType, txReason);
    if (success) {
      toast.success("تراکنش کاردکس با موفقیت اعمال گردید.");
      setShowTransactionModal(false);
    }
  };

  const handleCreateNewItem = () => {
    if (!newItemName.trim() || !newItemCode.trim()) {
      toast.error("نام و کد کالا الزامی است.");
      return;
    }

    addInventoryItem({
      itemCode: newItemCode,
      name: newItemName,
      categoryType: newItemCatType,
      categoryName: newItemCatName,
      baseUnit: newItemBaseUnit,
      purchaseUnit: newItemPurchaseUnit,
      unitConversionFactor: newItemConversion,
      purchasePrice: newItemPrice,
      currentStock: newItemStock,
      minStockLevel: newItemMinStock,
      storageLocation: newItemLocation,
      supplierName: newItemSupplier,
      purchaseDate: new Date().toLocaleDateString("fa-IR"),
      batchNumber: `B-${Math.floor(1000 + Math.random() * 9000)}`,
    });

    setShowAddItemModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Actions - Strict low curve rounded-md */}
      <Card className="rounded-lg border border-border/70 bg-card p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Boxes className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-foreground">
                مدیریت انبارداری سه‌گانه و کاردکس (Inventory Hub)
              </h3>
              <p className="text-xs text-muted-foreground">
                پشتیبانی از مواد خام، محصولات نیمه‌ساخته، ملزومات بسته‌بندی، تبدیل واحد و حسابداری FIFO
              </p>
            </div>
          </div>

          {/* Action Buttons - STRICT LOW CURVE (rounded-md, h-9) */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                setSelectedItemId(inventoryItems[0]?.id || "");
                setShowTransactionModal(true);
              }}
              className="h-9 px-3 rounded-md text-xs font-bold gap-1.5 cursor-pointer shadow-2xs"
            >
              <PackagePlus className="size-4" />
              ثبت تراکنش کاردکس / خرید
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddItemModal(true)}
              className="h-9 px-3 rounded-md text-xs font-bold gap-1.5 border-border/70 text-foreground hover:bg-muted cursor-pointer"
            >
              <Plus className="size-4 text-primary" />
              تعریف کالای جدید
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowHistoryModal(true)}
              className="h-9 px-2.5 rounded-md text-xs font-semibold border-border/70 text-muted-foreground hover:text-foreground cursor-pointer"
              title="سوابق تراکنش‌ها"
            >
              <History className="size-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCalculatorModal(true)}
              className="h-9 px-2.5 rounded-md text-xs font-semibold border-border/70 text-muted-foreground hover:text-foreground cursor-pointer"
              title="مبدل واحدهای اندازه‌گیری"
            >
              <Calculator className="size-4 text-emerald-600" />
            </Button>
          </div>
        </div>

        {/* 3 Inventory Category Tabs - Strict low curve rounded-md */}
        <div className="flex items-center gap-1.5 pt-3 border-t border-border/50 mt-3 overflow-x-auto pb-1">
          {(
            [
              { id: "RawMaterial", label: "۱. مواد خام اولیه (Raw Materials)", count: inventoryItems.filter((i) => i.categoryType === "RawMaterial").length },
              { id: "SemiFinished", label: "۲. محصولات نیمه‌ساخته (Semi-Finished)", count: inventoryItems.filter((i) => i.categoryType === "SemiFinished").length },
              { id: "PackagingConsumable", label: "۳. ملزومات و بسته‌بندی (Packaging)", count: inventoryItems.filter((i) => i.categoryType === "PackagingConsumable").length },
            ] as const
          ).map((tab) => {
            const isActive = activeCategoryTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategoryTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 h-9 px-3 rounded-md text-xs font-bold shrink-0 transition-all duration-150 cursor-pointer border select-none",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-md font-mono fa-num",
                    isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Inventory Search & Data Table */}
      <Card className="rounded-lg border border-border/70 bg-card shadow-xs overflow-hidden">
        <div className="p-3 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام کالا، کد انبار SKU، دسته‌بندی..."
              className="ps-9 h-9 text-xs rounded-md bg-background"
            />
          </div>

          <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
            <span>تعداد اقلام فیلترشده:</span>
            <span className="font-bold text-foreground fa-num">{filteredItems.length} قلم</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border/60">
              <tr>
                <th className="p-3 text-start">کد کالا</th>
                <th className="p-3 text-start">شرح ماده / کالا</th>
                <th className="p-3 text-start">دسته‌بندی</th>
                <th className="p-3 text-start">موقعیت انبار</th>
                <th className="p-3 text-start">واحد شمارش</th>
                <th className="p-3 text-start">موجودی فعلی</th>
                <th className="p-3 text-start">حداقل سفارش</th>
                <th className="p-3 text-start">بهای خرید هر واحد</th>
                <th className="p-3 text-start">ارزش کل موجودی</th>
                <th className="p-3 text-start">وضعیت موجودی</th>
                <th className="p-3 text-end">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredItems.map((item) => {
                const isLow = item.currentStock <= item.minStockLevel;
                const unitCost = Math.round(item.purchasePrice / (item.unitConversionFactor || 1));
                const totalAssetValue = item.currentStock * unitCost;

                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-foreground text-[11px]">{item.itemCode}</td>
                    <td className="p-3">
                      <span className="font-bold text-foreground block">{item.name}</span>
                      {item.batchNumber && (
                        <span className="text-[10px] text-muted-foreground font-mono">بچ: {item.batchNumber}</span>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground">{item.categoryName}</td>
                    <td className="p-3 text-muted-foreground text-[11px]">{item.storageLocation}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px] rounded-md py-0 text-muted-foreground">
                        {item.baseUnit} ({item.purchaseUnit} = {item.unitConversionFactor} {item.baseUnit})
                      </Badge>
                    </td>
                    <td className="p-3 font-black text-foreground fa-num">
                      {item.currentStock.toLocaleString("fa-IR")} {item.baseUnit}
                    </td>
                    <td className="p-3 text-muted-foreground fa-num">
                      {item.minStockLevel.toLocaleString("fa-IR")} {item.baseUnit}
                    </td>
                    <td className="p-3 font-medium fa-num">
                      {unitCost.toLocaleString("fa-IR")} ت
                    </td>
                    <td className="p-3 font-bold text-foreground fa-num">
                      {totalAssetValue.toLocaleString("fa-IR")} تومان
                    </td>
                    <td className="p-3">
                      {isLow ? (
                        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] rounded-md py-0.5">
                          کسری بحرانی
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] rounded-md py-0.5">
                          تراز مطلوب
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedItemId(item.id);
                          setTxQuantity(item.unitConversionFactor || 1000);
                          setShowTransactionModal(true);
                        }}
                        className="h-7 px-2 rounded-md text-[11px] font-semibold border-primary/40 text-primary hover:bg-primary/10 cursor-pointer"
                      >
                        ورود / خروج
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL 1: Stock Transaction / Purchase / Waste */}
      <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
        <DialogContent className="max-w-md rounded-lg p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <PackagePlus className="size-5 text-primary" />
              ثبت تراکنش کاردکس انبار و ورود/خروج کالا
            </DialogTitle>
            <DialogDescription className="text-xs">
              ثبت رسمی فاکتور خرید، مصرف خط تولید، ضایعات یا اصلاح شمارش انبار
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-bold text-muted-foreground block mb-1">انتخاب کالا:</label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full h-9 rounded-md border border-border/70 bg-background px-3 text-xs"
              >
                {inventoryItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.itemCode}) - موجودی: {item.currentStock} {item.baseUnit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">نوع عملیات:</label>
              <select
                value={txType}
                onChange={(e) => setTxType(e.target.value as StockTransactionType)}
                className="w-full h-9 rounded-md border border-border/70 bg-background px-3 text-xs"
              >
                <option value="Purchase">ورود فاکتور خرید جدید (+)</option>
                <option value="Consumption">مصرف جاری در کافه (-)</option>
                <option value="Waste">ثبت ضایعات و دورریز (-)</option>
                <option value="Return">مرجوعی به تامین‌کننده (-)</option>
                <option value="Adjustment">اصلاح و تعدیل انبارگردانی (+ / -)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">
                مقدار (بر حسب واحد مصرفی کالا):
              </label>
              <Input
                type="number"
                value={txQuantity}
                onChange={(e) => setTxQuantity(Number(e.target.value))}
                className="h-9 rounded-md text-xs fa-num"
              />
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">دلیل یا شماره فاکتور پیگیری:</label>
              <Input
                value={txReason}
                onChange={(e) => setTxReason(e.target.value)}
                placeholder="مثال: فاکتور شماره 409 شرکت پگاه البرز"
                className="h-9 rounded-md text-xs"
              />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTransactionModal(false)}
              className="rounded-md h-8 text-xs cursor-pointer"
            >
              انصراف
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleExecuteTransaction}
              className="rounded-md h-8 text-xs font-bold bg-primary text-primary-foreground cursor-pointer"
            >
              ثبت قطعی در کاردکس
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Add New Item */}
      <Dialog open={showAddItemModal} onOpenChange={setShowAddItemModal}>
        <DialogContent className="max-w-lg rounded-lg p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Plus className="size-5 text-primary" />
              تعریف کالای جدید در سیستم انبارداری
            </DialogTitle>
            <DialogDescription className="text-xs">
              پشتیبانی از تخصیص رسته سه‌گانه، ضرایب تبدیل واحد، قیمت خرید و نقطه سفارش
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-2 text-xs">
            <div>
              <label className="font-bold text-muted-foreground block mb-1">کد کالا SKU:</label>
              <Input
                value={newItemCode}
                onChange={(e) => setNewItemCode(e.target.value)}
                className="h-8 rounded-md text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">نام کامل کالا:</label>
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="مثال: شکلات تلخ ۷۰٪ بلژیکی"
                className="h-8 rounded-md text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">رسته موجودی:</label>
              <select
                value={newItemCatType}
                onChange={(e) => setNewItemCatType(e.target.value as InventoryCategoryType)}
                className="w-full h-8 rounded-md border border-border/70 bg-background px-2 text-xs"
              >
                <option value="RawMaterial">ماده خام اولیه</option>
                <option value="SemiFinished">محصول نیمه‌ساخته</option>
                <option value="PackagingConsumable">ملزومات بسته‌بندی</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">دسته‌بندی:</label>
              <Input
                value={newItemCatName}
                onChange={(e) => setNewItemCatName(e.target.value)}
                className="h-8 rounded-md text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">واحد مصرف پایه (Base):</label>
              <select
                value={newItemBaseUnit}
                onChange={(e) => setNewItemBaseUnit(e.target.value as UnitType)}
                className="w-full h-8 rounded-md border border-border/70 bg-background px-2 text-xs"
              >
                <option value="g">گرم (g)</option>
                <option value="ml">میلی‌لیتر (ml)</option>
                <option value="piece">عدد (piece)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">واحد خرید (Purchase):</label>
              <select
                value={newItemPurchaseUnit}
                onChange={(e) => setNewItemPurchaseUnit(e.target.value as UnitType)}
                className="w-full h-8 rounded-md border border-border/70 bg-background px-2 text-xs"
              >
                <option value="kg">کیلوگرم (kg)</option>
                <option value="l">لیتر (l)</option>
                <option value="box">کارتن / بسته (box)</option>
                <option value="package">بسته چندتایی</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">ضریب تبدیل واحد:</label>
              <Input
                type="number"
                value={newItemConversion}
                onChange={(e) => setNewItemConversion(Number(e.target.value))}
                className="h-8 rounded-md text-xs fa-num"
              />
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">قیمت خرید هر واحد (تومان):</label>
              <Input
                type="number"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(Number(e.target.value))}
                className="h-8 rounded-md text-xs fa-num"
              />
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">موجودی اولیه:</label>
              <Input
                type="number"
                value={newItemStock}
                onChange={(e) => setNewItemStock(Number(e.target.value))}
                className="h-8 rounded-md text-xs fa-num"
              />
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">حداقل موجودی هشدار:</label>
              <Input
                type="number"
                value={newItemMinStock}
                onChange={(e) => setNewItemMinStock(Number(e.target.value))}
                className="h-8 rounded-md text-xs fa-num"
              />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddItemModal(false)}
              className="rounded-md h-8 text-xs cursor-pointer"
            >
              انصراف
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleCreateNewItem}
              className="rounded-md h-8 text-xs font-bold bg-primary text-primary-foreground cursor-pointer"
            >
              ایجاد و ذخیره کالا
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: Stock Transactions History */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="max-w-3xl rounded-lg p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <History className="size-5 text-primary" />
              تاریخچه تراکنش‌های کاردکس انبار (Audit Log)
            </DialogTitle>
            <DialogDescription className="text-xs">
              ثبت تمام رویدادهای ورود، خروج، مصرف و ضایعات به ترتیب زمانی
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[360px] overflow-y-auto border border-border/60 rounded-md">
            <table className="w-full text-xs text-start">
              <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border/60">
                <tr>
                  <th className="p-2.5 text-start">زمان ثبت</th>
                  <th className="p-2.5 text-start">نام کالا</th>
                  <th className="p-2.5 text-start">نوع عملیات</th>
                  <th className="p-2.5 text-start">مقدار</th>
                  <th className="p-2.5 text-start">ارزش ریالی</th>
                  <th className="p-2.5 text-start">توضیحات</th>
                  <th className="p-2.5 text-start">ثبت‌کننده</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {stockTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/20">
                    <td className="p-2.5 text-muted-foreground text-[11px] fa-num">{tx.createdAt}</td>
                    <td className="p-2.5 font-bold text-foreground">{tx.itemName}</td>
                    <td className="p-2.5">
                      <Badge variant="outline" className="text-[10px] rounded-md py-0">
                        {tx.transactionType === "Purchase"
                          ? "ورود خرید"
                          : tx.transactionType === "ProductionInput"
                          ? "مصرف در تولید"
                          : tx.transactionType === "ProductionOutput"
                          ? "خروجی تولید"
                          : tx.transactionType === "Waste"
                          ? "ضایعات"
                          : tx.transactionType}
                      </Badge>
                    </td>
                    <td
                      className={cn(
                        "p-2.5 font-black fa-num",
                        tx.quantity > 0 ? "text-emerald-600" : "text-rose-600"
                      )}
                    >
                      {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity} {tx.unit}
                    </td>
                    <td className="p-2.5 font-medium fa-num text-foreground">
                      {tx.totalCost.toLocaleString("fa-IR")} ت
                    </td>
                    <td className="p-2.5 text-muted-foreground text-[11px]">{tx.reason}</td>
                    <td className="p-2.5 text-muted-foreground text-[11px]">{tx.registeredBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistoryModal(false)}
              className="rounded-md h-8 text-xs cursor-pointer"
            >
              بستن پنجره
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: Unit Conversion Tool */}
      <Dialog open={showCalculatorModal} onOpenChange={setShowCalculatorModal}>
        <DialogContent className="max-w-md rounded-lg p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Calculator className="size-5 text-emerald-600" />
              مبدل و ماشین‌حساب واحدهای اندازه‌گیری قنادی و بار
            </DialogTitle>
            <DialogDescription className="text-xs">
              محاسبه سریع واحدهای خرید عمده به مقادیر گرم و میلی‌لیتر مصرفی در رسپی‌ها
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">مقدار خرید:</label>
                <Input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="h-9 rounded-md text-xs fa-num"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">واحد مبدأ:</label>
                <select
                  value={calcFrom}
                  onChange={(e) => setCalcFrom(e.target.value as "kg" | "l" | "pack")}
                  className="w-full h-9 rounded-md border border-border/70 bg-background px-3 text-xs"
                >
                  <option value="kg">کیلوگرم (kg)</option>
                  <option value="l">لیتر (l)</option>
                  <option value="pack">کارتن / بسته ۱۰۰ تایی</option>
                </select>
              </div>
            </div>

            {/* Converted Output Card */}
            <div className="p-3 bg-muted/30 border border-border/50 rounded-md space-y-1.5 text-xs">
              <span className="font-bold text-muted-foreground block">خروجی معادل در رسپی‌ها:</span>
              {calcFrom === "kg" && (
                <div className="text-foreground font-black text-sm fa-num">
                  = {(calcAmount * 1000).toLocaleString("fa-IR")} گرم (g)
                </div>
              )}
              {calcFrom === "l" && (
                <div className="text-foreground font-black text-sm fa-num">
                  = {(calcAmount * 1000).toLocaleString("fa-IR")} میلی‌لیتر (ml)
                </div>
              )}
              {calcFrom === "pack" && (
                <div className="text-foreground font-black text-sm fa-num">
                  = {(calcAmount * 100).toLocaleString("fa-IR")} عدد ظرف / چنگال / جعبه
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCalculatorModal(false)}
              className="rounded-md h-8 text-xs cursor-pointer"
            >
              بستن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
