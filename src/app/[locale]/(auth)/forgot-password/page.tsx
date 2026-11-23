"use client";

import { ForgotPasswordForm } from "@core/auth-core";
import { Logo } from "@/components/brand/logo";
import { Link } from "@/i18n/navigation";
import { api } from "@/services";

export default function ForgotPasswordPage() {
  return (
    <ForgotPasswordForm
      onForgotPassword={(email) => api.auth.forgotPassword(email)}
      Logo={Logo}
      Link={Link}
    />
  );
}
