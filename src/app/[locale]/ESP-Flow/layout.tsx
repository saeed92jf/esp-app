
import type { ReactNode } from "react";

export default function FlowLayout({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden">{children}</div>
  );
}
