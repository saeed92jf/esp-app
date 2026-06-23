import type { ReactNode } from "react";

interface StandardsLayoutProps {
  children: ReactNode;
}

/**
 * Standards page layout.
 * The diagram itself is LTR because the reference layout depends on absolute x/y positioning.
 */
export default function StandardsLayout({ children }: StandardsLayoutProps) {
  return (
    <section className="w-full overflow-x-hidden bg-white" dir="ltr">
      {children}
    </section>
  );
}
