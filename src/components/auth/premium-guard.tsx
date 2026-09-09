"use client";

import { usePathname } from "@/i18n/navigation";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { NAVIGATION } from "@/config/navigation";
import { AuthModal } from "@/modules/auth/components/auth-modal";
import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

export function PremiumGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  // Find if current path is restricted
  const isRestricted = (() => {
    if (user) return false;

    // Check if the current pathname matches a non-free item in NAVIGATION
    const allItems = NAVIGATION.flatMap(group => group.items);
    const currentItem = allItems.find(item => pathname === item.href || pathname.startsWith(`${item.href}/`));
    
    if (currentItem && !currentItem.free) {
      return true;
    }

    // Also restrict the entire dashboard area if not authenticated
    if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
      return true;
    }

    return false;
  })();

  useEffect(() => {
    if (isRestricted) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [isRestricted]);

  const handleOpenChange = (open: boolean) => {
    setShowModal(open);
    if (!open && isRestricted) {
      // If they close the modal on a restricted page, kick them back to home
      router.push("/");
    }
  };

  if (isRestricted) {
    return (
      <div className="flex-1 flex flex-col min-h-[60vh] items-center justify-center relative">
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10" />
        <AuthModal open={showModal} onOpenChange={handleOpenChange} />
      </div>
    );
  }

  return <>{children}</>;
}
