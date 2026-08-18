"use client";

import React, { memo, useState } from "react";
import { type NodeProps, type Node } from "@xyflow/react";
import { Layers } from "lucide-react";
import { useDiagramStore } from "@/modules/esp-flow/store";
import type { DiagramNodeData, DiagramNodeType } from "@/modules/esp-flow/types";
import { Input } from "@/components/ui/input";
import {
  VesselNodeContainer,
  VesselNodeToolbar,
  VesselNodeHeader,
  VesselNodeFooter,
  VesselFooterRow,
  VesselFooterHighlight,
  VesselSectionHeader,
  VesselFieldLabel,
  VesselInfoButton,
} from "./VesselNodeBase";

type DiagramNode = Node<DiagramNodeData, DiagramNodeType>;
type Props = NodeProps<DiagramNode>;

export interface JacketData {
  // Upper Condition Set
  upperOperatingTemp_C?: string | number;
  upperOperatingTempDetails?: string;
  upperDesignTemp_C?: string | number;
  upperDesignTempDetails?: string;
  upperHydrotestTemp_C?: string | number;
  upperHydrotestTempDetails?: string;
  upperMdmt_C?: string | number;
  upperMdmtDetails?: string;

  upperOperatingPressure_barg?: string | number;
  upperOperatingPressureDetails?: string;
  upperDesignPressure_barg?: string | number;
  upperDesignPressureDetails?: string;
  upperHydrotestPressure_barg?: string | number;
  upperHydrotestPressureDetails?: string;
  upperExternalPressure_barg?: string | number;
  upperExternalPressureDetails?: string;

  // Lower Condition Set
  lowerOperatingTemp_C?: string | number;
  lowerOperatingTempDetails?: string;
  lowerDesignTemp_C?: string | number;
  lowerDesignTempDetails?: string;
  lowerHydrotestTemp_C?: string | number;
  lowerHydrotestTempDetails?: string;
  lowerMat_C?: string | number;
  lowerMatDetails?: string;
  lowerMdmt_C?: string | number;
  lowerMdmtDetails?: string;

  lowerOperatingPressure_barg?: string | number;
  lowerOperatingPressureDetails?: string;
  lowerDesignPressure_barg?: string | number;
  lowerDesignPressureDetails?: string;
  lowerHydrotestPressure_barg?: string | number;
  lowerHydrotestPressureDetails?: string;

  [key: string]: unknown;
}

export interface JacketNodeData extends DiagramNodeData {
  jacketData?: JacketData;
}

