'use client';

import React, { memo, useState } from 'react';
import { Handle, Position, NodeToolbar, type NodeProps } from '@xyflow/react';
import { useTranslations } from 'next-intl';
import { Trash2, Box, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useVesselWeightStore } from '../../store/useVesselWeightStore';
import type { HeadNodeData, Head, HeadType, HeadPosition } from '../../schemas/head.schema';
import { calcElliptical21HeadWeight, calcTorishericalHeadWeight, calcHemisphericalHeadWeight, calcHeadBlankWeight } from '../../calculations/head.calc';
import { calcElectrodeConsumption, calcShellWeldLengths } from '../../calculations/weld.calc';
import { PipeDimensions, type NPS, type PipeSchedule } from '../../calculations/pipe.data';

const inputCls =
  'w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors';
const labelCls = 'block text-[9px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider truncate';

function makeHead(id: string): Head {
  return {
    headId: id,
    headType: 'ELLIPTICAL_2_1',
    position: 'TOP',
    insideDiameter_mm: 1000,
    thicknessAfterForming_mm: 10,
    thicknessBeforeForming_mm: 12,
    straightFlange_mm: 50,
    blankDiameter_mm: 1200,
    crownRadius_mm: 1000,
    knuckleRadius_mm: 100,
    formingType: 'COLD',
    thinningAllowance_pct: 10,
    material: 'CS_A516_70',
    isSegmented: false,
    numberOfPetals: 0,
    crownPieceIncluded: false,
    nozzleOpeningsOnHead: [],
    longitudinalWeldSeams: 0,
    circumferentialWeldSeams: 1,
    longitudinalRadiography: 'SPOT',
    circumferentialRadiography: 'SPOT',
    pipeThicknessTolerance_pct: 12.5,
  };
}

