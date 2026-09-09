"use client";

import { useTranslations, useLocale } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuthModal } from "../hooks/use-auth-modal";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Lock, Sparkles, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const storeModal = useAuthModal();
  
  const isOpen = open !== undefined ? open : storeModal.isOpen;
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      if (!newOpen) storeModal.closeModal();
    }
  };

  const t = useTranslations("Dashboard.upsell");
  const tAuth = useTranslations("Auth");
  const locale = useLocale();
  const isRtl = locale === "fa";

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className={cn("sm:max-w-md overflow-hidden p-0 border-none bg-transparent shadow-2xl", isRtl && "font-vazir fa-num")} 
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="relative bg-card rounded-xl border border-border/50 overflow-hidden">
          {/* Top banner / illustration */}
          <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-background relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_14px]" />
            <div className="relative z-10 bg-primary/10 p-4 rounded-full border border-primary/20 shadow-lg shadow-primary/20">
              <Lock className="size-8 text-primary" />
            </div>
            {/* Sparkles around */}
            <Sparkles className="absolute top-6 right-12 size-4 text-amber-500 animate-pulse" />
            <Sparkles className="absolute bottom-8 left-10 size-5 text-purple-500 animate-pulse delay-150" />
          </div>

          <div className="p-6 space-y-6 text-center">
            <DialogHeader className="space-y-2 text-center">
              <DialogTitle className="text-2xl font-bold">{t("title")}</DialogTitle>
              <DialogDescription className="text-base">
                {t("description")}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 w-full pt-2">
              <Button asChild size="lg" className="w-full h-12 rounded-xl text-base shadow-md shadow-primary/20 transition-all" onClick={() => handleOpenChange(false)}>
                <Link href="/register">
                  <UserPlus className={cn("size-5", isRtl ? "ml-2" : "mr-2")} />
                  {t("registerButton")}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full h-12 rounded-xl" onClick={() => handleOpenChange(false)}>
                <Link href="/login">
                  <LogIn className={cn("size-5", isRtl ? "ml-2" : "mr-2")} />
                  {tAuth("login")}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleOpenChange(false)}
                className="w-full h-12 rounded-xl text-muted-foreground hover:bg-muted"
              >
                {t("cancelButton")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
