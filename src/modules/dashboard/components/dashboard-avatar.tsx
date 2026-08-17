'use client';

import * as React from 'react';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { useLocale, useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Upload, X, ChevronRight, ChevronLeft, Check, User } from 'lucide-react';
import { Link } from '@/i18n/navigation';
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

export function DashboardAvatar() {
  const locale = useLocale();
  const t = useTranslations('Dashboard');
  const { user, updateAvatar } = useAuth();
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [currentSlide, setCurrentSlide] = React.useState(0);
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative flex items-center justify-center p-1 rounded-full group cursor-pointer border-none bg-transparent outline-none ring-0">
          {/* Static rainbow border */}
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,theme(colors.red.500),theme(colors.orange.500),theme(colors.yellow.500),theme(colors.green.500),theme(colors.blue.500),theme(colors.indigo.500),theme(colors.purple.500),theme(colors.red.500))] opacity-75 group-hover:opacity-100 transition-opacity scale-110" />
          
          {/* Avatar container */}
          <div className="relative z-10 bg-background rounded-full p-[2px] scale-110 shadow-md">
            <Avatar className="size-16 sm:size-20 border-2 border-background">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={user.fullName} className="object-cover" />
              ) : null}
              <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-muted text-muted-foreground">{initial}</AvatarFallback>
            </Avatar>
          </div>
        </button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[320px] sm:w-[360px] p-4 rounded-xl shadow-lg border border-border/50" align="start">
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-center">{t("avatar.selectImage")}</h4>
          
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center justify-between w-full px-1 sm:px-2">
              <button 
                onClick={handlePrev}
                className="size-10 rounded-full bg-secondary/50 border border-border/50 shadow-sm flex items-center justify-center hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <ChevronLeft className="size-5 rtl:rotate-180" />
              </button>
              
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-inner flex-shrink-0 mx-2">
                <img 
                  src={PREDEFINED_AVATARS[currentSlide]} 
                  alt={`Avatar ${currentSlide + 1}`} 
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              </div>
              
              <button 
                onClick={handleNext}
                className="size-10 rounded-full bg-secondary/50 border border-border/50 shadow-sm flex items-center justify-center hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <ChevronRight className="size-5 rtl:rotate-180" />
              </button>
            </div>

          </div>

          <div className="flex flex-col gap-2">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            
            <div className="flex items-start justify-center gap-1 sm:gap-2">
              <button
                onClick={() => saveAvatar(PREDEFINED_AVATARS[currentSlide])}
                className="flex flex-col items-center justify-start gap-1 flex-1 text-[10px] sm:text-[11px] py-1.5 px-1 rounded hover:bg-primary/5 text-primary transition-colors text-center"
              >
                <div className="p-1.5 rounded-full bg-primary/10 mb-0.5">
                  <Check className="size-3.5" />
                </div>
                {t("avatar.selectThis")}
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-start gap-1 flex-1 text-[10px] sm:text-[11px] py-1.5 px-1 rounded hover:bg-secondary/80 text-secondary-foreground transition-colors text-center"
              >
                <div className="p-1.5 rounded-full bg-secondary mb-0.5">
                  <Upload className="size-3.5" />
                </div>
                {t("avatar.uploadNew")}
              </button>
              <button 
                onClick={() => saveAvatar(null)}
                className="flex flex-col items-center justify-start gap-1 flex-1 text-[10px] sm:text-[11px] py-1.5 px-1 rounded hover:bg-destructive/5 text-destructive transition-colors text-center"
              >
                <div className="p-1.5 rounded-full bg-destructive/10 mb-0.5">
                  <X className="size-3.5" />
                </div>
                {t("avatar.noImage")}
              </button>
            </div>

            <div className="h-px w-full bg-border/50 my-1" />

            <Link 
              href="/dashboard/profile"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm"
            >
              <User className="size-4" />
              {t("avatar.userProfile", { defaultValue: "اطلاعات کاربری" })}
            </Link>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
