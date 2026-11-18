"use client";

import React, { useState, useEffect } from "react";
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
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

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
  const [spareParts, setSpareParts] = useState<Array<{
    part_code: string;
    description_fa: string;
    minimum_stock: number;
    current_stock_ref: number;
  }>>([]);

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
      setSpareParts(asset.spare_parts || []);
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
      setSpareParts([]);
      setShowAdvanced(false);
    }
    setErrorMsg(null);
  }, [asset, categories, locations, isOpen]);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagNumber.trim() || !nameFa.trim() || !categoryId || !locationId) {
      setErrorMsg("لطفاً تگ تجهیز، نام فارسی، دسته‌بندی و موقعیت مکانی را وارد کنید.");
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
        spare_parts: spareParts,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "خطا در ذخیره تجهیز");
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

  const addSparePart = () => {
    setSpareParts((prev) => [
      ...prev,
      { part_code: "", description_fa: "", minimum_stock: 1, current_stock_ref: 0 },
    ]);
  };

  const updateSparePart = (idx: number, field: string, val: any) => {
    setSpareParts((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const removeSparePart = (idx: number) => {
    setSpareParts((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-5 border-b border-border bg-muted/20">
          <DialogTitle className="text-base font-bold text-foreground">
            {asset ? "ویرایش شناسنامه تجهیز" : "ثبت تجهیز و ماشین‌آلات صنعتی جدید"}
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            فیلدهای اصلی برای پرسنل و کارگران، مشخصات تفصیلی در بخش اطلاعات فنی پیشرفته
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
                  تگ یا شناسه فنی تجهیز (Tag No) *
                </label>
                <Input
                  required
                  placeholder="مثال: P-101A یا CMP-202"
                  value={tagNumber}
                  onChange={(e) => setTagNumber(e.target.value)}
                  className="font-mono text-sm uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  نام فارسی تجهیز *
                </label>
                <Input
                  required
                  placeholder="مثال: پمپ تغذیه بویلر شماره یک"
                  value={nameFa}
                  onChange={(e) => setNameFa(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  دسته‌بندی تجهیز *
                </label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="انتخاب دسته‌بندی" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name_fa} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  محل فیزیکی و سالن استقرار *
                </label>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="انتخاب موقعیت مکانی" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name_fa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  وضعیت کارکرد فعلی
                </label>
                <Select value={status} onValueChange={(v) => setStatus(v as AssetStatus)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPERATIONAL">در حال کار (Operational)</SelectItem>
                    <SelectItem value="STANDBY">آماده‌به‌کار (Standby)</SelectItem>
                    <SelectItem value="UNDER_MAINTENANCE">تعمیرات و سرویس (Under Maintenance)</SelectItem>
                    <SelectItem value="OUT_OF_SERVICE">خارج از مدار (Out of Service)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  سطح حساسیت و اهمیت خط
                </label>
                <Select value={criticality} onValueChange={(v) => setCriticality(v as AssetCriticality)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">پایین (Low)</SelectItem>
                    <SelectItem value="MEDIUM">متوسط (Medium)</SelectItem>
                    <SelectItem value="HIGH">بالا (High)</SelectItem>
                    <SelectItem value="CRITICAL">بحرانی (Critical)</SelectItem>
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
                <span>مشخصات پیشرفته، سازنده، کاتالوگ و قطعات یدکی</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
              </Button>
            </div>

            {/* Advanced Section */}
            {showAdvanced && (
              <div className="space-y-4 pt-2 border-t border-border animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">نام انگلیسی (En)</label>
                    <Input
                      placeholder="Feed Pump A"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">سازنده (Manufacturer)</label>
                    <Input
                      placeholder="Sulzer, KSB, ..."
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">مدل دستگاه</label>
                    <Input
                      placeholder="ZE-80-315"
                      value={modelNumber}
                      onChange={(e) => setModelNumber(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">شماره سریال سازنده</label>
                    <Input
                      placeholder="SN-123456"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">سال ساخت</label>
                    <Input
                      type="number"
                      placeholder="2023"
                      value={yearBuilt || ""}
                      onChange={(e) => setYearBuilt(e.target.value ? Number(e.target.value) : undefined)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">تاریخ نصب و راه‌اندازی</label>
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
                      پارامترهای فنی اختصاصی ({selectedCategory.name_fa})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedCategory.parameter_templates.map((tpl) => (
                        <div key={tpl.key}>
                          <label className="text-xs text-muted-foreground mb-1 flex items-center justify-between">
                            <span>{tpl.name_fa}</span>
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

                {/* Spare Parts Linking (ESP Warehouse Integration) */}
                <div className="p-3.5 rounded-lg border border-border/80 bg-muted/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-foreground">
                      قطعات یدکی مصرفی (اتصال با انبار)
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSparePart}
                      className="h-7 text-xs gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      افزودن قطعه یدکی
                    </Button>
                  </div>

                  {spareParts.length === 0 ? (
                    <div className="text-xs text-muted-foreground py-2 text-center">
                      هیچ قطعه یدکی ثبت نشده است.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {spareParts.map((sp, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            placeholder="کد قطعه (مثال: SP-SEAL-80)"
                            value={sp.part_code}
                            onChange={(e) => updateSparePart(idx, "part_code", e.target.value)}
                            className="w-1/3 font-mono text-xs"
                          />
                          <Input
                            placeholder="شرح قطعه یدکی"
                            value={sp.description_fa}
                            onChange={(e) => updateSparePart(idx, "description_fa", e.target.value)}
                            className="flex-1 text-xs"
                          />
                          <Input
                            type="number"
                            placeholder="حداقل نیاز"
                            value={sp.minimum_stock}
                            onChange={(e) => updateSparePart(idx, "minimum_stock", Number(e.target.value))}
                            className="w-20 font-mono text-xs"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSparePart(idx)}
                            className="h-8 w-8 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">توضیحات و دستورالعمل‌های خاص</label>
                  <Input
                    placeholder="نکات نگهداری یا شرایط محیطی خاص..."
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
              انصراف
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "در حال ذخیره..." : asset ? "ذخیره تغییرات" : "ثبت تجهیز"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
