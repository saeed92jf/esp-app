"use client";

import React, { useState, useMemo } from "react";
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
  Truck,
  Receipt,
  Coins,
  FileSpreadsheet,
  ArrowDownToLine,
  Building2,
  Sparkles,
  CheckCircle2,
  CreditCard,
  Layers,
  HelpCircle,
  Eye,
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
import {
  InventoryCategoryType,
  InventoryItem,
  StockTransactionType,
  UnitType,
  LandedCostType,
  AllocationMethod,
  PurchaseInvoiceItem,
  LandedCostEntry,
  PurchaseInvoice,
} from "../../types/zheen-types";

type InventoryViewTab = InventoryCategoryType | "LandedCosts" | "Invoices" | "StockLedger";

interface NewInvoiceLineDraft {
  id: string;
  itemId: string;
  quantity: number; // in purchaseUnit
  unitPrice: number; // in purchaseUnit
  discountAmount: number;
  taxAmount: number;
  batchNumber?: string;
  expiryDate?: string;
}

interface NewLandedCostDraft {
  id: string;
  costType: LandedCostType;
  titleFa: string;
  amount: number;
  paidTo?: string;
  paymentMethod: "Cash" | "Card" | "Credit";
  notes?: string;
}

export function ZheenInventoryView() {
  const {
    inventoryItems,
    stockTransactions,
    purchaseInvoices,
    addInventoryItem,
    adjustStock,
    createPurchaseInvoice,
    addLandedCostToInvoice,
    currentUser,
  } = useZheenStore();

  const [activeCategoryTab, setActiveCategoryTab] = useState<InventoryViewTab>("RawMaterial");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [showPurchaseInvoiceModal, setShowPurchaseInvoiceModal] = useState<boolean>(false);
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
  const [showQuickTxModal, setShowQuickTxModal] = useState<boolean>(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState<boolean>(false);
  const [showAddLandedCostModal, setShowAddLandedCostModal] = useState<boolean>(false);
  const [selectedInvoiceForLanded, setSelectedInvoiceForLanded] = useState<string>("");

  // Quick Transaction Modal State
  const [quickItemId, setQuickItemId] = useState<string>("");
  const [quickTxType, setQuickTxType] = useState<StockTransactionType>("Purchase");
  const [quickTxQty, setQuickTxQty] = useState<number>(1000);
  const [quickTxReason, setQuickTxReason] = useState<string>("شارژ سریع موجودی انبار");

  // New Item Definition State
  const [newItemCode, setNewItemCode] = useState<string>(`RAW-${Math.floor(10 + Math.random() * 90)}`);
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
  const [newItemSupplier, setNewItemSupplier] = useState<string>("شرکت پخش پگاه");

  // Purchase Invoice Wizard State
  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    `PUR-1404-${Math.floor(100 + Math.random() * 900)}`
  );
  const [supplierName, setSupplierName] = useState<string>("روستری تخصصی ژین");
  const [invoiceDate, setInvoiceDate] = useState<string>("1404/08/25");
  const [destinationStorage, setDestinationStorage] = useState<string>("سردخانه مرکزی");
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Credit" | "Partial">("Paid");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card" | "BankTransfer" | "Credit">("Card");
  const [allocationMethod, setAllocationMethod] = useState<AllocationMethod>("ByValue");
  const [invoiceModalTab, setInvoiceModalTab] = useState<"items" | "landed" | "accounting">("items");

  // Draft invoice items & landed costs
  const [invoiceLines, setInvoiceLines] = useState<NewInvoiceLineDraft[]>([
    {
      id: "line-1",
      itemId: inventoryItems[0]?.id || "inv-flour",
      quantity: 10,
      unitPrice: inventoryItems[0]?.purchasePrice || 42000,
      discountAmount: 0,
      taxAmount: 0,
    },
  ]);

  const [invoiceLandedCosts, setInvoiceLandedCosts] = useState<NewLandedCostDraft[]>([
    {
      id: "lc-draft-1",
      costType: "Freight",
      titleFa: "کرایه پیک وانت و باربری حمل به کافه",
      amount: 150000,
      paidTo: "اسنپ بار / راننده توزیع",
      paymentMethod: "Cash",
      notes: "کرایه حمل مستقیم تا درب کافه",
    },
  ]);

  // Supplementary Landed Cost Modal State
  const [suppCostType, setSuppCostType] = useState<LandedCostType>("Freight");
  const [suppTitle, setSuppTitle] = useState<string>("کرایه مازاد باربری");
  const [suppAmount, setSuppAmount] = useState<number>(85000);
  const [suppPaidTo, setSuppPaidTo] = useState<string>("پیک وانت");
  const [suppPayMethod, setSuppPayMethod] = useState<"Cash" | "Card" | "Credit">("Cash");
  const [suppNotes, setSuppNotes] = useState<string>("");

  // Unit converter state
  const [calcAmount, setCalcAmount] = useState<number>(2.5);
  const [calcFrom, setCalcFrom] = useState<"kg" | "l" | "box">("kg");

  // Filtered Items for standard inventory tables
  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchesCat = item.categoryType === activeCategoryTab;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.itemCode.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q) ||
        item.supplierName.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [inventoryItems, activeCategoryTab, searchQuery]);

  // Landed Costs list aggregated from all purchase invoices
  const allLandedCosts = useMemo(() => {
    const list: Array<LandedCostEntry & { invoiceNumber: string; invoiceDate: string; supplierName: string; invoiceId: string }> = [];
    purchaseInvoices.forEach((inv) => {
      inv.landedCosts.forEach((lc) => {
        list.push({
          ...lc,
          invoiceNumber: inv.invoiceNumber,
          invoiceDate: inv.invoiceDate,
          supplierName: inv.supplierName,
          invoiceId: inv.id,
        });
      });
    });
    return list;
  }, [purchaseInvoices]);

  const totalAllLandedCostsAmount = useMemo(() => {
    return allLandedCosts.reduce((acc, c) => acc + c.amount, 0);
  }, [allLandedCosts]);

  const totalAllPurchasesAmount = useMemo(() => {
    return purchaseInvoices.reduce((acc, inv) => acc + inv.netItemsAmount, 0);
  }, [purchaseInvoices]);

  const averageLandedBurdenPercent = useMemo(() => {
    if (totalAllPurchasesAmount === 0) return 0;
    return Math.round((totalAllLandedCostsAmount / totalAllPurchasesAmount) * 1000) / 10;
  }, [totalAllLandedCostsAmount, totalAllPurchasesAmount]);

  // Calculations for current purchase invoice draft
  const calculatedInvoiceSummary = useMemo(() => {
    let itemsSubtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    const detailedItems: PurchaseInvoiceItem[] = invoiceLines.map((line) => {
      const itemDef = inventoryItems.find((i) => i.id === line.itemId);
      const conversion = itemDef?.unitConversionFactor || 1000;
      const baseUnitQty = line.quantity * conversion;
      const grossPrice = line.quantity * line.unitPrice;
      const netLine = Math.max(0, grossPrice - (line.discountAmount || 0) + (line.taxAmount || 0));

      itemsSubtotal += grossPrice;
      totalDiscount += line.discountAmount || 0;
      totalTax += line.taxAmount || 0;

      const baseUnitPrice = baseUnitQty > 0 ? netLine / baseUnitQty : line.unitPrice / conversion;

      return {
        id: line.id,
        itemId: line.itemId,
        itemCode: itemDef?.itemCode || "RAW",
        itemName: itemDef?.name || "کالای نامشخص",
        categoryType: itemDef?.categoryType || "RawMaterial",
        quantity: line.quantity,
        purchaseUnit: itemDef?.purchaseUnit || "kg",
        unitPrice: line.unitPrice,
        discountAmount: line.discountAmount || 0,
        taxAmount: line.taxAmount || 0,
        totalNetPrice: netLine,
        baseUnit: itemDef?.baseUnit || "g",
        baseUnitQuantity: baseUnitQty,
        baseUnitPrice: Math.round(baseUnitPrice * 100) / 100,
        allocatedLandedCost: 0,
        finalLandedUnitPrice: Math.round(baseUnitPrice * 100) / 100,
        batchNumber: line.batchNumber || invoiceNumber,
        expiryDate: line.expiryDate,
      };
    });

    const netItemsAmount = Math.max(0, itemsSubtotal - totalDiscount + totalTax);
    const totalLandedCost = invoiceLandedCosts.reduce((a, b) => a + (b.amount || 0), 0);
    const totalBaseQty = detailedItems.reduce((a, b) => a + b.baseUnitQuantity, 0);

    // Landed cost allocation across items
    const itemsWithLanded = detailedItems.map((item) => {
      let allocatedShare = 0;
      if (totalLandedCost > 0) {
        if (allocationMethod === "ByValue") {
          const ratio = netItemsAmount > 0 ? item.totalNetPrice / netItemsAmount : 1 / detailedItems.length;
          allocatedShare = Math.round(totalLandedCost * ratio);
        } else if (allocationMethod === "ByQuantity") {
          const ratio = totalBaseQty > 0 ? item.baseUnitQuantity / totalBaseQty : 1 / detailedItems.length;
          allocatedShare = Math.round(totalLandedCost * ratio);
        } else {
          allocatedShare = Math.round(totalLandedCost / detailedItems.length);
        }
      }

      const totalItemWithLanded = item.totalNetPrice + allocatedShare;
      const finalUnitCost =
        item.baseUnitQuantity > 0
          ? Math.round((totalItemWithLanded / item.baseUnitQuantity) * 100) / 100
          : item.baseUnitPrice;

      return {
        ...item,
        allocatedLandedCost: allocatedShare,
        finalLandedUnitPrice: finalUnitCost,
      };
    });

    const grandTotal = netItemsAmount + totalLandedCost;

    return {
      itemsSubtotal,
      totalDiscount,
      totalTax,
      netItemsAmount,
      totalLandedCost,
      grandTotal,
      itemsWithLanded,
    };
  }, [invoiceLines, invoiceLandedCosts, inventoryItems, allocationMethod, invoiceNumber]);

  // Quick Pick preset buttons for Café
  const quickPickItems = [
    { id: "inv-milk", label: "+ شیر باریستا ۳.۲٪", qty: 20, price: 65000 },
    { id: "inv-coffee-beans", label: "+ دانه کلمبیا سوپریمو", qty: 10, price: 920000 },
    { id: "inv-blue-powder", label: "+ پودر شکلات آبی اصیل", qty: 3, price: 1200000 },
    { id: "inv-butter", label: "+ کره حیوانی پاستوریزه", qty: 5, price: 380000 },
    { id: "inv-flour", label: "+ آرد نول قنادی", qty: 25, price: 42000 },
    { id: "inv-sugar", label: "+ شکر سفید قنادی", qty: 20, price: 48000 },
    { id: "inv-eggs", label: "+ تخم‌مرغ محلی", qty: 4, price: 150000 },
  ];

  const handleAddQuickPick = (preset: typeof quickPickItems[0]) => {
    const existingIdx = invoiceLines.findIndex((l) => l.itemId === preset.id);
    if (existingIdx !== -1) {
      setInvoiceLines((prev) =>
        prev.map((l, idx) => (idx === existingIdx ? { ...l, quantity: l.quantity + preset.qty } : l))
      );
      toast.info(`مقدار ${preset.label} افزایش یافت.`);
    } else {
      setInvoiceLines((prev) => [
        ...prev,
        {
          id: `line-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          itemId: preset.id,
          quantity: preset.qty,
          unitPrice: preset.price,
          discountAmount: 0,
          taxAmount: 0,
        },
      ]);
      toast.success(`${preset.label} به فاکتور خرید افزوده شد.`);
    }
  };

  const handleAddCustomLine = () => {
    const firstItem = inventoryItems[0];
    setInvoiceLines((prev) => [
      ...prev,
      {
        id: `line-${Date.now()}`,
        itemId: firstItem?.id || "",
        quantity: 5,
        unitPrice: firstItem?.purchasePrice || 50000,
        discountAmount: 0,
        taxAmount: 0,
      },
    ]);
  };

  const handleRemoveLine = (id: string) => {
    if (invoiceLines.length <= 1) {
      toast.error("فاکتور خرید حداقل باید شامل یک سطر کالا باشد.");
      return;
    }
    setInvoiceLines((prev) => prev.filter((l) => l.id !== id));
  };

  const handleAddLandedCostDraft = (type: LandedCostType, titleFa: string, defaultAmount: number) => {
    setInvoiceLandedCosts((prev) => [
      ...prev,
      {
        id: `lc-draft-${Date.now()}`,
        costType: type,
        titleFa,
        amount: defaultAmount,
        paidTo: "شرکت باربری / پیک",
        paymentMethod: "Cash",
      },
    ]);
    toast.success(`هزینه جانبی «${titleFa}» افزوده شد.`);
  };

  const handleSavePurchaseInvoice = () => {
    if (invoiceLines.length === 0) {
      toast.error("لطفاً حداقل یک قلم کالا در فاکتور وارد فرمایید.");
      return;
    }

    if (!supplierName.trim()) {
      toast.error("نام تأمین‌کننده الزامی است.");
      return;
    }

    const { itemsWithLanded, netItemsAmount, totalDiscount, totalTax, itemsSubtotal, totalLandedCost, grandTotal } =
      calculatedInvoiceSummary;

    const formattedLandedCosts: LandedCostEntry[] = invoiceLandedCosts.map((lc) => ({
      id: lc.id,
      costType: lc.costType,
      titleFa: lc.titleFa,
      amount: lc.amount,
      paidTo: lc.paidTo || "نامشخص",
      paymentMethod: lc.paymentMethod,
      notes: lc.notes,
    }));

    const result = createPurchaseInvoice({
      invoiceNumber,
      supplierName,
      invoiceDate,
      destinationStorage,
      paymentStatus,
      paymentMethod,
      items: itemsWithLanded,
      itemsTotalAmount: itemsSubtotal,
      totalDiscount,
      totalTax,
      netItemsAmount,
      landedCosts: formattedLandedCosts,
      totalLandedCost,
      allocationMethod,
      grandTotal,
      registeredBy: currentUser.name,
      notes: `خرید ثبت‌شده از طریق پورتال حسابداری انبار کافه ژین`,
    });

    if (result.success) {
      setShowPurchaseInvoiceModal(false);
      // Reset invoice number for next entry
      setInvoiceNumber(`PUR-1404-${Math.floor(100 + Math.random() * 900)}`);
    }
  };

  const handleSaveSupplementaryLandedCost = () => {
    if (!selectedInvoiceForLanded) {
      toast.error("لطفاً فاکتور خرید مرجع را انتخاب فرمایید.");
      return;
    }
    if (suppAmount <= 0) {
      toast.error("مبلغ هزینه جانبی معتبر نیست.");
      return;
    }

    const res = addLandedCostToInvoice(selectedInvoiceForLanded, {
      costType: suppCostType,
      titleFa: suppTitle,
      amount: suppAmount,
      paidTo: suppPaidTo,
      paymentMethod: suppPayMethod,
      notes: suppNotes,
    });

    if (res.success) {
      setShowAddLandedCostModal(false);
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
    <div className="space-y-4 text-start font-sans">
      {/* ── Top Executive Action Bar ── */}
      <Card className="rounded-lg border border-border/70 bg-card p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-md bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Boxes className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-foreground">
                  مدیریت انبارداری، فاکتورهای خرید و هزینه‌های جانبی
                </h3>
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] rounded-md py-0">
                  حسابداری استاندارد FIFO
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                ورود روان و فوق‌سریع مواد اولیه، تفکیک کامل هزینه‌های جانبی خرید (Landed Costs) و تسهیم بر بهای تمام‌شده
              </p>
            </div>
          </div>

          {/* Action Buttons - Strict low curve rounded-md */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Action Button: Dedicated Fast Purchase Invoice */}
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                setShowPurchaseInvoiceModal(true);
              }}
              className="h-9 px-3.5 rounded-md text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
            >
              <PackagePlus className="size-4" />
              <span>ثبت فاکتور خرید مواد اولیه (GRN)</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddItemModal(true)}
              className="h-9 px-3 rounded-md text-xs font-bold gap-1.5 border-border/70 text-foreground hover:bg-muted cursor-pointer"
            >
              <Plus className="size-4 text-primary" />
              <span>تعریف کالای جدید</span>
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

        {/* ── Main Category & Subsystem Tabs ── */}
        <div className="flex items-center gap-1.5 pt-3 border-t border-border/50 mt-3 overflow-x-auto pb-1">
          {[
            {
              id: "RawMaterial" as const,
              label: "۱. مواد خام اولیه",
              icon: Boxes,
              count: inventoryItems.filter((i) => i.categoryType === "RawMaterial").length,
            },
            {
              id: "SemiFinished" as const,
              label: "۲. محصولات نیمه‌ساخته (BOM)",
              icon: Layers,
              count: inventoryItems.filter((i) => i.categoryType === "SemiFinished").length,
            },
            {
              id: "PackagingConsumable" as const,
              label: "۳. ملزومات و بسته‌بندی",
              icon: Receipt,
              count: inventoryItems.filter((i) => i.categoryType === "PackagingConsumable").length,
            },
            {
              id: "LandedCosts" as const,
              label: "🚚 هزینه‌های جانبی و باربری خرید (Landed Costs)",
              icon: Truck,
              count: allLandedCosts.length,
              highlight: true,
            },
            {
              id: "Invoices" as const,
              label: "📑 آرشیو فاکتورهای خرید",
              icon: FileSpreadsheet,
              count: purchaseInvoices.length,
            },
            {
              id: "StockLedger" as const,
              label: "📊 کاردکس و گردش ریالی",
              icon: History,
              count: stockTransactions.length,
            },
          ].map((tab) => {
            const isActive = activeCategoryTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategoryTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 h-9 px-3 rounded-md text-xs font-bold shrink-0 transition-all duration-150 cursor-pointer border select-none",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                    : tab.highlight
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="size-3.5 shrink-0" />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-md font-mono fa-num",
                    isActive
                      ? "bg-white/20 text-white"
                      : tab.highlight
                      ? "bg-amber-500/20 text-amber-800 dark:text-amber-200"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* ────────────────────────────────────────────────────────── */}
      {/* VIEW A: STANDARD INVENTORY ITEMS (Raw / Semi / Packaging)   */}
      {/* ────────────────────────────────────────────────────────── */}
      {(activeCategoryTab === "RawMaterial" ||
        activeCategoryTab === "SemiFinished" ||
        activeCategoryTab === "PackagingConsumable") && (
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

            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                <span>اقلام فیلترشده:</span>
                <span className="font-bold text-foreground fa-num">{filteredItems.length} قلم</span>
              </div>
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
                  <th className="p-3 text-start">حداقل نقطه سفارش</th>
                  <th className="p-3 text-start">بهای خرید هر واحد</th>
                  <th className="p-3 text-start">ارزش کل موجودی</th>
                  <th className="p-3 text-start">وضعیت</th>
                  <th className="p-3 text-end">عملیات خرید / کاردکس</th>
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
                        {item.supplierName && (
                          <span className="text-[10px] text-muted-foreground">تأمین‌کننده: {item.supplierName}</span>
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
                          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px] rounded-md py-0.5">
                            کسری موجودی
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] rounded-md py-0.5">
                            تراز مطلوب
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              // Open purchase invoice prefilled with this item
                              setInvoiceLines([
                                {
                                  id: `line-${Date.now()}`,
                                  itemId: item.id,
                                  quantity: 10,
                                  unitPrice: item.purchasePrice,
                                  discountAmount: 0,
                                  taxAmount: 0,
                                },
                              ]);
                              setShowPurchaseInvoiceModal(true);
                            }}
                            className="h-7 px-2 rounded-md text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          >
                            <PackagePlus className="size-3.5 me-1" />
                            ورود فاکتور
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setQuickItemId(item.id);
                              setQuickTxQty(item.unitConversionFactor || 1000);
                              setShowQuickTxModal(true);
                            }}
                            className="h-7 px-2 rounded-md text-[11px] font-semibold border-border/70 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            تعدیل سریع
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* VIEW B: DEDICATED SEPARATE LANDED COSTS (هزینه‌های جانبی)   */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeCategoryTab === "LandedCosts" && (
        <div className="space-y-4">
          {/* Landed Costs Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Card className="p-4 rounded-md border border-border/70 bg-card shadow-xs">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Truck className="size-5" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-muted-foreground">کل هزینه‌های جانبی خرید</div>
                  <div className="text-base font-extrabold text-foreground fa-num">
                    {totalAllLandedCostsAmount.toLocaleString("fa-IR")} تومان
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 rounded-md border border-border/70 bg-card shadow-xs">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Receipt className="size-5" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-muted-foreground">نرخ میانگین سربار باربری</div>
                  <div className="text-base font-extrabold text-foreground fa-num">
                    {averageLandedBurdenPercent.toLocaleString("fa-IR")}٪ ارزش کالا
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 rounded-md border border-border/70 bg-card shadow-xs">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Coins className="size-5" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-muted-foreground">روش حسابداری تسهیم</div>
                  <div className="text-xs font-extrabold text-foreground">
                    بر اساس ارزش ریالی (Value-Based)
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 rounded-md border border-border/70 bg-card shadow-xs">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="size-5" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-muted-foreground">تعداد ردیف‌های هزینه جانبی</div>
                  <div className="text-base font-extrabold text-foreground fa-num">
                    {allLandedCosts.length} سند پرداختی
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Landed Costs Management Table */}
          <Card className="rounded-lg border border-border/70 bg-card shadow-xs overflow-hidden">
            <div className="p-3 border-b border-border/50 bg-muted/20 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Truck className="size-4 text-amber-500" />
                  دفتر تفکیکی هزینه‌های جانبی خرید و باربری (Landed Costs Ledger)
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  تفکیک هزینه‌های حمل‌ونقل، تخلیه و بارگیری، بسته‌بندی ویژه و سرشکن شدن بر بهای تمام‌شده اقلام فاکتور
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (purchaseInvoices.length > 0) {
                    setSelectedInvoiceForLanded(purchaseInvoices[0].id);
                    setShowAddLandedCostModal(true);
                  } else {
                    toast.error("هنوز هیچ فاکتور خریدی برای الصاق هزینه جانبی ثبت نشده است.");
                  }
                }}
                className="h-8 px-3 rounded-md text-xs font-bold gap-1.5 border-border/70 cursor-pointer"
              >
                <Plus className="size-3.5" />
                ثبت هزینه جانبی متمم
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border/60">
                  <tr>
                    <th className="p-3 text-start">فاکتور مرجع</th>
                    <th className="p-3 text-start">شرح هزینه جانبی</th>
                    <th className="p-3 text-start">سرفصل حسابداری</th>
                    <th className="p-3 text-start">طرف حساب / باربری</th>
                    <th className="p-3 text-start">تاریخ ثبت</th>
                    <th className="p-3 text-start">روش پرداخت</th>
                    <th className="p-3 text-start">مبلغ پرداختی</th>
                    <th className="p-3 text-start">وضعیت تسهیم در انبار</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {allLandedCosts.map((lc) => (
                    <tr key={lc.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-primary text-[11px]">{lc.invoiceNumber}</td>
                      <td className="p-3">
                        <span className="font-bold text-foreground block">{lc.titleFa}</span>
                        {lc.notes && <span className="text-[10px] text-muted-foreground">{lc.notes}</span>}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] rounded-md py-0",
                            lc.costType === "Freight"
                              ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30"
                              : lc.costType === "Handling"
                              ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                          )}
                        >
                          {lc.costType === "Freight"
                            ? "کرایه باربری و پیک"
                            : lc.costType === "Handling"
                            ? "تخلیه و بارگیری"
                            : lc.costType === "Packaging"
                            ? "بسته‌بندی محافظ"
                            : lc.costType === "Insurance"
                            ? "بیمه حمل‌ونقل"
                            : "سایر هزینه‌های مستقیم"}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{lc.paidTo || "—"}</td>
                      <td className="p-3 text-muted-foreground fa-num">{lc.invoiceDate}</td>
                      <td className="p-3 text-muted-foreground">
                        {lc.paymentMethod === "Cash" ? "نقدی" : lc.paymentMethod === "Card" ? "کارتخوان" : "اعتباری"}
                      </td>
                      <td className="p-3 font-bold text-foreground fa-num">
                        {lc.amount.toLocaleString("fa-IR")} تومان
                      </td>
                      <td className="p-3">
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] rounded-md py-0.5">
                          تسهیم‌شده در بهای تمام‌شده
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* VIEW C: PURCHASE INVOICES ARCHIVE (فاکتورهای خرید ثبت‌شده) */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeCategoryTab === "Invoices" && (
        <Card className="rounded-lg border border-border/70 bg-card shadow-xs overflow-hidden">
          <div className="p-3 border-b border-border/50 bg-muted/20 flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileSpreadsheet className="size-4 text-primary" />
              آرشیو فاکتورهای رسمی خرید و رسید انبار (Purchase Invoices)
            </h4>
            <span className="text-xs text-muted-foreground fa-num">{purchaseInvoices.length} فاکتور ثبت‌شده</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border/60">
                <tr>
                  <th className="p-3 text-start">شماره فاکتور</th>
                  <th className="p-3 text-start">تأمین‌کننده</th>
                  <th className="p-3 text-start">تاریخ</th>
                  <th className="p-3 text-start">انبار مقصد</th>
                  <th className="p-3 text-start">تعداد اقلام</th>
                  <th className="p-3 text-start">خالص کالاها</th>
                  <th className="p-3 text-start">هزینه‌های جانبی (حمل)</th>
                  <th className="p-3 text-start">مبلغ کل فاکتور</th>
                  <th className="p-3 text-start">روش تسویه</th>
                  <th className="p-3 text-start">ثبت‌کننده</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {purchaseInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-foreground text-[11px]">{inv.invoiceNumber}</td>
                    <td className="p-3 font-semibold text-foreground">{inv.supplierName}</td>
                    <td className="p-3 text-muted-foreground fa-num">{inv.invoiceDate}</td>
                    <td className="p-3 text-muted-foreground text-[11px]">{inv.destinationStorage}</td>
                    <td className="p-3 fa-num font-bold">
                      {inv.items.length} قلم
                      <span className="text-[10px] text-muted-foreground block truncate max-w-[150px]">
                        {inv.items.map((i) => i.itemName).join("، ")}
                      </span>
                    </td>
                    <td className="p-3 font-medium fa-num">{inv.netItemsAmount.toLocaleString("fa-IR")} ت</td>
                    <td className="p-3 font-semibold text-amber-600 dark:text-amber-400 fa-num">
                      {inv.totalLandedCost.toLocaleString("fa-IR")} ت
                    </td>
                    <td className="p-3 font-extrabold text-foreground fa-num">
                      {inv.grandTotal.toLocaleString("fa-IR")} تومان
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px] rounded-md py-0">
                        {inv.paymentMethod === "BankTransfer"
                          ? "حواله بانکی"
                          : inv.paymentMethod === "Card"
                          ? "کارتخوان"
                          : inv.paymentMethod === "Cash"
                          ? "نقدی"
                          : "اعتباری"}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">{inv.registeredBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* VIEW D: STOCK LEDGER / CARDEX (کاردکس انبار)               */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeCategoryTab === "StockLedger" && (
        <Card className="rounded-lg border border-border/70 bg-card shadow-xs overflow-hidden">
          <div className="p-3 border-b border-border/50 bg-muted/20 flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <History className="size-4 text-purple-500" />
              دفتر کاردکس انبار و ثبت رویدادهای FIFO (Stock Ledger)
            </h4>
            <span className="text-xs text-muted-foreground fa-num">{stockTransactions.length} تراکنش ثبت‌شده</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border/60">
                <tr>
                  <th className="p-3 text-start">شناسه تراکنش</th>
                  <th className="p-3 text-start">شرح کالا</th>
                  <th className="p-3 text-start">نوع عملیات</th>
                  <th className="p-3 text-start">مقدار (واحد پایه)</th>
                  <th className="p-3 text-start">بهای پایه هر واحد</th>
                  <th className="p-3 text-start">بهای تمام‌شده سرباردار (Landed)</th>
                  <th className="p-3 text-start">ارزش کل</th>
                  <th className="p-3 text-start">شرح و شماره سند</th>
                  <th className="p-3 text-start">ثبت‌کننده</th>
                  <th className="p-3 text-start">زمان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {stockTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-muted-foreground">{tx.id}</td>
                    <td className="p-3 font-bold text-foreground">{tx.itemName}</td>
                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] rounded-md py-0",
                          tx.transactionType === "Purchase"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                            : tx.transactionType === "ProductionInput" || tx.transactionType === "Consumption"
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
                            : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30"
                        )}
                      >
                        {tx.transactionType === "Purchase"
                          ? "ورود خرید (+)"
                          : tx.transactionType === "ProductionInput"
                          ? "مصرف در خط تولید (-)"
                          : tx.transactionType === "ProductionOutput"
                          ? "تولید بچ (+)"
                          : tx.transactionType === "Waste"
                          ? "ضایعات (-)"
                          : "تعدیل انبار"}
                      </Badge>
                    </td>
                    <td className="p-3 font-bold fa-num">
                      {tx.quantity > 0 ? `+${tx.quantity.toLocaleString("fa-IR")}` : tx.quantity.toLocaleString("fa-IR")}{" "}
                      {tx.unit}
                    </td>
                    <td className="p-3 fa-num">{tx.unitCost.toLocaleString("fa-IR")} ت</td>
                    <td className="p-3 fa-num font-bold text-amber-600 dark:text-amber-400">
                      {tx.landedCostPerUnit ? `${tx.landedCostPerUnit.toLocaleString("fa-IR")} ت` : "—"}
                    </td>
                    <td className="p-3 font-extrabold text-foreground fa-num">
                      {tx.totalCost.toLocaleString("fa-IR")} تومان
                    </td>
                    <td className="p-3 text-muted-foreground text-[11px] max-w-[220px] truncate" title={tx.reason}>
                      {tx.reason}
                    </td>
                    <td className="p-3 text-muted-foreground">{tx.registeredBy}</td>
                    <td className="p-3 text-muted-foreground text-[11px] fa-num">{tx.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 1: DEDICATED PURCHASE INVOICE & LANDED COSTS WIZARD  */}
      {/* ────────────────────────────────────────────────────────── */}
      <Dialog open={showPurchaseInvoiceModal} onOpenChange={setShowPurchaseInvoiceModal}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto rounded-lg p-5">
          <DialogHeader className="border-b border-border/50 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <PackagePlus className="size-4.5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-foreground">
                    ثبت فاکتور خرید مواد اولیه و رسید ورود به انبار (GRN)
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    ورود آسان و متمرکز اقلام خریداری‌شده، محاسبه خودکار تبدیل واحدها، و تفکیک هزینه‌های جانبی و باربری
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* Modal Internal Navigation */}
            <div className="flex items-center gap-2 mt-3 pt-2">
              <button
                type="button"
                onClick={() => setInvoiceModalTab("items")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer border",
                  invoiceModalTab === "items"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                )}
              >
                ۱. اقلام فاکتور خرید ({invoiceLines.length} قلم)
              </button>
              <button
                type="button"
                onClick={() => setInvoiceModalTab("landed")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer border flex items-center gap-1.5",
                  invoiceModalTab === "landed"
                    ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                )}
              >
                <Truck className="size-3.5" />
                ۲. هزینه‌های جانبی و باربری ({calculatedInvoiceSummary.totalLandedCost.toLocaleString("fa-IR")} ت)
              </button>
              <button
                type="button"
                onClick={() => setInvoiceModalTab("accounting")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer border",
                  invoiceModalTab === "accounting"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                )}
              >
                ۳. پیش‌نمایش سند حسابداری
              </button>
            </div>
          </DialogHeader>

          {/* ── Invoice Header Inputs ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-b border-border/40 text-xs">
            <div>
              <label className="font-bold text-muted-foreground block mb-1">شماره فاکتور / سند:</label>
              <Input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="h-8 text-xs font-mono rounded-md"
              />
            </div>
            <div>
              <label className="font-bold text-muted-foreground block mb-1">تأمین‌کننده / فروشنده:</label>
              <Input
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="روستری ژین، پگاه، آرد البرز..."
                className="h-8 text-xs rounded-md"
              />
            </div>
            <div>
              <label className="font-bold text-muted-foreground block mb-1">تاریخ فاکتور:</label>
              <Input
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="h-8 text-xs rounded-md fa-num"
              />
            </div>
            <div>
              <label className="font-bold text-muted-foreground block mb-1">انبار مقصد:</label>
              <select
                value={destinationStorage}
                onChange={(e) => setDestinationStorage(e.target.value)}
                className="w-full h-8 rounded-md border border-border/70 bg-background px-2 text-xs"
              >
                <option value="سردخانه مرکزی">سردخانه مرکزی</option>
                <option value="یخچال زیر کانتر بار گرم">یخچال زیر کانتر بار گرم</option>
                <option value="انبار خشک قنادی">انبار خشک قنادی</option>
                <option value="استیشن بار قهوه">استیشن بار قهوه</option>
                <option value="انبار ظروف بیرون‌بر">انبار ظروف بیرون‌بر</option>
              </select>
            </div>
          </div>

          {/* ── TAB 1: LINE ITEMS ENTRY ── */}
          {invoiceModalTab === "items" && (
            <div className="space-y-3 py-2">
              {/* Quick Pick Palette for Baristas & Bakery */}
              <div className="p-2.5 rounded-md bg-muted/40 border border-border/50">
                <div className="text-[11px] font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-amber-500" />
                  <span>انتخاب سریع مواد اولیه پرمصرف (کلیک برای افزودن آنی به فاکتور):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {quickPickItems.map((preset) => (
                    <Button
                      key={preset.id}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddQuickPick(preset)}
                      className="h-7 px-2.5 rounded-md text-[11px] font-semibold bg-background hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30 border-border/70 cursor-pointer"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-border/60 rounded-md overflow-hidden">
                <table className="w-full text-xs text-start">
                  <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border/60">
                    <tr>
                      <th className="p-2 text-start w-[26%]">نام کالا / ماده اولیه</th>
                      <th className="p-2 text-start w-[14%]">مقدار خرید</th>
                      <th className="p-2 text-start w-[16%]">تبدیل به واحد مصرف</th>
                      <th className="p-2 text-start w-[16%]">قیمت واحد خرید (تومان)</th>
                      <th className="p-2 text-start w-[12%]">تخفیف سطر (تومان)</th>
                      <th className="p-2 text-start w-[12%]">مبلغ خالص سطر</th>
                      <th className="p-2 text-center w-[4%]">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {invoiceLines.map((line, idx) => {
                      const itemDef = inventoryItems.find((i) => i.id === line.itemId);
                      const conversion = itemDef?.unitConversionFactor || 1000;
                      const baseQty = line.quantity * conversion;
                      const rowTotal = Math.max(0, line.quantity * line.unitPrice - line.discountAmount);

                      return (
                        <tr key={line.id} className="hover:bg-muted/20">
                          {/* Item Select */}
                          <td className="p-2">
                            <select
                              value={line.itemId}
                              onChange={(e) => {
                                const newId = e.target.value;
                                const selected = inventoryItems.find((i) => i.id === newId);
                                setInvoiceLines((prev) =>
                                  prev.map((l) =>
                                    l.id === line.id
                                      ? {
                                          ...l,
                                          itemId: newId,
                                          unitPrice: selected?.purchasePrice || l.unitPrice,
                                        }
                                      : l
                                  )
                                );
                              }}
                              className="w-full h-8 rounded-md border border-border/70 bg-background px-2 text-xs font-semibold"
                            >
                              {inventoryItems.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name} ({item.itemCode})
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Purchase Quantity */}
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min={0.1}
                                step={0.5}
                                value={line.quantity}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setInvoiceLines((prev) =>
                                    prev.map((l) => (l.id === line.id ? { ...l, quantity: val } : l))
                                  );
                                }}
                                className="h-8 text-xs font-bold text-center rounded-md fa-num"
                              />
                              <span className="text-[11px] text-muted-foreground shrink-0">
                                {itemDef?.purchaseUnit || "kg"}
                              </span>
                            </div>
                          </td>

                          {/* Base Unit Preview */}
                          <td className="p-2 font-mono text-[11px] text-muted-foreground fa-num">
                            {baseQty.toLocaleString("fa-IR")} {itemDef?.baseUnit || "g"}
                          </td>

                          {/* Unit Price */}
                          <td className="p-2">
                            <Input
                              type="number"
                              min={0}
                              step={1000}
                              value={line.unitPrice}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setInvoiceLines((prev) =>
                                  prev.map((l) => (l.id === line.id ? { ...l, unitPrice: val } : l))
                                );
                              }}
                              className="h-8 text-xs font-bold text-end rounded-md fa-num"
                            />
                          </td>

                          {/* Discount */}
                          <td className="p-2">
                            <Input
                              type="number"
                              min={0}
                              step={1000}
                              value={line.discountAmount}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setInvoiceLines((prev) =>
                                  prev.map((l) => (l.id === line.id ? { ...l, discountAmount: val } : l))
                                );
                              }}
                              className="h-8 text-xs text-end rounded-md fa-num"
                            />
                          </td>

                          {/* Net Row Total */}
                          <td className="p-2 font-bold text-foreground text-end fa-num">
                            {rowTotal.toLocaleString("fa-IR")} ت
                          </td>

                          {/* Delete Action */}
                          <td className="p-2 text-center">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveLine(line.id)}
                              className="size-7 rounded-md text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddCustomLine}
                  className="h-8 px-3 rounded-md text-xs font-semibold gap-1.5 border-dashed border-border/80 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  افزودن سطر کالا
                </Button>

                <div className="text-xs font-bold text-foreground flex items-center gap-2">
                  <span>جمع خالص کالاها:</span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 fa-num">
                    {calculatedInvoiceSummary.netItemsAmount.toLocaleString("fa-IR")} تومان
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: SEPARATE LANDED COSTS (هزینه‌های جانبی خرید) ── */}
          {invoiceModalTab === "landed" && (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/25 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <Truck className="size-4 text-amber-600" />
                  <span>هزینه‌های جانبی خرید (Landed Costs) طبق استاندارد حسابداری:</span>
                </div>
                مخارج مستقیم خرید نظیر کرایه حمل، باربری، انعام و بسته‌بندی بر بهای تمام‌شده موجودی‌های خریداری‌شده
                سرشکن می‌شوند تا بهای تمام‌شده واقعی هر فنجان قهوه یا کیک در کافه ژین به دقت محاسبه شود.
              </div>

              {/* Quick Add Landed Cost Presets */}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddLandedCostDraft("Freight", "کرایه پیک و باربری وانت تا کافه", 200000)}
                  className="h-7 px-2.5 rounded-md text-[11px] font-semibold gap-1.5 cursor-pointer bg-background"
                >
                  <Plus className="size-3 text-amber-600" />
                  + کرایه باربری وانت
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddLandedCostDraft("Handling", "دستمزد و انعام کارگر تخلیه بار", 60000)}
                  className="h-7 px-2.5 rounded-md text-[11px] font-semibold gap-1.5 cursor-pointer bg-background"
                >
                  <Plus className="size-3 text-purple-600" />
                  + انعام تخلیه بار
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddLandedCostDraft("Packaging", "بسته‌بندی وکیوم و کارتن محافظتی", 85000)}
                  className="h-7 px-2.5 rounded-md text-[11px] font-semibold gap-1.5 cursor-pointer bg-background"
                >
                  <Plus className="size-3 text-blue-600" />
                  + بسته‌بندی محافظتی
                </Button>
              </div>

              {/* Landed Costs Table */}
              <div className="border border-border/60 rounded-md overflow-hidden">
                <table className="w-full text-xs text-start">
                  <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border/60">
                    <tr>
                      <th className="p-2 text-start w-[30%]">شرح هزینه جانبی</th>
                      <th className="p-2 text-start w-[20%]">نوع سرفصل</th>
                      <th className="p-2 text-start w-[22%]">طرف حساب / باربری</th>
                      <th className="p-2 text-start w-[18%]">مبلغ پرداختی (تومان)</th>
                      <th className="p-2 text-center w-[10%]">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {invoiceLandedCosts.map((lc) => (
                      <tr key={lc.id} className="hover:bg-muted/20">
                        <td className="p-2">
                          <Input
                            value={lc.titleFa}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInvoiceLandedCosts((prev) =>
                                prev.map((c) => (c.id === lc.id ? { ...c, titleFa: val } : c))
                              );
                            }}
                            className="h-8 text-xs font-semibold rounded-md"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={lc.costType}
                            onChange={(e) => {
                              const val = e.target.value as LandedCostType;
                              setInvoiceLandedCosts((prev) =>
                                prev.map((c) => (c.id === lc.id ? { ...c, costType: val } : c))
                              );
                            }}
                            className="w-full h-8 rounded-md border border-border/70 bg-background px-2 text-xs"
                          >
                            <option value="Freight">کرایه باربری و حمل</option>
                            <option value="Handling">تخلیه، بارگیری و انعام</option>
                            <option value="Packaging">بسته‌بندی ویژه</option>
                            <option value="Insurance">بیمه حمل‌ونقل</option>
                            <option value="Other">سایر هزینه‌های مستقیم</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <Input
                            value={lc.paidTo || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInvoiceLandedCosts((prev) =>
                                prev.map((c) => (c.id === lc.id ? { ...c, paidTo: val } : c))
                              );
                            }}
                            placeholder="نام راننده یا شرکت..."
                            className="h-8 text-xs rounded-md"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min={0}
                            step={10000}
                            value={lc.amount}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setInvoiceLandedCosts((prev) =>
                                prev.map((c) => (c.id === lc.id ? { ...c, amount: val } : c))
                              );
                            }}
                            className="h-8 text-xs font-bold text-end rounded-md fa-num"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => setInvoiceLandedCosts((prev) => prev.filter((c) => c.id !== lc.id))}
                            className="size-7 rounded-md text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Allocation Method Selection & Impact Simulation Table */}
              <div className="p-3 rounded-md bg-muted/30 border border-border/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Coins className="size-4 text-primary" />
                    <span>روش تسهیم هزینه جانبی بر روی اقلام این فاکتور:</span>
                  </div>
                  <div className="flex items-center gap-1 bg-background p-1 rounded-md border border-border/60 text-xs">
                    <button
                      type="button"
                      onClick={() => setAllocationMethod("ByValue")}
                      className={cn(
                        "px-2.5 py-1 rounded-[4px] font-bold transition-colors cursor-pointer",
                        allocationMethod === "ByValue" ? "bg-primary text-white shadow-xs" : "text-muted-foreground"
                      )}
                    >
                      بر اساس ارزش ریالی (استاندارد حسابداری)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllocationMethod("ByQuantity")}
                      className={cn(
                        "px-2.5 py-1 rounded-[4px] font-bold transition-colors cursor-pointer",
                        allocationMethod === "ByQuantity" ? "bg-primary text-white shadow-xs" : "text-muted-foreground"
                      )}
                    >
                      بر اساس وزن / مقدار
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllocationMethod("Equal")}
                      className={cn(
                        "px-2.5 py-1 rounded-[4px] font-bold transition-colors cursor-pointer",
                        allocationMethod === "Equal" ? "bg-primary text-white shadow-xs" : "text-muted-foreground"
                      )}
                    >
                      تسهیم مساوی
                    </button>
                  </div>
                </div>

                {/* Real-time Landed Cost Impact Breakdown */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-start bg-background rounded-md border border-border/50">
                    <thead className="bg-muted/60 text-muted-foreground font-bold border-b border-border/60">
                      <tr>
                        <th className="p-2 text-start">قلم کالا</th>
                        <th className="p-2 text-start">بهای پایه هر واحد</th>
                        <th className="p-2 text-start">سهم هزینه جانبی</th>
                        <th className="p-2 text-start">بهای تمام‌شده واقعی هر واحد (Landed Cost)</th>
                        <th className="p-2 text-end">درصد تغییر</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {calculatedInvoiceSummary.itemsWithLanded.map((item) => {
                        const percentDiff =
                          item.baseUnitPrice > 0
                            ? Math.round(((item.finalLandedUnitPrice - item.baseUnitPrice) / item.baseUnitPrice) * 1000) /
                              10
                            : 0;
                        return (
                          <tr key={item.id}>
                            <td className="p-2 font-bold text-foreground">{item.itemName}</td>
                            <td className="p-2 fa-num">
                              {item.baseUnitPrice.toLocaleString("fa-IR")} ت / {item.baseUnit}
                            </td>
                            <td className="p-2 fa-num text-amber-600 dark:text-amber-400 font-semibold">
                              +{item.allocatedLandedCost.toLocaleString("fa-IR")} تومان
                            </td>
                            <td className="p-2 fa-num font-extrabold text-emerald-600 dark:text-emerald-400">
                              {item.finalLandedUnitPrice.toLocaleString("fa-IR")} ت / {item.baseUnit}
                            </td>
                            <td className="p-2 text-end font-mono text-[11px] text-muted-foreground">
                              +{percentDiff}٪
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: ACCOUNTING VOUCHER PREVIEW ── */}
          {invoiceModalTab === "accounting" && (
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-md bg-muted/40 border border-border/60">
                <div className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <FileSpreadsheet className="size-4 text-primary" />
                  <span>پیش‌نمایش سند دوبل حسابداری خرید انبار (Double-Entry Accounting Voucher):</span>
                </div>
                <div className="border border-border/60 rounded-md overflow-hidden bg-background">
                  <table className="w-full text-xs text-start">
                    <thead className="bg-muted/60 text-muted-foreground font-bold border-b border-border/60">
                      <tr>
                        <th className="p-2.5 text-start">کد و عنوان حساب کل / معین</th>
                        <th className="p-2.5 text-end">بدهکار (تومان)</th>
                        <th className="p-2.5 text-end">بستانکار (تومان)</th>
                        <th className="p-2.5 text-start">شرح آرتیکل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-mono fa-num">
                      <tr>
                        <td className="p-2.5 font-bold text-foreground">
                          ۱۴۰۱۰ - موجودی مواد و کالای انبار (کافه ژین)
                        </td>
                        <td className="p-2.5 text-end font-bold text-emerald-600">
                          {calculatedInvoiceSummary.grandTotal.toLocaleString("fa-IR")}
                        </td>
                        <td className="p-2.5 text-end text-muted-foreground">—</td>
                        <td className="p-2.5 font-sans text-muted-foreground">
                          ورود {calculatedInvoiceSummary.itemsWithLanded.length} قلم کالا + هزینه‌های باربری فاکتور{" "}
                          {invoiceNumber}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-foreground">
                          ۲۱۰۱۰ - بستانکاران تجاری / تأمین‌کننده ({supplierName})
                        </td>
                        <td className="p-2.5 text-end text-muted-foreground">—</td>
                        <td className="p-2.5 text-end font-bold text-rose-600">
                          {calculatedInvoiceSummary.netItemsAmount.toLocaleString("fa-IR")}
                        </td>
                        <td className="p-2.5 font-sans text-muted-foreground">خالص بهای کالاها طبق فاکتور خرید</td>
                      </tr>
                      {calculatedInvoiceSummary.totalLandedCost > 0 && (
                        <tr>
                          <td className="p-2.5 font-bold text-foreground">
                            ۱۰۱۰۱ - صندوق نقدی / حساب پرداخت باربری و تخلیه
                          </td>
                          <td className="p-2.5 text-end text-muted-foreground">—</td>
                          <td className="p-2.5 text-end font-bold text-rose-600">
                            {calculatedInvoiceSummary.totalLandedCost.toLocaleString("fa-IR")}
                          </td>
                          <td className="p-2.5 font-sans text-muted-foreground">
                            کرایه حمل، باربری و هزینه‌های جانبی خرید
                          </td>
                        </tr>
                      )}
                      <tr className="bg-muted/40 font-bold font-sans">
                        <td className="p-2.5">تراز سند حسابداری</td>
                        <td className="p-2.5 text-end fa-num">
                          {calculatedInvoiceSummary.grandTotal.toLocaleString("fa-IR")}
                        </td>
                        <td className="p-2.5 text-end fa-num">
                          {calculatedInvoiceSummary.grandTotal.toLocaleString("fa-IR")}
                        </td>
                        <td className="p-2.5 text-emerald-600">✓ سند کاملاً متوازن و تراز است</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Dialog Footer: Financial Summary & Confirm ── */}
          <DialogFooter className="border-t border-border/50 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">خالص کالاها:</span>
                <span className="font-bold text-foreground fa-num">
                  {calculatedInvoiceSummary.netItemsAmount.toLocaleString("fa-IR")} ت
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-600 dark:text-amber-400 font-semibold">هزینه‌های جانبی:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 fa-num">
                  +{calculatedInvoiceSummary.totalLandedCost.toLocaleString("fa-IR")} ت
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-foreground">جمع کل فاکتور:</span>
                <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 fa-num">
                  {calculatedInvoiceSummary.grandTotal.toLocaleString("fa-IR")} تومان
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPurchaseInvoiceModal(false)}
                className="h-9 px-3 rounded-md text-xs font-semibold cursor-pointer"
              >
                انصراف
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleSavePurchaseInvoice}
                className="h-9 px-4 rounded-md text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                <CheckCircle2 className="size-4" />
                تأیید نهایی و ورود به انبار
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 2: SUPPLEMENTARY LANDED COST MODAL                   */}
      {/* ────────────────────────────────────────────────────────── */}
      <Dialog open={showAddLandedCostModal} onOpenChange={setShowAddLandedCostModal}>
        <DialogContent className="max-w-md rounded-lg p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Truck className="size-4.5 text-amber-500" />
              ثبت هزینه جانبی متمم و باربری بر فاکتور خرید
            </DialogTitle>
            <DialogDescription className="text-xs">
              الصاق مستقیم هزینه‌های حمل‌ونقل و تخلیه به یک فاکتور خرید از قبل ثبت‌شده
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-bold text-muted-foreground block mb-1">فاکتور خرید مرجع:</label>
              <select
                value={selectedInvoiceForLanded}
                onChange={(e) => setSelectedInvoiceForLanded(e.target.value)}
                className="w-full h-9 rounded-md border border-border/70 bg-background px-3 text-xs font-semibold"
              >
                {purchaseInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} - تأمین‌کننده: {inv.supplierName} ({inv.invoiceDate})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">شرح هزینه جانبی:</label>
              <Input
                value={suppTitle}
                onChange={(e) => setSuppTitle(e.target.value)}
                placeholder="کرایه باربری، انعام کارگر، بیمه..."
                className="h-9 text-xs rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">سرفصل هزینه:</label>
                <select
                  value={suppCostType}
                  onChange={(e) => setSuppCostType(e.target.value as LandedCostType)}
                  className="w-full h-9 rounded-md border border-border/70 bg-background px-2 text-xs"
                >
                  <option value="Freight">کرایه باربری و حمل</option>
                  <option value="Handling">تخلیه و بارگیری</option>
                  <option value="Packaging">بسته‌بندی ویژه</option>
                  <option value="Insurance">بیمه حمل‌ونقل</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">مبلغ پرداختی (تومان):</label>
                <Input
                  type="number"
                  min={1000}
                  step={5000}
                  value={suppAmount}
                  onChange={(e) => setSuppAmount(parseFloat(e.target.value) || 0)}
                  className="h-9 text-xs font-bold text-end rounded-md fa-num"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">طرف حساب / باربری:</label>
                <Input
                  value={suppPaidTo}
                  onChange={(e) => setSuppPaidTo(e.target.value)}
                  placeholder="اسنپ بار، راننده..."
                  className="h-9 text-xs rounded-md"
                />
              </div>
              <div>
                <label className="font-bold text-muted-foreground block mb-1">روش پرداخت:</label>
                <select
                  value={suppPayMethod}
                  onChange={(e) => setSuppPayMethod(e.target.value as "Cash" | "Card" | "Credit")}
                  className="w-full h-9 rounded-md border border-border/70 bg-background px-2 text-xs"
                >
                  <option value="Cash">نقدی از صندوق</option>
                  <option value="Card">کارتخوان / بانک</option>
                  <option value="Credit">اعتباری / نسیه</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">توضیحات و شماره بارنامه:</label>
              <Input
                value={suppNotes}
                onChange={(e) => setSuppNotes(e.target.value)}
                placeholder="شماره بارنامه یا بارکد پیگیری..."
                className="h-9 text-xs rounded-md"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddLandedCostModal(false)}
              className="h-9 px-3 rounded-md text-xs font-semibold cursor-pointer"
            >
              انصراف
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveSupplementaryLandedCost}
              className="h-9 px-3.5 rounded-md text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
            >
              سرشکن کردن بر فاکتور خرید
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 3: QUICK ADJUSTMENT MODAL                            */}
      {/* ────────────────────────────────────────────────────────── */}
      <Dialog open={showQuickTxModal} onOpenChange={setShowQuickTxModal}>
        <DialogContent className="max-w-md rounded-lg p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <PackagePlus className="size-5 text-primary" />
              تعدیل و شارژ سریع تک‌قلمی
            </DialogTitle>
            <DialogDescription className="text-xs">
              ثبت سریع ورود یا خروج دستی یک ماده اولیه بدون صدور فاکتور کامل
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-bold text-muted-foreground block mb-1">انتخاب کالا:</label>
              <select
                value={quickItemId}
                onChange={(e) => setQuickItemId(e.target.value)}
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
                value={quickTxType}
                onChange={(e) => setQuickTxType(e.target.value as StockTransactionType)}
                className="w-full h-9 rounded-md border border-border/70 bg-background px-3 text-xs"
              >
                <option value="Purchase">ورود خرید دستی (+)</option>
                <option value="Consumption">مصرف آزاد / خط سرو (-)</option>
                <option value="Waste">ضایعات و خرابی (-)</option>
                <option value="Adjustment">اصلاح شمارش انبارگردانی</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">مقدار (واحد پایه مصرف):</label>
              <Input
                type="number"
                value={quickTxQty}
                onChange={(e) => setQuickTxQty(parseFloat(e.target.value) || 0)}
                className="h-9 text-xs rounded-md fa-num font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">علت و شماره مرجع:</label>
              <Input
                value={quickTxReason}
                onChange={(e) => setQuickTxReason(e.target.value)}
                className="h-9 text-xs rounded-md"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowQuickTxModal(false)}
              className="h-9 px-3 rounded-md text-xs font-semibold cursor-pointer"
            >
              انصراف
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (!quickItemId || quickTxQty <= 0) {
                  toast.error("کالا و مقدار معتبر را مشخص فرمایید.");
                  return;
                }
                const isDeduct = quickTxType === "Consumption" || quickTxType === "Waste";
                const qtySigned = isDeduct ? -Math.abs(quickTxQty) : Math.abs(quickTxQty);
                const ok = adjustStock(quickItemId, qtySigned, quickTxType, quickTxReason);
                if (ok) {
                  toast.success("تعدیل انبار با موفقیت انجام شد.");
                  setShowQuickTxModal(false);
                }
              }}
              className="h-9 px-3.5 rounded-md text-xs font-bold cursor-pointer"
            >
              تأیید تعدیل انبار
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 4: NEW ITEM DEFINITION                               */}
      {/* ────────────────────────────────────────────────────────── */}
      <Dialog open={showAddItemModal} onOpenChange={setShowAddItemModal}>
        <DialogContent className="max-w-lg rounded-lg p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Boxes className="size-5 text-primary" />
              تعریف شناسنامه ماده اولیه / کالای جدید
            </DialogTitle>
            <DialogDescription className="text-xs">
              ثبت مشخصات فنی، واحدهای سنجش و نگهداری، ضریب تبدیل و قیمت خرید پایه
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">کد انبار کالا (SKU):</label>
                <Input
                  value={newItemCode}
                  onChange={(e) => setNewItemCode(e.target.value)}
                  className="h-9 text-xs font-mono rounded-md"
                />
              </div>
              <div>
                <label className="font-bold text-muted-foreground block mb-1">نام کامل ماده / کالا:</label>
                <Input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="مثلاً شکلات تلخ بلژیکی ۷۰٪"
                  className="h-9 text-xs rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">نوع کاتالوگ:</label>
                <select
                  value={newItemCatType}
                  onChange={(e) => setNewItemCatType(e.target.value as InventoryCategoryType)}
                  className="w-full h-9 rounded-md border border-border/70 bg-background px-2 text-xs"
                >
                  <option value="RawMaterial">ماده اولیه خام (Raw)</option>
                  <option value="SemiFinished">محصول نیمه‌ساخته (BOM)</option>
                  <option value="PackagingConsumable">ملزومات و بسته‌بندی</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-muted-foreground block mb-1">نام دسته‌بندی تجاری:</label>
                <Input
                  value={newItemCatName}
                  onChange={(e) => setNewItemCatName(e.target.value)}
                  className="h-9 text-xs rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-md bg-muted/40 border border-border/60">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">واحد خرید:</label>
                <select
                  value={newItemPurchaseUnit}
                  onChange={(e) => setNewItemPurchaseUnit(e.target.value as UnitType)}
                  className="w-full h-8 rounded-md border border-border/70 bg-background px-2 text-xs"
                >
                  <option value="kg">کیلوگرم (kg)</option>
                  <option value="l">لیتر (l)</option>
                  <option value="box">کارتن / جعبه</option>
                  <option value="package">بسته / قوطی</option>
                  <option value="piece">عدد</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-muted-foreground block mb-1">واحد پایه مصرف:</label>
                <select
                  value={newItemBaseUnit}
                  onChange={(e) => setNewItemBaseUnit(e.target.value as UnitType)}
                  className="w-full h-8 rounded-md border border-border/70 bg-background px-2 text-xs"
                >
                  <option value="g">گرم (g)</option>
                  <option value="ml">میلی‌لیتر (ml)</option>
                  <option value="piece">عدد</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-muted-foreground block mb-1">ضریب تبدیل:</label>
                <Input
                  type="number"
                  value={newItemConversion}
                  onChange={(e) => setNewItemConversion(parseFloat(e.target.value) || 1)}
                  className="h-8 text-xs text-center font-bold fa-num rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">قیمت هر واحد خرید (ت):</label>
                <Input
                  type="number"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                  className="h-9 text-xs text-end font-bold fa-num rounded-md"
                />
              </div>
              <div>
                <label className="font-bold text-muted-foreground block mb-1">موجودی اولیه (پایه):</label>
                <Input
                  type="number"
                  value={newItemStock}
                  onChange={(e) => setNewItemStock(parseFloat(e.target.value) || 0)}
                  className="h-9 text-xs text-center font-bold fa-num rounded-md"
                />
              </div>
              <div>
                <label className="font-bold text-muted-foreground block mb-1">حداقل سفارش (پایه):</label>
                <Input
                  type="number"
                  value={newItemMinStock}
                  onChange={(e) => setNewItemMinStock(parseFloat(e.target.value) || 0)}
                  className="h-9 text-xs text-center font-bold fa-num rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">محل نگهداری / قفسه:</label>
                <Input
                  value={newItemLocation}
                  onChange={(e) => setNewItemLocation(e.target.value)}
                  className="h-9 text-xs rounded-md"
                />
              </div>
              <div>
                <label className="font-bold text-muted-foreground block mb-1">تأمین‌کننده اصلی:</label>
                <Input
                  value={newItemSupplier}
                  onChange={(e) => setNewItemSupplier(e.target.value)}
                  className="h-9 text-xs rounded-md"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddItemModal(false)}
              className="h-9 px-3 rounded-md text-xs font-semibold cursor-pointer"
            >
              انصراف
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCreateNewItem}
              className="h-9 px-3.5 rounded-md text-xs font-bold cursor-pointer"
            >
              ثبت و ایجاد کالا در انبار
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 5: UNIT CONVERTER TOOL                               */}
      {/* ────────────────────────────────────────────────────────── */}
      <Dialog open={showCalculatorModal} onOpenChange={setShowCalculatorModal}>
        <DialogContent className="max-w-md rounded-lg p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Calculator className="size-5 text-emerald-600" />
              ابزار هوشمند تبدیل واحدهای اندازه‌گیری و رسپی
            </DialogTitle>
            <DialogDescription className="text-xs">
              محاسبه فوری برابری واحدهای خرید عمده و واحدهای مصرفی در بارگرم و قنادی
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">مقدار ورودی:</label>
                <Input
                  type="number"
                  step={0.1}
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(parseFloat(e.target.value) || 0)}
                  className="h-9 text-xs font-bold text-center fa-num rounded-md"
                />
              </div>
              <div>
                <label className="font-bold text-muted-foreground block mb-1">واحد ورودی:</label>
                <select
                  value={calcFrom}
                  onChange={(e) => setCalcFrom(e.target.value as "kg" | "l" | "box")}
                  className="w-full h-9 rounded-md border border-border/70 bg-background px-3 text-xs"
                >
                  <option value="kg">کیلوگرم (kg)</option>
                  <option value="l">لیتر مایعات (L)</option>
                  <option value="box">کارتن تخم‌مرغ (۳۰ عددی)</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-md bg-muted/40 border border-border/60 space-y-2">
              <div className="text-[11px] font-bold text-muted-foreground">برابری محاسباتی دقیق:</div>
              {calcFrom === "kg" && (
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span>گرم (Gram):</span>
                    <span className="font-bold text-foreground fa-num">{(calcAmount * 1000).toLocaleString("fa-IR")} g</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>قاشق غذاخوری (تقریبی ۱۵g):</span>
                    <span className="font-bold text-foreground fa-num">
                      {Math.round((calcAmount * 1000) / 15).toLocaleString("fa-IR")} tbsp
                    </span>
                  </div>
                </div>
              )}
              {calcFrom === "l" && (
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span>میلی‌لیتر (Milliliter):</span>
                    <span className="font-bold text-foreground fa-num">{(calcAmount * 1000).toLocaleString("fa-IR")} ml</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>فنجان کاپوچینو (۱۸۰ml):</span>
                    <span className="font-bold text-foreground fa-num">
                      {(Math.round(((calcAmount * 1000) / 180) * 10) / 10).toLocaleString("fa-IR")} کاپ
                    </span>
                  </div>
                </div>
              )}
              {calcFrom === "box" && (
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span>تعداد تخم‌مرغ:</span>
                    <span className="font-bold text-foreground fa-num">{(calcAmount * 30).toLocaleString("fa-IR")} عدد</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              size="sm"
              onClick={() => setShowCalculatorModal(false)}
              className="h-9 px-4 rounded-md text-xs font-semibold cursor-pointer"
            >
              بستن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
