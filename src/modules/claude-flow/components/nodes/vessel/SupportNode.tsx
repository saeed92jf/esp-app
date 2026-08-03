"use client";

import React, { memo, useEffect } from "react";
import { Position, type NodeProps, type Node } from "@xyflow/react";
import { ArrowDownToLine } from "lucide-react";

import { useDiagramStore } from "@/modules/claude-flow/store";
import type { DiagramNodeData, DiagramNodeType } from "@/modules/claude-flow/types";
import type { SupportNodeData, SupportType } from "@/modules/vessel-weight/schemas/support.schema";
import {
  calcRectPlateWeight,
  calcAnnularRingWeight,
  calcCylinderWeight,
  calcLegColumnWeight,
} from "@/modules/vessel-weight/calculations/support.calc";

import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
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

export const SupportNode = memo(({ id, data, selected }: Props) => {
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  
  const duplicateSelected = useDiagramStore((s) => s.duplicateSelected);
  const resetNodesToDefault = useDiagramStore((s) => s.resetNodesToDefault);
  const deleteNode = (nodeId: string) => {
    useDiagramStore.setState((s) => ({
      nodes: s.nodes.filter((n) => n.id !== nodeId),
      edges: s.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }));
  };
  const nodes = useDiagramStore((s) => s.nodes);

  const d = data as unknown as SupportNodeData;
  const rootNode = nodes.find((n) => n.type === "vesselRootNode");
  const orientation = (rootNode?.data?.vessel as any)?.orientation || "VERTICAL";

  useEffect(() => {
    if (orientation === "HORIZONTAL" && d.supportType !== "SADDLE") {
      update("supportType", "SADDLE");
    } else if (orientation === "VERTICAL" && d.supportType === "SADDLE") {
      update("supportType", "SKIRT");
    }
  }, [orientation, d.supportType]);

  const skirt = d.skirt || {
    topMaterial: "CS_A516_70",
    bottomMaterial: "CS_A516_70",
    height_mm: 2000,
    skirtShell: { innerDiameter_mm: 1000, thickness_mm: 10 },
    baseRing: { innerDiameter_mm: 1000, outerDiameter_mm: 1200, thickness_mm: 20 },
    gussetPlate: { qty: 12, length_mm: 200, width_mm: 150, thickness_mm: 15 },
    hasTopPlate: false,
    topPlate: { width_mm: 1200, length_mm: 1200, thickness_mm: 20 },
    hasTopRing: false,
    topRing: { innerDiameter_mm: 1000, outerDiameter_mm: 1200, thickness_mm: 20 },
    hasTemplatePlate: false,
    templatePlate: { innerDiameter_mm: 1050, outerDiameter_mm: 1250, thickness_mm: 5 },
  };

  const leg = d.leg || {
    column: { type: "PIPE", qty: 4, profileSize: "DN150", linearWeight_kg_m: 30, height_mm: 1500 },
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

  const recalculateWeight = (dataObj: any, type: SupportType) => {
    let total = 0;
    const density = 7850;

    if (type === "SKIRT") {
      const s = dataObj.skirt || skirt;
      if (s.skirtShell) {
        total += calcCylinderWeight(s.skirtShell.innerDiameter_mm, s.skirtShell.thickness_mm, s.height_mm, 1, density);
      }
      if (s.baseRing) {
        total += calcAnnularRingWeight(s.baseRing.innerDiameter_mm, s.baseRing.outerDiameter_mm, s.baseRing.thickness_mm, 1, density);
      }
      if (s.gussetPlate) {
        total += calcRectPlateWeight(s.gussetPlate.width_mm, s.gussetPlate.length_mm, s.gussetPlate.thickness_mm, s.gussetPlate.qty || 1, density);
      }
      if (s.hasTopPlate && s.topPlate) {
        total += calcRectPlateWeight(s.topPlate.width_mm, s.topPlate.length_mm, s.topPlate.thickness_mm, 1, density);
      }
      if (s.hasTopRing && s.topRing) {
        total += calcAnnularRingWeight(s.topRing.innerDiameter_mm, s.topRing.outerDiameter_mm, s.topRing.thickness_mm, 1, density);
      }
      if (s.hasTemplatePlate && s.templatePlate) {
        total += calcAnnularRingWeight(s.templatePlate.innerDiameter_mm, s.templatePlate.outerDiameter_mm, s.templatePlate.thickness_mm, 1, density);
      }
    } else if (type === "LEG") {
      const l = dataObj.leg || leg;
      if (l.column) total += calcLegColumnWeight(l.column.height_mm, l.column.linearWeight_kg_m, l.column.qty);
      if (l.basePlate) total += calcRectPlateWeight(l.basePlate.width_mm, l.basePlate.length_mm, l.basePlate.thickness_mm, l.basePlate.qty || 1, density);
      if (l.coverPlate) total += calcRectPlateWeight(l.coverPlate.width_mm, l.coverPlate.length_mm, l.coverPlate.thickness_mm, l.coverPlate.qty || 1, density);
      if (l.reinforcePlate) total += calcRectPlateWeight(l.reinforcePlate.width_mm, l.reinforcePlate.length_mm, l.reinforcePlate.thickness_mm, l.reinforcePlate.qty || 1, density);
    } else if (type === "LUG") {
      const lg = dataObj.lug || lug;
      if (lg.basePlate) total += calcRectPlateWeight(lg.basePlate.width_mm, lg.basePlate.length_mm, lg.basePlate.thickness_mm, lg.basePlate.qty || 1, density);
      if (lg.gussetPlate) total += calcRectPlateWeight(lg.gussetPlate.width_mm, lg.gussetPlate.length_mm, lg.gussetPlate.thickness_mm, lg.gussetPlate.qty || 1, density);
      if (lg.topPlate) total += calcRectPlateWeight(lg.topPlate.width_mm, lg.topPlate.length_mm, lg.topPlate.thickness_mm, lg.topPlate.qty || 1, density);
      if (lg.reinforcePlate) total += calcRectPlateWeight(lg.reinforcePlate.width_mm, lg.reinforcePlate.length_mm, lg.reinforcePlate.thickness_mm, lg.reinforcePlate.qty || 1, density);
    } else if (type === "SADDLE") {
      const sd = dataObj.saddle || saddle;
      const num = sd.numberOfSaddles || 2;
      let singleWeight = 0;
      if (sd.basePlate) singleWeight += calcRectPlateWeight(sd.basePlate.width_mm, sd.basePlate.length_mm, sd.basePlate.thickness_mm, 1, density);
      if (sd.wearPlate) singleWeight += calcRectPlateWeight(sd.wearPlate.width_mm, sd.wearPlate.length_mm, sd.wearPlate.thickness_mm, 1, density);
      if (sd.webPlate) singleWeight += calcRectPlateWeight(sd.webPlate.width_mm, sd.webPlate.length_mm, sd.webPlate.thickness_mm, 1, density);
      if (sd.ribPlate) singleWeight += calcRectPlateWeight(sd.ribPlate.width_mm, sd.ribPlate.length_mm, sd.ribPlate.thickness_mm, sd.ribPlate.qty || 4, density);
      total = singleWeight * num;
    }

    return total;
  };

  const update = (field: string, val: any, category?: "skirt" | "leg" | "lug" | "saddle", subCategory?: string) => {
    const updated = { ...d };
    if (!category) {
      (updated as any)[field] = val;
    } else if (!subCategory) {
      (updated as any)[category] = { ...(updated as any)[category], [field]: val };
    } else {
      (updated as any)[category] = {
        ...(updated as any)[category],
        [subCategory]: {
          ...((updated as any)[category]?.[subCategory] || {}),
          [field]: val,
        },
      };
    }

    const currentType = (updated.supportType || "SKIRT") as SupportType;
    const total = recalculateWeight(updated, currentType);
    updated.totalFabricatedWeight = total;

    updateNodeData(id, updated as any);
  };

  const renderRectPlateInputs = (label: string, category: "skirt" | "leg" | "lug" | "saddle", subCategory: string) => {
    const dataObj = (d as any)[category]?.[subCategory] || {};
    return (
      <div className="grid grid-cols-4 gap-2 border border-border/80 p-2 rounded-lg mt-2 bg-muted/20">
        <div className="col-span-4"><span className="text-[11px] font-bold text-form-primary">{label}</span></div>
        <div className="space-y-1"><VesselFieldLabel label="Width" unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={dataObj.width_mm ?? ""} onChange={(e) => update("width_mm", Number(e.target.value), category, subCategory)} /></div>
        <div className="space-y-1"><VesselFieldLabel label="Length" unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={dataObj.length_mm ?? ""} onChange={(e) => update("length_mm", Number(e.target.value), category, subCategory)} /></div>
        <div className="space-y-1"><VesselFieldLabel label="Thk." unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={dataObj.thickness_mm ?? ""} onChange={(e) => update("thickness_mm", Number(e.target.value), category, subCategory)} /></div>
        <div className="space-y-1"><VesselFieldLabel label="Qty" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={dataObj.qty ?? ""} onChange={(e) => update("qty", Number(e.target.value), category, subCategory)} /></div>
      </div>
    );
  };

  const renderAnnularRingInputs = (label: string, category: "skirt" | "leg" | "lug" | "saddle", subCategory: string, hasQty: boolean = false) => {
    const dataObj = (d as any)[category]?.[subCategory] || {};
    return (
      <div className={`grid ${hasQty ? "grid-cols-4" : "grid-cols-3"} gap-2 border border-border/80 p-2 rounded-lg mt-2 bg-muted/20`}>
        <div className={`col-span-${hasQty ? "4" : "3"}`}><span className="text-[11px] font-bold text-form-primary">{label}</span></div>
        <div className="space-y-1"><VesselFieldLabel label="I.D." unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={dataObj.innerDiameter_mm ?? ""} onChange={(e) => update("innerDiameter_mm", Number(e.target.value), category, subCategory)} /></div>
        <div className="space-y-1"><VesselFieldLabel label="O.D." unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={dataObj.outerDiameter_mm ?? ""} onChange={(e) => update("outerDiameter_mm", Number(e.target.value), category, subCategory)} /></div>
        <div className="space-y-1"><VesselFieldLabel label="Thk." unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={dataObj.thickness_mm ?? ""} onChange={(e) => update("thickness_mm", Number(e.target.value), category, subCategory)} /></div>
        {hasQty && <div className="space-y-1"><VesselFieldLabel label="Qty" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={dataObj.qty ?? ""} onChange={(e) => update("qty", Number(e.target.value), category, subCategory)} /></div>}
      </div>
    );
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
          icon={<ArrowDownToLine size={18} />}
          title="Support"
          subtitle="Skirt, Legs, Lugs, Saddle"
          badge={
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-form-primary/10 text-form-primary border border-form-primary/20">
              {d.supportType || (orientation === "HORIZONTAL" ? "SADDLE" : "SKIRT")}
            </span>
          }
        />
        
        <div className="p-3 space-y-3">
          <div className="space-y-1">
            <VesselFieldLabel label="Support Type" />
            <Combobox 
              value={d.supportType || "SKIRT"} 
              onChange={(val) => update("supportType", val)}
              options={orientation === "VERTICAL" ? [
                { value: "SKIRT", label: "Skirt Support" },
                { value: "LEG", label: "Leg Support" },
                { value: "LUG", label: "Lug Support" }
              ] : [
                { value: "SADDLE", label: "Saddle Support" }
              ]}
              className="h-8 text-xs w-full bg-white dark:bg-black"
            />
          </div>

          {/* SKIRT */}
          {d.supportType === "SKIRT" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 border border-border/80 p-2.5 rounded-lg bg-card">
                <div className="col-span-2 space-y-1">
                  <VesselFieldLabel label="Skirt Height" unit="mm" />
                  <Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={skirt.height_mm} onChange={(e) => update("height_mm", Number(e.target.value), "skirt")} />
                </div>
                <div className="space-y-1">
                  <VesselFieldLabel label="Top Material" />
                  <Input type="text" className="h-7 text-xs bg-white dark:bg-black" value={skirt.topMaterial} onChange={(e) => update("topMaterial", e.target.value, "skirt")} />
                </div>
                <div className="space-y-1">
                  <VesselFieldLabel label="Bottom Material" />
                  <Input type="text" className="h-7 text-xs bg-white dark:bg-black" value={skirt.bottomMaterial} onChange={(e) => update("bottomMaterial", e.target.value, "skirt")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border border-border/80 p-2.5 rounded-lg bg-muted/20">
                <div className="col-span-2"><span className="text-[11px] font-bold text-form-primary">Skirt Shell</span></div>
                <div className="space-y-1"><VesselFieldLabel label="Inside Diameter" unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={skirt.skirtShell?.innerDiameter_mm ?? ""} onChange={(e) => update("innerDiameter_mm", Number(e.target.value), "skirt", "skirtShell")} /></div>
                <div className="space-y-1"><VesselFieldLabel label="Thickness" unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={skirt.skirtShell?.thickness_mm ?? ""} onChange={(e) => update("thickness_mm", Number(e.target.value), "skirt", "skirtShell")} /></div>
              </div>

              {renderAnnularRingInputs("Base Ring", "skirt", "baseRing")}
              {renderRectPlateInputs("Gusset Plates", "skirt", "gussetPlate")}
              
              <div className="border border-border/80 p-2.5 rounded-lg mt-2 space-y-2 bg-card">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                    <Checkbox id={`topP-${id}`} checked={skirt.hasTopPlate} onCheckedChange={(checked) => { update("hasTopPlate", checked, "skirt"); if(checked) update("hasTopRing", false, "skirt"); }} />
                    <span>Top Plate</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                    <Checkbox id={`topR-${id}`} checked={skirt.hasTopRing} onCheckedChange={(checked) => { update("hasTopRing", checked, "skirt"); if(checked) update("hasTopPlate", false, "skirt"); }} />
                    <span>Top Ring</span>
                  </label>
                </div>
                {skirt.hasTopPlate && renderRectPlateInputs("Top Plate", "skirt", "topPlate")}
                {skirt.hasTopRing && renderAnnularRingInputs("Top Ring", "skirt", "topRing")}
              </div>

              <div className="border border-border/80 p-2.5 rounded-lg mt-2 space-y-2 bg-card">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                  <Checkbox id={`tpl-${id}`} checked={skirt.hasTemplatePlate} onCheckedChange={(checked) => update("hasTemplatePlate", checked, "skirt")} />
                  <span>Template / Gauge Plate</span>
                </label>
                {skirt.hasTemplatePlate && renderAnnularRingInputs("Template Plate", "skirt", "templatePlate")}
              </div>
            </div>
          )}

          {/* LEG */}
          {d.supportType === "LEG" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 border border-border/80 p-2.5 rounded-lg bg-card">
                <div className="col-span-2"><span className="text-[11px] font-bold text-form-primary">Leg Column</span></div>
                <div className="space-y-1"><VesselFieldLabel label="Profile Type" /><Input type="text" className="h-7 text-xs bg-white dark:bg-black" placeholder="e.g. PIPE" value={leg.column.type} onChange={(e) => update("type", e.target.value, "leg", "column")} /></div>
                <div className="space-y-1"><VesselFieldLabel label="Quantity" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={leg.column.qty} onChange={(e) => update("qty", Number(e.target.value), "leg", "column")} /></div>
                <div className="space-y-1"><VesselFieldLabel label="Height" unit="mm" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={leg.column.height_mm} onChange={(e) => update("height_mm", Number(e.target.value), "leg", "column")} /></div>
                <div className="space-y-1"><VesselFieldLabel label="Weight" unit="kg/m" /><Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={leg.column.linearWeight_kg_m} onChange={(e) => update("linearWeight_kg_m", Number(e.target.value), "leg", "column")} /></div>
              </div>
              {renderRectPlateInputs("Base Plate", "leg", "basePlate")}
              {renderRectPlateInputs("Cover Plate", "leg", "coverPlate")}
              {renderRectPlateInputs("Reinforce Plate", "leg", "reinforcePlate")}
            </div>
          )}

          {/* LUG */}
          {d.supportType === "LUG" && (
            <div className="space-y-3">
              {renderRectPlateInputs("Base Plate", "lug", "basePlate")}
              {renderRectPlateInputs("Gusset Plate", "lug", "gussetPlate")}
              {renderRectPlateInputs("Top Plate", "lug", "topPlate")}
              {renderRectPlateInputs("Reinforce Plate", "lug", "reinforcePlate")}
            </div>
          )}

          {/* SADDLE */}
          {d.supportType === "SADDLE" && (
            <div className="space-y-3">
              <div className="border border-border/80 p-2.5 rounded-lg bg-card space-y-1">
                <VesselFieldLabel label="Number of Saddles" />
                <Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={saddle.numberOfSaddles} onChange={(e) => update("numberOfSaddles", Number(e.target.value), "saddle")} />
              </div>
              {renderRectPlateInputs("Base Plate", "saddle", "basePlate")}
              {renderRectPlateInputs("Wear Plate", "saddle", "wearPlate")}
              {renderRectPlateInputs("Web Plate", "saddle", "webPlate")}
              {renderRectPlateInputs("Rib Plate", "saddle", "ribPlate")}
            </div>
          )}
        </div>

        {/* Footer */}
        <VesselNodeFooter>
          <VesselFooterHighlight
            label="Total Support Weight"
            value={(d.totalFabricatedWeight ?? 0).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            unit="kg"
          />
        </VesselNodeFooter>
      </VesselNodeContainer>
    </>
  );
});

SupportNode.displayName = "SupportNode";
