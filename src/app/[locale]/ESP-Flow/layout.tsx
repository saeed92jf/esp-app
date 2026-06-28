// src/app/[locale]/standards/layout.tsx
// Thin layout shell for the standards section.
// The FlowEditor fills the remaining viewport height (calc(100vh - header)),
// so we must NOT add extra padding or a container here.
import type { ReactNode } from "react";

export default function FlowLayout({ children }: { children: ReactNode }) {
  return (
    // overflow-hidden prevents the ReactFlow canvas from briefly growing the page.
    <div className="overflow-hidden">{children}</div>
  );
}
