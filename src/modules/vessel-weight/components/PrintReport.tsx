'use client';

import React from 'react';
import { useVesselWeightStore } from '../store/useVesselWeightStore';
import type { VesselRoot } from '../schemas/vessel.schema';

export function PrintReport() {
  const nodes = useVesselWeightStore((s) => s.nodes);
  const summary = useVesselWeightStore((s) => s.weightSummary);
  
  const rootNode = nodes.find(n => n.type === 'vesselRootNode');
  const vesselData = rootNode?.data?.vessel as VesselRoot | undefined;

  const mtoRows = nodes
    .filter(n => !n.data?.excludeFromWeight && n.type !== 'vesselRootNode')
    .flatMap(n => {
      const d = n.data as any;
      let status = d.status || 'Preliminary';

      if (n.type === 'nozzleNode' && d.nozzles) {
        return d.nozzles.map((nz: any) => ({
          id: `${n.id}-${nz.nozzleId}`,
          componentId: nz.tag,
          category: 'Nozzle',
          description: `Nozzle ${nz.tag} - ${nz.size} ${nz.flangeType || ''}`,
          weight: nz.totalFabricatedWeight_kg || 0,
          status,
        }));
      }

      if (n.type === 'mistEliminatorNode' && d.equipments) {
        return d.equipments.map((eq: any) => ({
          id: `${n.id}-${eq.id}`,
          componentId: eq.tag || eq.type,
          category: 'Internals',
          description: `Mist Eliminator - ${eq.type} (${eq.shape || 'Standard'})`,
          weight: eq._weightData?.totalWeight || 0,
          status,
        }));
      }

      let weight = d.calculatedWeight || d.totalFabricatedWeight || 0;
      let description = 'Component';
      let componentId = n.id.slice(-5).toUpperCase();
      let category = n.type?.replace('Node', '');
      
      if (n.type === 'shellNode') { category = 'Pressure Body'; description = d.courses ? `Cylindrical Shell (${d.courses.length} courses)` : 'Cylindrical Shell Section'; }
      if (n.type === 'headNode') { category = 'Pressure Body'; description = d.heads ? `Vessel Heads (${d.heads.length})` : 'Head Section'; }
      if (n.type === 'supportNode') { category = 'Support'; description = `Support - ${d.supportType || 'SKIRT'}`; }
      if (n.type === 'attachmentsNode') { category = 'Attachments'; description = 'External Attachments'; }
      if (n.type === 'internalsNode') { category = 'Internals'; description = 'Internal Components'; }

      return [{
        id: n.id,
        componentId,
        category,
        description,
        weight,
        status,
      }];
    });

  const totalWeight = mtoRows.reduce((sum, r) => sum + r.weight, 0);

  // Group by category for the Client Report
  const categoryTotals = mtoRows.reduce((acc, row) => {
    const cat = row.category || 'Other';
    acc[cat] = (acc[cat] || 0) + row.weight;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="hidden print:block absolute inset-0 z-[9999] bg-white text-black font-sans print:w-[210mm]">
      
      {/* PAGE 1: CLIENT REPORT */}
      <div className="p-8 page-break-after">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider">[COMPANY NAME]</h1>
            <p className="text-sm text-gray-600 mt-1">Engineering & Manufacturing</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold uppercase">Weight Estimate Report</h2>
            <p className="text-sm mt-1">Date: {new Date().toLocaleDateString()}</p>
            <p className="text-sm">Document No: CALC-{vesselData?.vesselTag || 'V001'}-WT-01</p>
          </div>
        </div>

        {/* Vessel Info */}
        <div className="mb-8">
          <h3 className="font-bold border-b border-gray-300 pb-1 mb-3 uppercase text-sm">Project & Equipment Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-semibold text-gray-600 w-32 inline-block">Project Name:</span> [PROJECT NAME]</div>
            <div><span className="font-semibold text-gray-600 w-32 inline-block">Equipment Tag:</span> {vesselData?.vesselTag || 'V-001'}</div>
            <div><span className="font-semibold text-gray-600 w-32 inline-block">Orientation:</span> {vesselData?.orientation || 'VERTICAL'}</div>
            <div><span className="font-semibold text-gray-600 w-32 inline-block">Unit System:</span> {vesselData?.unitSystem || 'SI'}</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mb-12">
          <h3 className="font-bold border-b border-gray-300 pb-1 mb-3 uppercase text-sm">Weight Summary (Major Assemblies)</h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-2 text-left">Assembly Component</th>
                <th className="border border-gray-400 p-2 text-right">Weight (kg)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(categoryTotals).map(([cat, w]) => (
                <tr key={cat}>
                  <td className="border border-gray-400 p-2 font-medium capitalize">{cat}</td>
                  <td className="border border-gray-400 p-2 text-right tabular-nums">{(w as number).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-200 font-bold text-lg">
                <td className="border border-gray-400 p-3 text-right">Total Empty / Fabricated Weight:</td>
                <td className="border border-gray-400 p-3 text-right tabular-nums text-black">
                  {totalWeight.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Operating Conditions (if summary available) */}
        {summary && (
          <div className="mb-12">
            <h3 className="font-bold border-b border-gray-300 pb-1 mb-3 uppercase text-sm">6-Condition Weight Report</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between border-b border-dashed border-gray-300 py-1">
                <span className="text-gray-600">Raw / Cutting Weight:</span>
                <span className="font-bold tabular-nums">{summary.rawWeight.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-gray-300 py-1">
                <span className="text-gray-600">Fabricated Weight:</span>
                <span className="font-bold tabular-nums">{summary.fabricatedWeight.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-gray-300 py-1">
                <span className="text-gray-600">Shipping Weight:</span>
                <span className="font-bold tabular-nums">{summary.shippingWeight.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-gray-300 py-1">
                <span className="text-gray-600">Erection / Lift Weight:</span>
                <span className="font-bold tabular-nums">{summary.erectionWeight.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-gray-300 py-1">
                <span className="text-gray-600">Operating Weight:</span>
                <span className="font-bold tabular-nums">{summary.operatingWeight.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-gray-300 py-1">
                <span className="text-gray-600">Hydrotest Weight:</span>
                <span className="font-bold tabular-nums">{summary.hydrotestWeight.toLocaleString()} kg</span>
              </div>
            </div>
          </div>
        )}

        {/* Signatures */}
        <div className="mt-20 pt-8 border-t border-gray-300 grid grid-cols-3 gap-8 text-center text-sm">
          <div>
            <div className="h-16 border-b border-black w-3/4 mx-auto mb-2"></div>
            <p className="font-bold">Prepared By</p>
            <p className="text-gray-500">Design Engineer</p>
          </div>
          <div>
            <div className="h-16 border-b border-black w-3/4 mx-auto mb-2"></div>
            <p className="font-bold">Checked By</p>
            <p className="text-gray-500">Lead Engineer</p>
          </div>
          <div>
            <div className="h-16 border-b border-black w-3/4 mx-auto mb-2"></div>
            <p className="font-bold">Approved By</p>
            <p className="text-gray-500">Project Manager</p>
          </div>
        </div>
      </div>


      {/* PAGE 2+: INTERNAL REPORT */}
      <div className="p-8 break-before-page">
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
          <div>
            <h2 className="text-lg font-bold uppercase text-gray-800">Internal Use Only</h2>
            <p className="text-xs text-gray-500 mt-1">Detailed Material Take-Off (MTO) Breakdown</p>
          </div>
          <div className="text-right text-xs">
            <p>Tag: {vesselData?.vesselTag || 'V-001'}</p>
            <p>Page 2</p>
          </div>
        </div>

        {/* Detailed Table */}
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left border-y border-black uppercase">
              <th className="p-2 font-bold w-1/6">Tag/ID</th>
              <th className="p-2 font-bold w-1/5">Category</th>
              <th className="p-2 font-bold w-2/5">Description</th>
              <th className="p-2 font-bold w-1/6">Status</th>
              <th className="p-2 font-bold w-1/6 text-right">Net Weight (kg)</th>
            </tr>
          </thead>
          <tbody>
            {mtoRows.map((row, idx) => (
              <tr key={`${row.id}-${idx}`} className="border-b border-gray-300">
                <td className="p-2 font-medium">{row.componentId}</td>
                <td className="p-2 text-gray-600 capitalize">{row.category}</td>
                <td className="p-2">{row.description}</td>
                <td className="p-2 text-gray-500">{row.status}</td>
                <td className="p-2 text-right tabular-nums font-bold">
                  {row.weight.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-black font-bold text-sm">
              <td colSpan={4} className="p-3 text-right uppercase">Total Net Weight:</td>
              <td className="p-3 text-right tabular-nums">
                {totalWeight.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  );
}
