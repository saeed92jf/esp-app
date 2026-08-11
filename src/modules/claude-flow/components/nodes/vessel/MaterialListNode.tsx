"use client";

import React, { memo, useState, useMemo, useEffect } from "react";
import { type NodeProps, type Node } from "@xyflow/react";
import {
  FileSpreadsheet,
  RotateCcw,
  Search,
  X,
  Sparkles,
  Link as LinkIcon,
  Check,
  ChevronDown,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useDiagramStore } from "@/modules/claude-flow/store";
import type { DiagramNodeData, DiagramNodeType } from "@/modules/claude-flow/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  VesselNodeContainer,
  VesselNodeToolbar,
  VesselNodeHeader,
} from "./VesselNodeBase";
import type { GeneralData } from "./GeneralDataNode";

export interface MaterialScheduleItem {
  id: string;
  group: "plates" | "pipes" | "forgings" | "bodyFlange" | "fasteners" | "welding" | "internals";
  item: string;
  materialRef: string;
  criteria: string;
  ref: string;
  supRef: string;
  dtTest: string;
  ndtTest: string;
}

export interface MaterialListNodeData extends DiagramNodeData {
  materialSchedule?: MaterialScheduleItem[];
  appliedPresetKey?: string;
}

type DiagramNode = Node<DiagramNodeData, DiagramNodeType>;
type Props = NodeProps<DiagramNode>;

