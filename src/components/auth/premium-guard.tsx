"use client";

import React from "react";

export function PremiumGuard({ children }: { children: React.ReactNode }) {
  // Access restriction popup removed per user request
  return <>{children}</>;
}
