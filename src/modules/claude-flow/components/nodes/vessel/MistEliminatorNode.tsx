"use client";

import React, { memo, useState } from "react";
import { Position, type NodeProps, type Node } from "@xyflow/react";
import { Trash2, Layers, Plus, ChevronDown, ChevronUp, Settings } from "lucide-react";

import { useDiagramStore } from "@/modules/claude-flow/store";
import type { DiagramNodeData, DiagramNodeType } from "@/modules/claude-flow/types";
import type { 
  MistEliminatorNodeData, 
  MistEliminatorItem,
  DemisterData,
} from "@/modules/vessel-weight/schemas/mistEliminator.schema";
import { calcDemisterWeight } from "@/modules/vessel-weight/calculations/mistEliminator.calc";

import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  VesselNodeContainer,
  VesselNodeToolbar,
  VesselNodeHeader,
  VesselNodeFooter,
  VesselFooterHighlight,
  VesselFieldLabel,
} from "./VesselNodeBase";

type DiagramNode = Node<DiagramNodeData, DiagramNodeType>;
type Props = NodeProps<DiagramNode>;

function createNewDemister(idStr: string): DemisterData {
  return {
    id: idStr,
    type: "DEMISTER",
    tag: `ME-${idStr}`,
    shape: "CIRCLE",
    diameter_mm: 1500,
    width_mm: 1500,
    length_mm: 1500,
    padThickness_mm: 150,
    maxSegmentWidth_mm: 400,
    remainderHandling: "ENDS",
    material: "SS_304",
    yorkStyle: "York_431",
    customDensity_kg_m3: 144,
    hasFrame: true,
    frameSides: "2",
    edgeGap_mm: 15,
    barWidth_mm: 25,
    barThickness_mm: 3,
    rodSpacing_mm: 150,
    horizontalRodDia_mm: 6,
    verticalRodDia_mm: 6,
    needsSupportBeams: false,
    supportBeams: [{ profileName: "I-Beam 100x50", qty: 2, length_mm: 1500, linearWeight_kg_m: 10 }],
  };
}