// ─── Preset Generators based on GeneralData Mat Group & Sub-Group ────────────
export function getMaterialSchedulePreset(
  matGroup = "CS",
  matSubGroup = "LowCarbon"
): MaterialScheduleItem[] {
  const isSS = matGroup === "SS_Austenitic" || matSubGroup.includes("304") || matSubGroup.includes("316") || matSubGroup.includes("321") || matSubGroup.includes("347");
  const isDuplex = matGroup === "SS_Duplex" || matSubGroup.includes("2205") || matSubGroup.includes("2507");
  const isLTCS = matGroup === "LTCS" || matSubGroup.includes("LTCS");
  const isLAS = matGroup === "LAS" || matSubGroup.includes("387");
  const isNickel = matGroup === "Nickel" || matSubGroup.includes("Inconel") || matSubGroup.includes("Monel") || matSubGroup.includes("Incoloy");

  // Defaults for CS (Low Carbon / Medium Carbon)
  let plateMat = matSubGroup === "LowCarbon" ? "SA-516 60" : "SA-516 70";
  let nonPressPlate = "SA-283 C";
  let pipeSeamless = "SA-106 B";
  let pipeWelded = "SA-53 B";
  let neckPlate = "SA-516 70";
  let neckForge = "SA-105";
  let forgedFlange = "SA-105";
  let coupling = "SA-105";
  let bodyFlangeStd = "SA-105";
  let bodyFlangeRing = "SA-266";
  let plateFlange = "SA-516 70";
  let fittingFactory = "SA-234 WPB";
  let fittingForged = "SA-105";
  let bolt = "SA-193 B7";
  let nut = "SA-194 2H";
  let metalGasket = "SS 316 / Soft Iron";
  let semiMetalGasket = "Spiral Wound SS316+Graphite";
  let nonMetalGasket = "Compressed Fiber / PTFE";
  let electrode = "E-7018";
  let wireWeld = "ER-70S-6";
  let plateCriteria = "NORMALIZING";
  let plateRef = "ASME SEC.II PART A";
  let plateSupRef = "NACE MR0175";
  let plateDt = "IMPACT TEST";
  let plateNdt = "UT TEST";

  // SS Preset
  if (isSS) {
    const is316 = matSubGroup.includes("316");
    const grade = is316 ? "316L" : "304L";
    plateMat = `SA-240 ${grade}`;
    nonPressPlate = `SA-240 ${is316 ? "316" : "304"}`;
    pipeSeamless = `SA-312 TP${grade}`;
    pipeWelded = `SA-312 TP${grade}`;
    neckPlate = `SA-240 ${grade}`;
    neckForge = `SA-182 F${grade}`;
    forgedFlange = `SA-182 F${grade}`;
    coupling = `SA-182 F${grade}`;
    bodyFlangeStd = `SA-182 F${grade}`;
    bodyFlangeRing = `SA-182 F${grade}`;
    plateFlange = `SA-240 ${grade}`;
    fittingFactory = `SA-403 WP${grade}`;
    fittingForged = `SA-182 F${grade}`;
    bolt = is316 ? "SA-193 B8M" : "SA-193 B8";
    nut = is316 ? "SA-194 8M" : "SA-194 8";
    electrode = is316 ? "E-316L-16" : "E-308L-16";
    wireWeld = is316 ? "ER-316L" : "ER-308L";
    plateCriteria = "SOLUTION ANNEALED";
  } else if (isDuplex) {
    plateMat = "SA-240 UNS S31803 (2205)";
    nonPressPlate = "SA-240 UNS S31803";
    pipeSeamless = "SA-790 UNS S31803";
    pipeWelded = "SA-790 UNS S31803";
    neckPlate = "SA-240 UNS S31803";
    neckForge = "SA-182 F51";
    forgedFlange = "SA-182 F51";
    coupling = "SA-182 F51";
    bodyFlangeRing = "SA-182 F51";
    fittingFactory = "SA-815 UNS S31803";
    fittingForged = "SA-182 F51";
    bolt = "SA-193 B8M Cl.2";
    nut = "SA-194 8M";
    electrode = "E-2209-16";
    wireWeld = "ER-2209";
    plateCriteria = "SOLUTION ANNEALED";
    plateDt = "IMPACT TEST @ -40°C";
  } else if (isLTCS) {
    plateMat = "SA-516 60";
    pipeSeamless = "SA-333 Gr. 6";
    pipeWelded = "SA-671 CC60";
    neckForge = "SA-350 LF2";
    forgedFlange = "SA-350 LF2";
    coupling = "SA-350 LF2";
    bodyFlangeRing = "SA-350 LF2";
    fittingFactory = "SA-420 WPL6";
    fittingForged = "SA-350 LF2";
    bolt = "SA-320 L7";
    nut = "SA-194 Gr. 4 / 7";
    electrode = "E-7018-1";
    plateDt = "IMPACT TEST @ -46°C";
  } else if (isLAS) {
    plateMat = "SA-387 Gr. 11 Cl. 2";
    pipeSeamless = "SA-335 P11";
    neckForge = "SA-182 F11";
    forgedFlange = "SA-182 F11";
    bodyFlangeRing = "SA-182 F11";
    fittingFactory = "SA-234 WP11";
    bolt = "SA-193 B16";
    nut = "SA-194 4";
    electrode = "E-8018-B2";
    wireWeld = "ER-80S-B2";
    plateCriteria = "NORMALIZED & TEMPERED";
  } else if (isNickel) {
    plateMat = "SB-443 N06625 (Inconel 625)";
    pipeSeamless = "SB-444 N06625";
    forgedFlange = "SB-564 N06625";
    bolt = "SB-446 N06625";
    nut = "SB-446 N06625";
    electrode = "ENiCrMo-3";
    wireWeld = "ERNiCrMo-3";
  }

  return [
    // ─── PLATES ───
    {
      id: "mat-1",
      group: "plates",
      item: "PRESSURIZED PLATE",
      materialRef: plateMat,
      criteria: plateCriteria,
      ref: plateRef,
      supRef: plateSupRef,
      dtTest: plateDt,
      ndtTest: plateNdt,
    },
    {
      id: "mat-2",
      group: "plates",
      item: "NON-PRESSURIZED PLATE",
      materialRef: nonPressPlate,
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },

    // ─── PIPES & NECK ───
    {
      id: "mat-3",
      group: "pipes",
      item: "SEAMLESS PIPE",
      materialRef: pipeSeamless,
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },
    {
      id: "mat-4",
      group: "pipes",
      item: "WELDED PIPE",
      materialRef: pipeWelded,
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },
    {
      id: "mat-5",
      group: "pipes",
      item: "NECK PLATE",
      materialRef: neckPlate,
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },
    {
      id: "mat-6",
      group: "pipes",
      item: "NECK FORGE",
      materialRef: neckForge,
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },

    // ─── FORGINGS & COUPLINGS ───
    {
      id: "mat-7",
      group: "forgings",
      item: "FORGED FLANGE",
      materialRef: forgedFlange,
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },
    {
      id: "mat-8",
      group: "forgings",
      item: "COUPLING",
      materialRef: coupling,
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },

    // ─── BODY FLANGE & FITTINGS ───
    {
      id: "mat-9",
      group: "bodyFlange",
      item: "BODY FLANGE (STD. FLANGE)",
      materialRef: bodyFlangeStd,
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },
    {
      id: "mat-10",
      group: "bodyFlange",
      item: "BODY FLANGE (FORGED RING)",
      materialRef: bodyFlangeRing,
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },
    {
      id: "mat-11",
      group: "bodyFlange",
      item: "PLATE FLANGE (PLATE)",
      materialRef: plateFlange,
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },
    {
      id: "mat-12",
      group: "bodyFlange",
      item: "FACTORY MADE FITTING",
      materialRef: fittingFactory,
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },
    {
      id: "mat-13",
      group: "bodyFlange",
      item: "FORGED FITTING",
      materialRef: fittingForged,
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },

    // ─── FASTENERS & GASKETS ───
    {
      id: "mat-14",
      group: "fasteners",
      item: "BOLT",
      materialRef: bolt,
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },
    {
      id: "mat-15",
      group: "fasteners",
      item: "NUT",
      materialRef: nut,
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },
    {
      id: "mat-16",
      group: "fasteners",
      item: "METAL GASKET",
      materialRef: metalGasket,
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },
    {
      id: "mat-17",
      group: "fasteners",
      item: "SEMI-METAL GASKET",
      materialRef: semiMetalGasket,
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },
    {
      id: "mat-18",
      group: "fasteners",
      item: "NON-METAL GASKET",
      materialRef: nonMetalGasket,
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },

    // ─── WELDING CONSUMABLES ───
    {
      id: "mat-19",
      group: "welding",
      item: "ELECTRODE:",
      materialRef: electrode,
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },
    {
      id: "mat-20",
      group: "welding",
      item: "WIRE WELD:",
      materialRef: wireWeld,
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },

    // ─── INTERNALS ───
    {
      id: "mat-21",
      group: "internals",
      item: "PLATE:",
      materialRef: isSS ? "SA-240 316L" : "SA-240 304",
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },
    {
      id: "mat-22",
      group: "internals",
      item: "FLANGE PLATE",
      materialRef: isSS ? "SA-240 316L" : "SA-240 304",
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },
    {
      id: "mat-23",
      group: "internals",
      item: "TUBE:",
      materialRef: isSS ? "SA-213 TP316L" : "SA-213 TP304",
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },
    {
      id: "mat-24",
      group: "internals",
      item: "WELDED PIPE:",
      materialRef: isSS ? "SA-312 TP316L" : "SA-312 TP304",
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },
    {
      id: "mat-25",
      group: "internals",
      item: "SEAMLESS PIPE:",
      materialRef: isSS ? "SA-312 TP316L" : "SA-312 TP304",
      criteria: "---",
      ref: "---",
      supRef: "---",
      dtTest: "---",
      ndtTest: "---",
    },
  ];
}

