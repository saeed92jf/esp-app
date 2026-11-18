"use client";

import React, { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { AssetCategory, ParameterTemplate } from "../types/assets.types";
import { AssetsService } from "../services/assets.service";
import { Layers, Plus, Trash2, Sliders } from "lucide-react";

export const AssetCategoriesView: React.FC = () => {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const t = useTranslations("Assets.categoriesView");

  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);

  // Modal State for adding new Category
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCatNameFa, setNewCatNameFa] = useState("");
  const [newCatNameEn, setNewCatNameEn] = useState("");
  const [newCatCode, setNewCatCode] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newTemplates, setNewTemplates] = useState<ParameterTemplate[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await AssetsService.getCategories();
      setCategories(data);
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addTemplateRow = () => {
    setNewTemplates((prev) => [
      ...prev,
      {
        key: `param_${Date.now()}`,
        name_fa: "",
        name_en: "",
        unit: "",
        type: "number",
      },
    ]);
  };

  const updateTemplateRow = (idx: number, field: string, val: any) => {
    setNewTemplates((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const removeTemplateRow = (idx: number) => {
    setNewTemplates((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveCategory = () => {
    if (!newCatNameFa.trim() || !newCatCode.trim()) return;

    const newCat: AssetCategory = {
      id: `cat-${newCatCode.toLowerCase().trim()}`,
      name_fa: newCatNameFa.trim(),
      name_en: newCatNameEn.trim(),
      code: newCatCode.trim().toUpperCase(),
      parent_id: null,
      description: newCatDesc.trim(),
      parameter_templates: newTemplates.filter((tm) => tm.name_fa.trim() !== "" || tm.name_en.trim() !== ""),
    };

    setCategories((prev) => [...prev, newCat]);
    setSelectedCategory(newCat);
    setIsAddOpen(false);
    setNewCatNameFa("");
    setNewCatNameEn("");
    setNewCatCode("");
    setNewCatDesc("");
    setNewTemplates([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-card/40 backdrop-blur-sm">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            {t("title")}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("subtitle")}
          </p>
        </div>

        <Button size="sm" onClick={() => setIsAddOpen(true)} className="gap-1.5 text-xs font-semibold">
          <Plus className="w-4 h-4" />
          {t("addNew")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Categories List */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            {t("registered")} ({categories.length})
          </div>

          <div className="space-y-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory?.id === cat.id;
              const catTitle = isRtl ? cat.name_fa : (cat.name_en || cat.name_fa);
              return (
                <Card
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`cursor-pointer transition-all duration-150 border ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/80 hover:border-primary/40 bg-card/60"
                  }`}
                >
                  <CardContent className="p-3.5 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-muted text-foreground">
                          {cat.code}
                        </span>
                        <div className="text-sm font-semibold text-foreground truncate">{catTitle}</div>
                      </div>
                      {cat.name_en && isRtl && (
                        <div className="text-xs text-muted-foreground font-mono truncate mt-0.5 dir-ltr text-right">
                          {cat.name_en}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0 font-mono">
                      {cat.parameter_templates?.length || 0} {t("paramCount")}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Selected Category Details & Parameters */}
        <div className="md:col-span-2">
          {selectedCategory ? (
            <Card className="border border-border/80 bg-card/60 backdrop-blur-sm">
              <CardContent className="p-5 space-y-5">
                <div className="flex items-start justify-between border-b border-border/60 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="font-mono text-xs">{selectedCategory.code}</Badge>
                      <h3 className="text-base font-bold text-foreground">
                        {isRtl ? selectedCategory.name_fa : (selectedCategory.name_en || selectedCategory.name_fa)}
                      </h3>
                    </div>
                    {selectedCategory.name_en && isRtl && (
                      <p className="text-xs text-muted-foreground font-mono mt-0.5 dir-ltr text-right">
                        {selectedCategory.name_en}
                      </p>
                    )}
                    {selectedCategory.description && (
                      <p className="text-xs text-muted-foreground mt-2">{selectedCategory.description}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-2 mb-3">
                    <Sliders className="w-4 h-4 text-primary" />
                    {t("paramTemplates")}
                  </h4>

                  {(!selectedCategory.parameter_templates || selectedCategory.parameter_templates.length === 0) ? (
                    <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
                      {t("noParams")}
                    </div>
                  ) : (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/40 font-medium text-muted-foreground border-b border-border">
                          <tr>
                            <th className="py-2.5 px-3 text-start">{t("colNameFa")}</th>
                            <th className="py-2.5 px-3 text-start">{t("colNameEn")}</th>
                            <th className="py-2.5 px-3 text-start">{t("colUnit")}</th>
                            <th className="py-2.5 px-3 text-start">{t("colType")}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {selectedCategory.parameter_templates.map((tpl) => (
                            <tr key={tpl.key} className="hover:bg-muted/20">
                              <td className="py-2.5 px-3 font-semibold text-foreground">{tpl.name_fa}</td>
                              <td className="py-2.5 px-3 font-mono text-muted-foreground">{tpl.name_en || "—"}</td>
                              <td className="py-2.5 px-3 font-mono text-primary font-bold">{tpl.unit || "—"}</td>
                              <td className="py-2.5 px-3">
                                <Badge variant="secondary" className="font-mono text-[10px]">
                                  {tpl.type}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12 border border-dashed rounded-lg text-xs text-muted-foreground">
              {t("selectCategory")}
            </div>
          )}
        </div>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              {t("dialogTitle")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-foreground mb-1 block">{t("dialogNameFa")}</label>
                <Input
                  placeholder="e.g. Steam Turbines"
                  value={newCatNameFa}
                  onChange={(e) => setNewCatNameFa(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">{t("dialogCode")}</label>
                <Input
                  placeholder="TRB"
                  value={newCatCode}
                  onChange={(e) => setNewCatCode(e.target.value)}
                  className="font-mono uppercase text-xs"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="text-xs text-muted-foreground mb-1 block">{t("dialogNameEn")}</label>
                <Input
                  placeholder="Industrial Steam Turbines"
                  value={newCatNameEn}
                  onChange={(e) => setNewCatNameEn(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground">{t("customParams")}</span>
                <Button type="button" variant="outline" size="sm" onClick={addTemplateRow} className="h-7 text-xs gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  {t("addParam")}
                </Button>
              </div>

              {newTemplates.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2 text-center">{t("noParamsAdded")}</p>
              ) : (
                <div className="space-y-2">
                  {newTemplates.map((tm, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        placeholder="FA Name"
                        value={tm.name_fa}
                        onChange={(e) => updateTemplateRow(idx, "name_fa", e.target.value)}
                        className="flex-1 text-xs"
                      />
                      <Input
                        placeholder="EN Name"
                        value={tm.name_en}
                        onChange={(e) => updateTemplateRow(idx, "name_en", e.target.value)}
                        className="w-1/4 font-mono text-xs"
                      />
                      <Input
                        placeholder="Unit"
                        value={tm.unit}
                        onChange={(e) => updateTemplateRow(idx, "unit", e.target.value)}
                        className="w-20 font-mono text-xs"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTemplateRow(idx)}
                        className="h-8 w-8 text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>{t("saveCategory")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
