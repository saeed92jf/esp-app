// src/components/flow-general/FlowEditorPage.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowProvider,
  ConnectionLineType,
  Panel,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { DynamicNode } from "./nodes/DynamicNode";
import { DynamicEdge } from "./edges/DynamicEdge";
import {
  registerConnectionType,
  updateConnectionType,
  hasConnectionType,
} from "./utils/registry";
import type {
  FlowNode,
  FlowEdge,
  CustomNodeType,
  CustomConnectionType,
  DynamicEdgeData,
} from "./types";

// ══════════════════════════════════════════════════════════════════════════════
// PALETTE
// ══════════════════════════════════════════════════════════════════════════════

const NODE_PALETTE: CustomNodeType[] = [
  {
    id: "start",
    label: "شروع",
    shape: "circle",
    color: "#22c55e",
    borderColor: "#16a34a",
    borderWidth: 2,
    textColor: "#fff",
    width: 80,
    height: 80,
    handles: [{ id: "out", type: "source", position: "bottom" }],
  },
  {
    id: "process",
    label: "فرآیند",
    shape: "rounded-rectangle",
    color: "#3b82f6",
    borderColor: "#1d4ed8",
    borderWidth: 2,
    textColor: "#fff",
    width: 160,
    height: 60,
    handles: [
      { id: "in", type: "target", position: "top" },
      { id: "out", type: "source", position: "bottom" },
    ],
  },
  {
    id: "decision",
    label: "تصمیم",
    shape: "diamond",
    color: "#f59e0b",
    borderColor: "#d97706",
    borderWidth: 2,
    textColor: "#1f2937",
    width: 140,
    height: 100,
    handles: [
      { id: "in", type: "target", position: "top" },
      { id: "yes", type: "source", position: "right" },
      { id: "no", type: "source", position: "bottom" },
    ],
  },
  {
    id: "end",
    label: "پایان",
    shape: "circle",
    color: "#ef4444",
    borderColor: "#dc2626",
    borderWidth: 2,
    textColor: "#fff",
    width: 80,
    height: 80,
    handles: [{ id: "in", type: "target", position: "top" }],
  },
  {
    id: "data",
    label: "داده",
    shape: "parallelogram",
    color: "#8b5cf6",
    borderColor: "#7c3aed",
    borderWidth: 2,
    textColor: "#fff",
    width: 150,
    height: 60,
    handles: [
      { id: "in", type: "target", position: "top" },
      { id: "out", type: "source", position: "bottom" },
    ],
  },
  {
    id: "db",
    label: "پایگاه داده",
    shape: "hexagon",
    color: "#0ea5e9",
    borderColor: "#0284c7",
    borderWidth: 2,
    textColor: "#fff",
    width: 120,
    height: 80,
    handles: [
      { id: "in", type: "target", position: "top" },
      { id: "out", type: "source", position: "bottom" },
    ],
  },
  {
    id: "api",
    label: "API",
    shape: "octagon",
    color: "#f97316",
    borderColor: "#ea580c",
    borderWidth: 2,
    textColor: "#fff",
    width: 120,
    height: 80,
    handles: [
      { id: "in", type: "target", position: "left" },
      { id: "out", type: "source", position: "right" },
    ],
  },
  {
    id: "note",
    label: "یادداشت",
    shape: "rounded-rectangle",
    color: "#fef9c3",
    borderColor: "#ca8a04",
    borderWidth: 1,
    textColor: "#713f12",
    width: 160,
    height: 60,
    handles: [],
  },
];

