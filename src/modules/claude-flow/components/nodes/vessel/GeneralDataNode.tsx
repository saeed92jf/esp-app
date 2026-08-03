"use client";

import React, { memo, useState, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { Position, type NodeProps, type Node, type Edge } from "@xyflow/react";
import {
  ChevronDown,
  Info,
  MoreHorizontal,
  FileSliders,
  Layers,
  Flame,
  Cylinder,
  Disc,
  Target,
  ArrowDownToLine,
  Paperclip,
  Paintbrush,
} from "lucide-react";

import { useDiagramStore } from "@/modules/claude-flow/store";
import type { DiagramNodeData, DiagramEdgeData, DiagramNodeType } from "@/modules/claude-flow/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VesselHandles } from "./VesselHandles";
import {
  VesselNodeContainer,
  VesselNodeToolbar,
  VesselNodeHeader,
  VesselNodeFooter,
  VesselFooterRow,
  VesselSectionHeader,
  VesselFieldLabel,
} from "./VesselNodeBase";

type DiagramNode = Node<DiagramNodeData, DiagramNodeType>;
type Props = NodeProps<DiagramNode>;

// ─── Data Interface ─────────────────────────────────────────────────────────
export interface GeneralData {
  // Section 1: General Data Body
  tagNo?: string;
  qty?: number;
  orientation?: string;
  equipmentType?: string;
  subType?: string;
  service?: string;
  serviceLink?: string;
  special?: string;
  specialDetails?: string;
  jacket?: boolean;

  // Section 2: Operating / Design Data
  operatingTemp_C?: string | number;
  operatingTempDetails?: string;
  designTemp_C?: string | number;
  designTempDetails?: string;
  hydrotestTemp_C?: string | number;
  hydrotestTempDetails?: string;
  mat_C?: string | number;
  matDetails?: string;
  mdmt_C?: string | number;
  mdmtDetails?: string;

  operatingPressure_barg?: string | number;
  operatingPressureDetails?: string;
  designPressure_barg?: string | number;
  designPressureDetails?: string;
  hydrotestPressure_barg?: string | number;
  hydrotestPressureDetails?: string;

  regenerationVacuumSteamout?: boolean;

  // Section 3: Material
  matGroup?: string;
  matSubGroup?: string;
  matSubGroupDetails?: string;
  ca_mm?: string | number;
  selectAllMaterial?: boolean;

  // Section 4: Geometry
  diameter_mm?: string | number;
  tlToTl_mm?: string | number;

  // Geometry Checkboxes
  shellChecked?: boolean;
  headChecked?: boolean;
  nozzleChecked?: boolean;
  supportChecked?: boolean;
  attachmentsChecked?: boolean;
  insulationChecked?: boolean;
  surfacePrepChecked?: boolean;

  // Track child node IDs spawned on canvas
  spawnedNodeIds?: Record<string, string>;

  // Section 5: Others
  mechanicalTest?: boolean;

  [key: string]: unknown;
}

export interface GeneralDataNodeData extends DiagramNodeData {
  generalData?: GeneralData;
}

// ─── Combobox Options ───────────────────────────────────────────────────────
const ORIENTATION_OPTIONS = [
  { value: "Vertical", label: "Vertical" },
  { value: "Horizontal", label: "Horizontal" },
];

const SUB_TYPE_OPTIONS = [
  { value: "2-Phase", label: "2-Phase Separator" },
  { value: "3-Phase", label: "3-Phase Separator" },
  { value: "Scrubber", label: "Gas Scrubber" },
  { value: "RefluxDrum", label: "Reflux Drum" },
  { value: "KnockOutDrum", label: "K.O. Drum" },
  { value: "SurgeDrum", label: "Surge Drum" },
  { value: "Distillation", label: "Distillation Tower" },
  { value: "Absorber", label: "Absorption Column" },
  { value: "General", label: "General Process Vessel" },
];

const SERVICE_OPTIONS = [
  { value: "General", label: "General Hydrocarbon" },
  { value: "Sour", label: "Sour Gas / Wet H2S" },
  { value: "Sweet", label: "Sweet Gas" },
  { value: "Lethal", label: "Lethal Service" },
  { value: "Steam", label: "Steam / Condensate" },
  { value: "Amine", label: "Amine Treating" },
  { value: "Water", label: "Process Water" },
  { value: "Cryogenic", label: "Cryogenic / Low Temp" },
];

const SPECIAL_OPTIONS = [
  { value: "None", label: "None" },
  { value: "NACE_MR0175", label: "NACE MR0175 / ISO 15156" },
  { value: "PWHT", label: "PWHT Required" },
  { value: "Cyclic", label: "Cyclic / Fatigue Service" },
  { value: "LowTemp", label: "Impact Tested / Low Temp" },
  { value: "Cladded", label: "Internal Cladding / CRA" },
  { value: "Refractory", label: "Refractory Lined" },
];

const MAT_GROUP_OPTIONS = [
  { value: "CS", label: "Carbon Steel" },
  { value: "LAS", label: "Low Alloy Steel" },
  { value: "SS_Austenitic", label: "Stainless Steel (Austenitic)" },
  { value: "SS_Duplex", label: "Duplex / Super Duplex" },
  { value: "Nickel", label: "Nickel Alloy (Inconel/Monel)" },
  { value: "Titanium", label: "Titanium / Zirconium" },
  { value: "Clad", label: "Clad Steel Plate" },
];

const MAT_SUB_GROUP_OPTIONS = [
  { value: "SA-516-70", label: "SA-516 Gr. 70" },
  { value: "SA-516-65", label: "SA-516 Gr. 65" },
  { value: "SA-516-60", label: "SA-516 Gr. 60" },
  { value: "SA-240-304L", label: "SA-240 Type 304L" },
  { value: "SA-240-316L", label: "SA-240 Type 316L" },
  { value: "SA-240-321", label: "SA-240 Type 321" },
  { value: "SA-240-2205", label: "SA-240 UNS S31803 (2205)" },
  { value: "SA-387-11", label: "SA-387 Gr. 11 Cl. 2" },
  { value: "SA-387-22", label: "SA-387 Gr. 22 Cl. 2" },
];

// ─── Main Component ─────────────────────────────────────────────────────────
export const GeneralDataNode = memo(({ id, data, selected }: Props) => {
  const [collapsed, setCollapsed] = useState(false);

  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  const duplicateSelected = useDiagramStore((s) => s.duplicateSelected);
  const resetNodesToDefault = useDiagramStore((s) => s.resetNodesToDefault);

  const deleteNode = (nodeId: string) => {
    useDiagramStore.setState((s) => ({
      nodes: s.nodes.filter((n) => n.id !== nodeId),
      edges: s.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }));
  };

  // ─── Read ProjectDataNode items ONLY when there is an edge connecting them ────
  const connectedProjectItems = useDiagramStore(
    useShallow((s) => {
      const connectedPdIds = new Set(
        s.edges
          .filter(
            (e) =>
              (e.source === id || e.target === id) &&
              s.nodes.some(
                (n) =>
                  n.type === "projectDataNode" &&
                  (n.id === e.source || n.id === e.target)
              )
          )
          .flatMap((e) => [e.source, e.target])
      );
      return s.nodes
        .filter((n) => n.type === "projectDataNode" && connectedPdIds.has(n.id))
        .flatMap(
          (n) =>
            ((n.data as any)?.projectData?.items ?? []) as Array<{
              id: string;
              tagNo: string;
              qty: number;
              equipmentType?: string;
              description?: string;
            }>
        );
    })
  );
  const [showTagMenu, setShowTagMenu] = useState(false);

  // ─── Track live node IDs for auto-unchecking ─────────────────────────────────
  const liveNodeIds = useDiagramStore(useShallow((s) => new Set(s.nodes.map((n) => n.id))));

  const d = data as unknown as GeneralDataNodeData;
  const gd: GeneralData = d.generalData || {
    tagNo: "V-101",
    qty: 1,
    orientation: "Vertical",
    equipmentType: "Vessel",
    subType: "2-Phase",
    service: "General",
    special: "None",
    jacket: false,
    operatingTemp_C: 80,
    designTemp_C: 120,
    hydrotestTemp_C: 40,
    mat_C: 20,
    mdmt_C: -29,
    operatingPressure_barg: 15,
    designPressure_barg: 25,
    hydrotestPressure_barg: 37.5,
    regenerationVacuumSteamout: false,
    matGroup: "CS",
    matSubGroup: "SA-516-70",
    ca_mm: 3.0,
    selectAllMaterial: false,
    diameter_mm: 1500,
    tlToTl_mm: 4000,
    shellChecked: false,
    headChecked: false,
    nozzleChecked: false,
    supportChecked: false,
    attachmentsChecked: false,
    insulationChecked: false,
    surfacePrepChecked: false,
    spawnedNodeIds: {},
    mechanicalTest: false,
  };

  const patch = useCallback(
    (p: Partial<GeneralData>) => {
      updateNodeData(id, { generalData: { ...gd, ...p } });
    },
    [id, gd, updateNodeData]
  );

  // ─── Auto-uncheck geometry buttons when their spawned node is removed from canvas
  React.useEffect(() => {
    const spawned = gd.spawnedNodeIds || {};
    const keys = Object.keys(spawned) as Array<keyof typeof spawned>;
    const orphaned = keys.filter((k) => !liveNodeIds.has(spawned[k] as string));
    if (orphaned.length === 0) return;

    const keyToCheckedField: Record<string, keyof GeneralData> = {
      jacket: "jacket",
      regen: "regenerationVacuumSteamout",
      shell: "shellChecked",
      head: "headChecked",
      nozzle: "nozzleChecked",
      support: "supportChecked",
      attachments: "attachmentsChecked",
      insulation: "insulationChecked",
      surfacePrep: "surfacePrepChecked",
    };
    const cleanedSpawned = { ...spawned };
    const patchData: Partial<GeneralData> = { spawnedNodeIds: cleanedSpawned };
    orphaned.forEach((k) => {
      delete cleanedSpawned[k];
      const field = keyToCheckedField[k];
      if (field) (patchData as Record<string, unknown>)[field] = false;
    });
    updateNodeData(id, { generalData: { ...gd, ...patchData } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveNodeIds]);

  // ─── Dynamic Canvas Node Spawning & Linking Handler ─────────────────────────
  const handleGeometryNodeToggle = useCallback(
    (
      key: "jacket" | "regen" | "shell" | "head" | "nozzle" | "support" | "attachments" | "insulation" | "surfacePrep" | string,
      nodeType: DiagramNodeType,
      label: string,
      checkedKey: keyof GeneralData,
      offsetIndex: number
    ) => {
      const isCurrentlyChecked = Boolean(gd[checkedKey]);
      const nextChecked = !isCurrentlyChecked;
      const spawned = { ...(gd.spawnedNodeIds || {}) };

      if (nextChecked) {
        // Spawn and connect node
        const currentStoreNodes = useDiagramStore.getState().nodes;
        const thisNode = currentStoreNodes.find((n) => n.id === id);
        const basePos = thisNode?.position || { x: 100, y: 100 };

        // Position child nodes nicely in a column to the right
        const posX = basePos.x + 480;
        const posY = basePos.y + offsetIndex * 160;

        const childNodeId = `${nodeType}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

        const newNode: Node<DiagramNodeData> = {
          id: childNodeId,
          type: nodeType,
          position: { x: posX, y: posY },
          data: {
            label,
            status: "Linked to " + (gd.tagNo || "General Data"),
          },
        };

        const newEdge: Edge<DiagramEdgeData> = {
          id: `e-${id}-${childNodeId}`,
          source: id,
          target: childNodeId,
          type: "default",
          animated: true,
          data: {
            edgeStyle: "default",
            strokeWidth: 2,
            arrowEnd: true,
          },
        };

        useDiagramStore.setState((s) => ({
          nodes: [...s.nodes, newNode],
          edges: [...s.edges, newEdge],
        }));

        spawned[key] = childNodeId;
        patch({ [checkedKey]: true, spawnedNodeIds: spawned });
      } else {
        // Remove spawned node and its edges
        const childNodeId = spawned[key];
        if (childNodeId) {
          useDiagramStore.setState((s) => ({
            nodes: s.nodes.filter((n) => n.id !== childNodeId),
            edges: s.edges.filter((e) => e.source !== childNodeId && e.target !== childNodeId),
          }));
          delete spawned[key];
        }
        patch({ [checkedKey]: false, spawnedNodeIds: spawned });
      }
    },
    [id, gd, patch]
  );

  const openPrompt = (title: string, currentVal?: string | number, onSave?: (v: string) => void) => {
    const val = window.prompt(title, currentVal != null ? String(currentVal) : "");
    if (val !== null && onSave) {
      onSave(val);
    }
  };

  return (
    <>
      {/* Node Toolbar */}
      <VesselNodeToolbar
        id={id}
        selected={selected}
        toolbarPosition={Position.Top}
        onDuplicate={() => duplicateSelected()}
        onReset={() => resetNodesToDefault([id])}
        onDelete={() => deleteNode(id)}
      />

      {/* Main Node Card */}
      <VesselNodeContainer
        id={id}
        data={data}
        selected={selected}
        dir="ltr"
        widthClass="w-auto min-w-[380px] max-w-[500px]"
        showHandles={true}
      >
        {/* Node Header */}
        <VesselNodeHeader
          icon={<FileSliders size={18} />}
          title="General Data"
          subtitle={gd.tagNo ? `${gd.tagNo} (×${gd.qty || 1})` : "Equipment Specifications"}
          badge={
            gd.tagNo ? (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-form-primary/10 text-form-primary font-semibold border border-form-primary/20">
                {gd.tagNo}
              </span>
            ) : undefined
          }
          isCollapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />

        {!collapsed && (
          <div className="p-3 space-y-3 text-xs min-w-0">
            {/* ════════════════ SECTION 1: GENERAL DATA BODY ════════════════ */}
            <div className="space-y-2 min-w-0">
              {/* Row 1: Tag No. (from ProjectData) & Orientation */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6 space-y-1 min-w-0">
                  <VesselFieldLabel label="Tag No. / Qty" />
                  {connectedProjectItems.length > 0 ? (
                    <div className="relative nodrag w-full min-w-0">
                      <button
                        type="button"
                        onClick={() => setShowTagMenu((v) => !v)}
                        className="h-7 w-full text-xs flex items-center justify-between gap-1 rounded-md border border-input bg-white dark:bg-black px-2 hover:border-form-primary/60 transition-colors"
                      >
                        <span className="truncate font-mono text-form-primary font-semibold">
                          {gd.tagNo || "Select tag…"}
                        </span>
                        {gd.qty != null && (
                          <span className="shrink-0 text-[9px] text-muted-foreground bg-muted rounded px-1">×{gd.qty}</span>
                        )}
                        <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
                      </button>
                      {showTagMenu && (
                        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg text-xs overflow-hidden">
                          {connectedProjectItems.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                patch({
                                  tagNo: item.tagNo,
                                  qty: item.qty,
                                  equipmentType: item.equipmentType || gd.equipmentType,
                                });
                                setShowTagMenu(false);
                              }}
                              className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-form-primary/10 hover:text-form-primary transition-colors"
                            >
                              <span className="font-mono font-bold text-form-primary">{item.tagNo}</span>
                              <span className="text-muted-foreground">×{item.qty}</span>
                              {item.equipmentType && (
                                <span className="ml-auto text-[9px] text-muted-foreground bg-muted px-1 rounded">{item.equipmentType}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-7 flex items-center gap-1 rounded-md border border-dashed border-muted-foreground/40 px-2 text-[10px] text-muted-foreground select-none w-full min-w-0">
                      <Info className="size-3 shrink-0" />
                      <span className="truncate">Connect a Project Data node</span>
                    </div>
                  )}
                </div>

                <div className="col-span-6 space-y-1 min-w-0">
                  <VesselFieldLabel label="Orientation" />
                  <div className="nodrag w-full min-w-0">
                    <Combobox
                      options={ORIENTATION_OPTIONS}
                      value={gd.orientation || "Vertical"}
                      onChange={(v) => patch({ orientation: v })}
                      className="h-7 text-xs w-full min-w-0 bg-white dark:bg-black"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Equipment Type (read-only from tag selection) & Sub-Type */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6 space-y-1 min-w-0">
                  <VesselFieldLabel label="Equipment Type" />
                  <div
                    className="h-7 flex items-center rounded-md border border-input bg-muted/30 dark:bg-muted/10 px-2 text-xs text-muted-foreground font-medium cursor-not-allowed opacity-70 select-none w-full min-w-0"
                    title={gd.equipmentType || "Vessel"}
                  >
                    <span className="truncate">{gd.equipmentType || "Vessel"}</span>
                  </div>
                </div>

                <div className="col-span-6 space-y-1 min-w-0">
                  <VesselFieldLabel label="Sub-Type" />
                  <div className="nodrag w-full min-w-0">
                    <Combobox
                      options={SUB_TYPE_OPTIONS}
                      value={gd.subType || "2-Phase"}
                      onChange={(v) => patch({ subType: v })}
                      className="h-7 text-xs w-full min-w-0 bg-white dark:bg-black"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Service (with Info outside) & Special (with three-dots outside) */}
              <div className="grid grid-cols-12 gap-2">
                {/* SERVICE */}
                <div className="col-span-6 space-y-1 min-w-0">
                  <VesselFieldLabel label="Service" />
                  <div className="flex items-center gap-1 nodrag w-full min-w-0">
                    <div className="flex-1 min-w-0">
                      <Combobox
                        options={SERVICE_OPTIONS}
                        value={gd.service || "General"}
                        onChange={(v) => patch({ service: v })}
                        className="h-7 text-xs w-full min-w-0 bg-white dark:bg-black"
                      />
                    </div>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              openPrompt(
                                "Service documentation or link URL:",
                                gd.serviceLink,
                                (val) => patch({ serviceLink: val })
                              )
                            }
                            className="size-7 rounded-[calc(var(--radius)-2px)] p-0 text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                          >
                            <Info className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs z-50">
                          {gd.serviceLink ? `Link: ${gd.serviceLink}` : "Service details / link"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* SPECIAL */}
                <div className="col-span-6 space-y-1 min-w-0">
                  <VesselFieldLabel label="Special" />
                  <div className="flex items-center gap-1 nodrag w-full min-w-0">
                    <div className="flex-1 min-w-0">
                      <Combobox
                        options={SPECIAL_OPTIONS}
                        value={gd.special || "None"}
                        onChange={(v) => patch({ special: v })}
                        className="h-7 text-xs w-full min-w-0 bg-white dark:bg-black"
                      />
                    </div>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              openPrompt(
                                "Special requirements / notes:",
                                gd.specialDetails,
                                (val) => patch({ specialDetails: val })
                              )
                            }
                            className="size-7 rounded-[calc(var(--radius)-2px)] p-0 text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                          >
                            <MoreHorizontal className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs z-50">
                          {gd.specialDetails || "Special requirements & notes"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>

              {/* Row 4: JACKET Checkbox */}
              <div className="flex gap-2 pt-1">
                <div
                  onClick={() => handleGeometryNodeToggle("jacket", "jacketNode", "Jacket", "jacket", 0)}
                  className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border cursor-pointer select-none transition-colors ${
                    gd.jacket
                      ? "bg-form-primary/10 border-form-primary text-form-primary font-bold shadow-sm"
                      : "bg-card border-border hover:border-form-primary/50 text-foreground"
                  }`}
                >
                  <div className={`flex items-center justify-center size-4 rounded border ${gd.jacket ? "border-form-primary bg-form-primary/20 text-form-primary" : "border-border bg-muted/20 text-muted-foreground"}`}>
                    <Layers size={11} />
                  </div>
                  <span className="text-xs font-semibold whitespace-nowrap">Jacket</span>
                </div>
              </div>
            </div>

            {/* ════════════════ SECTION 2: OPERATING/DESIGN DATA ════════════════ */}
            <div className="pt-2 border-t border-border space-y-2 min-w-0">
              <VesselSectionHeader title="Operating & Design Data" />

              <div className="grid grid-cols-12 gap-3 divide-x divide-border">
                {/* Left Column: Temperatures */}
                <div className="col-span-6 space-y-1.5 pe-1 min-w-0">
                  {/* Operating Temp */}
                  <div className="space-y-0.5 min-w-0">
                    <VesselFieldLabel label="Operating Temp" unit="°C" />
                    <div className="flex items-center gap-1 w-full min-w-0">
                      <Input
                        type="number"
                        value={gd.operatingTemp_C ?? ""}
                        onChange={(e) => patch({ operatingTemp_C: e.target.value })}
                        placeholder="80"
                        className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                        onClick={() => openPrompt("Operating Temp Details:", gd.operatingTempDetails, (v) => patch({ operatingTempDetails: v }))}
                      >
                        <MoreHorizontal className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Design Temp */}
                  <div className="space-y-0.5 min-w-0">
                    <VesselFieldLabel label="Design Temp" unit="°C" />
                    <div className="flex items-center gap-1 w-full min-w-0">
                      <Input
                        type="number"
                        value={gd.designTemp_C ?? ""}
                        onChange={(e) => patch({ designTemp_C: e.target.value })}
                        placeholder="120"
                        className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                        onClick={() => openPrompt("Design Temp Details:", gd.designTempDetails, (v) => patch({ designTempDetails: v }))}
                      >
                        <MoreHorizontal className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Hydrotest Temp */}
                  <div className="space-y-0.5 min-w-0">
                    <VesselFieldLabel label="Hydrotest Temp" unit="°C" />
                    <div className="flex items-center gap-1 w-full min-w-0">
                      <Input
                        type="number"
                        value={gd.hydrotestTemp_C ?? ""}
                        onChange={(e) => patch({ hydrotestTemp_C: e.target.value })}
                        placeholder="40"
                        className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                        onClick={() => openPrompt("Hydrotest Temp Details:", gd.hydrotestTempDetails, (v) => patch({ hydrotestTempDetails: v }))}
                      >
                        <MoreHorizontal className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* M.A.T */}
                  <div className="space-y-0.5 min-w-0">
                    <VesselFieldLabel label="M.A.T" unit="°C" />
                    <div className="flex items-center gap-1 w-full min-w-0">
                      <Input
                        type="number"
                        value={gd.mat_C ?? ""}
                        onChange={(e) => patch({ mat_C: e.target.value })}
                        placeholder="20"
                        className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                        onClick={() => openPrompt("M.A.T Details:", gd.matDetails, (v) => patch({ matDetails: v }))}
                      >
                        <MoreHorizontal className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* M.D.M.T */}
                  <div className="space-y-0.5 min-w-0">
                    <VesselFieldLabel label="M.D.M.T" unit="°C" />
                    <div className="flex items-center gap-1 w-full min-w-0">
                      <Input
                        type="number"
                        value={gd.mdmt_C ?? ""}
                        onChange={(e) => patch({ mdmt_C: e.target.value })}
                        placeholder="-29"
                        className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                        onClick={() => openPrompt("M.D.M.T Details:", gd.mdmtDetails, (v) => patch({ mdmtDetails: v }))}
                      >
                        <MoreHorizontal className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Pressures */}
                <div className="col-span-6 space-y-1.5 ps-3 min-w-0">
                  {/* Operating Pressure */}
                  <div className="space-y-0.5 min-w-0">
                    <VesselFieldLabel label="Operating Press." unit="barg" />
                    <div className="flex items-center gap-1 w-full min-w-0">
                      <Input
                        type="number"
                        value={gd.operatingPressure_barg ?? ""}
                        onChange={(e) => patch({ operatingPressure_barg: e.target.value })}
                        placeholder="15"
                        className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                        onClick={() => openPrompt("Operating Pressure Details:", gd.operatingPressureDetails, (v) => patch({ operatingPressureDetails: v }))}
                      >
                        <MoreHorizontal className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Design Pressure */}
                  <div className="space-y-0.5 min-w-0">
                    <VesselFieldLabel label="Design Press." unit="barg" />
                    <div className="flex items-center gap-1 w-full min-w-0">
                      <Input
                        type="number"
                        value={gd.designPressure_barg ?? ""}
                        onChange={(e) => patch({ designPressure_barg: e.target.value })}
                        placeholder="25"
                        className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                        onClick={() => openPrompt("Design Pressure Details:", gd.designPressureDetails, (v) => patch({ designPressureDetails: v }))}
                      >
                        <MoreHorizontal className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Hydrotest Pressure */}
                  <div className="space-y-0.5 min-w-0">
                    <VesselFieldLabel label="Hydrotest Press." unit="barg" />
                    <div className="flex items-center gap-1 w-full min-w-0">
                      <Input
                        type="number"
                        value={gd.hydrotestPressure_barg ?? ""}
                        onChange={(e) => patch({ hydrotestPressure_barg: e.target.value })}
                        placeholder="37.5"
                        className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                        onClick={() => openPrompt("Hydrotest Pressure Details:", gd.hydrotestPressureDetails, (v) => patch({ hydrotestPressureDetails: v }))}
                      >
                        <MoreHorizontal className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row: REGENERATION/VACUUM/STEAMOUT */}
              <div className="flex gap-2 pt-1">
                <div
                  onClick={() =>
                    handleGeometryNodeToggle(
                      "regen",
                      "regenVacuumSteamoutNode",
                      "Regen / Vacuum / Steam Out",
                      "regenerationVacuumSteamout",
                      1
                    )
                  }
                  className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border cursor-pointer select-none transition-colors ${
                    gd.regenerationVacuumSteamout
                      ? "bg-form-primary/10 border-form-primary text-form-primary font-bold shadow-sm"
                      : "bg-card border-border hover:border-form-primary/50 text-foreground"
                  }`}
                >
                  <div className={`flex items-center justify-center size-4 rounded border ${gd.regenerationVacuumSteamout ? "border-form-primary bg-form-primary/20 text-form-primary" : "border-border bg-muted/20 text-muted-foreground"}`}>
                    <Flame size={11} />
                  </div>
                  <span className="text-xs font-semibold whitespace-nowrap">
                    Regen / Vacuum / Steam-out
                  </span>
                </div>
              </div>
            </div>

            {/* ════════════════ SECTION 3: MATERIAL ════════════════ */}
            <div className="pt-2 border-t border-border space-y-2 min-w-0">
              <VesselSectionHeader title="Material Specification" />

              {/* Mat Group & Sub-Group */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6 space-y-1 min-w-0">
                  <VesselFieldLabel label="Material Group" />
                  <div className="nodrag w-full min-w-0">
                    <Combobox
                      options={MAT_GROUP_OPTIONS}
                      value={gd.matGroup || "CS"}
                      onChange={(v) => patch({ matGroup: v })}
                      className="h-7 text-xs w-full min-w-0 bg-white dark:bg-black"
                    />
                  </div>
                </div>

                <div className="col-span-6 space-y-1 min-w-0">
                  <VesselFieldLabel label="Sub-Group / Grade" />
                  <div className="flex items-center gap-1 w-full min-w-0">
                    <div className="nodrag flex-1 min-w-0">
                      <Combobox
                        options={MAT_SUB_GROUP_OPTIONS}
                        value={gd.matSubGroup || "SA-516-70"}
                        onChange={(v) => patch({ matSubGroup: v })}
                        className="h-7 text-xs w-full min-w-0 bg-white dark:bg-black"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => openPrompt("Material Sub-Group Details / Spec:", gd.matSubGroupDetails, (v) => patch({ matSubGroupDetails: v }))}
                      className="size-7 rounded-[calc(var(--radius)-2px)] p-0 text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                    >
                      <MoreHorizontal className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* C.A. & SELECT ALL MATERIAL */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5 space-y-1 min-w-0">
                  <VesselFieldLabel label="Corrosion Allow." unit="mm" />
                  <Input
                    type="number"
                    step={0.5}
                    value={gd.ca_mm ?? ""}
                    onChange={(e) => patch({ ca_mm: e.target.value })}
                    placeholder="3.0"
                    className="h-7 text-xs bg-white dark:bg-black w-full min-w-0"
                  />
                </div>

                <div className="col-span-7 flex items-center gap-2 pt-4 min-w-0">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-foreground">
                    <Checkbox
                      id={`select-all-mat-${id}`}
                      checked={!!gd.selectAllMaterial}
                      onCheckedChange={(c) => patch({ selectAllMaterial: !!c })}
                    />
                    <span className="truncate">Select All Material</span>
                  </label>
                </div>
              </div>
            </div>

            {/* ════════════════ SECTION 4: GEOMETRY ════════════════ */}
            <div className="pt-2 border-t border-border space-y-2.5 min-w-0">
              <VesselSectionHeader title="Geometry & Components" />

              {/* Diameter & T.L. TO T.L. */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6 space-y-1 min-w-0">
                  <VesselFieldLabel label="Diameter" unit="mm" />
                  <Input
                    type="number"
                    value={gd.diameter_mm ?? ""}
                    onChange={(e) => patch({ diameter_mm: e.target.value })}
                    placeholder="1500"
                    className="h-7 text-xs bg-white dark:bg-black w-full min-w-0"
                  />
                </div>

                <div className="col-span-6 space-y-1 min-w-0">
                  <VesselFieldLabel label="T.L. to T.L." unit="mm" />
                  <Input
                    type="number"
                    value={gd.tlToTl_mm ?? ""}
                    onChange={(e) => patch({ tlToTl_mm: e.target.value })}
                    placeholder="4000"
                    className="h-7 text-xs bg-white dark:bg-black w-full min-w-0"
                  />
                </div>
              </div>

              {/* Geometry Nodes (Canvas Spawn & Link) */}
              <div className="space-y-2 pt-1 min-w-0">
                {/* Row 1 of Geometry Checkboxes: SHELL, HEAD, NOZZLE, SUPPORT */}
                <div className="grid grid-cols-4 gap-1.5">
                  {/* SHELL */}
                  <div
                    onClick={() => handleGeometryNodeToggle("shell", "shellNode", "Shell Section", "shellChecked", 0)}
                    className={`flex items-center gap-1.5 p-1.5 rounded-md border cursor-pointer select-none transition-colors ${
                      gd.shellChecked
                        ? "bg-form-primary/10 border-form-primary text-form-primary font-bold shadow-sm"
                        : "bg-card border-border hover:border-form-primary/50 text-foreground"
                    }`}
                  >
                    <div className={`flex items-center justify-center size-4 rounded shrink-0 ${gd.shellChecked ? "text-form-primary" : "text-muted-foreground"}`}>
                      <Cylinder size={12} />
                    </div>
                    <span className="text-[10px] truncate font-medium">Shell</span>
                  </div>

                  {/* HEAD */}
                  <div
                    onClick={() => handleGeometryNodeToggle("head", "headNode", "Vessel Head", "headChecked", 1)}
                    className={`flex items-center gap-1.5 p-1.5 rounded-md border cursor-pointer select-none transition-colors ${
                      gd.headChecked
                        ? "bg-form-primary/10 border-form-primary text-form-primary font-bold shadow-sm"
                        : "bg-card border-border hover:border-form-primary/50 text-foreground"
                    }`}
                  >
                    <div className={`flex items-center justify-center size-4 rounded shrink-0 ${gd.headChecked ? "text-form-primary" : "text-muted-foreground"}`}>
                      <Disc size={12} />
                    </div>
                    <span className="text-[10px] truncate font-medium">Head</span>
                  </div>

                  {/* NOZZLE */}
                  <div
                    onClick={() => handleGeometryNodeToggle("nozzle", "nozzleNode", "Nozzle Component", "nozzleChecked", 2)}
                    className={`flex items-center gap-1.5 p-1.5 rounded-md border cursor-pointer select-none transition-colors ${
                      gd.nozzleChecked
                        ? "bg-form-primary/10 border-form-primary text-form-primary font-bold shadow-sm"
                        : "bg-card border-border hover:border-form-primary/50 text-foreground"
                    }`}
                  >
                    <div className={`flex items-center justify-center size-4 rounded shrink-0 ${gd.nozzleChecked ? "text-form-primary" : "text-muted-foreground"}`}>
                      <Target size={12} />
                    </div>
                    <span className="text-[10px] truncate font-medium">Nozzle</span>
                  </div>

                  {/* SUPPORT */}
                  <div
                    onClick={() => handleGeometryNodeToggle("support", "supportNode", "Vessel Support", "supportChecked", 3)}
                    className={`flex items-center gap-1.5 p-1.5 rounded-md border cursor-pointer select-none transition-colors ${
                      gd.supportChecked
                        ? "bg-form-primary/10 border-form-primary text-form-primary font-bold shadow-sm"
                        : "bg-card border-border hover:border-form-primary/50 text-foreground"
                    }`}
                  >
                    <div className={`flex items-center justify-center size-4 rounded shrink-0 ${gd.supportChecked ? "text-form-primary" : "text-muted-foreground"}`}>
                      <ArrowDownToLine size={12} />
                    </div>
                    <span className="text-[10px] truncate font-medium">Support</span>
                  </div>
                </div>

                {/* Row 2 of Geometry Checkboxes: ATTACHMENTS, INSULATION, SURFACE PREP */}
                <div className="grid grid-cols-12 gap-1.5">
                  {/* ATTACHMENTS */}
                  <div
                    onClick={() => handleGeometryNodeToggle("attachments", "attachmentsNode", "Vessel Attachments", "attachmentsChecked", 4)}
                    className={`col-span-4 flex items-center gap-1.5 p-1.5 rounded-md border cursor-pointer select-none transition-colors ${
                      gd.attachmentsChecked
                        ? "bg-form-primary/10 border-form-primary text-form-primary font-bold shadow-sm"
                        : "bg-card border-border hover:border-form-primary/50 text-foreground"
                    }`}
                  >
                    <div className={`flex items-center justify-center size-4 rounded shrink-0 ${gd.attachmentsChecked ? "text-form-primary" : "text-muted-foreground"}`}>
                      <Paperclip size={12} />
                    </div>
                    <span className="text-[10px] truncate font-medium">Attachments</span>
                  </div>

                  {/* INSULATION / FIRE PROOF */}
                  <div
                    onClick={() => handleGeometryNodeToggle("insulation", "internalsNode", "Insulation & Fireproofing", "insulationChecked", 5)}
                    className={`col-span-4 flex items-center gap-1.5 p-1.5 rounded-md border cursor-pointer select-none transition-colors ${
                      gd.insulationChecked
                        ? "bg-form-primary/10 border-form-primary text-form-primary font-bold shadow-sm"
                        : "bg-card border-border hover:border-form-primary/50 text-foreground"
                    }`}
                  >
                    <div className={`flex items-center justify-center size-4 rounded shrink-0 ${gd.insulationChecked ? "text-form-primary" : "text-muted-foreground"}`}>
                      <Layers size={12} />
                    </div>
                    <span className="text-[10px] truncate font-medium">Insulation</span>
                  </div>

                  {/* Surface Preparation */}
                  <div
                    onClick={() =>
                      handleGeometryNodeToggle(
                        "surfacePrep",
                        "surfacePrepNode",
                        "Surface Preparation",
                        "surfacePrepChecked",
                        6
                      )
                    }
                    className={`col-span-4 flex items-center gap-1.5 p-1.5 rounded-md border cursor-pointer select-none transition-colors ${
                      gd.surfacePrepChecked
                        ? "bg-form-primary/10 border-form-primary text-form-primary font-bold shadow-sm"
                        : "bg-card border-border hover:border-form-primary/50 text-foreground"
                    }`}
                  >
                    <div className={`flex items-center justify-center size-4 rounded shrink-0 ${gd.surfacePrepChecked ? "text-form-primary" : "text-muted-foreground"}`}>
                      <Paintbrush size={12} />
                    </div>
                    <span className="text-[10px] truncate font-medium">Surface Prep.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ════════════════ SECTION 5: OTHERS ════════════════ */}
            <div className="pt-2 border-t border-border space-y-2 min-w-0">
              <VesselSectionHeader title="Others" />

              <div className="flex items-center gap-2 pt-0.5 min-w-0">
                <label
                  htmlFor={`mech-test-${id}`}
                  className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none text-foreground"
                >
                  <Checkbox
                    id={`mech-test-${id}`}
                    checked={!!gd.mechanicalTest}
                    onCheckedChange={(c) => patch({ mechanicalTest: !!c })}
                  />
                  <span>Mechanical Test</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <VesselNodeFooter>
          <VesselFooterRow
            label="Tag / Equipment"
            value={`${gd.tagNo || "—"} (${gd.equipmentType || "Vessel"})`}
          />
          <VesselFooterRow
            label="Design Conditions"
            value={`${gd.designPressure_barg ?? "—"} barg / ${gd.designTemp_C ?? "—"} °C`}
          />
        </VesselNodeFooter>
      </VesselNodeContainer>
    </>
  );
});

GeneralDataNode.displayName = "GeneralDataNode";
