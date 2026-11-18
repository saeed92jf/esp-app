"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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
  const locale = useLocale();
  const isRtl = locale === "fa";
  const t = useTranslations("Assets");

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
            {t("status.operational")}
          </Badge>
        );
      case "STANDBY":
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1.5 font-medium">
            <PauseCircle className="w-3.5 h-3.5" />
            {t("status.standby")}
          </Badge>
        );
      case "UNDER_MAINTENANCE":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1.5 font-medium">
            <Wrench className="w-3.5 h-3.5" />
            {t("status.underMaintenance")}
          </Badge>
        );
      case "OUT_OF_SERVICE":
      default:
        return (
          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 gap-1.5 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t("status.outOfService")}
          </Badge>
        );
    }
  };

  const categoryName = isRtl ? category?.name_fa : (category?.name_en || category?.name_fa);
  const locationName = isRtl ? location?.name_fa : (location?.name_en || location?.name_fa);
  const assetDisplayName = isRtl ? asset.name_fa : (asset.name_en || asset.name_fa);

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
                  {asset.criticality === "CRITICAL" ? t("criticality.critical") : asset.criticality === "HIGH" ? t("criticality.high") : t("criticality.medium")}
                </Badge>
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {assetDisplayName}
              </DialogTitle>
              {asset.name_en && isRtl && (
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
                {t("status.quickRunning")}
              </Button>
              <Button
                variant={asset.status === "STANDBY" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => onStatusChange(asset, "STANDBY")}
              >
                <PauseCircle className="w-3.5 h-3.5" />
                {t("status.quickStandby")}
              </Button>
              <Button
                variant={asset.status === "UNDER_MAINTENANCE" ? "destructive" : "ghost"}
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => onStatusChange(asset, "UNDER_MAINTENANCE")}
              >
                <Wrench className="w-3.5 h-3.5" />
                {t("status.quickMaintenance")}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview" className="text-xs sm:text-sm gap-1.5">
                <Activity className="w-4 h-4" />
                {t("modal.overview")}
              </TabsTrigger>
              <TabsTrigger value="specs" className="text-xs sm:text-sm gap-1.5">
                <Settings2 className="w-4 h-4" />
                {t("modal.specs")}
              </TabsTrigger>
              <TabsTrigger value="documents" className="text-xs sm:text-sm gap-1.5">
                <FileText className="w-4 h-4" />
                {t("modal.docs")} ({asset.documents?.length || 0})
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Overview */}
            <TabsContent value="overview" className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg border border-border/80 bg-card/50 space-y-2">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    {t("modal.location")}
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {locationName || "—"}
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
                    {t("modal.manufacturer")}
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {asset.manufacturer || "—"} {asset.model_number ? `- ${asset.model_number}` : ""}
                  </div>
                  {asset.serial_number && (
                    <div className="text-xs text-muted-foreground font-mono">
                      SN: {asset.serial_number}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-lg border border-border/80 bg-card/50 space-y-2">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" />
                    {t("modal.history")}
                  </div>
                  <div className="text-sm text-foreground space-y-1">
                    <div>{t("modal.yearBuilt")}: <span className="font-mono font-medium">{asset.year_built || "—"}</span></div>
                    <div>{t("modal.installationDate")}: <span className="font-mono font-medium">{asset.installation_date || "—"}</span></div>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-border/80 bg-card/50 space-y-2">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-primary" />
                    {t("modal.category")}
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {categoryName || "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-mono">{category?.code || "—"}</span>
                  </div>
                </div>
              </div>

              {asset.description && (
                <div className="p-4 rounded-lg border border-border/80 bg-muted/10 space-y-1.5">
                  <div className="text-xs font-semibold text-foreground">{t("modal.notes")}:</div>
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
                  {t("empty.noSpecs")}
                </div>
              ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-xs font-medium text-muted-foreground border-b border-border">
                      <tr>
                        <th className="py-2.5 px-4 text-start">{t("modal.paramTitle")}</th>
                        <th className="py-2.5 px-4 text-start">{t("modal.paramValue")}</th>
                        <th className="py-2.5 px-4 text-start">{t("modal.paramUnit")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {category?.parameter_templates.map((tpl) => {
                        const val = asset.specifications[tpl.key];
                        if (val === undefined || val === null || val === "") return null;
                        const paramLabel = isRtl ? tpl.name_fa : (tpl.name_en || tpl.name_fa);
                        return (
                          <tr key={tpl.key} className="hover:bg-muted/20">
                            <td className="py-2.5 px-4 font-medium text-foreground">
                              {paramLabel}
                            </td>
                            <td className="py-2.5 px-4 font-mono font-semibold text-foreground dir-ltr text-start">
                              {String(val)}
                            </td>
                            <td className="py-2.5 px-4 font-mono text-xs text-muted-foreground">
                              {tpl.unit || "—"}
                            </td>
                          </tr>
                        );
                      })}
                      {Object.entries(asset.specifications).map(([k, v]) => {
                        const isTemplated = category?.parameter_templates.some((t) => t.key === k);
                        if (isTemplated) return null;
                        return (
                          <tr key={k} className="hover:bg-muted/20">
                            <td className="py-2.5 px-4 font-medium text-foreground font-mono">{k}</td>
                            <td className="py-2.5 px-4 font-mono font-semibold text-foreground dir-ltr text-start">
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
                  {t("empty.noDocs")}
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
                          {t("actions.download")}
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="p-4 border-t border-border/80 bg-muted/10 flex justify-end">
          <Button variant="outline" onClick={onClose} className="px-5">
            {t("actions.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
