'use client';

import React, { memo, useState } from 'react';
import { Handle, Position, NodeToolbar, type NodeProps } from '@xyflow/react';
import { useTranslations } from 'next-intl';
import { Trash2, Paperclip, ChevronDown, ChevronUp, Plus, Settings } from 'lucide-react';
import { useVesselWeightStore } from '../../store/useVesselWeightStore';
import type { 
  AttachmentsNodeData, 
  AttachmentItem,
  NamePlateData,
  LiftingLugData,
  TurningLugData,
  InsulationSupportData,
  AttachmentType
} from '../../schemas/attachments.schema';
import { calcAttachmentWeight } from '../../calculations/attachments.calc';

const inputCls = 'w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors';
const labelCls = 'block text-[9px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider truncate';

function createNewAttachment(type: AttachmentType, idStr: string): AttachmentItem {
  const base = { id: idStr, tag: `ATT-${idStr}`, material: 'CS_A516_70' };
  
  if (type === 'NAME_PLATE') {
    return { ...base, type, width_mm: 200, length_mm: 300, thickness_mm: 3, bracketThickness_mm: 5, qty: 1 } as NamePlateData;
  }
  if (type === 'LIFTING_LUG') {
    return { ...base, type, qty: 2, mainPlate: { width_mm: 250, length_mm: 400, thickness_mm: 25 }, hasRepad: true, repad: { width_mm: 350, length_mm: 500, thickness_mm: 15 } } as LiftingLugData;
  }
  if (type === 'TURNING_LUG') {
    return { ...base, type, qty: 1, mainPlate: { width_mm: 300, length_mm: 500, thickness_mm: 30 }, hasRepad: true, repad: { width_mm: 400, length_mm: 600, thickness_mm: 20 } } as TurningLugData;
  }
  if (type === 'INSULATION_SUPPORT') {
    return { ...base, type, qtyOfRings: 4, vesselOuterDiameter_mm: 1000, ringWidth_mm: 50, ringThickness_mm: 6 } as InsulationSupportData;
  }
  return base as any;
}

