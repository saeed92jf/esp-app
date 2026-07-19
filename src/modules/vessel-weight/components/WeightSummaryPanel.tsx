'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useVesselWeightStore } from '../store/useVesselWeightStore';
import { Scale, Truck, Droplets, HardHat, Package, CheckCircle2 } from 'lucide-react';

export function WeightSummaryPanel() {
  const t = useTranslations('VesselWeight');
  const summary = useVesselWeightStore((s) => s.weightSummary);

  const conditions = [
    { key: 'rawWeight', label: 'Raw / Cutting', icon: <Package size={16} />, color: 'text-slate-400' },
    { key: 'fabricatedWeight', label: 'Fabricated (Empty)', icon: <Scale size={16} />, color: 'text-emerald-500' },
    { key: 'shippingWeight', label: 'Shipping', icon: <Truck size={16} />, color: 'text-blue-500' },
    { key: 'erectionWeight', label: 'Erection / Lift', icon: <HardHat size={16} />, color: 'text-amber-500' },
    { key: 'operatingWeight', label: 'Operating', icon: <CheckCircle2 size={16} />, color: 'text-primary' },
    { key: 'hydrotestWeight', label: 'Hydrotest', icon: <Droplets size={16} />, color: 'text-cyan-500' },
  ];

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b border-border bg-muted/20">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Weight Summary</h2>
        <p className="text-[10px] text-muted-foreground mt-1">ASME Sec. VIII 6-Condition Report</p>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {conditions.map((cond) => {
          const val = summary ? summary[cond.key as keyof typeof summary] : 0;
          return (
            <div key={cond.key} className="flex flex-col p-3 rounded-lg border border-border bg-muted/10">
              <div className="flex items-center gap-2 mb-2">
                <div className={cond.color}>{cond.icon}</div>
                <span className="text-xs font-semibold text-muted-foreground">{cond.label}</span>
              </div>
              <div className="text-2xl font-bold tabular-nums text-foreground tracking-tight">
                {val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span className="text-xs text-muted-foreground font-normal">kg</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
