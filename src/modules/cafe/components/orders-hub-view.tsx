"use client";

import React, { useState } from "react";
import {
  Receipt,
  Search,
  Filter,
  Printer,
  Eye,
  CheckCircle2,
  Clock,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Store,
  CreditCard,
  Banknote,
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
import { Order, OrderType } from "../types";

interface OrdersHubViewProps {
  orders: Order[];
}

export function OrdersHubView({ orders }: OrdersHubViewProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  const channels = [
    { id: "all", label: "همه کانال‌ها" },
    { id: "DineIn", label: "سالن" },
    { id: "Takeaway", label: "بیرون‌بر" },
    { id: "Delivery", label: "پیک" },
    { id: "SnappFood", label: "اسنپ‌فود" },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesChannel = selectedChannel === "all" || order.type === selectedChannel;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.tableNumber && order.tableNumber.includes(searchQuery));
    return matchesChannel && matchesSearch;
  });

  const printInvoice = () => {
    toast.success("دستور چاپ فاکتور به چاپگر حرارتی صدور رسید ارسال شد.");
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <Card className="border border-border/70 bg-card rounded-lg p-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی شماره سفارش، نام مشتری، شماره میز..."
              className="ps-9 h-9 text-xs rounded-md"
            />
          </div>

          {/* Channel selector - STRICT LOW CURVE rounded-md */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {channels.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setSelectedChannel(ch.id)}
                className={cn(
                  "h-8 px-3 rounded-md text-xs font-semibold shrink-0 transition-all border cursor-pointer select-none",
                  selectedChannel === ch.id
                    ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                )}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="border border-border/70 bg-card rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-muted/60 text-muted-foreground font-bold border-b border-border/60">
              <tr>
                <th className="p-3 text-start">شماره فاکتور</th>
                <th className="p-3 text-start">کانال سفارش</th>
                <th className="p-3 text-start">مشتری / میز</th>
                <th className="p-3 text-start">تعداد اقلام</th>
                <th className="p-3 text-start">مبلغ کل فاکتور</th>
                <th className="p-3 text-start">وضعیت تسویه</th>
                <th className="p-3 text-start">وضعیت سفارش</th>
                <th className="p-3 text-start">زمان ثبت</th>
                <th className="p-3 text-end">فاکتور رسمی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredOrders.map((order) => {
                const isPaid = order.paymentStatus === "Paid";
                return (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-foreground">{order.orderNumber}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px] rounded-md py-0.5 gap-1">
                        {order.type === "DineIn" ? (
                          <>
                            <UtensilsCrossed className="size-3" /> سالن
                          </>
                        ) : order.type === "Takeaway" ? (
                          <>
                            <ShoppingBag className="size-3" /> بیرون‌بر
                          </>
                        ) : order.type === "Delivery" ? (
                          <>
                            <Bike className="size-3" /> پیک
                          </>
                        ) : (
                          <>
                            <Store className="size-3" /> اسنپ‌فود
                          </>
                        )}
                      </Badge>
                    </td>
                    <td className="p-3 font-medium text-foreground">
                      {order.customerName} {order.tableNumber ? `(میز ${order.tableNumber})` : ""}
                    </td>
                    <td className="p-3 fa-num text-muted-foreground">
                      {order.items.reduce((acc, i) => acc + i.quantity, 0)} آیتم
                    </td>
                    <td className="p-3 font-bold text-foreground fa-num">
                      {order.grandTotal.toLocaleString("fa-IR")} تومان
                    </td>
                    <td className="p-3">
                      {isPaid ? (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] rounded-md py-0.5">
                          پرداخت شده
                        </Badge>
                      ) : (
                        <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[10px] rounded-md py-0.5">
                          تسویه نشده
                        </Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-[10px] rounded-md py-0.5">
                        {order.status === "InKitchen"
                          ? "در آشپزخانه"
                          : order.status === "Ready"
                          ? "آماده تحویل"
                          : order.status === "Delivered"
                          ? "تحویل شده"
                          : "در صف"}
                      </Badge>
                    </td>
                    <td className="p-3 fa-num text-muted-foreground">{order.createdAt}</td>
                    <td className="p-3 text-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrderForInvoice(order)}
                        className="h-7 px-2.5 rounded-md text-[11px] font-semibold border-primary/40 text-primary hover:bg-primary/10 gap-1 cursor-pointer"
                      >
                        <Eye className="size-3" />
                        مشاهده فاکتور
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Official Invoice Modal */}
      <Dialog open={!!selectedOrderForInvoice} onOpenChange={() => setSelectedOrderForInvoice(null)}>
        {selectedOrderForInvoice && (
          <DialogContent className="max-w-md rounded-lg p-5">
            <DialogHeader>
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-foreground font-['Anta']">ZHEEN COFFEE</h3>
                  <p className="text-[11px] text-muted-foreground">کافه تخصصی ژین – صورت‌حساب فروش کالا و خدمات</p>
                </div>
                <Badge className="bg-primary text-primary-foreground font-mono text-xs rounded-md">
                  {selectedOrderForInvoice.orderNumber}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>زمان ثبت: {selectedOrderForInvoice.createdAt}</span>
                <span>
                  نحوه سرو:{" "}
                  {selectedOrderForInvoice.type === "DineIn"
                    ? `سالن (میز ${selectedOrderForInvoice.tableNumber || "-"})`
                    : selectedOrderForInvoice.type}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>مشتری: {selectedOrderForInvoice.customerName}</span>
                <span>
                  شیوه تسویه:{" "}
                  {selectedOrderForInvoice.paymentMethod === "CardPOS" ? "کارتخوان بانکی" : "نقدی"}
                </span>
              </div>

              {/* Items Table */}
              <div className="border border-border/60 rounded-md overflow-hidden mt-2">
                <table className="w-full text-[11px]">
                  <thead className="bg-muted/60 text-muted-foreground font-bold border-b border-border/60">
                    <tr>
                      <th className="p-2 text-start">شرح کالا</th>
                      <th className="p-2 text-center">تعداد</th>
                      <th className="p-2 text-end">فی</th>
                      <th className="p-2 text-end">مبلغ کل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {selectedOrderForInvoice.items.map((i, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-medium">{i.name}</td>
                        <td className="p-2 text-center fa-num">{i.quantity}</td>
                        <td className="p-2 text-end fa-num">{i.unitPrice.toLocaleString("fa-IR")}</td>
                        <td className="p-2 text-end font-bold fa-num">
                          {(i.quantity * i.unitPrice).toLocaleString("fa-IR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="space-y-1 pt-2 border-t border-border/50 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>جمع اقلام:</span>
                  <span className="font-bold fa-num">
                    {selectedOrderForInvoice.subtotal.toLocaleString("fa-IR")} تومان
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>مالیات ارزش افزوده (۱۰٪):</span>
                  <span className="font-bold fa-num">
                    {selectedOrderForInvoice.tax.toLocaleString("fa-IR")} تومان
                  </span>
                </div>
                {selectedOrderForInvoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>تخفیف:</span>
                    <span className="font-bold fa-num">
                      -{selectedOrderForInvoice.discount.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm pt-1 border-t border-border/60 text-primary">
                  <span>مبلغ کل پرداختی:</span>
                  <span className="fa-num">
                    {selectedOrderForInvoice.grandTotal.toLocaleString("fa-IR")} تومان
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrderForInvoice(null)}
                className="rounded-md h-8 text-xs cursor-pointer"
              >
                بستن
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={printInvoice}
                className="rounded-md h-8 text-xs font-bold gap-1.5 cursor-pointer"
              >
                <Printer className="size-3.5" />
                چاپ فاکتور حرارتی
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
