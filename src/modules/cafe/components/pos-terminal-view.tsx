"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Store,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Receipt,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Check,
  RefreshCw,
  Printer,
  ChevronLeft,
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
import { MenuItem, OrderType, OrderItem, TableItem, Order } from "../types";

interface PosTerminalViewProps {
  menuItems: MenuItem[];
  tables: TableItem[];
  onOrderCreated: (order: Order) => void;
  onOpen3DExperience?: () => void;
}

export function PosTerminalView({
  menuItems,
  tables,
  onOrderCreated,
  onOpen3DExperience,
}: PosTerminalViewProps) {
  const [orderType, setOrderType] = useState<OrderType>("DineIn");
  const [selectedTableNumber, setSelectedTableNumber] = useState<string>("1");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Cart state
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // PC-POS Card Reader Payment Simulation Modal
  const [posModalOpen, setPosModalOpen] = useState<boolean>(false);
  const [posPaymentStep, setPosPaymentStep] = useState<"connecting" | "swiping" | "pin" | "approved">("connecting");

  // Invoice Print Modal
  const [invoiceModalOpen, setInvoiceModalOpen] = useState<boolean>(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  const categories = [
    { id: "all", label: "همه اقلام" },
    { id: "coffee", label: "قهوه تخصصی" },
    { id: "chocolate", label: "شکلات و گرم" },
    { id: "cold", label: "نوشیدنی سرد" },
    { id: "dessert", label: "کیک و دسر" },
    { id: "snack", label: "اسنک و کروسان" },
  ];

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: MenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) => (i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { menuItemId: item.id, name: item.name, quantity: 1, unitPrice: item.price }];
    });
    toast.success(`${item.name} به فاکتور افزوده شد`, { duration: 1500 });
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.menuItemId === menuItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const removeFromCart = (menuItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.menuItemId !== menuItemId));
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscountAmount(0);
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const tax = Math.round(subtotal * 0.1); // 10% VAT
  const grandTotal = Math.max(0, subtotal + tax - discountAmount);

  // Trigger PC-POS Card Reader Payment
  const startPcPosPayment = () => {
    if (cartItems.length === 0) {
      toast.error("ابتدا اقلامی را به سبد سفارش اضافه کنید");
      return;
    }
    setPosModalOpen(true);
    setPosPaymentStep("connecting");

    setTimeout(() => {
      setPosPaymentStep("swiping");
    }, 1200);

    setTimeout(() => {
      setPosPaymentStep("pin");
    }, 2400);

    setTimeout(() => {
      setPosPaymentStep("approved");
      completeOrder("CardPOS");
    }, 4000);
  };

  // Trigger Cash Payment
  const handleCashPayment = () => {
    if (cartItems.length === 0) {
      toast.error("ابتدا اقلامی را به سبد سفارش اضافه کنید");
      return;
    }
    completeOrder("Cash");
  };

  const completeOrder = (paymentMethod: "CardPOS" | "Cash") => {
    const newOrder: Order = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      orderNumber: `ORD-${Math.floor(100 + Math.random() * 900)}`,
      type: orderType,
      tableNumber: orderType === "DineIn" ? selectedTableNumber : undefined,
      items: [...cartItems],
      subtotal,
      tax,
      discount: discountAmount,
      grandTotal,
      status: "InKitchen",
      paymentStatus: "Paid",
      paymentMethod,
      customerName: customerName.trim() || (orderType === "DineIn" ? `مشتری میز ${selectedTableNumber}` : "مشتری حضوری"),
      customerPhone: customerPhone.trim() || undefined,
      createdAt: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
      elapsedMinutes: 1,
    };

    onOrderCreated(newOrder);
    setLastPlacedOrder(newOrder);
    clearCart();
    toast.success(`سفارش ${newOrder.orderNumber} با موفقیت ثبت شد و به نمایشگر آشپزخانه ارسال گردید!`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start">
      {/* LEFT / CENTER: Products Catalog & Filter */}
      <div className="flex-1 w-full space-y-4">
        {/* Top Controls: Search & Order Channel Bar */}
        <Card className="border border-border/70 bg-card shadow-xs rounded-lg p-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی نام نوشیدنی، دسر، بارکد..."
                className="ps-9 h-10 rounded-md text-xs bg-background"
              />
            </div>

            {/* Quick 3D Experience Action */}
            {onOpen3DExperience && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpen3DExperience}
                className="h-10 rounded-md gap-2 border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 shrink-0 text-xs font-semibold cursor-pointer"
              >
                <Sparkles className="size-4 text-primary animate-pulse" />
                رونمایی ۳ بعدی شکلات آبی
              </Button>
            )}
          </div>

          {/* Category Filter Pills - Strict low curve rounded-md */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-border/40 mt-3 pb-1">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "h-8 px-3 rounded-md text-xs font-semibold shrink-0 transition-all duration-150 cursor-pointer border select-none",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                      : "bg-muted/50 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filteredItems.map((item) => {
            const inCart = cartItems.find((i) => i.menuItemId === item.id);
            return (
              <Card
                key={item.id}
                className={cn(
                  "relative border transition-all duration-150 rounded-lg overflow-hidden flex flex-col justify-between group hover:shadow-md",
                  item.isSignature
                    ? "border-primary/50 bg-gradient-to-br from-card via-card to-primary/5"
                    : "border-border/70 bg-card"
                )}
              >
                <CardHeader className="p-3.5 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-foreground">{item.name}</h4>
                        {item.isSignature && (
                          <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] px-1.5 py-0 rounded-md">
                            ویژه امضا
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardFooter className="p-3.5 pt-2 flex items-center justify-between border-t border-border/40 bg-muted/20">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">قیمت:</span>
                    <span className="text-sm font-extrabold text-foreground fa-num">
                      {item.price.toLocaleString("fa-IR")}
                    </span>
                    <span className="text-[10px] text-muted-foreground ms-1">تومان</span>
                  </div>

                  {inCart ? (
                    <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 rounded-md p-0.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="size-7 rounded-md text-primary hover:bg-primary/20 cursor-pointer"
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="text-xs font-black text-primary px-1.5 fa-num">{inCart.quantity}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="size-7 rounded-md text-primary hover:bg-primary/20 cursor-pointer"
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addToCart(item)}
                      className="h-8 rounded-md px-3 text-xs font-semibold border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground gap-1.5 cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      افزودن به سبد
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Order Checkout & POS Panel (Width 360px) */}
      <div className="w-full lg:w-[380px] shrink-0 space-y-4">
        <Card className="border border-border/70 bg-card shadow-sm rounded-lg overflow-hidden">
          {/* Header */}
          <CardHeader className="p-3.5 border-b border-border/50 bg-muted/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="size-4 text-primary" />
                <CardTitle className="text-sm font-bold">فاکتور جاری و صندوق</CardTitle>
              </div>
              {cartItems.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="h-7 px-2 text-[11px] text-destructive hover:bg-destructive/10 rounded-md cursor-pointer"
                >
                  <Trash2 className="size-3 me-1" />
                  پاک‌کردن
                </Button>
              )}
            </div>

            {/* ORDER TYPE SELECTOR - STRICT UNIFORM LOW-CURVE BUTTONS (rounded-md, h-12) */}
            <div className="mt-3">
              <span className="text-[11px] font-bold text-muted-foreground block mb-1.5">
                نوع سفارش و شیوه سرو:
              </span>
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-md bg-muted/70 border border-border/60">
                {(
                  [
                    { type: "DineIn", label: "سالن", icon: UtensilsCrossed },
                    { type: "Takeaway", label: "بیرون‌بر", icon: ShoppingBag },
                    { type: "Delivery", label: "پیک", icon: Bike },
                    { type: "SnappFood", label: "اسنپ‌فود", icon: Store },
                  ] as const
                ).map((ch) => {
                  const Icon = ch.icon;
                  const isActive = orderType === ch.type;
                  return (
                    <button
                      key={ch.type}
                      type="button"
                      onClick={() => setOrderType(ch.type)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 h-12 px-1 rounded-md transition-all duration-150 cursor-pointer select-none",
                        isActive
                          ? "bg-primary text-primary-foreground font-bold shadow-xs ring-1 ring-primary/40"
                          : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                      <span className="text-[10px] font-bold leading-tight text-center w-full truncate px-0.5">
                        {ch.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table Selection when DineIn */}
            {orderType === "DineIn" && (
              <div className="mt-2.5 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-muted-foreground">انتخاب شماره میز:</span>
                  <Badge variant="outline" className="text-[10px] rounded-md py-0">
                    {tables.find((t) => t.number === selectedTableNumber)?.name || `میز ${selectedTableNumber}`}
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {tables.map((tbl) => {
                    const isSelected = selectedTableNumber === tbl.number;
                    const isOccupied = tbl.status === "Occupied";
                    return (
                      <button
                        key={tbl.id}
                        type="button"
                        onClick={() => setSelectedTableNumber(tbl.number)}
                        className={cn(
                          "h-8 rounded-md text-xs font-bold transition-all border flex items-center justify-center cursor-pointer select-none",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                            : isOccupied
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                            : "bg-background text-muted-foreground border-border/60 hover:text-foreground"
                        )}
                      >
                        میز {tbl.number}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardHeader>

          {/* Cart Items List */}
          <CardContent className="p-3.5 space-y-2.5 max-h-[280px] overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground space-y-2">
                <Receipt className="size-8 mx-auto stroke-1 opacity-40" />
                <p className="text-xs">سبد سفارش خالی است.</p>
                <p className="text-[11px] opacity-75">از منوی روبه‌رو اقلام را اضافه فرمایید.</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.menuItemId}
                  className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/30 border border-border/40"
                >
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold truncate text-foreground">{item.name}</h5>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                      <span className="fa-num">{item.unitPrice.toLocaleString("fa-IR")}</span>
                      <span>تومان</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-background border border-border/60 rounded-md p-0.5">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => updateQuantity(item.menuItemId, -1)}
                      className="size-6 rounded-md hover:bg-muted cursor-pointer"
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="text-xs font-black px-1 fa-num">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => updateQuantity(item.menuItemId, 1)}
                      className="size-6 rounded-md hover:bg-muted cursor-pointer"
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>

                  <span className="text-xs font-extrabold text-foreground w-16 text-end fa-num">
                    {(item.quantity * item.unitPrice).toLocaleString("fa-IR")}
                  </span>
                </div>
              ))
            )}
          </CardContent>

          {/* Pricing Summary */}
          <CardFooter className="p-3.5 pt-3 border-t border-border/60 bg-muted/30 flex flex-col gap-2.5">
            <div className="w-full space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>جمع اقلام:</span>
                <span className="font-bold text-foreground fa-num">
                  {subtotal.toLocaleString("fa-IR")} تومان
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>مالیات بر ارزش افزوده (۱۰٪):</span>
                <span className="font-bold text-foreground fa-num">
                  {tax.toLocaleString("fa-IR")} تومان
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-600">
                  <span>تخفیف:</span>
                  <span className="font-bold fa-num">-{discountAmount.toLocaleString("fa-IR")} تومان</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm font-black pt-1.5 border-t border-border/50 text-foreground">
                <span>مبلغ قابل پرداخت:</span>
                <span className="text-base text-primary fa-num">
                  {grandTotal.toLocaleString("fa-IR")} تومان
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS - STRICT LOW CURVE (rounded-md) */}
            <div className="grid grid-cols-2 gap-2 w-full pt-1">
              <Button
                variant="default"
                disabled={cartItems.length === 0}
                onClick={startPcPosPayment}
                className="h-11 rounded-md text-xs font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
              >
                <CreditCard className="size-4 shrink-0" />
                کارتخوان PC-POS
              </Button>

              <Button
                variant="outline"
                disabled={cartItems.length === 0}
                onClick={handleCashPayment}
                className="h-11 rounded-md text-xs font-bold gap-2 border-border/70 bg-background hover:bg-muted text-foreground cursor-pointer"
              >
                <Banknote className="size-4 shrink-0 text-emerald-600" />
                پرداخت نقدی
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* PC-POS Card Reader Payment Simulation Modal */}
      <Dialog open={posModalOpen} onOpenChange={setPosModalOpen}>
        <DialogContent className="max-w-md rounded-lg p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CreditCard className="size-5 text-primary" />
              ارتباط با پایانه کارتخوان بانکی (PC-POS)
            </DialogTitle>
            <DialogDescription className="text-xs">
              پروتکل شبکه محلی اتصال به پایانه فروشگاهی سامان‌کیش / به‌پرداخت
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
            {posPaymentStep === "connecting" && (
              <>
                <RefreshCw className="size-10 text-primary animate-spin" />
                <p className="text-sm font-semibold">در حال ارسال مبلغ فاکتور به کارتخوان...</p>
                <p className="text-xs text-muted-foreground fa-num">
                  مبلغ: {grandTotal.toLocaleString("fa-IR")} تومان
                </p>
              </>
            )}

            {posPaymentStep === "swiping" && (
              <>
                <div className="size-12 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center animate-bounce">
                  <CreditCard className="size-6 text-primary" />
                </div>
                <p className="text-sm font-bold text-foreground">کارت بانکی را بکشید یا نزدیک کنید</p>
                <p className="text-xs text-muted-foreground">دستگاه کارتخوان آماده دریافت کارت است...</p>
              </>
            )}

            {posPaymentStep === "pin" && (
              <>
                <div className="size-12 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <Clock className="size-6 text-amber-600 animate-pulse" />
                </div>
                <p className="text-sm font-bold text-foreground">در انتظار ورود رمز عبور توسط مشتری...</p>
                <p className="text-xs text-muted-foreground">••••</p>
              </>
            )}

            {posPaymentStep === "approved" && (
              <>
                <div className="size-12 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="size-7 text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-emerald-600">تراکنش با موفقیت انجام شد</p>
                <p className="text-xs text-muted-foreground">کد پیگیری بانکی: 849201 | رسید چاپ شد</p>
              </>
            )}
          </div>

          <DialogFooter className="flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPosModalOpen(false)}
              className="rounded-md h-8 text-xs cursor-pointer"
            >
              بستن پنجره
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
