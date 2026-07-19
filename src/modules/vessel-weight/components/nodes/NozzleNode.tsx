'use client';

import React, { memo, useState } from 'react';
import { Handle, Position, NodeToolbar, type NodeProps } from '@xyflow/react';
import { useTranslations } from 'next-intl';
import { Trash2, Disc, Plus, ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { useVesselWeightStore } from '../../store/useVesselWeightStore';
import type { NozzleNodeData, Nozzle } from '../../schemas/nozzle.schema';
import { calcNozzleWeight } from '../../calculations/nozzle.calc';

const inputCls = 'w-full rounded-md border border-input bg-background px-2.5 py-1 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors';
const labelCls = 'block text-[9px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider truncate';

function createNewNozzle(idStr: string): Nozzle {
  return {
    id: idStr,
    nozzleId: `N-${idStr}`,
    tag: `N-${idStr}`,
    qty: 1,
    service: 'Process',
    size: '2"',
    matGroup: 'CS',
    
    hasBlindFlange: false,
    hasDavitHinge: false,
    davitHingeType: 'DAVIT',
    hasInternalDevice: false,
    internalDeviceType: 'DEFLECTOR',
    hasInternalPipe: false,
    internalPipeLength: 200,
    internalPipeUnitWeight: 10,
    hasExternalPipe: false,
    externalPipeLength: 500,
    externalPipeUnitWeight: 10,
    
    hasFlange: true,
    flangeType: 'WN',
    flangeRef: 'ASME_B16_5',
    flangeForm: 'FORGING',
    flangeMaterial: 'SA-105',
    flangeClass: '150',
    flangeSch: 'STD',
    flangeFace: 'RF',
    flangeUnitWeight: 5,
    blindFlangeUnitWeight: 5,
    
    hasNeck: true,
    neckForm: 'PIPE',
    neckMaterial: 'SA-106 B',
    neckType: 'SEAMLESS',
    neckSch: 'STD',
    neckLength: 200,
    neckUnitWeight: 15,
    neckOD: 60.3,
    neckThickness: 3.91,
    
    hasReinforcement: false,
    reinforcementForm: 'PAD',
    reinforcementMaterial: 'SA-516 70',
    padOD: 150,
    padID: 61.3,
    padThk: 10,
    hubThk: 20,
    hubLength: 50,
    taperLength: 25,
    reinforcementUnitWeight: 0,
  };
}

const AccordionItem = ({ title, active, onToggle, children, toggleAction, toggleValue }: any) => {
  return (
    <div className="border border-border rounded mb-2 overflow-hidden bg-muted/5">
      <div 
        className="px-2 py-1.5 bg-muted/20 flex items-center justify-between cursor-pointer hover:bg-muted/40 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-1.5">
          {active ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
          <span className="text-[10px] font-bold text-foreground">{title}</span>
        </div>
        {toggleAction !== undefined && (
          <input 
            type="checkbox" 
            checked={toggleValue} 
            onChange={(e) => toggleAction(e.target.checked)} 
            onClick={(e) => e.stopPropagation()}
            className="w-3 h-3"
          />
        )}
      </div>
      {active && (
        <div className={`p-2 border-t border-border ${toggleValue === false ? 'opacity-50 pointer-events-none' : ''}`}>
          {children}
        </div>
      )}
    </div>
  );
};

const NozzleDrawing = ({ nz }: { nz: Nozzle }) => {
  // SVG drawing of cross section
  const cx = 100;
  const cy = 20; // Top of flange
  const width = 200;
  const height = 200;

  // Rough scale
  const neckOD = Math.max(20, Math.min(60, nz.neckOD / 2));
  const neckID = neckOD - Math.max(2, nz.neckThickness / 2);
  const neckLen = Math.max(40, Math.min(100, nz.neckLength / 3));
  const flangeOD = neckOD + 30;
  const flangeThk = 15;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full aspect-square bg-slate-50 rounded-md border border-slate-200">
      <defs>
        <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0h4v4H0z" fill="transparent" />
          <path d="M0,4 L4,4" stroke="#94a3b8" strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* Shell wall (bottom) */}
      <rect x={10} y={cy + neckLen} width={180} height={15} fill="url(#hatch)" stroke="#475569" strokeWidth={1.5} />

      {/* Internal Pipe */}
      {nz.hasInternalPipe && (
        <g stroke="#3b82f6" strokeWidth={1.5} fill="none">
          <line x1={cx - neckID} y1={cy + neckLen + 15} x2={cx - neckID} y2={cy + neckLen + 40} strokeDasharray="4 2" />
          <line x1={cx + neckID} y1={cy + neckLen + 15} x2={cx + neckID} y2={cy + neckLen + 40} strokeDasharray="4 2" />
        </g>
      )}

      {/* Neck */}
      {nz.hasNeck && (
        <g stroke="#475569" strokeWidth={1.5}>
          {/* Left wall */}
          <rect x={cx - neckOD} y={cy + flangeThk} width={neckOD - neckID} height={neckLen - flangeThk} fill="url(#hatch)" />
          {/* Right wall */}
          <rect x={cx + neckID} y={cy + flangeThk} width={neckOD - neckID} height={neckLen - flangeThk} fill="url(#hatch)" />
        </g>
      )}

      {/* Reinforcement */}
      {nz.hasReinforcement && (
        <g stroke="#ef4444" strokeWidth={1.5}>
          {nz.reinforcementForm === 'PAD' ? (
            <>
              {/* Left Pad */}
              <rect x={cx - neckOD - 30} y={cy + neckLen - 10} width={30} height={10} fill="rgba(239, 68, 68, 0.2)" />
              {/* Right Pad */}
              <rect x={cx + neckOD} y={cy + neckLen - 10} width={30} height={10} fill="rgba(239, 68, 68, 0.2)" />
            </>
          ) : (
            <>
              {/* Left Hub */}
              <polygon points={`${cx - neckOD},${cy + neckLen} ${cx - neckOD - 20},${cy + neckLen} ${cx - neckOD - 20},${cy + neckLen - 20} ${cx - neckOD},${cy + neckLen - 40}`} fill="rgba(239, 68, 68, 0.2)" />
              {/* Right Hub */}
              <polygon points={`${cx + neckOD},${cy + neckLen} ${cx + neckOD + 20},${cy + neckLen} ${cx + neckOD + 20},${cy + neckLen - 20} ${cx + neckOD},${cy + neckLen - 40}`} fill="rgba(239, 68, 68, 0.2)" />
            </>
          )}
        </g>
      )}

      {/* Flange */}
      {nz.hasFlange && (
        <g stroke="#475569" strokeWidth={1.5}>
          {nz.flangeType === 'WN' ? (
            <>
              <polygon points={`${cx - flangeOD},${cy} ${cx - flangeOD},${cy + flangeThk} ${cx - neckOD},${cy + flangeThk + 15} ${cx - neckID},${cy + flangeThk + 15} ${cx - neckID},${cy}`} fill="url(#hatch)" />
              <polygon points={`${cx + neckID},${cy} ${cx + neckID},${cy + flangeThk + 15} ${cx + neckOD},${cy + flangeThk + 15} ${cx + flangeOD},${cy + flangeThk} ${cx + flangeOD},${cy}`} fill="url(#hatch)" />
            </>
          ) : nz.flangeType === 'SO' ? (
            <>
              <rect x={cx - flangeOD} y={cy} width={flangeOD - neckOD} height={flangeThk} fill="url(#hatch)" />
              <rect x={cx + neckOD} y={cy} width={flangeOD - neckOD} height={flangeThk} fill="url(#hatch)" />
            </>
          ) : (
             <>
               <rect x={cx - flangeOD} y={cy} width={flangeOD - neckID} height={flangeThk} fill="url(#hatch)" />
               <rect x={cx + neckID} y={cy} width={flangeOD - neckID} height={flangeThk} fill="url(#hatch)" />
             </>
          )}
        </g>
      )}

      {/* Blind Flange */}
      {nz.hasBlindFlange && (
        <rect x={cx - flangeOD} y={cy - 12} width={flangeOD * 2} height={12} fill="#e2e8f0" stroke="#475569" strokeWidth={1.5} />
      )}

      {/* Center line */}
      <line x1={cx} y1={0} x2={cx} y2={height} stroke="#ef4444" strokeDasharray="10 5 2 5" strokeWidth={0.5} opacity={0.7} />
    </svg>
  );
}