export const HeadNode = memo(({ id, data, selected }: NodeProps) => {
  const t = useTranslations('VesselWeight');
  const d = data as HeadNodeData;
  const updateNodeData = useVesselWeightStore((s) => s.updateNodeData);
  const deleteNode = useVesselWeightStore((s) => s.deleteNode);
  const globalNodes = useVesselWeightStore((s) => s.nodes);
  
  const vesselRoot = globalNodes.find(n => n.type === 'vesselRootNode')?.data?.vessel as any;
  const isVertical = vesselRoot?.orientation === 'VERTICAL';

  const [expandedHead, setExpandedHead] = useState<string | null>(null);

  const heads = d.heads && d.heads.length > 0 ? d.heads : [makeHead('h1')];

  const recalculate = (newHeads: Head[]) => {
    let totalFab = 0;
    let totalRaw = 0;
    let totalArea = 0;
    let totalVol = 0;
    let totalElec = 0;
    let totalWeldLen = 0;
    let maxElongation = 0;

    newHeads.forEach(h => {
      let result = { weight_kg: 0, internalVolume_m3: 0, depth_mm: 0, area_m2: 0 };
      const density = h.material?.startsWith('SS') ? 8000 : 7850;
      
      if (h.headType === 'ELLIPTICAL_2_1') {
        result = calcElliptical21HeadWeight(h.insideDiameter_mm, h.thicknessAfterForming_mm, h.straightFlange_mm, density);
      } else if (h.headType === 'TORISPHERICAL_ASME' || h.headType === 'TORISPHERICAL_KORBBOGEN' || h.headType === 'TORISPHERICAL_DIN28011') {
        result = calcTorishericalHeadWeight(h.insideDiameter_mm, h.thicknessAfterForming_mm, h.straightFlange_mm, h.crownRadius_mm || h.insideDiameter_mm, h.knuckleRadius_mm || (h.insideDiameter_mm * 0.1), density);
      } else if (h.headType === 'HEMISPHERICAL' || h.headType === 'STANDARD_CAP') {
        result = calcHemisphericalHeadWeight(h.insideDiameter_mm, h.thicknessAfterForming_mm, h.straightFlange_mm, density);
      }

      const rawWeight = calcHeadBlankWeight(h.blankDiameter_mm || (h.insideDiameter_mm + 200), h.thicknessBeforeForming_mm, density);

      // Auto seam calculation based on blank diameter vs raw plate
      let actualLongSeams = h.longitudinalWeldSeams;
      let actualCircSeams = h.circumferentialWeldSeams; // usually 1 connecting to shell

      if (h.rawPlateWidth_mm && h.rawPlateWidth_mm > 0) {
        const blankDia = h.blankDiameter_mm || (h.insideDiameter_mm + 200);
        const pieces = Math.ceil(blankDia / h.rawPlateWidth_mm);
        if (pieces > 1) {
          actualLongSeams = pieces - 1;
        } else {
          actualLongSeams = 0;
        }
        h.longitudinalWeldSeams = actualLongSeams;
      }

      let weldLength_m = 0;
      if (h.isSegmented && h.numberOfPetals > 0) {
        const arc_m = ((h.insideDiameter_mm / 2) * Math.PI / 2) / 1000;
        weldLength_m = arc_m * h.numberOfPetals;
        if (h.crownPieceIncluded) {
          weldLength_m += Math.PI * (h.insideDiameter_mm * 0.3 / 1000); 
        }
      } else if (actualLongSeams > 0) {
        // Approximate the length of parallel seams across a circular blank
        const blankDia_m = (h.blankDiameter_mm || (h.insideDiameter_mm + 200)) / 1000;
        weldLength_m = blankDia_m * actualLongSeams * 0.8; // 0.8 average chord factor
      }

      // Circumferential seam to connect to shell
      if (actualCircSeams > 0) {
        weldLength_m += Math.PI * (h.insideDiameter_mm / 1000);
      }

      const elec = calcElectrodeConsumption(weldLength_m, h.thicknessAfterForming_mm);

      // Elongation
      let el = 0;
      const rf = (h.insideDiameter_mm / 2) + (h.thicknessAfterForming_mm / 2);
      if (h.headType === 'HEMISPHERICAL') {
        el = (75 * h.thicknessAfterForming_mm) / rf;
      } else {
        el = (50 * h.thicknessAfterForming_mm) / rf;
      }
      if (el > maxElongation) maxElongation = el;

      totalFab += result.weight_kg;
      totalRaw += rawWeight;
      totalArea += result.area_m2;
      totalVol += result.internalVolume_m3;
      totalElec += elec;
      totalWeldLen += weldLength_m;
    });

    updateNodeData(id, { 
      heads: newHeads, 
      calculatedWeight: totalFab,
      rawWeight: totalRaw,
      internalVolume: totalVol,
      area_m2: totalArea,
      electrodeWeight_kg: totalElec,
      weldLength_m: totalWeldLen,
      elongation_pct: maxElongation
    } as any);
  };

  const updateHead = (index: number, field: keyof Head, value: any) => {
    const newHeads = [...heads];
    let headToUpdate = { ...newHeads[index], [field]: value };

    if (headToUpdate.headType === 'STANDARD_CAP' && headToUpdate.pipeNominalSize_inch && headToUpdate.pipeSchedule) {
      const npsData = PipeDimensions[headToUpdate.pipeNominalSize_inch as NPS];
      if (npsData) {
        const schThk = npsData.schedules[headToUpdate.pipeSchedule as PipeSchedule];
        if (schThk) {
          headToUpdate.thicknessAfterForming_mm = schThk;
          headToUpdate.thicknessBeforeForming_mm = schThk;
          headToUpdate.insideDiameter_mm = npsData.OD_mm - (2 * schThk);
          headToUpdate.blankDiameter_mm = npsData.OD_mm; 
        }
      }
    }

    newHeads[index] = headToUpdate;
    recalculate(newHeads);
  };

  const addHead = () => {
    recalculate([...heads, makeHead(`h${Date.now()}`)]);
  };

  const removeHead = (index: number) => {
    if (heads.length > 1) {
      recalculate(heads.filter((_, i) => i !== index));
    }
  };

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top} className="flex gap-2">
        <button
          onClick={() => deleteNode(id)}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-danger/10 text-danger hover:bg-danger/20 transition-colors shadow-sm"
        >
          <Trash2 size={16} />
        </button>
      </NodeToolbar>
      
      <div dir="auto" className="w-[360px] rounded-lg border border-border bg-card shadow-sm overflow-hidden transition-all hover:border-amber-500/50">
        <Handle type="target" position={Position.Top} className="w-3 h-3 bg-amber-500 border-2 border-slate-900" />
        
        <div className="bg-amber-500/10 px-3 py-2 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <Box size={14} className="text-amber-500" />
            <span className="font-semibold text-xs text-foreground">Heads ({heads.length})</span>
          </div>
          <button 
            onClick={addHead}
            className="flex items-center gap-1 bg-background border border-border hover:bg-muted text-[9px] font-semibold px-2 py-1 rounded"
          >
            <Plus size={10} /> Add Head
          </button>
        </div>
        
        <div className="p-3 space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
          {heads.map((head, idx) => {
            const isExpanded = expandedHead === head.headId;
            return (
              <div key={head.headId} className="rounded-lg border border-border bg-muted/10 overflow-hidden relative group">
                <div 
                  className="p-2 bg-muted/30 flex items-center justify-between cursor-pointer hover:bg-muted/50"
                  onClick={() => setExpandedHead(isExpanded ? null : head.headId)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Head {idx + 1}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">{head.position}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {heads.length > 1 && (
                      <button onClick={(e) => { e.stopPropagation(); removeHead(idx); }} className="text-red-500 hover:text-red-600 p-1">
                        <Trash2 size={12} />
                      </button>
                    )}
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-2 space-y-3 bg-card border-b border-border">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <label className={labelCls}>Position</label>
                        <select className={inputCls} value={head.position} onChange={e => updateHead(idx, 'position', e.target.value as HeadPosition)}>
                          {isVertical ? (
                            <>
                              <option value="TOP">Top Head</option>
                              <option value="BOTTOM">Bottom Head</option>
                            </>
                          ) : (
                            <>
                              <option value="LEFT">Left Head</option>
                              <option value="RIGHT">Right Head</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className={labelCls}>Head Type</label>
                        <select className={inputCls} value={head.headType} onChange={e => updateHead(idx, 'headType', e.target.value as HeadType)}>
                          <option value="ELLIPTICAL_2_1">Elliptical 2:1</option>
                          <option value="TORISPHERICAL_ASME">Torispherical 10% (ASME)</option>
                          <option value="TORISPHERICAL_DIN28011">Klöpper (DIN)</option>
                          <option value="HEMISPHERICAL">Hemispherical</option>
                          <option value="CONICAL_FLAT">Flat Conical</option>
                          <option value="FLAT_PLATE">Flat Plate</option>
                          <option value="STANDARD_CAP">Standard Cap</option>
                        </select>
                      </div>
                    </div>

                    {head.headType === 'STANDARD_CAP' && (
                      <div className="grid grid-cols-3 gap-2 bg-muted/20 p-2 rounded border border-border">
                        <div>
                          <label className={labelCls}>NPS (in)</label>
                          <select className={inputCls} value={head.pipeNominalSize_inch || ''} onChange={e => updateHead(idx, 'pipeNominalSize_inch', e.target.value)}>
                            <option value="">Select</option>
                            {Object.keys(PipeDimensions).map(nps => (
                              <option key={nps} value={nps}>{nps}"</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Schedule</label>
                          <select className={inputCls} value={head.pipeSchedule || ''} onChange={e => updateHead(idx, 'pipeSchedule', e.target.value)}>
                            <option value="">Select</option>
                            <option value="STD">STD</option><option value="XS">XS</option><option value="SCH40">SCH40</option><option value="SCH80">SCH80</option><option value="SCH160">SCH160</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Tol. (-%)</label>
                          <input type="number" className={inputCls} value={head.pipeThicknessTolerance_pct ?? 12.5} onChange={e => updateHead(idx, 'pipeThicknessTolerance_pct', Number(e.target.value))} />
                        </div>
                      </div>
                    )}

                    <div className="bg-muted/10 p-2 rounded border border-border">
                      <label className={labelCls}>Material & Density</label>
                      <div className="flex gap-2">
                        <select className={inputCls} value={head.material || 'CS_A516_70'} onChange={e => updateHead(idx, 'material', e.target.value)}>
                          <option value="CS_A516_70">SA-516 Gr.70</option>
                          <option value="SS_304">SA-240 304</option>
                          <option value="SS_316L">SA-240 316L</option>
                        </select>
                        <span className="text-xs px-2 py-1 bg-muted/30 border border-border rounded whitespace-nowrap">
                          {head.material?.startsWith('SS') ? '8000' : '7850'} kg/m³
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-border pt-2">
                      <div>
                        <label className={labelCls}>I.D. (mm)</label>
                        <input type="number" className={inputCls} value={head.insideDiameter_mm || ''} onChange={e => updateHead(idx, 'insideDiameter_mm', Number(e.target.value))} disabled={head.headType === 'STANDARD_CAP'} />
                      </div>
                      <div>
                        <label className={labelCls}>Straight Flange (mm)</label>
                        <input type="number" className={inputCls} value={head.straightFlange_mm || ''} onChange={e => updateHead(idx, 'straightFlange_mm', Number(e.target.value))} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={labelCls} title="Min. Thickness After Forming">Thk A.F. (mm)</label>
                        <input type="number" className={inputCls} value={head.thicknessAfterForming_mm || ''} onChange={e => updateHead(idx, 'thicknessAfterForming_mm', Number(e.target.value))} disabled={head.headType === 'STANDARD_CAP'} />
                      </div>
                      <div>
                        <label className={labelCls} title="Thickness Before Forming (Raw material)">Thk B.F. (mm)</label>
                        <input type="number" className={inputCls} value={head.thicknessBeforeForming_mm || ''} onChange={e => updateHead(idx, 'thicknessBeforeForming_mm', Number(e.target.value))} disabled={head.headType === 'STANDARD_CAP'} />
                      </div>
                    </div>

                    {(head.headType === 'TORISPHERICAL_ASME' || head.headType === 'TORISPHERICAL_KORBBOGEN' || head.headType === 'TORISPHERICAL_DIN28011') && (
                      <div className="grid grid-cols-2 gap-2 bg-muted/20 p-2 rounded">
                        <div>
                          <label className={labelCls}>Crown Rad. L (mm)</label>
                          <input type="number" className={inputCls} value={head.crownRadius_mm || ''} onChange={e => updateHead(idx, 'crownRadius_mm', Number(e.target.value))} />
                        </div>
                        <div>
                          <label className={labelCls}>Knuckle Rad. r (mm)</label>
                          <input type="number" className={inputCls} value={head.knuckleRadius_mm || ''} onChange={e => updateHead(idx, 'knuckleRadius_mm', Number(e.target.value))} />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className={labelCls}>Blank Diameter for Raw Wgt (mm)</label>
                      <input type="number" className={inputCls} value={head.blankDiameter_mm || ''} onChange={e => updateHead(idx, 'blankDiameter_mm', Number(e.target.value))} disabled={head.headType === 'STANDARD_CAP'} />
                    </div>

                    <div className="border-t border-border pt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <input type="checkbox" id={`seg-${head.headId}`} checked={head.isSegmented} onChange={e => updateHead(idx, 'isSegmented', e.target.checked)} />
                        <label htmlFor={`seg-${head.headId}`} className="text-[10px] font-semibold text-foreground cursor-pointer">Segmented Head (Petals)</label>
                      </div>
                      
                      {head.isSegmented && (
                        <div className="grid grid-cols-2 gap-2 bg-muted/20 p-2 rounded">
                          <div>
                            <label className={labelCls}>No. of Petals</label>
                            <input type="number" className={inputCls} value={head.numberOfPetals || 0} onChange={e => updateHead(idx, 'numberOfPetals', Number(e.target.value))} />
                          </div>
                          <div className="flex items-end pb-1">
                            <div className="flex items-center gap-2">
                              <input type="checkbox" id={`crown-${head.headId}`} checked={head.crownPieceIncluded} onChange={e => updateHead(idx, 'crownPieceIncluded', e.target.checked)} />
                              <label htmlFor={`crown-${head.headId}`} className="text-[9px] font-semibold text-foreground cursor-pointer">Has Crown Disc</label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center bg-muted/20 p-2 rounded mt-2">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold">Weld Seams (Auto)</span>
                      <span className="text-[10px] font-bold text-foreground">
                        Long: {head.longitudinalWeldSeams || 0} | 
                        Circ: {head.circumferentialWeldSeams || 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <label className={labelCls}>Long. Radiography</label>
                        <select className={inputCls} value={head.longitudinalRadiography || 'SPOT'} onChange={e => updateHead(idx, 'longitudinalRadiography', e.target.value)}>
                          <option value="FULL">RT-1 (Full)</option>
                          <option value="SPOT">RT-3 (Spot)</option>
                          <option value="NONE">RT-4 (None)</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Circ. Radiography</label>
                        <select className={inputCls} value={head.circumferentialRadiography || 'SPOT'} onChange={e => updateHead(idx, 'circumferentialRadiography', e.target.value)}>
                          <option value="FULL">RT-1 (Full)</option>
                          <option value="SPOT">RT-3 (Spot)</option>
                          <option value="NONE">RT-4 (None)</option>
                        </select>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Output metrics */}
        <div className="bg-amber-950/20 border-t border-amber-800/40 px-3 py-2 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-medium text-amber-600/70 uppercase">Fab. Weight</span>
            <span className="text-sm font-bold tabular-nums text-amber-500">
              {(d.calculatedWeight ?? 0).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-medium text-amber-600/50 uppercase">Raw Weight</span>
            <span className="text-xs font-bold tabular-nums text-amber-500/70">
              {(d.rawWeight ?? 0).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-amber-800/20 mt-1">
            <span className="text-[9px] font-medium text-amber-600/50 uppercase">Area / Vol / Elong.</span>
            <span className="text-[10px] font-bold tabular-nums text-amber-500/70">
              {((d as any).area_m2 ?? 0).toFixed(2)}m² | {((d as any).internalVolume ?? 0).toFixed(2)}m³ | {((d as any).elongation_pct ?? 0).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-amber-800/20 mt-1">
            <span className="text-[9px] font-medium text-amber-600/50 uppercase">Weld Len / Elect.</span>
            <span className="text-xs font-bold tabular-nums text-amber-500/70">
              {((d as any).weldLength_m ?? 0).toFixed(1)}m / {((d as any).electrodeWeight_kg ?? 0).toFixed(1)}kg
            </span>
          </div>
        </div>

        <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-amber-500 border-2 border-slate-900" />
      </div>
    </>
  );
});

HeadNode.displayName = 'HeadNode';
