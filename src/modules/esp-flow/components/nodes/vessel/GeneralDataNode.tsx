"use client";

import React, { memo, useState, useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { Position, type NodeProps, type Node, type Edge } from "@xyflow/react";
import {
  ChevronDown,
  ChevronUp,
  Info,
  MoreHorizontal,
  Plus,
  FileSliders,
  Layers,
  Flame,
  Cylinder,
  Disc,
  Target,
  ArrowDownToLine,
  Paperclip,
  Paintbrush,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useDiagramStore } from "@/modules/esp-flow/store";
import type { DiagramNodeData, DiagramEdgeData, DiagramNodeType } from "@/modules/esp-flow/types";
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

  // Section 2: Operating / Design Data
  jacket?: boolean;

  // Condition 1 / Standard Operating & Design Data (Shell / Internal)
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
  externalPressure_barg?: string | number;
  externalPressureDetails?: string;

  // Condition 2 (Jacket Chamber) Operating & Design Data
  jacketOperatingTemp_C?: string | number;
  jacketOperatingTempDetails?: string;
  jacketDesignTemp_C?: string | number;
  jacketDesignTempDetails?: string;
  jacketHydrotestTemp_C?: string | number;
  jacketHydrotestTempDetails?: string;
  jacketMat_C?: string | number;
  jacketMatDetails?: string;
  jacketMdmt_C?: string | number;
  jacketMdmtDetails?: string;

  jacketOperatingPressure_barg?: string | number;
  jacketOperatingPressureDetails?: string;
  jacketDesignPressure_barg?: string | number;
  jacketDesignPressureDetails?: string;
  jacketHydrotestPressure_barg?: string | number;
  jacketHydrotestPressureDetails?: string;

  // Regen / Vacuum / Steam Out Section
  regenerationVacuumSteamout?: boolean;
  steamOutEnabled?: boolean;
  steamOutPressure_barg?: string | number;
  steamOutPressureDetails?: string;
  steamOutTemp_C?: string | number;
  steamOutTempDetails?: string;

  vacuumEnabled?: boolean;
  vacuumPressure_barg?: string | number;
  vacuumPressureDetails?: string;
  vacuumTemp_C?: string | number;
  vacuumTempDetails?: string;

  regenEnabled?: boolean;
  regenTemp_C?: string | number;
  regenTempDetails?: string;
  regenPressure_barg?: string | number;
  regenPressureDetails?: string;

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

export const MAT_GROUP_OPTIONS = [
  { value: "CS", label: "Carbon Steel" },
  { value: "LTCS", label: "Low Temp Carbon Steel (LTCS)" },
  { value: "LAS", label: "Low Alloy Steel (Cr-Mo)" },
  { value: "SS_Austenitic", label: "Stainless Steel (Austenitic)" },
  { value: "SS_Duplex", label: "Duplex / Super Duplex" },
  { value: "Nickel", label: "Nickel Alloy (Inconel/Monel)" },
  { value: "Clad", label: "Clad Steel Plate" },
];

export const MAT_SUB_GROUP_MAP: Record<string, Array<{ value: string; label: string }>> = {
  CS: [
    { value: "LowCarbon", label: "Low Carbon Steel" },
    { value: "SA-516-70", label: "Medium Carbon (SA-516 Gr. 70)" },
    { value: "SA-516-65", label: "Medium Carbon (SA-516 Gr. 65)" },
    { value: "SA-516-60", label: "Medium Carbon (SA-516 Gr. 60)" },
    { value: "KilledCS", label: "Fully Killed Carbon Steel" },
    { value: "HIC_CS", label: "HIC Resistant Carbon Steel" },
  ],
  LTCS: [
    { value: "LTCS_SA516", label: "SA-516 Gr. 60 (Impact @ -46°C)" },
    { value: "LTCS_SA333", label: "SA-333 Gr. 6 / SA-350 LF2" },
  ],
  LAS: [
    { value: "SA-387-11", label: "1.25Cr-0.5Mo (SA-387 Gr. 11 Cl. 2)" },
    { value: "SA-387-22", label: "2.25Cr-1Mo (SA-387 Gr. 22 Cl. 2)" },
    { value: "SA-387-5", label: "5Cr-0.5Mo (SA-387 Gr. 5 Cl. 2)" },
  ],
  SS_Austenitic: [
    { value: "SA-240-304L", label: "SS 304 / 304L (SA-240 304L)" },
    { value: "SA-240-316L", label: "SS 316 / 316L (SA-240 316L)" },
    { value: "SA-240-321", label: "SS 321 (High Temp Ti-Stab)" },
    { value: "SA-240-347", label: "SS 347 (Niobium Stabilized)" },
  ],
  SS_Duplex: [
    { value: "SA-240-2205", label: "2205 Duplex (UNS S31803 / S32205)" },
    { value: "SA-240-2507", label: "2507 Super Duplex (UNS S32750)" },
  ],
  Nickel: [
    { value: "Inconel-625", label: "Inconel 625 (UNS N06625)" },
    { value: "Incoloy-825", label: "Incoloy 825 (UNS N08825)" },
    { value: "Monel-400", label: "Monel 400 (UNS N04400)" },
  ],
  Clad: [
    { value: "CS-SS316L-Clad", label: "Carbon Steel + SS 316L Clad" },
    { value: "CS-Inconel625-Clad", label: "Carbon Steel + Inconel 625 Clad" },
  ],
};

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
  const [isOperatingCollapsed, setIsOperatingCollapsed] = useState(false);
  const [isMaterialCollapsed, setIsMaterialCollapsed] = useState(false);
  const [isGeometryCollapsed, setIsGeometryCollapsed] = useState(false);
  const [isOthersCollapsed, setIsOthersCollapsed] = useState(false);

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
    externalPressure_barg: 1.0,

    jacketOperatingTemp_C: 120,
    jacketDesignTemp_C: 150,
    jacketHydrotestTemp_C: 20,
    jacketMat_C: 100,
    jacketMdmt_C: -20,
    jacketOperatingPressure_barg: 4.0,
    jacketDesignPressure_barg: 6.0,
    jacketHydrotestPressure_barg: 9.0,

    regenerationVacuumSteamout: false,
    steamOutEnabled: true,
    steamOutPressure_barg: 1.5,
    steamOutPressureDetails: "",
    steamOutTemp_C: 120,
    steamOutTempDetails: "",
    vacuumEnabled: false,
    vacuumPressure_barg: -1.0,
    vacuumPressureDetails: "",
    vacuumTemp_C: 50,
    vacuumTempDetails: "",
    regenEnabled: false,
    regenTemp_C: 250,
    regenTempDetails: "",
    regenPressure_barg: 3.0,
    regenPressureDetails: "",

    matGroup: "CS",
    matSubGroup: "LowCarbon",
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

  const serviceOptions = useMemo(() => {
    const currentService = gd.service || "General";
    if (!SERVICE_OPTIONS.some((o) => o.value === currentService)) {
      return [...SERVICE_OPTIONS, { value: currentService, label: currentService }];
    }
    return SERVICE_OPTIONS;
  }, [gd.service]);

  const currentSubGroupOptions = useMemo(() => {
    const group = gd.matGroup || "CS";
    const baseList = MAT_SUB_GROUP_MAP[group] || MAT_SUB_GROUP_MAP["CS"] || [];
    if (gd.matSubGroup && !baseList.some((opt) => opt.value === gd.matSubGroup)) {
      return [{ value: gd.matSubGroup, label: gd.matSubGroup }, ...baseList];
    }
    return baseList;
  }, [gd.matGroup, gd.matSubGroup]);

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
      shell: "shellChecked",
      head: "headChecked",
      nozzle: "nozzleChecked",
      support: "supportChecked",
      attachments: "attachmentsChecked",
      insulation: "insulationChecked",
      surfacePrep: "surfacePrepChecked",
      materialList: "selectAllMaterial",
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
      key: "shell" | "head" | "nozzle" | "support" | "attachments" | "insulation" | "surfacePrep" | string,
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
              <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-form-primary/10 text-form-primary font-semibold border border-form-primary/20">
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
                        <span className="truncate font-sans text-form-primary font-semibold">
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
                              <span className="font-sans font-bold text-form-primary">{item.tagNo}</span>
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
                        options={serviceOptions}
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
                                "Enter Custom Service:",
                                gd.service || "",
                                (val) => {
                                  if (val && val.trim()) {
                                    patch({ service: val.trim() });
                                  }
                                }
                              )
                            }
                            className="size-7 rounded-[calc(var(--radius)-2px)] p-0 text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                          >
                            <Plus className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs z-50">
                          {gd.service ? `Current: ${gd.service} (Click to set custom)` : "Add custom service"}
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
            </div>

            {/* ════════════════ SECTION 2: OPERATING/DESIGN DATA ════════════════ */}
            <div className="pt-2 border-t border-border space-y-2 min-w-0">
              <VesselSectionHeader
                title="Operating & Design Data"
                isCollapsed={isOperatingCollapsed}
                onToggleCollapse={() => setIsOperatingCollapsed(!isOperatingCollapsed)}
              />

              {!isOperatingCollapsed && (
                <div className="space-y-3 min-w-0 pt-0.5">
                  {/* Two Symmetrical Check Items under Group Title */}
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`flex items-center gap-2 p-1.5 rounded-md border cursor-pointer select-none transition-colors ${
                      gd.jacket
                        ? "bg-form-primary/10 border-form-primary text-form-primary font-bold shadow-sm"
                        : "bg-card border-border hover:border-form-primary/50 text-foreground"
                    }`}>
                      <Checkbox
                        checked={!!gd.jacket}
                        onCheckedChange={(c) => patch({ jacket: !!c })}
                        className="size-3.5 data-[state=checked]:bg-form-primary data-[state=checked]:border-form-primary"
                      />
                      <Layers size={12} className={gd.jacket ? "text-form-primary" : "text-muted-foreground"} />
                      <span className="text-[11px] font-medium truncate">Jacket</span>
                    </label>

                    <label className={`flex items-center gap-2 p-1.5 rounded-md border cursor-pointer select-none transition-colors ${
                      gd.regenerationVacuumSteamout
                        ? "bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400 font-bold shadow-sm"
                        : "bg-card border-border hover:border-orange-500/50 text-foreground"
                    }`}>
                      <Checkbox
                        checked={!!gd.regenerationVacuumSteamout}
                        onCheckedChange={(c) => patch({ regenerationVacuumSteamout: !!c })}
                        className="size-3.5 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                      />
                      <Flame size={12} className={gd.regenerationVacuumSteamout ? "text-orange-500" : "text-muted-foreground"} />
                      <span className="text-[11px] font-medium truncate">Regen / Vac / Steam</span>
                    </label>
                  </div>
                  {!gd.jacket ? (
                    /* ─── Standard Single-Chamber Operating Data ─── */
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
                  ) : (
                    /* ─── Dual-Chamber Operating Data (Jacket Active) ─── */
                    <div className="space-y-2.5 min-w-0">
                      {/* Condition 1: Main Shell / Chamber */}
                      <div className="rounded-lg border border-sky-200/80 dark:border-sky-900/60 p-2.5 space-y-2 bg-sky-50/20 dark:bg-sky-950/20">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-sky-900 dark:text-sky-200 flex items-center gap-1.5 pb-1 border-b border-sky-200/60 dark:border-sky-800/40">
                          <div className="size-2 rounded-full bg-form-primary" />
                          <span>Condition 1 (Main Shell / Chamber)</span>
                        </div>
                        <div className="grid grid-cols-12 gap-3 divide-x divide-border">
                          {/* Left Column (Temperatures) */}
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

                          {/* Right Column (Pressures) */}
                          <div className="col-span-6 space-y-1.5 ps-3 min-w-0">
                            {/* Operating Press. */}
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

                            {/* Design Press. */}
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

                            {/* Hydrotest Press. */}
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

                            {/* External Press. */}
                            <div className="space-y-0.5 min-w-0">
                              <VesselFieldLabel label="External Press." unit="barg" />
                              <div className="flex items-center gap-1 w-full min-w-0">
                                <Input
                                  type="number"
                                  value={gd.externalPressure_barg ?? ""}
                                  onChange={(e) => patch({ externalPressure_barg: e.target.value })}
                                  placeholder="1.0"
                                  className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                                  onClick={() => openPrompt("External Pressure Details:", gd.externalPressureDetails, (v) => patch({ externalPressureDetails: v }))}
                                >
                                  <MoreHorizontal className="size-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Condition 2: Jacket / Thermal Chamber */}
                      <div className="rounded-lg border border-amber-500/40 dark:border-amber-500/30 p-2.5 space-y-2 bg-amber-500/5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5 pb-1 border-b border-amber-500/20">
                          <Layers size={12} className="text-amber-600 dark:text-amber-400" />
                          <span>Condition 2 (Jacket Chamber)</span>
                        </div>
                        <div className="grid grid-cols-12 gap-3 divide-x divide-border">
                          {/* Left Column (Temperatures) */}
                          <div className="col-span-6 space-y-1.5 pe-1 min-w-0">
                            {/* Operating Temp */}
                            <div className="space-y-0.5 min-w-0">
                              <VesselFieldLabel label="Operating Temp" unit="°C" />
                              <div className="flex items-center gap-1 w-full min-w-0">
                                <Input
                                  type="number"
                                  value={gd.jacketOperatingTemp_C ?? ""}
                                  onChange={(e) => patch({ jacketOperatingTemp_C: e.target.value })}
                                  placeholder="120"
                                  className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                                  onClick={() => openPrompt("Jacket Operating Temp Details:", gd.jacketOperatingTempDetails, (v) => patch({ jacketOperatingTempDetails: v }))}
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
                                  value={gd.jacketDesignTemp_C ?? ""}
                                  onChange={(e) => patch({ jacketDesignTemp_C: e.target.value })}
                                  placeholder="150"
                                  className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                                  onClick={() => openPrompt("Jacket Design Temp Details:", gd.jacketDesignTempDetails, (v) => patch({ jacketDesignTempDetails: v }))}
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
                                  value={gd.jacketHydrotestTemp_C ?? ""}
                                  onChange={(e) => patch({ jacketHydrotestTemp_C: e.target.value })}
                                  placeholder="20"
                                  className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                                  onClick={() => openPrompt("Jacket Hydrotest Temp Details:", gd.jacketHydrotestTempDetails, (v) => patch({ jacketHydrotestTempDetails: v }))}
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
                                  value={gd.jacketMat_C ?? ""}
                                  onChange={(e) => patch({ jacketMat_C: e.target.value })}
                                  placeholder="100"
                                  className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                                  onClick={() => openPrompt("Jacket M.A.T Details:", gd.jacketMatDetails, (v) => patch({ jacketMatDetails: v }))}
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
                                  value={gd.jacketMdmt_C ?? ""}
                                  onChange={(e) => patch({ jacketMdmt_C: e.target.value })}
                                  placeholder="-20"
                                  className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                                  onClick={() => openPrompt("Jacket M.D.M.T Details:", gd.jacketMdmtDetails, (v) => patch({ jacketMdmtDetails: v }))}
                                >
                                  <MoreHorizontal className="size-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Right Column (Pressures) */}
                          <div className="col-span-6 space-y-1.5 ps-3 min-w-0">
                            {/* Operating Press. */}
                            <div className="space-y-0.5 min-w-0">
                              <VesselFieldLabel label="Operating Press." unit="barg" />
                              <div className="flex items-center gap-1 w-full min-w-0">
                                <Input
                                  type="number"
                                  value={gd.jacketOperatingPressure_barg ?? ""}
                                  onChange={(e) => patch({ jacketOperatingPressure_barg: e.target.value })}
                                  placeholder="4.0"
                                  className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                                  onClick={() => openPrompt("Jacket Operating Pressure Details:", gd.jacketOperatingPressureDetails, (v) => patch({ jacketOperatingPressureDetails: v }))}
                                >
                                  <MoreHorizontal className="size-3.5" />
                                </Button>
                              </div>
                            </div>

                            {/* Design Press. */}
                            <div className="space-y-0.5 min-w-0">
                              <VesselFieldLabel label="Design Press." unit="barg" />
                              <div className="flex items-center gap-1 w-full min-w-0">
                                <Input
                                  type="number"
                                  value={gd.jacketDesignPressure_barg ?? ""}
                                  onChange={(e) => patch({ jacketDesignPressure_barg: e.target.value })}
                                  placeholder="6.0"
                                  className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                                  onClick={() => openPrompt("Jacket Design Pressure Details:", gd.jacketDesignPressureDetails, (v) => patch({ jacketDesignPressureDetails: v }))}
                                >
                                  <MoreHorizontal className="size-3.5" />
                                </Button>
                              </div>
                            </div>

                            {/* Hydrotest Press. */}
                            <div className="space-y-0.5 min-w-0">
                              <VesselFieldLabel label="Hydrotest Press." unit="barg" />
                              <div className="flex items-center gap-1 w-full min-w-0">
                                <Input
                                  type="number"
                                  value={gd.jacketHydrotestPressure_barg ?? ""}
                                  onChange={(e) => patch({ jacketHydrotestPressure_barg: e.target.value })}
                                  placeholder="9.0"
                                  className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                                  onClick={() => openPrompt("Jacket Hydrotest Pressure Details:", gd.jacketHydrotestPressureDetails, (v) => patch({ jacketHydrotestPressureDetails: v }))}
                                >
                                  <MoreHorizontal className="size-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─── Integrated Regen / Vacuum / Steam-out Section ─── */}
                  {gd.regenerationVacuumSteamout && (
                    <div className="rounded-lg border border-orange-500/30 p-2 space-y-2 bg-orange-500/5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1.5 pb-1 border-b border-orange-500/20">
                        <Flame size={12} className="text-orange-500" />
                        <span>Regeneration / Vacuum / Steam-out Cycles</span>
                      </div>

                      {/* Steam Out Sub-Card */}
                      <div className="rounded-md border border-border/80 p-2 space-y-1.5 bg-background/60">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] text-sky-900 dark:text-sky-200">Steam Out</span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-form-primary">
                            <Checkbox
                              checked={!!gd.steamOutEnabled}
                              onCheckedChange={(c) => patch({ steamOutEnabled: !!c })}
                              className="size-3.5"
                            />
                            <span className="text-[10px]">Enable</span>
                          </label>
                        </div>
                        <div className={cn("grid grid-cols-2 gap-2 transition-opacity", !gd.steamOutEnabled && "opacity-40 pointer-events-none")}>
                          <div className="space-y-0.5 min-w-0">
                            <VesselFieldLabel label="Steam Out Press." unit="barg" />
                            <div className="flex items-center gap-1 w-full min-w-0">
                              <Input
                                type="number"
                                value={gd.steamOutPressure_barg ?? ""}
                                onChange={(e) => patch({ steamOutPressure_barg: e.target.value })}
                                placeholder="1.5"
                                className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                                onClick={() => openPrompt("Steam Out Pressure Details:", gd.steamOutPressureDetails, (v) => patch({ steamOutPressureDetails: v }))}
                              >
                                <MoreHorizontal className="size-3.5" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-0.5 min-w-0">
                            <VesselFieldLabel label="Steam Out Temp" unit="°C" />
                            <div className="flex items-center gap-1 w-full min-w-0">
                              <Input
                                type="number"
                                value={gd.steamOutTemp_C ?? ""}
                                onChange={(e) => patch({ steamOutTemp_C: e.target.value })}
                                placeholder="120"
                                className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                                onClick={() => openPrompt("Steam Out Temp Details:", gd.steamOutTempDetails, (v) => patch({ steamOutTempDetails: v }))}
                              >
                                <MoreHorizontal className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Vacuum Sub-Card */}
                      <div className="rounded-md border border-border/80 p-2 space-y-1.5 bg-background/60">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] text-sky-900 dark:text-sky-200">Vacuum</span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-form-primary">
                            <Checkbox
                              checked={!!gd.vacuumEnabled}
                              onCheckedChange={(c) => patch({ vacuumEnabled: !!c })}
                              className="size-3.5"
                            />
                            <span className="text-[10px]">Enable</span>
                          </label>
                        </div>
                        <div className={cn("grid grid-cols-2 gap-2 transition-opacity", !gd.vacuumEnabled && "opacity-40 pointer-events-none")}>
                          <div className="space-y-0.5 min-w-0">
                            <VesselFieldLabel label="Vacuum Press." unit="barg" />
                            <div className="flex items-center gap-1 w-full min-w-0">
                              <Input
                                type="number"
                                value={gd.vacuumPressure_barg ?? ""}
                                onChange={(e) => patch({ vacuumPressure_barg: e.target.value })}
                                placeholder="-1.0"
                                className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                                onClick={() => openPrompt("Vacuum Pressure Details:", gd.vacuumPressureDetails, (v) => patch({ vacuumPressureDetails: v }))}
                              >
                                <MoreHorizontal className="size-3.5" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-0.5 min-w-0">
                            <VesselFieldLabel label="Vacuum Temp" unit="°C" />
                            <div className="flex items-center gap-1 w-full min-w-0">
                              <Input
                                type="number"
                                value={gd.vacuumTemp_C ?? ""}
                                onChange={(e) => patch({ vacuumTemp_C: e.target.value })}
                                placeholder="50"
                                className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                                onClick={() => openPrompt("Vacuum Temp Details:", gd.vacuumTempDetails, (v) => patch({ vacuumTempDetails: v }))}
                              >
                                <MoreHorizontal className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Regeneration Sub-Card */}
                      <div className="rounded-md border border-border/80 p-2 space-y-1.5 bg-background/60">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] text-sky-900 dark:text-sky-200">Regeneration</span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-form-primary">
                            <Checkbox
                              checked={!!gd.regenEnabled}
                              onCheckedChange={(c) => patch({ regenEnabled: !!c })}
                              className="size-3.5"
                            />
                            <span className="text-[10px]">Enable</span>
                          </label>
                        </div>
                        <div className={cn("grid grid-cols-2 gap-2 transition-opacity", !gd.regenEnabled && "opacity-40 pointer-events-none")}>
                          <div className="space-y-0.5 min-w-0">
                            <VesselFieldLabel label="Regen Press." unit="barg" />
                            <div className="flex items-center gap-1 w-full min-w-0">
                              <Input
                                type="number"
                                value={gd.regenPressure_barg ?? ""}
                                onChange={(e) => patch({ regenPressure_barg: e.target.value })}
                                placeholder="3.0"
                                className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                                onClick={() => openPrompt("Regen Pressure Details:", gd.regenPressureDetails, (v) => patch({ regenPressureDetails: v }))}
                              >
                                <MoreHorizontal className="size-3.5" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-0.5 min-w-0">
                            <VesselFieldLabel label="Regen Temp" unit="°C" />
                            <div className="flex items-center gap-1 w-full min-w-0">
                              <Input
                                type="number"
                                value={gd.regenTemp_C ?? ""}
                                onChange={(e) => patch({ regenTemp_C: e.target.value })}
                                placeholder="250"
                                className="h-7 text-xs bg-white dark:bg-black flex-1 min-w-0"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7 p-0 rounded-[calc(var(--radius)-2px)] text-muted-foreground hover:text-form-primary bg-muted/40 hover:bg-form-primary/15 border border-border hover:border-form-primary/40 transition-colors shrink-0"
                                onClick={() => openPrompt("Regen Temp Details:", gd.regenTempDetails, (v) => patch({ regenTempDetails: v }))}
                              >
                                <MoreHorizontal className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ════════════════ SECTION 3: MATERIAL ════════════════ */}
            <div className="pt-2 border-t border-border space-y-2 min-w-0">
              <VesselSectionHeader
                title="Material Specification"
                isCollapsed={isMaterialCollapsed}
                onToggleCollapse={() => setIsMaterialCollapsed(!isMaterialCollapsed)}
              />

              {!isMaterialCollapsed && (
                <div className="space-y-2 min-w-0">
                  {/* Mat Group & Sub-Group */}
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-6 space-y-1 min-w-0">
                      <VesselFieldLabel label="Material Group" />
                      <div className="nodrag w-full min-w-0">
                        <Combobox
                          options={MAT_GROUP_OPTIONS}
                          value={gd.matGroup || "CS"}
                          onChange={(v) => {
                            const defaultSub = MAT_SUB_GROUP_MAP[v]?.[0]?.value || "LowCarbon";
                            patch({ matGroup: v, matSubGroup: defaultSub });
                          }}
                          className="h-7 text-xs w-full min-w-0 bg-white dark:bg-black"
                        />
                      </div>
                    </div>

                    <div className="col-span-6 space-y-1 min-w-0">
                      <VesselFieldLabel label="Sub-Group / Grade" />
                      <div className="flex items-center gap-1 w-full min-w-0">
                        <div className="nodrag flex-1 min-w-0">
                          <Combobox
                            options={currentSubGroupOptions}
                            value={gd.matSubGroup || "LowCarbon"}
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
                  <div className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-6 space-y-1 min-w-0">
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

                    <div className="col-span-6 min-w-0">
                      <label
                        onClick={() =>
                          handleGeometryNodeToggle(
                            "materialList",
                            "materialListNode",
                            "Material Specification",
                            "selectAllMaterial",
                            6
                          )
                        }
                        className={`flex items-center gap-2 h-7 px-2 rounded-md border cursor-pointer select-none transition-colors ${
                          gd.selectAllMaterial
                            ? "bg-form-primary/10 border-form-primary text-form-primary font-bold shadow-sm"
                            : "bg-card border-border hover:border-form-primary/50 text-foreground"
                        }`}
                      >
                        <Checkbox
                          checked={!!gd.selectAllMaterial}
                          className="size-3.5 data-[state=checked]:bg-form-primary data-[state=checked]:border-form-primary"
                        />
                        <FileSpreadsheet
                          size={12}
                          className={gd.selectAllMaterial ? "text-form-primary" : "text-muted-foreground"}
                        />
                        <span className="text-[11px] font-medium truncate">Select All Mat</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ════════════════ SECTION 4: GEOMETRY ════════════════ */}
            <div className="pt-2 border-t border-border space-y-2.5 min-w-0">
              <VesselSectionHeader
                title="Geometry & Components"
                isCollapsed={isGeometryCollapsed}
                onToggleCollapse={() => setIsGeometryCollapsed(!isGeometryCollapsed)}
              />

              {!isGeometryCollapsed && (
                <div className="space-y-2.5 min-w-0">
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
                  <div className="space-y-1.5 pt-1 min-w-0">
                    {/* Row 1 of Geometry Checkboxes: SHELL, HEAD, NOZZLE, SUPPORT */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {/* SHELL */}
                      <label
                        onClick={() => handleGeometryNodeToggle("shell", "shellNode", "Shell Section", "shellChecked", 0)}
                        className={`flex items-center gap-1.5 h-7 px-2 rounded-md border cursor-pointer select-none transition-colors ${
                          gd.shellChecked
                            ? "bg-form-primary/10 border-form-primary text-form-primary font-bold shadow-sm"
                            : "bg-card border-border hover:border-form-primary/50 text-foreground"
                        }`}
                      >
                        <Checkbox
                          checked={!!gd.shellChecked}
                          className="size-3.5 data-[state=checked]:bg-form-primary data-[state=checked]:border-form-primary"
                        />
                        <Cylinder
                          size={12}
                          className={gd.shellChecked ? "text-form-primary" : "text-muted-foreground"}
                        />
                        <span className="text-[11px] font-medium truncate">Shell</span>
                      </label>

                      {/* HEAD */}
                      <label
                        onClick={() => handleGeometryNodeToggle("head", "headNode", "Vessel Head", "headChecked", 1)}
                        className={`flex items-center gap-1.5 h-7 px-2 rounded-md border cursor-pointer select-none transition-colors ${
                          gd.headChecked
                            ? "bg-form-primary/10 border-form-primary text-form-primary font-bold shadow-sm"
                            : "bg-card border-border hover:border-form-primary/50 text-foreground"
                        }`}
                      >
                        <Checkbox
                          checked={!!gd.headChecked}
                          className="size-3.5 data-[state=checked]:bg-form-primary data-[state=checked]:border-form-primary"
                        />
                        <Disc
                          size={12}
                          className={gd.headChecked ? "text-form-primary" : "text-muted-foreground"}
                        />
                        <span className="text-[11px] font-medium truncate">Head</span>
                      </label>

                      {/* NOZZLE */}
                      <label
                        onClick={() => handleGeometryNodeToggle("nozzle", "nozzleNode", "Nozzle Component", "nozzleChecked", 2)}
                        className={`flex items-center gap-1.5 h-7 px-2 rounded-md border cursor-pointer select-none transition-colors ${
                          gd.nozzleChecked
                            ? "bg-form-primary/10 border-form-primary text-form-primary font-bold shadow-sm"
                            : "bg-card border-border hover:border-form-primary/50 text-foreground"
                        }`}
                      >
                        <Checkbox
                          checked={!!gd.nozzleChecked}
                          className="size-3.5 data-[state=checked]:bg-form-primary data-[state=checked]:border-form-primary"
                        />
                        <Target
                          size={12}
                          className={gd.nozzleChecked ? "text-form-primary" : "text-muted-foreground"}
                        />
                        <span className="text-[11px] font-medium truncate">Nozzle</span>
                      </label>

                      {/* SUPPORT */}
                      <label
                        onClick={() => handleGeometryNodeToggle("support", "supportNode", "Vessel Support", "supportChecked", 3)}
                        className={`flex items-center gap-1.5 h-7 px-2 rounded-md border cursor-pointer select-none transition-colors ${
                          gd.supportChecked
                            ? "bg-form-primary/10 border-form-primary text-form-primary font-bold shadow-sm"
                            : "bg-card border-border hover:border-form-primary/50 text-foreground"
                        }`}
                      >
                        <Checkbox
                          checked={!!gd.supportChecked}
                          className="size-3.5 data-[state=checked]:bg-form-primary data-[state=checked]:border-form-primary"
                        />
                        <ArrowDownToLine
                          size={12}
                          className={gd.supportChecked ? "text-form-primary" : "text-muted-foreground"}
                        />
                        <span className="text-[11px] font-medium truncate">Support</span>
                      </label>
                    </div>

                    {/* Row 2 of Geometry Checkboxes: ATTACHMENTS, INSULATION, SURFACE PREP */}
                    <div className="grid grid-cols-12 gap-1.5">
                      {/* ATTACHMENTS */}
                      <label
                        onClick={() => handleGeometryNodeToggle("attachments", "attachmentsNode", "Vessel Attachments", "attachmentsChecked", 4)}
                        className={`col-span-4 flex items-center gap-1.5 h-7 px-2 rounded-md border cursor-pointer select-none transition-colors ${
                          gd.attachmentsChecked
                            ? "bg-form-primary/10 border-form-primary text-form-primary font-bold shadow-sm"
                            : "bg-card border-border hover:border-form-primary/50 text-foreground"
                        }`}
                      >
                        <Checkbox
                          checked={!!gd.attachmentsChecked}
                          className="size-3.5 data-[state=checked]:bg-form-primary data-[state=checked]:border-form-primary"
                        />
                        <Paperclip
                          size={12}
                          className={gd.attachmentsChecked ? "text-form-primary" : "text-muted-foreground"}
                        />
                        <span className="text-[11px] font-medium truncate">Attachments</span>
                      </label>

                      {/* INSULATION / FIRE PROOF */}
                      <label
                        onClick={() => handleGeometryNodeToggle("insulation", "internalsNode", "Insulation & Fireproofing", "insulationChecked", 5)}
                        className={`col-span-4 flex items-center gap-1.5 h-7 px-2 rounded-md border cursor-pointer select-none transition-colors ${
                          gd.insulationChecked
                            ? "bg-form-primary/10 border-form-primary text-form-primary font-bold shadow-sm"
                            : "bg-card border-border hover:border-form-primary/50 text-foreground"
                        }`}
                      >
                        <Checkbox
                          checked={!!gd.insulationChecked}
                          className="size-3.5 data-[state=checked]:bg-form-primary data-[state=checked]:border-form-primary"
                        />
                        <Layers
                          size={12}
                          className={gd.insulationChecked ? "text-form-primary" : "text-muted-foreground"}
                        />
                        <span className="text-[11px] font-medium truncate">Insulation</span>
                      </label>

                      {/* Surface Preparation */}
                      <label
                        onClick={() =>
                          handleGeometryNodeToggle(
                            "surfacePrep",
                            "surfacePrepNode",
                            "Surface Preparation",
                            "surfacePrepChecked",
                            6
                          )
                        }
                        className={`col-span-4 flex items-center gap-1.5 h-7 px-2 rounded-md border cursor-pointer select-none transition-colors ${
                          gd.surfacePrepChecked
                            ? "bg-form-primary/10 border-form-primary text-form-primary font-bold shadow-sm"
                            : "bg-card border-border hover:border-form-primary/50 text-foreground"
                        }`}
                      >
                        <Checkbox
                          checked={!!gd.surfacePrepChecked}
                          className="size-3.5 data-[state=checked]:bg-form-primary data-[state=checked]:border-form-primary"
                        />
                        <Paintbrush
                          size={12}
                          className={gd.surfacePrepChecked ? "text-form-primary" : "text-muted-foreground"}
                        />
                        <span className="text-[11px] font-medium truncate">Surface Prep.</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ════════════════ SECTION 5: OTHERS ════════════════ */}
            <div className="pt-2 border-t border-border space-y-2 min-w-0">
              <VesselSectionHeader
                title="Others"
                isCollapsed={isOthersCollapsed}
                onToggleCollapse={() => setIsOthersCollapsed(!isOthersCollapsed)}
              />

              {!isOthersCollapsed && (
                <div className="flex items-center gap-2 pt-0.5 min-w-0">
                  <label
                    onClick={() => patch({ mechanicalTest: !gd.mechanicalTest })}
                    className={`flex items-center gap-2 h-7 px-2.5 rounded-md border cursor-pointer select-none transition-colors max-w-[200px] ${
                      gd.mechanicalTest
                        ? "bg-form-primary/10 border-form-primary text-form-primary font-bold shadow-sm"
                        : "bg-card border-border hover:border-form-primary/50 text-foreground"
                    }`}
                  >
                    <Checkbox
                      checked={!!gd.mechanicalTest}
                      className="size-3.5 data-[state=checked]:bg-form-primary data-[state=checked]:border-form-primary"
                    />
                    <FileSliders
                      size={12}
                      className={gd.mechanicalTest ? "text-form-primary" : "text-muted-foreground"}
                    />
                    <span className="text-[11px] font-medium truncate">Mechanical Test</span>
                  </label>
                </div>
              )}
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
