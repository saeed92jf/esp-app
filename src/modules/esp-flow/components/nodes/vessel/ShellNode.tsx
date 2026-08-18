"use client";

import React, { memo, useState } from "react";
import { Position, type NodeProps, type Node } from "@xyflow/react";
import { Cylinder, Plus } from "lucide-react";

import { useDiagramStore } from "@/modules/esp-flow/store";
import type { DiagramNodeData, DiagramNodeType } from "@/modules/esp-flow/types";
import type { ShellNodeData, ShellCourse, ShellType } from "@/modules/vessel-weight/schemas/shell.schema";
import { calcCylindricalShellWeight, calcShellRawWeight } from "@/modules/vessel-weight/calculations/shell.calc";
import { calcShellWeldLengths, calcElectrodeConsumption, calcShellGeometry } from "@/modules/vessel-weight/calculations/weld.calc";
import { PipeDimensions, type NPS, type PipeSchedule } from "@/modules/vessel-weight/calculations/pipe.data";

import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import {
  VesselNodeContainer,
  VesselNodeToolbar,
  VesselNodeHeader,
  VesselNodeFooter,
  VesselFooterRow,
  VesselFooterHighlight,
  VesselSubSectionHeader,
  VesselFieldLabel,
} from "./VesselNodeBase";

type DiagramNode = Node<DiagramNodeData, DiagramNodeType>;
type Props = NodeProps<DiagramNode>;

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
    longitudinalRadiography: "SPOT",
    circumferentialRadiography: "SPOT",
    nozzleOpeningsOnThisCourse: [],
    corrosionAllowance_mm: 3,
  };
}

