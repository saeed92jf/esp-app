"use client";

import React, { memo } from "react";
import { Position, type NodeProps, type Node } from "@xyflow/react";
import { Settings } from "lucide-react";

import { useDiagramStore } from "@/modules/esp-flow/store";
import type { DiagramNodeData, DiagramNodeType } from "@/modules/esp-flow/types";
import {
  VesselNodeContainer,
  VesselNodeToolbar,
  VesselNodeHeader,
  VesselNodeFooter,
} from "./VesselNodeBase";

type DiagramNode = Node<DiagramNodeData, DiagramNodeType>;
type Props = NodeProps<DiagramNode>;

export const ProjectSettingsNode = memo(({ id, data, selected }: Props) => {
  const duplicateSelected = useDiagramStore((s) => s.duplicateSelected);
  const resetNodesToDefault = useDiagramStore((s) => s.resetNodesToDefault);
  const deleteNode = (nodeId: string) => {
    useDiagramStore.setState((s) => ({
      nodes: s.nodes.filter((n) => n.id !== nodeId),
      edges: s.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }));
  };

  return (
    <VesselNodeContainer id={id} data={data} selected={selected}>
      <VesselNodeToolbar
        id={id}
        selected={selected}
        onDelete={() => deleteNode(id)}
        onDuplicate={duplicateSelected}
        onReset={() => resetNodesToDefault([id])}
      />

      <VesselNodeHeader
        icon={<Settings className="size-4" />}
        title="Project Settings"
        subtitle="Global configuration"
      />

      {/* ── Body — placeholder content ─────────────────────────────── */}
      <div className="flex flex-col items-center justify-center gap-3 px-5 py-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-form-primary/10 text-form-primary">
          <Settings className="size-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Project Settings</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This node will hold global project configuration.<br />
            Content will be added later.
          </p>
        </div>
      </div>

      <VesselNodeFooter>
        <p className="text-[10px] text-center text-muted-foreground">End of settings</p>
      </VesselNodeFooter>
    </VesselNodeContainer>
  );
});

ProjectSettingsNode.displayName = "ProjectSettingsNode";
