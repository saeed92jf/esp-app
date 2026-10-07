'use client';

import * as React from 'react';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { useLocale, useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from '@/components/ui/popover';
import { Upload, X, ChevronRight, ChevronLeft, Check, User, LogOut, Pencil, ChevronDown, Circle, Home, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [anchorEdge, setAnchorEdge] = React.useState<"left" | "right">("right");
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [status, setStatus] = React.useState<UserStatus>('office');
  const [statusExpanded, setStatusExpanded] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (user) {
      setAvatarUrl(user.avatar || null);
    }
  }, [user?.avatar]);

  const saveAvatar = (url: string | null) => {
    setAvatarUrl(url);
    updateAvatar(url);
    if (user?.id) {
      if (url) {
        localStorage.setItem(`esp_custom_avatar_${user.id}`, url);
      } else {
        localStorage.removeItem(`esp_custom_avatar_${user.id}`);
      }
    }
    setOpen(false);
    toast.success('تصویر پروفایل به‌روز شد');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        saveAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return null;

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? PREDEFINED_AVATARS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === PREDEFINED_AVATARS.length - 1 ? 0 : prev + 1));
  };

  const nameToUse = locale === 'fa' ? (user.fullNameFa || user.fullName) : (user.fullName || user.fullNameFa);
  const initial = (nameToUse || 'U').charAt(0).toUpperCase();

  const avatarButton = (
    <button ref={triggerRef} className={cn(
      "relative flex items-center justify-center rounded-full group outline-none cursor-pointer transition-all",
      "ring-[1.5px] ring-offset-[1.5px] ring-offset-background",
      open ? "ring-primary" : "ring-primary/40 hover:ring-primary/80"
    )}>
      <div className="relative z-10 bg-background rounded-full shadow-sm">
        <Avatar className="size-7 sm:size-9">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={user.fullName} className="object-cover" />
          ) : null}
          <AvatarFallback className="text-sm sm:text-base font-bold bg-zinc-800 dark:bg-zinc-700 text-white">
            <span className={cn(locale === 'fa' && "-translate-y-0.5")}>{initial}</span>
          </AvatarFallback>
        </Avatar>
        <div className={cn("absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border-[1.5px] border-background z-20", STATUSES[status].color)} />
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
      if (!val) setStatusExpanded(false);
    }}>
      <PopoverTrigger asChild>
        {avatarButton}
      </PopoverTrigger>
      
      <PopoverAnchor className={cn("fixed top-[72px] w-0 h-0 pointer-events-none", anchorEdge === "left" ? "left-4 sm:left-6" : "right-4 sm:right-6")} />
      
      <PopoverContent 
        className="w-[calc(100vw-32px)] sm:w-[380px] p-3 sm:p-4 bg-popover rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.12),_0_16px_40px_rgba(0,0,0,0.2)] border-border/40 z-[100]" 
        align={anchorEdge === "left" ? (dir === "rtl" ? "end" : "start") : (dir === "rtl" ? "start" : "end")}
        side="bottom"
        sideOffset={0}
        collisionPadding={16}
      >
        <div className="flex flex-col w-full">
          
          {/* Header (Close button) */}
          <div className="flex items-center justify-end px-3 pt-1 pb-1">
             <button 
               onClick={() => setOpen(false)} 
               className="p-1.5 rounded-full hover:bg-[#98c1d9]/30 text-muted-foreground hover:text-foreground transition-colors"
             >
               <X className="size-5" />
             </button>
          </div>

          <div className="segmented-list w-full">
            {/* Top Block (Avatar + Name) */}
            <div className={cn(
              "segmented-item no-hover-bg relative flex items-stretch w-full z-10 transition-all duration-300", 
              statusExpanded ? "rounded-t-[32px] rounded-b-[6px]" : "rounded-[32px]"
            )}>
               {/* Avatar Container (Clickable for Profile) */}
               <Link 
                 href="/dashboard/profile?tab=personal"
                 target="_blank"
                 onClick={() => setOpen(false)}
                 title={t("avatar.userProfile") || "ویرایش پروفایل"}
                 className={cn(
                   "relative shrink-0 flex items-center justify-center p-4 outline-none group/avatar",
                   statusExpanded ? "rounded-ss-[32px] rounded-es-[6px] rounded-e-none" : "rounded-s-[32px] rounded-e-none"
                 )}
               >
                 {/* GPU-accelerated hover layer */}
                 <span className={cn(
                   "absolute inset-0 bg-[#98c1d9]/30 opacity-0 transition-opacity duration-700 group-hover/avatar:opacity-100 group-hover/avatar:duration-[50ms] pointer-events-none",
                   statusExpanded ? "rounded-ss-[32px] rounded-es-[6px] rounded-e-none" : "rounded-s-[32px] rounded-e-none"
                 )} aria-hidden="true" />
                 
                 <div className="relative z-10 shrink-0 flex items-center justify-center p-1 rounded-full">
                   <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,theme(colors.red.500),theme(colors.orange.500),theme(colors.yellow.500),theme(colors.green.500),theme(colors.blue.500),theme(colors.indigo.500),theme(colors.purple.500),theme(colors.red.500))] opacity-90" />
                   <div className="relative z-10 bg-background rounded-full p-0.5">
                     <Avatar className="size-14 sm:size-16">
                       {avatarUrl ? (
                         <AvatarImage src={avatarUrl} alt={user.fullName} className="object-cover" />
                       ) : null}
                       <AvatarFallback className="text-xl sm:text-2xl font-bold bg-zinc-800 dark:bg-zinc-700 text-white">
                         <span className={cn(locale === 'fa' && "-translate-y-0.5")}>{initial}</span>
                       </AvatarFallback>
                     </Avatar>
                   </div>
                   
                   {/* Edit Pencil Icon */}
                   <div className="absolute bottom-0 -end-1 z-20 size-7 bg-background border border-border/50 rounded-full flex items-center justify-center text-muted-foreground group-hover/avatar:text-foreground group-hover/avatar:bg-muted shadow-sm transition-colors">
                     <Pencil className="size-3.5" />
                   </div>
                 </div>
               </Link>

               {/* Name & Email (Clickable for Status Expansion) */}
               <button 
                 onClick={() => setStatusExpanded(!statusExpanded)}
                 className={cn(
                   "group/btn relative flex flex-1 items-center justify-between text-start overflow-hidden w-full p-4 ps-2 outline-none",
                   statusExpanded ? "rounded-se-[32px] rounded-ee-[6px] rounded-s-none" : "rounded-e-[32px] rounded-s-none"
                 )}
               >
                 {/* GPU-accelerated hover layer */}
                 <span className={cn(
                   "absolute inset-0 bg-[#98c1d9]/30 opacity-0 transition-opacity duration-700 group-hover/btn:opacity-100 group-hover/btn:duration-[50ms] pointer-events-none",
                   statusExpanded ? "rounded-se-[32px] rounded-ee-[6px] rounded-s-none" : "rounded-e-[32px] rounded-s-none"
                 )} aria-hidden="true" />
                 
                 <div className="relative z-10 flex flex-col items-start overflow-hidden w-full gap-0.5">
                   <h2 className="text-base sm:text-lg font-semibold truncate leading-tight w-full text-start">{nameToUse}</h2>
                   <div className="w-full flex justify-start overflow-hidden">
                     <span className="text-sm text-muted-foreground truncate text-left" dir="ltr">{user.email || user.mobile || ''}</span>
                   </div>
                 </div>
                 <div className="relative z-10 shrink-0 ms-1 p-1 rounded-full group-hover/btn:bg-background/80 transition-colors text-muted-foreground">
                   <ChevronDown className={cn("size-5 transition-transform duration-200", statusExpanded && "rotate-180")} />
                 </div>
               </button>
            </div>

            {/* Expandable Status Selector & Sign Out */}
            <AnimatePresence>
              {statusExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="flex flex-col w-full gap-[2px] overflow-hidden"
                >
                  {/* Tags Section (Separated block, showing popover background above and below) */}
                  <div className="flex items-center justify-between gap-1.5 py-3 px-4 segmented-item">
                    {(Object.entries(STATUSES) as [UserStatus, typeof STATUSES[UserStatus]][]).map(([key, meta]) => (
                      <button
                        key={key}
                        onClick={() => { setStatus(key); setStatusExpanded(false); }}
                        className={cn(
                          "group relative flex flex-1 flex-col items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-normal text-foreground/80 border outline-none",
                          status === key 
                            ? "bg-muted border-border/40" 
                            : "bg-transparent border-transparent"
                        )}
                      >
                        {/* GPU-accelerated hover layer */}
                        {status !== key && (
                          <span className="absolute inset-0 rounded-xl bg-[#98c1d9]/30 opacity-0 group-hover:opacity-100 pointer-events-none" aria-hidden="true" />
                        )}
                        <span className={cn("relative z-10 size-2.5 rounded-full shadow-sm", meta.color)} />
                        <span className={cn("relative z-10 truncate transition-colors", status !== key && meta.hoverText)}>{t(`avatar.${key}`)}</span>
                      </button>
                    ))}
                  </div>

                   {/* Dashboard Button */}
                  <div className="segmented-item flex flex-col overflow-hidden">
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
                    <div className="segmented-item flex flex-col overflow-hidden">
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

          {/* Manage Account Card */}
          <div className="segmented-item flex flex-col overflow-hidden mt-3 rounded-[32px]">
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

          {/* Footer */}
          <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground my-4">
             <Link href="#" className="hover:text-foreground">{t("avatar.privacy")}</Link>
             <span>•</span>
             <Link href="#" className="hover:text-foreground">{t("avatar.terms")}</Link>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}


