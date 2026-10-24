"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { 
  Check, 
  RotateCw, 
  LogOut, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Clock,
  User,
  ShieldCheck,
  UserCheck,
  Building,
  KeyRound,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { useRouter, Link } from "@/i18n/navigation";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { api } from "@/services";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AccountPendingPage() {
  const t = useTranslations("Auth.accountPending");
  const locale = useLocale();
  const isRtl = locale === "fa";
  const router = useRouter();
  const { user, logout } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  const isProfileCompleted = Boolean(currentUser?.isProfileCompleted);
  const hrApproved = Boolean(currentUser?.hrApproved);
  const managerApproved = Boolean(currentUser?.managerApproved || currentUser?.accountStatus === "active");
  const isFullyApproved = hrApproved && managerApproved;

  // Determine system's actual current active step (1 to 4)
  let activeStep = 2; // Default: profile completion
  if (isFullyApproved) {
    activeStep = 4;
  } else if (hrApproved) {
    activeStep = 4;
  } else if (isProfileCompleted) {
    activeStep = 3;
  } else {
    activeStep = 2;
  }

  // Selected step for inspection (allows user to click on any step to see details)
  const [selectedStep, setSelectedStep] = useState<number>(activeStep);

  useEffect(() => {
    setSelectedStep(activeStep);
  }, [activeStep]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.auth.checkAccountStatus();
      if (res.isApproved || res.status === "active") {
        toast.success(t("statusApproved"));
        if (currentUser) {
          const updated = { 
            ...currentUser, 
            accountStatus: "active" as const, 
            hrApproved: true, 
            managerApproved: true 
          };
          setCurrentUser(updated);
          localStorage.setItem("esp_auth_user", JSON.stringify(updated));
        }
      } else {
        toast.info(res.hrApproved ? t("statusPendingManager") : t("statusPendingHr"));
        if (currentUser) {
          const updated = {
            ...currentUser,
            isProfileCompleted: res.isProfileCompleted,
            hrApproved: res.hrApproved,
            managerApproved: res.managerApproved,
            accountStatus: res.status
          };
          setCurrentUser(updated);
          localStorage.setItem("esp_auth_user", JSON.stringify(updated));
        }
      }
    } catch {
      toast.error(t("serverError"));
    } finally {
      setIsRefreshing(false);
    }
  };

  // Demo simulator handlers for testing
  const handleSimulateHrApprove = () => {
    if (!currentUser) return;
    const updated = { ...currentUser, isProfileCompleted: true, hrApproved: true };
    setCurrentUser(updated);
    localStorage.setItem("esp_auth_user", JSON.stringify(updated));
    toast.success(t("demoHrToast"));
  };

  const handleSimulateManagerApprove = () => {
    if (!currentUser) return;
    const updated = { 
      ...currentUser, 
      isProfileCompleted: true, 
      hrApproved: true, 
      managerApproved: true, 
      accountStatus: "active" as const 
    };
    setCurrentUser(updated);
    localStorage.setItem("esp_auth_user", JSON.stringify(updated));
    toast.success(t("demoManagerToast"));
  };

  const handleSimulateReset = () => {
    if (!currentUser) return;
    const updated = { 
      ...currentUser, 
      isProfileCompleted: false, 
      hrApproved: false, 
      managerApproved: false, 
      accountStatus: "pending_profile" as const 
    };
    setCurrentUser(updated);
    localStorage.setItem("esp_auth_user", JSON.stringify(updated));
    toast.info(t("demoResetToast"));
  };

  // Steps configuration completely mapped to i18n
  const steps = [
    {
      id: 1,
      title: t("step1Title"),
      shortTitle: t("step1Short"),
      summary: t("step1Summary"),
      description: t("step1Desc"),
      isCompleted: true,
      isActive: false,
      needsAction: false,
    },
    {
      id: 2,
      title: t("step2Title"),
      shortTitle: t("step2Short"),
      summary: isProfileCompleted ? t("step2SummaryDone") : t("step2SummaryPending"),
      description: t("step2Desc"),
      isCompleted: isProfileCompleted,
      isActive: activeStep === 2,
      needsAction: !isProfileCompleted,
    },
    {
      id: 3,
      title: t("step3Title"),
      shortTitle: t("step3Short"),
      summary: hrApproved ? t("step3SummaryDone") : t("step3SummaryPending"),
      description: t("step3Desc"),
      isCompleted: hrApproved,
      isActive: activeStep === 3,
      needsAction: isProfileCompleted && !hrApproved,
    },
    {
      id: 4,
      title: t("step4Title"),
      shortTitle: t("step4Short"),
      summary: isFullyApproved ? t("step4SummaryDone") : t("step4SummaryPending"),
      description: t("step4Desc"),
      isCompleted: isFullyApproved,
      isActive: activeStep === 4,
      needsAction: hrApproved && !isFullyApproved,
    },
  ];

  const targetStepIndex = steps.findIndex(s => s.needsAction);
  const activeLineIndex = targetStepIndex >= 0 ? targetStepIndex : (isFullyApproved ? 3 : activeStep - 1);
  const progressRatio = Math.max(0, Math.min(1, activeLineIndex / (steps.length - 1)));

  const selectedStepData = steps.find(s => s.id === selectedStep) || steps[0];

  return (
    <div className="w-full flex-1 min-h-[var(--home-height)] flex items-center justify-center p-3 sm:p-6 overflow-y-auto custom-scrollbar bg-transparent">
      
      <Card className="w-full max-w-2xl bg-card border border-border/60 shadow-xl rounded-3xl overflow-hidden p-6 sm:p-10 my-auto shrink-0 min-h-[500px] sm:min-h-[520px]">
        <CardContent className="p-0 space-y-7">
          
          {/* Top Sleek Progress Bar with Flowing Pulse Beam & Radar Ping on Active Step */}
          <div className="relative w-full pt-3 pb-2 select-none">
            <div className="flex items-center justify-between relative">
              
              {/* Continuous Connecting Track Line Underneath Between Step 1 and Step 4 */}
              <div className="absolute top-[20px] sm:top-[24px] -translate-y-1/2 start-[12.5%] w-[75%] z-0 h-[2px]">
                {/* Background Inactive Track */}
                <div className="size-full bg-border/80 dark:bg-muted/50 rounded-full" />

                {/* Active Connecting Track Line (Fixed 2px thickness, Primary Default) */}
                {progressRatio > 0 && (
                  <div 
                    className="absolute top-0 bottom-0 start-0 bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progressRatio * 100}%` }}
                  />
                )}
              </div>

              {/* Stepper Items */}
              {steps.map((step) => {
                const isPast = step.isCompleted;
                const isCurrent = step.isActive;
                const isSelected = selectedStep === step.id;
                const needsAction = step.needsAction;

                return (
                  <div key={step.id} className="flex-1 flex flex-col items-center relative z-10">
                    
                    {/* Circle Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedStep(step.id)}
                      className="group relative z-10 flex items-center justify-center outline-none cursor-pointer select-none transition-colors duration-200"
                      aria-label={step.title}
                    >
                      {/* Soft and subtle pulse on step needing action */}
                      {needsAction && (
                        <motion.span
                          className="absolute -inset-1 rounded-full border-2 border-primary/40 bg-primary/10 pointer-events-none"
                          animate={{
                            scale: [1, 1.25],
                            opacity: [0.7, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeOut",
                          }}
                        />
                      )}

                      {/* Main Circle Badge */}
                      <div className={`relative size-10 sm:size-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                        isPast
                          ? "bg-emerald-500 text-white border-2 border-emerald-500 shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/20"
                          : needsAction
                            ? "border-2 border-primary text-primary bg-background ring-2 ring-primary/25 shadow-sm shadow-primary/20 font-bold"
                            : isCurrent
                              ? "border-2 border-primary text-primary bg-background ring-2 ring-primary/25 shadow-sm shadow-primary/20 font-bold"
                              : "border-2 border-border/80 text-muted-foreground/80 bg-card group-hover:border-primary/40"
                      } ${isSelected ? (isPast ? "ring-2 ring-offset-2 ring-emerald-500" : "ring-2 ring-offset-2 ring-primary") : ""}`}>
                        {isPast ? (
                          <Check className="size-5 stroke-[2.8]" />
                        ) : (
                          <span className="font-mono text-sm sm:text-base">{step.id}</span>
                        )}
                      </div>
                    </button>

                    {/* Step Title Label */}
                    <span 
                      onClick={() => setSelectedStep(step.id)}
                      className={`text-xs sm:text-sm font-semibold mt-2.5 cursor-pointer text-center whitespace-nowrap transition-colors ${
                        isPast 
                          ? "text-emerald-600 dark:text-emerald-400 font-bold" 
                          : needsAction || isCurrent
                            ? "text-primary font-bold" 
                            : "text-muted-foreground"
                      } ${isSelected ? "underline underline-offset-4 font-bold" : ""}`}
                    >
                      {step.shortTitle}
                    </span>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Clean Step Status Detail Box (Fixed Height & Smooth Fade Switcher) */}
          <div className="relative pt-1 min-h-[224px] sm:min-h-[200px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedStep}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="p-5 sm:p-6 rounded-2xl bg-muted/20 border border-border/50 min-h-[224px] sm:min-h-[200px] flex flex-col justify-between"
              >
                
                {/* Status Header */}
                <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-border/40">
                  <div className="flex items-center gap-2.5">
                    <div className={`size-8 rounded-full flex items-center justify-center font-bold text-xs font-mono ${
                      selectedStepData.isCompleted
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                        : selectedStepData.needsAction || selectedStepData.isActive
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-muted text-muted-foreground border border-border/50"
                    }`}>
                      {selectedStep}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        {selectedStepData.title}
                      </h3>
                      <span className="text-[11px] text-muted-foreground">
                        {selectedStepData.summary}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {selectedStepData.isCompleted ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {t("completedBadge")}
                      </span>
                    ) : selectedStepData.isActive ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/25">
                        {t("activeBadge")}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground px-2 py-0.5">
                        {t("waitingBadge")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Explanation text */}
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed my-2 min-h-[38px]">
                  {selectedStepData.description}
                </p>

                {/* Action CTA depending on step */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-auto">
                  
                  {/* Step 2 or Active step CTA: Go to Profile */}
                  <Button
                    asChild
                    className="h-10 px-5 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm gap-2"
                  >
                    <Link href="/dashboard/profile?tab=personal">
                      <User className="size-4" />
                      <span>{isProfileCompleted ? t("viewProfileBtn") : t("enterProfileBtn")}</span>
                      {isRtl ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
                    </Link>
                  </Button>

                  {/* Refresh Button */}
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="h-10 text-xs font-medium gap-1.5"
                  >
                    <RotateCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                    <span>{t("refreshStatus")}</span>
                  </Button>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Account Footer Bar (Email & Logout) */}
          <div className="flex items-center justify-between pt-2 text-xs border-t border-border/40 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">{t("userEmailLabel")}</span>
              <span dir="ltr" className="font-sans font-medium text-foreground tracking-normal select-all">
                {currentUser?.email || "user@euroslotpars.com"}
              </span>
            </div>

            <button
              type="button"
              onClick={async () => {
                await logout();
                router.push("/login");
              }}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors inline-flex items-center gap-1"
            >
              <LogOut className="size-3.5" />
              <span>{t("logout")}</span>
            </button>
          </div>

          {/* Simulation Controls for testing workflow */}
          <div className="p-3 rounded-2xl bg-muted/15 border border-dashed border-border/60 text-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground font-semibold text-[11px]">
              <span className="flex items-center gap-1.5">
                <Building className="size-3.5 text-primary" />
                <span>{t("demoSimulator")}</span>
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">Demo</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleSimulateReset}
                className="h-7.5 text-[11px] font-medium"
              >
                {t("demoReset")}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleSimulateHrApprove}
                disabled={hrApproved}
                className="h-7.5 text-[11px] font-medium"
              >
                <UserCheck className="size-3.5 mr-1" />
                {t("demoHrApprove")}
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={handleSimulateManagerApprove}
                disabled={isFullyApproved}
                className="h-7.5 text-[11px] font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <ShieldCheck className="size-3.5 mr-1" />
                {t("demoManagerApprove")}
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

    </div>
  );
}
