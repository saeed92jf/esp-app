'use client';

import * as React from 'react';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { useLocale, useTranslations } from 'next-intl';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Upload, X, ChevronRight, ChevronLeft, Check, User, LogOut, Pencil, ChevronDown, Circle, Home, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { HEADER_ICON_BUTTON_CLASS } from '@/lib/constants';
import { usePrimaryColor } from '@/hooks/use-primary-color';
import { PRIMARY_COLORS } from '@/config/settings';
import {
  segmentedAccordionMotion,
  getSegmentedAccordionHeaderClass,
} from '@/lib/animations/segmented-accordion';

import avatar1 from '../assets/avatars/Avatar (1).webp';
import avatar2 from '../assets/avatars/Avatar (2).webp';
import avatar3 from '../assets/avatars/Avatar (3).webp';
import avatar4 from '../assets/avatars/Avatar (4).webp';
import avatar5 from '../assets/avatars/Avatar (5).webp';
import avatar6 from '../assets/avatars/Avatar (6).webp';
import avatar7 from '../assets/avatars/Avatar (7).webp';
import avatar8 from '../assets/avatars/Avatar (8).webp';
import avatar9 from '../assets/avatars/Avatar (9).webp';

const PREDEFINED_AVATARS = [
  avatar1.src,
  avatar2.src,
  avatar3.src,
  avatar4.src,
  avatar5.src,
  avatar6.src,
  avatar7.src,
  avatar8.src,
  avatar9.src,
];

type UserStatus = 'factory' | 'office' | 'mission' | 'leave';

const STATUSES: Record<UserStatus, { color: string; overlayColor: string; hoverText: string }> = {
  factory: { color: 'bg-blue-500', overlayColor: 'bg-blue-500/10', hoverText: 'group-hover:text-blue-600' },
  office: { color: 'bg-green-500', overlayColor: 'bg-green-500/10', hoverText: 'group-hover:text-green-600' },
  mission: { color: 'bg-amber-500', overlayColor: 'bg-amber-500/10', hoverText: 'group-hover:text-amber-600' },
  leave: { color: 'bg-slate-400', overlayColor: 'bg-slate-400/10', hoverText: 'group-hover:text-slate-600' }
};

