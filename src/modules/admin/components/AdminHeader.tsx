import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, ChevronsRight, ChevronsLeft, ChevronRight, ChevronLeft, Search } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types/admin.types";

interface AdminHeaderProps {
  users: User[];
  selectedUser: User | null;
  setSelectedUser: (u: User) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setActiveTab: (val: any) => void;
  activeTab?: string;
}

export function AdminHeader({ users, selectedUser, setSelectedUser, searchQuery, setSearchQuery, setActiveTab, activeTab }: AdminHeaderProps) {
  const t = useTranslations("Admin");
  const locale = useLocale();

  const departments = Array.from(new Set(users.map(u => u.department || 'engineering')));
  const [depIndex, setDepIndex] = useState(0);

  useEffect(() => {
    const depUsers = users.filter(u => (u.department || 'engineering') === departments[depIndex]);
    if (depUsers.length > 0 && !depUsers.find(u => u.id === selectedUser?.id)) {
      setSelectedUser(depUsers[0]);
    }
  }, [depIndex, users, selectedUser, setSelectedUser]);

  const currentDepUsers = users.filter(u => (u.department || 'engineering') === departments[depIndex]);
  const selectedIdx = currentDepUsers.findIndex(u => u.id === selectedUser?.id);

  const getDisplayUsers = () => {
    if (currentDepUsers.length === 0) return [];
    const sIdx = selectedIdx >= 0 ? selectedIdx : 0;
    const len = currentDepUsers.length;
    if (len <= 2) return currentDepUsers;
    
    const res: User[] = [];
    const half = Math.floor(Math.min(5, len) / 2);
    for (let i = -half; i <= half; i++) {
      let idx = (sIdx + i) % len;
      if (idx < 0) idx += len;
      if (!res.some(u => u.id === currentDepUsers[idx].id)) {
        res.push(currentDepUsers[idx]);
      }
    }
    return res;
  };

  const displayUsers = getDisplayUsers();

  const handleNextUser = () => {
    if (currentDepUsers.length === 0) return;
    const sIdx = currentDepUsers.findIndex(u => u.id === selectedUser?.id);
    const nextIdx = (sIdx + 1) % currentDepUsers.length;
    setSelectedUser(currentDepUsers[nextIdx]);
  };

  const handlePrevUser = () => {
    if (currentDepUsers.length === 0) return;
    const sIdx = currentDepUsers.findIndex(u => u.id === selectedUser?.id);
    const prevIdx = (sIdx - 1 + currentDepUsers.length) % currentDepUsers.length;
    setSelectedUser(currentDepUsers[prevIdx]);
  };

  const handleNextDep = () => {
    setDepIndex((prev) => (prev + 1) % departments.length);
  };

  const handlePrevDep = () => {
    setDepIndex((prev) => (prev - 1 + departments.length) % departments.length);
  };

  return (
    <div className="w-full px-8 pt-8 pb-4 shrink-0">
      <div className="flex items-center justify-between gap-4 max-w-[1440px] mx-auto h-full w-full">
        
        {/* Right visually in RTL (First in DOM): Inline Department and Avatars */}
        <div className="flex items-center justify-between gap-1 bg-muted/30 rounded-full h-11 px-2 border border-border/40 shrink-0 w-[600px]">
          
          {/* Outer Left (RTL Right) - Prev Department */}
          <Button variant="ghost" size="icon" className="rounded-full size-8 hover:bg-muted/50 text-muted-foreground hover:text-foreground shrink-0" onClick={handlePrevDep}>
            <ChevronsRight size={16} className={locale === 'fa' ? '' : 'rotate-180'} />
          </Button>

          {/* Department Name */}
          <div className="w-[110px] text-left font-bold text-foreground text-[13px] whitespace-nowrap truncate px-1" dir="ltr">
            {departments.length > 0 ? t(`departments.${departments[depIndex]}`) : '...'}
          </div>

          {/* Inner Left (RTL Right) - Prev User */}
          <Button variant="ghost" size="icon" className="rounded-full size-7 hover:bg-muted/50 text-muted-foreground hover:text-foreground shrink-0" onClick={handlePrevUser}>
            <ChevronRight size={14} className={locale === 'fa' ? '' : 'rotate-180'} />
          </Button>

          {/* Avatars */}
          <div className="flex items-center px-1 min-w-[160px] justify-center h-full">
            <AnimatePresence mode="popLayout">
              {displayUsers.map((u) => {
                const isActive = u.id === selectedUser?.id;
                return (
                  <motion.div
                    layout
                    key={u.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="mx-1 z-10 hover:z-20 shrink-0"
                  >
                    <Avatar 
                      className={`border-[2px] border-card cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] origin-center ${
                        isActive ? 'size-9 ring-1 ring-primary z-30 shadow-md' : 'size-7 opacity-60 hover:opacity-100 grayscale-[50%] hover:grayscale-0'
                      }`} 
                      onClick={() => setSelectedUser(u)}
                    >
                      <AvatarImage src={u.avatar} className="object-cover object-top" />
                      <AvatarFallback className="bg-muted text-foreground text-xs">{u.name[0]}</AvatarFallback>
                    </Avatar>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Inner Right (RTL Left) - Next User */}
          <Button variant="ghost" size="icon" className="rounded-full size-7 hover:bg-muted/50 text-muted-foreground hover:text-foreground shrink-0" onClick={handleNextUser}>
            <ChevronLeft size={14} className={locale === 'fa' ? '' : 'rotate-180'} />
          </Button>

          {/* Members Count */}
          <div className="w-[80px] text-center text-muted-foreground font-medium text-[11px] whitespace-nowrap">
            {t("15members", { count: currentDepUsers.length })}
          </div>

          {/* Outer Right (RTL Left) - Next Department */}
          <Button variant="ghost" size="icon" className="rounded-full size-8 hover:bg-muted/50 text-muted-foreground hover:text-foreground shrink-0" onClick={handleNextDep}>
            <ChevronsLeft size={16} className={locale === 'fa' ? '' : 'rotate-180'} />
          </Button>

        </div>

        {/* Search Input next to avatars */}
        <div className="relative flex items-center h-11 bg-muted/30 rounded-full border border-border/40 shrink-0 w-[250px] px-3 overflow-hidden transition-all focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50">
          <Search size={18} className="text-muted-foreground shrink-0" />
          <Input 
            className="flex-1 border-none bg-transparent h-full px-2 text-[14px] font-medium text-foreground placeholder:text-muted-foreground focus-visible:ring-0 shadow-none"
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Left visually in RTL (Last in DOM): Add Employee button */}
        <div className="w-auto shrink-0 flex justify-end">
          {activeTab === 'add' ? (
            <Button 
              className="rounded-full h-11 px-5 gap-2 bg-muted/40 hover:bg-muted/80 text-foreground border border-border/50 font-medium transition-colors"
              onClick={() => setActiveTab('home')}
            >
              <ArrowLeft size={16} className={locale === 'fa' ? '' : 'rotate-180'} /> {t("userInfo")}
            </Button>
          ) : (
            <Button 
              className="rounded-full h-11 px-5 gap-2 bg-muted/40 hover:bg-muted/80 text-foreground border border-border/50 font-medium transition-colors"
              onClick={() => setActiveTab('add')}
            >
              <Plus size={16} /> {t("addEmployee")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
