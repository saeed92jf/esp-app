"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { NAVIGATION, NAV_COLOR_MAP, type NavColor } from "@/config/navigation";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Box, ChevronDown, ChevronUp, ExternalLink, type LucideIcon } from "lucide-react";

export type SitemapNodeData = {
  label: string;
  href?: string;
  color?: NavColor;
  isRoot?: boolean;
  isGroup?: boolean;
  groupId?: string;
  itemIdx?: number;
  isCollapsed?: boolean;
};

function SitemapNodeComponent({ data, selected, targetPosition = Position.Top, sourcePosition = Position.Bottom }: NodeProps<import("@xyflow/react").Node<SitemapNodeData>>) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  
  // Lookup icon to avoid non-serializable data in ReactFlow state
  let Icon: LucideIcon | undefined = undefined;
  if (data.isRoot) {
    Icon = Box;
  } else if (data.isGroup && data.groupId) {
    const group = NAVIGATION.find(g => g.id === data.groupId);
    Icon = group?.icon;
  } else if (!data.isGroup && data.groupId && data.itemIdx !== undefined) {
    const group = NAVIGATION.find(g => g.id === data.groupId);
    Icon = group?.items[data.itemIdx]?.icon;
  }

  const colorStyles = data.color ? NAV_COLOR_MAP[data.color] : null;
  // Fallback icon color if no color provided
  const iconColorClass = colorStyles ? colorStyles.icon : "text-primary";
  
  // Custom styles based on node type
  const isRoot = data.isRoot;
  const isGroup = data.isGroup;

  const innerContent = (
    <div
      className={cn(
        "relative flex items-center gap-3 px-4 py-3 min-w-[200px] rounded-2xl bg-card border-2 shadow-sm transition-all duration-300",
        selected ? "border-primary shadow-md ring-2 ring-primary/20 scale-[1.02]" : "border-border/50 hover:border-border hover:shadow-md",
        isRoot && "border-primary/50 bg-primary/5",
        isGroup && "border-border bg-muted cursor-pointer hover:bg-accent hover:text-accent-foreground",
        !isGroup && !isRoot && "cursor-pointer hover:bg-muted/10",
        isRtl && "font-vazir fa-num dir-rtl"
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div
        className={cn(
          "flex items-center justify-center size-10 rounded-xl shrink-0 transition-colors",
          isRoot ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          colorStyles && !isRoot && "bg-background shadow-sm border border-border/50",
          isGroup && selected && "ring-2 ring-border"
        )}
      >
        {Icon ? (
          <Icon className={cn("size-5", colorStyles && !isRoot ? iconColorClass : "")} />
        ) : (
          <div className="size-5" /> // placeholder
        )}
      </div>
      
      <div className="flex-1 min-w-0 pr-6">
        <h3 className={cn(
          "font-semibold truncate",
          isRoot ? "text-lg text-primary" : "text-sm text-foreground",
          isGroup && "text-muted-foreground font-medium"
        )}>
          {data.label}
        </h3>
      </div>

      {isGroup && (
        <div className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground/50">
          {data.isCollapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
        </div>
      )}

      {data.href && !isGroup && !isRoot && (
        <Link 
          href={data.href as any} 
          className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-primary transition-colors p-1"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="size-4" />
        </Link>
      )}
    </div>
  );

  return (
    <div className="group relative">
      {isRoot && (
        <>
          <Handle type="source" position={Position.Left} id="left" className="opacity-0 w-0 h-0 border-none" />
          <Handle type="source" position={Position.Right} id="right" className="opacity-0 w-0 h-0 border-none" />
          <Handle type="source" position={Position.Top} id="top" className="opacity-0 w-0 h-0 border-none" />
          <Handle type="source" position={Position.Bottom} id="bottom" className="opacity-0 w-0 h-0 border-none" />
        </>
      )}

      {!isRoot && (
        <Handle 
          type="target" 
          position={targetPosition} 
          className="!w-3 !h-3 !bg-muted-foreground/30 !border-2 !border-background group-hover:!bg-primary transition-colors" 
        />
      )}
      
      {innerContent}

      {!isRoot && (!isGroup || !data.isCollapsed) && (
        <Handle 
          type="source" 
          position={sourcePosition} 
          className="!w-3 !h-3 !bg-muted-foreground/30 !border-2 !border-background group-hover:!bg-primary transition-colors" 
        />
      )}
    </div>
  );
}

export const SitemapNode = memo(SitemapNodeComponent);
