"use client";

import React from "react";
import type { GeometryShape } from "../../utils/geometry";

// ─────────────────────────────────────────────────────────────────────────
// Small, fixed illustrative diagrams (NOT numerically scaled to the actual
// entered dimensions — just clear enough to show which input maps to which
// part of the shape). One consistent 140×100 viewBox, one stroke color that
// follows currentColor so it automatically matches each node's text color.
// ─────────────────────────────────────────────────────────────────────────

const STROKE = "currentColor";

function HDim({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return (
    <g opacity={0.75}>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={STROKE} strokeWidth={1} />
      <line x1={x1} y1={y - 3} x2={x1} y2={y + 3} stroke={STROKE} strokeWidth={1} />
      <line x1={x2} y1={y - 3} x2={x2} y2={y + 3} stroke={STROKE} strokeWidth={1} />
      <text x={(x1 + x2) / 2} y={y + 11} fontSize={9} textAnchor="middle" fill={STROKE}>
        {label}
      </text>
    </g>
  );
}

function VDim({ y1, y2, x, label }: { y1: number; y2: number; x: number; label: string }) {
  return (
    <g opacity={0.75}>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={STROKE} strokeWidth={1} />
      <line x1={x - 3} y1={y1} x2={x + 3} y2={y1} stroke={STROKE} strokeWidth={1} />
      <line x1={x - 3} y1={y2} x2={x + 3} y2={y2} stroke={STROKE} strokeWidth={1} />
      <text x={x + 6} y={(y1 + y2) / 2 + 3} fontSize={9} textAnchor="start" fill={STROKE}>
        {label}
      </text>
    </g>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  // Extra margin on every side beyond the shapes' own 20–120/15–85 drawing
  // area — several dimension labels (e.g. VDim's text) sit right at the old
  // edge and were getting clipped by the SVG's own viewBox boundary, not
  // just by the outer container being small.
  return (
    <svg viewBox="-6 -6 162 118" className="h-full w-full" fill="none">
      {children}
    </svg>
  );
}

export function ShapeSchematic({ shape }: { shape: GeometryShape }) {
  switch (shape) {
    case "rectangle":
      return (
        <Wrap>
          <rect x={20} y={15} width={100} height={50} stroke={STROKE} strokeWidth={1.5} />
          <HDim x1={20} x2={120} y={75} label="width" />
          <VDim y1={15} y2={65} x={128} label="height" />
        </Wrap>
      );

    case "square":
      return (
        <Wrap>
          <rect x={35} y={12} width={70} height={70} stroke={STROKE} strokeWidth={1.5} />
          <HDim x1={35} x2={105} y={90} label="side" />
        </Wrap>
      );

    case "circle":
      return (
        <Wrap>
          <circle cx={70} cy={50} r={35} stroke={STROKE} strokeWidth={1.5} />
          <line x1={70} y1={50} x2={105} y2={50} stroke={STROKE} strokeWidth={1} />
          <circle cx={70} cy={50} r={1.5} fill={STROKE} />
          <text x={85} y={45} fontSize={9} textAnchor="middle" fill={STROKE}>
            radius
          </text>
        </Wrap>
      );

    case "triangle":
      return (
        <Wrap>
          <polygon points="20,85 120,85 65,15" stroke={STROKE} strokeWidth={1.5} />
          <line x1={65} y1={15} x2={65} y2={85} stroke={STROKE} strokeWidth={1} strokeDasharray="3 2" opacity={0.7} />
          <HDim x1={20} x2={120} y={92} label="base" />
          <text x={70} y={50} fontSize={9} textAnchor="start" fill={STROKE} opacity={0.75}>
            height
          </text>
        </Wrap>
      );

    case "cylinder":
      return (
        <Wrap>
          <ellipse cx={55} cy={22} rx={30} ry={10} stroke={STROKE} strokeWidth={1.5} />
          <ellipse cx={55} cy={78} rx={30} ry={10} stroke={STROKE} strokeWidth={1.5} />
          <line x1={25} y1={22} x2={25} y2={78} stroke={STROKE} strokeWidth={1.5} />
          <line x1={85} y1={22} x2={85} y2={78} stroke={STROKE} strokeWidth={1.5} />
          <line x1={55} y1={22} x2={85} y2={22} stroke={STROKE} strokeWidth={1} opacity={0.75} />
          <text x={70} y={17} fontSize={9} textAnchor="middle" fill={STROKE} opacity={0.75}>
            radius
          </text>
          <VDim y1={22} y2={78} x={100} label="height" />
        </Wrap>
      );

    case "sphere":
      return (
        <Wrap>
          <circle cx={70} cy={50} r={35} stroke={STROKE} strokeWidth={1.5} />
          <ellipse cx={70} cy={50} rx={35} ry={11} stroke={STROKE} strokeWidth={1} strokeDasharray="3 2" opacity={0.55} />
          <line x1={70} y1={50} x2={105} y2={50} stroke={STROKE} strokeWidth={1} />
          <circle cx={70} cy={50} r={1.5} fill={STROKE} />
          <text x={85} y={45} fontSize={9} textAnchor="middle" fill={STROKE}>
            radius
          </text>
        </Wrap>
      );

    case "cuboid":
      return (
        <Wrap>
          {/* simple isometric-ish box */}
          <polygon points="25,40 25,85 80,85 80,40" stroke={STROKE} strokeWidth={1.5} />
          <polygon points="25,40 45,20 100,20 80,40" stroke={STROKE} strokeWidth={1.5} />
          <polygon points="80,40 100,20 100,65 80,85" stroke={STROKE} strokeWidth={1.5} />
          <text x={50} y={98} fontSize={9} textAnchor="middle" fill={STROKE} opacity={0.75}>
            width
          </text>
          <text x={10} y={64} fontSize={9} textAnchor="middle" fill={STROKE} opacity={0.75} transform="rotate(-90 10 64)">
            height
          </text>
          <text x={108} y={45} fontSize={9} textAnchor="start" fill={STROKE} opacity={0.75}>
            depth
          </text>
        </Wrap>
      );

    case "hollowCircle":
      return (
        <Wrap>
          <circle cx={70} cy={50} r={35} stroke={STROKE} strokeWidth={1.5} />
          <circle cx={70} cy={50} r={18} stroke={STROKE} strokeWidth={1.5} />
          <line x1={70} y1={50} x2={105} y2={50} stroke={STROKE} strokeWidth={1} />
          <line x1={70} y1={50} x2={70} y2={32} stroke={STROKE} strokeWidth={1} opacity={0.75} />
          <text x={92} y={45} fontSize={9} textAnchor="middle" fill={STROKE}>
            outer D
          </text>
          <text x={75} y={38} fontSize={8} textAnchor="start" fill={STROKE} opacity={0.75}>
            inner d
          </text>
        </Wrap>
      );

    case "iBeam":
      return (
        <Wrap>
          {/* I-beam cross-section outline */}
          <polygon
            points="30,15 110,15 110,28 78,28 78,72 110,72 110,85 30,85 30,72 62,72 62,28 30,28"
            stroke={STROKE}
            strokeWidth={1.5}
          />
          <HDim x1={30} x2={110} y={92} label="B" />
          <VDim y1={15} y2={85} x={118} label="H" />
          <text x={100} y={24} fontSize={8} textAnchor="middle" fill={STROKE} opacity={0.75}>
            tf
          </text>
          <text x={70} y={53} fontSize={8} textAnchor="middle" fill={STROKE} opacity={0.75}>
            tw
          </text>
        </Wrap>
      );

    default:
      return null;
  }
}
