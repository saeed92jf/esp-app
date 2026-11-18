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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { AssetLocation } from "../types/assets.types";
import { AssetsService } from "../services/assets.service";
import { MapPin, Plus, Factory, Building, Wrench, Zap } from "lucide-react";

export const AssetLocationsView: React.FC = () => {
  const locale = useLocale();
  const isRtl = locale === "fa";
  const t = useTranslations("Assets.locationsView");

  const [locations, setLocations] = useState<AssetLocation[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [nameFa, setNameFa] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PLANT" | "WORKSHOP" | "LINE" | "STATION" | "UTILITY">("WORKSHOP");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const data = await AssetsService.getLocations();
      setLocations(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveLocation = () => {
    if (!nameFa.trim() || !code.trim()) return;

    const newLoc: AssetLocation = {
      id: `loc-${code.toLowerCase().trim()}`,
      name_fa: nameFa.trim(),
      name_en: nameEn.trim(),
      code: code.trim().toUpperCase(),
      parent_id: "loc-plant-1",
      type,
      description: desc.trim() || undefined,
    };

    setLocations((prev) => [...prev, newLoc]);
    setIsAddOpen(false);
    setNameFa("");
    setNameEn("");
    setCode("");
    setDesc("");
  };

  const getTypeIcon = (typ: string) => {
    switch (typ) {
      case "PLANT":
        return <Factory className="w-5 h-5 text-primary" />;
      case "WORKSHOP":
        return <Building className="w-5 h-5 text-amber-500" />;
      case "UTILITY":
        return <Zap className="w-5 h-5 text-rose-500" />;
      default:
        return <Wrench className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-card/40 backdrop-blur-sm">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {locations.map((loc) => {
          const locTitle = isRtl ? loc.name_fa : (loc.name_en || loc.name_fa);
          return (
            <Card key={loc.id} className="border border-border/80 bg-card/60 backdrop-blur-sm hover:border-primary/40 transition-colors">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-muted/60">{getTypeIcon(loc.type)}</div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {loc.code}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground">{locTitle}</h3>
                  {loc.name_en && isRtl && (
                    <p className="text-xs text-muted-foreground font-mono mt-0.5 dir-ltr text-right">
                      {loc.name_en}
                    </p>
                  )}
                </div>

                {loc.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 border-t border-border/60 pt-2">
                    {loc.description}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Location Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              {t("dialogTitle")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">{t("nameFa")}</label>
              <Input
                placeholder="e.g. Heavy Machining Workshop"
                value={nameFa}
                onChange={(e) => setNameFa(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("code")}</label>
              <Input
                placeholder="WS-MCH-02"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono uppercase text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("type")}</label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANT">Plant</SelectItem>
                  <SelectItem value="WORKSHOP">Workshop</SelectItem>
                  <SelectItem value="LINE">Line</SelectItem>
                  <SelectItem value="UTILITY">Utility</SelectItem>
                  <SelectItem value="STATION">Station</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("nameEn")}</label>
              <Input
                placeholder="Heavy Machining Workshop"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("desc")}</label>
              <Input
                placeholder="Description..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLocation}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
