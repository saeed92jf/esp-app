"use client";

import { AccountPendingView } from "@core/auth-core";
import { Logo } from "@/components/brand/logo";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { Link } from "@/i18n/navigation";

export default function AccountPendingPage() {
  const { user, logout } = useAuth();

  return (
    <AccountPendingView
      user={user}
      onLogout={logout}
      onRefresh={async () => {
        if (typeof window !== "undefined") window.location.reload();
      }}
      Logo={Logo}
      supportEmail="ESP.Technical.Support@euroslotpars.com"
      Link={Link}
    />
  );
}
