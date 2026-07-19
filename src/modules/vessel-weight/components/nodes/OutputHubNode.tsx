'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeToolbar, type NodeProps } from '@xyflow/react';
import { useTranslations } from 'next-intl';
import { Trash2, BoxSelect, Download, Printer } from 'lucide-react';
import { useVesselWeightStore } from '../../store/useVesselWeightStore';

export const OutputHubNode = memo(({ id, selected }: NodeProps) => {
  const t = useTranslations('VesselWeight');
  const deleteNode = useVesselWeightStore((s) => s.deleteNode);
  const weightSummary = useVesselWeightStore((s) => s.weightSummary);
  const nodes = useVesselWeightStore((s) => s.nodes);

  const handleExportCSV = () => {
    // Generate MTO Data
    const mtoRows = nodes
      .filter(n => !n.data?.excludeFromWeight && n.type !== 'vesselRootNode' && n.type !== 'outputHubNode')
      .map(n => {
        const d = n.data as any;
        let weight = d.calculatedWeight || d.totalFabricatedWeight || 0;
        let category = n.type.replace('Node', '');
        return {
          componentId: n.id,
          category: category.charAt(0).toUpperCase() + category.slice(1),
          description: d.description || `${category} component`,
          weight,
          status: d.status || 'Preliminary',
        };
      });

    const header = "ID,Category,Description,Status,Weight (kg)\n";
    const rows = mtoRows.map(r => `${r.componentId},${r.category},"${r.description}",${r.status},${r.weight.toFixed(1)}`).join("\n");
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

  // Aggregate total materials
  let totalElectrode = 0;
  let totalArea = 0;
  nodes.forEach(n => {
    const d = n.data as any;
    if (d.electrodeWeight_kg) totalElectrode += d.electrodeWeight_kg;
    if (d.area_m2) totalArea += d.area_m2;
  });

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top} className="flex gap-2">
        <button
          onClick={() => deleteNode(id)}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-danger/10 text-danger hover:bg-danger/20 transition-colors shadow-sm"
          title="Delete Node"
        >
          <Trash2 size={16} />
        </button>
      </NodeToolbar>
      
      <div dir="auto" className="w-[340px] rounded-xl border-4 border-slate-700 bg-card shadow-2xl overflow-hidden transition-all hover:border-slate-500">
        <Handle type="target" position={Position.Top} className="w-8 h-4 rounded-b-md rounded-t-none bg-slate-700 border-none" />
        
        <div className="bg-slate-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-white shadow-inner">
              <BoxSelect size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Output Hub</h3>
              <p className="text-[10px] text-slate-300 uppercase tracking-wider">Final Aggregation</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={handleExportCSV} className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded hover:bg-slate-600 transition-colors" title="Export CSV">
              <Download size={14} />
            </button>
            <button onClick={handlePrint} className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded hover:bg-slate-600 transition-colors" title="Print PDF Report">
              <Printer size={14} />
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 p-2 rounded-lg border border-border">
              <span className="block text-[10px] font-semibold text-muted-foreground uppercase">Fab. Weight</span>
              <span className="text-sm font-bold text-foreground">{(weightSummary?.fabricatedWeight || 0).toLocaleString(undefined, {maximumFractionDigits:0})} kg</span>
            </div>
            <div className="bg-muted/30 p-2 rounded-lg border border-border">
              <span className="block text-[10px] font-semibold text-muted-foreground uppercase">Raw Weight</span>
              <span className="text-sm font-bold text-foreground">{(weightSummary?.rawWeight || 0).toLocaleString(undefined, {maximumFractionDigits:0})} kg</span>
            </div>
            <div className="bg-blue-900/10 p-2 rounded-lg border border-blue-900/20">
              <span className="block text-[10px] font-semibold text-blue-600/70 uppercase">Op. Weight</span>
              <span className="text-sm font-bold text-blue-600">{(weightSummary?.operatingWeight || 0).toLocaleString(undefined, {maximumFractionDigits:0})} kg</span>
            </div>
            <div className="bg-cyan-900/10 p-2 rounded-lg border border-cyan-900/20">
              <span className="block text-[10px] font-semibold text-cyan-600/70 uppercase">Test Weight</span>
              <span className="text-sm font-bold text-cyan-600">{(weightSummary?.hydrotestWeight || 0).toLocaleString(undefined, {maximumFractionDigits:0})} kg</span>
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Materials Consumed</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Total Electrode</span>
                <span className="font-bold text-foreground">{totalElectrode.toFixed(1)} kg</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Total Plate Area</span>
                <span className="font-bold text-foreground">{totalArea.toFixed(1)} m²</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

OutputHubNode.displayName = 'OutputHubNode';
