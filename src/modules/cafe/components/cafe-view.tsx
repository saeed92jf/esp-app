"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  Coffee,
  Receipt,
  LayoutGrid,
  ChefHat,
  Boxes,
  BarChart3,
  Sparkles,
  Wifi,
  ShieldCheck,
  UtensilsCrossed,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";

// Sub-components
import { PosTerminalView } from "./pos-terminal-view";
import { TablesView } from "./tables-view";
import { KitchenKdsView } from "./kitchen-kds-view";
import { OrdersHubView } from "./orders-hub-view";
import { InventoryBomView } from "./inventory-bom-view";
import { ReportsView } from "./reports-view";
import { BlueChocolate3D } from "./blue-chocolate-3d";

// Mock Data
import {
  INITIAL_MENU_ITEMS,
  INITIAL_RAW_MATERIALS,
  INITIAL_BOM_RECIPES,
  INITIAL_TABLES,
  INITIAL_ORDERS,
  INITIAL_WASTE_RECORDS,
} from "../mock-data";

import { Order, OrderStatus, TableItem, RawMaterial, WasteRecord } from "../types";

export function CafeView() {
  const locale = useLocale();
  const isFa = locale === "fa";

  // Active main tab
  const [activeTab, setActiveTab] = useState<string>("pos");

  // State
  const [menuItems, setMenuItems] = useState(INITIAL_MENU_ITEMS);
  const [materials, setMaterials] = useState<RawMaterial[]>(INITIAL_RAW_MATERIALS);
  const [bomRecipes, setBomRecipes] = useState(INITIAL_BOM_RECIPES);
  const [tables, setTables] = useState<TableItem[]>(INITIAL_TABLES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>(INITIAL_WASTE_RECORDS);

  // 3D Experience Modal State
  const [modal3dOpen, setModal3dOpen] = useState<boolean>(false);

  // Handler: Order created
  const handleOrderCreated = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Update table status if DineIn
    if (newOrder.type === "DineIn" && newOrder.tableNumber) {
      setTables((prev) =>
        prev.map((t) =>
          t.number === newOrder.tableNumber
            ? { ...t, status: "Occupied", currentOrderId: newOrder.id, activeMinutes: 1 }
            : t
        )
      );
    }

    // Auto-deduct raw materials using BOM recipes
    setMaterials((prevMaterials) => {
      const updatedMaterials = [...prevMaterials];
      newOrder.items.forEach((orderItem) => {
        const recipe = bomRecipes.find((b) => b.menuItemId === orderItem.menuItemId);
        if (recipe) {
          recipe.ingredients.forEach((ing) => {
            const matIdx = updatedMaterials.findIndex((m) => m.id === ing.materialId);
            if (matIdx !== -1) {
              const deductAmount = ing.quantity * orderItem.quantity;
              updatedMaterials[matIdx] = {
                ...updatedMaterials[matIdx],
                currentStock: Math.max(0, updatedMaterials[matIdx].currentStock - deductAmount),
              };
            }
          });
        }
      });
      return updatedMaterials;
    });
  };

  // Handler: Kitchen status update
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  // Handler: Table status update
  const handleUpdateTableStatus = (tableId: string, status: "Free" | "Occupied" | "Reserved") => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status } : t))
    );
  };

  // Handler: Select table and jump to POS
  const handleSelectTableForOrder = (tableNumber: string) => {
    setActiveTab("pos");
  };

  // Handler: Add stock
  const handleAddMaterialStock = (materialId: string, quantity: number) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === materialId
          ? { ...m, currentStock: Math.max(0, m.currentStock + quantity) }
          : m
      )
    );
  };

  // Handler: Add waste record
  const handleAddWasteRecord = (waste: WasteRecord) => {
    setWasteRecords((prev) => [waste, ...prev]);
  };

  const navItems = [
    { id: "pos", label: "صندوق و فروش حضوری", icon: Receipt },
    { id: "tables", label: "میزها و چیدمان سالن", icon: LayoutGrid },
    { id: "kitchen", label: "نمایشگر آشپزخانه KDS", icon: ChefHat },
    { id: "orders", label: "سفارشات و صورت‌حساب‌ها", icon: Store },
    { id: "inventory", label: "انبارداری و فرمول BOM", icon: Boxes },
    { id: "reports", label: "گزارشات مالی و فروش", icon: BarChart3 },
    { id: "experience3d", label: "تجربه ۳ بعدی شکلات آبی", icon: Sparkles },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Top Application Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-card border border-border/70 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center shadow-xs">
            <Coffee className="size-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-foreground tracking-tight font-['Anta']">
                ZHEEN COFFEE & CAFE ERP
              </h1>
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] rounded-md px-1.5 py-0">
                سیستم متصل و آنلاین
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              سامانه جامع صندوق فروشگاهی، کنترل انبار BOM، نمایشگر آشپزخانه KDS و مدیریت میزها
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <Link
            href="/zheen-erp"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-md text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-colors"
          >
            <Boxes className="size-4" />
            سامانه جامع ERP ژین
          </Link>
          <Button
            variant="default"
            size="sm"
            onClick={() => setModal3dOpen(true)}
            className="rounded-md h-9 px-3 text-xs font-bold gap-2 bg-gradient-to-r from-blue-700 via-indigo-700 to-primary text-white shadow-xs cursor-pointer hover:opacity-95"
          >
            <Sparkles className="size-4 animate-pulse text-yellow-300" />
            رونمایی ۳ بعدی شکلات آبی (Blue Chocolate)
          </Button>
        </div>
      </div>

      {/* Main Navigation Tabs - STRICT UNIFORM LOW CURVE (rounded-md, h-10) */}
      <div className="flex items-center gap-1.5 p-1 rounded-md bg-muted/60 border border-border/60 overflow-x-auto pb-1 sm:pb-1">
        {navItems.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 h-10 px-3.5 rounded-md text-xs font-bold shrink-0 transition-all duration-150 cursor-pointer select-none border",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-background/80 text-muted-foreground border-border/50 hover:text-foreground hover:bg-background"
              )}
            >
              <Icon className={cn("size-4 shrink-0", isActive ? "text-primary-foreground" : "text-primary")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="pt-1">
        {activeTab === "pos" && (
          <PosTerminalView
            menuItems={menuItems}
            tables={tables}
            onOrderCreated={handleOrderCreated}
            onOpen3DExperience={() => setModal3dOpen(true)}
          />
        )}

        {activeTab === "tables" && (
          <TablesView
            tables={tables}
            onSelectTableForOrder={handleSelectTableForOrder}
            onUpdateTableStatus={handleUpdateTableStatus}
          />
        )}

        {activeTab === "kitchen" && (
          <KitchenKdsView orders={orders} onUpdateOrderStatus={handleUpdateOrderStatus} />
        )}

        {activeTab === "orders" && <OrdersHubView orders={orders} />}

        {activeTab === "inventory" && (
          <InventoryBomView
            materials={materials}
            bomRecipes={bomRecipes}
            wasteRecords={wasteRecords}
            onAddMaterialStock={handleAddMaterialStock}
            onAddWasteRecord={handleAddWasteRecord}
          />
        )}

        {activeTab === "reports" && <ReportsView orders={orders} menuItems={menuItems} />}

        {activeTab === "experience3d" && (
          <div className="space-y-3">
            <div className="p-3 bg-card border border-border/70 rounded-md flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">نمایشگر اختصاصی ۳ بعدی شکلات آبی</h3>
                <p className="text-xs text-muted-foreground">
                  شبیه‌سازی فرآیند آماده‌سازی نوشیدنی امضای ژین کافی با انیمیشن‌های Three.js و فیزیک سیالات
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModal3dOpen(true)}
                className="h-8 rounded-md text-xs font-bold border-primary/40 text-primary hover:bg-primary/10 cursor-pointer"
              >
                حالت تمام‌صفحه سینماتیک
              </Button>
            </div>
            <BlueChocolate3D inline={true} />
          </div>
        )}
      </div>

      {/* Fullscreen 3D Modal */}
      {modal3dOpen && <BlueChocolate3D onClose={() => setModal3dOpen(false)} inline={false} />}
    </div>
  );
}