// ─── Standard Dropdown Options for Columns ──────────────────────────────────
const COMMON_CRITERIA_OPTIONS = [
  "---",
  "NORMALIZING",
  "NORMALIZED & TEMPERED",
  "QUENCHED & TEMPERED",
  "SOLUTION ANNEALED",
  "ANNEALED",
  "STRESS RELIEVED",
  "PWHT",
  "NACE MR0175 / ISO 15156",
  "HIC RESISTANT",
];

const COMMON_REF_OPTIONS = [
  "---",
  "ASME SEC.II PART A",
  "ASME SEC.II PART B",
  "ASME SEC.II PART C",
  "ASME SEC.VIII DIV.1",
  "ASME B16.5",
  "ASME B16.47",
  "ASME B16.9",
  "ASME B16.11",
  "ASME B16.20",
  "ASTM",
];

const COMMON_SUP_REF_OPTIONS = [
  "---",
  "NACE MR0175",
  "NACE MR0103",
  "DEP 30.10.02.31",
  "IPS-M-PI-190",
  "IPS-M-TP-100",
  "MESC",
  "ASME B31.3",
];

const COMMON_DT_OPTIONS = [
  "---",
  "IMPACT TEST",
  "IMPACT TEST @ -20°C",
  "IMPACT TEST @ -29°C",
  "IMPACT TEST @ -40°C",
  "IMPACT TEST @ -46°C",
  "HARDNESS TEST",
  "TENSILE & BEND",
  "MACRO ETCH",
];

