import type { ReactNode } from "react";

// Inner layout for the dashboard area (no <html>/<body> here)
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col flex-1 w-full min-h-full">
      <section className="flex-1 flex flex-col w-full min-h-full">{children}</section>
    </div>
  );
}