export const ShellNode = memo(({ id, data, selected }: Props) => {
  const updateNodeData = useDiagramStore((s) => s.updateNodeData);
  
  const duplicateSelected = useDiagramStore((s) => s.duplicateSelected);
  const resetNodesToDefault = useDiagramStore((s) => s.resetNodesToDefault);
  const deleteNode = (nodeId: string) => {
    useDiagramStore.setState((s) => ({
      nodes: s.nodes.filter((n) => n.id !== nodeId),
      edges: s.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }));
  };
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const d = data as unknown as ShellNodeData;
  const courses = d.courses && d.courses.length > 0 ? d.courses : [makeCourse("c1")];
  
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
      const r = calcShellRawWeight(
        c.insideDiameter_mm,
        c.purchasedThickness_mm,
        c.length_mm,
        c.longitudinalWeldSeams,
        density,
        0
      );
      
      const elec = calcElectrodeConsumption(welds.totalLength_m, c.purchasedThickness_mm);

      totalFab += w * c.numberOfCourses;
      totalRaw += r * c.numberOfCourses;
      totalArea += geom.area_m2 * c.numberOfCourses;
      totalVol += geom.volume_m3 * c.numberOfCourses;
      totalElec += elec * c.numberOfCourses;
      totalWeldLen += welds.totalLength_m * c.numberOfCourses;
    });

    updateNodeData(id, {
      courses: newCourses,
      calculatedWeight: totalFab,
      rawWeight: totalRaw,
      area_m2: totalArea,
      internalVolume: totalVol,
      electrodeWeight_kg: totalElec,
      weldLength_m: totalWeldLen,
      elongation_pct: (50 * (newCourses[0]?.purchasedThickness_mm || 10)) / ((newCourses[0]?.insideDiameter_mm || 1000) / 2),
      status: "Calculated"
    });
  };

  const updateCourse = (index: number, field: keyof ShellCourse, value: any) => {
    const newCourses = [...courses];
    let courseToUpdate = { ...newCourses[index], [field]: value };

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
        widthClass="w-auto min-w-[360px] max-w-[500px]"
        showHandles={true}
      >
        <VesselNodeHeader
          icon={<Cylinder size={18} />}
          title="Shell"
          subtitle="Cylindrical & Conical Shells"
          badge={
            courses.length > 0 ? (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-form-primary/10 text-form-primary border border-form-primary/20">
                {courses.length} {courses.length === 1 ? "Course" : "Courses"}
              </span>
            ) : undefined
          }
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={addCourse}
              className="h-6 px-2 text-[9px] font-semibold gap-1"
            >
              <Plus size={10} />
              Add Course
            </Button>
          }
        />
        
        <div className="p-3 space-y-3">
          {courses.map((course, idx) => {
            const isExpanded = expandedCourse === course.courseId;
            return (
              <div key={course.courseId} className="rounded-lg border border-border bg-muted/10 overflow-hidden relative group">
                <VesselSubSectionHeader
                  title={`Course ${idx + 1}`}
                  badge={
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-form-primary/10 text-form-primary border border-form-primary/20">
                      {course.shellType}
                    </span>
                  }
                  isExpanded={isExpanded}
                  onToggleExpand={() => setExpandedCourse(isExpanded ? null : course.courseId)}
                  onDelete={courses.length > 1 ? () => removeCourse(idx) : undefined}
                />

                {isExpanded && (
                  <div className="p-2.5 space-y-2.5 bg-card border-b border-border">
                    <div className="grid grid-cols-2 gap-2.5 items-end">
                      <div className="space-y-1">
                        <VesselFieldLabel label="Shell Type" />
                        <Combobox 
                          value={course.shellType} 
                          onChange={(val) => updateCourse(idx, "shellType", val as ShellType)}
                          options={[
                            { value: "CYLINDRICAL", label: "Cylindrical" },
                            { value: "SPHERICAL", label: "Spherical" },
                            { value: "CONICAL", label: "Conical" }
                          ]}
                          className="h-7 text-xs w-full bg-white dark:bg-black"
                        />
                      </div>
                      
                      {course.shellType === "CYLINDRICAL" && (
                        <div className="pb-1">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                            <Checkbox id={`pipe-${course.courseId}`} checked={course.builtFromPipe} onCheckedChange={(checked) => updateCourse(idx, "builtFromPipe", checked)} />
                            <span>Built from Pipe</span>
                          </label>
                        </div>
                      )}
                    </div>
                    
                    {course.shellType === "CYLINDRICAL" && course.builtFromPipe && (
                      <div className="grid grid-cols-3 gap-2 bg-muted/20 p-2 rounded-lg border border-border">
                        <div className="space-y-1">
                          <VesselFieldLabel label="NPS" unit="in" />
                          <Combobox 
                            value={course.pipeNominalSize_inch || ""} 
                            onChange={(val) => updateCourse(idx, "pipeNominalSize_inch", val)}
                            options={Object.keys(PipeDimensions).map(nps => ({ value: nps, label: `${nps}"` }))}
                            placeholder="Select"
                            className="h-7 text-xs w-full bg-white dark:bg-black"
                          />
                        </div>
                        <div className="space-y-1">
                          <VesselFieldLabel label="Schedule" />
                          <Combobox 
                            value={course.pipeSchedule || ""} 
                            onChange={(val) => updateCourse(idx, "pipeSchedule", val)}
                            options={[
                              { value: "STD", label: "STD" },
                              { value: "XS", label: "XS" },
                              { value: "SCH40", label: "SCH40" },
                              { value: "SCH80", label: "SCH80" },
                              { value: "SCH160", label: "SCH160" }
                            ]}
                            placeholder="Select"
                            className="h-7 text-xs w-full bg-white dark:bg-black"
                          />
                        </div>
                        <div className="space-y-1">
                          <VesselFieldLabel label="Tol." unit="%" />
                          <Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={course.pipeThicknessTolerance_pct ?? 12.5} onChange={e => updateCourse(idx, "pipeThicknessTolerance_pct", Number(e.target.value))} />
                        </div>
                      </div>
                    )}

                    <div className="bg-muted/10 p-2 rounded-lg border border-border space-y-1">
                      <VesselFieldLabel label="Material & Density" />
                      <div className="flex gap-2">
                        <Combobox 
                          value={course.material || "CS_A516_70"} 
                          onChange={(val) => updateCourse(idx, "material", val)}
                          options={[
                            { value: "CS_A516_70", label: "SA-516 Gr.70" },
                            { value: "SS_304", label: "SA-240 304" },
                            { value: "SS_316L", label: "SA-240 316L" }
                          ]}
                          className="h-7 text-xs flex-1 bg-white dark:bg-black"
                        />
                        <span className="text-xs px-2 py-1 bg-muted/30 border border-border rounded-lg whitespace-nowrap flex items-center justify-center font-sans">
                          {course.material?.startsWith("SS") ? "8000" : "7850"} kg/m³
                        </span>
                      </div>
                    </div>

                    {course.shellType !== "CONICAL" && (
                      <div className="grid grid-cols-4 gap-2">
                        <div className="space-y-1">
                          <VesselFieldLabel label="I.D." unit="mm" />
                          <Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={course.insideDiameter_mm || ""} onChange={e => updateCourse(idx, "insideDiameter_mm", Number(e.target.value))} disabled={course.builtFromPipe} />
                        </div>
                        {course.shellType !== "SPHERICAL" && (
                          <div className="space-y-1">
                            <VesselFieldLabel label="Length" unit="mm" />
                            <Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={course.length_mm || ""} onChange={e => updateCourse(idx, "length_mm", Number(e.target.value))} />
                          </div>
                        )}
                        <div className="space-y-1">
                          <VesselFieldLabel label="Pur. Thk" unit="mm" />
                          <Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={course.purchasedThickness_mm || ""} onChange={e => updateCourse(idx, "purchasedThickness_mm", Number(e.target.value))} disabled={course.builtFromPipe} />
                        </div>
                        <div className="space-y-1">
                          <VesselFieldLabel label="Quantity" />
                          <Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={course.numberOfCourses || 1} onChange={e => updateCourse(idx, "numberOfCourses", Number(e.target.value))} />
                        </div>
                      </div>
                    )}

                    {course.shellType === "CONICAL" && (
                      <div className="grid grid-cols-2 gap-2 bg-muted/20 p-2 rounded-lg">
                        <div className="space-y-1">
                          <VesselFieldLabel label="Large Dia." unit="mm" />
                          <Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={course.conicalLargeDiameter_mm || ""} onChange={e => updateCourse(idx, "conicalLargeDiameter_mm", Number(e.target.value))} />
                        </div>
                        <div className="space-y-1">
                          <VesselFieldLabel label="Small Dia." unit="mm" />
                          <Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={course.conicalSmallDiameter_mm || ""} onChange={e => updateCourse(idx, "conicalSmallDiameter_mm", Number(e.target.value))} />
                        </div>
                        <div className="space-y-1">
                          <VesselFieldLabel label="Apex Angle α" unit="°" />
                          <Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={course.conicalHalfApexAngle_deg || ""} onChange={e => updateCourse(idx, "conicalHalfApexAngle_deg", Number(e.target.value))} />
                        </div>
                        <div className="space-y-1">
                          <VesselFieldLabel label="Type" />
                          <Combobox 
                            value={course.conicalType || "CONCENTRIC"} 
                            onChange={(val) => updateCourse(idx, "conicalType", val)}
                            options={[
                              { value: "CONCENTRIC", label: "Concentric" },
                              { value: "ECCENTRIC", label: "Eccentric" }
                            ]}
                            className="h-7 text-xs w-full bg-white dark:bg-black"
                          />
                        </div>
                        <div className="space-y-1">
                          <VesselFieldLabel label="L. Knuckle" unit="mm" />
                          <Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={course.conicalKnuckleRadiusLarge_mm || ""} onChange={e => updateCourse(idx, "conicalKnuckleRadiusLarge_mm", Number(e.target.value))} />
                        </div>
                        <div className="space-y-1">
                          <VesselFieldLabel label="S. Knuckle" unit="mm" />
                          <Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={course.conicalKnuckleRadiusSmall_mm || ""} onChange={e => updateCourse(idx, "conicalKnuckleRadiusSmall_mm", Number(e.target.value))} />
                        </div>
                        <div className="space-y-1">
                          <VesselFieldLabel label="Pur. Thk" unit="mm" />
                          <Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={course.purchasedThickness_mm || ""} onChange={e => updateCourse(idx, "purchasedThickness_mm", Number(e.target.value))} />
                        </div>
                        <div className="space-y-1">
                          <VesselFieldLabel label="Quantity" />
                          <Input type="number" className="h-7 text-xs bg-white dark:bg-black" value={course.numberOfCourses || 1} onChange={e => updateCourse(idx, "numberOfCourses", Number(e.target.value))} />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center bg-muted/20 p-2 rounded-lg mt-2">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Weld Seams (Auto)</span>
                      <span className="text-xs font-bold text-foreground">
                        Long: {course.longitudinalWeldSeams || 1} | 
                        Circ: {course.circumferentialWeldSeams || 0}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="space-y-1">
                        <VesselFieldLabel label="Long. Radiography (RT)" />
                        <Combobox 
                          value={course.longitudinalRadiography || "SPOT"} 
                          onChange={(val) => updateCourse(idx, "longitudinalRadiography", val)}
                          options={[
                            { value: "FULL", label: "RT-1 (Full)" },
                            { value: "SPOT", label: "RT-3 (Spot)" },
                            { value: "NONE", label: "RT-4 (None)" }
                          ]}
                          className="h-7 text-xs w-full bg-white dark:bg-black"
                        />
                      </div>
                      <div className="space-y-1">
                        <VesselFieldLabel label="Circ. Radiography (RT)" />
                        <Combobox 
                          value={course.circumferentialRadiography || "SPOT"} 
                          onChange={(val) => updateCourse(idx, "circumferentialRadiography", val)}
                          options={[
                            { value: "FULL", label: "RT-1 (Full)" },
                            { value: "SPOT", label: "RT-3 (Spot)" },
                            { value: "NONE", label: "RT-4 (None)" }
                          ]}
                          className="h-7 text-xs w-full bg-white dark:bg-black"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <VesselNodeFooter>
          <VesselFooterRow
            label="Raw Weight"
            value={(d.rawWeight ?? 0).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            unit="kg"
          />
          <VesselFooterRow
            label="Weld Len. / Elect."
            value={`${((d as any).weldLength_m ?? 0).toFixed(1)} m / ${((d as any).electrodeWeight_kg ?? 0).toFixed(1)} kg`}
          />
          <VesselFooterRow
            label="Area / Volume"
            value={`${((d as any).area_m2 ?? 0).toFixed(1)} m² / ${((d as any).internalVolume ?? 0).toFixed(1)} m³`}
          />
          <VesselFooterRow
            label="Max Elongation"
            value={`${((d as any).elongation_pct ?? 0).toFixed(1)}%`}
          />
          <VesselFooterHighlight
            label="Total Shell Weight"
            value={(d.calculatedWeight ?? 0).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            unit="kg"
          />
        </VesselNodeFooter>
      </VesselNodeContainer>
    </>
  );
});

ShellNode.displayName = "ShellNode";
