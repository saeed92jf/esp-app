"use client";

import React, { memo, useMemo, useState } from "react";
import { Position, type NodeProps, type Node } from "@xyflow/react";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  Scale,
  Boxes,
  Percent,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { useDiagramStore } from "@/modules/esp-flow/store";
import type { DiagramNodeData, DiagramNodeType } from "@/modules/esp-flow/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  VesselNodeContainer,
  VesselNodeToolbar,
  VesselNodeHeader,
  VesselNodeFooter,
  VesselFooterHighlight,
  VesselFooterRow,
} from "./VesselNodeBase";

type DiagramNode = Node<DiagramNodeData, DiagramNodeType>;
type Props = NodeProps<DiagramNode>;

export interface MtoItem {
  id: string;
  componentId: string;
  category: string;
  categoryKey: string;
  description: string;
  material?: string;
  quantity?: number;
  unitWeight: number;
  totalWeight: number;
  status: string;
}

export const MtoReportNode = memo(({ id, data, selected }: Props) => {
  const nodes = useDiagramStore((s) => s.nodes);
  const duplicateSelected = useDiagramStore((s) => s.duplicateSelected);
  const resetNodesToDefault = useDiagramStore((s) => s.resetNodesToDefault);
  const deleteNode = (nodeId: string) => {
    useDiagramStore.setState((s) => ({
      nodes: s.nodes.filter((n) => n.id !== nodeId),
      edges: s.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }));
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(true);

  // Extract project/general metadata if available on canvas
  const projectInfo = useMemo(() => {
    let tagNo = "V-101";
    let vesselName = "Pressure Vessel";
    let client = "Engineering Client";
    let projectNo = "PRJ-2026";
    let revision = "Rev 0";
    let designPressure = "";
    let designTemp = "";

    nodes.forEach((n) => {
      if (n.type === "projectDataNode") {
        const d = n.data as any;
        const prj = d.projectData || d;
        if (prj.projectTitle) vesselName = prj.projectTitle;
        if (prj.clientName) client = prj.clientName;
        if (prj.projectNumber) projectNo = prj.projectNumber;
        if (prj.revisionNumber) revision = `Rev ${prj.revisionNumber}`;
      }
      if (n.type === "generalDataNode") {
        const d = n.data as any;
        const gd = d.generalData || d;
        if (gd.tagNo) tagNo = gd.tagNo;
        if (gd.equipmentType) vesselName = `${gd.tagNo} - ${gd.equipmentType}`;
        if (gd.designPressure_barg) designPressure = `${gd.designPressure_barg} barg`;
        if (gd.designTemp_C) designTemp = `${gd.designTemp_C} °C`;
      }
    });

    return { tagNo, vesselName, client, projectNo, revision, designPressure, designTemp };
  }, [nodes]);

  // Aggregate all components from nodes on canvas
  const mtoRows = useMemo<MtoItem[]>(() => {
    const items: MtoItem[] = [];

    nodes
      .filter((n) => !n.data?.excludeFromWeight && n.type !== "vesselRootNode" && n.type !== "mtoNode")
      .forEach((n) => {
        const d = n.data as any;
        const status = d.status || "Calculated";

        if (n.type === "nozzleNode" && Array.isArray(d.nozzles) && d.nozzles.length > 0) {
          d.nozzles.forEach((nz: any, idx: number) => {
            const wt = Number(nz.totalFabricatedWeight_kg) || Number(nz.totalWeight_kg) || Number(nz.weight_kg) || 0;
            items.push({
              id: `${n.id}-nz-${nz.nozzleId || idx}`,
              componentId: nz.tag || `N${idx + 1}`,
              category: "Nozzle",
              categoryKey: "nozzle",
              description: `Nozzle ${nz.tag || `N${idx + 1}`} (${nz.size || nz.nominalSize || '2"'} ${nz.flangeRating || nz.flangeClass || "150#"} ${nz.flangeType || "WN"})`,
              material: nz.pipeMaterial || nz.material || "A106-B / A105",
              quantity: Number(nz.quantity) || 1,
              unitWeight: wt,
              totalWeight: wt * (Number(nz.quantity) || 1),
              status,
            });
          });
          return;
        }

        if (n.type === "headNode" && Array.isArray(d.heads) && d.heads.length > 0) {
          d.heads.forEach((hd: any, idx: number) => {
            const wt = Number(hd.calculatedWeight_kg) || Number(hd.weight_kg) || Number(hd.formedWeight_kg) || 0;
            items.push({
              id: `${n.id}-hd-${hd.headId || idx}`,
              componentId: `Head (${hd.position || (idx === 0 ? "Top" : "Bottom")})`,
              category: "Head",
              categoryKey: "head",
              description: `${hd.headType?.replace(/_/g, " ") || "2:1 Elliptical Head"} (OD: ${hd.insideDiameter_mm || hd.diameter_mm || "1000"}mm, Thk: ${hd.thicknessAfterForming_mm || hd.thickness_mm || "10"}mm)`,
              material: hd.material || "SA-516 Gr.70",
              quantity: 1,
              unitWeight: wt,
              totalWeight: wt,
              status,
            });
          });
          return;
        }

        if (n.type === "shellNode" && Array.isArray(d.courses) && d.courses.length > 0) {
          d.courses.forEach((c: any, idx: number) => {
            const wt = Number(c.weight_kg) || Number(c.calculatedWeight_kg) || 0;
            items.push({
              id: `${n.id}-course-${idx}`,
              componentId: `Course-${c.courseNo || idx + 1}`,
              category: "Shell",
              categoryKey: "shell",
              description: `Shell Course #${c.courseNo || idx + 1} (ID: ${c.insideDiameter_mm || "1000"}mm, L: ${c.length_mm || "2000"}mm, Thk: ${c.thickness_mm || "12"}mm)`,
              material: c.material || "SA-516 Gr.70",
              quantity: 1,
              unitWeight: wt,
              totalWeight: wt,
              status,
            });
          });
          return;
        }

        if (n.type === "mistEliminatorNode" && Array.isArray(d.equipments) && d.equipments.length > 0) {
          d.equipments.forEach((eq: any, idx: number) => {
            const wt = Number(eq._weightData?.totalWeight) || Number(eq.weight_kg) || 0;
            items.push({
              id: `${n.id}-me-${eq.id || idx}`,
              componentId: eq.tag || `ME-${idx + 1}`,
              category: "Internals",
              categoryKey: "internals",
              description: `Mist Eliminator: ${eq.type || "Wire Mesh"} (${eq.shape || "Circular"})`,
              material: eq.material || "SS316L",
              quantity: 1,
              unitWeight: wt,
              totalWeight: wt,
              status,
            });
          });
          return;
        }

        // Fallback for single component / aggregate nodes
        let weight = Number(d.calculatedWeight) || Number(d.totalFabricatedWeight) || Number(d.weight_kg) || Number(d.totalWeight) || 0;
        let category = n.type ? n.type.replace("Node", "") : "Component";
        let categoryKey = category.toLowerCase();
        let description = d.description || `${category} assembly`;
        let componentId = d.tag || d.tagNo || n.id.slice(-6).toUpperCase();

        if (n.type === "shellNode") {
          description = "Cylindrical Shell Section";
          category = "Shell";
          categoryKey = "shell";
        } else if (n.type === "headNode") {
          description = "Vessel Formed Heads";
          category = "Head";
          categoryKey = "head";
        } else if (n.type === "supportNode") {
          description = `Vessel Support (${d.supportType || "Skirt / Saddles"})`;
          category = "Support";
          categoryKey = "support";
        } else if (n.type === "jacketNode") {
          description = `Thermal Jacket (${d.jacketType || "Conventional / Dimple"})`;
          category = "Jacket";
          categoryKey = "jacket";
        } else if (n.type === "attachmentsNode") {
          description = "External Attachments & Lifting Lugs";
          category = "Attachments";
          categoryKey = "attachments";
        } else if (n.type === "internalsNode") {
          description = "Internal Vessel Hardware & Trays";
          category = "Internals";
          categoryKey = "internals";
        } else if (n.type === "regenVacuumSteamoutNode") {
          description = "Vacuum Stiffeners & Regen Rings";
          category = "Stiffening";
          categoryKey = "stiffening";
        } else if (n.type === "surfacePrepNode") {
          description = "Surface Preparation & External Coating";
          category = "Coating";
          categoryKey = "coating";
        } else if (n.type === "outputHubNode") {
          return;
        }

        if (weight > 0 || d.title || d.label) {
          items.push({
            id: n.id,
            componentId,
            category: category.charAt(0).toUpperCase() + category.slice(1),
            categoryKey,
            description,
            material: d.material || "Carbon Steel",
            quantity: 1,
            unitWeight: weight,
            totalWeight: weight,
            status,
          });
        }
      });

    return items;
  }, [nodes]);

  // Calculations & category breakdowns
  const totalNetWeight = useMemo(() => {
    return mtoRows.reduce((sum, r) => sum + (r.totalWeight || 0), 0);
  }, [mtoRows]);

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { category: string; count: number; weight: number }>();
    mtoRows.forEach((item) => {
      const key = item.category;
      const existing = map.get(key) || { category: key, count: 0, weight: 0 };
      existing.count += item.quantity || 1;
      existing.weight += item.totalWeight || 0;
      map.set(key, existing);
    });

    return Array.from(map.values()).map((c) => ({
      ...c,
      percentage: totalNetWeight > 0 ? (c.weight / totalNetWeight) * 100 : 0,
    })).sort((a, b) => b.weight - a.weight);
  }, [mtoRows, totalNetWeight]);

  const categoriesList = useMemo(() => {
    const list = Array.from(new Set(mtoRows.map((r) => r.category)));
    return ["ALL", ...list];
  }, [mtoRows]);

  // Filtered rows for table view
  const filteredRows = useMemo(() => {
    return mtoRows.filter((r) => {
      const matchesCat = selectedCategory === "ALL" || r.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        r.componentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.material && r.material.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [mtoRows, selectedCategory, searchQuery]);

  // Heaviest single component
  const heaviestItem = useMemo(() => {
    if (mtoRows.length === 0) return null;
    return [...mtoRows].sort((a, b) => b.totalWeight - a.totalWeight)[0];
  }, [mtoRows]);

  // Export handlers
  const handleExportCSV = () => {
    const header = "Item/Tag,Category,Description,Material,Quantity,Unit Weight (kg),Total Weight (kg),Status\n";
    const rows = mtoRows
      .map(
        (r) =>
          `"${r.componentId}","${r.category}","${r.description.replace(/"/g, '""')}","${r.material || ""}","${r.quantity || 1}",${r.unitWeight.toFixed(1)},${r.totalWeight.toFixed(1)},"${r.status}"`
      )
      .join("\n");
    const summary = `\n"TOTAL NET WEIGHT","","","","",,"${totalNetWeight.toFixed(1)} kg",""\n`;
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(header + rows + summary);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `MTO_Report_${projectInfo.tagNo}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
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
        widthClass="w-[560px]"
        showHandles={true}
      >
        {/* Document-Style Report Header */}
        <VesselNodeHeader
          icon={<FileSpreadsheet size={18} className="text-sky-100" />}
          title="Material Take-Off (MTO)"
          subtitle="Engineering Bill of Materials & Weight Ledger"
          actions={
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExportCSV}
                className="h-7 w-7 text-sky-100 hover:text-white hover:bg-white/20"
                title="Export CSV Bill of Materials"
              >
                <Download size={13} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrint}
                className="h-7 w-7 text-sky-100 hover:text-white hover:bg-white/20"
                title="Print Technical MTO Document"
              >
                <Printer size={13} />
              </Button>
            </div>
          }
        />

        {/* Document Control Header Strip */}
        <div className="bg-sky-900/10 dark:bg-sky-950/60 px-3 py-2 border-b border-sky-300/40 dark:border-sky-800/50 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-sky-700/80 dark:text-sky-400 font-semibold uppercase">Tag: </span>
              <span className="font-bold text-sky-900 dark:text-sky-100">{projectInfo.tagNo}</span>
            </div>
            <div>
              <span className="text-sky-700/80 dark:text-sky-400 font-semibold uppercase">Project: </span>
              <span className="font-medium text-foreground truncate max-w-[120px]">{projectInfo.projectNo}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-sky-200/80 dark:bg-sky-900/80 text-sky-900 dark:text-sky-200 font-bold text-[9px]">
              {projectInfo.revision}
            </span>
            <span className="text-muted-foreground text-[9px]">
              {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </span>
          </div>
        </div>

        <div className="p-3 space-y-3">
          {/* Executive KPI Stat Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-sky-50 dark:bg-sky-950/50 p-2.5 rounded-lg border border-sky-200/90 dark:border-sky-800/60 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-sky-900/80 dark:text-sky-300 uppercase tracking-wider">
                  Total Net Weight
                </span>
                <Scale size={12} className="text-sky-700 dark:text-sky-400" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-extrabold text-sky-900 dark:text-sky-100 tabular-nums">
                  {totalNetWeight.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </span>
                <span className="text-[10px] font-semibold text-sky-700 dark:text-sky-400">kg</span>
              </div>
            </div>

            <div className="bg-sky-50 dark:bg-sky-950/50 p-2.5 rounded-lg border border-sky-200/90 dark:border-sky-800/60 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-sky-900/80 dark:text-sky-300 uppercase tracking-wider">
                  Components Count
                </span>
                <Boxes size={12} className="text-sky-700 dark:text-sky-400" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-extrabold text-sky-900 dark:text-sky-100 tabular-nums">
                  {mtoRows.length}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">items</span>
              </div>
            </div>

            <div className="bg-sky-50 dark:bg-sky-950/50 p-2.5 rounded-lg border border-sky-200/90 dark:border-sky-800/60 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-sky-900/80 dark:text-sky-300 uppercase tracking-wider">
                  Heaviest Item
                </span>
                <Percent size={12} className="text-sky-700 dark:text-sky-400" />
              </div>
              <div className="mt-1 truncate">
                <span className="text-xs font-bold text-sky-900 dark:text-sky-100 truncate block">
                  {heaviestItem ? heaviestItem.componentId : "—"}
                </span>
                <span className="text-[9px] text-muted-foreground tabular-nums">
                  {heaviestItem ? `${heaviestItem.totalWeight.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg` : "0 kg"}
                </span>
              </div>
            </div>
          </div>

          {/* Category Breakdown Accordion / Progress Bars */}
          {categoryBreakdown.length > 0 && (
            <div className="rounded-lg border border-sky-200/80 dark:border-sky-800/60 overflow-hidden bg-sky-50/40 dark:bg-sky-950/30">
              <div
                className="px-2.5 py-1.5 bg-sky-100/60 dark:bg-sky-950/60 flex items-center justify-between cursor-pointer select-none hover:bg-sky-100/80 transition-colors"
                onClick={() => setShowCategoryBreakdown(!showCategoryBreakdown)}
              >
                <div className="flex items-center gap-1.5">
                  <Layers size={12} className="text-sky-800 dark:text-sky-300" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-900 dark:text-sky-200">
                    Category Distribution ({categoryBreakdown.length} Groups)
                  </span>
                </div>
                <div className="text-sky-700 dark:text-sky-300">
                  {showCategoryBreakdown ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </div>
              </div>

              {showCategoryBreakdown && (
                <div className="p-2.5 space-y-2">
                  {/* Visual Multi-Segment Bar */}
                  <div className="h-2 w-full rounded-full overflow-hidden flex bg-sky-200/60 dark:bg-sky-900/60">
                    {categoryBreakdown.map((c, i) => {
                      const colors = [
                        "bg-[#39436a]",
                        "bg-[#535a9a]",
                        "bg-[#7f60ff]",
                        "bg-[#8ba4e4]",
                        "bg-[#a4c4f4]",
                        "bg-[#bee3ff]",
                      ];
                      return (
                        <div
                          key={c.category}
                          style={{ width: `${Math.max(c.percentage, 2)}%` }}
                          className={`${colors[i % colors.length]} transition-all duration-300`}
                          title={`${c.category}: ${c.weight.toFixed(1)} kg (${c.percentage.toFixed(1)}%)`}
                        />
                      );
                    })}
                  </div>

                  {/* Category Pill Badges */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {categoryBreakdown.map((c) => (
                      <div
                        key={c.category}
                        onClick={() => setSelectedCategory(selectedCategory === c.category ? "ALL" : c.category)}
                        className={`flex items-center justify-between px-2 py-1 rounded text-[9px] cursor-pointer transition-colors border ${
                          selectedCategory === c.category
                            ? "bg-sky-800 text-white border-sky-800 font-bold"
                            : "bg-white dark:bg-black/40 text-foreground border-sky-200/80 dark:border-sky-800/40 hover:bg-sky-100/50"
                        }`}
                      >
                        <span className="truncate">{c.category} ({c.count})</span>
                        <span className="tabular-nums font-semibold">
                          {c.weight.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg ({c.percentage.toFixed(0)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filter & Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tag, description, material..."
                className="h-7 text-[11px] pl-7 bg-white dark:bg-black/60 border-sky-200/90 dark:border-sky-800/60"
              />
            </div>
            {categoriesList.length > 2 && (
              <div className="flex items-center gap-1 shrink-0 overflow-x-auto max-w-[200px] no-scrollbar">
                {categoriesList.slice(0, 4).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-colors shrink-0 ${
                      selectedCategory === cat
                        ? "bg-sky-800 text-white"
                        : "bg-sky-100/70 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300 hover:bg-sky-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Itemized Report Table */}
          <div className="rounded-lg border border-sky-300/60 dark:border-sky-800/60 overflow-hidden bg-white dark:bg-zinc-950 shadow-xs">
            <div className="max-h-[260px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-[11px] whitespace-nowrap border-collapse">
                <thead className="sticky top-0 z-10 bg-sky-100/90 dark:bg-sky-950 text-sky-900 dark:text-sky-200 uppercase text-[9px] font-extrabold tracking-wider border-b border-sky-300/60 dark:border-sky-800/60 backdrop-blur-xs">
                  <tr>
                    <th className="px-2.5 py-1.5 border-r border-sky-200/60 dark:border-sky-800/40">Tag / Item</th>
                    <th className="px-2 py-1.5 border-r border-sky-200/60 dark:border-sky-800/40">Cat.</th>
                    <th className="px-2.5 py-1.5 border-r border-sky-200/60 dark:border-sky-800/40">Description</th>
                    <th className="px-2 py-1.5 border-r border-sky-200/60 dark:border-sky-800/40">Material</th>
                    <th className="px-2 py-1.5 text-center border-r border-sky-200/60 dark:border-sky-800/40">Qty</th>
                    <th className="px-2.5 py-1.5 text-right font-extrabold">Weight (kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100 dark:divide-sky-900/40 text-[10px]">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-xs">
                        No components found matching current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr key={row.id} className="hover:bg-sky-50/70 dark:hover:bg-sky-900/20 transition-colors">
                        <td className="px-2.5 py-1.5 font-bold text-sky-900 dark:text-sky-100 border-r border-sky-100/60 dark:border-sky-900/30">
                          {row.componentId}
                        </td>
                        <td className="px-2 py-1.5 border-r border-sky-100/60 dark:border-sky-900/30">
                          <span className="inline-block px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300">
                            {row.category}
                          </span>
                        </td>
                        <td className="px-2.5 py-1.5 text-foreground truncate max-w-[180px] border-r border-sky-100/60 dark:border-sky-900/30" title={row.description}>
                          {row.description}
                        </td>
                        <td className="px-2 py-1.5 text-muted-foreground truncate max-w-[100px] border-r border-sky-100/60 dark:border-sky-900/30" title={row.material}>
                          {row.material || "—"}
                        </td>
                        <td className="px-2 py-1.5 text-center tabular-nums font-semibold border-r border-sky-100/60 dark:border-sky-900/30">
                          {row.quantity || 1}
                        </td>
                        <td className="px-2.5 py-1.5 text-right tabular-nums font-extrabold text-sky-900 dark:text-sky-100">
                          {row.totalWeight.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Summary */}
        <VesselNodeFooter>
          <VesselFooterRow
            label="Total Components in Schedule"
            value={`${mtoRows.length} Items across ${categoryBreakdown.length} Categories`}
          />
          <VesselFooterHighlight
            label="Grand Total Net Fabricated Weight"
            value={totalNetWeight.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            unit="kg"
          />
        </VesselNodeFooter>
      </VesselNodeContainer>
    </>
  );
});

MtoReportNode.displayName = "MtoReportNode";
