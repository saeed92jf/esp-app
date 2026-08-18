"use client";

import React from "react";
import { Palette, Workflow, Scale } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDiagramStore } from "../store";
import type { DiagramEdgeType, EditorSettings } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

// ── Local sub-components ────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <Label className="min-w-0 flex-1 text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// Falls back to a plain-English string if a translation key hasn't been
// added to messages/*.json yet — next-intl throws on missing keys, so every
// newly-introduced string in this dialog goes through this instead of a bare t().
function safeT(t: ReturnType<typeof useTranslations>, key: string, fallback: string): string {
  try {
    return t(key);
  } catch {
    return fallback;
  }
}

// Every connection style the app supports, kept in exactly one place so the
// Editor Settings dialog and the per-edge SettingsPanel control never drift
// apart again.
function useEdgeTypeOptions(): { value: DiagramEdgeType; label: string }[] {
  const t = useTranslations("Flow");
  return [
    { value: "default", label: safeT(t, "editorSettings.edge_default", "Curve") },
    { value: "straight", label: safeT(t, "editorSettings.edge_straight", "Straight") },
    { value: "step", label: safeT(t, "editorSettings.edge_step", "Sharp step") },
    { value: "smoothstep", label: safeT(t, "editorSettings.edge_smoothstep", "Smooth step") },
    { value: "floating", label: safeT(t, "editorSettings.edge_floating", "Floating curve") },
    { value: "floating-straight", label: safeT(t, "editorSettings.edge_floating_straight", "Floating straight") },
  ];
}



