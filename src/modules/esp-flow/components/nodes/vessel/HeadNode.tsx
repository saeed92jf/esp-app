"use client";

import React, { memo, useState } from "react";
import { type NodeProps, type Node } from "@xyflow/react";
import {
  Trash2,
  Disc,
  Plus,
} from "lucide-react";

import { useDiagramStore } from "@/modules/esp-flow/store";
import type { DiagramNodeData, DiagramNodeType } from "@/modules/esp-flow/types";
import type { HeadNodeData, Head, HeadType, HeadPosition } from "@/modules/vessel-weight/schemas/head.schema";
import {
  calcElliptical21HeadWeight,
  calcTorishericalHeadWeight,
  calcHemisphericalHeadWeight,
  calcHeadBlankWeight,
} from "@/modules/vessel-weight/calculations/head.calc";
import { calcElectrodeConsumption } from "@/modules/vessel-weight/calculations/weld.calc";

import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  VesselNodeContainer,
  VesselNodeToolbar,
  VesselNodeHeader,
  VesselNodeFooter,
  VesselFooterRow,
  VesselFooterHighlight,
  VesselSectionHeader,
  VesselFieldLabel,
} from "./VesselNodeBase";

type DiagramNode = Node<DiagramNodeData, DiagramNodeType>;
type Props = NodeProps<DiagramNode>;

