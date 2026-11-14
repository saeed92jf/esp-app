"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Coffee,
  LayoutDashboard,
  Boxes,
  ChefHat,
  DollarSign,
  CreditCard,
  Users,
  CheckSquare,
  Sprout,
  BarChart3,
  Bell,
  User,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Store & Context
import { ZheenStoreProvider, useZheenStore } from "../store/zheen-store";

// Module Sub-Views
import { ZheenDashboardView } from "./dashboard/zheen-dashboard-view";
import { ZheenInventoryView } from "./inventory/zheen-inventory-view";
import { ZheenProductionView } from "./production/zheen-production-view";
import { ZheenCostingPackagingView } from "./costing/zheen-costing-packaging-view";
import { ZheenExpensesMaintenanceView } from "./expenses/zheen-expenses-maintenance-view";
import { ZheenHrContractsView } from "./hr/zheen-hr-contracts-view";
import { ZheenOperationsTasksView } from "./operations/zheen-operations-tasks-view";
import { ZheenPlantsView } from "./plants/zheen-plants-view";
import { ZheenReportsView } from "./reports/zheen-reports-view";

function ZheenErpContent() {
  const {
    currentUser,
    allUsers,
    switchUser,
    activeTab,
    setActiveTab,
    notifications,
    markNotificationRead,
    clearAllNotifications,
  } = useZheenStore();

  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navModules = [
    { id: "dashboard", label: "داشبورد کلان", icon: LayoutDashboard },
    { id: "inventory", label: "انبارداری سه‌گانه", icon: Boxes },
    { id: "production", label: "فرمولاسیون BOM و تولید", icon: ChefHat },
    { id: "costing", label: "بهای تمام‌شده و بسته‌بندی", icon: DollarSign },
    { id: "expenses", label: "هزینه‌ها و تعمیرات", icon: CreditCard },
    { id: "hr", label: "پرسنل و قراردادها", icon: Users },
    { id: "operations", label: "چک‌لیست‌ها و تسک‌ها", icon: CheckSquare },
    { id: "plants", label: "مراقبت از گیاهان", icon: Sprout },
    { id: "reports", label: "گزارشات تحلیلی", icon: BarChart3 },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* Top Application Bar */}
      <div className="rounded-lg border border-border/70 bg-card p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left / Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center shadow-xs">
            <Coffee className="size-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-foreground font-['Anta']">
                ZHEEN CAFÉ ERP
              </h1>
              <Badge className="bg-primary text-primary-foreground text-[10px] rounded-md px-1.5 py-0 font-bold">
                نسخه جامع سازمانی
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              سامانه یکپارچه مدیریت انبار، تولید، بهای تمام‌شده، پرسنل، نگهداری و فضای سبز کافه ژین
            </p>
          </div>
        </div>

        {/* Right / User Role Switcher & Notifications */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Role Switcher Select */}
          <div className="flex items-center gap-1.5 bg-muted/50 border border-border/60 rounded-md p-1 px-2 text-xs">
            <User className="size-3.5 text-primary" />
            <span className="text-[11px] text-muted-foreground">نقش فعال:</span>
            <select
              value={currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
              className="bg-transparent font-bold text-foreground text-xs cursor-pointer outline-none"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id} className="bg-popover text-foreground">
                  {u.name} ({u.roleTitleFa})
                </option>
              ))}
            </select>
          </div>

          {/* Notification Bell Button - Strict low curve rounded-md */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setNotificationsOpen(true)}
            className="relative size-9 p-0 rounded-md border-border/70 text-foreground hover:bg-muted cursor-pointer"
            title="مرکز اعلان‌ها"
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -end-1 size-4 rounded-full bg-destructive text-white text-[9px] font-black flex items-center justify-center animate-pulse fa-num">
                {unreadCount}
              </span>
            )}
          </Button>

          {/* Quick link to Front-desk POS & 3D */}
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-9 px-3 rounded-md text-xs font-bold gap-1.5 border-primary/40 text-primary hover:bg-primary/10 cursor-pointer"
          >
            <Link href="/cafe">
              <Sparkles className="size-3.5 text-primary" />
              صندوق فروشگاهی POS
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Module Tabs - STRICT UNIFORM LOW CURVE (rounded-md, h-10) */}
      <div className="flex items-center gap-1 p-1 rounded-md bg-muted/60 border border-border/60 overflow-x-auto pb-1 sm:pb-1">
        {navModules.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 h-10 px-3 rounded-md text-xs font-bold shrink-0 transition-all duration-150 cursor-pointer select-none border",
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

      {/* Main Views Container */}
      <div className="pt-1">
        {activeTab === "dashboard" && <ZheenDashboardView />}
        {activeTab === "inventory" && <ZheenInventoryView />}
        {activeTab === "production" && <ZheenProductionView />}
        {activeTab === "costing" && <ZheenCostingPackagingView />}
        {activeTab === "expenses" && <ZheenExpensesMaintenanceView />}
        {activeTab === "hr" && <ZheenHrContractsView />}
        {activeTab === "operations" && <ZheenOperationsTasksView />}
        {activeTab === "plants" && <ZheenPlantsView />}
        {activeTab === "reports" && <ZheenReportsView />}
      </div>

      {/* Central Notification Modal */}
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="max-w-lg rounded-lg p-5">
          <DialogHeader>
            <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Bell className="size-5 text-primary" />
                مرکز هشدارهای متمرکز کافه ژین
              </DialogTitle>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllNotifications}
                  className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground rounded-md cursor-pointer"
                >
                  علامت‌گذاری همه
                </Button>
              )}
            </div>
            <DialogDescription className="text-xs">
              پایش بلادرنگ هشدارهای کسری انبار، سررسید اقساط، انقضای قراردادها، تسک‌های معوقه و آبیاری گیاهان
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-[380px] overflow-y-auto py-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="size-8 mx-auto text-emerald-600 mb-2" />
                <p className="text-xs font-bold">هیچ هشدار فعالی وجود ندارد!</p>
                <p className="text-[11px] opacity-75">تمام بخش‌های کافه در وضعیت مطلوب به سر می‌برند.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    markNotificationRead(n.id);
                    setActiveTab(n.linkTab);
                    setNotificationsOpen(false);
                  }}
                  className={cn(
                    "flex items-start gap-3 p-2.5 rounded-md border transition-colors cursor-pointer",
                    n.isRead
                      ? "bg-muted/20 border-border/40 opacity-70"
                      : "bg-card border-border/70 hover:border-primary/50 shadow-2xs"
                  )}
                >
                  <div
                    className={cn(
                      "size-7 rounded-md shrink-0 flex items-center justify-center mt-0.5",
                      n.severity === "destructive" && "bg-destructive/15 text-destructive",
                      n.severity === "warning" && "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                      n.severity === "info" && "bg-primary/15 text-primary"
                    )}
                  >
                    <AlertTriangle className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className="font-bold text-xs text-foreground truncate">{n.title}</h5>
                      <span className="text-[10px] text-muted-foreground shrink-0">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {n.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter className="pt-2 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNotificationsOpen(false)}
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

export function ZheenErpShell() {
  return (
    <ZheenStoreProvider>
      <ZheenErpContent />
    </ZheenStoreProvider>
  );
}