function DemisterDrawing({ data, metrics }: { data: DemisterData, metrics: any }) {
  const D = data.shape === "CIRCLE" || data.shape === "CIRCLE_SEGMENT" ? data.diameter_mm - 2 * data.edgeGap_mm : data.width_mm;
  const L = data.shape === "RECTANGLE" ? data.length_mm : D;
  const R = D / 2;

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
      
      {data.shape === "RECTANGLE" ? (
        <rect x={c - D/2} y={c - L/2} width={D} height={L} fill={`url(#meshPattern-${data.id})`} stroke="#475569" strokeWidth={3} />
      ) : (
        <circle cx={c} cy={c} r={R} fill={`url(#meshPattern-${data.id})`} stroke="#475569" strokeWidth={4} />
      )}

      {metrics.segments?.map((seg: any, i: number) => {
        const x = c + seg.xStart;
        if (data.shape === "RECTANGLE") {
          return <line key={`seg-${i}`} x1={x} y1={c - L/2} x2={x} y2={c + L/2} stroke="#ef4444" strokeWidth={Math.max(4, data.barThickness_mm * 2)} />;
        } else {
          const chord = 2 * Math.sqrt(Math.max(0, R*R - Math.pow(seg.xStart, 2)));
          if (chord > 0) {
            return <line key={`seg-${i}`} x1={x} y1={c - chord/2} x2={x} y2={c + chord/2} stroke="#ef4444" strokeWidth={Math.max(4, data.barThickness_mm * 2)} />;
          }
        }
        return null;
      })}
      
      {(() => {
        if (!metrics.segments?.length) return null;
        const lastSeg = metrics.segments[metrics.segments.length - 1];
        const x = c + lastSeg.xEnd;
        if (data.shape === "RECTANGLE") {
          return <line x1={x} y1={c - L/2} x2={x} y2={c + L/2} stroke="#ef4444" strokeWidth={Math.max(4, data.barThickness_mm * 2)} />;
        } else {
          const chord = 2 * Math.sqrt(Math.max(0, R*R - Math.pow(lastSeg.xEnd, 2)));
          if (chord > 0) {
            return <line x1={x} y1={c - chord/2} x2={x} y2={c + chord/2} stroke="#ef4444" strokeWidth={Math.max(4, data.barThickness_mm * 2)} />;
          }
        }
      })()}

      {data.hasFrame && (
        <g stroke="#3b82f6" strokeWidth={Math.max(3, data.horizontalRodDia_mm)} opacity={0.6} strokeDasharray="15,10">
          {Array.from({ length: Math.min(10, Math.floor((data.shape === "RECTANGLE" ? L : D) / data.rodSpacing_mm)) }).map((_, i) => {
            const y = c - (data.shape === "RECTANGLE" ? L/2 : R) + (i + 1) * data.rodSpacing_mm;
            if (data.shape === "RECTANGLE") {
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

export const MistEliminatorNode = memo(({ id, data, selected }: Props) => {
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  
  const duplicateSelected = useDiagramStore((s) => s.duplicateSelected);
  const resetNodesToDefault = useDiagramStore((s) => s.resetNodesToDefault);
  const deleteNode = (nodeId: string) => {
    useDiagramStore.setState((s) => ({
      nodes: s.nodes.filter((n) => n.id !== nodeId),
      edges: s.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }));
  };

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const d = data as unknown as MistEliminatorNodeData;
  const equipments = d.equipments || [];

  const recalculate = (newEqs: MistEliminatorItem[]) => {
    let total = 0;
    const computedEqs = newEqs.map(eq => {
      if (eq.type === "DEMISTER") {
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
      <VesselNodeToolbar
        id={id}
        selected={selected}
        toolbarPosition={Position.Top}
        onDuplicate={() => duplicateSelected()}
        onReset={() => resetNodesToDefault([id])}
        onDelete={() => deleteNode(id)}
      />

      <VesselNodeContainer
        id={id}
        data={data}
        selected={selected}
        dir="ltr"
        widthClass="w-auto min-w-[360px] max-w-[500px]"
        showHandles={true}
      >
        <VesselNodeHeader
          icon={<Layers size={18} />}
          title="Mist Eliminator"
          subtitle="Demister Pads & Grids"
          badge={
            equipments.length > 0 ? (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-form-primary/10 text-form-primary border border-form-primary/20">
                {equipments.length} Item{equipments.length > 1 ? "s" : ""}
              </span>
            ) : undefined
          }
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={addDemister}
              className="h-6 px-2 text-[9px] font-semibold gap-1"
            >
              <Plus size={10} />
              Add Demister
            </Button>
          }
        />

        <div className="flex-1 p-3 space-y-2">
          {equipments.map((eq, idx) => {
            const isExpanded = expandedId === eq.id;
            const wData = (eq as any)._weightData || calcDemisterWeight(eq as DemisterData);
            
            return (
              <div key={eq.id} className="rounded-lg border border-border bg-muted/5 overflow-hidden relative">
                <div className="p-2 bg-muted/20 flex items-center justify-between cursor-pointer hover:bg-muted/40" onClick={() => setExpandedId(isExpanded ? null : eq.id)}>
                  <div className="flex items-center gap-2">
                    <Settings size={12} className="text-form-primary" />
                    <span className="text-[10px] font-bold text-foreground">{eq.type} ({eq.tag})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-muted-foreground">{wData.totalWeight.toFixed(1)} kg</span>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeEq(idx); }} className="h-6 w-6 text-form-primary hover:text-form-primary hover:bg-form-primary/10">
                      <Trash2 size={12} />
                    </Button>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>

                {isExpanded && eq.type === "DEMISTER" && (() => {
                  const dem = eq as DemisterData;
                  return (
                    <div className="p-2.5 space-y-3 bg-card border-t border-border">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <VesselFieldLabel label="Tag" />
                          <Input type="text" className="h-7 text-xs bg-white dark:bg-black" value={dem.tag} onChange={e => updateEq(idx, "tag", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <VesselFieldLabel label="Shape" />
                          <Combobox 
                            value={dem.shape} 
                            onChange={(val) => updateEq(idx, "shape", val)}
                            options={[
                              { value: "CIRCLE", label: "Circle" },
                              { value: "CIRCLE_SEGMENT", label: "Circle Segment" },
                              { value: "RECTANGLE", label: "Rectangle" }
                            ]}
                            className="h-7 text-xs w-full bg-white dark:bg-black"
                          />
                        </div>
                        <div className="space-y-1">
                          <VesselFieldLabel label="Material" />
                          <Input type="text" className="h-7 text-xs bg-white dark:bg-black" value={dem.material} onChange={e => updateEq(idx, "material", e.target.value)} />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 border border-border/80 p-2.5 rounded-lg bg-muted/20">
                        <div className="col-span-4"><span className="text-[11px] font-bold text-form-primary">Pad Geometry</span></div>
                        {dem.shape !== "RECTANGLE" && (
                          <div className="col-span-2 space-y-1">
                            <VesselFieldLabel label="Diameter" unit="mm" />
                            <Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={dem.diameter_mm} onChange={e => updateEq(idx, "diameter_mm", Number(e.target.value))} />
                          </div>
                        )}
                        {dem.shape === "RECTANGLE" && (
                          <>
                            <div className="col-span-2 space-y-1">
                              <VesselFieldLabel label="Width" unit="mm" />
                              <Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={dem.width_mm} onChange={e => updateEq(idx, "width_mm", Number(e.target.value))} />
                            </div>
                            <div className="col-span-2 space-y-1">
                              <VesselFieldLabel label="Length" unit="mm" />
                              <Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={dem.length_mm} onChange={e => updateEq(idx, "length_mm", Number(e.target.value))} />
                            </div>
                          </>
                        )}
                        <div className="col-span-2 space-y-1">
                          <VesselFieldLabel label="Pad Thk." unit="mm" />
                          <Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={dem.padThickness_mm} onChange={e => updateEq(idx, "padThickness_mm", Number(e.target.value))} />
                        </div>
                        
                        <div className="col-span-2 space-y-1">
                          <VesselFieldLabel label="Max Segment Width" unit="mm" />
                          <Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={dem.maxSegmentWidth_mm} onChange={e => updateEq(idx, "maxSegmentWidth_mm", Number(e.target.value))} />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <VesselFieldLabel label="Segment Remainder" />
                          <Combobox 
                            value={dem.remainderHandling} 
                            onChange={(val) => updateEq(idx, "remainderHandling", val)}
                            options={[
                              { value: "ENDS", label: "Symmetric Ends" },
                              { value: "MIDDLE", label: "Symmetric Middle" }
                            ]}
                            className="h-7 text-xs w-full bg-white dark:bg-black"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 border border-border/80 p-2.5 rounded-lg bg-card">
                        <div className="col-span-3"><span className="text-[11px] font-bold text-form-primary">Mesh & Grid</span></div>
                        <div className="space-y-1">
                          <VesselFieldLabel label="York Style" />
                          <Combobox 
                            value={dem.yorkStyle} 
                            onChange={(val) => updateEq(idx, "yorkStyle", val)}
                            options={[
                              { value: "York_431", label: "York 431" },
                              { value: "York_421", label: "York 421" },
                              { value: "York_432", label: "York 432" },
                              { value: "Custom", label: "Custom Density" }
                            ]}
                            className="h-7 text-xs w-full bg-white dark:bg-black"
                          />
                        </div>
                        {dem.yorkStyle === "Custom" && (
                          <div className="col-span-2 space-y-1">
                            <VesselFieldLabel label="Density" unit="kg/m³" />
                            <Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={dem.customDensity_kg_m3} onChange={e => updateEq(idx, "customDensity_kg_m3", Number(e.target.value))} />
                          </div>
                        )}
                        
                        <div className="col-span-3 flex items-center gap-2 mt-1">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                            <Checkbox id={`frame-${eq.id}`} checked={dem.hasFrame} onCheckedChange={(checked) => updateEq(idx, "hasFrame", checked)} />
                            <span>Include Grid Frame</span>
                          </label>
                        </div>

                        {dem.hasFrame && (
                          <>
                            <div className="space-y-1">
                              <VesselFieldLabel label="Frame Sides" />
                              <Combobox 
                                value={dem.frameSides} 
                                onChange={(val) => updateEq(idx, "frameSides", val)}
                                options={[
                                  { value: "1", label: "1 Side (Bottom)" },
                                  { value: "2", label: "2 Sides (Top & Bottom)" }
                                ]}
                                className="h-7 text-xs w-full bg-white dark:bg-black"
                              />
                            </div>
                            <div className="space-y-1"><VesselFieldLabel label="Edge Gap" unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={dem.edgeGap_mm} onChange={e => updateEq(idx, "edgeGap_mm", Number(e.target.value))} /></div>
                            <div className="space-y-1"><VesselFieldLabel label="Bar (W × Thk)" unit="mm" /><div className="flex items-center gap-1"><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={dem.barWidth_mm} onChange={e => updateEq(idx, "barWidth_mm", Number(e.target.value))} /> × <Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={dem.barThickness_mm} onChange={e => updateEq(idx, "barThickness_mm", Number(e.target.value))} /></div></div>
                            <div className="space-y-1"><VesselFieldLabel label="H-Rod Spacing" unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={dem.rodSpacing_mm} onChange={e => updateEq(idx, "rodSpacing_mm", Number(e.target.value))} /></div>
                            <div className="space-y-1"><VesselFieldLabel label="H-Rod Dia" unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={dem.horizontalRodDia_mm} onChange={e => updateEq(idx, "horizontalRodDia_mm", Number(e.target.value))} /></div>
                            <div className="space-y-1"><VesselFieldLabel label="V-Rod Dia" unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={dem.verticalRodDia_mm} onChange={e => updateEq(idx, "verticalRodDia_mm", Number(e.target.value))} /></div>
                          </>
                        )}
                      </div>

                      <div className="border border-border/80 p-2.5 rounded-lg bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                            <Checkbox id={`beam-${eq.id}`} checked={dem.needsSupportBeams} onCheckedChange={(checked) => updateEq(idx, "needsSupportBeams", checked)} />
                            <span>Needs Support Beams</span>
                          </label>
                          {dem.needsSupportBeams && (
                            <Button variant="outline" size="sm" onClick={() => updateEq(idx, "supportBeams", [...dem.supportBeams, { profileName: "I-Beam", qty: 1, length_mm: 1000, linearWeight_kg_m: 10 }])} className="h-6 px-2 text-[9px]">Add Beam</Button>
                          )}
                        </div>
                        {dem.needsSupportBeams && dem.supportBeams.map((b, bIdx) => (
                          <div key={bIdx} className="grid grid-cols-4 gap-2 mb-2 pb-2 border-b border-border/50 last:border-0 last:pb-0 last:mb-0">
                            <div className="space-y-1"><VesselFieldLabel label="Profile" /><Input type="text" className="h-7 text-xs bg-white dark:bg-black" value={b.profileName} onChange={e => updateEq(idx, "profileName", e.target.value, "supportBeams", bIdx)} /></div>
                            <div className="space-y-1"><VesselFieldLabel label="Qty" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={b.qty} onChange={e => updateEq(idx, "qty", Number(e.target.value), "supportBeams", bIdx)} /></div>
                            <div className="space-y-1"><VesselFieldLabel label="Length" unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={b.length_mm} onChange={e => updateEq(idx, "length_mm", Number(e.target.value), "supportBeams", bIdx)} /></div>
                            <div>
                              <div className="flex justify-between items-end gap-1">
                                <div className="flex-1 space-y-1"><VesselFieldLabel label="Weight" unit="kg/m" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={b.linearWeight_kg_m} onChange={e => updateEq(idx, "linearWeight_kg_m", Number(e.target.value), "supportBeams", bIdx)} /></div>
                                <Button variant="ghost" size="icon" onClick={() => { const arr = [...dem.supportBeams]; arr.splice(bIdx,1); updateEq(idx, "supportBeams", arr); }} className="h-7 w-7 text-destructive hover:bg-destructive/10 mb-0.5"><Trash2 size={12} /></Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Output Data & Drawing */}
                      <div className="grid grid-cols-5 gap-2">
                        <div className="col-span-3 bg-card border border-border/80 p-2.5 rounded-lg text-[10px] flex flex-col justify-between">
                          <div>
                            <div className="font-bold text-form-primary mb-1 border-b border-border/50 pb-1 flex justify-between">
                              <span>Fabrication Details</span>
                              <span>Segments: {wData.metrics.segments?.length || 0}</span>
                            </div>
                            
                            {wData.metrics.segments && wData.metrics.segments.length > 0 && (
                              <div className="text-[9px] text-muted-foreground mb-2 break-all">
                                <strong>Widths:</strong> {wData.metrics.segments.map((s:any) => s.width.toFixed(0)).join(" / ")} mm
                              </div>
                            )}

                            <div className="space-y-0.5 mb-2">
                              <div className="flex justify-between text-muted-foreground">
                                <span>Flat Bars ({dem.barWidth_mm}×{dem.barThickness_mm}):</span>
                                <span className="font-semibold text-foreground">{(wData.metrics.totalBarLength / 1000).toFixed(1)} m ({wData.metrics.barBranches_6m} × 6m lengths)</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <span>H-Rods (Ø{dem.horizontalRodDia_mm}):</span>
                                <span className="font-semibold text-foreground">{(wData.metrics.totalHorizRodLength / 1000).toFixed(1)} m ({wData.metrics.horizRodBranches_6m} × 6m lengths)</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <span>V-Rods (Ø{dem.verticalRodDia_mm}):</span>
                                <span className="font-semibold text-foreground">{(wData.metrics.totalVertRodsLength / 1000).toFixed(1)} m ({wData.metrics.vertRodBranches_6m} × 6m lengths)</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <span>V-Rods Qty:</span>
                                <span className="font-semibold text-foreground">{wData.metrics.totalVertRods} pcs</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="font-bold text-form-primary mb-1 border-b border-border/50 pb-1">Weight Summary</div>
                            <div className="flex justify-between text-muted-foreground"><span>Mesh Pad:</span> <span className="tabular-nums font-semibold">{wData.meshWeight.toFixed(1)} kg</span></div>
                            <div className="flex justify-between text-muted-foreground"><span>Grid & Frame:</span> <span className="tabular-nums font-semibold">{wData.gridWeight.toFixed(1)} kg</span></div>
                            {dem.needsSupportBeams && <div className="flex justify-between text-muted-foreground"><span>Support Beams:</span> <span className="tabular-nums font-semibold">{wData.beamsWeight.toFixed(1)} kg</span></div>}
                            <div className="flex justify-between font-bold text-form-primary mt-1 border-t border-border/50 pt-1"><span>Total Wt:</span> <span className="tabular-nums">{wData.totalWeight.toFixed(1)} kg</span></div>
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

        {/* Footer */}
        <VesselNodeFooter>
          <VesselFooterHighlight
            label="Total Mist Eliminator Wt."
            value={(d.totalFabricatedWeight ?? 0).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            unit="kg"
          />
        </VesselNodeFooter>
      </VesselNodeContainer>
    </>
  );
});

MistEliminatorNode.displayName = "MistEliminatorNode";
