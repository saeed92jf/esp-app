'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeToolbar, type NodeProps } from '@xyflow/react';
import { useTranslations } from 'next-intl';
import { Trash2, Layers } from 'lucide-react';
import { useVesselWeightStore } from '../../store/useVesselWeightStore';
import type { InternalsNodeData } from '../../schemas/internals.schema';

const inputCls =
  'w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors';
const labelCls = 'block text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider';

export const InternalsNode = memo(({ id, data, selected }: NodeProps) => {
  const t = useTranslations('VesselWeight');
  const d = data as InternalsNodeData;
  const updateNodeData = useVesselWeightStore((s) => s.updateNodeData);
  const deleteNode = useVesselWeightStore((s) => s.deleteNode);

  const customW = d.customInternalsWeight_kg || 0;

  const patchCustom = (w: number) => {
    updateNodeData(id, { 
      customInternalsWeight_kg: w,
      calculatedWeight: w 
    });
  };

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top} className="flex gap-2">
        <button
          onClick={() => deleteNode(id)}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-danger/10 text-danger hover:bg-danger/20 transition-colors shadow-sm"
        >
          <Trash2 size={16} />
        </button>
      </NodeToolbar>
      
      <div dir="auto" className="w-[280px] rounded-lg border border-border bg-card shadow-sm overflow-hidden transition-all hover:border-pink-500/50">
        <Handle type="target" position={Position.Right} className="w-3 h-3 bg-pink-500 border-2 border-slate-900" />
        
        <div className="bg-pink-500/10 px-3 py-2 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-pink-500" />
            <span className="font-semibold text-xs text-foreground">Internals</span>
          </div>
        </div>
        
        <div className="p-3 space-y-4">
          <div className="bg-muted/20 p-3 rounded border border-border">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Custom Input (Trays, Packing)</h4>
            <div>
              <label className={labelCls}>Total Internals Weight (kg)</label>
              <input type="number" className={inputCls} value={customW || ''} onChange={e => patchCustom(Number(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Weight output */}
        <div className="bg-pink-950/20 border-t border-pink-800/40 px-3 py-2 flex items-center justify-between">
          <span className="text-[10px] font-medium text-pink-600/70 uppercase">Internal Weight</span>
          <span className="text-sm font-bold tabular-nums text-pink-500">
            {(d.calculatedWeight ?? 0).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg
          </span>
        </div>
      </div>
    </>
  );
});

InternalsNode.displayName = 'InternalsNode';
