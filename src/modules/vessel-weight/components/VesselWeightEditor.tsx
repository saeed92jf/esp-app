'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { DiagramCanvas } from './DiagramCanvas';
import { Palette } from './Palette';
import { WeightSummaryPanel } from './WeightSummaryPanel';
import { MTOPanel } from './MTOPanel';
import { PrintReport } from './PrintReport';
import { useVesselWeightStore } from '../store/useVesselWeightStore';
import { ListTree, Table2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function VesselWeightEditor() {
  const activeRightPanelTab = useVesselWeightStore((s) => s.activeRightPanelTab);
  const setActiveRightPanelTab = useVesselWeightStore((s) => s.setActiveRightPanelTab);

  const [rightPanelWidth, setRightPanelWidth] = useState(450);
  const [leftPanelWidth, setLeftPanelWidth] = useState(256);
  
  const isResizingRight = useRef(false);
  const isResizingLeft = useRef(false);

  const startResizingRight = useCallback(() => { isResizingRight.current = true; }, []);
  const startResizingLeft = useCallback(() => { isResizingLeft.current = true; }, []);
  const stopResizing = useCallback(() => {
    isResizingRight.current = false;
    isResizingLeft.current = false;
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizingRight.current) {
      const newWidth = document.body.clientWidth - e.clientX;
      if (newWidth >= 300 && newWidth <= 1200) {
        setRightPanelWidth(newWidth);
      }
    }
    if (isResizingLeft.current) {
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 500) {
        setLeftPanelWidth(newWidth);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-background relative">
      <PrintReport />
      
      <div className="flex h-full w-full overflow-hidden print:hidden">
        <ReactFlowProvider>
          {/* Left Palette */}
        <aside 
          style={{ width: `${leftPanelWidth}px` }} 
          className="border-e border-border bg-card/50 flex-shrink-0 z-10 hidden md:flex flex-col relative"
        >
          <Palette />
          <div 
            onMouseDown={startResizingLeft} 
            className="absolute top-0 -right-1.5 w-3 h-full cursor-col-resize z-20 hover:bg-primary/20 transition-colors"
          />
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 relative h-full min-w-0">
          <DiagramCanvas />
        </main>

        {/* Right Panel Tabs */}
        <aside 
          style={{ width: `${rightPanelWidth}px` }} 
          className="border-s border-border bg-card flex-shrink-0 z-10 flex flex-col h-full overflow-hidden hidden xl:flex relative"
        >
          <div 
            onMouseDown={startResizingRight} 
            className="absolute top-0 -left-1.5 w-3 h-full cursor-col-resize z-20 hover:bg-primary/20 transition-colors"
          />

          <div className="flex w-full border-b border-border bg-muted/20">
            <button 
              onClick={() => setActiveRightPanelTab('summary')}
              className={cn(
                "flex-1 py-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2",
                activeRightPanelTab === 'summary' ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
            >
              <ListTree size={16} /> Summary
            </button>
            <button 
              onClick={() => setActiveRightPanelTab('mto')}
              className={cn(
                "flex-1 py-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 border-s",
                activeRightPanelTab === 'mto' ? "border-primary border-s-border text-foreground" : "border-b-transparent border-s-border text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
            >
              <Table2 size={16} /> MTO Table
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            <div className={cn("absolute inset-0 transition-opacity duration-200", activeRightPanelTab === 'summary' ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none")}>
              <WeightSummaryPanel />
            </div>
            <div className={cn("absolute inset-0 transition-opacity duration-200", activeRightPanelTab === 'mto' ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none")}>
              <MTOPanel />
            </div>
            </div>
          </aside>
        </ReactFlowProvider>
      </div>
    </div>
  );
}
