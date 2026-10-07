import React, { useState } from "react";

import { MoreVertical, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { User } from "../types/admin.types";

interface AdminHeatmapModulesProps {
  selectedUser: User | null;
  availableModules: any[];
  tMenu: any;
  handleToggleModuleAccess: (moduleId: string, checked: boolean) => void;
  handleToggleAllModulesAccess: (checked: boolean) => void;
}

export function AdminHeatmapModules({ selectedUser, availableModules, tMenu, handleToggleModuleAccess, handleToggleAllModulesAccess }: AdminHeatmapModulesProps) {
  const t = useTranslations("Admin");
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  
  const handleToggleExpand = (groupId: string | null) => {
    setExpandedGroup(groupId);
  };

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
    <div className="flex flex-col gap-3 h-full min-h-0">
      <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-border/40 rounded-[2rem] p-6 flex flex-col flex-1 min-h-0 relative overflow-hidden">
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[15px] text-foreground">{t("accesses")}</h3>
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-[4px]">
              {grantedItems.length}
            </span>
          </div>
        </div>

        {grantedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center h-full relative z-10 opacity-60">
            <ShieldAlert size={40} className="text-muted-foreground mb-3 opacity-50" />
            <p className="text-sm font-medium text-muted-foreground">{t("noResults")}</p>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-y-auto pr-2 scrollbar-thin space-y-2 relative z-10">
            {grantedItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-background/50 border border-border/40 shadow-sm hover:border-primary/20 transition-colors">
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
