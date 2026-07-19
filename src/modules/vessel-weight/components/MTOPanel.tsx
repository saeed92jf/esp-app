import React from 'react';
import { useTranslations } from 'next-intl';
import { useVesselWeightStore } from '../store/useVesselWeightStore';
import { Download, Printer } from 'lucide-react';

export function MTOPanel() {
  const t = useTranslations('VesselWeight');
  const nodes = useVesselWeightStore((s) => s.nodes);

  const mtoRows = nodes
    .filter(n => !n.data?.excludeFromWeight && n.type !== 'vesselRootNode')
    .flatMap(n => {
      const d = n.data as any;
      let status = d.status || 'Preliminary';

      if (n.type === 'nozzleNode' && d.nozzles) {
        return d.nozzles.map((nz: any) => ({
          id: `${n.id}-${nz.nozzleId}`,
          componentId: nz.tag,
          category: 'nozzle',
          description: `Nozzle ${nz.tag} - ${nz.size} ${nz.flangeType || ''}`,
          weight: nz.totalFabricatedWeight_kg || 0,
          status,
        }));
      }

      if (n.type === 'mistEliminatorNode' && d.equipments) {
        return d.equipments.map((eq: any) => ({
          id: `${n.id}-${eq.id}`,
          componentId: eq.tag || eq.type,
          category: 'internals',
          description: `Mist Eliminator - ${eq.type} (${eq.shape || 'Standard'})`,
          weight: eq._weightData?.totalWeight || 0,
          status,
        }));
      }

      let weight = d.calculatedWeight || d.totalFabricatedWeight || 0;
      let description = 'Component';
      let componentId = n.id.slice(-5).toUpperCase();
      
      if (n.type === 'shellNode') description = d.courses ? `Cylindrical Shell (${d.courses.length} courses)` : 'Cylindrical Shell Section';
      if (n.type === 'headNode') description = d.heads ? `Vessel Heads (${d.heads.length})` : 'Head Section';
      if (n.type === 'supportNode') description = `Support - ${d.supportType || 'SKIRT'}`;
      if (n.type === 'attachmentsNode') description = 'External Attachments';
      if (n.type === 'internalsNode') description = 'Internal Components';

      return [{
        id: n.id,
        componentId,
        category: n.type?.replace('Node', ''),
        description,
        weight,
        status,
      }];
    });

  const handleExportCSV = () => {
    const header = "ID,Category,Description,Status,Weight (kg)\n";
    const rows = mtoRows.map(r => `${r.componentId},${r.category},"${r.description}",${r.status},${r.weight.toFixed(1)}`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(header + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "MTO_Export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalWeight = mtoRows.reduce((sum, r) => sum + r.weight, 0);

  if (mtoRows.length === 0) {
    return (
      <div className="flex h-full w-full flex-col bg-card border-s border-border">
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <div>
            <p className="text-sm font-medium text-foreground">No components</p>
            <p className="text-xs text-muted-foreground mt-1">Add components to the canvas to see MTO.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-card border-s border-border overflow-hidden print:w-full print:border-none print:h-auto">
      <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Material Take-Off</h2>
          <p className="text-[10px] text-muted-foreground">List of all major components and weights.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="flex h-8 w-8 items-center justify-center rounded bg-background border border-border text-foreground hover:bg-muted transition-colors" title="Export CSV">
            <Download size={14} />
          </button>
          <button onClick={() => window.print()} className="flex h-8 w-8 items-center justify-center rounded bg-background border border-border text-foreground hover:bg-muted transition-colors" title="Print MTO">
            <Printer size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        <div className="rounded-md border border-border overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[9px] font-bold tracking-wider">
              <tr>
                <th className="px-3 py-2 border-b border-border">Tag/ID</th>
                <th className="px-3 py-2 border-b border-border">Category</th>
                <th className="px-3 py-2 border-b border-border">Description</th>
                <th className="px-3 py-2 border-b border-border">Status</th>
                <th className="px-3 py-2 border-b border-border text-right">Weight (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mtoRows.map(row => (
                <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2 font-medium text-foreground">{row.componentId}</td>
                  <td className="px-3 py-2 text-muted-foreground capitalize">{row.category}</td>
                  <td className="px-3 py-2 truncate max-w-[150px]">{row.description}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-500 border border-amber-500/20">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-bold text-foreground">
                    {row.weight.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/30 font-bold border-t-2 border-border">
              <tr>
                <td colSpan={4} className="px-3 py-3 text-right uppercase text-[10px] tracking-wider text-muted-foreground">Total Net Weight:</td>
                <td className="px-3 py-3 text-right tabular-nums text-primary text-sm">
                  {totalWeight.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