export function DashboardAvatar() {
  const locale = useLocale();
  const dir = locale === "fa" ? "rtl" : "ltr";
  const t = useTranslations('Dashboard');
  const { user, updateAvatar, logout } = useAuth();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(() => user?.avatar || null);
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [anchorEdge, setAnchorEdge] = React.useState<"left" | "right">("right");
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [status, setStatus] = React.useState<UserStatus>('office');
  const [statusExpanded, setStatusExpanded] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    // Clear photo from history/storage completely per user request
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("esp_auth_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.avatar) {
            delete parsed.avatar;
            localStorage.setItem("esp_auth_user", JSON.stringify(parsed));
          }
        }
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("esp_custom_avatar")) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const [liveBgColor, setLiveBgColor] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleAvatarColorChange = (e: any) => {
      if (e?.detail?.avatarColor) {
        setLiveBgColor(e.detail.avatarColor);
      }
    };
    window.addEventListener("esp_avatar_color_changed", handleAvatarColorChange);
    return () => window.removeEventListener("esp_avatar_color_changed", handleAvatarColorChange);
  }, []);

  if (!user) return null;

  const { colorId } = usePrimaryColor();
  const activeColorPreset = PRIMARY_COLORS.find(c => c.id === (user?.primaryColor || colorId));
  const avatarBgColor = liveBgColor || user?.avatarColor || activeColorPreset?.hex || "#3a86ff";

  const nameToUse = locale === 'fa' ? (user.fullNameFa || user.fullName) : (user.fullName || user.fullNameFa);
  const initial = (nameToUse || 'U').charAt(0).toUpperCase();
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const avatarButton = (
    <button
      ref={triggerRef}
      title=""
      className={cn(
        HEADER_ICON_BUTTON_CLASS,
        "p-0 group outline-none cursor-pointer transition-all relative",
        open && !isAdmin && "ring-2 ring-primary ring-offset-1 ring-offset-background",
        open && "hover:bg-transparent"
      )}
    >
      {open && isAdmin && (
        <span
          aria-hidden="true"
          className="absolute -inset-1 sm:-inset-[5px] rounded-full p-[2.5px] sm:p-[3px] bg-[conic-gradient(from_0deg,#ef4444,#f97316,#eab308,#22c55e,#06b6d4,#3b82f6,#a855f7,#ef4444)] pointer-events-none z-0 animate-in fade-in-0 zoom-in-95 duration-150"
        >
          <span className="block size-full rounded-full bg-background" />
        </span>
      )}
      <div className="relative z-10 size-[32px] sm:size-[36px] rounded-full flex items-center justify-center">
        <Avatar className="size-full rounded-full overflow-hidden">
          <AvatarFallback 
            style={{ backgroundColor: avatarBgColor }}
            className="text-xs sm:text-sm font-bold text-white transition-colors"
          >
            <span className={cn(locale === 'fa' && "-translate-y-0.5")}>{initial}</span>
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute bottom-0 end-0 size-2.5 sm:size-3 rounded-full border-2 border-background z-20 pointer-events-none",
            STATUSES[status].color
          )}
        />
      </div>
    </button>
  );

  return (
    <Popover open={open} onOpenChange={(val) => {
      if (val && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setAnchorEdge(rect.left < window.innerWidth / 2 ? "left" : "right");
      }
      setOpen(val);
      if (!val) {
        setStatusExpanded(false);
        setIsScrolled(false);
      }
    }}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              {avatarButton}
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8} className="flex flex-col items-start gap-1 py-1.5 px-3">
            <span className="font-semibold text-xs truncate max-w-[200px]">{nameToUse}</span>
            <span className="opacity-90 text-[11px] truncate max-w-[200px]" dir="ltr">{user.email || user.mobile}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <PopoverAnchor className={cn("fixed top-[calc(var(--header-height)+8px)] w-0 h-0 pointer-events-none", anchorEdge === "left" ? "left-3 sm:left-6" : "right-3 sm:right-6")} />
      
      <PopoverContent 
        className="relative w-[calc(100vw-24px)] max-w-[380px] sm:w-[380px] max-h-[calc(100dvh-var(--header-height)-1.25rem)] flex flex-col p-0 bg-popover rounded-[22px] sm:rounded-[26px] shadow-[0_4px_24px_rgba(0,0,0,0.12),_0_16px_40px_rgba(0,0,0,0.2)] border-border/40 z-[100] overflow-hidden" 
        align={anchorEdge === "left" ? (dir === "rtl" ? "end" : "start") : (dir === "rtl" ? "start" : "end")}
        side="bottom"
        sideOffset={0}
        collisionPadding={12}
      >
        {/* Sticky Header with centered User info on scroll & concentric Close Button */}
        <div 
          className={cn(
            "absolute top-0 inset-x-0 z-30 flex items-center h-[46px] sm:h-[50px] transition-colors duration-200 pointer-events-auto rounded-t-[22px] sm:rounded-t-[26px]",
            isScrolled 
              ? "bg-[#dfe7f3] dark:bg-popover/95 dark:backdrop-blur-md border-b border-border/50" 
              : "bg-popover border-b border-transparent"
          )}
        >
          {/* Mini User Summary (Centered in header: bigger avatar with ring + bigger email with simple fade animation) */}
          <div className="absolute inset-0 flex items-center justify-center px-12 pointer-events-none">
            <div className="flex items-center gap-2.5 max-w-full">
              {/* Avatar (Bigger + Ring: rainbow for admin, solid primary for others) */}
              <div 
                className={cn(
                  "transition-all duration-300 ease-out shrink-0 flex items-center justify-center",
                  isScrolled 
                    ? "opacity-100 scale-100 translate-y-0" 
                    : "opacity-0 scale-90 translate-y-2 pointer-events-none"
                )}
              >
                {isAdmin ? (
                  <div className="relative shrink-0 flex items-center justify-center p-[2px] rounded-full">
                    <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#ef4444,#f97316,#eab308,#22c55e,#06b6d4,#3b82f6,#a855f7,#ef4444)]" />
                    <div className="relative z-10 bg-white dark:bg-popover rounded-full p-[1px]">
                      <Avatar className="size-7 sm:size-7.5">
                        <AvatarFallback style={{ backgroundColor: avatarBgColor }} className="text-xs font-bold text-white">
                          <span>{initial}</span>
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                ) : (
                  <Avatar className="size-8 shrink-0 ring-2 ring-primary ring-offset-1 ring-offset-background border border-transparent">
                    <AvatarFallback style={{ backgroundColor: avatarBgColor }} className="text-xs font-bold text-white">
                      <span>{initial}</span>
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>

              {/* Email (Slightly bigger, single line, pure simple fade) */}
              <span 
                className={cn(
                  "text-sm font-semibold text-foreground truncate min-w-0 text-center transition-opacity duration-300 ease-out",
                  isScrolled 
                    ? "opacity-100" 
                    : "opacity-0 pointer-events-none"
                )} 
                dir="ltr"
              >
                {user.email || user.mobile}
              </span>
            </div>
          </div>

          {/* Concentric Close Button (nested fillet: R_inner = R_outer - d = 22-6=16, 26-6=20) */}
          <button 
            type="button"
            onClick={() => setOpen(false)} 
            className="absolute top-[6px] end-[6px] size-8.5 sm:size-9 rounded-[16px] sm:rounded-[20px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[#98c1d9]/30 transition-colors z-20"
            aria-label="Close"
          >
            <X className="size-4.5" />
          </button>
        </div>

        <ScrollArea 
          className="w-full flex-1 min-h-0 popup-scroll" 
          dir={dir} 
          type="auto"
          onViewportScroll={(e) => {
            setIsScrolled(e.currentTarget.scrollTop > 8);
          }}
        >
          <div className="flex flex-col w-full p-3 sm:p-4 pt-[50px] sm:pt-[54px]">

            <div className="segmented-list w-full">
              {/* Top Block (Avatar + Name) */}
              <div className={cn(
                "segmented-item no-hover-bg relative flex items-stretch w-full z-10 overflow-hidden", 
                getSegmentedAccordionHeaderClass(statusExpanded, { isTopRounded: true, fullCapsuleWhenClosed: true })
              )}>
                 {/* Avatar Container (Clickable for Profile) */}
                 <Link 
                   href="/dashboard/profile?tab=personal"
                   target="_blank"
                   onClick={() => setOpen(false)}
                   className="relative shrink-0 flex items-center justify-center p-4 outline-none group/avatar bg-transparent"
                 >
                   {/* GPU-accelerated instant hover layer */}
                   <span className="absolute inset-0 bg-[#98c1d9]/30 opacity-0 transition-opacity duration-100 ease-out group-hover/avatar:opacity-100 group-hover/avatar:duration-0 pointer-events-none" aria-hidden="true" />
                   
                   <div className="relative z-10 shrink-0 flex items-center justify-center p-1 rounded-full">
                     <div 
                       className={cn(
                         "absolute inset-0 rounded-full",
                         isAdmin 
                           ? "bg-[conic-gradient(from_0deg,#ef4444,#f97316,#eab308,#22c55e,#06b6d4,#3b82f6,#a855f7,#ef4444)] opacity-100" 
                           : "bg-primary opacity-100"
                       )} 
                     />
                     <div className="relative z-10 bg-white dark:bg-black rounded-full p-0.5">
                       <Avatar className="size-14 sm:size-16">
                         
                         <AvatarFallback style={{ backgroundColor: avatarBgColor }} className="text-xl sm:text-2xl font-bold text-white">
                           <span className={cn(locale === 'fa' && "-translate-y-0.5")}>{initial}</span>
                         </AvatarFallback>
                       </Avatar>
                     </div>
                     
                     {/* Edit Pencil Icon */}
                     <div className="absolute bottom-0 -end-1 z-20 size-7 bg-white dark:bg-black border border-border/50 rounded-full flex items-center justify-center text-muted-foreground group-hover/avatar:text-foreground group-hover/avatar:bg-muted shadow-sm transition-colors">
                       <Pencil className="size-3.5" />
                     </div>
                   </div>
                 </Link>

                 {/* Name & Email (Clickable for Status Expansion) */}
                 <button 
                   onClick={() => setStatusExpanded(!statusExpanded)}
                   className="group/btn relative flex flex-1 items-center justify-between text-start overflow-hidden w-full p-4 ps-2 outline-none bg-transparent"
                 >
                   {/* GPU-accelerated instant hover layer */}
                   <span className="absolute inset-0 bg-[#98c1d9]/30 opacity-0 transition-opacity duration-100 ease-out group-hover/btn:opacity-100 group-hover/btn:duration-0 pointer-events-none" aria-hidden="true" />
                   
                   <div className="relative z-10 flex flex-col items-start overflow-hidden w-full gap-0.5">
                     <h2 className="text-base sm:text-lg font-semibold truncate leading-tight w-full text-start">{nameToUse}</h2>
                     <div className="w-full flex justify-start overflow-hidden">
                       <span className="text-sm text-muted-foreground truncate text-left" dir="ltr">{user.email || user.mobile || ''}</span>
                     </div>
                   </div>
                   <div className="relative z-10 shrink-0 ms-1 p-1 rounded-full group-hover/btn:bg-black/5 dark:group-hover/btn:bg-white/10 transition-colors text-muted-foreground">
                     <ChevronDown className={cn("size-5 transition-transform duration-200", statusExpanded && "rotate-180")} />
                   </div>
                 </button>
              </div>

              {/* Expandable Status Selector & Sign Out */}
              <AnimatePresence>
                {statusExpanded && (
                  <motion.div 
                    initial={segmentedAccordionMotion.initial}
                    animate={segmentedAccordionMotion.animate}
                    exit={segmentedAccordionMotion.exit}
                    className="flex flex-col w-full gap-[2px] overflow-hidden"
                  >
                    {/* Tags Section (Separated block, showing popover background above and below) */}
                    <div className="flex items-center justify-between gap-1 sm:gap-1.5 py-2.5 sm:py-3 px-2 sm:px-4 segmented-item">
                      {(Object.entries(STATUSES) as [UserStatus, typeof STATUSES[UserStatus]][]).map(([key, meta]) => (
                        <button
                          key={key}
                          onClick={() => { setStatus(key); setStatusExpanded(false); }}
                          className={cn(
                            "group relative flex flex-1 flex-col items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-normal text-foreground/80 border outline-none",
                            status === key 
                              ? "bg-zinc-100 dark:bg-zinc-900 border-border/60 dark:border-zinc-800" 
                              : "bg-transparent border-transparent"
                          )}
                        >
                          {/* GPU-accelerated hover layer */}
                          {status !== key && (
                            <span className="absolute inset-0 rounded-xl bg-[#98c1d9]/30 opacity-0 group-hover:opacity-100 pointer-events-none" aria-hidden="true" />
                          )}
                          <span className={cn("relative z-10 size-2 sm:size-2.5 rounded-full shadow-sm", meta.color)} />
                          <span className={cn("relative z-10 truncate transition-colors text-[10.5px] sm:text-xs", status !== key && meta.hoverText)}>{t(`avatar.${key}`)}</span>
                        </button>
                      ))}
                    </div>

                    {/* Manage Account Button */}
                    <div className="segmented-item flex flex-col overflow-hidden">
                      <Link 
                         href="/dashboard/profile" 
                         target="_blank"
                         onClick={() => setOpen(false)}
                         className="relative flex items-center justify-start gap-4 px-6 py-4 text-sm font-medium w-full text-foreground/80 outline-none"
                      >
                         <User className="relative z-10 size-5 transition-colors" />
                         <span className="relative z-10 transition-colors">{t("avatar.userProfile")}</span>
                      </Link>
                    </div>

                    {/* Sign Out Button (Sharp flat top, rounded bottom) */}
                    <div className="segmented-item flex flex-col overflow-hidden rounded-b-[32px]">
                      <button 
                        type="button"
                        onClick={async () => {
                          setOpen(false);
                          await logout();
                          router.push('/login');
                        }}
                        className="relative flex items-center justify-start gap-4 px-6 py-4 text-sm font-medium w-full text-foreground/80 outline-none cursor-pointer"
                      >
                        <LogOut className="relative z-10 size-5 transition-colors" />
                        <span className="relative z-10 transition-colors">{t("avatar.logout")}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation Items (Dashboard & Admin Panel) */}
            <div className="segmented-list w-full mt-3">
              {/* Dashboard Button */}
              <div className={cn(
                "segmented-item flex flex-col overflow-hidden",
                user.role === 'admin' ? "rounded-t-[32px] rounded-b-[6px]" : "rounded-[32px]"
              )}>
                <Link 
                   href="/dashboard" 
                   target="_blank"
                   onClick={() => setOpen(false)}
                   className="relative flex items-center justify-start gap-4 px-6 py-4 text-sm font-medium w-full text-foreground/80 outline-none"
                >
                   <Home className="relative z-10 size-5 transition-colors" />
                   <span className="relative z-10 transition-colors">{t("avatar.dashboard")}</span>
                </Link>
              </div>

              {/* Admin Panel Button */}
              {user.role === 'admin' && (
                <div className="segmented-item flex flex-col overflow-hidden rounded-t-[6px] rounded-b-[32px]">
                  <Link 
                     href="/admin" 
                     target="_blank"
                     rel="noopener noreferrer"
                     onClick={() => setOpen(false)}
                     className="relative flex items-center justify-start gap-4 px-6 py-4 text-sm font-medium w-full text-foreground/80 outline-none"
                  >
                     <Settings className="relative z-10 size-5 transition-colors" />
                     <span className="relative z-10 transition-colors">{t("avatar.adminPanel")}</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground my-4">
               <Link href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">{t("avatar.privacy")}</Link>
               <span>•</span>
               <Link href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">{t("avatar.terms")}</Link>
            </div>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}


