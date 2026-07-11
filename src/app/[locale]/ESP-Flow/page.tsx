import type { Metadata } from "next";
import { DiagramEditor } from "@/modules/claude-flow/components/DiagramEditor";


export const metadata: Metadata = {
  title: "ESP-Flow Diagram",
  description:
    "Interactive equipment inspection diagram. " +
    "Browse, explore and edit the relationship between nodes.",
};


export default function FlowPage() {
  return <DiagramEditor />;
}
