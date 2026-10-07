"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Activity, Cpu, HardDrive, Network, Server } from "lucide-react";
import { useLocale } from "next-intl";
import { WidgetShell } from "./widget-shell";

export function SystemStatusWidget() {
  const locale = useLocale();
  const isFa = locale === "fa";

  const metrics = [
    { label: isFa ? "پردازنده" : "CPU", value: "42%", icon: Cpu, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: isFa ? "حافظه رم" : "RAM", value: "6.8 GB", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: isFa ? "فضای دیسک" : "Disk", value: "78%", icon: HardDrive, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: isFa ? "شبکه" : "Network", value: "125 ms", icon: Network, color: "text-violet-500", bg: "bg-violet-500/10" },
  ];

  return (
    <div className="flex flex-col h-full bg-card rounded-xl rounded-br-none border border-border/50 overflow-hidden relative transition-all duration-300 fa-num p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Server className="size-5 text-primary" />
          </div>
          <h3 className="font-semibold text-base sm:text-lg text-foreground/90 tracking-tight">
            {isFa ? "وضعیت سامانه" : "System Status"}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          {isFa ? "آنلاین" : "Online"}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3 sm:gap-4 mt-2">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring" }}
              className="flex flex-col p-3 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/60 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${m.bg} ${m.color}`}>
                  <Icon className="size-4" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{m.label}</span>
              </div>
              <div className="mt-auto">
                <span className="text-xl font-bold text-foreground/90 tracking-tight">{m.value}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
