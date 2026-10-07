import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Briefcase, Users, Calendar, ShieldAlert, BarChart3, Mail, Settings, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { DashboardAvatar } from "@/modules/dashboard/components/dashboard-avatar";
import { User } from "../types/admin.types";

interface AdminSidebarProps {
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (val: any) => void;
  adminUser?: User;
}

export function AdminSidebar({ isSidebarExpanded, setIsSidebarExpanded, activeTab, setActiveTab, adminUser }: AdminSidebarProps) {
  const t = useTranslations("Admin");

  return (
    <aside className={`border-l border-border/10 flex flex-col items-center pt-4 pb-6 gap-4 z-20 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hidden md:flex shrink-0 relative overflow-visible px-3 ${isSidebarExpanded ? 'w-64' : 'w-[88px]'}`}>
      


      <div className="flex items-center w-full h-12 relative mt-1">
        <div className="absolute ltr:left-0 rtl:right-0 w-[64px] h-full flex items-center justify-center z-50">
          <DashboardAvatar />
        </div>
        
        <div className={`absolute ltr:left-[64px] rtl:right-[64px] flex flex-col overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ltr:origin-left rtl:origin-right ${isSidebarExpanded ? 'opacity-100 w-[150px] scale-100' : 'opacity-0 w-0 scale-95'}`}>
          <span className="fa-num font-semibold text-foreground/90 tracking-tight text-lg leading-tight capitalize truncate whitespace-nowrap">Saeed Jalili</span>
          <span className="text-muted-foreground font-medium text-xs mt-0.5 truncate whitespace-nowrap">{t("manager")}</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 w-full mt-2">
        <div className="flex w-full items-center">
          <div className={`flex items-center shrink-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarExpanded ? 'w-[64px] justify-center' : 'w-full justify-center'}`}>
            <Button 
              variant="ghost" 
              size="icon"
              className={`h-12 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarExpanded ? 'w-12 rounded-2xl' : 'w-12 rounded-full'}`}
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            >
              <div className="w-[18px] h-[14px] flex flex-col justify-between items-center relative">
                <span className={`h-[2px] w-full bg-current rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarExpanded ? 'rotate-45 translate-y-[6px]' : ''}`} />
                <span className={`h-[2px] w-full bg-current rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarExpanded ? 'opacity-0 translate-x-4' : ''}`} />
                <span className={`h-[2px] w-full bg-current rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarExpanded ? '-rotate-45 -translate-y-[6px]' : ''}`} />
              </div>
            </Button>
          </div>
        </div>

        {/* Search removed from here */}

        {[
          { icon: Briefcase, id: 'home', label: t("userInfo") },
          { icon: Users, id: 'add', label: t("userConfig") },
          { icon: Settings, id: 'settings', label: t("sidebarSettings") }
        ].map((item, idx) => (
          <Button 
            key={item.id} 
            variant="ghost" 
            className={`h-12 mx-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-start p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 overflow-hidden shrink-0 group ${isSidebarExpanded ? 'w-full rounded-2xl' : 'w-12 rounded-full'} ${activeTab === item.id ? 'bg-muted text-foreground' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <div className={`flex items-center justify-center shrink-0 h-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarExpanded ? 'w-[64px]' : 'w-12'}`}>
              <item.icon size={22} strokeWidth={1.5} className="transition-transform group-hover:scale-110" />
            </div>
            <span 
              className={`text-[15px] font-medium whitespace-nowrap text-foreground transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] origin-right ${isSidebarExpanded ? 'opacity-100 max-w-[150px] scale-100' : 'opacity-0 max-w-0 scale-95'}`}
              style={{ transitionDelay: isSidebarExpanded ? `${idx * 40}ms` : '0ms' }}
            >
              {item.label}
            </span>
          </Button>
        ))}
      </div>
    </aside>
  );
}
