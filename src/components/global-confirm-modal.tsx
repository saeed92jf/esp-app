"use client";

import React from "react";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { useConfirm } from "@/hooks/use-confirm";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function GlobalConfirmModal() {
  const { isOpen, options, close } = useConfirm();
  const t = useTranslations("Admin");

  if (!options) return null;

  const handleConfirm = () => {
    options.onConfirm();
    close();
  };

  const handleCancel = () => {
    if (options.onCancel) {
      options.onCancel();
    }
    close();
  };

  const isDestructive = options.variant === 'destructive';

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      {/* Remove max-w limits from primitive and define custom layout to prevent overflow */}
      <AlertDialogContent className="rounded-[2rem] border border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl p-6 sm:max-w-md gap-6">
        <AlertDialogHeader className="space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center shadow-inner border ${isDestructive ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
            {isDestructive ? <Trash2 size={28} /> : <AlertTriangle size={28} />}
          </div>
          <div className="space-y-2">
            <AlertDialogTitle className="text-xl font-bold text-center text-foreground">
              {options.title || t("confirm")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground text-[14.5px] leading-relaxed">
              {options.description}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        {/* Removed default footer class margins to fix overflow */}
        <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 w-full mt-2">
          <AlertDialogCancel 
            onClick={handleCancel}
            className="w-full sm:flex-1 h-12 rounded-xl text-[14px] font-semibold border-border/50 hover:bg-muted/60 transition-colors m-0"
          >
            {options.cancelText || t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            className={`w-full sm:flex-1 h-12 rounded-xl text-white font-semibold text-[14px] shadow-md transition-all m-0 ${isDestructive ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'}`}
          >
            {options.confirmText || t("confirm")}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