export const AttachmentsNode = memo(({ id, data, selected }: NodeProps) => {
  const t = useTranslations('VesselWeight');
  const d = data as AttachmentsNodeData;
  const updateNodeData = useVesselWeightStore((s) => s.updateNodeData);
  const deleteNode = useVesselWeightStore((s) => s.deleteNode);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const attachments = d.attachments || [];

  const recalculate = (newAtts: AttachmentItem[]) => {
    let total = 0;
    const computedAtts = newAtts.map(att => {
      const w = calcAttachmentWeight(att);
      total += w;
      return { ...att, _weight: w };
    });
    updateNodeData(id, { attachments: computedAtts, totalFabricatedWeight: total } as any);
  };

  const updateAtt = (index: number, field: string, value: any, subObj?: string) => {
    const newAtts = [...attachments];
    if (subObj) {
      newAtts[index] = { ...newAtts[index], [subObj]: { ...(newAtts[index] as any)[subObj], [field]: value } };
    } else {
      newAtts[index] = { ...newAtts[index], [field]: value };
    }
    recalculate(newAtts);
  };

  const addAttachment = (type: AttachmentType) => {
    const newAtt = createNewAttachment(type, Date.now().toString().slice(-6));
    recalculate([...attachments, newAtt]);
    setExpandedId(newAtt.id);
  };

  const removeAtt = (index: number) => {
    const newAtts = [...attachments];
    newAtts.splice(index, 1);
    recalculate(newAtts);
  };

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top} className="flex gap-2">
        <button onClick={() => deleteNode(id)} className="flex h-8 w-8 items-center justify-center rounded-md bg-danger/10 text-danger hover:bg-danger/20 transition-colors shadow-sm">
          <Trash2 size={16} />
        </button>
      </NodeToolbar>
      
      <div dir="auto" className="w-[360px] min-h-[200px] flex flex-col rounded-lg border border-border bg-card shadow-sm overflow-hidden transition-all hover:border-purple-500/50">
        <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500 border-2 border-slate-900" />
        
        <div className="bg-purple-500/10 px-3 py-2 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <Paperclip size={14} className="text-purple-500" />
            <span className="font-semibold text-xs text-foreground">Attachments ({attachments.length})</span>
          </div>
          <div className="flex gap-1 relative">
            <button 
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="flex items-center gap-1 bg-background border border-border hover:bg-muted text-[9px] font-semibold px-2 py-1 rounded transition-colors"
            >
              <Plus size={10} /> Add...
            </button>
            {isAddMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsAddMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 flex flex-col bg-popover border border-border rounded-md shadow-lg z-50 overflow-hidden min-w-[140px]">
                  <button onClick={() => { addAttachment('NAME_PLATE'); setIsAddMenuOpen(false); }} className="text-[11px] text-left px-3 py-2.5 hover:bg-muted font-medium border-b border-border/50">Name Plate</button>
                  <button onClick={() => { addAttachment('LIFTING_LUG'); setIsAddMenuOpen(false); }} className="text-[11px] text-left px-3 py-2.5 hover:bg-muted font-medium border-b border-border/50">Lifting Lug</button>
                  <button onClick={() => { addAttachment('TURNING_LUG'); setIsAddMenuOpen(false); }} className="text-[11px] text-left px-3 py-2.5 hover:bg-muted font-medium border-b border-border/50">Turning Lug</button>
                  <button onClick={() => { addAttachment('INSULATION_SUPPORT'); setIsAddMenuOpen(false); }} className="text-[11px] text-left px-3 py-2.5 hover:bg-muted font-medium">Insulation Support</button>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="flex-1 p-3 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
          {attachments.map((att, idx) => {
            const isExpanded = expandedId === att.id;
            const weight = (att as any)._weight || calcAttachmentWeight(att);
            
            return (
              <div key={att.id} className="rounded-lg border border-border bg-muted/10 overflow-hidden relative">
                <div className="p-2 bg-muted/30 flex items-center justify-between cursor-pointer hover:bg-muted/50" onClick={() => setExpandedId(isExpanded ? null : att.id)}>
                  <div className="flex items-center gap-2">
                    <Settings size={12} className="text-purple-500" />
                    <span className="text-[10px] font-bold text-foreground">{att.type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-muted-foreground">{weight.toFixed(1)} kg</span>
                    <button onClick={(e) => { e.stopPropagation(); removeAtt(idx); }} className="text-red-500 hover:text-red-600 p-1"><Trash2 size={12} /></button>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-2 space-y-3 bg-card border-t border-border">
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={labelCls}>Tag / ID</label><input type="text" className={inputCls} value={att.tag || ''} onChange={e => updateAtt(idx, 'tag', e.target.value)} /></div>
                      <div><label className={labelCls}>Material</label><input type="text" className={inputCls} value={att.material} onChange={e => updateAtt(idx, 'material', e.target.value)} /></div>
                    </div>

                    {att.type === 'NAME_PLATE' && (() => {
                      const np = att as NamePlateData;
                      return (
                        <div className="grid grid-cols-2 gap-2 border border-border p-2 rounded bg-muted/5">
                          <div className="col-span-2"><span className="text-[10px] font-bold text-foreground">Name Plate Dimensions</span></div>
                          <div><label className={labelCls}>Width (mm)</label><input type="number" className={inputCls} value={np.width_mm} onChange={e => updateAtt(idx, 'width_mm', Number(e.target.value))} /></div>
                          <div><label className={labelCls}>Length (mm)</label><input type="number" className={inputCls} value={np.length_mm} onChange={e => updateAtt(idx, 'length_mm', Number(e.target.value))} /></div>
                          <div><label className={labelCls}>Plate Thk (mm)</label><input type="number" className={inputCls} value={np.thickness_mm} onChange={e => updateAtt(idx, 'thickness_mm', Number(e.target.value))} /></div>
                          <div><label className={labelCls}>Bracket Thk (mm)</label><input type="number" className={inputCls} value={np.bracketThickness_mm} onChange={e => updateAtt(idx, 'bracketThickness_mm', Number(e.target.value))} /></div>
                          <div className="col-span-2"><label className={labelCls}>Qty</label><input type="number" className={inputCls} value={np.qty} onChange={e => updateAtt(idx, 'qty', Number(e.target.value))} /></div>
                        </div>
                      )
                    })()}

                    {(att.type === 'LIFTING_LUG' || att.type === 'TURNING_LUG') && (() => {
                      const lug = att as (LiftingLugData | TurningLugData);
                      return (
                        <>
                          <div className="grid grid-cols-3 gap-2 border border-border p-2 rounded bg-muted/5">
                            <div className="col-span-3 flex justify-between">
                              <span className="text-[10px] font-bold text-foreground">Main Plate</span>
                              <div className="flex gap-2"><label className={labelCls}>Total Qty:</label><input type="number" className={inputCls + " w-16 !py-0"} value={lug.qty} onChange={e => updateAtt(idx, 'qty', Number(e.target.value))} /></div>
                            </div>
                            <div><label className={labelCls}>W (mm)</label><input type="number" className={inputCls} value={lug.mainPlate.width_mm} onChange={e => updateAtt(idx, 'width_mm', Number(e.target.value), 'mainPlate')} /></div>
                            <div><label className={labelCls}>L (mm)</label><input type="number" className={inputCls} value={lug.mainPlate.length_mm} onChange={e => updateAtt(idx, 'length_mm', Number(e.target.value), 'mainPlate')} /></div>
                            <div><label className={labelCls}>Thk (mm)</label><input type="number" className={inputCls} value={lug.mainPlate.thickness_mm} onChange={e => updateAtt(idx, 'thickness_mm', Number(e.target.value), 'mainPlate')} /></div>
                          </div>
                          
                          <div className="border border-border p-2 rounded bg-muted/5">
                            <div className="flex items-center gap-2 mb-2">
                              <input type="checkbox" id={`repad-${att.id}`} checked={lug.hasRepad} onChange={e => updateAtt(idx, 'hasRepad', e.target.checked)} />
                              <label htmlFor={`repad-${att.id}`} className="text-[10px] cursor-pointer font-bold">Include Repad</label>
                            </div>
                            {lug.hasRepad && lug.repad && (
                              <div className="grid grid-cols-3 gap-2">
                                <div><label className={labelCls}>W (mm)</label><input type="number" className={inputCls} value={lug.repad.width_mm} onChange={e => updateAtt(idx, 'width_mm', Number(e.target.value), 'repad')} /></div>
                                <div><label className={labelCls}>L (mm)</label><input type="number" className={inputCls} value={lug.repad.length_mm} onChange={e => updateAtt(idx, 'length_mm', Number(e.target.value), 'repad')} /></div>
                                <div><label className={labelCls}>Thk (mm)</label><input type="number" className={inputCls} value={lug.repad.thickness_mm} onChange={e => updateAtt(idx, 'thickness_mm', Number(e.target.value), 'repad')} /></div>
                              </div>
                            )}
                          </div>
                        </>
                      )
                    })()}

                    {att.type === 'INSULATION_SUPPORT' && (() => {
                      const ins = att as InsulationSupportData;
                      return (
                        <div className="grid grid-cols-2 gap-2 border border-border p-2 rounded bg-muted/5">
                          <div className="col-span-2"><span className="text-[10px] font-bold text-foreground">Insulation Rings</span></div>
                          <div className="col-span-2"><label className={labelCls}>Vessel Outer Dia. (mm)</label><input type="number" className={inputCls} value={ins.vesselOuterDiameter_mm} onChange={e => updateAtt(idx, 'vesselOuterDiameter_mm', Number(e.target.value))} /></div>
                          <div><label className={labelCls}>Ring Width (mm)</label><input type="number" className={inputCls} value={ins.ringWidth_mm} onChange={e => updateAtt(idx, 'ringWidth_mm', Number(e.target.value))} /></div>
                          <div><label className={labelCls}>Ring Thk (mm)</label><input type="number" className={inputCls} value={ins.ringThickness_mm} onChange={e => updateAtt(idx, 'ringThickness_mm', Number(e.target.value))} /></div>
                          <div className="col-span-2"><label className={labelCls}>Total Number of Rings</label><input type="number" className={inputCls} value={ins.qtyOfRings} onChange={e => updateAtt(idx, 'qtyOfRings', Number(e.target.value))} /></div>
                        </div>
                      )
                    })()}

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Output metrics */}
        <div className="bg-purple-900/10 border-t border-purple-400/40 px-3 py-2 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-purple-600 uppercase">Total Attachments</span>
            <span className="text-sm font-bold tabular-nums text-purple-700">
              {(d.totalFabricatedWeight ?? 0).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg
            </span>
          </div>
        </div>

        <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-500 border-2 border-slate-900" />
      </div>
    </>
  );
});

AttachmentsNode.displayName = 'AttachmentsNode';