function createDefaultHead(position: HeadPosition = "TOP"): Head {
  return {
    headId: `head-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    position,
    headType: "ELLIPTICAL_2_1",
    insideDiameter_mm: 1000,
    thicknessAfterForming_mm: 10,
    thicknessBeforeForming_mm: 12,
    straightFlange_mm: 50,
    blankDiameter_mm: 1200,
    crownRadius_mm: 1000,
    knuckleRadius_mm: 100,
    formingType: "COLD",
    thinningAllowance_pct: 10,
    material: "SS_304",
    isSegmented: false,
    numberOfPetals: 0,
    crownPieceIncluded: false,
    nozzleOpeningsOnHead: [],
    longitudinalWeldSeams: 2,
    circumferentialWeldSeams: 0,
    longitudinalRadiography: "SPOT",
    circumferentialRadiography: "SPOT",
    pipeNominalSize_inch: '2"',
    pipeSchedule: "STD",
    pipeThicknessTolerance_pct: 12.5,
  };
}

const HEAD_TYPES: { value: HeadType; label: string }[] = [
  { value: "ELLIPTICAL_2_1", label: "Elliptical 2:1" },
  { value: "HEMISPHERICAL", label: "Hemispherical" },
  { value: "TORISPHERICAL_ASME", label: "Torispherical (ASME)" },
  { value: "FLAT_PLATE", label: "Flat Plate" },
  { value: "STANDARD_CAP", label: "Forged Pipe Cap" },
];

const POSITIONS: { value: HeadPosition; label: string }[] = [
  { value: "TOP", label: "Top" },
  { value: "BOTTOM", label: "Bottom" },
  { value: "LEFT", label: "Left" },
  { value: "RIGHT", label: "Right" },
];

const MATERIALS = [
  { value: "CS_A516_70", label: "SA-516 Gr. 70" },
  { value: "CS_A516_60", label: "SA-516 Gr. 60" },
  { value: "CS_A516_65", label: "SA-516 Gr. 65" },
  { value: "SS_304", label: "SA-240 304" },
  { value: "SS_304L", label: "SA-240 304L" },
  { value: "SS_316", label: "SA-240 316" },
  { value: "SS_316L", label: "SA-240 316L" },
  { value: "SS_321", label: "SA-240 321" },
  { value: "SS_347", label: "SA-240 347" },
  { value: "DUPLEX_2205", label: "SA-240 2205" },
  { value: "DUPLEX_2507", label: "SA-240 2507" },
];

const RT_OPTIONS = [
  { value: "FULL", label: "Full (100%)" },
  { value: "SPOT", label: "Spot" },
  { value: "NONE", label: "None (0%)" },
];

const NPS_OPTIONS = [
  { value: '1/2"', label: '1/2"' },
  { value: '3/4"', label: '3/4"' },
  { value: '1"', label: '1"' },
  { value: '1.5"', label: '1.5"' },
  { value: '2"', label: '2"' },
  { value: '3"', label: '3"' },
  { value: '4"', label: '4"' },
  { value: '6"', label: '6"' },
  { value: '8"', label: '8"' },
  { value: '10"', label: '10"' },
  { value: '12"', label: '12"' },
  { value: '14"', label: '14"' },
  { value: '16"', label: '16"' },
  { value: '18"', label: '18"' },
  { value: '20"', label: '20"' },
  { value: '24"', label: '24"' },
];

export const HeadNode = memo(({ id, data, selected }: Props) => {
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  const duplicateSelected = useDiagramStore((s) => s.duplicateSelected);
  const resetNodesToDefault = useDiagramStore((s) => s.resetNodesToDefault);
  const deleteNode = (nodeId: string) => {
    useDiagramStore.setState((s) => ({
      nodes: s.nodes.filter((n) => n.id !== nodeId),
      edges: s.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }));
  };

  const [isCollapsed, setIsCollapsed] = useState(false);

  const d = data as unknown as HeadNodeData;
  const heads: Head[] = (d.heads && d.heads.length > 0)
    ? d.heads
    : [createDefaultHead("TOP"), createDefaultHead("BOTTOM")];

  const recalculateAndSave = (updatedHeads: Head[]) => {
    let totalWeight = 0;
    let totalArea = 0;
    let totalVol = 0;
    let totalRawWeight = 0;
    let totalElectrodeWeight = 0;
    let totalWeldLen = 0;
    let maxElong = 0;

    updatedHeads.forEach((h) => {
      const density = h.material?.startsWith("SS") ? 8000 : 7850;
      let result = { weight_kg: 0, internalVolume_m3: 0, depth_mm: 0, area_m2: 0 };

      if (h.headType === "ELLIPTICAL_2_1") {
        result = calcElliptical21HeadWeight(
          h.insideDiameter_mm,
          h.thicknessAfterForming_mm,
          h.straightFlange_mm,
          density
        );
      } else if (h.headType === "HEMISPHERICAL") {
        result = calcHemisphericalHeadWeight(
          h.insideDiameter_mm,
          h.thicknessAfterForming_mm,
          h.straightFlange_mm || 0,
          density
        );
      } else if (
        h.headType === "TORISPHERICAL_ASME" ||
        h.headType === "TORISPHERICAL_KORBBOGEN" ||
        h.headType === "TORISPHERICAL_DIN28011"
      ) {
        result = calcTorishericalHeadWeight(
          h.insideDiameter_mm,
          h.crownRadius_mm || h.insideDiameter_mm,
          h.knuckleRadius_mm || h.insideDiameter_mm * 0.1,
          h.thicknessAfterForming_mm,
          h.straightFlange_mm,
          density
        );
      } else if (h.headType === "FLAT_PLATE" || h.headType === "CONICAL_FLAT") {
        const radius_m = h.insideDiameter_mm / 2000;
        const thk_m = h.thicknessAfterForming_mm / 1000;
        const vol_m3 = Math.PI * Math.pow(radius_m, 2) * thk_m;
        result = {
          weight_kg: vol_m3 * density,
          internalVolume_m3: 0,
          depth_mm: h.thicknessAfterForming_mm,
          area_m2: Math.PI * Math.pow(radius_m, 2),
        };
      }

      const rawWeight = calcHeadBlankWeight(h.blankDiameter_mm || h.insideDiameter_mm + 200, h.thicknessBeforeForming_mm, density);

      const actualLongSeams = h.longitudinalWeldSeams ?? 2;
      const actualCircSeams = h.circumferentialWeldSeams ?? 0;

      const seamLen = (actualLongSeams + actualCircSeams) * (h.insideDiameter_mm / 1000);
      const electWeight = calcElectrodeConsumption(seamLen, h.thicknessBeforeForming_mm);

      const rf = h.crownRadius_mm || h.insideDiameter_mm;
      const elong = rf > 0 ? (75 * h.thicknessBeforeForming_mm) / rf : 0;

      totalWeight += result.weight_kg;
      totalArea += result.area_m2;
      totalVol += result.internalVolume_m3;
      totalRawWeight += rawWeight;
      totalElectrodeWeight += electWeight;
      totalWeldLen += seamLen;
      if (elong > maxElong) maxElong = elong;
    });

    updateNodeData(id, {
      ...data,
      heads: updatedHeads,
      calculatedWeight: totalWeight,
      rawWeight_kg: totalRawWeight,
      electrodeWeight_kg: totalElectrodeWeight,
      weldLength_m: totalWeldLen,
      elongation_pct: maxElong,
      area_m2: totalArea,
      internalVolume: totalVol,
    } as any);
  };

  const updateHead = (index: number, key: keyof Head, value: any) => {
    const updated = heads.map((h, i) => (i === index ? { ...h, [key]: value } : h));
    recalculateAndSave(updated);
  };

  const addHead = () => {
    const nextPos: HeadPosition = heads.length === 1 ? "BOTTOM" : "TOP";
    const updated = [...heads, createDefaultHead(nextPos)];
    recalculateAndSave(updated);
  };

  const removeHead = (index: number) => {
    if (heads.length <= 1) return;
    const updated = heads.filter((_, i) => i !== index);
    recalculateAndSave(updated);
  };

  return (
    <>
      <VesselNodeToolbar
        id={id}
        selected={selected}
        toolbarPosition={data.toolbarPosition ?? ("top" as any)}
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
        {/* Header */}
        <VesselNodeHeader
          icon={<Disc size={18} />}
          title="Head"
          subtitle="Formed & Flat Heads"
          badge={
            heads.length > 0 ? (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-form-primary/10 text-form-primary border border-form-primary/20">
                {heads.length} {heads.length === 1 ? "Head" : "Heads"}
              </span>
            ) : undefined
          }
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={addHead}
              className="h-6 px-2 text-[9px] font-semibold gap-1"
            >
              <Plus size={10} />
              Add Head
            </Button>
          }
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Body Content */}
        {!isCollapsed && (
          <div className="p-3 space-y-3">
            {heads.map((head, idx) => {
              const isTorispherical =
                head.headType === "TORISPHERICAL_ASME" ||
                head.headType === "TORISPHERICAL_KORBBOGEN" ||
                head.headType === "TORISPHERICAL_DIN28011";
              const isFlat = head.headType === "FLAT_PLATE" || head.headType === "CONICAL_FLAT";
              const isCap = head.headType === "STANDARD_CAP";
              const isEllipticalOrHemi = !isTorispherical && !isFlat && !isCap;

              return (
                <div
                  key={head.headId || idx}
                  className="rounded-lg border border-border/80 p-2.5 space-y-2.5 bg-card relative"
                >
                  {/* Subtitle & Head Position indicator */}
                  <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-form-primary">
                      <span>Head {head.position || "TOP"}</span>
                      {heads.length > 1 && (
                        <span className="text-[9px] text-muted-foreground font-normal">
                          (#{idx + 1})
                        </span>
                      )}
                    </div>
                    {heads.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeHead(idx)}
                        className="h-5 w-5 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={12} />
                      </Button>
                    )}
                  </div>

                  {/* Row 1: Position & Type */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <VesselFieldLabel label="Position" />
                      <Combobox
                        options={POSITIONS}
                        value={head.position ?? "TOP"}
                        onChange={(val: string) => updateHead(idx, "position", val as HeadPosition)}
                        className="h-7 text-xs w-full bg-white dark:bg-black"
                      />
                    </div>
                    <div className="space-y-1">
                      <VesselFieldLabel label="Head Type" />
                      <Combobox
                        options={HEAD_TYPES}
                        value={head.headType ?? "ELLIPTICAL_2_1"}
                        onChange={(val: string) => updateHead(idx, "headType", val as HeadType)}
                        className="h-7 text-xs w-full bg-white dark:bg-black"
                      />
                    </div>
                  </div>

                  {/* Row 2: Material */}
                  <div className="space-y-1">
                    <VesselFieldLabel label="Material" />
                    <Combobox
                      options={MATERIALS}
                      value={head.material ?? "SA-240 304"}
                      onChange={(val: string) => updateHead(idx, "material", val)}
                      className="h-7 text-xs w-full bg-white dark:bg-black"
                    />
                  </div>

                  {/* DYNAMIC FIELDS PER TYPE */}
                  <div className="space-y-2.5 border-t border-border/40 pt-2">
                    {/* 1. Elliptical / Hemispherical */}
                    {isEllipticalOrHemi && (
                      <>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <VesselFieldLabel label="Inside Diameter" unit="mm" />
                            <Input
                              type="number"
                              value={head.insideDiameter_mm ?? ""}
                              onChange={(e) =>
                                updateHead(
                                  idx,
                                  "insideDiameter_mm",
                                  Number(e.target.value)
                                )
                              }
                              className="h-7 text-xs bg-white dark:bg-black"
                            />
                          </div>
                          <div className="space-y-1">
                            <VesselFieldLabel label="Straight Flange" unit="mm" />
                            <Input
                              type="number"
                              value={head.straightFlange_mm ?? ""}
                              onChange={(e) =>
                                updateHead(
                                  idx,
                                  "straightFlange_mm",
                                  Number(e.target.value)
                                )
                              }
                              className="h-7 text-xs bg-white dark:bg-black"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <VesselFieldLabel label="Thk. Before Forming" unit="mm" />
                            <Input
                              type="number"
                              value={head.thicknessBeforeForming_mm ?? ""}
                              onChange={(e) =>
                                updateHead(
                                  idx,
                                  "thicknessBeforeForming_mm",
                                  Number(e.target.value)
                                )
                              }
                              className="h-7 text-xs bg-white dark:bg-black"
                            />
                          </div>
                          <div className="space-y-1">
                            <VesselFieldLabel label="Thk. After Forming" unit="mm" />
                            <Input
                              type="number"
                              value={head.thicknessAfterForming_mm ?? ""}
                              onChange={(e) =>
                                updateHead(
                                  idx,
                                  "thicknessAfterForming_mm",
                                  Number(e.target.value)
                                )
                              }
                              className="h-7 text-xs bg-white dark:bg-black"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* 2. Torispherical */}
                    {isTorispherical && (
                      <>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <VesselFieldLabel label="Inside Diameter" unit="mm" />
                            <Input
                              type="number"
                              value={head.insideDiameter_mm ?? ""}
                              onChange={(e) =>
                                updateHead(
                                  idx,
                                  "insideDiameter_mm",
                                  Number(e.target.value)
                                )
                              }
                              className="h-7 text-xs bg-white dark:bg-black"
                            />
                          </div>
                          <div className="space-y-1">
                            <VesselFieldLabel label="Straight Flange" unit="mm" />
                            <Input
                              type="number"
                              value={head.straightFlange_mm ?? ""}
                              onChange={(e) =>
                                updateHead(
                                  idx,
                                  "straightFlange_mm",
                                  Number(e.target.value)
                                )
                              }
                              className="h-7 text-xs bg-white dark:bg-black"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <VesselFieldLabel label="Thk. Before Forming" unit="mm" />
                            <Input
                              type="number"
                              value={head.thicknessBeforeForming_mm ?? ""}
                              onChange={(e) =>
                                updateHead(
                                  idx,
                                  "thicknessBeforeForming_mm",
                                  Number(e.target.value)
                                )
                              }
                              className="h-7 text-xs bg-white dark:bg-black"
                            />
                          </div>
                          <div className="space-y-1">
                            <VesselFieldLabel label="Thk. After Forming" unit="mm" />
                            <Input
                              type="number"
                              value={head.thicknessAfterForming_mm ?? ""}
                              onChange={(e) =>
                                updateHead(
                                  idx,
                                  "thicknessAfterForming_mm",
                                  Number(e.target.value)
                                )
                              }
                              className="h-7 text-xs bg-white dark:bg-black"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <VesselFieldLabel label="Crown Radius" unit="mm" />
                            <Input
                              type="number"
                              value={head.crownRadius_mm ?? ""}
                              onChange={(e) =>
                                updateHead(
                                  idx,
                                  "crownRadius_mm",
                                  Number(e.target.value)
                                )
                              }
                              className="h-7 text-xs bg-white dark:bg-black"
                            />
                          </div>
                          <div className="space-y-1">
                            <VesselFieldLabel label="Knuckle Radius" unit="mm" />
                            <Input
                              type="number"
                              value={head.knuckleRadius_mm ?? ""}
                              onChange={(e) =>
                                updateHead(
                                  idx,
                                  "knuckleRadius_mm",
                                  Number(e.target.value)
                                )
                              }
                              className="h-7 text-xs bg-white dark:bg-black"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* 3. Flat */}
                    {isFlat && (
                      <>
                        <div className="space-y-1">
                          <VesselFieldLabel label="Inside Diameter" unit="mm" />
                          <Input
                            type="number"
                            value={head.insideDiameter_mm ?? ""}
                            onChange={(e) =>
                              updateHead(
                                idx,
                                "insideDiameter_mm",
                                Number(e.target.value)
                              )
                            }
                            className="h-7 text-xs bg-white dark:bg-black"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <VesselFieldLabel label="Thk. Before Forming" unit="mm" />
                            <Input
                              type="number"
                              value={head.thicknessBeforeForming_mm ?? ""}
                              onChange={(e) =>
                                updateHead(
                                  idx,
                                  "thicknessBeforeForming_mm",
                                  Number(e.target.value)
                                )
                              }
                              className="h-7 text-xs bg-white dark:bg-black"
                            />
                          </div>
                          <div className="space-y-1">
                            <VesselFieldLabel label="Thk. After Forming" unit="mm" />
                            <Input
                              type="number"
                              value={head.thicknessAfterForming_mm ?? ""}
                              onChange={(e) =>
                                updateHead(
                                  idx,
                                  "thicknessAfterForming_mm",
                                  Number(e.target.value)
                                )
                              }
                              className="h-7 text-xs bg-white dark:bg-black"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* 4. Pipe Cap / Forged */}
                    {isCap && (
                      <>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <VesselFieldLabel label="Nominal Pipe Size" unit="in" />
                            <Combobox
                              options={NPS_OPTIONS}
                              value={head.pipeNominalSize_inch ?? '2"'}
                              onChange={(val: string) =>
                                updateHead(idx, "pipeNominalSize_inch", val)
                              }
                              className="h-7 text-xs w-full bg-white dark:bg-black"
                            />
                          </div>
                          <div className="space-y-1">
                            <VesselFieldLabel label="Schedule" />
                            <Input
                              value={head.pipeSchedule ?? "STD"}
                              onChange={(e) =>
                                updateHead(idx, "pipeSchedule", e.target.value)
                              }
                              className="h-7 text-xs bg-white dark:bg-black"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-form-primary">
                            <Checkbox
                              checked={
                                (head.pipeThicknessTolerance_pct ?? 12.5) > 0
                              }
                              onCheckedChange={(c) =>
                                updateHead(
                                  idx,
                                  "pipeThicknessTolerance_pct",
                                  c ? 12.5 : 0
                                )
                              }
                            />
                            <span>Under-tolerance (12.5%)</span>
                          </label>
                        </div>
                      </>
                    )}

                    {/* Radiography Dropdowns */}
                    {!isCap && (
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <div className="space-y-1">
                          <VesselFieldLabel label="Long. Radiography (RT)" />
                          <Combobox
                            options={RT_OPTIONS}
                            value={head.longitudinalRadiography ?? "SPOT"}
                            onChange={(val: string) =>
                              updateHead(idx, "longitudinalRadiography", val)
                            }
                            className="h-7 text-xs w-full bg-white dark:bg-black"
                          />
                        </div>
                        <div className="space-y-1">
                          <VesselFieldLabel label="Circ. Radiography (RT)" />
                          <Combobox
                            options={RT_OPTIONS}
                            value={head.circumferentialRadiography ?? "SPOT"}
                            onChange={(val: string) =>
                              updateHead(idx, "circumferentialRadiography", val)
                            }
                            className="h-7 text-xs w-full bg-white dark:bg-black"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* CALCULATED / SUMMARY FOOTER */}
            <VesselNodeFooter>
              <VesselFooterRow
                label="Area / Volume"
                value={`${(d.area_m2 ?? 0).toFixed(2)} m² / ${(d.internalVolume ?? 0).toFixed(3)} m³`}
              />
              <VesselFooterRow
                label="Weld Seams"
                value={`Long: ${heads[0]?.longitudinalWeldSeams ?? 2} | Circ: ${heads[0]?.circumferentialWeldSeams ?? 0}`}
              />
              <VesselFooterRow
                label="Weld Len. / Elect."
                value={`${(d.weldLength_m ?? 0).toFixed(2)} m / ${(d.electrodeWeight_kg ?? 0).toFixed(2)} kg`}
              />
              <VesselFooterRow
                label="Max Elongation"
                value={`${(d.elongation_pct ?? 0).toFixed(1)}%`}
              />
              <VesselFooterHighlight
                label="Total Head Weight"
                value={(d.calculatedWeight ?? 0).toFixed(1)}
                unit="kg"
              />
            </VesselNodeFooter>
          </div>
        )}
      </VesselNodeContainer>
    </>
  );
});

HeadNode.displayName = "HeadNode";
