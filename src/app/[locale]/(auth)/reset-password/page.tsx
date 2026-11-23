"use client";

import { Suspense } from "react";
import { ResetPasswordForm } from "@core/auth-core";
import { Logo } from "@/components/brand/logo";
import { Link } from "@/i18n/navigation";
import { api } from "@/services";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm
        onResetPassword={(data) => api.auth.resetPassword(data)}
        Logo={Logo}
        Link={Link}
      />
    </Suspense>
  );
}
