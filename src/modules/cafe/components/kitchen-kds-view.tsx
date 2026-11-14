"use client";

import React from "react";
import { Clock, ChefHat, CheckCircle2, ArrowLeft, AlertTriangle, Coffee } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Order, OrderStatus } from "../types";

interface KitchenKdsViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export function KitchenKdsView({ orders, onUpdateOrderStatus }: KitchenKdsViewProps) {
  const activeOrders = orders.filter(
    (o) => o.status === "Pending" || o.status === "InKitchen" || o.status === "Ready"
  );

  return (
    <div className="space-y-4">
      {/* KDS Header Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-card border border-border/70 rounded-lg shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ChefHat className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-foreground">
              نمایشگر زنده آشپزخانه و بار گرم (KDS Terminal)
            </h3>
            <p className="text-xs text-muted-foreground">صف آماده‌سازی سفارشات به ترتیب اولویت زمان ثبت</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-primary/15 text-primary border-primary/30 rounded-md py-1 px-3 text-xs font-bold">
            سفارشات فعال در صف: {activeOrders.length}
          </Badge>
        </div>
      </div>

      {/* Orders Grid */}
      {activeOrders.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-border/70 rounded-lg">
          <ChefHat className="size-12 mx-auto text-muted-foreground/40 stroke-1 mb-2" />
          <h4 className="font-bold text-sm text-foreground">آشپزخانه و بار خلوت است!</h4>
          <p className="text-xs text-muted-foreground mt-1">سفارش جدیدی در انتظار آماده‌سازی نیست.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeOrders.map((order) => {
            const isCooking = order.status === "InKitchen" || order.status === "Pending";
            const isReady = order.status === "Ready";
            const elapsed = order.elapsedMinutes || 5;

            // Timer warning level
            const isUrgent = elapsed > 15;
            const isWarning = elapsed > 8 && elapsed <= 15;

            return (
              <Card
                key={order.id}
                className={cn(
                  "border rounded-lg flex flex-col justify-between shadow-xs transition-all",
                  isCooking && "border-primary/50 bg-card",
                  isReady && "border-emerald-500/50 bg-emerald-500/5"
                )}
              >
                {/* Order Header */}
                <CardHeader className="p-3.5 pb-2 border-b border-border/50 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-foreground">{order.orderNumber}</span>
                      <Badge variant="outline" className="text-[10px] rounded-md py-0">
                        {order.type === "DineIn"
                          ? `میز ${order.tableNumber || "نامشخص"}`
                          : order.type === "Takeaway"
                          ? "بیرون‌بر"
                          : order.type === "Delivery"
                          ? "ارسال با پیک"
                          : "اسنپ‌فود"}
                      </Badge>
                    </div>

                    <div
                      className={cn(
                        "flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border",
                        isUrgent
                          ? "bg-destructive/15 text-destructive border-destructive/30 animate-pulse"
                          : isWarning
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                          : "bg-muted text-muted-foreground border-border/50"
                      )}
                    >
                      <Clock className="size-3" />
                      <span className="fa-num">{elapsed} دقیقه پیش</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">مشتری: {order.customerName}</p>
                </CardHeader>

                {/* Items List */}
                <CardContent className="p-3.5 space-y-2 flex-1">
                  <div className="space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded-md bg-muted/40 border border-border/30"
                      >
                        <span className="font-bold text-foreground">{item.name}</span>
                        <Badge className="bg-primary text-primary-foreground font-black text-xs size-6 p-0 rounded-md flex items-center justify-center fa-num">
                          {item.quantity}×
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>

                {/* Status Advancement Actions - STRICT LOW CURVE rounded-md */}
                <CardFooter className="p-3.5 pt-2 border-t border-border/40 bg-muted/20 flex items-center justify-between gap-2">
                  {isCooking ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        onUpdateOrderStatus(order.id, "Ready");
                        toast.success(`سفارش ${order.orderNumber} آماده شد و به پیشخوان منتقل گردید.`);
                      }}
                      className="w-full h-9 rounded-md text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    >
                      <CheckCircle2 className="size-4" />
                      سفارش آماده شد (انتقال به پیشخوان)
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onUpdateOrderStatus(order.id, "Delivered");
                        toast.success(`سفارش ${order.orderNumber} تحویل مشتری یا پیک گردید.`);
                      }}
                      className="w-full h-9 rounded-md text-xs font-bold gap-1.5 border-emerald-500/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer"
                    >
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      تحویل نهایی گردید (اتمام سفارش)
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
