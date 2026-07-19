'use client';

import React, { memo, useState } from 'react';
import { Handle, Position, NodeToolbar, type NodeProps } from '@xyflow/react';
import { useTranslations } from 'next-intl';
import { Trash2, Layers, Plus, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { useVesselWeightStore } from '../../store/useVesselWeightStore';
import type { 
  MistEliminatorNodeData, 
  MistEliminatorItem,
  DemisterData,
} from '../../schemas/mistEliminator.schema';
import { calcDemisterWeight } from '../../calculations/mistEliminator.calc';

const inputCls = 'w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors';
const labelCls = 'block text-[9px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider truncate';

function createNewDemister(idStr: string): DemisterData {
  return {
    id: idStr,
    type: 'DEMISTER',
    tag: `ME-${idStr}`,
    shape: 'CIRCLE',
    diameter_mm: 1500,
    width_mm: 1500,
    length_mm: 1500,
    padThickness_mm: 150,
    maxSegmentWidth_mm: 400,
    remainderHandling: 'ENDS',
    material: 'SS_304',
    yorkStyle: 'York_431',
    customDensity_kg_m3: 144,
    hasFrame: true,
    frameSides: '2',
    edgeGap_mm: 15,
    barWidth_mm: 25,
    barThickness_mm: 3,
    rodSpacing_mm: 150,
    horizontalRodDia_mm: 6,
    verticalRodDia_mm: 6,
    needsSupportBeams: false,
    supportBeams: [{ profileName: 'I-Beam 100x50', qty: 2, length_mm: 1500, linearWeight_kg_m: 10 }],
  };
}

function DemisterDrawing({ data, metrics }: { data: DemisterData, metrics: any }) {
  const D = data.shape === 'CIRCLE' || data.shape === 'CIRCLE_SEGMENT' ? data.diameter_mm - 2 * data.edgeGap_mm : data.width_mm;
  const L = data.shape === 'RECTANGLE' ? data.length_mm : D;
  const R = D / 2;

  // ViewBox will be slightly larger than D to show edges
  const vb = D + 100;
  const c = vb / 2;

  return (
    <svg viewBox={`0 0 ${vb} ${vb}`} className="w-full aspect-square bg-white rounded-md border border-border shadow-inner">
      <defs>
        <pattern id={`meshPattern-${data.id}`} width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0h20v20H0z" fill="transparent" />
          <path d="M0,10 L20,10 M10,0 L10,20" stroke="#ccc" strokeWidth="1" />
        </pattern>
      </defs>
      
      {/* Base shape / Mesh Pad */}
      {data.shape === 'RECTANGLE' ? (
        <rect x={c - D/2} y={c - L/2} width={D} height={L} fill={`url(#meshPattern-${data.id})`} stroke="#475569" strokeWidth={3} />
      ) : (
        <circle cx={c} cy={c} r={R} fill={`url(#meshPattern-${data.id})`} stroke="#475569" strokeWidth={4} />
      )}

      {/* Frame / Segments (Red Lines) */}
      {metrics.segments?.map((seg: any, i: number) => {
        const x = c + seg.xStart;
        if (data.shape === 'RECTANGLE') {
          return <line key={`seg-${i}`} x1={x} y1={c - L/2} x2={x} y2={c + L/2} stroke="#ef4444" strokeWidth={Math.max(4, data.barThickness_mm * 2)} />;
        } else {
          // Circle chord length at xStart
          const chord = 2 * Math.sqrt(Math.max(0, R*R - Math.pow(seg.xStart, 2)));
          if (chord > 0) {
            return <line key={`seg-${i}`} x1={x} y1={c - chord/2} x2={x} y2={c + chord/2} stroke="#ef4444" strokeWidth={Math.max(4, data.barThickness_mm * 2)} />;
          }
        }
        return null;
      })}
      
      {/* Draw the final right edge for segments */}
      {(() => {
        if (!metrics.segments?.length) return null;
        const lastSeg = metrics.segments[metrics.segments.length - 1];
        const x = c + lastSeg.xEnd;
        if (data.shape === 'RECTANGLE') {
          return <line x1={x} y1={c - L/2} x2={x} y2={c + L/2} stroke="#ef4444" strokeWidth={Math.max(4, data.barThickness_mm * 2)} />;
        } else {
          const chord = 2 * Math.sqrt(Math.max(0, R*R - Math.pow(lastSeg.xEnd, 2)));
          if (chord > 0) {
            return <line x1={x} y1={c - chord/2} x2={x} y2={c + chord/2} stroke="#ef4444" strokeWidth={Math.max(4, data.barThickness_mm * 2)} />;
          }
        }
      })()}

      {/* Draw horizontal rods for visual representation (Blue Dashed) */}
      {data.hasFrame && (
        <g stroke="#3b82f6" strokeWidth={Math.max(3, data.horizontalRodDia_mm)} opacity={0.6} strokeDasharray="15,10">
          {Array.from({ length: Math.min(10, Math.floor((data.shape === 'RECTANGLE' ? L : D) / data.rodSpacing_mm)) }).map((_, i) => {
            const y = c - (data.shape === 'RECTANGLE' ? L/2 : R) + (i + 1) * data.rodSpacing_mm;
            if (data.shape === 'RECTANGLE') {
              return <line key={`rod-${i}`} x1={c - D/2} y1={y} x2={c + D/2} y2={y} />;
            } else {
              const dx = Math.sqrt(Math.max(0, R*R - Math.pow(y - c, 2)));
              if (dx > 0) return <line key={`rod-${i}`} x1={c - dx} y1={y} x2={c + dx} y2={y} />;
            }
            return null;
          })}
        </g>
      )}
    </svg>
  );
}

export const MistEliminatorNode = memo(({ id, data, selected }: NodeProps) => {
  const t = useTranslations('VesselWeight');
  const d = data as MistEliminatorNodeData;
  const updateNodeData = useVesselWeightStore((s) => s.updateNodeData);
  const deleteNode = useVesselWeightStore((s) => s.deleteNode);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const equipments = d.equipments || [];

  const recalculate = (newEqs: MistEliminatorItem[]) => {
    let total = 0;
    const computedEqs = newEqs.map(eq => {
      if (eq.type === 'DEMISTER') {
        const res = calcDemisterWeight(eq as DemisterData);
        total += res.totalWeight;
        return { ...eq, _weightData: res };
      }
      return eq;
    });
    updateNodeData(id, { equipments: computedEqs, totalFabricatedWeight: total } as any);
  };

  const updateEq = (index: number, field: string, value: any, subObj?: string, subIndex?: number) => {
    const newEqs = [...equipments];
    if (subObj && subIndex !== undefined) {
      const arr = [...(newEqs[index] as any)[subObj]];
      arr[subIndex] = { ...arr[subIndex], [field]: value };
      newEqs[index] = { ...newEqs[index], [subObj]: arr };
    } else if (subObj) {
      newEqs[index] = { ...newEqs[index], [subObj]: { ...(newEqs[index] as any)[subObj], [field]: value } };
    } else {
      newEqs[index] = { ...newEqs[index], [field]: value };
    }
    recalculate(newEqs);
  };

  const addDemister = () => {
    const newEq = createNewDemister(Date.now().toString().slice(-6));
    recalculate([...equipments, newEq]);
    setExpandedId(newEq.id);
  };

  const removeEq = (index: number) => {
    const newEqs = [...equipments];
    newEqs.splice(index, 1);
    recalculate(newEqs);
  };

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top} className="flex gap-2">
        <button onClick={() => deleteNode(id)} className="flex h-8 w-8 items-center justify-center rounded-md bg-danger/10 text-danger hover:bg-danger/20 transition-colors shadow-sm">
          <Trash2 size={16} />
        </button>
      </NodeToolbar>
      
      <div dir="auto" className="w-[450px] min-h-[200px] flex flex-col rounded-lg border border-border bg-card shadow-sm overflow-hidden transition-all hover:border-pink-500/50">
        <Handle type="target" position={Position.Top} className="w-3 h-3 bg-pink-500 border-2 border-slate-900" />
        
        <div className="bg-pink-500/10 px-3 py-2 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-pink-500" />
            <span className="font-semibold text-xs text-foreground">Mist Eliminator ({equipments.length})</span>
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
                  <button onClick={() => { addDemister(); setIsAddMenuOpen(false); }} className="text-[11px] text-left px-3 py-2.5 hover:bg-muted font-medium border-b border-border/50">Demister</button>
                  <button className="text-[11px] text-left px-3 py-2.5 text-muted-foreground cursor-not-allowed font-medium border-b border-border/50">Vane Pack (Soon)</button>
                  <button className="text-[11px] text-left px-3 py-2.5 text-muted-foreground cursor-not-allowed font-medium">Cyclone (Soon)</button>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="flex-1 p-3 space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
          {equipments.map((eq, idx) => {
            const isExpanded = expandedId === eq.id;
            const wData = (eq as any)._weightData || calcDemisterWeight(eq as DemisterData);
            
            return (
              <div key={eq.id} className="rounded-lg border border-border bg-muted/5 overflow-hidden relative">
                <div className="p-2 bg-muted/20 flex items-center justify-between cursor-pointer hover:bg-muted/40" onClick={() => setExpandedId(isExpanded ? null : eq.id)}>
                  <div className="flex items-center gap-2">
                    <Settings size={12} className="text-pink-500" />
                    <span className="text-[10px] font-bold text-foreground">{eq.type} ({eq.tag})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-muted-foreground">{wData.totalWeight.toFixed(1)} kg</span>
                    <button onClick={(e) => { e.stopPropagation(); removeEq(idx); }} className="text-red-500 hover:text-red-600 p-1"><Trash2 size={12} /></button>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>

                {isExpanded && eq.type === 'DEMISTER' && (() => {
                  const dem = eq as DemisterData;
                  return (
                    <div className="p-2 space-y-3 bg-card border-t border-border">
                      <div className="grid grid-cols-3 gap-2">
                        <div><label className={labelCls}>Tag</label><input type="text" className={inputCls} value={dem.tag} onChange={e => updateEq(idx, 'tag', e.target.value)} /></div>
                        <div>
                          <label className={labelCls}>Shape</label>
                          <select className={inputCls} value={dem.shape} onChange={e => updateEq(idx, 'shape', e.target.value)}>
                            <option value="CIRCLE">Circle</option>
                            <option value="CIRCLE_SEGMENT">Circle Segment</option>
                            <option value="RECTANGLE">Rectangle</option>
                          </select>
                        </div>
                        <div><label className={labelCls}>Material</label><input type="text" className={inputCls} value={dem.material} onChange={e => updateEq(idx, 'material', e.target.value)} /></div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 border border-border p-2 rounded bg-muted/5">
                        <div className="col-span-4"><span className="text-[10px] font-bold text-foreground">Pad Geometry</span></div>
                        {dem.shape !== 'RECTANGLE' && (
                          <div className="col-span-2"><label className={labelCls}>Diameter (mm)</label><input type="number" className={inputCls} value={dem.diameter_mm} onChange={e => updateEq(idx, 'diameter_mm', Number(e.target.value))} /></div>
                        )}
                        {dem.shape === 'RECTANGLE' && (
                          <>
                            <div className="col-span-2"><label className={labelCls}>Width (mm)</label><input type="number" className={inputCls} value={dem.width_mm} onChange={e => updateEq(idx, 'width_mm', Number(e.target.value))} /></div>
                            <div className="col-span-2"><label className={labelCls}>Length (mm)</label><input type="number" className={inputCls} value={dem.length_mm} onChange={e => updateEq(idx, 'length_mm', Number(e.target.value))} /></div>
                          </>
                        )}
                        <div className="col-span-2"><label className={labelCls}>Pad Thk (mm)</label><input type="number" className={inputCls} value={dem.padThickness_mm} onChange={e => updateEq(idx, 'padThickness_mm', Number(e.target.value))} /></div>
                        
                        <div className="col-span-2"><label className={labelCls}>Max Segment Width (mm)</label><input type="number" className={inputCls} value={dem.maxSegmentWidth_mm} onChange={e => updateEq(idx, 'maxSegmentWidth_mm', Number(e.target.value))} /></div>
                        <div className="col-span-2">
                          <label className={labelCls}>Segment Remainder</label>
                          <select className={inputCls} value={dem.remainderHandling} onChange={e => updateEq(idx, 'remainderHandling', e.target.value)}>
                            <option value="ENDS">Symmetric Ends</option>
                            <option value="MIDDLE">Symmetric Middle</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 border border-border p-2 rounded bg-muted/5">
                        <div className="col-span-3"><span className="text-[10px] font-bold text-foreground">Mesh & Grid</span></div>
                        <div>
                          <label className={labelCls}>York Style</label>
                          <select className={inputCls} value={dem.yorkStyle} onChange={e => updateEq(idx, 'yorkStyle', e.target.value)}>
                            <option value="York_431">York 431</option>
                            <option value="York_421">York 421</option>
                            <option value="York_432">York 432</option>
                            <option value="Custom">Custom Density</option>
                          </select>
                        </div>
                        {dem.yorkStyle === 'Custom' && (
                          <div className="col-span-2"><label className={labelCls}>Density (kg/m³)</label><input type="number" className={inputCls} value={dem.customDensity_kg_m3} onChange={e => updateEq(idx, 'customDensity_kg_m3', Number(e.target.value))} /></div>
                        )}
                        
                        <div className="col-span-3 flex items-center gap-2 mt-2">
                          <input type="checkbox" id={`frame-${eq.id}`} checked={dem.hasFrame} onChange={e => updateEq(idx, 'hasFrame', e.target.checked)} />
                          <label htmlFor={`frame-${eq.id}`} className="text-[10px] font-bold">Has Grid Frame?</label>
                        </div>

                        {dem.hasFrame && (
                          <>
                            <div>
                              <label className={labelCls}>Sides</label>
                              <select className={inputCls} value={dem.frameSides} onChange={e => updateEq(idx, 'frameSides', e.target.value)}>
                                <option value="1">1 Side (Bottom)</option>
                                <option value="2">2 Sides (Top & Bottom)</option>
                              </select>
                            </div>
                            <div><label className={labelCls}>Edge Gap (mm)</label><input type="number" className={inputCls} value={dem.edgeGap_mm} onChange={e => updateEq(idx, 'edgeGap_mm', Number(e.target.value))} /></div>
                            <div><label className={labelCls}>Bar (W x Thk)</label><div className="flex items-center gap-1"><input type="number" className={inputCls} value={dem.barWidth_mm} onChange={e => updateEq(idx, 'barWidth_mm', Number(e.target.value))} /> x <input type="number" className={inputCls} value={dem.barThickness_mm} onChange={e => updateEq(idx, 'barThickness_mm', Number(e.target.value))} /></div></div>
                            <div><label className={labelCls}>H-Rod Spacing (mm)</label><input type="number" className={inputCls} value={dem.rodSpacing_mm} onChange={e => updateEq(idx, 'rodSpacing_mm', Number(e.target.value))} /></div>
                            <div><label className={labelCls}>H-Rod Dia (mm)</label><input type="number" className={inputCls} value={dem.horizontalRodDia_mm} onChange={e => updateEq(idx, 'horizontalRodDia_mm', Number(e.target.value))} /></div>
                            <div><label className={labelCls}>V-Rod Dia (mm)</label><input type="number" className={inputCls} value={dem.verticalRodDia_mm} onChange={e => updateEq(idx, 'verticalRodDia_mm', Number(e.target.value))} /></div>
                          </>
                        )}
                      </div>

                      <div className="border border-border p-2 rounded bg-muted/5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id={`beam-${eq.id}`} checked={dem.needsSupportBeams} onChange={e => updateEq(idx, 'needsSupportBeams', e.target.checked)} />
                            <label htmlFor={`beam-${eq.id}`} className="text-[10px] font-bold">Needs Support Beams</label>
                          </div>
                          {dem.needsSupportBeams && (
                            <button onClick={() => updateEq(idx, 'supportBeams', [...dem.supportBeams, { profileName: 'I-Beam', qty: 1, length_mm: 1000, linearWeight_kg_m: 10 }])} className="text-[9px] bg-background border px-1.5 py-0.5 rounded">Add Beam</button>
                          )}
                        </div>
                        {dem.needsSupportBeams && dem.supportBeams.map((b, bIdx) => (
                          <div key={bIdx} className="grid grid-cols-4 gap-2 mb-2 pb-2 border-b border-border/50 last:border-0 last:pb-0 last:mb-0">
                            <div><label className={labelCls}>Profile</label><input type="text" className={inputCls} value={b.profileName} onChange={e => updateEq(idx, 'profileName', e.target.value, 'supportBeams', bIdx)} /></div>
                            <div><label className={labelCls}>Qty</label><input type="number" className={inputCls} value={b.qty} onChange={e => updateEq(idx, 'qty', Number(e.target.value), 'supportBeams', bIdx)} /></div>
                            <div><label className={labelCls}>L (mm)</label><input type="number" className={inputCls} value={b.length_mm} onChange={e => updateEq(idx, 'length_mm', Number(e.target.value), 'supportBeams', bIdx)} /></div>
                            <div>
                              <div className="flex justify-between items-end gap-1">
                                <div className="flex-1"><label className={labelCls}>Wt (kg/m)</label><input type="number" className={inputCls} value={b.linearWeight_kg_m} onChange={e => updateEq(idx, 'linearWeight_kg_m', Number(e.target.value), 'supportBeams', bIdx)} /></div>
                                <button onClick={() => { const arr = [...dem.supportBeams]; arr.splice(bIdx,1); updateEq(idx, 'supportBeams', arr); }} className="text-red-500 hover:text-red-600 mb-1"><Trash2 size={12} /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Output Data & Drawing */}
                      <div className="grid grid-cols-5 gap-2">
                        <div className="col-span-3 bg-pink-900/10 border border-pink-400/40 p-2 rounded text-[10px] flex flex-col justify-between">
                          <div>
                            <div className="font-bold text-pink-700 mb-1 border-b border-pink-400/30 pb-1 flex justify-between">
                              <span>Fabrication Details</span>
                              <span>Segments: {wData.metrics.segments?.length || 0}</span>
                            </div>
                            
                            {wData.metrics.segments && wData.metrics.segments.length > 0 && (
                              <div className="text-[9px] text-muted-foreground mb-2 break-all">
                                <strong>Widths:</strong> {wData.metrics.segments.map((s:any) => s.width.toFixed(0)).join(' / ')} mm
                              </div>
                            )}

                            <div className="space-y-0.5 mb-2">
                              <div className="flex justify-between text-muted-foreground">
                                <span>Flat Bars ({dem.barWidth_mm}x{dem.barThickness_mm}):</span>
                                <span className="font-semibold text-foreground">{(wData.metrics.totalBarLength / 1000).toFixed(1)} m ({wData.metrics.barBranches_6m} شاخه ۶ متری)</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <span>H-Rods (Ø{dem.horizontalRodDia_mm}):</span>
                                <span className="font-semibold text-foreground">{(wData.metrics.totalHorizRodLength / 1000).toFixed(1)} m ({wData.metrics.horizRodBranches_6m} شاخه ۶ متری)</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <span>V-Rods (Ø{dem.verticalRodDia_mm}):</span>
                                <span className="font-semibold text-foreground">{(wData.metrics.totalVertRodsLength / 1000).toFixed(1)} m ({wData.metrics.vertRodBranches_6m} شاخه ۶ متری)</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <span>V-Rods Qty:</span>
                                <span className="font-semibold text-foreground">{wData.metrics.totalVertRods} pcs</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="font-bold text-pink-700 mb-1 border-b border-pink-400/30 pb-1">Weight Summary</div>
                            <div className="flex justify-between text-muted-foreground"><span>Mesh Pad:</span> <span className="tabular-nums font-semibold">{wData.meshWeight.toFixed(1)} kg</span></div>
                            <div className="flex justify-between text-muted-foreground"><span>Grid & Frame:</span> <span className="tabular-nums font-semibold">{wData.gridWeight.toFixed(1)} kg</span></div>
                            {dem.needsSupportBeams && <div className="flex justify-between text-muted-foreground"><span>Support Beams:</span> <span className="tabular-nums font-semibold">{wData.beamsWeight.toFixed(1)} kg</span></div>}
                            <div className="flex justify-between font-bold text-pink-700 mt-1 border-t border-pink-400/30 pt-1"><span>Total Wt:</span> <span className="tabular-nums">{wData.totalWeight.toFixed(1)} kg</span></div>
                          </div>
                        </div>
                        
                        <div className="col-span-2">
                          <DemisterDrawing data={dem} metrics={wData.metrics} />
                        </div>
                      </div>

                    </div>
                  )
                })()}
              </div>
            );
          })}
        </div>

        {/* Total metrics */}
        <div className="bg-pink-900/10 border-t border-pink-400/40 px-3 py-2 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-pink-600 uppercase">Total Mist Eliminator Wt.</span>
            <span className="text-sm font-bold tabular-nums text-pink-700">
              {(d.totalFabricatedWeight ?? 0).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg
            </span>
          </div>
        </div>

        <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-pink-500 border-2 border-slate-900" />
      </div>
    </>
  );
});

MistEliminatorNode.displayName = 'MistEliminatorNode';
