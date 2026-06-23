import type { ReactNode } from "react";

// Inner layout for the dashboard area (no <html>/<body> here)
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-6">
      <section className="flex-1">{children}</section>
    </div>
  );
}