export const NozzleNode = memo(({ id, data, selected }: NodeProps) => {
  const t = useTranslations('VesselWeight');
  const d = data as NozzleNodeData;
  const updateNodeData = useVesselWeightStore((s) => s.updateNodeData);
  const deleteNode = useVesselWeightStore((s) => s.deleteNode);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<Record<string, string>>({}); // track active accordion per nozzle

  const nozzles = d.nozzles || [];

  const recalculate = (newNozzles: Nozzle[]) => {
    let total = 0;
    const computed = newNozzles.map(nz => {
      const res = calcNozzleWeight(nz);
      total += res.totalFabricatedWeight_kg || 0;
      return { ...nz, ...res };
    });
    updateNodeData(id, { nozzles: computed, totalFabricatedWeight: total } as any);
  };

  const updateNz = (index: number, field: keyof Nozzle, value: any) => {
    const newNz = [...nozzles];
    newNz[index] = { ...newNz[index], [field]: value };
    recalculate(newNz);
  };

  const addNozzle = () => {
    const nz = createNewNozzle(Date.now().toString().slice(-4));
    recalculate([...nozzles, nz]);
    setExpandedId(nz.id);
    setActiveSection({ ...activeSection, [nz.id]: 'general' });
  };

  const removeNz = (index: number) => {
    const newNz = [...nozzles];
    newNz.splice(index, 1);
    recalculate(newNz);
  };

  const toggleAccordion = (nzId: string, section: string) => {
    setActiveSection(prev => ({ ...prev, [nzId]: prev[nzId] === section ? '' : section }));
  };

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top} className="flex gap-2">
        <button onClick={() => deleteNode(id)} className="flex h-8 w-8 items-center justify-center rounded-md bg-danger/10 text-danger hover:bg-danger/20 transition-colors shadow-sm">
          <Trash2 size={16} />
        </button>
      </NodeToolbar>
      
      <div dir="auto" className="w-[500px] min-h-[200px] flex flex-col rounded-lg border border-border bg-card shadow-sm overflow-hidden transition-all hover:border-blue-500/50">
        <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500 border-2 border-slate-900" />
        
        <div className="bg-blue-500/10 px-3 py-2 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <Disc size={14} className="text-blue-500" />
            <span className="font-semibold text-xs text-foreground">Nozzle Data ({nozzles.length})</span>
          </div>
          <button 
            onClick={addNozzle}
            className="flex items-center gap-1 bg-background border border-border hover:bg-muted text-[9px] font-semibold px-2 py-1 rounded transition-colors"
          >
            <Plus size={10} /> Add
          </button>
        </div>
        
        <div className="flex-1 p-3 space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
          {nozzles.map((nz, idx) => {
            const isExpanded = expandedId === nz.id;
            const currentSection = activeSection[nz.id] || 'general';
            
            return (
              <div key={nz.id} className="rounded-lg border border-border bg-card overflow-hidden">
                {/* Header */}
                <div 
                  className="p-2 bg-muted/20 flex items-center justify-between cursor-pointer hover:bg-muted/40" 
                  onClick={() => setExpandedId(isExpanded ? null : nz.id)}
                >
                  <div className="flex items-center gap-2">
                    <Settings size={12} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-foreground">Nozzle {nz.tag} <span className="font-normal text-muted-foreground ml-1">({nz.size})</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded">{(nz.totalFabricatedWeight_kg || 0).toFixed(1)} kg</span>
                    <button onClick={(e) => { e.stopPropagation(); removeNz(idx); }} className="text-red-500 hover:text-red-600 p-1"><Trash2 size={12} /></button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-2 border-t border-border bg-background grid grid-cols-5 gap-3">
                    
                    {/* Left Panel: Accordions */}
                    <div className="col-span-3">
                      {/* GENERAL DATA */}
                      <AccordionItem 
                        title="1. GENERAL DATA" 
                        active={currentSection === 'general'} 
                        onToggle={() => toggleAccordion(nz.id, 'general')}
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <div><label className={labelCls}>Tag No.</label><input type="text" className={inputCls} value={nz.tag} onChange={e => updateNz(idx, 'tag', e.target.value)} /></div>
                          <div><label className={labelCls}>Qty.</label><input type="number" className={inputCls} value={nz.qty} onChange={e => updateNz(idx, 'qty', parseInt(e.target.value)||1)} /></div>
                          <div><label className={labelCls}>Service</label><input type="text" className={inputCls} value={nz.service} onChange={e => updateNz(idx, 'service', e.target.value)} /></div>
                          <div><label className={labelCls}>Size</label><input type="text" className={inputCls} value={nz.size} onChange={e => updateNz(idx, 'size', e.target.value)} /></div>
                          <div className="col-span-2"><label className={labelCls}>Mat. Group</label><input type="text" className={inputCls} value={nz.matGroup} onChange={e => updateNz(idx, 'matGroup', e.target.value)} /></div>
                        </div>
                      </AccordionItem>

                      {/* ACCESSORIES */}
                      <AccordionItem 
                        title="2. COMPLETE WITH" 
                        active={currentSection === 'acc'} 
                        onToggle={() => toggleAccordion(nz.id, 'acc')}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={nz.hasBlindFlange} onChange={e => updateNz(idx, 'hasBlindFlange', e.target.checked)} id={`bf-${nz.id}`} />
                            <label htmlFor={`bf-${nz.id}`} className="text-[10px]">Blind Flange / Mating</label>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={nz.hasDavitHinge} onChange={e => updateNz(idx, 'hasDavitHinge', e.target.checked)} />
                            <select className={`${inputCls} flex-1`} disabled={!nz.hasDavitHinge} value={nz.davitHingeType} onChange={e => updateNz(idx, 'davitHingeType', e.target.value)}>
                              <option value="DAVIT">Davit</option>
                              <option value="HINGE">Hinge</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={nz.hasInternalDevice} onChange={e => updateNz(idx, 'hasInternalDevice', e.target.checked)} />
                            <select className={`${inputCls} flex-1`} disabled={!nz.hasInternalDevice} value={nz.internalDeviceType} onChange={e => updateNz(idx, 'internalDeviceType', e.target.value)}>
                              <option value="DEFLECTOR">Deflector</option>
                              <option value="VORTEX_BREAKER">Vortex Breaker</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                <input type="checkbox" checked={nz.hasInternalPipe} onChange={e => updateNz(idx, 'hasInternalPipe', e.target.checked)} />
                                <span className="text-[9px] font-bold uppercase">Internal Pipe</span>
                              </div>
                              <div className="space-y-1">
                                <div><label className={labelCls}>Len (mm)</label><input disabled={!nz.hasInternalPipe} type="number" className={inputCls} value={nz.internalPipeLength} onChange={e => updateNz(idx, 'internalPipeLength', Number(e.target.value))} /></div>
                                <div><label className={labelCls}>Wt (kg/m)</label><input disabled={!nz.hasInternalPipe} type="number" className={inputCls} value={nz.internalPipeUnitWeight} onChange={e => updateNz(idx, 'internalPipeUnitWeight', Number(e.target.value))} /></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                <input type="checkbox" checked={nz.hasExternalPipe} onChange={e => updateNz(idx, 'hasExternalPipe', e.target.checked)} />
                                <span className="text-[9px] font-bold uppercase">External Pipe</span>
                              </div>
                              <div className="space-y-1">
                                <div><label className={labelCls}>Len (mm)</label><input disabled={!nz.hasExternalPipe} type="number" className={inputCls} value={nz.externalPipeLength} onChange={e => updateNz(idx, 'externalPipeLength', Number(e.target.value))} /></div>
                                <div><label className={labelCls}>Wt (kg/m)</label><input disabled={!nz.hasExternalPipe} type="number" className={inputCls} value={nz.externalPipeUnitWeight} onChange={e => updateNz(idx, 'externalPipeUnitWeight', Number(e.target.value))} /></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionItem>

                      {/* NOZZLE FLANGE */}
                      <AccordionItem 
                        title="3. NOZZLE FLANGE" 
                        active={currentSection === 'flange'} 
                        onToggle={() => toggleAccordion(nz.id, 'flange')}
                        toggleAction={(val: boolean) => updateNz(idx, 'hasFlange', val)}
                        toggleValue={nz.hasFlange}
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <div><label className={labelCls}>Type</label>
                            <select className={inputCls} value={nz.flangeType} onChange={e => updateNz(idx, 'flangeType', e.target.value)}>
                              <option value="WN">WN</option><option value="SO">SO</option><option value="LWN">LWN</option><option value="BL">BL</option>
                            </select>
                          </div>
                          <div><label className={labelCls}>Ref</label>
                            <select className={inputCls} value={nz.flangeRef} onChange={e => updateNz(idx, 'flangeRef', e.target.value)}>
                              <option value="ASME_B16_5">B16.5</option><option value="ASME_B16_47_A">B16.47 A</option><option value="ASME_B16_47_B">B16.47 B</option>
                            </select>
                          </div>
                          <div><label className={labelCls}>Form</label>
                            <select className={inputCls} value={nz.flangeForm} onChange={e => updateNz(idx, 'flangeForm', e.target.value)}>
                              <option value="FORGING">Forging</option><option value="PLATE">Plate</option>
                            </select>
                          </div>
                          <div><label className={labelCls}>Material</label><input type="text" className={inputCls} value={nz.flangeMaterial} onChange={e => updateNz(idx, 'flangeMaterial', e.target.value)} /></div>
                          <div><label className={labelCls}>Class</label>
                            <select className={inputCls} value={nz.flangeClass} onChange={e => updateNz(idx, 'flangeClass', e.target.value)}>
                              <option value="150">150</option><option value="300">300</option><option value="600">600</option><option value="900">900</option>
                            </select>
                          </div>
                          <div><label className={labelCls}>Sch / Face</label>
                            <div className="flex gap-1">
                              <input type="text" className={`${inputCls} w-1/2`} value={nz.flangeSch} onChange={e => updateNz(idx, 'flangeSch', e.target.value)} placeholder="STD" />
                              <select className={`${inputCls} w-1/2`} value={nz.flangeFace} onChange={e => updateNz(idx, 'flangeFace', e.target.value)}>
                                <option value="RF">RF</option><option value="RTJ">RTJ</option>
                              </select>
                            </div>
                          </div>
                          <div><label className={labelCls}>Unit Wt (kg)</label><input type="number" className={inputCls} value={nz.flangeUnitWeight} onChange={e => updateNz(idx, 'flangeUnitWeight', Number(e.target.value))} /></div>
                          {nz.hasBlindFlange && <div><label className={labelCls}>Blind Wt (kg)</label><input type="number" className={inputCls} value={nz.blindFlangeUnitWeight} onChange={e => updateNz(idx, 'blindFlangeUnitWeight', Number(e.target.value))} /></div>}
                        </div>
                      </AccordionItem>

                      {/* NOZZLE NECK */}
                      <AccordionItem 
                        title="4. NOZZLE NECK" 
                        active={currentSection === 'neck'} 
                        onToggle={() => toggleAccordion(nz.id, 'neck')}
                        toggleAction={(val: boolean) => updateNz(idx, 'hasNeck', val)}
                        toggleValue={nz.hasNeck}
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <div><label className={labelCls}>Form</label>
                            <select className={inputCls} value={nz.neckForm} onChange={e => updateNz(idx, 'neckForm', e.target.value)}>
                              <option value="PIPE">Pipe</option><option value="ROLLED_PLATE">Rolled Plate</option>
                            </select>
                          </div>
                          <div><label className={labelCls}>Material</label><input type="text" className={inputCls} value={nz.neckMaterial} onChange={e => updateNz(idx, 'neckMaterial', e.target.value)} /></div>
                          <div><label className={labelCls}>Type</label>
                            <select className={inputCls} value={nz.neckType} onChange={e => updateNz(idx, 'neckType', e.target.value)}>
                              <option value="SEAMLESS">Seamless</option><option value="WELDED">Welded</option>
                            </select>
                          </div>
                          <div><label className={labelCls}>Sch</label><input type="text" className={inputCls} value={nz.neckSch} onChange={e => updateNz(idx, 'neckSch', e.target.value)} /></div>
                          <div><label className={labelCls}>OD (mm)</label><input type="number" className={inputCls} value={nz.neckOD} onChange={e => updateNz(idx, 'neckOD', Number(e.target.value))} /></div>
                          <div><label className={labelCls}>Thk (mm)</label><input type="number" className={inputCls} value={nz.neckThickness} onChange={e => updateNz(idx, 'neckThickness', Number(e.target.value))} /></div>
                          <div><label className={labelCls}>Length (mm)</label><input type="number" className={inputCls} value={nz.neckLength} onChange={e => updateNz(idx, 'neckLength', Number(e.target.value))} /></div>
                          <div><label className={labelCls}>Unit Wt ({nz.neckForm === 'PIPE' ? 'kg/m' : 'kg'})</label><input type="number" className={inputCls} value={nz.neckUnitWeight} onChange={e => updateNz(idx, 'neckUnitWeight', Number(e.target.value))} /></div>
                        </div>
                      </AccordionItem>

                      {/* NOZZLE REINFORCED */}
                      <AccordionItem 
                        title="5. REINFORCEMENT" 
                        active={currentSection === 'rein'} 
                        onToggle={() => toggleAccordion(nz.id, 'rein')}
                        toggleAction={(val: boolean) => updateNz(idx, 'hasReinforcement', val)}
                        toggleValue={nz.hasReinforcement}
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <div><label className={labelCls}>Form</label>
                            <select className={inputCls} value={nz.reinforcementForm} onChange={e => updateNz(idx, 'reinforcementForm', e.target.value)}>
                              <option value="PAD">Rien. Pad</option><option value="HUB">Hub</option>
                            </select>
                          </div>
                          <div><label className={labelCls}>Material</label><input type="text" className={inputCls} value={nz.reinforcementMaterial} onChange={e => updateNz(idx, 'reinforcementMaterial', e.target.value)} /></div>
                          
                          {nz.reinforcementForm === 'PAD' ? (
                            <>
                              <div><label className={labelCls}>Pad O.D (mm)</label><input type="number" className={inputCls} value={nz.padOD} onChange={e => updateNz(idx, 'padOD', Number(e.target.value))} /></div>
                              <div><label className={labelCls}>Pad I.D (mm)</label><input type="number" className={inputCls} value={nz.padID} onChange={e => updateNz(idx, 'padID', Number(e.target.value))} /></div>
                              <div><label className={labelCls}>Pad Thk (mm)</label><input type="number" className={inputCls} value={nz.padThk} onChange={e => updateNz(idx, 'padThk', Number(e.target.value))} /></div>
                            </>
                          ) : (
                            <>
                              <div><label className={labelCls}>Hub Thk (mm)</label><input type="number" className={inputCls} value={nz.hubThk} onChange={e => updateNz(idx, 'hubThk', Number(e.target.value))} /></div>
                              <div><label className={labelCls}>Hub Len (mm)</label><input type="number" className={inputCls} value={nz.hubLength} onChange={e => updateNz(idx, 'hubLength', Number(e.target.value))} /></div>
                              <div><label className={labelCls}>Taper Len (mm)</label><input type="number" className={inputCls} value={nz.taperLength} onChange={e => updateNz(idx, 'taperLength', Number(e.target.value))} /></div>
                            </>
                          )}
                          <div><label className={labelCls}>Unit Wt (kg)</label><input type="number" className={inputCls} value={nz.reinforcementUnitWeight} onChange={e => updateNz(idx, 'reinforcementUnitWeight', Number(e.target.value))} /></div>
                        </div>
                      </AccordionItem>

                    </div>

                    {/* Right Panel: Drawing and Summary */}
                    <div className="col-span-2 flex flex-col gap-2">
                      <NozzleDrawing nz={nz} />
                      
                      <div className="bg-blue-900/10 border border-blue-400/40 p-2 rounded text-[10px] mt-auto">
                        <div className="font-bold text-blue-700 mb-1 border-b border-blue-400/30 pb-1">Weight Summary ({nz.qty}x)</div>
                        {nz.hasFlange && <div className="flex justify-between text-muted-foreground"><span>Flanges:</span> <span className="tabular-nums font-semibold">{nz.flangeTotalWeight_kg?.toFixed(1)} kg</span></div>}
                        {nz.hasNeck && <div className="flex justify-between text-muted-foreground"><span>Neck:</span> <span className="tabular-nums font-semibold">{nz.neckTotalWeight_kg?.toFixed(1)} kg</span></div>}
                        {nz.hasReinforcement && <div className="flex justify-between text-muted-foreground"><span>Reinforcement:</span> <span className="tabular-nums font-semibold">{nz.reinforcementTotalWeight_kg?.toFixed(1)} kg</span></div>}
                        {nz.accessoriesTotalWeight_kg! > 0 && <div className="flex justify-between text-muted-foreground"><span>Accessories:</span> <span className="tabular-nums font-semibold">{nz.accessoriesTotalWeight_kg?.toFixed(1)} kg</span></div>}
                        <div className="flex justify-between font-bold text-blue-700 mt-1 border-t border-blue-400/30 pt-1"><span>Total:</span> <span className="tabular-nums">{nz.totalFabricatedWeight_kg?.toFixed(1)} kg</span></div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Total metrics */}
        <div className="bg-blue-900/10 border-t border-blue-400/40 px-3 py-2 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-blue-600 uppercase">Total Nozzles Wt.</span>
            <span className="text-sm font-bold tabular-nums text-blue-700">
              {(d.totalFabricatedWeight ?? 0).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg
            </span>
          </div>
        </div>

        <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500 border-2 border-slate-900" />
      </div>
    </>
  );
});

NozzleNode.displayName = 'NozzleNode';
