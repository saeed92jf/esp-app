"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IndustrialAsset, AssetCategory, AssetLocation, AssetStatus } from "../types/assets.types";
import { 
  Activity, 
  MapPin, 
  FileText, 
  Layers, 
  MoreVertical, 
  CheckCircle2, 
  PauseCircle, 
  Wrench, 
  AlertTriangle 
} from "lucide-react";

interface AssetCardProps {
  asset: IndustrialAsset;
  categories: AssetCategory[];
  locations: AssetLocation[];
  onSelect: (asset: IndustrialAsset) => void;
  onEdit: (asset: IndustrialAsset) => void;
  onStatusChange: (asset: IndustrialAsset, status: AssetStatus) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  categories,
  locations,
  onSelect,
  onEdit,
  onStatusChange,
}) => {
  const category = categories.find((c) => c.id === asset.category_id);
  const location = locations.find((l) => l.id === asset.location_id);

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case "OPERATIONAL":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            در حال کار
          </Badge>
        );
      case "STANDBY":
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1.5 font-medium">
            <PauseCircle className="w-3.5 h-3.5" />
            آماده‌به‌کار
          </Badge>
        );
      case "UNDER_MAINTENANCE":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1.5 font-medium">
            <Wrench className="w-3.5 h-3.5" />
            تعمیرات / سرویس
          </Badge>
        );
      case "OUT_OF_SERVICE":
      default:
        return (
          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 gap-1.5 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            خارج از سرویس
          </Badge>
        );
    }
  };

  const getCriticalityBadge = (crit: string) => {
    switch (crit) {
      case "CRITICAL":
        return <Badge variant="outline" className="border-rose-500/40 text-rose-600 dark:text-rose-400 text-xs">بحرانی</Badge>;
      case "HIGH":
        return <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs">اهمیت بالا</Badge>;
      default:
        return <Badge variant="outline" className="border-slate-300 dark:border-slate-700 text-muted-foreground text-xs">عادی</Badge>;
    }
  };

  return (
    <Card 
      onClick={() => onSelect(asset)}
      className="cursor-pointer border border-border/80 hover:border-primary/50 transition-all duration-150 hover:shadow-md bg-card/60 backdrop-blur-sm group relative overflow-hidden"
    >
      <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full gap-4">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-sm font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                {asset.tag_number}
              </span>
              {getStatusBadge(asset.status)}
              {getCriticalityBadge(asset.criticality)}
            </div>
            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {asset.name_fa}
            </h3>
            {asset.name_en && (
              <p className="text-xs text-muted-foreground font-mono truncate dir-ltr text-right">
                {asset.name_en}
              </p>
            )}
          </div>

          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 text-sm font-normal">
                <DropdownMenuItem onClick={() => onSelect(asset)}>
                  <Activity className="w-4 h-4 ml-2" />
                  مشاهده شناسنامه
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(asset)}>
                  <Wrench className="w-4 h-4 ml-2" />
                  ویرایش مشخصات
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(asset, "OPERATIONAL")}>
                  <CheckCircle2 className="w-4 h-4 ml-2 text-emerald-600" />
                  تنظیم به در حال کار
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(asset, "UNDER_MAINTENANCE")}>
                  <Wrench className="w-4 h-4 ml-2 text-amber-600" />
                  اعزام به تعمیرات
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(asset, "STANDBY")}>
                  <PauseCircle className="w-4 h-4 ml-2 text-blue-600" />
                  قرار دادن در استندبای
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Location & Metadata info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-2 border-t border-border/60">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-primary/70" />
            <span className="truncate">{location?.name_fa || "محل نامشخص"}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Layers className="w-3.5 h-3.5 shrink-0 text-primary/70" />
            <span className="truncate">{category?.name_fa || "دسته‌بندی نشده"}</span>
          </div>
        </div>

        {/* Bottom Technical Indicators & Action */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-3 text-muted-foreground">
            {asset.serial_number && (
              <span className="font-mono text-[11px] truncate max-w-[120px]">
                SN: {asset.serial_number}
              </span>
            )}
            {asset.documents?.length > 0 && (
              <span className="flex items-center gap-1 text-primary/80">
                <FileText className="w-3.5 h-3.5" />
                {asset.documents.length} سند
              </span>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs font-medium text-primary hover:text-primary hover:bg-primary/10 px-2"
          >
            مشاهده جزئیات
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
