'use client';

import React, { memo, useEffect } from 'react';
import { Handle, Position, NodeToolbar, type NodeProps } from '@xyflow/react';
import { useTranslations } from 'next-intl';
import { Trash2, ArrowDownToLine } from 'lucide-react';
import { useVesselWeightStore } from '../../store/useVesselWeightStore';
import type { SupportNodeData, SupportType } from '../../schemas/support.schema';
import {
  calcRectPlateWeight,
  calcAnnularRingWeight,
  calcCylinderWeight,
  calcLegColumnWeight
} from '../../calculations/support.calc';

const inputCls = 'w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors';
const labelCls = 'block text-[9px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider truncate';

export const SupportNode = memo(({ id, data, selected }: NodeProps) => {
  const t = useTranslations('VesselWeight');
  const d = data as SupportNodeData;
  const updateNodeData = useVesselWeightStore((s) => s.updateNodeData);
  const deleteNode = useVesselWeightStore((s) => s.deleteNode);
  const nodes = useVesselWeightStore((s) => s.nodes);

  const rootNode = nodes.find(n => n.type === 'vesselRootNode');
  const orientation = rootNode?.data?.vessel?.orientation || 'VERTICAL';

  // Ensure supportType matches orientation
  useEffect(() => {
    if (orientation === 'HORIZONTAL' && d.supportType !== 'SADDLE') {
      update('supportType', 'SADDLE');
    } else if (orientation === 'VERTICAL' && d.supportType === 'SADDLE') {
      update('supportType', 'SKIRT');
    }
  }, [orientation, d.supportType]);

  // Defaults
  const skirt = d.skirt || {
    topMaterial: 'CS_A516_70', bottomMaterial: 'CS_A516_70', height_mm: 2000,
    skirtShell: { innerDiameter_mm: 1000, thickness_mm: 10 },
    baseRing: { innerDiameter_mm: 1000, outerDiameter_mm: 1200, thickness_mm: 20 },
    gussetPlate: { qty: 12, length_mm: 200, width_mm: 150, thickness_mm: 15 },
    hasTopPlate: false, topPlate: { width_mm: 1200, length_mm: 1200, thickness_mm: 20 },
    hasTopRing: false, topRing: { innerDiameter_mm: 1000, outerDiameter_mm: 1200, thickness_mm: 20 },
    hasTemplatePlate: false, templatePlate: { innerDiameter_mm: 1050, outerDiameter_mm: 1250, thickness_mm: 5 },
  };

  const leg = d.leg || {
    column: { type: 'PIPE', qty: 4, profileSize: 'DN150', linearWeight_kg_m: 30, height_mm: 1500 },
    basePlate: { width_mm: 200, length_mm: 200, thickness_mm: 15, qty: 4 },
    coverPlate: { width_mm: 150, length_mm: 150, thickness_mm: 10, qty: 4 },
    reinforcePlate: { width_mm: 150, length_mm: 150, thickness_mm: 10, qty: 4 },
  };

  const lug = d.lug || {
    basePlate: { width_mm: 200, length_mm: 200, thickness_mm: 15, qty: 4 },
    gussetPlate: { width_mm: 150, length_mm: 150, thickness_mm: 10, qty: 8 },
    topPlate: { width_mm: 150, length_mm: 150, thickness_mm: 10, qty: 4 },
    reinforcePlate: { width_mm: 200, length_mm: 200, thickness_mm: 15, qty: 4 },
  };

  const saddle = d.saddle || {
    numberOfSaddles: 2,
    basePlate: { width_mm: 300, length_mm: 1500, thickness_mm: 20, qty: 2 },
    wearPlate: { width_mm: 400, length_mm: 1600, thickness_mm: 15, qty: 2 },
    webPlate: { width_mm: 300, length_mm: 1500, thickness_mm: 12, qty: 2 },
    ribPlate: { width_mm: 150, length_mm: 300, thickness_mm: 10, qty: 8 },
  };

  const calculateTotalWeight = (supportType: SupportType) => {
    let total = 0;
    const density = 7850; // default CS density

    if (supportType === 'SKIRT') {
      const topHeight = Math.min(1000, skirt.height_mm);
      const bottomHeight = Math.max(0, skirt.height_mm - 1000);
      
      const shellTopW = calcCylinderWeight(skirt.skirtShell.innerDiameter_mm, skirt.skirtShell.thickness_mm, topHeight, 1, density);
      const shellBotW = calcCylinderWeight(skirt.skirtShell.innerDiameter_mm, skirt.skirtShell.thickness_mm, bottomHeight, 1, density);
      
      const brW = calcAnnularRingWeight(skirt.baseRing.innerDiameter_mm, skirt.baseRing.outerDiameter_mm, skirt.baseRing.thickness_mm, 1, density);
      const gusW = calcRectPlateWeight(skirt.gussetPlate.width_mm, skirt.gussetPlate.length_mm, skirt.gussetPlate.thickness_mm, skirt.gussetPlate.qty, density);
      
      let topPW = 0;
      let topRW = 0;
      if (skirt.hasTopPlate) {
        topPW = calcRectPlateWeight(skirt.topPlate.width_mm, skirt.topPlate.length_mm, skirt.topPlate.thickness_mm, 1, density);
      } else if (skirt.hasTopRing) {
        topRW = calcAnnularRingWeight(skirt.topRing.innerDiameter_mm, skirt.topRing.outerDiameter_mm, skirt.topRing.thickness_mm, 1, density);
      }

      let tpW = 0;
      if (skirt.hasTemplatePlate) {
        tpW = calcAnnularRingWeight(skirt.templatePlate.innerDiameter_mm, skirt.templatePlate.outerDiameter_mm, skirt.templatePlate.thickness_mm, 1, density);
      }

      total = shellTopW + shellBotW + brW + gusW + topPW + topRW + tpW;
    } 
    else if (supportType === 'LEG') {
      const colW = calcLegColumnWeight(leg.column.height_mm, leg.column.linearWeight_kg_m, leg.column.qty);
      const bpW = calcRectPlateWeight(leg.basePlate.width_mm, leg.basePlate.length_mm, leg.basePlate.thickness_mm, leg.basePlate.qty, density);
      const cpW = calcRectPlateWeight(leg.coverPlate.width_mm, leg.coverPlate.length_mm, leg.coverPlate.thickness_mm, leg.coverPlate.qty, density);
      const rpW = calcRectPlateWeight(leg.reinforcePlate.width_mm, leg.reinforcePlate.length_mm, leg.reinforcePlate.thickness_mm, leg.reinforcePlate.qty, density);
      total = colW + bpW + cpW + rpW;
    }
    else if (supportType === 'LUG') {
      const bpW = calcRectPlateWeight(lug.basePlate.width_mm, lug.basePlate.length_mm, lug.basePlate.thickness_mm, lug.basePlate.qty, density);
      const gusW = calcRectPlateWeight(lug.gussetPlate.width_mm, lug.gussetPlate.length_mm, lug.gussetPlate.thickness_mm, lug.gussetPlate.qty, density);
      const tpW = calcRectPlateWeight(lug.topPlate.width_mm, lug.topPlate.length_mm, lug.topPlate.thickness_mm, lug.topPlate.qty, density);
      const rpW = calcRectPlateWeight(lug.reinforcePlate.width_mm, lug.reinforcePlate.length_mm, lug.reinforcePlate.thickness_mm, lug.reinforcePlate.qty, density);
      total = bpW + gusW + tpW + rpW;
    }
    else if (supportType === 'SADDLE') {
      const bpW = calcRectPlateWeight(saddle.basePlate.width_mm, saddle.basePlate.length_mm, saddle.basePlate.thickness_mm, saddle.basePlate.qty, density);
      const wpW = calcRectPlateWeight(saddle.wearPlate.width_mm, saddle.wearPlate.length_mm, saddle.wearPlate.thickness_mm, saddle.wearPlate.qty, density);
      const webW = calcRectPlateWeight(saddle.webPlate.width_mm, saddle.webPlate.length_mm, saddle.webPlate.thickness_mm, saddle.webPlate.qty, density);
      const rbW = calcRectPlateWeight(saddle.ribPlate.width_mm, saddle.ribPlate.length_mm, saddle.ribPlate.thickness_mm, saddle.ribPlate.qty, density);
      // Rough rect approximation for wear plate and web plate which are usually curved, but this gives a workable bounding volume estimate
      total = bpW + wpW + webW + rbW;
    }

    return total;
  };

  const update = (field: string, value: any, category?: 'skirt' | 'leg' | 'lug' | 'saddle', subCategory?: string) => {
    let newData: any = { ...d };

    if (!category) {
      newData[field] = value;
    } else {
      if (!newData[category]) {
        // assign defaults if initializing
        if (category === 'skirt') newData.skirt = { ...skirt };
        if (category === 'leg') newData.leg = { ...leg };
        if (category === 'lug') newData.lug = { ...lug };
        if (category === 'saddle') newData.saddle = { ...saddle };
      }
      if (subCategory) {
        newData[category][subCategory] = { ...newData[category][subCategory], [field]: value };
      } else {
        newData[category][field] = value;
      }
    }

    const newTotal = calculateTotalWeight(newData.supportType || 'SKIRT');
    updateNodeData(id, { ...newData, totalFabricatedWeight: newTotal } as any);
  };

  const renderRectPlateInputs = (label: string, category: 'skirt' | 'leg' | 'lug' | 'saddle', subCategory: string) => {
    const dataObj = (d as any)[category]?.[subCategory] || {};
    return (
      <div className="grid grid-cols-4 gap-2 border border-border p-2 rounded mt-2 bg-muted/5">
        <div className="col-span-4"><span className="text-[10px] font-bold text-foreground">{label}</span></div>
        <div><label className={labelCls}>W (mm)</label><input type="number" className={inputCls} value={dataObj.width_mm ?? ''} onChange={e => update('width_mm', Number(e.target.value), category, subCategory)} /></div>
        <div><label className={labelCls}>L (mm)</label><input type="number" className={inputCls} value={dataObj.length_mm ?? ''} onChange={e => update('length_mm', Number(e.target.value), category, subCategory)} /></div>
        <div><label className={labelCls}>Thk (mm)</label><input type="number" className={inputCls} value={dataObj.thickness_mm ?? ''} onChange={e => update('thickness_mm', Number(e.target.value), category, subCategory)} /></div>
        <div><label className={labelCls}>Qty</label><input type="number" className={inputCls} value={dataObj.qty ?? ''} onChange={e => update('qty', Number(e.target.value), category, subCategory)} /></div>
      </div>
    );
  };

  const renderAnnularRingInputs = (label: string, category: 'skirt' | 'leg' | 'lug' | 'saddle', subCategory: string, hasQty: boolean = false) => {
    const dataObj = (d as any)[category]?.[subCategory] || {};
    return (
      <div className={`grid ${hasQty ? 'grid-cols-4' : 'grid-cols-3'} gap-2 border border-border p-2 rounded mt-2 bg-muted/5`}>
        <div className={`col-span-${hasQty ? '4' : '3'}`}><span className="text-[10px] font-bold text-foreground">{label}</span></div>
        <div><label className={labelCls}>ID (mm)</label><input type="number" className={inputCls} value={dataObj.innerDiameter_mm ?? ''} onChange={e => update('innerDiameter_mm', Number(e.target.value), category, subCategory)} /></div>
        <div><label className={labelCls}>OD (mm)</label><input type="number" className={inputCls} value={dataObj.outerDiameter_mm ?? ''} onChange={e => update('outerDiameter_mm', Number(e.target.value), category, subCategory)} /></div>
        <div><label className={labelCls}>Thk (mm)</label><input type="number" className={inputCls} value={dataObj.thickness_mm ?? ''} onChange={e => update('thickness_mm', Number(e.target.value), category, subCategory)} /></div>
        {hasQty && <div><label className={labelCls}>Qty</label><input type="number" className={inputCls} value={dataObj.qty ?? ''} onChange={e => update('qty', Number(e.target.value), category, subCategory)} /></div>}
      </div>
    );
  };

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top} className="flex gap-2">
        <button onClick={() => deleteNode(id)} className="flex h-8 w-8 items-center justify-center rounded-md bg-danger/10 text-danger hover:bg-danger/20 transition-colors shadow-sm">
          <Trash2 size={16} />
        </button>
      </NodeToolbar>
      
      <div dir="auto" className="w-[340px] rounded-lg border border-border bg-card shadow-sm overflow-hidden transition-all hover:border-slate-500/50">
        <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-500 border-2 border-slate-900" />
        
        <div className="bg-slate-500/10 px-3 py-2 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <ArrowDownToLine size={14} className="text-slate-500" />
            <span className="font-semibold text-xs text-foreground">Support Component</span>
          </div>
        </div>
        
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-1 gap-2">
            <div>
              <label className={labelCls}>Support Type</label>
              <select className={inputCls} value={d.supportType || 'SKIRT'} onChange={e => update('supportType', e.target.value)}>
                {orientation === 'VERTICAL' && (
                  <>
                    <option value="SKIRT">Skirt</option>
                    <option value="LEG">Leg</option>
                    <option value="LUG">Lug</option>
                  </>
                )}
                {orientation === 'HORIZONTAL' && (
                  <option value="SADDLE">Saddle</option>
                )}
              </select>
            </div>
          </div>

          {/* SKIRT */}
          {d.supportType === 'SKIRT' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 border border-border p-2 rounded">
                <div className="col-span-2"><label className={labelCls}>Skirt Height (mm)</label><input type="number" className={inputCls} value={skirt.height_mm} onChange={e => update('height_mm', Number(e.target.value), 'skirt')} /></div>
                <div><label className={labelCls}>Top Mat (1m)</label><input type="text" className={inputCls} value={skirt.topMaterial} onChange={e => update('topMaterial', e.target.value, 'skirt')} /></div>
                <div><label className={labelCls}>Bot Mat</label><input type="text" className={inputCls} value={skirt.bottomMaterial} onChange={e => update('bottomMaterial', e.target.value, 'skirt')} /></div>
              </div>

              <div className="grid grid-cols-2 gap-2 border border-border p-2 rounded bg-muted/5">
                <div className="col-span-2"><span className="text-[10px] font-bold text-foreground">Skirt Shell</span></div>
                <div><label className={labelCls}>ID (mm)</label><input type="number" className={inputCls} value={skirt.skirtShell?.innerDiameter_mm ?? ''} onChange={e => update('innerDiameter_mm', Number(e.target.value), 'skirt', 'skirtShell')} /></div>
                <div><label className={labelCls}>Thk (mm)</label><input type="number" className={inputCls} value={skirt.skirtShell?.thickness_mm ?? ''} onChange={e => update('thickness_mm', Number(e.target.value), 'skirt', 'skirtShell')} /></div>
              </div>

              {renderAnnularRingInputs('Base Ring', 'skirt', 'baseRing')}
              {renderRectPlateInputs('Gusset Plates', 'skirt', 'gussetPlate')}
              
              <div className="border border-border p-2 rounded mt-2">
                <div className="flex gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <input type="checkbox" id="topP" checked={skirt.hasTopPlate} onChange={e => { update('hasTopPlate', e.target.checked, 'skirt'); if(e.target.checked) update('hasTopRing', false, 'skirt'); }} />
                    <label htmlFor="topP" className="text-[10px] cursor-pointer">Top Plate</label>
                  </div>
                  <div className="flex items-center gap-1">
                    <input type="checkbox" id="topR" checked={skirt.hasTopRing} onChange={e => { update('hasTopRing', e.target.checked, 'skirt'); if(e.target.checked) update('hasTopPlate', false, 'skirt'); }} />
                    <label htmlFor="topR" className="text-[10px] cursor-pointer">Top Ring</label>
                  </div>
                </div>
                {skirt.hasTopPlate && renderRectPlateInputs('Top Plate', 'skirt', 'topPlate')}
                {skirt.hasTopRing && renderAnnularRingInputs('Top Ring', 'skirt', 'topRing')}
              </div>

              <div className="border border-border p-2 rounded mt-2">
                <div className="flex items-center gap-1 mb-2">
                  <input type="checkbox" id="tpl" checked={skirt.hasTemplatePlate} onChange={e => update('hasTemplatePlate', e.target.checked, 'skirt')} />
                  <label htmlFor="tpl" className="text-[10px] cursor-pointer font-bold">Template / Gauge Plate</label>
                </div>
                {skirt.hasTemplatePlate && renderAnnularRingInputs('Template Plate', 'skirt', 'templatePlate')}
              </div>
            </div>
          )}

          {/* LEG */}
          {d.supportType === 'LEG' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 border border-border p-2 rounded bg-muted/5">
                <div className="col-span-2"><span className="text-[10px] font-bold text-foreground">Leg Column</span></div>
                <div><label className={labelCls}>Type</label><input type="text" className={inputCls} placeholder="e.g. PIPE" value={leg.column.type} onChange={e => update('type', e.target.value, 'leg', 'column')} /></div>
                <div><label className={labelCls}>Qty</label><input type="number" className={inputCls} value={leg.column.qty} onChange={e => update('qty', Number(e.target.value), 'leg', 'column')} /></div>
                <div><label className={labelCls}>Height (mm)</label><input type="number" className={inputCls} value={leg.column.height_mm} onChange={e => update('height_mm', Number(e.target.value), 'leg', 'column')} /></div>
                <div><label className={labelCls}>Weight (kg/m)</label><input type="number" className={inputCls} value={leg.column.linearWeight_kg_m} onChange={e => update('linearWeight_kg_m', Number(e.target.value), 'leg', 'column')} /></div>
              </div>
              {renderRectPlateInputs('Base Plate', 'leg', 'basePlate')}
              {renderRectPlateInputs('Cover Plate', 'leg', 'coverPlate')}
              {renderRectPlateInputs('Reinforce Plate', 'leg', 'reinforcePlate')}
            </div>
          )}

          {/* LUG */}
          {d.supportType === 'LUG' && (
            <div className="space-y-3">
              {renderRectPlateInputs('Base Plate', 'lug', 'basePlate')}
              {renderRectPlateInputs('Gusset Plate', 'lug', 'gussetPlate')}
              {renderRectPlateInputs('Top Plate', 'lug', 'topPlate')}
              {renderRectPlateInputs('Reinforce Plate', 'lug', 'reinforcePlate')}
            </div>
          )}

          {/* SADDLE */}
          {d.supportType === 'SADDLE' && (
            <div className="space-y-3">
              <div className="border border-border p-2 rounded bg-muted/5">
                <label className={labelCls}>Number of Saddles</label>
                <input type="number" className={inputCls} value={saddle.numberOfSaddles} onChange={e => update('numberOfSaddles', Number(e.target.value), 'saddle')} />
              </div>
              {renderRectPlateInputs('Base Plate', 'saddle', 'basePlate')}
              {renderRectPlateInputs('Wear Plate', 'saddle', 'wearPlate')}
              {renderRectPlateInputs('Web Plate', 'saddle', 'webPlate')}
              {renderRectPlateInputs('Rib Plate', 'saddle', 'ribPlate')}
            </div>
          )}
        </div>

        {/* Output metrics */}
        <div className="bg-slate-900/10 border-t border-slate-400/40 px-3 py-2 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-slate-600 uppercase">Total Support Weight</span>
            <span className="text-sm font-bold tabular-nums text-slate-700">
              {(d.totalFabricatedWeight ?? 0).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg
            </span>
          </div>
        </div>

        <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-slate-500 border-2 border-slate-900" />
      </div>
    </>
  );
});

SupportNode.displayName = 'SupportNode';
