"use client";

import React, { memo, useState } from "react";
import { type NodeProps, type Node } from "@xyflow/react";
import {
  Trash2,
  Target,
  Plus,
  Minus,
} from "lucide-react";

import { useDiagramStore } from "@/modules/esp-flow/store";
import type { DiagramNodeData, DiagramNodeType } from "@/modules/esp-flow/types";
import type { NozzleNodeData, Nozzle } from "@/modules/vessel-weight/schemas/nozzle.schema";
import { calcNozzleWeight } from "@/modules/vessel-weight/calculations/nozzle.calc";

import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
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

function createNewNozzle(idStr: string): Nozzle {
  return {
    id: idStr,
    nozzleId: `N${idStr}`,
    tag: `N${idStr}`,
    qty: 1,
    service: "INLET",
    size: '24"',
    matGroup: "CS",

    hasBlindFlange: false,
    hasDavitHinge: false,
    davitHingeType: "DAVIT",
    hasInternalDevice: false,
    internalDeviceType: "DEFLECTOR",
    hasInternalPipe: false,
    internalPipeLength: 200,
    internalPipeUnitWeight: 10,
    hasExternalPipe: false,
    externalPipeLength: 500,
    externalPipeUnitWeight: 10,

    hasFlange: true,
    flangeType: "WN",
    flangeRef: "ASME_B16_5",
    flangeForm: "FORGING",
    flangeMaterial: "SA-105",
    flangeClass: "150",
    flangeSch: "STD",
    flangeFace: "RF",
    flangeUnitWeight: 25,
    blindFlangeUnitWeight: 25,

    hasNeck: true,
    neckForm: "PIPE",
    neckType: "SEAMLESS",
    neckMaterial: "SA-106 B",
    neckSch: "STD",
    neckLength: 200,
    neckUnitWeight: 35,
    neckOD: 60.3,
    neckThickness: 3.91,

    hasReinforcement: true,
    reinforcementForm: "PAD",
    reinforcementMaterial: "SA-516 70",
    padOD: 750,
    padID: 615,
    padThk: 12,
    hubThk: 20,
    hubLength: 50,
    taperLength: 25,
    reinforcementUnitWeight: 15,
  };
}

const SERVICE_OPTIONS = [
  { value: "INLET", label: "Inlet" },
  { value: "OUTLET", label: "Outlet" },
  { value: "MANHOLE", label: "Manhole" },
  { value: "HANDHOLE", label: "Handhole" },
  { value: "DRAIN", label: "Drain" },
  { value: "VENT", label: "Vent" },
  { value: "RELIEF_VALVE", label: "Relief Valve (PSV)" },
  { value: "LEVEL_GAUGE", label: "Level Gauge" },
  { value: "PRESSURE_GAUGE", label: "Pressure Gauge" },
  { value: "THERMOWELL", label: "Thermowell (TW)" },
  { value: "SAMPLE", label: "Sample Point" },
  { value: "REFLUX", label: "Reflux" },
  { value: "REBOILER", label: "Reboiler Return" },
  { value: "STEAM_OUT", label: "Steam-out" },
  { value: "UTILITY", label: "Utility" },
];

const SIZE_OPTIONS = [
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
  { value: '30"', label: '30"' },
  { value: '36"', label: '36"' },
];

const FLANGE_TYPES = [
  { value: "WN", label: "Weld Neck (WN)" },
  { value: "LWN", label: "Long Weld Neck (LWN)" },
  { value: "SO", label: "Slip-On (SO)" },
  { value: "BLIND", label: "Blind Flange" },
  { value: "SW", label: "Socket Weld (SW)" },
  { value: "THREADED", label: "Threaded (THD)" },
];

const FLANGE_CLASSES = [
  { value: "150", label: "Class 150#" },
  { value: "300", label: "Class 300#" },
  { value: "600", label: "Class 600#" },
  { value: "900", label: "Class 900#" },
  { value: "1500", label: "Class 1500#" },
];

const FLANGE_FACES = [
  { value: "RF", label: "Raised Face (RF)" },
  { value: "FF", label: "Flat Face (FF)" },
  { value: "RTJ", label: "Ring Type Joint (RTJ)" },
];

