'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Database, Cylinder, Box, Settings, ArrowDownToLine, Paperclip, Layers, Link, ChevronDown, ChevronRight, LayoutList, Filter, Beaker } from 'lucide-react';

type PaletteItem = {
  type: string;
  label: string;
  icon: React.ReactNode;
  color: string;
};

type PaletteCategory = {
  id: string;
  title: string;
  icon?: React.ReactNode;
  items?: PaletteItem[];
  subCategories?: PaletteCategory[];
};

export function Palette() {
  const t = useTranslations('VesselWeight');

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    body: true,
    internals: true,
  });

  const toggleCategory = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const categories: PaletteCategory[] = [
    {
      id: 'body',
      title: 'Vessel Body & Structure',
      items: [
        { type: 'vesselRootNode', label: 'Vessel Root', icon: <Database size={14} />, color: 'text-primary bg-primary/10 border-primary/30 hover:border-primary' },
        { type: 'shellNode', label: 'Shell Section', icon: <Cylinder size={14} />, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500' },
        { type: 'headNode', label: 'Head', icon: <Box size={14} />, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30 hover:border-amber-500' },
        { type: 'nozzleNode', label: 'Nozzle', icon: <Settings size={14} />, color: 'text-blue-500 bg-blue-500/10 border-blue-500/30 hover:border-blue-500' },
        { type: 'supportNode', label: 'Support (Skirt/Leg/Saddle)', icon: <ArrowDownToLine size={14} />, color: 'text-slate-500 bg-slate-500/10 border-slate-500/30 hover:border-slate-500' },
        { type: 'attachmentsNode', label: 'Attachments', icon: <Paperclip size={14} />, color: 'text-purple-500 bg-purple-500/10 border-purple-500/30 hover:border-purple-500' },
        { type: 'outputHubNode', label: 'Output Hub', icon: <Link size={14} />, color: 'text-slate-700 bg-slate-200 border-slate-400 hover:border-slate-700' },
      ]
    },
    {
      id: 'internals',
      title: 'Internals & Process',
      subCategories: [
        {
          id: 'internals_separator',
          title: 'Separator Internals',
          icon: <Filter size={14} className="text-muted-foreground" />,
          items: [
            { type: 'placeholder_feedDistributorNode', label: 'Feed Distributor', icon: <Layers size={14} />, color: 'text-muted-foreground bg-muted/20 border-muted-foreground/30 border-dashed' },
            { type: 'mistEliminatorNode', label: 'Mist Eliminator', icon: <Layers size={14} />, color: 'text-pink-500 bg-pink-500/10 border-pink-500/30 hover:border-pink-500' },
            { type: 'placeholder_coalescerNode', label: 'Coalescer', icon: <Layers size={14} />, color: 'text-muted-foreground bg-muted/20 border-muted-foreground/30 border-dashed' },
          ]
        },
        {
          id: 'internals_tower',
          title: 'Tower Internals',
          icon: <LayoutList size={14} className="text-muted-foreground" />,
          items: [
            { type: 'placeholder_trayTowerNode', label: 'Tray Tower', icon: <Layers size={14} />, color: 'text-muted-foreground bg-muted/20 border-muted-foreground/30 border-dashed' },
            { type: 'placeholder_packTowerNode', label: 'Pack Tower', icon: <Box size={14} />, color: 'text-muted-foreground bg-muted/20 border-muted-foreground/30 border-dashed' },
          ]
        },
        {
          id: 'internals_reactor',
          title: 'Reactor Internal',
          icon: <Beaker size={14} className="text-muted-foreground" />,
          items: [
            { type: 'placeholder_reactorInternalNode', label: 'Reactor Internal', icon: <Beaker size={14} />, color: 'text-muted-foreground bg-muted/20 border-muted-foreground/30 border-dashed' },
          ]
        },
        {
          id: 'internals_filtration',
          title: 'Filtration',
          icon: <Filter size={14} className="text-muted-foreground" />,
          items: [
            { type: 'placeholder_inlineFiltrationNode', label: 'Inline', icon: <Cylinder size={14} />, color: 'text-muted-foreground bg-muted/20 border-muted-foreground/30 border-dashed' },
            { type: 'placeholder_equipmentFiltrationNode', label: 'Equipment', icon: <Cylinder size={14} />, color: 'text-muted-foreground bg-muted/20 border-muted-foreground/30 border-dashed' },
            { type: 'placeholder_membraneFiltrationNode', label: 'Membrane', icon: <Layers size={14} />, color: 'text-muted-foreground bg-muted/20 border-muted-foreground/30 border-dashed' },
          ]
        }
      ]
    }
  ];

  const renderItems = (items: PaletteItem[]) => {
    return items.map((node) => {
      const isPlaceholder = node.type.startsWith('placeholder_');
      return (
        <div
          key={node.type}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md border cursor-grab transition-all shadow-sm ${node.color} ${isPlaceholder ? 'opacity-60 cursor-not-allowed' : ''}`}
          onDragStart={(event) => {
            if (!isPlaceholder) onDragStart(event, node.type);
          }}
          draggable={!isPlaceholder}
          title={isPlaceholder ? 'Coming Soon' : `Add ${node.label}`}
        >
          {node.icon}
          <span className="text-[11px] font-semibold text-foreground">{node.label}</span>
          {isPlaceholder && <span className="ml-auto text-[9px] text-muted-foreground italic">Soon</span>}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="p-4 border-b border-border bg-muted/20 sticky top-0 z-10 backdrop-blur-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Components</h2>
        <p className="text-[10px] text-muted-foreground mt-1">Drag and drop nodes to build the vessel.</p>
      </div>
      
      <div className="p-3 flex flex-col gap-2">
        {categories.map((category) => {
          const isExpanded = expandedCategories[category.id];
          return (
            <div key={category.id} className="border border-border rounded-lg overflow-hidden bg-card">
              <button
                onClick={(e) => toggleCategory(category.id, e)}
                className="w-full flex items-center justify-between p-2.5 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  {category.icon}
                  <span className="text-xs font-bold text-foreground">{category.title}</span>
                </div>
                {isExpanded ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
              </button>
              
              {isExpanded && (
                <div className="p-2 flex flex-col gap-1.5 bg-muted/5 border-t border-border">
                  {category.items && renderItems(category.items)}

                  {category.subCategories && category.subCategories.map(subCat => {
                    const isSubExpanded = expandedCategories[subCat.id];
                    return (
                      <div key={subCat.id} className="border border-border/50 rounded-md overflow-hidden bg-background mt-1">
                        <button
                          onClick={(e) => toggleCategory(subCat.id, e)}
                          className="w-full flex items-center justify-between p-2 bg-muted/10 hover:bg-muted/20 transition-colors text-left border-b border-border/50"
                        >
                          <div className="flex items-center gap-2">
                            {subCat.icon}
                            <span className="text-[11px] font-semibold text-foreground">{subCat.title}</span>
                          </div>
                          {isSubExpanded ? <ChevronDown size={12} className="text-muted-foreground" /> : <ChevronRight size={12} className="text-muted-foreground" />}
                        </button>
                        {isSubExpanded && subCat.items && (
                          <div className="p-2 flex flex-col gap-1.5 bg-muted/5">
                            {renderItems(subCat.items)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
