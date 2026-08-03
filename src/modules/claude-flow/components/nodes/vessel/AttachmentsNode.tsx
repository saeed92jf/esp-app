"use client";

import React, { memo, useState } from "react";
import { Position, type NodeProps, type Node } from "@xyflow/react";
import { Trash2, Paperclip, ChevronDown, ChevronUp, Plus, Settings } from "lucide-react";

import { useDiagramStore } from "@/modules/claude-flow/store";
import type { DiagramNodeData, DiagramNodeType } from "@/modules/claude-flow/types";
import type { 
  AttachmentsNodeData, 
  AttachmentItem,
  NamePlateData,
  LiftingLugData,
  TurningLugData,
  InsulationSupportData,
  AttachmentType
} from "@/modules/vessel-weight/schemas/attachments.schema";
import { calcAttachmentWeight } from "@/modules/vessel-weight/calculations/attachments.calc";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

function createNewAttachment(type: AttachmentType, idStr: string): AttachmentItem {
  const base = { id: idStr, tag: `ATT-${idStr}`, material: "CS_A516_70" };
  
  if (type === "NAME_PLATE") {
    return { ...base, type, width_mm: 200, length_mm: 300, thickness_mm: 3, bracketThickness_mm: 5, qty: 1 } as NamePlateData;
  }
  if (type === "LIFTING_LUG") {
    return { ...base, type, qty: 2, mainPlate: { width_mm: 250, length_mm: 400, thickness_mm: 25 }, hasRepad: true, repad: { width_mm: 350, length_mm: 500, thickness_mm: 15 } } as LiftingLugData;
  }
  if (type === "TURNING_LUG") {
    return { ...base, type, qty: 1, mainPlate: { width_mm: 300, length_mm: 500, thickness_mm: 30 }, hasRepad: true, repad: { width_mm: 400, length_mm: 600, thickness_mm: 20 } } as TurningLugData;
  }
  if (type === "INSULATION_SUPPORT") {
    return { ...base, type, qtyOfRings: 4, vesselOuterDiameter_mm: 1000, ringWidth_mm: 50, ringThickness_mm: 6 } as InsulationSupportData;
  }
  return base as any;
}

