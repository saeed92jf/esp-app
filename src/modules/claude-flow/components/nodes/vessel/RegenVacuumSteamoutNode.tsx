"use client";

import React, { memo, useState } from "react";
import { type NodeProps, type Node } from "@xyflow/react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDiagramStore } from "@/modules/claude-flow/store";
import type { DiagramNodeData, DiagramNodeType } from "@/modules/claude-flow/types";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  VesselNodeContainer,
  VesselNodeToolbar,
  VesselNodeHeader,
  VesselSectionHeader,
  VesselFieldLabel,
  VesselInfoButton,
} from "./VesselNodeBase";

type DiagramNode = Node<DiagramNodeData, DiagramNodeType>;
type Props = NodeProps<DiagramNode>;

export interface RegenVacuumSteamoutData {
  // Steam Out section
  steamOutEnabled?: boolean;
  steamOutPressure_barg?: string | number;
  steamOutPressureDetails?: string;
  steamOutTemp_C?: string | number;
  steamOutTempDetails?: string;

  // Vacuum section
  vacuumEnabled?: boolean;
  vacuumPressure_barg?: string | number;
  vacuumPressureDetails?: string;
  vacuumTemp_C?: string | number;
  vacuumTempDetails?: string;

  // Regeneration section
  regenEnabled?: boolean;
  regenTemp_C?: string | number;
  regenTempDetails?: string;
  regenPressure_barg?: string | number;
  regenPressureDetails?: string;

  [key: string]: unknown;
}

export interface RegenVacuumSteamoutNodeData extends DiagramNodeData {
  regenVacuumSteamoutData?: RegenVacuumSteamoutData;
}

export const RegenVacuumSteamoutNode = memo(({ id, data, selected }: Props) => {
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

  const nodeData = (data as RegenVacuumSteamoutNodeData) || {};
  const d: RegenVacuumSteamoutData = nodeData.regenVacuumSteamoutData || {
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
  };

  const updateField = (
    field: keyof RegenVacuumSteamoutData,
    value: any
  ) => {
    const updated = { ...d, [field]: value };
    updateNodeData(id, {
      ...nodeData,
      regenVacuumSteamoutData: updated,
    });
  };

  const renderField = (
    label: string,
    val: string | number | undefined,
    fieldKey: keyof RegenVacuumSteamoutData,
    detailsKey: keyof RegenVacuumSteamoutData,
    unit: string,
    step: string = "any"
  ) => (
    <div className="space-y-1">
      <VesselFieldLabel label={label} unit={unit} />
      <div className="flex items-center gap-1">
        <Input
          type="number"
          step={step}
          value={val ?? ""}
          onChange={(e) => updateField(fieldKey, e.target.value)}
          className="h-7 text-xs flex-1 bg-white dark:bg-black"
        />
        <VesselInfoButton
          title={`${label} Details`}
          value={(d[detailsKey] as string) ?? ""}
          onChange={(v) => updateField(detailsKey, v)}
        />
      </div>
    </div>
  );

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
        widthClass="w-auto min-w-[340px] max-w-[480px]"
        showHandles={true}
      >
        {/* Header */}
        <VesselNodeHeader
          icon={<Flame size={18} />}
          title="Regeneration / Vacuum / Steamout"
          subtitle="Process Cycles & Operating Limits"
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Body Content */}
        {!isCollapsed && (
          <div className="p-3 space-y-3">
            {/* SECTION 1: STEAM OUT */}
            <div className="rounded-lg border border-border/80 p-2.5 space-y-2.5 bg-card">
              <VesselSectionHeader
                title="Steam Out"
                action={
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-form-primary">
                    <Checkbox
                      checked={!!d.steamOutEnabled}
                      onCheckedChange={(c) => updateField("steamOutEnabled", !!c)}
                    />
                    <span className="text-[10px]">Enable</span>
                  </label>
                }
              />

              <div
                className={cn(
                  "grid grid-cols-2 gap-2.5 transition-opacity",
                  !d.steamOutEnabled && "opacity-40 pointer-events-none"
                )}
              >
                {renderField(
                  "Steam Out Pressure",
                  d.steamOutPressure_barg,
                  "steamOutPressure_barg",
                  "steamOutPressureDetails",
                  "barg",
                  "0.1"
                )}
                {renderField(
                  "Steam Out Temp",
                  d.steamOutTemp_C,
                  "steamOutTemp_C",
                  "steamOutTempDetails",
                  "°C",
                  "1"
                )}
              </div>
            </div>

            {/* SECTION 2: VACUUM */}
            <div className="rounded-lg border border-border/80 p-2.5 space-y-2.5 bg-card">
              <VesselSectionHeader
                title="Vacuum"
                action={
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-form-primary">
                    <Checkbox
                      checked={!!d.vacuumEnabled}
                      onCheckedChange={(c) => updateField("vacuumEnabled", !!c)}
                    />
                    <span className="text-[10px]">Enable</span>
                  </label>
                }
              />

              <div
                className={cn(
                  "grid grid-cols-2 gap-2.5 transition-opacity",
                  !d.vacuumEnabled && "opacity-40 pointer-events-none"
                )}
              >
                {renderField(
                  "Vacuum Pressure",
                  d.vacuumPressure_barg,
                  "vacuumPressure_barg",
                  "vacuumPressureDetails",
                  "barg",
                  "0.05"
                )}
                {renderField(
                  "Vacuum Temp",
                  d.vacuumTemp_C,
                  "vacuumTemp_C",
                  "vacuumTempDetails",
                  "°C",
                  "1"
                )}
              </div>
            </div>

            {/* SECTION 3: REGENERATION */}
            <div className="rounded-lg border border-border/80 p-2.5 space-y-2.5 bg-card">
              <VesselSectionHeader
                title="Regeneration"
                action={
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-form-primary">
                    <Checkbox
                      checked={!!d.regenEnabled}
                      onCheckedChange={(c) => updateField("regenEnabled", !!c)}
                    />
                    <span className="text-[10px]">Enable</span>
                  </label>
                }
              />

              <div
                className={cn(
                  "grid grid-cols-2 gap-2.5 transition-opacity",
                  !d.regenEnabled && "opacity-40 pointer-events-none"
                )}
              >
                {renderField(
                  "Regen Temp",
                  d.regenTemp_C,
                  "regenTemp_C",
                  "regenTempDetails",
                  "°C",
                  "1"
                )}
                {renderField(
                  "Regen Pressure",
                  d.regenPressure_barg,
                  "regenPressure_barg",
                  "regenPressureDetails",
                  "barg",
                  "0.1"
                )}
              </div>
            </div>
          </div>
        )}
      </VesselNodeContainer>
    </>
  );
});

RegenVacuumSteamoutNode.displayName = "RegenVacuumSteamoutNode";
