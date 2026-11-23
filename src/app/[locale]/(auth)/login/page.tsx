"use client";

import { useAuth } from "@/modules/auth/hooks/use-auth";
import { LoginForm } from "@core/auth-core";
import { Logo } from "@/components/brand/logo";
import { Link, useRouter } from "@/i18n/navigation";

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  return (
    <LoginForm
      login={login}
      user={user}
      authLoading={authLoading}
      Logo={Logo}
      supportEmail="ESP.Technical.Support@euroslotpars.com"
      Link={Link}
      router={router}
    />
  );
}
