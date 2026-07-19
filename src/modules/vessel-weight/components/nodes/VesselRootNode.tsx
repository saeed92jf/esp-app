'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeToolbar, type NodeProps } from '@xyflow/react';
import { useTranslations } from 'next-intl';
import { Trash2, Database } from 'lucide-react';
import { useVesselWeightStore } from '../../store/useVesselWeightStore';
import type { VesselRootNodeData, VesselOrientation } from '../../schemas/vessel.schema';

const inputCls =
  'w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors';
const labelCls = 'block text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider';

export const VesselRootNode = memo(({ id, data, selected }: NodeProps) => {
  const t = useTranslations('VesselWeight');
  const d = data as VesselRootNodeData;
  const updateNodeData = useVesselWeightStore((s) => s.updateNodeData);
  const deleteNode = useVesselWeightStore((s) => s.deleteNode);

  const vessel = d.vessel || {
    vesselTag: 'V-001',
    orientation: 'VERTICAL',
    unitSystem: 'SI',
    defaultMaterial: 'CS_A516_70' as const,
    processFluidDensity_kg_m3: 1000,
    testFluidDensity_kg_m3: 1000,
    defaultDiameter_mm: 1000,
    defaultLength_mm: 2000,
  };

  const patchVessel = (p: Partial<typeof vessel>) => {
    updateNodeData(id, { vessel: { ...vessel, ...p } });
  };

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top} className="flex gap-2">
        <button
          onClick={() => deleteNode(id)}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-danger/10 text-danger hover:bg-danger/20 transition-colors shadow-sm"
          title="Delete Node"
        >
          <Trash2 size={16} />
        </button>
      </NodeToolbar>
      
      <div dir="auto" className="w-[320px] rounded-xl border-2 border-primary bg-card shadow-lg overflow-hidden custom-scrollbar">
        <div className="bg-primary/10 px-4 py-3 flex items-center gap-3 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Database size={18} />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">Vessel Root Hub</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Global Configuration</p>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tag Number</label>
              <input type="text" className={inputCls} value={vessel.vesselTag} onChange={e => patchVessel({vesselTag: e.target.value})} placeholder="e.g. V-101" />
            </div>
            <div>
              <label className={labelCls}>Orientation</label>
              <select className={inputCls} value={vessel.orientation} onChange={e => patchVessel({orientation: e.target.value as VesselOrientation})}>
                <option value="VERTICAL">Vertical</option>
                <option value="HORIZONTAL">Horizontal</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className={labelCls}>Default Material</label>
            <select className={inputCls} value={vessel.defaultMaterial} onChange={e => patchVessel({defaultMaterial: e.target.value as any})}>
              <option value="CS_A516_70">Carbon Steel (A516 Gr.70)</option>
              <option value="SS_304">Stainless Steel 304</option>
              <option value="SS_316L">Stainless Steel 316L</option>
              <option value="DUPLEX_2205">Duplex 2205</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-border mt-3">
            <div>
              <label className={labelCls}>Global Dia. (mm)</label>
              <input type="number" className={inputCls} value={vessel.defaultDiameter_mm || ''} onChange={e => patchVessel({defaultDiameter_mm: Number(e.target.value)})} placeholder="e.g. 2000" />
            </div>
            <div>
              <label className={labelCls}>Global Length (mm)</label>
              <input type="number" className={inputCls} value={vessel.defaultLength_mm || ''} onChange={e => patchVessel({defaultLength_mm: Number(e.target.value)})} placeholder="e.g. 6000" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-border mt-3">
            <div>
              <label className={labelCls} title="Plate dimension for rolling (Circumference)">Raw Plate L (mm)</label>
              <input type="number" className={inputCls} value={vessel.defaultRawPlateLength_mm || ''} onChange={e => patchVessel({defaultRawPlateLength_mm: Number(e.target.value)})} placeholder="e.g. 6000" />
            </div>
            <div>
              <label className={labelCls} title="Plate dimension for shell length">Raw Plate W (mm)</label>
              <input type="number" className={inputCls} value={vessel.defaultRawPlateWidth_mm || ''} onChange={e => patchVessel({defaultRawPlateWidth_mm: Number(e.target.value)})} placeholder="e.g. 2000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className={labelCls}>Op. Fluid Density</label>
              <div className="relative">
                <input type="number" className={inputCls} value={vessel.processFluidDensity_kg_m3} onChange={e => patchVessel({processFluidDensity_kg_m3: Number(e.target.value)})} />
                <span className="absolute right-2 top-2 text-[9px] text-muted-foreground">kg/m³</span>
              </div>
            </div>
            <div>
              <label className={labelCls}>Test Fluid Density</label>
              <div className="relative">
                <input type="number" className={inputCls} value={vessel.testFluidDensity_kg_m3} onChange={e => patchVessel({testFluidDensity_kg_m3: Number(e.target.value)})} />
                <span className="absolute right-2 top-2 text-[9px] text-muted-foreground">kg/m³</span>
              </div>
            </div>
          </div>
        </div>

        <Handle type="source" position={Position.Bottom} className="w-4 h-4 bg-primary border-2 border-slate-900" />
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
      `}} />
    </>
  );
});

VesselRootNode.displayName = 'VesselRootNode';