const COMMON_NDT_OPTIONS = [
  "---",
  "UT TEST",
  "RT TEST (100%)",
  "RT TEST (SPOT)",
  "MT TEST",
  "PT TEST",
  "PMI TEST",
  "UT + MT TEST",
  "UT + PT TEST",
];

function getMaterialRefOptions(row: MaterialScheduleItem): string[] {
  switch (row.group) {
    case "plates":
      return [
        "SA-516 70",
        "SA-516 65",
        "SA-516 60",
        "SA-283 C",
        "SA-285 C",
        "SA-537 Cl.1",
        "SA-240 304L",
        "SA-240 316L",
        "SA-240 321",
        "SA-240 UNS S31803",
        "SA-387 Gr. 11 Cl. 2",
        "SA-387 Gr. 22 Cl. 2",
        "NON-PRESSURIZED PLATE",
        "---",
      ];
    case "pipes":
      return [
        "SA-106 B",
        "SA-106 C",
        "SA-53 B",
        "SA-333 Gr. 6",
        "SA-312 TP304L",
        "SA-312 TP316L",
        "SA-312 TP321",
        "SA-790 UNS S31803",
        "SA-335 P11",
        "SA-335 P22",
        "SA-105",
        "SA-516 70",
        "---",
      ];
    case "forgings":
    case "bodyFlange":
      return [
        "SA-105",
        "SA-105N",
        "SA-266",
        "SA-266 Cl.2",
        "SA-266 Cl.4",
        "SA-350 LF2",
        "SA-182 F304L",
        "SA-182 F316L",
        "SA-182 F51",
        "SA-182 F11",
        "SA-234 WPB",
        "SA-234 WPC",
        "SA-420 WPL6",
        "SA-403 WP304L",
        "SA-403 WP316L",
        "SA-516 70",
        "NON-PRESSURIZED PLATE",
        "---",
      ];
    case "fasteners":
      return [
        "SA-193 B7",
        "SA-193 B7M",
        "SA-193 B8",
        "SA-193 B8M",
        "SA-193 B16",
        "SA-320 L7",
        "SA-194 2H",
        "SA-194 2HM",
        "SA-194 8",
        "SA-194 8M",
        "SA-194 4",
        "SA-194 7",
        "SS 316 / Soft Iron",
        "Spiral Wound SS316+Graphite",
        "Spiral Wound SS304+Graphite",
        "PTFE Envelope",
        "Compressed Fiber / PTFE",
        "Camprofile SS316",
        "RTJ Soft Iron",
        "NON-PRESSURIZED PLATE",
        "---",
      ];
    case "welding":
      return [
        "E-7018",
        "E-7018-1",
        "E-8018-B2",
        "E-9018-B3",
        "E-308L-16",
        "E-316L-16",
        "E-2209-16",
        "ER-70S-6",
        "ER-80S-B2",
        "ER-90S-B3",
        "ER-308L",
        "ER-316L",
        "ER-2209",
        "NON-PRESSURIZED PLATE",
        "---",
      ];
    case "internals":
      return [
        "SA-240 304",
        "SA-240 304L",
        "SA-240 316",
        "SA-240 316L",
        "SA-213 TP304",
        "SA-213 TP316",
        "SA-312 TP304",
        "SA-312 TP316",
        "SA-516 70",
        "SA-283 C",
        "NON-PRESSURIZED PLATE",
        "---",
      ];
    default:
      return [
        "SA-516 70",
        "SA-106 B",
        "SA-105",
        "SA-240 304L",
        "SA-240 316L",
        "NON-PRESSURIZED PLATE",
        "---",
      ];
  }
}

