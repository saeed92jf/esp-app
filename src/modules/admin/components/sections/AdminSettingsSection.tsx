"use client";

import React from "react";
import { Settings } from "lucide-react";
import { useTranslations } from "next-intl";

export function AdminSettingsSection() {
  const t = useTranslations("Admin");

  return (
    <div className="flex items-center justify-center flex-1 min-h-[420px] p-4">
      <div className="bg-card rounded-2xl p-10 max-w-lg w-full text-center border border-border/40 shadow-xs">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <Settings size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t("tabSettingsTitle")}</h2>
        <p className="text-muted-foreground mb-8">{t("tabSettingsDesc")}</p>
      </div>
    </div>
  );
}
