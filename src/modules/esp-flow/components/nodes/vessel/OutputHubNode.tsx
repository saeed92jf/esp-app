"use client";

import React, { memo, useMemo } from "react";
import { Position, type NodeProps, type Node } from "@xyflow/react";
import { BoxSelect, Download, Printer } from "lucide-react";

import { useDiagramStore } from "@/modules/esp-flow/store";
import type { DiagramNodeData, DiagramNodeType } from "@/modules/esp-flow/types";

import { Button } from "@/components/ui/button";

import {
  VesselNodeContainer,
  VesselNodeToolbar,
  VesselNodeHeader,
  VesselNodeFooter,
  VesselFooterHighlight,
  VesselSectionHeader,
} from "./VesselNodeBase";

type DiagramNode = Node<DiagramNodeData, DiagramNodeType>;
type Props = NodeProps<DiagramNode>;

export const OutputHubNode = memo(({ id, data, selected }: Props) => {
  const nodes = useDiagramStore((s) => s.nodes);
  
  const duplicateSelected = useDiagramStore((s) => s.duplicateSelected);
  const resetNodesToDefault = useDiagramStore((s) => s.resetNodesToDefault);
  const deleteNode = (nodeId: string) => {
    useDiagramStore.setState((s) => ({
      nodes: s.nodes.filter((n) => n.id !== nodeId),
      edges: s.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }));
  };

  const weightSummary = useMemo(() => {
    let fabricated = 0, raw = 0, internals = 0, vol = 0;
    let opDensity = 1000, testDensity = 1000;
    
    nodes.forEach((n) => {
      const d = n.data as DiagramNodeData;
      if (d.excludeFromWeight) return;
      if (d.calculatedWeight) fabricated += d.calculatedWeight;
      if (d.totalFabricatedWeight) fabricated += d.totalFabricatedWeight;
      if (d.rawWeight) raw += d.rawWeight;
      if (d.internalVolume) vol += d.internalVolume;
      
      if (n.type === "internalsNode" || n.type === "mistEliminatorNode") {
        if (d.calculatedWeight) internals += d.calculatedWeight;
      }
    });
    
    const erection = fabricated + internals;
    return {
      fabricatedWeight: fabricated,
      rawWeight: raw > 0 ? raw : fabricated * 1.15,
      erectionWeight: erection,
      shippingWeight: erection,
      operatingWeight: erection + vol * opDensity,
      hydrotestWeight: erection + vol * testDensity,
    };
  }, [nodes]);

  const handleExportCSV = () => {
    const mtoRows = nodes
      .filter((n) => !n.data?.excludeFromWeight && n.type !== "outputHubNode")
      .map((n) => {
        const d = n.data as any;
        const weight = d.calculatedWeight || d.totalFabricatedWeight || 0;
        const category = n.type ? n.type.replace("Node", "") : "Unknown";
        return {
          componentId: n.id,
          category: category.charAt(0).toUpperCase() + category.slice(1),
          description: d.description || `${category} component`,
          weight,
          status: d.status || "Preliminary",
        };
      });

    const header = "ID,Category,Description,Status,Weight (kg)\n";
    const rows = mtoRows.map((r) => `${r.componentId},${r.category},"${r.description}",${r.status},${r.weight.toFixed(1)}`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(header + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "vessel_mto_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  let totalElectrode = 0;
  let totalArea = 0;
  nodes.forEach((n) => {
    const d = n.data as any;
    if (d.electrodeWeight_kg) totalElectrode += d.electrodeWeight_kg;
    if (d.area_m2) totalArea += d.area_m2;
  });

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
        widthClass="w-auto min-w-[340px] max-w-[480px]"
        showHandles={true}
      >
        <VesselNodeHeader
          icon={<BoxSelect size={18} />}
          title="Output Hub"
          subtitle="Final Weight Aggregation & Rollup"
          actions={
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExportCSV}
                className="h-7 w-7 text-form-primary/80 hover:text-form-primary hover:bg-form-primary/10"
                title="Export CSV"
              >
                <Download size={13} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrint}
                className="h-7 w-7 text-form-primary/80 hover:text-form-primary hover:bg-form-primary/10"
                title="Print PDF Report"
              >
                <Printer size={13} />
              </Button>
            </div>
          }
        />

        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/30 p-2 rounded-lg border border-border">
              <span className="block text-[10px] font-semibold text-muted-foreground uppercase">Fab. Weight</span>
              <span className="text-sm font-bold text-foreground">{(weightSummary.fabricatedWeight || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} kg</span>
            </div>
            <div className="bg-muted/30 p-2 rounded-lg border border-border">
              <span className="block text-[10px] font-semibold text-muted-foreground uppercase">Raw Weight</span>
              <span className="text-sm font-bold text-foreground">{(weightSummary.rawWeight || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} kg</span>
            </div>
            <div className="bg-form-primary/5 p-2 rounded-lg border border-form-primary/20">
              <span className="block text-[10px] font-semibold text-form-primary/70 uppercase">Op. Weight</span>
              <span className="text-sm font-bold text-form-primary">{(weightSummary.operatingWeight || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} kg</span>
            </div>
            <div className="bg-form-primary/5 p-2 rounded-lg border border-form-primary/20">
              <span className="block text-[10px] font-semibold text-form-primary/70 uppercase">Test Weight</span>
              <span className="text-sm font-bold text-form-primary">{(weightSummary.hydrotestWeight || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} kg</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border space-y-2">
            <VesselSectionHeader title="Total Materials Consumed" />
            <div className="space-y-1.5 px-0.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground text-[10px]">Total Electrode:</span>
                <span className="font-bold text-foreground">{totalElectrode.toFixed(1)} kg</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground text-[10px]">Total Plate Area:</span>
                <span className="font-bold text-foreground">{totalArea.toFixed(1)} m²</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <VesselNodeFooter>
          <VesselFooterHighlight
            label="Total Erection Weight"
            value={(weightSummary.erectionWeight || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}
            unit="kg"
          />
        </VesselNodeFooter>
      </VesselNodeContainer>
    </>
  );
});

OutputHubNode.displayName = "OutputHubNode";
