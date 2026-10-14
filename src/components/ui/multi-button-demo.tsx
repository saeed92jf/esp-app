"use client";

import {
  CompactMultiButton,
  MultiButton,
  type MultiButtonItem,
} from "@/components/ui/multi-button";
import { Archive, Download, EllipsisVertical, Eye, Share2 } from "lucide-react";
import { useState } from "react";

const actionDefinitions = [
  { id: "review", icon: Eye, label: "Review" },
  { id: "download", icon: Download, label: "Download" },
  { id: "share", icon: Share2, label: "Share" },
  { id: "archive", icon: Archive, label: "Archive" },
] satisfies Omit<MultiButtonItem, "onClick">[];

export default function MultiButtonDemo() {
  const [selectedId, setSelectedId] = useState("review");

  const items = actionDefinitions.map((item) => ({
    ...item,
    onClick: () => {},
  }));
  const compactItems = actionDefinitions.map((item) => ({
    ...item,
    onClick: () => setSelectedId(item.id),
  }));

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8 py-16">
      <MultiButton
        items={items}
        highlightColor="var(--primary-foreground)"
        size="lg"
      />
      <CompactMultiButton
        items={compactItems}
        selectedId={selectedId}
        restIcon={EllipsisVertical}
        restAriaLabel="Open actions"
        highlightColor="var(--primary)"
        size="lg"
        variant="outline"
      />
    </div>
  );
}