const CONN_PALETTE: CustomConnectionType[] = [
  {
    id: "flow",
    label: "جریان",
    pathStyle: "smoothstep",
    color: "#64748b",
    strokeWidth: 2,
    showArrow: true,
    allowLabel: true,
  },
  {
    id: "dashed",
    label: "خطچین",
    pathStyle: "smoothstep",
    color: "#94a3b8",
    strokeWidth: 1.5,
    strokeDasharray: "6,3",
    showArrow: true,
    allowLabel: true,
  },
  {
    id: "emphasis",
    label: "تأکیدی",
    pathStyle: "bezier",
    color: "#3b82f6",
    strokeWidth: 3,
    showArrow: true,
    allowLabel: false,
  },
  {
    id: "success",
    label: "موفق",
    pathStyle: "smoothstep",
    color: "#22c55e",
    strokeWidth: 2,
    showArrow: true,
    allowLabel: true,
  },
  {
    id: "error",
    label: "خطا",
    pathStyle: "smoothstep",
    color: "#ef4444",
    strokeWidth: 2,
    showArrow: true,
    allowLabel: true,
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// DIAGRAM STORAGE
// ══════════════════════════════════════════════════════════════════════════════

interface DiagramRecord {
  id: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  savedAt: number;
}

const LS_IDX = "fep:idx";
const lsKey = (id: string) => `fep:d:${id}`;

function lsReadAll(): DiagramRecord[] {
  try {
    const ids: string[] = JSON.parse(localStorage.getItem(LS_IDX) ?? "[]");
    return ids.flatMap((id) => {
      try {
        return [JSON.parse(localStorage.getItem(lsKey(id)) ?? "")];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}
function lsSave(rec: DiagramRecord): void {
  try {
    const ids: string[] = JSON.parse(localStorage.getItem(LS_IDX) ?? "[]");
    if (!ids.includes(rec.id))
      localStorage.setItem(LS_IDX, JSON.stringify([...ids, rec.id]));
    localStorage.setItem(lsKey(rec.id), JSON.stringify(rec));
  } catch {
    /* noop */
  }
}
function lsDelete(id: string): void {
  try {
    const ids: string[] = JSON.parse(localStorage.getItem(LS_IDX) ?? "[]");
    localStorage.setItem(LS_IDX, JSON.stringify(ids.filter((i) => i !== id)));
    localStorage.removeItem(lsKey(id));
  } catch {
    /* noop */
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// TINY PREVIEWS
// ══════════════════════════════════════════════════════════════════════════════

const NodePreview: React.FC<{ nt: CustomNodeType }> = ({ nt }) => {
  const S = 28;
  const sw = nt.borderWidth ?? 1;
  const polyPts: Record<string, string> = {
    diamond: `${S / 2},${sw} ${S - sw},${S / 2} ${S / 2},${S - sw} ${sw},${S / 2}`,
    hexagon: `${S * 0.25},${sw} ${S * 0.75},${sw} ${S - sw},${S / 2} ${S * 0.75},${S - sw} ${S * 0.25},${S - sw} ${sw},${S / 2}`,
    octagon: `${S * 0.3},${sw} ${S * 0.7},${sw} ${S - sw},${S * 0.3} ${S - sw},${S * 0.7} ${S * 0.7},${S - sw} ${S * 0.3},${S - sw} ${sw},${S * 0.7} ${sw},${S * 0.3}`,
    parallelogram: `${S * 0.2},${sw} ${S - sw},${sw} ${S * 0.8},${S - sw} ${sw},${S - sw}`,
  };
  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} className="shrink-0">
      {nt.shape === "circle" ? (
        <circle
          cx={S / 2}
          cy={S / 2}
          r={S / 2 - sw}
          fill={nt.color}
          stroke={nt.borderColor}
          strokeWidth={sw}
        />
      ) : polyPts[nt.shape] ? (
        <polygon
          points={polyPts[nt.shape]}
          fill={nt.color}
          stroke={nt.borderColor}
          strokeWidth={sw}
        />
      ) : (
        <rect
          x={sw}
          y={sw}
          width={S - sw * 2}
          height={S - sw * 2}
          rx={nt.shape === "rounded-rectangle" ? 5 : 0}
          fill={nt.color}
          stroke={nt.borderColor}
          strokeWidth={sw}
        />
      )}
    </svg>
  );
};

const EdgePreview: React.FC<{ ct: CustomConnectionType; active?: boolean }> = ({
  ct,
  active,
}) => (
  <svg width={36} height={14} viewBox="0 0 36 14" className="shrink-0">
    <line
      x1="2"
      y1="7"
      x2="30"
      y2="7"
      stroke={active ? ct.color : "#94a3b8"}
      strokeWidth={Math.min(ct.strokeWidth, 2.5)}
      strokeDasharray={ct.strokeDasharray}
    />
    <polygon points="27,4 31,7 27,10" fill={active ? ct.color : "#94a3b8"} />
  </svg>
);

// ══════════════════════════════════════════════════════════════════════════════
// DIAGRAM COMBOBOX
// ══════════════════════════════════════════════════════════════════════════════

const DiagramCombobox: React.FC<{
  current: DiagramRecord | null;
  diagrams: DiagramRecord[];
  dirty: boolean;
  onSelect(r: DiagramRecord): void;
  onNew(): void;
  onDelete(id: string): void;
  onSaveAs(name: string): void;
}> = ({ current, diagrams, dirty, onSelect, onNew, onDelete, onSaveAs }) => {
  const [open, setOpen] = useState(false);
  const [naming, setNaming] = useState(false);
  const [nameV, setNameV] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const fmt = (ts: number) =>
    new Date(ts).toLocaleDateString("fa-IR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const commitName = () => {
    const n = nameV.trim();
    if (!n) return;
    onSaveAs(n);
    setNaming(false);
    setNameV("");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative" dir="rtl">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 h-7 px-3 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 min-w-47.5 transition-colors"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 14 14"
          fill="none"
          className="shrink-0 opacity-50"
        >
          <path
            d="M1 3.5h12M1 7h12M1 10.5h7"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <span className="flex-1 text-right truncate">
          {current ? (
            current.name
          ) : (
            <span className="opacity-40">بدون نام</span>
          )}
        </span>
        {dirty && (
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
        )}
        <svg
          width="9"
          height="9"
          viewBox="0 0 10 10"
          fill="none"
          className="opacity-40 shrink-0"
        >
          <path
            d="M2 3.5l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full mt-1 right-0 w-72 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 overflow-hidden">
          {naming ? (
            <div className="p-2 border-b flex gap-1.5">
              <input
                autoFocus
                value={nameV}
                onChange={(e) => setNameV(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitName();
                  if (e.key === "Escape") {
                    setNaming(false);
                    setNameV("");
                  }
                }}
                placeholder="نام دیاگرام..."
                dir="rtl"
                className="flex-1 text-sm border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400"
              />
              <button
                onClick={commitName}
                className="px-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                ذخیره
              </button>
              <button
                onClick={() => {
                  setNaming(false);
                  setNameV("");
                }}
                className="px-2 text-xs border border-slate-200 rounded hover:bg-slate-50"
              >
                لغو
              </button>
            </div>
          ) : (
            <div className="p-1.5 border-b flex gap-1">
              <button
                onClick={() => {
                  setNaming(true);
                  setNameV(current?.name ?? "");
                }}
                className="flex-1 flex items-center gap-1.5 px-2 py-1.5 text-xs text-slate-700 rounded hover:bg-slate-50"
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6 1v10M1 6h10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                ذخیره با نام
              </button>
              <button
                onClick={() => {
                  onNew();
                  setOpen(false);
                }}
                className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-slate-700 rounded hover:bg-slate-50 border-r border-slate-100"
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <rect
                    x="1"
                    y="1"
                    width="10"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M6 4v4M4 6h4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                جدید
              </button>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto">
            {diagrams.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-6">
                هیچ دیاگرامی ذخیره نشده
              </p>
            )}
            {diagrams.map((d) => (
              <div
                key={d.id}
                onClick={() => {
                  onSelect(d);
                  setOpen(false);
                }}
                className={`group flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer ${current?.id === d.id ? "bg-blue-50" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm truncate ${current?.id === d.id ? "text-blue-700 font-medium" : "text-slate-800"}`}
                  >
                    {d.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {fmt(d.savedAt)} · {d.nodes.length} گره
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(d.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M1 1l10 10M11 1L1 11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PROPERTIES PANEL
// ══════════════════════════════════════════════════════════════════════════════

interface NodeStyleData {
  label?: string;
  description?: string;
  url?: string;
  shape?: string;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  textColor?: string;
  width?: number;
  height?: number;
  handles?: unknown[];
}

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="space-y-1.5" dir="rtl">
    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
      {label}
    </label>
    {children}
  </div>
);

const Toggle: React.FC<{ value: boolean; onChange(v: boolean): void }> = ({
  value,
  onChange,
}) => (
  <button
    onClick={() => onChange(!value)}
    className={`relative w-9 h-5 rounded-full transition-colors ${value ? "bg-blue-500" : "bg-slate-200"}`}
  >
    <span
      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-4" : "translate-x-0.5"}`}
    />
  </button>
);

const PropertiesPanel: React.FC<{
  node?: FlowNode;
  edge?: FlowEdge;
  connPalette: CustomConnectionType[];
  onNodeUpdate(id: string, patch: Partial<NodeStyleData>): void;
  onEdgeUpdate(
    id: string,
    patch: Partial<FlowEdge> & { dataPatch?: Partial<DynamicEdgeData> },
  ): void;
}> = ({ node, edge, connPalette, onNodeUpdate, onEdgeUpdate }) => {
  const nd = node ? (node.data as NodeStyleData) : null;
  const ed = edge ? (edge.data as DynamicEdgeData) : null;
  const edStyle = edge?.style as
    | (React.CSSProperties & { strokeWidth?: number; strokeDasharray?: string })
    | undefined;

  const openUrl = (url?: string) => {
    if (!url) return;
    window.open(
      url.startsWith("http") ? url : `https://${url}`,
      "_blank",
      "noopener",
    );
  };

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col overflow-y-auto shrink-0">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          {node ? "گره" : "اتصال"}
        </p>
        <span className="text-[10px] text-slate-300 font-mono">
          {node?.id ?? edge?.id}
        </span>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* ── NODE ── */}
        {node && nd && (
          <>
            <Field label="لیبل">
              <input
                value={nd.label ?? ""}
                dir="rtl"
                onChange={(e) =>
                  onNodeUpdate(node.id, { label: e.target.value })
                }
                className="w-full text-sm border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
            </Field>

            <Field label="توضیحات">
              <textarea
                rows={3}
                value={nd.description ?? ""}
                dir="rtl"
                onChange={(e) =>
                  onNodeUpdate(node.id, { description: e.target.value })
                }
                placeholder="اختیاری..."
                className="w-full text-sm border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
              />
            </Field>

            <Field label="آدرس وب (URL)">
              <div className="flex gap-1.5">
                <input
                  value={nd.url ?? ""}
                  dir="ltr"
                  placeholder="https://..."
                  onChange={(e) =>
                    onNodeUpdate(node.id, { url: e.target.value })
                  }
                  className="flex-1 text-xs font-mono border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
                <button
                  onClick={() => openUrl(nd.url)}
                  disabled={!nd.url}
                  title="باز کردن"
                  className="px-2 rounded-md border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M6 2H2a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1V8"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M8.5 1h4.5v4.5M13 1L7 7"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </Field>

            <div className="border-t border-slate-100" />

            <Field label="رنگ پس‌زمینه">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={nd.color ?? "#f1f5f9"}
                  onChange={(e) =>
                    onNodeUpdate(node.id, { color: e.target.value })
                  }
                  className="w-8 h-8 rounded border border-slate-200 p-0.5 cursor-pointer"
                />
                <span className="text-xs text-slate-500 font-mono">
                  {nd.color}
                </span>
              </div>
            </Field>

            <Field label="رنگ متن">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={nd.textColor ?? "#334155"}
                  onChange={(e) =>
                    onNodeUpdate(node.id, { textColor: e.target.value })
                  }
                  className="w-8 h-8 rounded border border-slate-200 p-0.5 cursor-pointer"
                />
                <span className="text-xs text-slate-500 font-mono">
                  {nd.textColor}
                </span>
              </div>
            </Field>

            <Field label={`حاشیه (ضخامت: ${nd.borderWidth ?? 1}px)`}>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={nd.borderColor ?? "#cbd5e1"}
                  onChange={(e) =>
                    onNodeUpdate(node.id, { borderColor: e.target.value })
                  }
                  className="w-8 h-8 rounded border border-slate-200 p-0.5 cursor-pointer shrink-0"
                />
                <input
                  type="range"
                  min={0}
                  max={8}
                  step={0.5}
                  value={nd.borderWidth ?? 1}
                  onChange={(e) =>
                    onNodeUpdate(node.id, {
                      borderWidth: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1"
                />
              </div>
            </Field>
          </>
        )}

        {/* ── EDGE ── */}
        {edge && ed && (
          <>
            <Field label="لیبل">
              <input
                value={(edge.label as string) ?? ""}
                dir="rtl"
                onChange={(e) =>
                  onEdgeUpdate(edge.id, { label: e.target.value })
                }
                placeholder="اختیاری..."
                className="w-full text-sm border border-slate-200 rounded-md px-2.5 py-1.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
            </Field>

            <Field label="رنگ اتصال">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={
                    ed.color ??
                    connPalette.find((c) => c.id === ed.connectionTypeId)
                      ?.color ??
                    "#64748b"
                  }
                  onChange={(e) =>
                    onEdgeUpdate(edge.id, {
                      style: { ...(edge.style ?? {}), stroke: e.target.value },
                      dataPatch: { color: e.target.value },
                    })
                  }
                  className="w-8 h-8 rounded border border-slate-200 p-0.5 cursor-pointer"
                />
                <span className="text-xs text-slate-500 font-mono"></span>
              </div>
            </Field>

            <Field label={`ضخامت (${edStyle?.strokeWidth ?? 2}px)`}>
              <input
                type="range"
                min={1}
                max={8}
                step={0.5}
                value={edStyle?.strokeWidth ?? 2}
                onChange={(e) =>
                  onEdgeUpdate(edge.id, {
                    style: {
                      ...(edge.style ?? {}),
                      strokeWidth: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full"
              />
            </Field>

            <Field label="انیمیشن جریان">
              <div className="flex items-center gap-3">
                <Toggle
                  value={!!edge.animated}
                  onChange={(v) =>
                    onEdgeUpdate(edge.id, {
                      animated: v,
                      dataPatch: { animated: v },
                    })
                  }
                />
                <span className="text-xs text-slate-500">
                  {edge.animated ? "فعال" : "غیرفعال"}
                </span>
              </div>
            </Field>

            <Field label="نوع اتصال">
              <div className="space-y-1">
                {connPalette.map((ct) => (
                  <div
                    key={ct.id}
                    onClick={() =>
                      onEdgeUpdate(edge.id, {
                        style: {
                          ...(edge.style ?? {}),
                          strokeWidth: ct.strokeWidth,
                          strokeDasharray: ct.strokeDasharray,
                        },
                        dataPatch: { connectionTypeId: ct.id },
                      })
                    }
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                      ed.connectionTypeId === ct.id
                        ? "bg-blue-50 border border-blue-200"
                        : "border border-transparent hover:bg-slate-50"
                    }`}
                  >
                    <EdgePreview
                      ct={ct}
                      active={ed.connectionTypeId === ct.id}
                    />
                    <span className="text-xs text-slate-700">{ct.label}</span>
                  </div>
                ))}
              </div>
            </Field>
          </>
        )}
      </div>
    </aside>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// TOOLBAR BUTTON
// ══════════════════════════════════════════════════════════════════════════════

const ToolBtn: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    highlight?: boolean;
    danger?: boolean;
  }
> = ({ highlight, danger, children, className = "", ...rest }) => (
  <button
    {...rest}
    className={[
      "inline-flex items-center gap-1.5 px-2 h-7 rounded text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
      danger
        ? "text-red-400 hover:text-red-300 hover:bg-red-900/30"
        : highlight
          ? "text-blue-300 bg-blue-900/40 hover:bg-blue-800/50"
          : "text-slate-300 hover:text-white hover:bg-slate-700",
      className,
    ].join(" ")}
  >
    {children}
  </button>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
    {children}
  </p>
);

// ══════════════════════════════════════════════════════════════════════════════
// INNER EDITOR
// ══════════════════════════════════════════════════════════════════════════════

const FlowEditorInner: React.FC = () => {
  const { screenToFlowPosition } = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [past, setPast] = useState<{ nodes: FlowNode[]; edges: FlowEdge[] }[]>(
    [],
  );
  const [future, setFuture] = useState<
    { nodes: FlowNode[]; edges: FlowEdge[] }[]
  >([]);
  const [diagrams, setDiagrams] = useState<DiagramRecord[]>([]);
  const [currentDiag, setCurrentD] = useState<DiagramRecord | null>(null);
  const [activeConn, setActiveConn] = useState(CONN_PALETTE[0].id);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(
    null,
  );

  const selectedNode = useMemo(() => nodes.find((n) => n.selected), [nodes]);
  const selectedEdge = useMemo(() => edges.find((e) => e.selected), [edges]);

  // Seed registry + load diagram list
  useEffect(() => {
    CONN_PALETTE.forEach((ct) => {
      if (hasConnectionType(ct.id)) updateConnectionType(ct);
      else registerConnectionType(ct);
    });
    setDiagrams(lsReadAll());
  }, []);

  const notify = useCallback((msg: string, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Commit to history
  const commit = useCallback(
    (n: FlowNode[], e: FlowEdge[]) => {
      setPast((p) => [...p.slice(-49), { nodes, edges }]);
      setFuture([]);
      setNodes(n);
      setEdges(e);
      setDirty(true);
    },
    [nodes, edges],
  );

  const undo = useCallback(() => {
    if (!past.length) return;
    const prev = past[past.length - 1];
    setFuture((f) => [{ nodes, edges }, ...f]);
    setPast((p) => p.slice(0, -1));
    setNodes(prev.nodes);
    setEdges(prev.edges);
    setDirty(true);
  }, [past, nodes, edges]);

  const redo = useCallback(() => {
    if (!future.length) return;
    const next = future[0];
    setPast((p) => [...p, { nodes, edges }]);
    setFuture((f) => f.slice(1));
    setNodes(next.nodes);
    setEdges(next.edges);
    setDirty(true);
  }, [future, nodes, edges]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((n) => applyNodeChanges(changes, n) as FlowNode[]);
    setDirty(true);
  }, []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((e) => applyEdgeChanges(changes, e) as FlowEdge[]);
    setDirty(true);
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      const ct =
        CONN_PALETTE.find((c) => c.id === activeConn) ?? CONN_PALETTE[0];
      const newEdge: FlowEdge = {
        ...connection,
        id: `e-${Date.now()}`,
        type: "default",
        animated: false,
        style: {
          stroke: ct.color,
          strokeWidth: ct.strokeWidth,
          strokeDasharray: ct.strokeDasharray,
        },
        data: {
          connectionTypeId: ct.id,
          color: ct.color,
          animated: false,
        } as DynamicEdgeData,
      } as FlowEdge;
      commit(nodes, [...edges, newEdge]);
    },
    [activeConn, nodes, edges, commit],
  );

  const addNode = useCallback(
    (ntId: string, dropPos?: { x: number; y: number }) => {
      const nt = NODE_PALETTE.find((n) => n.id === ntId);
      if (!nt) return;
      let position = dropPos;
      if (!position) {
        const rect = wrapperRef.current?.getBoundingClientRect();
        const c = screenToFlowPosition({
          x: (rect?.left ?? 0) + (rect?.width ?? 800) / 2,
          y: (rect?.top ?? 0) + (rect?.height ?? 600) / 2,
        });
        const off = (nodes.length % 8) * 22;
        position = {
          x: c.x - (nt.width ?? 160) / 2 + off,
          y: c.y - (nt.height ?? 80) / 2 + off,
        };
      }
      commit(
        [
          ...nodes,
          {
            id: `${ntId}-${Date.now()}`,
            type: "default",
            position,
            data: {
              nodeTypeId: nt.id,
              label: nt.label,
              shape: nt.shape,
              color: nt.color,
              borderColor: nt.borderColor,
              borderWidth: nt.borderWidth ?? 1,
              textColor: nt.textColor,
              width: nt.width ?? 160,
              height: nt.height ?? 80,
              handles: nt.handles,
            } as unknown as FlowNode["data"],
          },
        ],
        edges,
      );
    },
    [nodes, edges, commit, screenToFlowPosition],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const ntId = e.dataTransfer.getData("node-type-id");
      if (!ntId) return;
      const rect = wrapperRef.current?.getBoundingClientRect();
      addNode(
        ntId,
        screenToFlowPosition({
          x: e.clientX - (rect?.left ?? 0),
          y: e.clientY - (rect?.top ?? 0),
        }),
      );
    },
    [addNode, screenToFlowPosition],
  );

  const onNodeUpdate = useCallback(
    (id: string, patch: Partial<NodeStyleData>) => {
      setNodes((ns) =>
        ns.map((n) =>
          n.id === id
            ? { ...n, data: { ...n.data, ...patch } as FlowNode["data"] }
            : n,
        ),
      );
      setDirty(true);
    },
    [],
  );

  const onEdgeUpdate = useCallback(
    (
      id: string,
      patch: Partial<FlowEdge> & { dataPatch?: Partial<DynamicEdgeData> },
    ) => {
      const { dataPatch, ...rest } = patch;
      setEdges((es) =>
        es.map((e) =>
          e.id === id
            ? {
                ...e,
                ...rest,
                data: dataPatch
                  ? ({ ...e.data, ...dataPatch } as FlowEdge["data"])
                  : e.data,
              }
            : e,
        ),
      );
      setDirty(true);
    },
    [],
  );

  // Diagram CRUD
  const doSaveAs = useCallback(
    (name: string) => {
      const rec: DiagramRecord = {
        id: currentDiag?.id ?? `d-${Date.now()}`,
        name,
        nodes,
        edges,
        savedAt: Date.now(),
      };
      lsSave(rec);
      const all = lsReadAll();
      setDiagrams(all);
      setCurrentD(rec);
      setDirty(false);
      notify(`✓ «${name}» ذخیره شد`);
    },
    [currentDiag, nodes, edges, notify],
  );

  const doSave = useCallback(() => {
    if (!currentDiag) {
      notify("ابتدا از کمبوباکس نام انتخاب کنید", true);
      return;
    }
    const rec: DiagramRecord = {
      ...currentDiag,
      nodes,
      edges,
      savedAt: Date.now(),
    };
    lsSave(rec);
    setDiagrams(lsReadAll());
    setCurrentD(rec);
    setDirty(false);
    notify("✓ ذخیره شد");
  }, [currentDiag, nodes, edges, notify]);

  const doLoad = useCallback((rec: DiagramRecord) => {
    setNodes(rec.nodes);
    setEdges(rec.edges);
    setCurrentD(rec);
    setPast([]);
    setFuture([]);
    setDirty(false);
  }, []);
  const doNew = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setCurrentD(null);
    setPast([]);
    setFuture([]);
    setDirty(false);
  }, []);
  const doDelete = useCallback(
    (id: string) => {
      lsDelete(id);
      const all = lsReadAll();
      setDiagrams(all);
      if (currentDiag?.id === id) setCurrentD(null);
    },
    [currentDiag],
  );

  const doExport = useCallback(() => {
    const name = currentDiag?.name ?? "diagram";
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ name, nodes, edges }, null, 2)], {
        type: "application/json",
      }),
    );
    Object.assign(document.createElement("a"), {
      href: url,
      download: `${name}.json`,
    }).click();
    URL.revokeObjectURL(url);
    notify("📤 دانلود شد");
  }, [currentDiag, nodes, edges, notify]);

  const doImport = useCallback(() => {
    const inp = Object.assign(document.createElement("input"), {
      type: "file",
      accept: ".json",
    });
    inp.onchange = () => {
      const file = inp.files?.[0];
      if (!file) return;
      const r = new FileReader();
      r.onload = (ev) => {
        try {
          const p = JSON.parse(ev.target?.result as string);
          const rec: DiagramRecord = {
            id: `d-${Date.now()}`,
            name: p.name ?? file.name.replace(/\.json$/i, ""),
            nodes: p.nodes ?? [],
            edges: p.edges ?? [],
            savedAt: Date.now(),
          };
          lsSave(rec);
          setDiagrams(lsReadAll());
          doLoad(rec);
          notify(`📥 «${rec.name}» بارگذاری شد`);
        } catch {
          notify("⚠ فایل نامعتبر", true);
        }
      };
      r.readAsText(file);
    };
    inp.click();
  }, [doLoad, notify]);

  const doClear = useCallback(() => {
    if (!confirm("تمام محتوا پاک می‌شود. ادامه؟")) return;
    commit([], []);
  }, [commit]);

  const nodeTypes = useMemo<NodeTypes>(() => ({ default: DynamicNode }), []);
  const edgeTypes = useMemo<EdgeTypes>(() => ({ default: DynamicEdge }), []);

  return (
    <div className="flex flex-col h-screen overflow-hidden" dir="rtl">
      {/* ══ TOOLBAR ════════════════════════════════════════════════════════════ */}
      <header className="flex items-center gap-2 px-3 h-11 bg-slate-900 border-b border-slate-800 shrink-0 z-20">
        <span className="text-slate-500 text-[10px] font-mono tracking-widest ml-1 shrink-0">
          FLOW
        </span>
        <div className="h-5 w-px bg-slate-700 mx-1" />

        <DiagramCombobox
          current={currentDiag}
          diagrams={diagrams}
          dirty={dirty}
          onSelect={doLoad}
          onNew={doNew}
          onDelete={doDelete}
          onSaveAs={doSaveAs}
        />

        <div className="h-5 w-px bg-slate-700 mx-1" />

        <ToolBtn onClick={undo} disabled={!past.length} title="واگرد">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 7a5 5 0 108.66-2.5M2 7V3m0 4H6"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ToolBtn>
        <ToolBtn onClick={redo} disabled={!future.length} title="تکرار">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path
              d="M12 7a5 5 0 11-8.66-2.5M12 7V3m0 4H8"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ToolBtn>

        <div className="h-5 w-px bg-slate-700 mx-1" />

        <ToolBtn onClick={doSave} highlight={dirty} title="ذخیره">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path
              d="M11 13H3a1 1 0 01-1-1V2a1 1 0 011-1h7l2 2v9a1 1 0 01-1 1z"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path
              d="M9 13V8H5v5M5 1v4h5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          <span>{dirty ? "ذخیره ●" : "ذخیره"}</span>
        </ToolBtn>
        <ToolBtn onClick={doExport} title="خروجی JSON">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1v8m0 0L4.5 6M7 9l2.5-3M2 11h10"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>خروجی</span>
        </ToolBtn>
        <ToolBtn onClick={doImport} title="ورودی JSON">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 9V1m0 8L4.5 6M7 9l2.5-3M2 11h10"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>ورودی</span>
        </ToolBtn>

        <div className="flex-1" />

        {toast && (
          <span
            className={`text-xs font-medium px-2 ${toast.err ? "text-red-400" : "text-emerald-400"}`}
          >
            {toast.msg}
          </span>
        )}

        <ToolBtn danger onClick={doClear} title="پاک کردن">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 4h10l-1 8H3L2 4zM1 4h12M5 4V2h4v2"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ToolBtn>
      </header>

      {/* ══ BODY ═══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden bg-slate-100">
        {/* Left sidebar */}
        <aside className="w-44 bg-white border-l border-slate-200 flex flex-col overflow-y-auto shrink-0 z-10">
          <div className="p-2.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
              گره‌ها
            </p>
            <div className="space-y-0.5">
              {NODE_PALETTE.map((nt) => (
                <div
                  key={nt.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("node-type-id", nt.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onClick={() => addNode(nt.id)}
                  title="کلیک = افزودن · درگ = قرار دادن"
                  className="flex items-center gap-2 px-2 py-1.5 rounded border border-transparent hover:border-slate-200 hover:bg-slate-50 cursor-pointer transition-all active:scale-95 select-none"
                >
                  <NodePreview nt={nt} />
                  <span className="text-xs font-medium text-slate-700 truncate">
                    {nt.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-100 mx-2.5" />

          <div className="p-2.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
              اتصال‌ها
            </p>
            <div className="space-y-0.5">
              {CONN_PALETTE.map((ct) => (
                <div
                  key={ct.id}
                  onClick={() => setActiveConn(ct.id)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded border cursor-pointer transition-all select-none ${
                    activeConn === ct.id
                      ? "border-blue-200 bg-blue-50"
                      : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <EdgePreview ct={ct} active={activeConn === ct.id} />
                  <span className="text-xs text-slate-700 truncate">
                    {ct.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto p-2.5 border-t border-slate-100">
            <div className="text-[10px] text-slate-400 space-y-0.5 leading-relaxed">
              <p>🔗 از ⬤ برای اتصال</p>
              <p>⌫ Delete حذف</p>
              <p>⇧ Shift چندانتخاب</p>
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <div
          ref={wrapperRef}
          className="flex-1 relative"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 select-none">
              <div className="w-14 h-14 rounded-2xl bg-slate-200/60 flex items-center justify-center mb-3">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 28 28"
                  fill="none"
                  className="text-slate-400"
                >
                  <rect
                    x="1"
                    y="1"
                    width="26"
                    height="26"
                    rx="4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeDasharray="4,2"
                  />
                  <path
                    d="M14 8v12M8 14h12"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-500">بوم خالی</p>
              <p className="text-xs text-slate-400 mt-1">
                از پالت گره اضافه کنید
              </p>
            </div>
          )}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
            fitViewOptions={{ padding: 0.3, minZoom: 0.3 }}
            minZoom={0.15}
            maxZoom={2.5}
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Shift"
            className="bg-slate-50"
          >
            <Background
              variant={BackgroundVariant.Dots}
              color="#cbd5e1"
              gap={22}
              size={1.5}
            />
            <Controls />
            <MiniMap
              zoomable
              pannable
              nodeColor={(n) => {
                const d = n.data as Record<string, unknown>;
                return typeof d?.color === "string" ? d.color : "#94a3b8";
              }}
              maskColor="rgba(248,250,252,0.8)"
            />
            <Panel position="bottom-right">
              <div className="text-[10px] text-slate-400 bg-white/80 backdrop-blur px-2.5 py-1 rounded border border-slate-200">
                {nodes.length} گره · {edges.length} اتصال
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Right properties panel */}
        {(selectedNode || selectedEdge) && (
          <PropertiesPanel
            node={selectedNode}
            edge={selectedEdge}
            connPalette={CONN_PALETTE}
            onNodeUpdate={onNodeUpdate}
            onEdgeUpdate={onEdgeUpdate}
          />
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC EXPORT
// ══════════════════════════════════════════════════════════════════════════════

export const FlowEditorPage: React.FC = () => (
  <ReactFlowProvider>
    <FlowEditorInner />
  </ReactFlowProvider>
);

export default FlowEditorPage;
