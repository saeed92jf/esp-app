// src/app/diagram/page.tsx
// Next.js page that hosts the diagram editor.
// Handles save/load persistence via localStorage as a simple demo.

"use client";

import { DiagramEditor } from "@/modules/claude-flow/components/DiagramEditor";
export default function DiagramPage() {
  return <DiagramEditor height="100dvh" />;
}
