// src/modules/warehouse/components/WarehouseStockEntryModal.tsx
"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Package } from "lucide-react";
import { WarehouseItem } from "../types/warehouse.types";

interface WarehouseStockEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: WarehouseItem) => void;
}

export function WarehouseStockEntryModal({
  isOpen,
  onClose,
  onSave,
}: WarehouseStockEntryModalProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const t = useTranslations("Warehouse");

  const [sku, setSku] = useState("");
  const [nameFa, setNameFa] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [categoryFa, setCategoryFa] = useState("مواد اولیه و مش وایر");
  const [categoryEn, setCategoryEn] = useState("Raw Materials & Wire");
  const [location, setLocation] = useState("بخش A - قفسه ۱");
  const [quantity, setQuantity] = useState("10");
  const [unitFa, setUnitFa] = useState("عدد");
  const [unitEn, setUnitEn] = useState("pcs");
  const [minLevel, setMinLevel] = useState("5");
  const [materialGrade, setMaterialGrade] = useState("SS 316L");
  const [notesFa, setNotesFa] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || (!nameFa.trim() && !nameEn.trim())) return;

    const qty = parseFloat(quantity) || 0;
    const min = parseFloat(minLevel) || 0;

    const newItem: WarehouseItem = {
      id: `wh-${Date.now()}`,
      sku: sku.trim().toUpperCase(),
      nameFa: nameFa.trim() || nameEn.trim(),
      nameEn: nameEn.trim() || nameFa.trim(),
      categoryFa,
      categoryEn,
      location: location.trim(),
      quantity: qty,
      unitFa,
      unitEn,
      minLevel: min,
      status: qty <= 0 ? "critical" : qty <= min ? "low_stock" : "in_stock",
      lastUpdated: isRtl ? "۱۴۰۳/۰۸/۲۸" : "2024-11-18",
      materialGrade: materialGrade.trim(),
      weightKg: qty * 1.5,
      lotNumber: `LOT-${Date.now().toString().slice(-4)}`,
      notesFa: notesFa.trim(),
      notesEn: notesFa.trim(),
    };

    onSave(newItem);
    onClose();
    // Reset form
    setSku("");
    setNameFa("");
    setNameEn("");
    setNotesFa("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border border-border/80 shadow-2xl bg-card">
        <form onSubmit={handleSubmit}>
          <div className="bg-muted/40 p-5 sm:p-6 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Plus className="size-5 stroke-[2.5]" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                  {t("dialogs.stockEntryTitle")}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-sans">
                  {isRtl
                    ? "ورود اطلاعات قطعه، کد انبار، مشخصات فنی و اختصاص قفسه استقرار"
                    : "Add new part SKU, technical specs and warehouse storage bin"}
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-4 max-h-[65vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {t("dialogs.skuLabel")} *
                </Label>
                <Input
                  required
                  placeholder="SKU-WW-316L-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="h-9 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {isRtl ? "آلیاژ / متریال" : "Material Grade"}
                </Label>
                <Input
                  placeholder="SS 316L / Inconel 625"
                  value={materialGrade}
                  onChange={(e) => setMaterialGrade(e.target.value)}
                  className="h-9 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {t("dialogs.titleFaLabel")} *
                </Label>
                <Input
                  required
                  placeholder="سیم وِج‌وایر استنلس استیل..."
                  value={nameFa}
                  onChange={(e) => setNameFa(e.target.value)}
                  className="h-9 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {t("dialogs.titleEnLabel")}
                </Label>
                <Input
                  placeholder="Stainless Steel Wedge Wire..."
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="h-9 rounded-xl text-xs font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {t("dialogs.categoryLabel")}
                </Label>
                <Input
                  value={isRtl ? categoryFa : categoryEn}
                  onChange={(e) => {
                    setCategoryFa(e.target.value);
                    setCategoryEn(e.target.value);
                  }}
                  className="h-9 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {t("dialogs.locationLabel")}
                </Label>
                <Input
                  placeholder="بخش A - قفسه ۱۲"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-9 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {t("dialogs.quantityLabel")} *
                </Label>
                <Input
                  required
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="h-9 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {t("dialogs.unitLabel")}
                </Label>
                <Input
                  value={isRtl ? unitFa : unitEn}
                  onChange={(e) => {
                    setUnitFa(e.target.value);
                    setUnitEn(e.target.value);
                  }}
                  className="h-9 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  {t("dialogs.minLevelLabel")}
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={minLevel}
                  onChange={(e) => setMinLevel(e.target.value)}
                  className="h-9 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {t("dialogs.notesLabel")}
              </Label>
              <Textarea
                rows={2}
                placeholder={isRtl ? "شرایط انبارداری، بازرسی و تایید کیفی..." : "Storage conditions, inspection notes..."}
                value={notesFa}
                onChange={(e) => setNotesFa(e.target.value)}
                className="rounded-xl text-xs resize-none"
              />
            </div>
          </div>

          <DialogFooter className="p-4 sm:p-5 bg-muted/30 border-t border-border/60 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl px-4 text-xs font-semibold cursor-pointer"
            >
              {t("actions.cancel")}
            </Button>
            <Button
              type="submit"
              className="rounded-xl px-5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer gap-1.5"
            >
              <Plus className="size-4" />
              <span>{t("actions.save")}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
