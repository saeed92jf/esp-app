// src/components/global-quick-actions/quick-action-modal-host.tsx
"use client";

import React from "react";
import { BugReportSubmissionDialog } from "@/modules/bug-reports/components/BugReportSubmissionDialog";
import { SupportRequestDialog } from "@/modules/bug-reports/components/SupportRequestDialog";
import { FeedbackDialog } from "@/modules/bug-reports/components/FeedbackDialog";
import { IdeaDialog } from "@/modules/bug-reports/components/IdeaDialog";

interface QuickActionModalHostProps {
  activeActionId: string | null;
  onClose: () => void;
}

export function QuickActionModalHost({
  activeActionId,
  onClose,
}: QuickActionModalHostProps) {
  if (!activeActionId) return null;

  return (
    <>
      <BugReportSubmissionDialog
        open={activeActionId === "bug-report"}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      />
      <SupportRequestDialog
        open={activeActionId === "support-request"}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      />
      <FeedbackDialog
        open={activeActionId === "feedback"}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      />
      <IdeaDialog
        open={activeActionId === "suggest-idea"}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      />
    </>
  );
}

