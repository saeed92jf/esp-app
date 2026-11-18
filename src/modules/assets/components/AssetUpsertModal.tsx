"use client";

import React, { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  IndustrialAsset, 
  AssetCategory, 
  AssetLocation, 
  AssetStatus, 
  AssetCriticality 
} from "../types/assets.types";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AssetUpsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<IndustrialAsset>) => Promise<void>;
  asset?: IndustrialAsset | null;
  categories: AssetCategory[];
  locations: AssetLocation[];
}

export const AssetUpsertModal: React.FC<AssetUpsertModalProps> = ({
  isOpen,
  onClose,
  onSave,
  asset,
  categories,
  locations,
}) => {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const t = useTranslations("Assets");

  const [tagNumber, setTagNumber] = useState("");
  const [nameFa, setNameFa] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [status, setStatus] = useState<AssetStatus>("OPERATIONAL");
  const [criticality, setCriticality] = useState<AssetCriticality>("MEDIUM");
  
  // Advanced Fields (Progressive Disclosure)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [manufacturer, setManufacturer] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [yearBuilt, setYearBuilt] = useState<number | undefined>(undefined);
  const [installationDate, setInstallationDate] = useState("");
  const [description, setDescription] = useState("");
  const [specifications, setSpecifications] = useState<Record<string, any>>({});

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (asset) {
      setTagNumber(asset.tag_number || "");
      setNameFa(asset.name_fa || "");
      setNameEn(asset.name_en || "");
      setCategoryId(asset.category_id || "");
      setLocationId(asset.location_id || "");
      setStatus(asset.status || "OPERATIONAL");
      setCriticality(asset.criticality || "MEDIUM");
      setManufacturer(asset.manufacturer || "");
      setModelNumber(asset.model_number || "");
      setSerialNumber(asset.serial_number || "");
      setYearBuilt(asset.year_built);
      setInstallationDate(asset.installation_date || "");
      setDescription(asset.description || "");
      setSpecifications(asset.specifications || {});
      setShowAdvanced(true);
    } else {
      setTagNumber("");
      setNameFa("");
      setNameEn("");
      setCategoryId(categories[0]?.id || "");
      setLocationId(locations[0]?.id || "");
      setStatus("OPERATIONAL");
      setCriticality("MEDIUM");
      setManufacturer("");
      setModelNumber("");
      setSerialNumber("");
      setYearBuilt(new Date().getFullYear());
      setInstallationDate(new Date().toISOString().split("T")[0]);
      setDescription("");
      setSpecifications({});
      setShowAdvanced(false);
    }
    setErrorMsg(null);
  }, [asset, categories, locations, isOpen]);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagNumber.trim() || !nameFa.trim() || !categoryId || !locationId) {
      setErrorMsg(t("form.validationError"));
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);
      await onSave({
        tag_number: tagNumber.trim().toUpperCase(),
        name_fa: nameFa.trim(),
        name_en: nameEn.trim() || undefined,
        category_id: categoryId,
        location_id: locationId,
        status,
        criticality,
        manufacturer: manufacturer.trim() || undefined,
        model_number: modelNumber.trim() || undefined,
        serial_number: serialNumber.trim() || undefined,
        year_built: yearBuilt ? Number(yearBuilt) : undefined,
        installation_date: installationDate || undefined,
        description: description.trim() || undefined,
        specifications,
        spare_parts: [],
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Error saving asset");
    } finally {
      setSaving(false);
    }
  };

  const handleSpecChange = (key: string, val: any) => {
    setSpecifications((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-5 border-b border-border bg-muted/20">
          <DialogTitle className="text-base font-bold text-foreground">
            {asset ? t("form.editTitle") : t("form.createTitle")}
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("form.subtitle")}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            {errorMsg && (
              <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-md">
                {errorMsg}
              </div>
            )}

            {/* Primary Fields (Factory Worker First) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  {t("form.tagNumber")}
                </label>
                <Input
                  required
                  placeholder={t("form.tagPlaceholder")}
                  value={tagNumber}
                  onChange={(e) => setTagNumber(e.target.value)}
                  className="font-mono text-sm uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  {t("form.nameFa")}
                </label>
                <Input
                  required
                  placeholder={t("nameFa")}
                  value={nameFa}
                  onChange={(e) => setNameFa(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  {t("form.category")}
                </label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("category")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {isRtl ? c.name_fa : (c.name_en || c.name_fa)} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  {t("form.location")}
                </label>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("location")} />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {isRtl ? l.name_fa : (l.name_en || l.name_fa)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  {t("form.status")}
                </label>
                <Select value={status} onValueChange={(v) => setStatus(v as AssetStatus)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPERATIONAL">{t("status.operational")}</SelectItem>
                    <SelectItem value="STANDBY">{t("status.standby")}</SelectItem>
                    <SelectItem value="UNDER_MAINTENANCE">{t("status.underMaintenance")}</SelectItem>
                    <SelectItem value="OUT_OF_SERVICE">{t("status.outOfService")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  {t("form.criticality")}
                </label>
                <Select value={criticality} onValueChange={(v) => setCriticality(v as AssetCriticality)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">{t("criticality.low")}</SelectItem>
                    <SelectItem value="MEDIUM">{t("criticality.medium")}</SelectItem>
                    <SelectItem value="HIGH">{t("criticality.high")}</SelectItem>
                    <SelectItem value="CRITICAL">{t("criticality.critical")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Progressive Disclosure Toggle */}
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full justify-between text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <span>{t("form.advancedToggle")}</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
              </Button>
            </div>

            {/* Advanced Section */}
            {showAdvanced && (
              <div className="space-y-4 pt-2 border-t border-border animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t("form.nameEn")}</label>
                    <Input
                      placeholder="e.g. Centrifugal Pump A"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t("form.manufacturer")}</label>
                    <Input
                      placeholder="Sulzer, Atlas Copco, ..."
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t("form.model")}</label>
                    <Input
                      placeholder="ZE-80-315"
                      value={modelNumber}
                      onChange={(e) => setModelNumber(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t("form.serial")}</label>
                    <Input
                      placeholder="SN-123456"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t("form.year")}</label>
                    <Input
                      type="number"
                      placeholder="2024"
                      value={yearBuilt || ""}
                      onChange={(e) => setYearBuilt(e.target.value ? Number(e.target.value) : undefined)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t("form.installDate")}</label>
                    <Input
                      type="date"
                      value={installationDate}
                      onChange={(e) => setInstallationDate(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Dynamic Specifications according to Category Parameter Templates */}
                {selectedCategory && selectedCategory.parameter_templates.length > 0 && (
                  <div className="p-3.5 rounded-lg border border-border/80 bg-muted/10 space-y-3">
                    <div className="text-xs font-semibold text-foreground">
                      {t("form.categorySpecs")} ({isRtl ? selectedCategory.name_fa : (selectedCategory.name_en || selectedCategory.name_fa)})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedCategory.parameter_templates.map((tpl) => (
                        <div key={tpl.key}>
                          <label className="text-xs text-muted-foreground mb-1 flex items-center justify-between">
                            <span>{isRtl ? tpl.name_fa : (tpl.name_en || tpl.name_fa)}</span>
                            {tpl.unit && <span className="font-mono text-[10px]">({tpl.unit})</span>}
                          </label>
                          <Input
                            type={tpl.type === "number" ? "number" : "text"}
                            value={specifications[tpl.key] ?? ""}
                            onChange={(e) => handleSpecChange(tpl.key, e.target.value)}
                            className="font-mono text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">{t("form.desc")}</label>
                  <Input
                    placeholder="Notes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-4 border-t border-border bg-muted/20 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              {t("actions.cancel")}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t("form.saving") : asset ? t("actions.save") : t("actions.addNew")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