const NECK_FORMS = [
  { value: "PIPE", label: "Seamless Pipe" },
  { value: "PLATE", label: "Rolled Plate" },
  { value: "HUB", label: "Forged Hub / Weldolet" },
];

const RT_OPTIONS = [
  { value: "FULL", label: "Full (100%)" },
  { value: "SPOT", label: "Spot" },
  { value: "NONE", label: "None (0%)" },
];

export const NozzleNode = memo(({ id, data, selected }: Props) => {
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

  const d = data as unknown as NozzleNodeData;
  const nozzles =
    d.nozzles && d.nozzles.length > 0
      ? d.nozzles
      : [createNewNozzle("1")];

  const recalculate = (newNozzles: Nozzle[]) => {
    let total = 0;
    const computed = newNozzles.map((nz) => {
      const res = calcNozzleWeight(nz);
      total += (res.totalFabricatedWeight_kg || 0) * (nz.qty || 1);
      return { ...nz, ...res };
    });
    updateNodeData(id, {
      nozzles: computed,
      totalFabricatedWeight: total,
    } as any);
  };

  const updateNz = (index: number, field: keyof Nozzle, value: any) => {
    const newNz = [...nozzles];
    newNz[index] = { ...newNz[index], [field]: value };
    recalculate(newNz);
  };

  const addNozzle = () => {
    const nextId = String(nozzles.length + 1);
    recalculate([...nozzles, createNewNozzle(nextId)]);
  };

  const removeNz = (index: number) => {
    if (nozzles.length > 1) {
      recalculate(nozzles.filter((_, i) => i !== index));
    }
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
          icon={<Target size={18} />}
          title="Nozzles"
          subtitle="Nozzles & Openings"
          badge={
            nozzles.length > 0 ? (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-form-primary/10 text-form-primary border border-form-primary/20">
                {nozzles.length} {nozzles.length === 1 ? "Nozzle" : "Nozzles"}
              </span>
            ) : undefined
          }
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={addNozzle}
              className="h-6 px-2 text-[9px] font-semibold gap-1"
            >
              <Plus size={10} />
              Add Nozzle
            </Button>
          }
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Body Content */}
        {!isCollapsed && (
          <div className="p-3 space-y-3">
            {nozzles.map((nz, idx) => (
              <div
                key={nz.id || idx}
                className="rounded-lg border border-border/80 p-2.5 space-y-2.5 bg-card relative"
              >
                {/* Identification Subheader */}
                <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                  <span className="font-bold text-[11px] text-form-primary">
                    Nozzle {nz.tag || `N${idx + 1}`} ({nz.service || "INLET"})
                  </span>
                  {nozzles.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeNz(idx)}
                      className="h-5 w-5 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={12} />
                    </Button>
                  )}
                </div>

                {/* Row 1: Tag & Quantity */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <VesselFieldLabel label="Tag / Mark" />
                    <Input
                      value={nz.tag ?? ""}
                      onChange={(e) => updateNz(idx, "tag", e.target.value)}
                      placeholder="e.g. N1"
                      className="h-7 text-xs bg-white dark:bg-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <VesselFieldLabel label="Quantity" />
                    <div className="flex items-center h-7 rounded-lg border border-border bg-white dark:bg-black overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          updateNz(idx, "qty", Math.max(1, (nz.qty || 1) - 1))
                        }
                        className="px-2 h-full hover:bg-muted text-muted-foreground transition-colors"
                      >
                        <Minus size={11} />
                      </button>
                      <input
                        type="number"
                        value={nz.qty ?? 1}
                        onChange={(e) =>
                          updateNz(
                            idx,
                            "qty",
                            Math.max(1, Number(e.target.value))
                          )
                        }
                        className="w-full text-center text-xs bg-transparent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateNz(idx, "qty", (nz.qty || 1) + 1)
                        }
                        className="px-2 h-full hover:bg-muted text-muted-foreground transition-colors"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Row 2: Service & Size */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <VesselFieldLabel label="Service" />
                    <Combobox
                      options={SERVICE_OPTIONS}
                      value={nz.service ?? "INLET"}
                      onChange={(val: string) => updateNz(idx, "service", val)}
                      className="h-7 text-xs w-full bg-white dark:bg-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <VesselFieldLabel label="Nominal Size" unit="in" />
                    <Combobox
                      options={SIZE_OPTIONS}
                      value={nz.size ?? '24"'}
                      onChange={(val: string) => updateNz(idx, "size", val)}
                      className="h-7 text-xs w-full bg-white dark:bg-black"
                    />
                  </div>
                </div>

                {/* SECTION: FLANGE */}
                <div className="rounded-lg border border-border/60 p-2 space-y-2 bg-muted/20">
                  <div className="border-b border-border/40 pb-1">
                    <span className="font-bold text-[10px] text-form-primary uppercase tracking-wider">
                      Flange Details
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <VesselFieldLabel label="Flange Type" />
                      <Combobox
                        options={FLANGE_TYPES}
                        value={nz.flangeType ?? "WN"}
                        onChange={(val: string) => updateNz(idx, "flangeType", val)}
                        className="h-7 text-xs w-full bg-white dark:bg-black"
                      />
                    </div>
                    <div className="space-y-1">
                      <VesselFieldLabel label="Flange Standard" />
                      <Input
                        value={nz.flangeRef ?? "ASME B16.5"}
                        onChange={(e) =>
                          updateNz(idx, "flangeRef", e.target.value)
                        }
                        className="h-7 text-xs bg-white dark:bg-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <VesselFieldLabel label="Flange Form" />
                      <Input
                        value={nz.flangeForm ?? "FORGING"}
                        onChange={(e) =>
                          updateNz(idx, "flangeForm", e.target.value)
                        }
                        className="h-7 text-xs bg-white dark:bg-black"
                      />
                    </div>
                    <div className="space-y-1">
                      <VesselFieldLabel label="Flange Material" />
                      <Input
                        value={nz.flangeMaterial ?? "SA-105"}
                        onChange={(e) =>
                          updateNz(idx, "flangeMaterial", e.target.value)
                        }
                        className="h-7 text-xs bg-white dark:bg-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <VesselFieldLabel label="Pressure Class" />
                      <Combobox
                        options={FLANGE_CLASSES}
                        value={nz.flangeClass ?? "150"}
                        onChange={(val: string) => updateNz(idx, "flangeClass", val)}
                        className="h-7 text-xs w-full bg-white dark:bg-black"
                      />
                    </div>
                    <div className="space-y-1">
                      <VesselFieldLabel label="Facing" />
                      <Combobox
                        options={FLANGE_FACES}
                        value={nz.flangeFace ?? "RF"}
                        onChange={(val: string) => updateNz(idx, "flangeFace", val)}
                        className="h-7 text-xs w-full bg-white dark:bg-black"
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-muted-foreground pt-0.5 flex justify-between items-center">
                    <span>Flange Unit Weight:</span>
                    <span className="text-foreground font-bold font-sans">
                      {nz.flangeUnitWeight ?? 25} kg
                    </span>
                  </div>
                </div>

                {/* SECTION: NECK (Checkbox toggle) */}
                <div className="rounded-lg border border-border/60 p-2 space-y-2 bg-muted/20">
                  <div className="flex items-center justify-between border-b border-border/40 pb-1">
                    <span className="font-bold text-[10px] text-form-primary uppercase tracking-wider">
                      Nozzle Neck
                    </span>
                    <Checkbox
                      checked={!!nz.hasNeck}
                      onCheckedChange={(c) => updateNz(idx, "hasNeck", !!c)}
                    />
                  </div>

                  {nz.hasNeck && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <VesselFieldLabel label="Neck Form" />
                          <Combobox
                            options={NECK_FORMS}
                            value={nz.neckForm ?? "PIPE"}
                            onChange={(val: string) => updateNz(idx, "neckForm", val)}
                            className="h-7 text-xs w-full bg-white dark:bg-black"
                          />
                        </div>
                        <div className="space-y-1">
                          <VesselFieldLabel label="Neck Material" />
                          <Input
                            value={nz.neckMaterial ?? "SA-106 B"}
                            onChange={(e) =>
                              updateNz(idx, "neckMaterial", e.target.value)
                            }
                            className="h-7 text-xs bg-white dark:bg-black"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <VesselFieldLabel label="Neck Type" />
                          <Input
                            value={nz.neckType ?? "SEAMLESS"}
                            onChange={(e) =>
                              updateNz(idx, "neckType", e.target.value)
                            }
                            className="h-7 text-xs bg-white dark:bg-black"
                          />
                        </div>
                        <div className="space-y-1">
                          <VesselFieldLabel label="Schedule / Thk." />
                          <Input
                            value={nz.neckSch ?? "STD"}
                            onChange={(e) =>
                              updateNz(idx, "neckSch", e.target.value)
                            }
                            className="h-7 text-xs bg-white dark:bg-black"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <VesselFieldLabel label="Neck Length" unit="mm" />
                          <Input
                            type="number"
                            value={nz.neckLength ?? 200}
                            onChange={(e) =>
                              updateNz(idx, "neckLength", Number(e.target.value))
                            }
                            className="h-7 text-xs bg-white dark:bg-black"
                          />
                        </div>
                        <div className="space-y-1">
                          <VesselFieldLabel label="Neck Unit Weight" unit="kg" />
                          <Input
                            type="number"
                            value={nz.neckUnitWeight ?? 35}
                            onChange={(e) =>
                              updateNz(idx, "neckUnitWeight", Number(e.target.value))
                            }
                            className="h-7 text-xs bg-white dark:bg-black"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION: REINFORCEMENT (Checkbox toggle) */}
                <div className="rounded-lg border border-border/60 p-2 space-y-2 bg-muted/20">
                  <div className="flex items-center justify-between border-b border-border/40 pb-1">
                    <span className="font-bold text-[10px] text-form-primary uppercase tracking-wider">
                      Reinforcement (Pad)
                    </span>
                    <Checkbox
                      checked={!!nz.hasReinforcement}
                      onCheckedChange={(c) =>
                        updateNz(idx, "hasReinforcement", !!c)
                      }
                    />
                  </div>

                  {nz.hasReinforcement && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <VesselFieldLabel label="Form" />
                          <Input
                            value={nz.reinforcementForm ?? "REIN. PAD"}
                            onChange={(e) =>
                              updateNz(idx, "reinforcementForm", e.target.value)
                            }
                            className="h-7 text-xs bg-white dark:bg-black"
                          />
                        </div>
                        <div className="space-y-1">
                          <VesselFieldLabel label="Material" />
                          <Input
                            value={nz.reinforcementMaterial ?? "SA-516 70"}
                            onChange={(e) =>
                              updateNz(
                                idx,
                                "reinforcementMaterial",
                                e.target.value
                              )
                            }
                            className="h-7 text-xs bg-white dark:bg-black"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <VesselFieldLabel label="Pad OD" unit="mm" />
                          <Input
                            type="number"
                            value={nz.padOD ?? 750}
                            onChange={(e) =>
                              updateNz(idx, "padOD", Number(e.target.value))
                            }
                            className="h-7 text-xs bg-white dark:bg-black"
                          />
                        </div>
                        <div className="space-y-1">
                          <VesselFieldLabel label="Pad ID" unit="mm" />
                          <Input
                            type="number"
                            value={nz.padID ?? 615}
                            onChange={(e) =>
                              updateNz(idx, "padID", Number(e.target.value))
                            }
                            className="h-7 text-xs bg-white dark:bg-black"
                          />
                        </div>
                        <div className="space-y-1">
                          <VesselFieldLabel label="Pad Thk." unit="mm" />
                          <Input
                            type="number"
                            value={nz.padThk ?? 12}
                            onChange={(e) =>
                              updateNz(idx, "padThk", Number(e.target.value))
                            }
                            className="h-7 text-xs bg-white dark:bg-black"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION: ACCESSORIES / COMPLETE WITH */}
                <div className="rounded-lg border border-border/60 p-2 space-y-2 bg-muted/20">
                  <div className="flex items-center justify-between border-b border-border/40 pb-1">
                    <span className="font-bold text-[10px] text-form-primary uppercase tracking-wider">
                      Accessories & Mating
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-foreground">
                        <Checkbox
                          checked={!!nz.hasBlindFlange}
                          onCheckedChange={(c) =>
                            updateNz(idx, "hasBlindFlange", !!c)
                          }
                        />
                        <span>Blind Flange</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-foreground">
                        <Checkbox
                          checked={!!nz.hasDavitHinge}
                          onCheckedChange={(c) =>
                            updateNz(idx, "hasDavitHinge", !!c)
                          }
                        />
                        <span>Davit</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-foreground">
                        <Checkbox
                          checked={!!nz.hasInternalDevice}
                          onCheckedChange={(c) =>
                            updateNz(idx, "hasInternalDevice", !!c)
                          }
                        />
                        <span>Deflector</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-border/30">
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-foreground">
                          <Checkbox
                            checked={!!nz.hasInternalPipe}
                            onCheckedChange={(c) =>
                              updateNz(idx, "hasInternalPipe", !!c)
                            }
                          />
                          <span>Internal Pipe</span>
                        </label>
                        {nz.hasInternalPipe && (
                          <div className="grid grid-cols-2 gap-1.5">
                            <Input
                              placeholder="Length (mm)"
                              type="number"
                              value={nz.internalPipeLength ?? 200}
                              onChange={(e) =>
                                updateNz(
                                  idx,
                                  "internalPipeLength",
                                  Number(e.target.value)
                                )
                              }
                              className="h-6 text-xs bg-white dark:bg-black"
                            />
                            <Input
                              placeholder="Weight (kg)"
                              type="number"
                              value={nz.internalPipeUnitWeight ?? 10}
                              onChange={(e) =>
                                updateNz(
                                  idx,
                                  "internalPipeUnitWeight",
                                  Number(e.target.value)
                                )
                              }
                              className="h-6 text-xs bg-white dark:bg-black"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-foreground">
                          <Checkbox
                            checked={!!nz.hasExternalPipe}
                            onCheckedChange={(c) =>
                              updateNz(idx, "hasExternalPipe", !!c)
                            }
                          />
                          <span>External Pipe</span>
                        </label>
                        {nz.hasExternalPipe && (
                          <div className="grid grid-cols-2 gap-1.5">
                            <Input
                              placeholder="Length (mm)"
                              type="number"
                              value={nz.externalPipeLength ?? 500}
                              onChange={(e) =>
                                updateNz(
                                  idx,
                                  "externalPipeLength",
                                  Number(e.target.value)
                                )
                              }
                              className="h-6 text-xs bg-white dark:bg-black"
                            />
                            <Input
                              placeholder="Weight (kg)"
                              type="number"
                              value={nz.externalPipeUnitWeight ?? 10}
                              onChange={(e) =>
                                updateNz(
                                  idx,
                                  "externalPipeUnitWeight",
                                  Number(e.target.value)
                                )
                              }
                              className="h-6 text-xs bg-white dark:bg-black"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Radiography Dropdowns */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="space-y-1">
                    <VesselFieldLabel label="Long. Radiography (RT)" />
                    <Combobox
                      options={RT_OPTIONS}
                      value="SPOT"
                      onChange={() => {}}
                      className="h-7 text-xs w-full bg-white dark:bg-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <VesselFieldLabel label="Circ. Radiography (RT)" />
                    <Combobox
                      options={RT_OPTIONS}
                      value="SPOT"
                      onChange={() => {}}
                      className="h-7 text-xs w-full bg-white dark:bg-black"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* CALCULATED / SUMMARY FOOTER */}
            <VesselNodeFooter>
              <VesselFooterRow
                label="Total Nozzles Count"
                value={`${nozzles.reduce((acc, n) => acc + (n.qty || 1), 0)} pcs`}
              />
              <VesselFooterHighlight
                label="Total Nozzle Weight"
                value={((d.totalFabricatedWeight ?? 60) as number).toFixed(1)}
                unit="kg"
              />
            </VesselNodeFooter>
          </div>
        )}
      </VesselNodeContainer>
    </>
  );
});

NozzleNode.displayName = "NozzleNode";
