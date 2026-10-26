"use client";

import React from "react";
import { Footer, type FooterProps } from "@/components/layout/footer";

export interface SearchFooterProps extends FooterProps {
  startOffsetClass?: string;
}

/**
 * Re-exports the unified Footer component with search start offset alignment.
 */
export function SearchFooter({ startOffsetClass, ...props }: SearchFooterProps) {
  return <Footer startOffsetClass={startOffsetClass} {...props} />;
}
