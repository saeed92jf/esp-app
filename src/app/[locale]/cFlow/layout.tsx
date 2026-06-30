import type { ReactNode } from "react";

export default function ClaudeFlow({ children }: { children: ReactNode }) {
  return (
    // overflow-hidden prevents the ReactFlow canvas from briefly growing the page.
    <div className="overflow-hidden">{children}</div>
  );
}
