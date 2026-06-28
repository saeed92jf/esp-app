// src/app/[locale]/standards/page.tsx
import type { Metadata } from "next";
import { FlowEditor } from "@/components/flow-general/FlowEditor";

export const metadata: Metadata = {
  title: "ESP Flow",
};

/**
 * Standards page – renders the fully interactive React Flow diagram editor.
 * The editor mounts client-side; this server component just sets metadata
 * and wraps the client boundary.
 */
export default function FlowPage() {
  return <FlowEditor />;
}
