"use client";

import React, { memo } from "react";
import { Position, type NodeProps, type Node } from "@xyflow/react";
import { Database } from "lucide-react";

import { useDiagramStore } from "@/modules/esp-flow/store";
import type { DiagramNodeData, DiagramNodeType } from "@/modules/esp-flow/types";
import type { VesselRootNodeData, VesselOrientation } from "@/modules/vessel-weight/schemas/vessel.schema";

import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import {
  VesselNodeContainer,
  VesselNodeToolbar,
  VesselNodeHeader,
  VesselNodeFooter,
  VesselFieldLabel,
} from "./VesselNodeBase";

type DiagramNode = Node<DiagramNodeData, DiagramNodeType>;
type Props = NodeProps<DiagramNode>;

export const VesselRootNode = memo(({ id, data, selected }: Props) => {
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  
  const duplicateSelected = useDiagramStore((s) => s.duplicateSelected);
  const resetNodesToDefault = useDiagramStore((s) => s.resetNodesToDefault);
  const deleteNode = (nodeId: string) => {
    useDiagramStore.setState((s) => ({
      nodes: s.nodes.filter((n) => n.id !== nodeId),
      edges: s.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }));
  };

  const d = data as unknown as VesselRootNodeData;

  const vessel = d.vessel || {
    vesselTag: "V-001",
    orientation: "VERTICAL",
    unitSystem: "SI",
    defaultMaterial: "CS_A516_70" as const,
    processFluidDensity_kg_m3: 1000,
    testFluidDensity_kg_m3: 1000,
    defaultDiameter_mm: 1000,
    defaultLength_mm: 2000,
  };

  const patchVessel = (p: Partial<typeof vessel>) => {
    updateNodeData(id, { vessel: { ...vessel, ...p } });
  };

  return (
    <>
      <VesselNodeToolbar
        id={id}
        selected={selected}
        toolbarPosition={Position.Top}
        onDuplicate={() => duplicateSelected()}
        onReset={() => resetNodesToDefault([id])}
        onDelete={() => deleteNode(id)}
      />

      <VesselNodeContainer
        id={id}
        data={data}
        selected={selected}
        dir="ltr"
        widthClass="w-auto min-w-[360px] max-w-[480px]"
        showHandles={true}
      >
        <VesselNodeHeader
          icon={<Database size={18} />}
          title="Vessel Global Hub"
          subtitle="Core Properties & Dimensions"
          badge={
            vessel.vesselTag ? (
              <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-form-primary/10 text-form-primary font-semibold border border-form-primary/20">
                {vessel.vesselTag}
              </span>
            ) : undefined
          }
        />

        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <VesselFieldLabel label="Tag Number" />
              <Input
                value={vessel.vesselTag}
                onChange={(e) => patchVessel({ vesselTag: e.target.value })}
                placeholder="e.g. V-101"
                className="h-8 text-xs bg-white dark:bg-black"
              />
            </div>
            <div className="space-y-1">
              <VesselFieldLabel label="Orientation" />
              <Combobox
                value={vessel.orientation}
                onChange={(val) => patchVessel({ orientation: val as VesselOrientation })}
                options={[
                  { value: "VERTICAL", label: "Vertical" },
                  { value: "HORIZONTAL", label: "Horizontal" }
                ]}
                className="h-8 text-xs w-full bg-white dark:bg-black"
              />
            </div>
          </div>

          <div className="space-y-1">
            <VesselFieldLabel label="Default Material" />
            <Combobox
              value={vessel.defaultMaterial}
              onChange={(val) => patchVessel({ defaultMaterial: val as any })}
              options={[
                { value: "CS_A516_70", label: "Carbon Steel (SA-516 Gr. 70)" },
                { value: "SS_304", label: "Stainless Steel (SA-240 304)" },
                { value: "SS_316L", label: "Stainless Steel (SA-240 316L)" },
                { value: "DUPLEX_2205", label: "Duplex 2205 (SA-240 2205)" }
              ]}
              className="h-8 text-xs w-full bg-white dark:bg-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 pb-2.5 border-b border-border">
            <div className="space-y-1">
              <VesselFieldLabel label="Global Diameter" unit="mm" />
              <Input
                type="number"
                value={vessel.defaultDiameter_mm || ""}
                onChange={(e) => patchVessel({ defaultDiameter_mm: Number(e.target.value) })}
                placeholder="e.g. 2000"
                className="h-8 text-xs bg-white dark:bg-black"
              />
            </div>
            <div className="space-y-1">
              <VesselFieldLabel label="Global Length" unit="mm" />
              <Input
                type="number"
                value={vessel.defaultLength_mm || ""}
                onChange={(e) => patchVessel({ defaultLength_mm: Number(e.target.value) })}
                placeholder="e.g. 6000"
                className="h-8 text-xs bg-white dark:bg-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pb-2.5 border-b border-border">
            <div className="space-y-1">
              <VesselFieldLabel label="Raw Plate Length" unit="mm" />
              <Input
                type="number"
                value={vessel.defaultRawPlateLength_mm || ""}
                onChange={(e) => patchVessel({ defaultRawPlateLength_mm: Number(e.target.value) })}
                placeholder="e.g. 6000"
                className="h-7 text-xs bg-white dark:bg-black"
              />
            </div>
            <div className="space-y-1">
              <VesselFieldLabel label="Raw Plate Width" unit="mm" />
              <Input
                type="number"
                value={vessel.defaultRawPlateWidth_mm || ""}
                onChange={(e) => patchVessel({ defaultRawPlateWidth_mm: Number(e.target.value) })}
                placeholder="e.g. 2000"
                className="h-7 text-xs bg-white dark:bg-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <VesselFieldLabel label="Operating Fluid Density" unit="kg/m³" />
              <Input
                type="number"
                value={vessel.processFluidDensity_kg_m3}
                onChange={(e) => patchVessel({ processFluidDensity_kg_m3: Number(e.target.value) })}
                className="h-7 text-xs bg-white dark:bg-black"
              />
            </div>
            <div className="space-y-1">
              <VesselFieldLabel label="Test Fluid Density" unit="kg/m³" />
              <Input
                type="number"
                value={vessel.testFluidDensity_kg_m3}
                onChange={(e) => patchVessel({ testFluidDensity_kg_m3: Number(e.target.value) })}
                className="h-7 text-xs bg-white dark:bg-black"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <VesselNodeFooter>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-form-primary/70 uppercase tracking-wider">
                {vessel.orientation} • {vessel.unitSystem}
              </span>
              {vessel.vesselTag && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-form-primary/10 text-form-primary font-bold">
                  {vessel.vesselTag}
                </span>
              )}
            </div>
            <span className="text-xs font-bold tabular-nums text-form-primary">
              Ø{vessel.defaultDiameter_mm || 1000}mm × L{vessel.defaultLength_mm || 2000}mm
            </span>
          </div>
        </VesselNodeFooter>
      </VesselNodeContainer>
    </>
  );
});

VesselRootNode.displayName = "VesselRootNode";
