"use client";

import React, { memo } from "react";
import { type NodeProps, type Node } from "@xyflow/react";
import { Layers } from "lucide-react";
import { useDiagramStore } from "@/modules/claude-flow/store";
import type { DiagramNodeData, DiagramNodeType } from "@/modules/claude-flow/types";
import type { InternalsNodeData } from "@/modules/vessel-weight/schemas/internals.schema";
import { Input } from "@/components/ui/input";
import {
  VesselNodeContainer,
  VesselNodeToolbar,
  VesselNodeHeader,
  VesselNodeFooter,
  VesselFooterHighlight,
  VesselSectionHeader,
  VesselFieldLabel,
} from "./VesselNodeBase";

type DiagramNode = Node<DiagramNodeData, DiagramNodeType>;
type Props = NodeProps<DiagramNode>;

export const InternalsNode = memo(({ id, data, selected }: Props) => {
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  
  const duplicateSelected = useDiagramStore((s) => s.duplicateSelected);
  const resetNodesToDefault = useDiagramStore((s) => s.resetNodesToDefault);
  const deleteNode = (nodeId: string) => {
    useDiagramStore.setState((s) => ({
      nodes: s.nodes.filter((n) => n.id !== nodeId),
      edges: s.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }));
  };

  const d = data as unknown as InternalsNodeData;
  const customW = d.customInternalsWeight_kg || 0;

  const patchCustom = (w: number) => {
    updateNodeData(id, { 
      customInternalsWeight_kg: w,
      calculatedWeight: w 
    });
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
        widthClass="w-auto min-w-[340px] max-w-[480px]"
        showHandles={true}
      >
        <VesselNodeHeader
          icon={<Layers size={18} />}
          title="Internals"
          subtitle="Trays, Packing & Grid Supports"
        />

        <div className="p-3 space-y-3">
          <div className="rounded-lg border border-border/80 p-2.5 space-y-2.5 bg-card">
            <VesselSectionHeader title="Custom Internals (Trays, Packing)" />

            <div className="space-y-1">
              <VesselFieldLabel label="Total Internals Weight" unit="kg" />
              <Input 
                type="number" 
                value={customW || ""} 
                onChange={(e) => patchCustom(Number(e.target.value))}
                className="h-7 text-xs bg-white dark:bg-black"
                placeholder="0.0"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <VesselNodeFooter>
          <VesselFooterHighlight
            label="Total Internals Weight"
            value={(d.calculatedWeight ?? 0).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            unit="kg"
          />
        </VesselNodeFooter>
      </VesselNodeContainer>
    </>
  );
});

InternalsNode.displayName = "InternalsNode";
