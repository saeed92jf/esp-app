// src/app/[locale]/standards/page.tsx
import type { Metadata } from "next";
import { FlowEditor } from "@/components/flow/FlowEditor";

export const metadata: Metadata = {
  title: "Standards Diagram",
  description:
    "Interactive equipment inspection standards diagram. " +
    "Browse, explore and edit the relationship between API, ASME, NACE and other standards.",
};

/**
 * Standards page – renders the fully interactive React Flow diagram editor.
 * The editor mounts client-side; this server component just sets metadata
 * and wraps the client boundary.
 */
export default function StandardsPage() {
  return <FlowEditor />;
}
