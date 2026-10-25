import React from "react";
import { ShieldAlert, KeyRound, ExternalLink, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { User } from "../types/admin.types";

interface AdminHeatmapModulesProps {
  selectedUser: User | null;
  availableModules: any[];
  tMenu: any;
  handleToggleModuleAccess: (moduleId: string, checked: boolean) => void;
  handleToggleAllModulesAccess: (checked: boolean) => void;
  onNavigateToAccess?: () => void;
}

export function AdminHeatmapModules({ 
  selectedUser, 
  availableModules, 
  tMenu, 
  handleToggleModuleAccess, 
  handleToggleAllModulesAccess,
  onNavigateToAccess 
}: AdminHeatmapModulesProps) {
  const t = useTranslations("Admin");

  // Flatten the granted accesses
  const grantedItems: any[] = [];
  availableModules.forEach(module => {
    // If the module itself doesn't have items, check if it's granted directly
    if (!module.items || module.items.length === 0) {
      const access = selectedUser?.modulesAccess?.find(m => m.moduleId === module.id);
      if (access?.hasAccess) {
        grantedItems.push({ id: module.id, labelKey: module.labelKey, icon: module.icon, isGroup: true });
      }
    } else {
      // Check its sub-items
      module.items.forEach((item: any) => {
        const itemAccess = selectedUser?.modulesAccess?.find(m => m.moduleId === item.href);
        if (itemAccess?.hasAccess) {
          grantedItems.push({ id: item.href, labelKey: item.labelKey, icon: item.icon, isGroup: false });
        }
      });
    }
  });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[2rem] p-5 flex flex-col flex-1 min-h-0 relative overflow-hidden shadow-2xs">
        
        {/* Header with Title, Count & Direct Link to Access Section */}
        <div className="flex items-center justify-between mb-4 relative z-10 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-semibold text-[15px] text-foreground truncate">{t("accesses")}</h3>
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
              {grantedItems.length}
            </span>
          </div>

          {onNavigateToAccess && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateToAccess}
              className="h-7 px-2.5 rounded-lg text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 inline-flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
            >
              <KeyRound size={13} className="shrink-0" />
              <span>{t("manageAccess")}</span>
              <ExternalLink size={12} className="opacity-70 rtl:rotate-180 shrink-0" />
            </Button>
          )}
        </div>

        {grantedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center h-full relative z-10 py-6">
            <ShieldAlert size={38} className="text-muted-foreground mb-3 opacity-40" />
            <p className="text-xs font-medium text-muted-foreground mb-3">{t("noResults")}</p>
            {onNavigateToAccess && (
              <Button
                size="sm"
                onClick={onNavigateToAccess}
                className="text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-3.5 py-1.5 font-medium cursor-pointer shadow-xs inline-flex items-center gap-1"
              >
                <Plus size={14} />
                <span>{t("grantAccess")}</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-y-auto pr-1 scrollbar-thin space-y-2 relative z-10">
            {grantedItems.map(item => (
              <div 
                key={item.id} 
                className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-background/50 border border-border/40 shadow-2xs hover:border-primary/20 transition-colors"
              >
                <div className="size-6 text-primary flex items-center justify-center shrink-0">
                  {item.icon && <item.icon size={20} weight="duotone" />}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="font-medium text-[13px] text-foreground leading-tight truncate">
                    {item.isGroup ? tMenu(`sections.${item.labelKey}` as any) || item.labelKey : tMenu(`items.${item.labelKey}` as any) || item.labelKey}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
