"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  IndustrialAsset, 
  AssetCategory, 
  AssetLocation, 
  AssetStatus 
} from "../types/assets.types";
import { 
  Activity, 
  MapPin, 
  FileText, 
  Settings2, 
  Package, 
  Calendar, 
  Building2, 
  Download, 
  CheckCircle2, 
  Wrench, 
  PauseCircle, 
  AlertTriangle 
} from "lucide-react";

interface AssetDetailModalProps {
  asset: IndustrialAsset | null;
  isOpen: boolean;
  onClose: () => void;
  categories: AssetCategory[];
  locations: AssetLocation[];
  onStatusChange: (asset: IndustrialAsset, status: AssetStatus) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  isOpen,
  onClose,
  categories,
  locations,
  onStatusChange,
}) => {
  const [activeTab, setActiveTab] = useState<string>("overview");

  if (!asset) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-6 border-b border-border/80 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="font-mono text-base font-bold px-2.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {asset.tag_number}
                </span>
                {getStatusBadge(asset.status)}
                <Badge variant="outline" className="text-xs">
                  {asset.criticality === "CRITICAL" ? "بحرانی" : asset.criticality === "HIGH" ? "اهمیت بالا" : "عادی"}
                </Badge>
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {asset.name_fa}
              </DialogTitle>
              {asset.name_en && (
                <p className="text-xs text-muted-foreground font-mono mt-0.5 dir-ltr text-right">
                  {asset.name_en}
                </p>
              )}
            </div>

            {/* Quick Status Control for Factory Workers */}
            <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg p-1">
              <Button
                variant={asset.status === "OPERATIONAL" ? "default" : "ghost"}
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => onStatusChange(asset, "OPERATIONAL")}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                روشن
              </Button>
              <Button
                variant={asset.status === "STANDBY" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => onStatusChange(asset, "STANDBY")}
              >
                <PauseCircle className="w-3.5 h-3.5" />
                استندبای
              </Button>
              <Button
                variant={asset.status === "UNDER_MAINTENANCE" ? "destructive" : "ghost"}
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => onStatusChange(asset, "UNDER_MAINTENANCE")}
              >
                <Wrench className="w-3.5 h-3.5" />
                تعمیرات
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview" className="text-xs sm:text-sm gap-1.5">
                <Activity className="w-4 h-4" />
                شناسنامه کلی
              </TabsTrigger>
              <TabsTrigger value="specs" className="text-xs sm:text-sm gap-1.5">
                <Settings2 className="w-4 h-4" />
                مشخصات فنی
              </TabsTrigger>
              <TabsTrigger value="documents" className="text-xs sm:text-sm gap-1.5">
                <FileText className="w-4 h-4" />
                اسناد و نقشه‌ها ({asset.documents?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="spares" className="text-xs sm:text-sm gap-1.5">
                <Package className="w-4 h-4" />
                قطعات یدکی ({asset.spare_parts?.length || 0})
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Overview */}
            <TabsContent value="overview" className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg border border-border/80 bg-card/50 space-y-2">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    موقعیت استقرار فیزیکی
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {location?.name_fa || "تعیین نشده"}
                  </div>
                  {location?.description && (
                    <div className="text-xs text-muted-foreground">
                      {location.description}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-lg border border-border/80 bg-card/50 space-y-2">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-primary" />
                    سازنده و مدل دستگاه
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {asset.manufacturer || "نامشخص"} {asset.model_number ? `- ${asset.model_number}` : ""}
                  </div>
                  {asset.serial_number && (
                    <div className="text-xs text-muted-foreground font-mono">
                      شماره سریال: {asset.serial_number}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-lg border border-border/80 bg-card/50 space-y-2">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" />
                    تاریخچه و زمان‌بندی
                  </div>
                  <div className="text-sm text-foreground space-y-1">
                    <div>سال ساخت: <span className="font-mono font-medium">{asset.year_built || "—"}</span></div>
                    <div>تاریخ نصب: <span className="font-mono font-medium">{asset.installation_date || "—"}</span></div>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-border/80 bg-card/50 space-y-2">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-primary" />
                    دسته‌بندی تجهیزات
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {category?.name_fa || "عمومی"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    کد رده: <span className="font-mono">{category?.code || "—"}</span>
                  </div>
                </div>
              </div>

              {asset.description && (
                <div className="p-4 rounded-lg border border-border/80 bg-muted/10 space-y-1.5">
                  <div className="text-xs font-semibold text-foreground">توضیحات و یادداشت فنی:</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {asset.description}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Tab 2: Technical Specifications */}
            <TabsContent value="specs" className="space-y-4 animate-in fade-in duration-150">
              {Object.keys(asset.specifications || {}).length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg">
                  هیچ مشخصه فنی برای این تجهیز ثبت نشده است.
                </div>
              ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-xs font-medium text-muted-foreground border-b border-border">
                      <tr>
                        <th className="py-2.5 px-4 text-right">عنوان پارامتر</th>
                        <th className="py-2.5 px-4 text-right">مقدار</th>
                        <th className="py-2.5 px-4 text-right">واحد اندازه‌گیری</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {category?.parameter_templates.map((tpl) => {
                        const val = asset.specifications[tpl.key];
                        if (val === undefined || val === null || val === "") return null;
                        return (
                          <tr key={tpl.key} className="hover:bg-muted/20">
                            <td className="py-2.5 px-4 font-medium text-foreground">
                              {tpl.name_fa}
                              {tpl.name_en && (
                                <span className="text-xs text-muted-foreground font-mono block">
                                  {tpl.name_en}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-4 font-mono font-semibold text-foreground dir-ltr text-right">
                              {String(val)}
                            </td>
                            <td className="py-2.5 px-4 font-mono text-xs text-muted-foreground">
                              {tpl.unit || "—"}
                            </td>
                          </tr>
                        );
                      })}
                      {/* Any custom specs not in template */}
                      {Object.entries(asset.specifications).map(([k, v]) => {
                        const isTemplated = category?.parameter_templates.some((t) => t.key === k);
                        if (isTemplated) return null;
                        return (
                          <tr key={k} className="hover:bg-muted/20">
                            <td className="py-2.5 px-4 font-medium text-foreground font-mono">{k}</td>
                            <td className="py-2.5 px-4 font-mono font-semibold text-foreground dir-ltr text-right">
                              {String(v)}
                            </td>
                            <td className="py-2.5 px-4 text-xs text-muted-foreground">—</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* Tab 3: Documents */}
            <TabsContent value="documents" className="space-y-3 animate-in fade-in duration-150">
              {(!asset.documents || asset.documents.length === 0) ? (
                <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg">
                  هیچ سند فنی، نقشه P&ID یا راهنمایی بارگذاری نشده است.
                </div>
              ) : (
                <div className="space-y-2">
                  {asset.documents.map((doc) => (
                    <div 
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-card/60 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded bg-primary/10 text-primary shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground truncate">{doc.title}</div>
                          <div className="text-xs text-muted-foreground font-mono truncate">{doc.file_name}</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1.5 shrink-0" asChild>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-3.5 h-3.5" />
                          دانلود سند
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab 4: Spare Parts (ESP Warehouse Contract) */}
            <TabsContent value="spares" className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground flex items-center gap-2">
                <Package className="w-4 h-4 text-primary shrink-0" />
                <span>
                  این قطعات یدکی با سیستم انبار ESP Warehouse متصل بوده و وضعیت موجودی به صورت مرجع نمایش داده می‌شود.
                </span>
              </div>

              {(!asset.spare_parts || asset.spare_parts.length === 0) ? (
                <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg">
                  هیچ قطعه یدکی مرتبطی برای این تجهیز تعریف نشده است.
                </div>
              ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-xs font-medium text-muted-foreground border-b border-border">
                      <tr>
                        <th className="py-2.5 px-4 text-right">کد قطعه</th>
                        <th className="py-2.5 px-4 text-right">شرح قطعه یدکی</th>
                        <th className="py-2.5 px-4 text-right">حداقل نیاز</th>
                        <th className="py-2.5 px-4 text-right">موجودی انبار</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {asset.spare_parts.map((part, idx) => (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="py-2.5 px-4 font-mono text-xs font-bold text-primary">
                            {part.part_code}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="font-medium text-foreground">{part.description_fa}</div>
                            {part.description_en && (
                              <div className="text-xs text-muted-foreground font-mono">{part.description_en}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-xs text-foreground text-center">
                            {part.minimum_stock}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <Badge 
                              variant={part.current_stock_ref >= part.minimum_stock ? "secondary" : "destructive"}
                              className="font-mono text-xs"
                            >
                              {part.current_stock_ref} عدد
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="p-4 border-t border-border/80 bg-muted/10 flex justify-end">
          <Button variant="outline" onClick={onClose} className="px-5">
            بستن
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