export const JacketNode = memo(({ id, data, selected }: Props) => {
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

  const nodeData = (data as JacketNodeData) || {};
  const d: JacketData = nodeData.jacketData || {
    upperOperatingTemp_C: "150",
    upperDesignTemp_C: "180",
    upperHydrotestTemp_C: "20",
    upperMdmt_C: "-20",
    upperOperatingPressure_barg: "6.0",
    upperDesignPressure_barg: "8.0",
    upperHydrotestPressure_barg: "12.0",
    upperExternalPressure_barg: "1.0",

    lowerOperatingTemp_C: "120",
    lowerDesignTemp_C: "150",
    lowerHydrotestTemp_C: "20",
    lowerMat_C: "100",
    lowerMdmt_C: "-20",
    lowerOperatingPressure_barg: "4.0",
    lowerDesignPressure_barg: "6.0",
    lowerHydrotestPressure_barg: "9.0",
  };

  const updateField = <K extends keyof JacketData>(
    field: K,
    value: JacketData[K]
  ) => {
    const updated = { ...d, [field]: value };
    updateNodeData(id, {
      ...nodeData,
      jacketData: updated,
    });
  };

  const renderField = (
    label: string,
    val: string | number | undefined,
    fieldKey: keyof JacketData,
    detailsKey: keyof JacketData,
    unit: string
  ) => (
    <div className="space-y-1">
      <VesselFieldLabel label={label} unit={unit} />
      <div className="flex items-center gap-1">
        <Input
          type="number"
          step="any"
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
        widthClass="w-auto min-w-[380px] max-w-[540px]"
        showHandles={true}
      >
        {/* Header */}
        <VesselNodeHeader
          icon={<Layers size={18} />}
          title="Jacket"
          subtitle="Operating & Design Conditions"
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Body Content */}
        {!isCollapsed && (
          <div className="p-3 space-y-3">
            {/* UPPER CONDITION BLOCK */}
            <div className="rounded-lg border border-border/80 p-2.5 space-y-2.5 bg-card">
              <VesselSectionHeader title="Condition 1 (Main Shell / Jacket)" />

              <div className="grid grid-cols-2 gap-2.5">
                {/* Left column (Temperatures) */}
                <div className="space-y-2">
                  {renderField(
                    "Operating Temp",
                    d.upperOperatingTemp_C,
                    "upperOperatingTemp_C",
                    "upperOperatingTempDetails",
                    "°C"
                  )}
                  {renderField(
                    "Design Temp",
                    d.upperDesignTemp_C,
                    "upperDesignTemp_C",
                    "upperDesignTempDetails",
                    "°C"
                  )}
                  {renderField(
                    "Hydrotest Temp",
                    d.upperHydrotestTemp_C,
                    "upperHydrotestTemp_C",
                    "upperHydrotestTempDetails",
                    "°C"
                  )}
                  {renderField(
                    "MDMT",
                    d.upperMdmt_C,
                    "upperMdmt_C",
                    "upperMdmtDetails",
                    "°C"
                  )}
                </div>

                {/* Right column (Pressures) */}
                <div className="space-y-2">
                  {renderField(
                    "Operating Press.",
                    d.upperOperatingPressure_barg,
                    "upperOperatingPressure_barg",
                    "upperOperatingPressureDetails",
                    "barg"
                  )}
                  {renderField(
                    "Design Press.",
                    d.upperDesignPressure_barg,
                    "upperDesignPressure_barg",
                    "upperDesignPressureDetails",
                    "barg"
                  )}
                  {renderField(
                    "Hydrotest Press.",
                    d.upperHydrotestPressure_barg,
                    "upperHydrotestPressure_barg",
                    "upperHydrotestPressureDetails",
                    "barg"
                  )}
                  {renderField(
                    "External Press.",
                    d.upperExternalPressure_barg,
                    "upperExternalPressure_barg",
                    "upperExternalPressureDetails",
                    "barg"
                  )}
                </div>
              </div>
            </div>

            {/* LOWER CONDITION BLOCK */}
            <div className="rounded-lg border border-border/80 p-2.5 space-y-2.5 bg-card">
              <VesselSectionHeader title="Condition 2 (Chamber / Alternate)" />

              <div className="grid grid-cols-2 gap-2.5">
                {/* Left column (Temperatures) */}
                <div className="space-y-2">
                  {renderField(
                    "Operating Temp",
                    d.lowerOperatingTemp_C,
                    "lowerOperatingTemp_C",
                    "lowerOperatingTempDetails",
                    "°C"
                  )}
                  {renderField(
                    "Design Temp",
                    d.lowerDesignTemp_C,
                    "lowerDesignTemp_C",
                    "lowerDesignTempDetails",
                    "°C"
                  )}
                  {renderField(
                    "Hydrotest Temp",
                    d.lowerHydrotestTemp_C,
                    "lowerHydrotestTemp_C",
                    "lowerHydrotestTempDetails",
                    "°C"
                  )}
                  {renderField(
                    "MAT",
                    d.lowerMat_C,
                    "lowerMat_C",
                    "lowerMatDetails",
                    "°C"
                  )}
                  {renderField(
                    "MDMT",
                    d.lowerMdmt_C,
                    "lowerMdmt_C",
                    "lowerMdmtDetails",
                    "°C"
                  )}
                </div>

                {/* Right column (Pressures) */}
                <div className="space-y-2">
                  {renderField(
                    "Operating Press.",
                    d.lowerOperatingPressure_barg,
                    "lowerOperatingPressure_barg",
                    "lowerOperatingPressureDetails",
                    "barg"
                  )}
                  {renderField(
                    "Design Press.",
                    d.lowerDesignPressure_barg,
                    "lowerDesignPressure_barg",
                    "lowerDesignPressureDetails",
                    "barg"
                  )}
                  {renderField(
                    "Hydrotest Press.",
                    d.lowerHydrotestPressure_barg,
                    "lowerHydrotestPressure_barg",
                    "lowerHydrotestPressureDetails",
                    "barg"
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </VesselNodeContainer>
    </>
  );
});

JacketNode.displayName = "JacketNode";
