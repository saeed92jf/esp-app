const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'src', 'modules', 'admin', 'components');
const adminDashboardPath = path.join(adminDir, 'AdminDashboard.tsx');

let content = fs.readFileSync(adminDashboardPath, 'utf8');

// The goal is to replace the inline components with proper React components.
// We'll leave AdminDashboard.tsx mostly intact but extract the JSX parts into separate files.

const sidebarCode = `import React from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Calendar, ShieldAlert, BarChart3, Mail, Settings } from "lucide-react";
import { useTranslations } from "next-intl";

export function AdminSidebar({ isSidebarExpanded, setIsSidebarExpanded, activeTab, setActiveTab }: any) {
  const t = useTranslations("Admin");

  return (
    <aside className={\`border-l border-border/10 flex flex-col items-center py-8 gap-8 z-20 transition-[width] duration-500 ease-in-out hidden md:flex shrink-0 overflow-hidden \${isSidebarExpanded ? 'w-64 px-4' : 'w-[88px] px-3'}\`}>
      <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xl shrink-0 cursor-pointer transition-transform hover:scale-105" onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}>
        <div className="flex gap-0.5">
          <div className="w-2 h-4 bg-background rounded-full"></div>
          <div className="w-2 h-4 bg-background rounded-full"></div>
        </div>
      </div>
      
      <div className="flex flex-col gap-4 w-full mt-4">
        {[
          { icon: Briefcase, id: 'home', label: t("sidebarHome") },
          { icon: Users, id: 'users', label: t("sidebarUsers") },
          { icon: Calendar, id: 'cal', label: t("sidebarCal") },
          { icon: ShieldAlert, id: 'req', label: t("sidebarReq") },
          { icon: BarChart3, id: 'stats', label: t("sidebarStats") },
          { icon: Mail, id: 'mail', label: t("sidebarMail") },
          { icon: Settings, id: 'settings', label: t("sidebarSettings") }
        ].map(item => (
          <Button key={item.id} variant={activeTab === item.id ? "secondary" : "ghost"} className="w-full rounded-2xl h-12 transition-all duration-300 flex items-center justify-start p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 overflow-hidden shrink-0" onClick={() => setActiveTab(item.id)}>
            <div className={\`\${isSidebarExpanded ? 'w-[52px]' : 'w-[64px]'} flex items-center justify-center shrink-0 transition-all duration-500\`}>
              <item.icon size={22} strokeWidth={1.5} />
            </div>
            <span className={\`text-[15px] font-medium whitespace-nowrap text-foreground transition-opacity duration-500 \${isSidebarExpanded ? 'opacity-100' : 'opacity-0'}\`}>
              {item.label}
            </span>
          </Button>
        ))}
      </div>
    </aside>
  );
}
`;

fs.writeFileSync(path.join(adminDir, 'AdminSidebar.tsx'), sidebarCode);
console.log("Created AdminSidebar.tsx");
