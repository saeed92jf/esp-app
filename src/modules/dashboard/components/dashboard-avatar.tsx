'use client';

import * as React from 'react';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { useLocale, useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Upload, X, ChevronRight, ChevronLeft, Check, User, LogOut, Pencil, ChevronDown, Circle, Home, Settings, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { getRoleGradient, getRoleGlowShadow } from '@/lib/role-avatar';
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
  const { colorId } = usePrimaryColor();
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
    const handleAvatarChange = (e: any) => {
      setAvatarUrl(e?.detail?.avatar ?? null);
    };
    window.addEventListener("esp_avatar_changed", handleAvatarChange);
    return () => window.removeEventListener("esp_avatar_changed", handleAvatarChange);
  }, []);

  React.useEffect(() => {
    if (user?.avatar !== undefined) {
      setAvatarUrl(user.avatar || null);
    }
  }, [user?.avatar]);

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

  const activeColorPreset = PRIMARY_COLORS.find(c => c.id === (user?.primaryColor || colorId));
  const avatarBgColor = liveBgColor || user?.avatarColor || activeColorPreset?.hex || "#3a86ff";

  const nameToUse = locale === 'fa' 
    ? (user.fullNameFa || user.name || user.fullName || '') 
    : (user.fullName || user.name || user.fullNameFa || '');
  const initial = (nameToUse || 'U').charAt(0).toUpperCase();
  const isSaeed = Boolean(
    user?.id === 'u-saeed' ||
    user?.id === 'usr_9801' ||
    (user?.email && (user.email.toLowerCase().includes('jalili') || user.email.toLowerCase() === 's.jalilifard@euroslotpars.com' || user.email.toLowerCase() === 'saeed@euroslotpars.com') && !user.email.toLowerCase().includes('saeedkhani'))
  );
  const effectiveRole = (isSaeed ? 'superadmin' : (user?.role || 'user')).toLowerCase();

  const getRoleBadge = (roleKey: string) => {
    switch (roleKey) {
      case 'superadmin':
        return {
          label: locale === 'fa' ? 'سوپر ادمین' : 'Super Admin',
          className: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/35 font-bold',
        };
      case 'admin':
        return {
          label: locale === 'fa' ? 'مدیر ارشد سامانه' : 'System Admin',
          className: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/35 font-bold',
        };
      case 'dept_admin':
      case 'deptadmin':
        return {
          label: locale === 'fa' ? 'ادمین دپارتمان' : 'Department Admin',
          className: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-semibold',
        };
      case 'office_admin':
      case 'officeadmin':
        return {
          label: locale === 'fa' ? 'ادمین اداری' : 'Office Admin',
          className: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30 font-semibold',
        };
      case 'manager':
        return {
          label: locale === 'fa' ? 'مدیر واحد' : 'Department Manager',
          className: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 font-semibold',
        };
      case 'engineer':
        return {
          label: locale === 'fa' ? 'مهندس فنی' : 'Technical Engineer',
          className: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30 font-semibold',
        };
      case 'staff':
        return {
          label: locale === 'fa' ? 'پرسنل سازمانی' : 'Corporate Staff',
          className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold',
        };
      case 'customer':
        return {
          label: locale === 'fa' ? 'کارفرما / مشتری' : 'Client / Customer',
          className: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold',
        };
      default:
        return {
          label: locale === 'fa' ? 'کاربر سامانه' : 'Standard User',
          className: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30 font-medium',
        };
    }
  };

  const roleBadge = getRoleBadge(effectiveRole);
  const isSuperAdmin = effectiveRole === 'superadmin';
  const isAdmin = effectiveRole === 'admin';

  const photoCandidate = avatarUrl || user?.avatar;
  const hasValidPhoto = Boolean(
    (user as any)?.avatarMode !== 'initials' &&
    photoCandidate &&
    !photoCandidate.includes('unsplash.com') &&
    !photoCandidate.includes('saeed-jalili-fard') &&
    !photoCandidate.includes('/team/')
  );

  const avatarButton = (
    <button
      ref={triggerRef}
      title=""
      className={cn(
        HEADER_ICON_BUTTON_CLASS,
        "p-0 group outline-none cursor-pointer transition-all relative",
        open && "hover:bg-transparent"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute -inset-1 sm:-inset-[4.5px] rounded-full p-[2.5px] sm:p-[3px] pointer-events-none z-0 transition-all",
          getRoleGradient(user?.role),
          getRoleGlowShadow(user?.role),
          open ? "opacity-100 scale-105" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <span className="block size-full rounded-full bg-background" />
      </span>
      <div className="relative z-10 size-[32px] sm:size-[36px] rounded-full flex items-center justify-center">
        <Avatar
          key={avatarUrl || user?.avatar || "avatar-btn"}
          className="size-full rounded-full overflow-hidden"
          style={{ backgroundColor: (user as any)?.avatarBgColor || "transparent" }}
        >
          {hasValidPhoto ? (
            <AvatarImage
              src={photoCandidate!}
              alt={nameToUse}
              className="size-full object-cover"
            />
          ) : (
            <AvatarFallback 
              style={{ backgroundColor: avatarBgColor }}
              className="text-xs sm:text-sm font-bold text-white transition-colors"
            >
              <span className={cn(locale === 'fa' && "-translate-y-0.5")}>{initial}</span>
            </AvatarFallback>
          )}
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
      
      <PopoverAnchor className={cn("fixed top-[calc(var(--header-height,64px)+8px)] w-0 h-0 pointer-events-none", anchorEdge === "left" ? "left-3 sm:left-6" : "right-3 sm:right-6")} />
      
      <PopoverContent 
        style={{
          maxHeight: 'min(540px, var(--radix-popover-content-available-height, calc(100dvh - var(--header-height, 64px) - 1.25rem)), calc(100dvh - var(--header-height, 64px) - 1.25rem))',
        }}
        className="relative w-[calc(100vw-24px)] max-w-[calc(100vw-24px)] sm:w-[380px] sm:max-w-[380px] max-h-[min(540px,calc(100dvh-var(--header-height,64px)-1.25rem))] flex flex-col p-0 bg-popover rounded-[22px] sm:rounded-[26px] shadow-[0_4px_24px_rgba(0,0,0,0.12),_0_16px_40px_rgba(0,0,0,0.2)] border border-border/40 z-[100] overflow-hidden box-border" 
        align={anchorEdge === "left" ? "start" : "end"}
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
                <div className="relative shrink-0 flex items-center justify-center p-[2px] rounded-full">
                  <div className={cn(
                    "absolute inset-0 rounded-full",
                    getRoleGradient(user?.role),
                    getRoleGlowShadow(user?.role)
                  )} />
                  <div className="relative z-10 bg-white dark:bg-popover rounded-full p-[1px]">
                    <Avatar
                      key={avatarUrl || user?.avatar || "avatar-scrolled"}
                      className="size-7 sm:size-7.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: (user as any)?.avatarBgColor || "transparent" }}
                    >
                      {hasValidPhoto ? (
                        <AvatarImage
                          src={photoCandidate!}
                          alt={nameToUse}
                          className="size-full object-cover rounded-full"
                        />
                      ) : (
                        <AvatarFallback style={{ backgroundColor: avatarBgColor }} className="text-xs font-bold text-white">
                          <span>{initial}</span>
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                </div>
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
          <Button 
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)} 
            className="absolute top-[6px] end-[6px] size-8.5 sm:size-9 rounded-[16px] sm:rounded-[20px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors z-20 cursor-pointer"
            aria-label="Close"
          >
            <X className="size-4.5" />
          </Button>
        </div>

        <ScrollArea 
          className="w-full max-w-full flex-1 min-h-0 overflow-x-hidden popup-scroll [&_[data-slot=scroll-area-viewport]>div]:!block [&_[data-slot=scroll-area-viewport]>div]:!w-full [&_[data-slot=scroll-area-viewport]>div]:!max-w-full [&_[data-slot=scroll-area-viewport]>div]:!min-w-0 [&_[data-radix-scroll-area-viewport]>div]:!block [&_[data-radix-scroll-area-viewport]>div]:!w-full [&_[data-radix-scroll-area-viewport]>div]:!max-w-full [&_[data-radix-scroll-area-viewport]>div]:!min-w-0" 
          dir={dir} 
          type="auto"
          onViewportScroll={(e) => {
            setIsScrolled(e.currentTarget.scrollTop > 8);
          }}
        >
          <div className="flex flex-col w-full max-w-full min-w-0 box-border px-3.5 sm:px-4 pt-[54px] sm:pt-[58px] pb-3.5 sm:pb-4">

            <div className="segmented-list w-full">
              {/* Top Block (Avatar + Name) */}
              <div className={cn(
                "segmented-item no-hover-bg relative flex items-stretch w-full z-10 overflow-hidden", 
                getSegmentedAccordionHeaderClass(statusExpanded, { isTopRounded: true, fullCapsuleWhenClosed: true })
              )}>
                 {/* Avatar Container (Clickable for Profile) */}
                 <Link 
                   href="/profile?tab=personal"
                   target="_blank"
                   onClick={() => setOpen(false)}
                   className="relative shrink-0 flex items-center justify-center p-4 outline-none group/avatar bg-transparent"
                 >
                   {/* GPU-accelerated instant hover layer */}
                   <span className="absolute inset-0 bg-accent opacity-0 transition-opacity duration-100 ease-out group-hover/avatar:opacity-100 group-hover/avatar:duration-0 pointer-events-none" aria-hidden="true" />
                   
                   <div className="relative z-10 shrink-0 flex items-center justify-center p-1 rounded-full">
                     <div 
                       className={cn(
                         "absolute inset-0 rounded-full",
                         getRoleGradient(user?.role), getRoleGlowShadow(user?.role)
                       )} 
                     />
                     <div className="relative z-10 bg-white dark:bg-black rounded-full p-0.5">
                       <Avatar
                         key={avatarUrl || user?.avatar || "popover-avatar"}
                         className="size-14 sm:size-16 rounded-full overflow-hidden"
                         style={{ backgroundColor: (user as any)?.avatarBgColor || "transparent" }}
                       >
                         {hasValidPhoto ? (
                           <AvatarImage
                             src={photoCandidate!}
                             alt={nameToUse}
                             className="size-full object-cover rounded-full"
                           />
                         ) : (
                           <AvatarFallback style={{ backgroundColor: avatarBgColor }} className="text-xl sm:text-2xl font-bold text-white">
                             <span className={cn(locale === 'fa' && "-translate-y-0.5")}>{initial}</span>
                           </AvatarFallback>
                         )}
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
                   <span className="absolute inset-0 bg-accent opacity-0 transition-opacity duration-100 ease-out group-hover/btn:opacity-100 group-hover/btn:duration-0 pointer-events-none" aria-hidden="true" />
                   
                   <div className="relative z-10 flex flex-col items-start overflow-hidden w-full gap-1">
                     <h2 className="text-base sm:text-lg font-semibold truncate leading-tight w-full text-start">{nameToUse}</h2>
                     <div className="w-full flex justify-start overflow-hidden">
                       <span className="text-sm text-muted-foreground truncate text-start" dir="ltr">{user.email || user.mobile || ''}</span>
                     </div>
                     <div className="w-full flex items-center justify-start mt-0.5 overflow-hidden">
                       <span
                         className={cn(
                           "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] border shadow-2xs shrink-0 select-none",
                           roleBadge.className
                         )}
                       >
                         <ShieldCheck size={11} className="stroke-[2.2] shrink-0" />
                         <span>{roleBadge.label}</span>
                       </span>
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
                    {/* Manage Account Button */}
                    <div className="segmented-item group flex flex-col overflow-hidden rounded-t-[6px] rounded-b-[6px]">
                      <Link 
                         href="/dashboard/profile" 
                         onClick={() => setOpen(false)}
                         className="relative flex items-center justify-start gap-4 px-6 py-4 text-sm font-medium w-full text-foreground/80 group-hover:text-foreground outline-none transition-colors"
                      >
                         <User className="relative z-10 size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                         <span className="relative z-10 transition-colors">{t("avatar.userProfile")}</span>
                      </Link>
                    </div>

                    {/* Sign Out Button (Sharp flat top, rounded bottom) */}
                    <div className="segmented-item group flex flex-col overflow-hidden rounded-t-[6px] rounded-b-[32px]">
                      <button 
                        type="button"
                        onClick={async () => {
                          setOpen(false);
                          await logout();
                          router.push('/login');
                        }}
                        className="relative flex items-center justify-start gap-4 px-6 py-4 text-sm font-medium w-full text-foreground/80 group-hover:text-foreground outline-none cursor-pointer transition-colors"
                      >
                        <LogOut className="relative z-10 size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
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
                "segmented-item group flex flex-col overflow-hidden",
                Boolean(user?.role && ['superadmin', 'admin', 'dept_admin', 'office_admin'].includes(user.role)) ? "rounded-t-[32px] rounded-b-[6px]" : "rounded-[32px]"
              )}>
                <Link 
                   href="/dashboard" 
                   target="_blank"
                   onClick={() => setOpen(false)}
                   className="relative flex items-center justify-start gap-4 px-6 py-4 text-sm font-medium w-full text-foreground/80 group-hover:text-foreground outline-none transition-colors"
                >
                   <Home className="relative z-10 size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                   <span className="relative z-10 transition-colors">{t("avatar.dashboard")}</span>
                </Link>
              </div>

              {/* Admin Panel Button */}
              {Boolean(user?.role && ['superadmin', 'admin', 'dept_admin', 'office_admin'].includes(user.role)) && (
                <div className="segmented-item group flex flex-col overflow-hidden rounded-t-[6px] rounded-b-[32px]">
                  <Link 
                     href="/admin" 
                     target="_blank"
                     rel="noopener noreferrer"
                     onClick={() => setOpen(false)}
                     className="relative flex items-center justify-start gap-4 px-6 py-4 text-sm font-medium w-full text-foreground/80 group-hover:text-foreground outline-none transition-colors"
                  >
                     <Settings className="relative z-10 size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                     <span className="relative z-10 transition-colors">{t("avatar.adminPanel")}</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground my-4">
               <Link href="#" className="text-primary hover:opacity-80 transition-opacity">{t("avatar.privacy")}</Link>
               <span>•</span>
               <Link href="#" className="text-primary hover:opacity-80 transition-opacity">{t("avatar.terms")}</Link>
            </div>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}


