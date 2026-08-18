"use client";

import React, { memo, useState } from "react";
import { type NodeProps, type Node } from "@xyflow/react";
import { Paintbrush } from "lucide-react";
import { useDiagramStore } from "@/modules/esp-flow/store";
import type { DiagramNodeData, DiagramNodeType } from "@/modules/esp-flow/types";
import { Checkbox } from "@/components/ui/checkbox";
import {
  VesselNodeContainer,
  VesselNodeToolbar,
  VesselNodeHeader,
  VesselSectionHeader,
} from "./VesselNodeBase";

type DiagramNode = Node<DiagramNodeData, DiagramNodeType>;
type Props = NodeProps<DiagramNode>;

export interface SurfacePrepData {
  // External Surface - Carbon Steel
  ext_cs_sandblast?: boolean;
  ext_cs_painting?: boolean;

  // External Surface - Stainless Steel
  ext_ss_acidCleaning?: boolean;
  ext_ss_passivation?: boolean;
  ext_ss_polishing?: boolean;
  ext_ss_degreasing?: boolean;

  // Internal Surface - Carbon Steel
  int_cs_sandblast?: boolean;
  int_cs_painting?: boolean;
  int_cs_coating?: boolean;

  // Internal Surface - Stainless Steel
  int_ss_acidCleaning?: boolean;
  int_ss_passivation?: boolean;
  int_ss_polishing?: boolean;
  int_ss_degreasing?: boolean;

  [key: string]: unknown;
}

export interface SurfacePrepNodeData extends DiagramNodeData {
  surfacePrepData?: SurfacePrepData;
}

export const SurfacePrepNode = memo(({ id, data, selected }: Props) => {
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

  const nodeData = (data as SurfacePrepNodeData) || {};
  const d: SurfacePrepData = nodeData.surfacePrepData || {
    ext_cs_sandblast: true,
    ext_cs_painting: true,
    int_cs_sandblast: true,
    int_cs_coating: true,
  };

  const updateField = <K extends keyof SurfacePrepData>(
    field: K,
    value: SurfacePrepData[K]
  ) => {
    const updated = { ...d, [field]: value };
    updateNodeData(id, {
      ...nodeData,
      surfacePrepData: updated,
    });
  };

  const renderCheckbox = (
    label: string,
    fieldKey: keyof SurfacePrepData
  ) => (
    <label className="flex items-center gap-2 cursor-pointer text-[11px] text-muted-foreground hover:text-foreground transition-colors select-none py-0.5">
      <Checkbox
        checked={!!d[fieldKey]}
        onCheckedChange={(c) => updateField(fieldKey, !!c)}
      />
      <span>{label}</span>
    </label>
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
          icon={<Paintbrush size={18} />}
          title="Surface Preparation"
          subtitle="Painting & Treatment"
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Body Content */}
        {!isCollapsed && (
          <div className="p-3 space-y-3">
            {/* SECTION 1: EXTERNAL SURFACE */}
            <div className="rounded-lg border border-border/80 p-2.5 space-y-2 bg-card">
              <VesselSectionHeader title="External Surface" />

              <div className="grid grid-cols-2 divide-x divide-border/50 text-xs">
                {/* Carbon Steel Column */}
                <div className="pe-3 space-y-1.5">
                  <div className="font-bold text-[10px] text-form-primary uppercase tracking-wider pb-1 border-b border-border/40">
                    Carbon Steel
                  </div>
                  <div className="space-y-1 pt-1">
                    {renderCheckbox("Sandblast 2-1/2", "ext_cs_sandblast")}
                    {renderCheckbox("Painting", "ext_cs_painting")}
                  </div>
                </div>

                {/* Stainless Steel Column */}
                <div className="ps-3 space-y-1.5">
                  <div className="font-bold text-[10px] text-form-primary uppercase tracking-wider pb-1 border-b border-border/40">
                    Stainless Steel
                  </div>
                  <div className="space-y-1 pt-1">
                    {renderCheckbox("Acid Cleaning", "ext_ss_acidCleaning")}
                    {renderCheckbox("Passivation", "ext_ss_passivation")}
                    {renderCheckbox("Polishing", "ext_ss_polishing")}
                    {renderCheckbox("Degreasing", "ext_ss_degreasing")}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: INTERNAL SURFACE */}
            <div className="rounded-lg border border-border/80 p-2.5 space-y-2 bg-card">
              <VesselSectionHeader title="Internal Surface" />

              <div className="grid grid-cols-2 divide-x divide-border/50 text-xs">
                {/* Carbon Steel Column */}
                <div className="pe-3 space-y-1.5">
                  <div className="font-bold text-[10px] text-form-primary uppercase tracking-wider pb-1 border-b border-border/40">
                    Carbon Steel
                  </div>
                  <div className="space-y-1 pt-1">
                    {renderCheckbox("Sandblast 2-1/2", "int_cs_sandblast")}
                    {renderCheckbox("Painting", "int_cs_painting")}
                    {renderCheckbox("Coating", "int_cs_coating")}
                  </div>
                </div>

                {/* Stainless Steel Column */}
                <div className="ps-3 space-y-1.5">
                  <div className="font-bold text-[10px] text-form-primary uppercase tracking-wider pb-1 border-b border-border/40">
                    Stainless Steel
                  </div>
                  <div className="space-y-1 pt-1">
                    {renderCheckbox("Acid Cleaning", "int_ss_acidCleaning")}
                    {renderCheckbox("Passivation", "int_ss_passivation")}
                    {renderCheckbox("Polishing", "int_ss_polishing")}
                    {renderCheckbox("Degreasing", "int_ss_degreasing")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </VesselNodeContainer>
    </>
  );
});

SurfacePrepNode.displayName = "SurfacePrepNode";
