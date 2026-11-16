"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Archive,
  AlertCircle,
  FileCheck2,
  Clock,
  Sparkles,
  ArrowRight,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { EspCodingClientService } from "../services/esp-coding.service";
import { CodingFormulaVersion, CodingFormulaProfile } from "../types";

export function SuperAdminApprovalsView() {
  const t = useTranslations("espCoding.approvals");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const { user } = useAuth();

  const isSuperAdmin = user?.role === "superadmin";

  const [versions, setVersions] = useState<CodingFormulaVersion[]>([]);
  const [profiles, setProfiles] = useState<CodingFormulaProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Activation Dialog State
  const [selectedVersion, setSelectedVersion] = useState<CodingFormulaVersion | null>(null);
  const [actionType, setActionType] = useState<string>("");
  const [activationReason, setActivationReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await EspCodingClientService.getProfilesAndVersions();
      setVersions(res.versions);
      setProfiles(res.profiles);
    } catch (err) {
      console.error("Failed to load approval data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openActionModal = (version: CodingFormulaVersion, action: string) => {
    setSelectedVersion(version);
    setActionType(action);
    setActivationReason("");
  };

  const handleConfirmAction = async () => {
    if (!selectedVersion || !actionType) return;

    if (actionType === "activate" && !activationReason.trim()) {
      toast.error(isRtl ? "ورود دلیل فعال‌سازی الزامی است." : "Activation reason is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await EspCodingClientService.processApprovalAction({
        versionId: selectedVersion.versionId,
        action: actionType,
        reason: activationReason,
        userRole: user?.role,
        userId: user?.id,
        userName: user?.fullName || user?.name || "Super Admin",
      });

      toast.success(
        isRtl
          ? `عملیات ${actionType} با موفقیت توسط سوپرادمین اعمال شد.`
          : `Action '${actionType}' applied successfully by Super Admin.`
      );

      setSelectedVersion(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to process action");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingVersions = versions.filter((v) => v.status === "pending_approval");
  const activeVersions = versions.filter((v) => v.status === "active");
  const otherVersions = versions.filter(
    (v) => v.status !== "pending_approval" && v.status !== "active"
  );

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-150">
      {/* Title & SuperAdmin Security Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <span>{t("title")}</span>
          </h1>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>

        <Badge
          variant={isSuperAdmin ? "default" : "destructive"}
          className="px-3 py-1 font-mono text-xs w-fit flex items-center gap-1.5"
        >
          {isSuperAdmin ? <CheckCircle2 className="size-3.5" /> : <ShieldAlert className="size-3.5" />}
          <span>{isSuperAdmin ? "SUPER ADMIN AUTHORIZED" : t("superAdminBadge")}</span>
        </Badge>
      </div>

      {!isSuperAdmin && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <span>{t("forbiddenNotice")}</span>
        </div>
      )}

      {/* Pending Approvals Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Clock className="size-4 text-amber-500" />
            <span>{t("pendingList")} ({pendingVersions.length})</span>
          </h2>
        </div>

        {pendingVersions.length === 0 ? (
          <Card className="p-8 text-center rounded-2xl border-dashed border-border/60 bg-muted/10 text-muted-foreground text-xs">
            <FileCheck2 className="size-8 mx-auto opacity-40 mb-2 text-primary" />
            <p>{isRtl ? "هیچ فرمولی در انتظار تأیید نیست." : "No formulas pending approval."}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {pendingVersions.map((v) => (
              <Card key={v.versionId} className="p-5 rounded-2xl border-amber-500/30 bg-amber-500/5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-foreground">
                      {isRtl ? v.applicableFamilyNameFa || v.descriptionFa : v.applicableFamilyNameEn || v.descriptionEn}
                    </span>
                    <Badge variant="outline" className="font-mono text-xs bg-background text-amber-600 dark:text-amber-400 border-amber-500/40">
                      v{v.versionNumber}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {v.segments.length} Segments • Separator: {v.separator}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {isRtl ? "ارسال‌شده توسط:" : "Submitted by:"} {v.submittedBy || "User"} • {v.submittedAt ? new Date(v.submittedAt).toLocaleDateString(isRtl ? "fa-IR" : "en-US") : "Recent"}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {isSuperAdmin && (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => openActionModal(v, "activate")}
                        className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>{t("activateBtn")}</span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openActionModal(v, "approve")}
                        className="h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer bg-background"
                      >
                        <FileCheck2 className="size-3.5" />
                        <span>{t("approveBtn")}</span>
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openActionModal(v, "return_revision")}
                        className="h-8 px-3 rounded-xl text-xs text-amber-600 hover:bg-amber-500/10 cursor-pointer"
                      >
                        <span>{t("returnBtn")}</span>
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openActionModal(v, "reject")}
                        className="h-8 px-3 rounded-xl text-xs text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <span>{t("rejectBtn")}</span>
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Currently Active Production Formulas */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-500" />
          <span>{t("activeFormulas")} ({activeVersions.length})</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activeVersions.map((v) => (
            <Card key={v.versionId} className="p-4 rounded-2xl border-emerald-500/30 bg-card shadow-xs flex flex-col justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground">
                    {isRtl ? v.applicableFamilyNameFa || v.descriptionFa : v.applicableFamilyNameEn || v.descriptionEn}
                  </span>
                  <Badge variant="outline" className="font-mono text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    Active v{v.versionNumber}
                  </Badge>
                </div>
                <span className="text-[11px] text-muted-foreground line-clamp-2">
                  {isRtl ? v.descriptionFa : v.descriptionEn}
                </span>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono mt-1">
                  <span>Activated by: {v.activatedBy || "SUPERADMIN"}</span>
                  <span>• Separator: {v.separator}</span>
                </div>
              </div>

              {isSuperAdmin && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openActionModal(v, "deactivate")}
                    className="h-7 px-2.5 rounded-lg text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <span>{t("archiveBtn")}</span>
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Action Confirmation Modal */}
      <Dialog open={!!selectedVersion} onOpenChange={(open) => !open && setSelectedVersion(null)}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              <span>
                {actionType === "activate"
                  ? t("confirmActivation")
                  : `Confirm ${actionType}`}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {selectedVersion?.descriptionEn} (v{selectedVersion?.versionNumber})
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3.5 pt-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {t("activationReasonLabel")}
              </Label>
              <Input
                type="text"
                value={activationReason}
                onChange={(e) => setActivationReason(e.target.value)}
                placeholder="e.g. Approved and verified production engineering baseline"
                className="h-9 rounded-xl text-xs bg-background"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedVersion(null)}
                className="rounded-xl text-xs"
              >
                {isRtl ? "انصراف" : "Cancel"}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isSubmitting}
                onClick={handleConfirmAction}
                className="rounded-xl text-xs font-bold bg-primary text-primary-foreground"
              >
                {isRtl ? "تأیید نهایی" : "Confirm Action"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
