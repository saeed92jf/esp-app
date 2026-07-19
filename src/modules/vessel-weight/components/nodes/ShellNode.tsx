'use client';

import React, { memo, useState } from 'react';
import { Handle, Position, NodeToolbar, type NodeProps } from '@xyflow/react';
import { useTranslations } from 'next-intl';
import { Trash2, Cylinder, ChevronDown, ChevronUp } from 'lucide-react';
import { useVesselWeightStore } from '../../store/useVesselWeightStore';
import type { ShellNodeData, ShellCourse, ShellType } from '../../schemas/shell.schema';
import { calcCylindricalShellWeight, calcShellRawWeight } from '../../calculations/shell.calc';
import { calcShellWeldLengths, calcElectrodeConsumption, calcShellGeometry } from '../../calculations/weld.calc';
import { PipeDimensions, type NPS, type PipeSchedule } from '../../calculations/pipe.data';

const inputCls =
  'w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors';
const labelCls = 'block text-[9px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider truncate';

function makeCourse(id: string): ShellCourse {
  return {
    courseId: id,
    shellType: "CYLINDRICAL",
    insideDiameter_mm: 1000,
    purchasedThickness_mm: 10,
    length_mm: 2000,
    numberOfCourses: 1,
    material: "CS_A516_70",
    builtFromPipe: false,
    pipeThicknessTolerance_pct: 12.5,
    longitudinalWeldSeams: 1,
    circumferentialWeldSeams: 0,
    longitudinalRadiography: 'SPOT',
    circumferentialRadiography: 'SPOT',
    nozzleOpeningsOnThisCourse: [],
    corrosionAllowance_mm: 3,
  };
}