export const AttachmentsNode = memo(({ id, data, selected }: Props) => {
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
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const d = data as unknown as AttachmentsNodeData;
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
        widthClass="w-auto min-w-[340px] max-w-[500px]"
        showHandles={true}
      >
        <VesselNodeHeader
          icon={<Paperclip size={18} />}
          title="Attachments"
          subtitle="Lifting Lugs & Appurtenances"
          badge={
            attachments.length > 0 ? (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-form-primary/10 text-form-primary border border-form-primary/20">
                {attachments.length} Item{attachments.length > 1 ? "s" : ""}
              </span>
            ) : undefined
          }
          actions={
            <Popover open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-6 px-2 text-[9px] font-semibold gap-1">
                  <Plus size={10} />
                  Add
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[160px] p-0" align="end">
                <div className="flex flex-col text-sm">
                  <Button variant="ghost" className="rounded-none justify-start h-8 px-3 text-xs" onClick={() => { addAttachment("NAME_PLATE"); setIsAddMenuOpen(false); }}>Name Plate</Button>
                  <Button variant="ghost" className="rounded-none justify-start h-8 px-3 text-xs" onClick={() => { addAttachment("LIFTING_LUG"); setIsAddMenuOpen(false); }}>Lifting Lug</Button>
                  <Button variant="ghost" className="rounded-none justify-start h-8 px-3 text-xs" onClick={() => { addAttachment("TURNING_LUG"); setIsAddMenuOpen(false); }}>Turning Lug</Button>
                  <Button variant="ghost" className="rounded-none justify-start h-8 px-3 text-xs" onClick={() => { addAttachment("INSULATION_SUPPORT"); setIsAddMenuOpen(false); }}>Insulation Support</Button>
                </div>
              </PopoverContent>
            </Popover>
          }
        />
        
        <div className="flex-1 p-3 space-y-2">
          {attachments.map((att, idx) => {
            const isExpanded = expandedId === att.id;
            const weight = (att as any)._weight || calcAttachmentWeight(att);
            
            return (
              <div key={att.id} className="rounded-lg border border-border bg-muted/10 overflow-hidden relative">
                <div className="p-2 bg-muted/30 flex items-center justify-between cursor-pointer hover:bg-muted/50" onClick={() => setExpandedId(isExpanded ? null : att.id)}>
                  <div className="flex items-center gap-2">
                    <Settings size={12} className="text-form-primary" />
                    <span className="text-[10px] font-bold text-foreground">{att.type.replace("_", " ")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-muted-foreground">{weight.toFixed(1)} kg</span>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeAtt(idx); }} className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                      <Trash2 size={12} />
                    </Button>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-2 space-y-3 bg-card border-t border-border">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <VesselFieldLabel label="Tag ID" />
                        <Input type="text" className="h-7 text-xs bg-white dark:bg-black" value={att.tag || ""} onChange={e => updateAtt(idx, "tag", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <VesselFieldLabel label="Material" />
                        <Input type="text" className="h-7 text-xs bg-white dark:bg-black" value={att.material} onChange={e => updateAtt(idx, "material", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <VesselFieldLabel label="Total Qty" />
                        <Input
                          type="number"
                          className="h-7 text-xs bg-white dark:bg-black"
                          value={(att as any).qty ?? (att as any).qtyOfRings ?? 1}
                          onChange={e => updateAtt(idx, att.type === "INSULATION_SUPPORT" ? "qtyOfRings" : "qty", Number(e.target.value))}
                        />
                      </div>
                    </div>

                    {att.type === "NAME_PLATE" && (() => {
                      const np = att as NamePlateData;
                      return (
                        <div className="grid grid-cols-2 gap-2 border border-border p-2 rounded bg-muted/5">
                          <div className="col-span-2"><span className="text-[10px] font-bold text-foreground">Name Plate Dimensions</span></div>
                          <div className="space-y-1"><VesselFieldLabel label="Width" unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={np.width_mm} onChange={e => updateAtt(idx, "width_mm", Number(e.target.value))} /></div>
                          <div className="space-y-1"><VesselFieldLabel label="Length" unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={np.length_mm} onChange={e => updateAtt(idx, "length_mm", Number(e.target.value))} /></div>
                          <div className="space-y-1"><VesselFieldLabel label="Plate Thk." unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={np.thickness_mm} onChange={e => updateAtt(idx, "thickness_mm", Number(e.target.value))} /></div>
                          <div className="space-y-1"><VesselFieldLabel label="Bracket Thk." unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={np.bracketThickness_mm} onChange={e => updateAtt(idx, "bracketThickness_mm", Number(e.target.value))} /></div>
                        </div>
                      );
                    })()}

                    {(att.type === "LIFTING_LUG" || att.type === "TURNING_LUG") && (() => {
                      const lug = att as (LiftingLugData | TurningLugData);
                      return (
                        <>
                          <div className="grid grid-cols-3 gap-2 border border-border p-2 rounded bg-muted/5">
                            <div className="col-span-3"><span className="text-[10px] font-bold text-foreground">Main Plate</span></div>
                            <div className="space-y-1"><VesselFieldLabel label="Width" unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={lug.mainPlate.width_mm} onChange={e => updateAtt(idx, "width_mm", Number(e.target.value), "mainPlate")} /></div>
                            <div className="space-y-1"><VesselFieldLabel label="Length" unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={lug.mainPlate.length_mm} onChange={e => updateAtt(idx, "length_mm", Number(e.target.value), "mainPlate")} /></div>
                            <div className="space-y-1"><VesselFieldLabel label="Thk." unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={lug.mainPlate.thickness_mm} onChange={e => updateAtt(idx, "thickness_mm", Number(e.target.value), "mainPlate")} /></div>
                          </div>
                          
                          <div className="border border-border p-2 rounded bg-muted/5 space-y-2">
                            <div className="flex items-center gap-2">
                              <Checkbox id={`repad-${att.id}`} checked={lug.hasRepad} onCheckedChange={(checked) => updateAtt(idx, "hasRepad", checked)} />
                              <label htmlFor={`repad-${att.id}`} className="text-[10px] cursor-pointer font-bold select-none">Include Reinforcement Pad</label>
                            </div>
                            {lug.hasRepad && lug.repad && (
                              <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1"><VesselFieldLabel label="Width" unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={lug.repad.width_mm} onChange={e => updateAtt(idx, "width_mm", Number(e.target.value), "repad")} /></div>
                                <div className="space-y-1"><VesselFieldLabel label="Length" unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={lug.repad.length_mm} onChange={e => updateAtt(idx, "length_mm", Number(e.target.value), "repad")} /></div>
                                <div className="space-y-1"><VesselFieldLabel label="Thk." unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={lug.repad.thickness_mm} onChange={e => updateAtt(idx, "thickness_mm", Number(e.target.value), "repad")} /></div>
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}

                    {att.type === "INSULATION_SUPPORT" && (() => {
                      const ins = att as InsulationSupportData;
                      return (
                        <div className="grid grid-cols-2 gap-2 border border-border p-2 rounded bg-muted/5">
                          <div className="col-span-2"><span className="text-[10px] font-bold text-foreground">Insulation Support Rings</span></div>
                          <div className="col-span-2 space-y-1"><VesselFieldLabel label="Vessel Outer Dia." unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={ins.vesselOuterDiameter_mm} onChange={e => updateAtt(idx, "vesselOuterDiameter_mm", Number(e.target.value))} /></div>
                          <div className="space-y-1"><VesselFieldLabel label="Ring Width" unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={ins.ringWidth_mm} onChange={e => updateAtt(idx, "ringWidth_mm", Number(e.target.value))} /></div>
                          <div className="space-y-1"><VesselFieldLabel label="Ring Thk." unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={ins.ringThickness_mm} onChange={e => updateAtt(idx, "ringThickness_mm", Number(e.target.value))} /></div>
                        </div>
                      );
                    })()}

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <VesselNodeFooter>
          <VesselFooterHighlight
            label="Total Attachments Weight"
            value={(d.totalFabricatedWeight ?? 0).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            unit="kg"
          />
        </VesselNodeFooter>
      </VesselNodeContainer>
    </>
  );
});

AttachmentsNode.displayName = "AttachmentsNode";