// ── EditorSettingsDialog ─────────────────────────────────────────────────
// NOTE: the "default connection style" control below intentionally uses the
// project's plain <Select> component (a simple dropdown), NOT the searchable
// <Combobox> — there are only 6 fixed options and this is the canvas-wide
// settings dialog, so a search box adds friction without adding value.
export function EditorSettingsDialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations("Flow");
  const settings = useDiagramStore((s) => s.settings);
  const updateSettings = useDiagramStore((s) => s.updateSettings);
  const edgeTypeOptions = useEdgeTypeOptions();

  const set = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) =>
    updateSettings({ [key]: value });

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0 bg-muted/30">
          <DialogTitle>{t("editorSettings.title")}</DialogTitle>
          <DialogDescription>
            {t("editorSettings.canvas")} · {t("editorSettings.appearance")} · {t("editorSettings.behavior")}
          </DialogDescription>
        </DialogHeader>

        <Tabs orientation="vertical" defaultValue="general" className="flex flex-1 overflow-hidden min-h-[50vh]">
          <div className="w-56 shrink-0 border-r border-border bg-muted/10 p-3">
            <TabsList variant="line" className="flex w-full flex-col items-stretch gap-1">
              <TabsTrigger value="general" className="justify-start gap-2 px-3 py-2">
                <Workflow className="size-4" />
                <span className="text-xs">General / Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="weight" className="justify-start gap-2 px-3 py-2">
                <Scale className="size-4" />
                <span className="text-xs">Vessel Weight</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                <TabsContent value="general" className="m-0 space-y-6">
                  {/* Canvas */}
                  <div>
                    <SectionTitle>{t("editorSettings.canvas")}</SectionTitle>
                    <div className="space-y-1">
                      <Row label={t("editorSettings.snapToGrid")}>
                        <Switch checked={settings.snapToGrid} onCheckedChange={(v) => set("snapToGrid", v)} />
                      </Row>
                      {settings.snapToGrid && (
                        <Row label={safeT(t, "editorSettings.gridSize", "Grid size")}>
                          <Combobox
                            value={String(settings.snapGrid[0])}
                            onChange={(v) => { if(v) set("snapGrid", [Number(v), Number(v)]); }}
                            options={[5, 10, 15, 20, 25, 50].map(g => ({ value: String(g), label: `${g}px` }))}
                            className="w-24"
                            showSearch={false}
                          />
                        </Row>
                      )}
                      <Row label={t("editorSettings.showMiniMap")}>
                        <Switch checked={settings.showMiniMap} onCheckedChange={(v) => set("showMiniMap", v)} />
                      </Row>
                      <Row label={t("editorSettings.showControls")}>
                        <Switch checked={settings.showControls} onCheckedChange={(v) => set("showControls", v)} />
                      </Row>
                      <Row label={t("editorSettings.background")}>
                        <Combobox
                          value={settings.backgroundVariant}
                          onChange={(v) => { if(v) set("backgroundVariant", v as any); }}
                          options={[
                            { value: "dots", label: t("editorSettings.bg_dots") },
                            { value: "lines", label: t("editorSettings.bg_lines") },
                            { value: "cross", label: t("editorSettings.bg_cross") },
                            { value: "none", label: t("editorSettings.bg_none") }
                          ]}
                          className="w-40"
                          showSearch={false}
                        />
                      </Row>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Appearance */}
                  <div>
                    <SectionTitle>{t("editorSettings.appearance")}</SectionTitle>
                    <Row label={t("editorSettings.colorMode")}>
                      <span className="text-xs text-muted-foreground">
                        {settings.colorMode === "dark" ? t("editorSettings.mode_dark") : t("editorSettings.mode_light")}
                        {" — "}
                        {safeT(t, "editorSettings.colorModeNote", "synced with the site theme")}
                      </span>
                    </Row>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Behavior */}
                  <div>
                    <SectionTitle>{t("editorSettings.behavior")}</SectionTitle>
                    <div className="space-y-1">
                      <Row label={t("editorSettings.defaultEdgeType")}>
                        <Combobox
                          value={settings.defaultEdgeType}
                          onChange={(v) => { if(v) set("defaultEdgeType", v as DiagramEdgeType); }}
                          options={edgeTypeOptions}
                          className="w-56"
                          showSearch={false}
                        />
                      </Row>
                      <Row label={t("editorSettings.autoSave")}>
                        <Switch checked={settings.autoSave} onCheckedChange={(v) => set("autoSave", v)} />
                      </Row>
                      <Row label={safeT(t, "editorSettings.collisionAvoidance", "Push nodes apart while dragging")}>
                        <Switch checked={settings.collisionAvoidance} onCheckedChange={(v) => set("collisionAvoidance", v)} />
                      </Row>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="weight" className="m-0 space-y-6">
                  {/* Weight settings */}
                  <div>
                    <SectionTitle>
                      <span className="flex items-center gap-1.5">
                        <Scale className="h-3 w-3" />
                        {safeT(t, "editorSettings.weight_title", "Vessel Weight Calculations")}
                      </span>
                    </SectionTitle>
                    <div className="space-y-1 mt-2">
                      <Row label={safeT(t, "editorSettings.weight_enabled", "Enable weight aggregations")}>
                        <Switch checked={settings.weightCalculationEnabled} onCheckedChange={(v) => set("weightCalculationEnabled", v)} />
                      </Row>
                      <Row label={safeT(t, "editorSettings.weight_system", "Measurement System")}>
                        <ToggleGroup
                          type="single"
                          value={settings.weightSystem}
                          onValueChange={(v) => { if (v) set("weightSystem", v as "metric" | "imperial"); }}
                          className="justify-start bg-muted p-0.5 rounded-md"
                        >
                          <ToggleGroupItem value="metric" className="h-7 px-3 text-[11px] data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm">
                            {safeT(t, "editorSettings.weight_metric", "Metric (kg, mm)")}
                          </ToggleGroupItem>
                          <ToggleGroupItem value="imperial" className="h-7 px-3 text-[11px] data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm">
                            {safeT(t, "editorSettings.weight_imperial", "Imperial (lbs, in)")}
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </Row>
                    </div>

                    {/* Job-Specific Parameters */}
                    <div className="mt-6">
                      <SectionTitle>{safeT(t, "editorSettings.jobSpecificParams", "Job-Specific Parameters")}</SectionTitle>
                      <div className="space-y-1 mt-2">
                        <Row label={safeT(t, "editorSettings.roundThicknessToNominal", "Round Thickness to Nearest Nominal Size")}>
                          <Switch checked={settings.roundThicknessToNominal} onCheckedChange={(v) => set("roundThicknessToNominal", v)} />
                        </Row>
                        <Row label={safeT(t, "editorSettings.increaseBlindFlangeThickness", "Increase Blind Flange Thickness for Reinforcement")}>
                          <Switch checked={settings.increaseBlindFlangeThickness} onCheckedChange={(v) => set("increaseBlindFlangeThickness", v)} />
                        </Row>
                        <Row label={safeT(t, "editorSettings.printFlangeCalcsForExternalPressure", "Print Flange Calcs for External Pressure")}>
                          <Switch checked={settings.printFlangeCalcsForExternalPressure} onCheckedChange={(v) => set("printFlangeCalcsForExternalPressure", v)} />
                        </Row>
                        <Row label={safeT(t, "editorSettings.noMDMTCalculations", "No MDMT Calculations")}>
                          <Switch checked={settings.noMDMTCalculations} onCheckedChange={(v) => set("noMDMTCalculations", v)} />
                        </Row>
                        <Row label={safeT(t, "editorSettings.noMAWPCalculations", "No MAWP Calculations")}>
                          <Switch checked={settings.noMAWPCalculations} onCheckedChange={(v) => set("noMAWPCalculations", v)} />
                        </Row>
                        <Row label={safeT(t, "editorSettings.metricInputImperialOutput", "Metric Input -> Imperial Output")}>
                          <Switch checked={settings.metricInputImperialOutput} onCheckedChange={(v) => set("metricInputImperialOutput", v)} />
                        </Row>
                        <Row label={safeT(t, "editorSettings.useCommasInsteadOfDecimals", "Use Commas Instead of Decimals in Numbers")}>
                          <Switch checked={settings.useCommasInsteadOfDecimals} onCheckedChange={(v) => set("useCommasInsteadOfDecimals", v)} />
                        </Row>
                        <Row label={safeT(t, "editorSettings.allowableTowerDeflection", "Allowable Tower Deflection")}>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              className="h-7 w-20 text-center px-2 py-0 border-primary"
                              value={settings.allowableTowerDeflection}
                              onChange={(e) => set("allowableTowerDeflection", parseFloat(e.target.value) || 0)}
                            />
                            <span className="text-[11px] text-muted-foreground">{safeT(t, "editorSettings.in_100ft", "in./100ft.")}</span>
                          </div>
                        </Row>
                      </div>
                    </div>

                    {/* Nozzle Analysis Directives */}
                    <div className="mt-6">
                      <SectionTitle>{safeT(t, "editorSettings.nozzleAnalysisDirectives", "Nozzle Analysis Directives")}</SectionTitle>
                      <div className="space-y-1 mt-2">
                        <Row label={safeT(t, "editorSettings.noCorrosionOnInsideWelds", "No Corrosion on Inside Welds")}>
                          <Switch checked={settings.noCorrosionOnInsideWelds} onCheckedChange={(v) => set("noCorrosionOnInsideWelds", v)} />
                        </Row>
                        <Row label={safeT(t, "editorSettings.computeIncreasedNozzleThickness", "Compute Increased Nozzle Thickness")}>
                          <Switch checked={settings.computeIncreasedNozzleThickness} onCheckedChange={(v) => set("computeIncreasedNozzleThickness", v)} />
                        </Row>
                        <Row label={safeT(t, "editorSettings.computeAndPrintAreasForSmallNozzles", "Compute and Print Areas for Small Nozzles")}>
                          <Switch checked={settings.computeAndPrintAreasForSmallNozzles} onCheckedChange={(v) => set("computeAndPrintAreasForSmallNozzles", v)} />
                        </Row>
                      </div>
                    </div>

                    {/* ASME Directives */}
                    <div className="mt-6">
                      <SectionTitle>{safeT(t, "editorSettings.asmeDirectives", "ASME Directives")}</SectionTitle>
                      <div className="space-y-1 mt-2">
                        <Row label={safeT(t, "editorSettings.useVesselMawpToComputeMdmt", "Use the Vessel MAWP to Compute the MDMT")}>
                          <Switch checked={settings.useVesselMawpToComputeMdmt} onCheckedChange={(v) => set("useVesselMawpToComputeMdmt", v)} />
                        </Row>
                        <Row label={safeT(t, "editorSettings.doNotUseNozzleMdmtInterpretation", "Do Not Use Nozzle MDMT Interpretation VIII-1-01-37")}>
                          <Switch checked={settings.doNotUseNozzleMdmtInterpretation} onCheckedChange={(v) => set("doNotUseNozzleMdmtInterpretation", v)} />
                        </Row>
                        <Row label={safeT(t, "editorSettings.asmeMdmtOption", "ASME VIII-1 MDMT Option")}>
                          <Combobox
                            value={settings.asmeMdmtOption}
                            onChange={(v) => { if (v) set("asmeMdmtOption", v); }}
                            options={[
                              { value: "Use Graphs (Fig. UCS-66)", label: safeT(t, "editorSettings.asmeMdmt_useGraphs", "Use Graphs (Fig. UCS-66)") },
                            ]}
                            className="w-56"
                            showSearch={false}
                          />
                        </Row>
                        <Row label={safeT(t, "editorSettings.asmeCodeEdition", "ASME Code Edition")}>
                          <Combobox
                            value={settings.asmeCodeEdition}
                            onChange={(v) => { if (v) set("asmeCodeEdition", v); }}
                            options={[
                              { value: "Current", label: safeT(t, "editorSettings.asmeCode_current", "Current") },
                            ]}
                            className="w-56"
                            showSearch={false}
                          />
                        </Row>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
