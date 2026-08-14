'use client';

import * as React from 'react';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PREDEFINED_AVATARS = [
  // Male Manager (Suit)
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Manager1&clothing=blazerAndShirt',
  // Female Manager (Blazer)
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Manager2&clothing=blazerAndSweater',
  // Male Engineer (Overall)
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Eng1&clothing=overall',
  // Female Engineer (Overall)
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Eng2&clothing=overall',
  // Staff/Worker
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Staff1&clothing=shirtCrewNeck',
  // Support/Tech
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Support1&clothing=hoodie'
];

export function DashboardAvatar() {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`esp_custom_avatar_${user.id}`);
      if (saved) {
        setAvatarUrl(saved);
      } else if (user.avatar) {
        setAvatarUrl(user.avatar);
      }
    }
  }, [user]);

  const saveAvatar = (url: string | null) => {
    setAvatarUrl(url);
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

  const initial = (user.fullNameFa || user.fullName || 'U').charAt(0).toUpperCase();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative flex items-center justify-center p-1 rounded-full group cursor-pointer border-none bg-transparent outline-none ring-0">
          {/* Static rainbow border */}
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,theme(colors.red.500),theme(colors.orange.500),theme(colors.yellow.500),theme(colors.green.500),theme(colors.blue.500),theme(colors.indigo.500),theme(colors.purple.500),theme(colors.red.500))] opacity-75 group-hover:opacity-100 transition-opacity" />
          
          {/* Avatar container */}
          <div className="relative z-10 bg-background rounded-full p-[2px]">
            <Avatar className="size-14 sm:size-16 border-2 border-background">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={user.fullName} className="object-cover" />
              ) : null}
              <AvatarFallback className="text-xl sm:text-2xl font-bold bg-muted text-muted-foreground">{initial}</AvatarFallback>
            </Avatar>
          </div>
        </button>
      </PopoverTrigger>
      
      <PopoverContent className="w-64 p-4 rounded-xl shadow-lg border border-border/50" align="start">
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-center">انتخاب تصویر پروفایل</h4>
          
          <div className="grid grid-cols-3 gap-2">
            {PREDEFINED_AVATARS.map((url, i) => (
              <button
                key={i}
                onClick={() => saveAvatar(url)}
                className="rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-colors focus:outline-none"
              >
                <img src={url} alt={`Avatar ${i+1}`} className="w-full h-auto bg-muted/30" />
              </button>
            ))}
          </div>

          <div className="h-px w-full bg-border/50 my-2" />

          <div className="flex flex-col gap-2">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 w-full text-sm py-2 rounded-lg bg-secondary/50 hover:bg-secondary text-secondary-foreground transition-colors"
            >
              <Upload className="size-4" />
              آپلود تصویر جدید
            </button>
            <button 
              onClick={() => saveAvatar(null)}
              className="flex items-center justify-center gap-2 w-full text-sm py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
            >
              <X className="size-4" />
              بدون تصویر (حرف اول نام)
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