export const ShellNode = memo(({ id, data, selected }: NodeProps) => {
  const t = useTranslations('VesselWeight');
  const d = data as ShellNodeData;
  const updateNodeData = useVesselWeightStore((s) => s.updateNodeData);
  const deleteNode = useVesselWeightStore((s) => s.deleteNode);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const courses = d.courses && d.courses.length > 0 ? d.courses : [makeCourse('c1')];
  
  const recalculate = (newCourses: ShellCourse[]) => {
    let totalFab = 0;
    let totalRaw = 0;
    let totalArea = 0;
    let totalVol = 0;
    let totalElec = 0;
    let totalWeldLen = 0;
    
    const density = 7850; 

    newCourses.forEach(c => {
      const w = calcCylindricalShellWeight(
        c.insideDiameter_mm,
        c.purchasedThickness_mm,
        0,
        c.length_mm,
        density,
        c.nozzleOpeningsOnThisCourse.map(n => Math.PI / 4 * n.openingDiameter_mm**2)
      );
      
      const geom = calcShellGeometry(c.insideDiameter_mm, c.length_mm);
      const welds = calcShellWeldLengths(
        c.insideDiameter_mm, 
        c.length_mm, 
        c.longitudinalWeldSeams, 
        c.circumferentialWeldSeams, 
        c.rawPlateLength_mm, 
        c.rawPlateWidth_mm
      );

      // Update the course with auto-calculated seams if raw dims exist
      if (c.rawPlateLength_mm && c.rawPlateWidth_mm) {
        c.longitudinalWeldSeams = welds.actualLongSeams;
        c.circumferentialWeldSeams = welds.actualCircSeams;
      }

      const r = calcShellRawWeight(
        c.insideDiameter_mm,
        c.purchasedThickness_mm,
        c.length_mm,
        c.longitudinalWeldSeams,
        density,
        0
      );
      
      const elec = calcElectrodeConsumption(welds.totalLength_m, c.purchasedThickness_mm);
      
      // Calculate Elongation %
      let el = 0;
      const rf = (c.insideDiameter_mm / 2) + (c.purchasedThickness_mm / 2);
      if (c.shellType === 'SPHERICAL') {
        el = (75 * c.purchasedThickness_mm) / rf;
      } else {
        el = (50 * c.purchasedThickness_mm) / rf;
      }

      totalFab += w * c.numberOfCourses;
      totalRaw += r * c.numberOfCourses;
      totalArea += geom.area_m2 * c.numberOfCourses;
      totalVol += geom.volume_m3 * c.numberOfCourses;
      totalElec += elec * c.numberOfCourses;
      totalWeldLen += welds.totalLength_m * c.numberOfCourses;
      
      // We will store the max elongation
      if (el > ((d as any).elongation_pct || 0)) {
        (d as any).elongation_pct = el;
      }
    });

    updateNodeData(id, { 
      courses: newCourses, 
      calculatedWeight: totalFab,
      rawWeight: totalRaw,
      internalVolume: totalVol,
      area_m2: totalArea,
      electrodeWeight_kg: totalElec,
      weldLength_m: totalWeldLen,
      elongation_pct: (d as any).elongation_pct
    } as any);
  };

  const updateCourse = (index: number, field: keyof ShellCourse, value: any) => {
    const newCourses = [...courses];
    let courseToUpdate = { ...newCourses[index], [field]: value };

    // Auto calculate OD/Thk if built from pipe
    if (courseToUpdate.builtFromPipe && courseToUpdate.pipeNominalSize_inch && courseToUpdate.pipeSchedule) {
      const npsData = PipeDimensions[courseToUpdate.pipeNominalSize_inch as NPS];
      if (npsData) {
        const schThk = npsData.schedules[courseToUpdate.pipeSchedule as PipeSchedule];
        if (schThk) {
          courseToUpdate.purchasedThickness_mm = schThk;
          courseToUpdate.insideDiameter_mm = npsData.OD_mm - (2 * schThk);
        }
      }
    }

    newCourses[index] = courseToUpdate;
    recalculate(newCourses);
  };

  const addCourse = () => {
    recalculate([...courses, makeCourse(`c${Date.now()}`)]);
  };

  const removeCourse = (index: number) => {
    if (courses.length > 1) {
      recalculate(courses.filter((_, i) => i !== index));
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
      
      <div dir="auto" className="w-[360px] rounded-lg border border-border bg-card shadow-sm overflow-hidden transition-all hover:border-emerald-500/50">
        <Handle type="target" position={Position.Top} className="w-3 h-3 bg-emerald-500 border-2 border-slate-900" />
        
        <div className="bg-emerald-500/10 px-3 py-2 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <Cylinder size={14} className="text-emerald-500" />
            <span className="font-semibold text-xs text-foreground">Shell</span>
          </div>
          <button onClick={addCourse} className="text-[9px] bg-emerald-500/20 text-emerald-600 px-2 py-1 rounded hover:bg-emerald-500/30 font-bold uppercase">
            + Add Course
          </button>
        </div>
        
        <div className="p-3 space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
          {courses.map((course, idx) => {
            const isExpanded = expandedCourse === course.courseId;
            return (
              <div key={course.courseId} className="rounded-lg border border-border bg-muted/10 overflow-hidden relative group">
                {/* Header / Summary */}
                <div 
                  className="p-2 bg-muted/30 flex items-center justify-between cursor-pointer hover:bg-muted/50"
                  onClick={() => setExpandedCourse(isExpanded ? null : course.courseId)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Course {idx + 1}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">{course.shellType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {courses.length > 1 && (
                      <button onClick={(e) => { e.stopPropagation(); removeCourse(idx); }} className="text-red-500 hover:text-red-600 p-1">
                        <Trash2 size={12} />
                      </button>
                    )}
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-2 space-y-3 bg-card border-b border-border">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <label className={labelCls}>Type</label>
                        <select className={inputCls} value={course.shellType} onChange={e => updateCourse(idx, 'shellType', e.target.value as ShellType)}>
                          <option value="CYLINDRICAL">Cylindrical</option>
                          <option value="SPHERICAL">Spherical</option>
                          <option value="CONICAL">Conical</option>
                        </select>
                      </div>
                      
                      {course.shellType === 'CYLINDRICAL' && (
                        <div className="flex-1 pt-4">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id={`pipe-${course.courseId}`} checked={course.builtFromPipe} onChange={e => updateCourse(idx, 'builtFromPipe', e.target.checked)} />
                            <label htmlFor={`pipe-${course.courseId}`} className="text-[10px] font-semibold text-foreground cursor-pointer">Built from Pipe (ASME)</label>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {course.shellType === 'CYLINDRICAL' && course.builtFromPipe && (
                      <div className="grid grid-cols-3 gap-2 bg-muted/20 p-2 rounded border border-border">
                        <div>
                          <label className={labelCls}>NPS (in)</label>
                          <select className={inputCls} value={course.pipeNominalSize_inch || ''} onChange={e => updateCourse(idx, 'pipeNominalSize_inch', e.target.value)}>
                            <option value="">Select</option>
                            {Object.keys(PipeDimensions).map(nps => (
                              <option key={nps} value={nps}>{nps}"</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Schedule</label>
                          <select className={inputCls} value={course.pipeSchedule || ''} onChange={e => updateCourse(idx, 'pipeSchedule', e.target.value)}>
                            <option value="">Select</option>
                            <option value="STD">STD</option><option value="XS">XS</option><option value="SCH40">SCH40</option><option value="SCH80">SCH80</option><option value="SCH160">SCH160</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Tol. (-%)</label>
                          <input type="number" className={inputCls} value={course.pipeThicknessTolerance_pct ?? 12.5} onChange={e => updateCourse(idx, 'pipeThicknessTolerance_pct', Number(e.target.value))} />
                        </div>
                      </div>
                    )}

                    <div className="bg-muted/10 p-2 rounded border border-border">
                      <label className={labelCls}>Material & Density</label>
                      <div className="flex gap-2">
                        <select className={inputCls} value={course.material || 'CS_A516_70'} onChange={e => updateCourse(idx, 'material', e.target.value)}>
                          <option value="CS_A516_70">SA-516 Gr.70</option>
                          <option value="SS_304">SA-240 304</option>
                          <option value="SS_316L">SA-240 316L</option>
                        </select>
                        <span className="text-xs px-2 py-1 bg-muted/30 border border-border rounded whitespace-nowrap">
                          {course.material?.startsWith('SS') ? '8000' : '7850'} kg/m³
                        </span>
                      </div>
                    </div>

                    {course.shellType !== 'CONICAL' && (
                      <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-1">
                          <label className={labelCls}>I.D. (mm)</label>
                          <input type="number" className={inputCls} value={course.insideDiameter_mm || ''} onChange={e => updateCourse(idx, 'insideDiameter_mm', Number(e.target.value))} disabled={course.builtFromPipe} />
                        </div>
                        {course.shellType !== 'SPHERICAL' && (
                          <div className="col-span-1">
                            <label className={labelCls}>Len (mm)</label>
                            <input type="number" className={inputCls} value={course.length_mm || ''} onChange={e => updateCourse(idx, 'length_mm', Number(e.target.value))} />
                          </div>
                        )}
                        <div className="col-span-1">
                          <label className={labelCls}>Pur. Thk</label>
                          <input type="number" className={inputCls} value={course.purchasedThickness_mm || ''} onChange={e => updateCourse(idx, 'purchasedThickness_mm', Number(e.target.value))} disabled={course.builtFromPipe} />
                        </div>
                        <div className="col-span-1">
                          <label className={labelCls}>Qty</label>
                          <input type="number" className={inputCls} value={course.numberOfCourses || 1} onChange={e => updateCourse(idx, 'numberOfCourses', Number(e.target.value))} />
                        </div>
                      </div>
                    )}

                    {course.shellType === 'CONICAL' && (
                      <div className="grid grid-cols-2 gap-2 bg-muted/20 p-2 rounded">
                        <div>
                          <label className={labelCls}>Large Dia. (mm)</label>
                          <input type="number" className={inputCls} value={course.conicalLargeDiameter_mm || ''} onChange={e => updateCourse(idx, 'conicalLargeDiameter_mm', Number(e.target.value))} />
                        </div>
                        <div>
                          <label className={labelCls}>Small Dia. (mm)</label>
                          <input type="number" className={inputCls} value={course.conicalSmallDiameter_mm || ''} onChange={e => updateCourse(idx, 'conicalSmallDiameter_mm', Number(e.target.value))} />
                        </div>
                        <div>
                          <label className={labelCls}>Apex Angle α (deg)</label>
                          <input type="number" className={inputCls} value={course.conicalHalfApexAngle_deg || ''} onChange={e => updateCourse(idx, 'conicalHalfApexAngle_deg', Number(e.target.value))} />
                        </div>
                        <div>
                          <label className={labelCls}>Type</label>
                          <select className={inputCls} value={course.conicalType || 'CONCENTRIC'} onChange={e => updateCourse(idx, 'conicalType', e.target.value)}>
                            <option value="CONCENTRIC">Concentric</option>
                            <option value="ECCENTRIC">Eccentric</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>L. Knuckle (mm)</label>
                          <input type="number" className={inputCls} value={course.conicalKnuckleRadiusLarge_mm || ''} onChange={e => updateCourse(idx, 'conicalKnuckleRadiusLarge_mm', Number(e.target.value))} />
                        </div>
                        <div>
                          <label className={labelCls}>S. Knuckle (mm)</label>
                          <input type="number" className={inputCls} value={course.conicalKnuckleRadiusSmall_mm || ''} onChange={e => updateCourse(idx, 'conicalKnuckleRadiusSmall_mm', Number(e.target.value))} />
                        </div>
                        <div>
                          <label className={labelCls}>Pur. Thk</label>
                          <input type="number" className={inputCls} value={course.purchasedThickness_mm || ''} onChange={e => updateCourse(idx, 'purchasedThickness_mm', Number(e.target.value))} />
                        </div>
                        <div>
                          <label className={labelCls}>Qty</label>
                          <input type="number" className={inputCls} value={course.numberOfCourses || 1} onChange={e => updateCourse(idx, 'numberOfCourses', Number(e.target.value))} />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center bg-muted/20 p-2 rounded mt-2">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold">Weld Seams (Auto)</span>
                      <span className="text-[10px] font-bold text-foreground">
                        Long: {course.longitudinalWeldSeams || 1} | 
                        Circ: {course.circumferentialWeldSeams || 0}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <label className={labelCls}>Long. Radiography</label>
                        <select className={inputCls} value={course.longitudinalRadiography || 'SPOT'} onChange={e => updateCourse(idx, 'longitudinalRadiography', e.target.value)}>
                          <option value="FULL">RT-1 (Full)</option>
                          <option value="SPOT">RT-3 (Spot)</option>
                          <option value="NONE">RT-4 (None)</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Circ. Radiography</label>
                        <select className={inputCls} value={course.circumferentialRadiography || 'SPOT'} onChange={e => updateCourse(idx, 'circumferentialRadiography', e.target.value)}>
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

        {/* Weight output */}
        <div className="bg-emerald-950/20 border-t border-emerald-800/40 px-3 py-2 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-medium text-emerald-600/70 uppercase">Fab. Weight</span>
            <span className="text-sm font-bold tabular-nums text-emerald-500">
              {(d.calculatedWeight ?? 0).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-medium text-emerald-600/50 uppercase">Raw Weight</span>
            <span className="text-xs font-bold tabular-nums text-emerald-500/70">
              {(d.rawWeight ?? 0).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-emerald-800/20 mt-1">
            <span className="text-[9px] font-medium text-emerald-600/50 uppercase">Weld Len / Elect.</span>
            <span className="text-xs font-bold tabular-nums text-emerald-500/70">
              {((d as any).weldLength_m ?? 0).toFixed(1)}m / {((d as any).electrodeWeight_kg ?? 0).toFixed(1)}kg
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-medium text-emerald-600/50 uppercase">Area / Vol.</span>
            <span className="text-xs font-bold tabular-nums text-emerald-500/70">
              {((d as any).area_m2 ?? 0).toFixed(1)}m² / {((d as any).internalVolume ?? 0).toFixed(1)}m³
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-medium text-emerald-600/50 uppercase">Max Elongation</span>
            <span className="text-xs font-bold tabular-nums text-emerald-500/70">
              {((d as any).elongation_pct ?? 0).toFixed(1)}%
            </span>
          </div>
        </div>

        <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500 border-2 border-slate-900" />
      </div>
    </>
  );
});

ShellNode.displayName = 'ShellNode';