// ─── Fast Compact Table Combobox Cell ───────────────────────────────────────
interface TableCellComboboxProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

function TableCellCombobox({
  value,
  onChange,
  options,
  placeholder = "---",
  className,
}: TableCellComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const allOptions = useMemo(() => {
    if (value && !options.includes(value)) {
      return [value, ...options];
    }
    return options;
  }, [value, options]);

  const filtered = useMemo(() => {
    if (!searchVal.trim()) return allOptions;
    const q = searchVal.toLowerCase();
    const matches = allOptions.filter((opt) => opt.toLowerCase().includes(q));
    // allow adding custom value
    if (searchVal.trim() && !allOptions.some((o) => o.toLowerCase() === q)) {
      return [searchVal.trim(), ...matches];
    }
    return matches;
  }, [allOptions, searchVal]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "nodrag nopan flex items-center justify-between w-full h-6 px-1.5 rounded text-[10.5px] font-sans text-left border border-transparent hover:border-cyan-500/40 hover:bg-cyan-500/10 focus:outline-none focus:border-cyan-500 transition-colors truncate",
            value === "---" ? "text-muted-foreground/60" : "text-foreground font-medium",
            className
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronDown className="size-3 shrink-0 text-muted-foreground/40 ms-1 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="nodrag nopan w-56 p-0 z-50 bg-popover border border-border shadow-xl rounded-md overflow-hidden text-xs"
        align="start"
      >
        <div className="p-1.5 border-b border-border bg-muted/30">
          <Input
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search or type custom..."
            className="nodrag nopan h-6 text-xs px-2 bg-background"
            autoFocus
          />
        </div>
        <div className="max-h-48 overflow-y-auto p-1 space-y-0.5">
          {filtered.length === 0 ? (
            <div className="py-2 text-center text-muted-foreground text-[11px]">
              No options
            </div>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                  setSearchVal("");
                }}
                className={cn(
                  "w-full text-left px-2 py-1 rounded text-[11px] font-sans flex items-center justify-between hover:bg-cyan-500/15 hover:text-cyan-800 dark:hover:text-cyan-200 transition-colors",
                  value === opt ? "bg-cyan-500/20 text-cyan-900 dark:text-cyan-100 font-semibold" : "text-foreground"
                )}
              >
                <span className="truncate">{opt}</span>
                {value === opt && <Check className="size-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Main MaterialListNode Component ────────────────────────────────────────
export const MaterialListNode = memo(({ id, data, selected }: Props) => {
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
  const [searchQuery, setSearchQuery] = useState("");

  // ─── 1. Read GeneralData from connected or store GeneralDataNode ────────────
  const generalData = useDiagramStore(
    useShallow((s) => {
      const connectedEdge = s.edges.find(
        (e) => e.target === id || e.source === id
      );
      if (connectedEdge) {
        const otherId = connectedEdge.source === id ? connectedEdge.target : connectedEdge.source;
        const gdNode = s.nodes.find((n) => n.id === otherId && n.type === "generalDataNode");
        if (gdNode) return (gdNode.data as any)?.generalData as GeneralData | undefined;
      }
      const anyGd = s.nodes.find((n) => n.type === "generalDataNode");
      return (anyGd?.data as any)?.generalData as GeneralData | undefined;
    })
  );

  const matGroup = generalData?.matGroup || "CS";
  const matSubGroup = generalData?.matSubGroup || "LowCarbon";
  const tagNo = generalData?.tagNo || "General Data";
  const presetKey = `${matGroup}-${matSubGroup}`;

  const nodeData = (data as MaterialListNodeData) || {};

  // Initialize or fallback to preset
  const schedule: MaterialScheduleItem[] = useMemo(() => {
    if (nodeData.materialSchedule && nodeData.materialSchedule.length > 0) {
      return nodeData.materialSchedule;
    }
    return getMaterialSchedulePreset(matGroup, matSubGroup);
  }, [nodeData.materialSchedule, matGroup, matSubGroup]);

  // Auto-sync preset on first mount if not initialized
  useEffect(() => {
    if (!nodeData.materialSchedule || nodeData.materialSchedule.length === 0) {
      const initial = getMaterialSchedulePreset(matGroup, matSubGroup);
      updateNodeData(id, {
        ...nodeData,
        materialSchedule: initial,
        appliedPresetKey: presetKey,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSchedule = (newSchedule: MaterialScheduleItem[]) => {
    updateNodeData(id, {
      ...nodeData,
      materialSchedule: newSchedule,
    });
  };

  const handleCellChange = (
    rowId: string,
    field: keyof Omit<MaterialScheduleItem, "id" | "group">,
    value: string
  ) => {
    const next = schedule.map((item) =>
      item.id === rowId ? { ...item, [field]: value } : item
    );
    updateSchedule(next);
  };

  const handleSyncFromGeneralData = () => {
    const fresh = getMaterialSchedulePreset(matGroup, matSubGroup);
    updateNodeData(id, {
      ...nodeData,
      materialSchedule: fresh,
      appliedPresetKey: presetKey,
    });
  };

  // ─── Real-time Robust Search Filter ─────────────────────────────────────────
  const filteredSchedule = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return schedule;

    return schedule.filter((s) => {
      return (
        s.item.toLowerCase().includes(q) ||
        (s.materialRef && s.materialRef.toLowerCase().includes(q)) ||
        (s.criteria && s.criteria.toLowerCase().includes(q)) ||
        (s.ref && s.ref.toLowerCase().includes(q)) ||
        (s.supRef && s.supRef.toLowerCase().includes(q)) ||
        (s.dtTest && s.dtTest.toLowerCase().includes(q)) ||
        (s.ndtTest && s.ndtTest.toLowerCase().includes(q))
      );
    });
  }, [schedule, searchQuery]);

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
        widthClass="w-auto min-w-[820px] max-w-[980px]"
        showHandles={true}
      >
        {/* Header */}
        <VesselNodeHeader
          icon={<FileSpreadsheet size={18} className="text-cyan-600 dark:text-cyan-400" />}
          title="Material Specification"
          subtitle={`Schedule for ${tagNo} (${matGroup} / ${matSubGroup})`}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        {!isCollapsed && (
          <div className="space-y-2.5 p-1 pt-2 select-none">
            {/* Top Toolbar: Search & Sync from GeneralData */}
            <div className="flex items-center justify-between gap-2">
              {/* Search Bar with clear icon */}
              <div className="relative flex-1 max-w-[320px]">
                <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search item, material, test..."
                  className="nodrag nopan h-7.5 text-xs ps-8 pe-7 bg-white dark:bg-black border-border/80 focus:border-cyan-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                    title="Clear search"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Linked Badge & Sync Button */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-800 dark:text-cyan-300 font-sans text-[11px]">
                  <LinkIcon size={12} className="text-cyan-600 dark:text-cyan-400" />
                  <span className="font-semibold">{matGroup}</span>
                  <span>→</span>
                  <span className="truncate max-w-[140px]">{matSubGroup}</span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSyncFromGeneralData}
                  className="nodrag nopan h-7 px-2 text-[11px] font-sans gap-1 text-cyan-700 dark:text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/15"
                  title="Reset and reload default material schedule for this group"
                >
                  <Sparkles size={12} />
                  <span>Sync Defaults</span>
                </Button>
              </div>
            </div>

            {/* CAD Style Material Schedule Table */}
            <div className="overflow-x-auto rounded-md border border-cyan-500/30 dark:border-cyan-500/20 bg-background shadow-inner">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-cyan-500/30 bg-cyan-950/20 text-cyan-700 dark:text-cyan-300 font-bold uppercase tracking-wider font-sans">
                    <th className="py-1.5 px-2.5 w-[200px]">Item / Component</th>
                    <th className="py-1.5 px-1.5 w-[140px]">Material Ref.</th>
                    <th className="py-1.5 px-1.5 w-[130px]">Criteria</th>
                    <th className="py-1.5 px-1.5 w-[130px]">Ref.</th>
                    <th className="py-1.5 px-1.5 w-[110px]">Sup. Ref.</th>
                    <th className="py-1.5 px-1.5 w-[110px]">DT Test</th>
                    <th className="py-1.5 px-1.5 w-[110px]">NDT Test</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-sans">
                  {filteredSchedule.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-muted-foreground text-xs font-sans">
                        No material entries found matching &ldquo;{searchQuery}&rdquo;.
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setSearchQuery("")}
                          className="ps-1 text-xs text-cyan-600"
                        >
                          Clear search
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    filteredSchedule.map((row, idx) => {
                      const isInternalsStart =
                        row.group === "internals" &&
                        (idx === 0 || filteredSchedule[idx - 1]?.group !== "internals");

                      const matOptions = getMaterialRefOptions(row);

                      return (
                        <React.Fragment key={row.id}>
                          {isInternalsStart && (
                            <tr className="bg-muted/40 font-bold text-foreground">
                              <td
                                colSpan={7}
                                className="py-1 px-2.5 text-[10px] uppercase tracking-widest text-cyan-800 dark:text-cyan-300 border-y border-cyan-500/30 bg-cyan-500/10"
                              >
                                <div className="flex items-center gap-2">
                                  <span>INTERNALS</span>
                                  <div className="h-[1px] flex-1 bg-cyan-500/30" />
                                </div>
                              </td>
                            </tr>
                          )}
                          <tr className="hover:bg-cyan-500/5 transition-colors group">
                            {/* Component Name */}
                            <td className="py-1 px-2.5 font-medium text-foreground min-w-0">
                              <span className="text-[10.5px] font-semibold tracking-tight block truncate">
                                {row.item}
                              </span>
                            </td>

                            {/* Material Ref (Combobox) */}
                            <td className="py-0.5 px-1 min-w-0">
                              <TableCellCombobox
                                value={row.materialRef}
                                onChange={(v) => handleCellChange(row.id, "materialRef", v)}
                                options={matOptions}
                                className="bg-background/80 border-border/80 text-cyan-900 dark:text-cyan-200"
                              />
                            </td>

                            {/* Criteria (Combobox) */}
                            <td className="py-0.5 px-1 min-w-0">
                              <TableCellCombobox
                                value={row.criteria}
                                onChange={(v) => handleCellChange(row.id, "criteria", v)}
                                options={COMMON_CRITERIA_OPTIONS}
                                className="bg-background/80 border-border/80 text-foreground/90"
                              />
                            </td>

                            {/* Ref (Combobox) */}
                            <td className="py-0.5 px-1 min-w-0">
                              <TableCellCombobox
                                value={row.ref}
                                onChange={(v) => handleCellChange(row.id, "ref", v)}
                                options={COMMON_REF_OPTIONS}
                                className="bg-background/80 border-border/80 text-foreground/90"
                              />
                            </td>

                            {/* Sup. Ref (Combobox) */}
                            <td className="py-0.5 px-1 min-w-0">
                              <TableCellCombobox
                                value={row.supRef}
                                onChange={(v) => handleCellChange(row.id, "supRef", v)}
                                options={COMMON_SUP_REF_OPTIONS}
                                className="bg-background/80 border-border/80 text-foreground/90"
                              />
                            </td>

                            {/* DT Test (Combobox) */}
                            <td className="py-0.5 px-1 min-w-0">
                              <TableCellCombobox
                                value={row.dtTest}
                                onChange={(v) => handleCellChange(row.id, "dtTest", v)}
                                options={COMMON_DT_OPTIONS}
                                className="bg-background/80 border-border/80 text-foreground/90"
                              />
                            </td>

                            {/* NDT Test (Combobox) */}
                            <td className="py-0.5 px-1 min-w-0">
                              <TableCellCombobox
                                value={row.ndtTest}
                                onChange={(v) => handleCellChange(row.id, "ndtTest", v)}
                                options={COMMON_NDT_OPTIONS}
                                className="bg-background/80 border-border/80 text-foreground/90"
                              />
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom summary / notes */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1 pt-1 font-sans">
              <span>Showing {filteredSchedule.length} of {schedule.length} components</span>
              <span className="text-cyan-700 dark:text-cyan-400 font-medium">ASME BPVC Sec. VIII Div. 1 & Section II Specifications</span>
            </div>
          </div>
        )}
      </VesselNodeContainer>
    </>
  );
});

MaterialListNode.displayName = "MaterialListNode";
