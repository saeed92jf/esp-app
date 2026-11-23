"use client";

import { AccountRequestForm } from "@core/auth-core";
import { Logo } from "@/components/brand/logo";
import { Link } from "@/i18n/navigation";
import { api } from "@/services";

export default function AccountRequestPage() {
  return (
    <AccountRequestForm
      onRequestAccount={(data) => api.auth.requestAccount(data)}
      Logo={Logo}
      supportEmail="ESP.Technical.Support@euroslotpars.com"
      Link={Link}
    />
  );
}
