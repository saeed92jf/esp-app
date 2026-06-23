export type StandardNodeVariant = "api" | "nonApi";

export interface StandardButtonItem {
  id: string;
  label: string;
  href: string;
  variant: StandardNodeVariant;
}

export interface StandardGroup {
  id: string;
  title: string;
  x: number;
  y: number;
  width?: number;
  items: StandardButtonItem[];
}

export interface CoreNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface DiagramConnection {
  id: string;
  from: {
    x: number;
    y: number;
  };
  to: {
    x: number;
    y: number;
  };
}

/**
 * Central web nodes.
 * Positions are percentage-based to keep the spider diagram scalable.
 */
export const CORE_NODES: CoreNode[] = [
  {
    id: "in-service-inspection",
    label: "In-Service Inspection",
    x: 31,
    y: 43,
  },
  {
    id: "design-repair",
    label: "Design & Repair",
    x: 31,
    y: 76,
  },
  {
    id: "mi-engineering",
    label: "MI Engineering / Process Safety",
    x: 72,
    y: 43,
  },
  {
    id: "corrosion",
    label: "Corrosion",
    x: 72,
    y: 76,
  },
];

/**
 * Standards groups around the central nodes.
 * API items are rendered as green circles.
 * Non-API items are rendered as gray hexagons.
 */
export const STANDARD_GROUPS: StandardGroup[] = [
  {
    id: "pressure-vessel-top",
    title: "Pressure Vessel",
    x: 7,
    y: 12,
    items: [
      { id: "api-rp-572", label: "API RP 572", href: "#", variant: "api" },
      { id: "api-510-a", label: "API 510", href: "#", variant: "api" },
      { id: "nbic-part-2", label: "NBIC Part 2", href: "#", variant: "nonApi" },
    ],
  },
  {
    id: "piping-top",
    title: "Piping",
    x: 18,
    y: 12,
    items: [
      { id: "api-574", label: "API 574", href: "#", variant: "api" },
      { id: "api-570-a", label: "API 570", href: "#", variant: "api" },
    ],
  },
  {
    id: "aboveground-storage-tank-top",
    title: "Aboveground Storage Tank",
    x: 29,
    y: 12,
    width: 12,
    items: [
      { id: "api-575", label: "API 575", href: "#", variant: "api" },
      { id: "sti-sp001", label: "STI SP001", href: "#", variant: "nonApi" },
      { id: "api-653", label: "API 653", href: "#", variant: "api" },
      { id: "api-12r1", label: "API 12R1", href: "#", variant: "api" },
    ],
  },
  {
    id: "nde-top",
    title: "NDE",
    x: 43,
    y: 12,
    width: 13,
    items: [
      { id: "api-586", label: "API 586", href: "#", variant: "api" },
      { id: "asnt-tc-1a", label: "ASNT TC-1A", href: "#", variant: "nonApi" },
      { id: "api-qute", label: "API QUTE", href: "#", variant: "api" },
      { id: "api-587", label: "API 587", href: "#", variant: "api" },
      { id: "asme-v", label: "ASME V", href: "#", variant: "nonApi" },
    ],
  },
  {
    id: "pipeline-top",
    title: "Pipeline",
    x: 57,
    y: 12,
    width: 14,
    items: [
      { id: "api-1104", label: "API 1104", href: "#", variant: "api" },
      { id: "api-1110", label: "API 1110", href: "#", variant: "api" },
      { id: "api-1188", label: "API 1188", href: "#", variant: "api" },
      { id: "api-1163", label: "API 1163", href: "#", variant: "api" },
      { id: "api-1173", label: "API 1173", href: "#", variant: "api" },
      { id: "api-1176", label: "API 1176", href: "#", variant: "api" },
    ],
  },

  {
    id: "incident-investigation",
    title: "Incident Investigation",
    x: 72,
    y: 18,
    items: [{ id: "api-585", label: "API 585", href: "#", variant: "api" }],
  },
  {
    id: "hf-alkylation",
    title: "HF Alkylation",
    x: 82,
    y: 18,
    items: [{ id: "api-751", label: "API 751", href: "#", variant: "api" }],
  },
  {
    id: "kpi",
    title: "KPI",
    x: 92,
    y: 18,
    items: [{ id: "api-754", label: "API 754", href: "#", variant: "api" }],
  },

  {
    id: "risk-based-inspection",
    title: "Risk Based Inspection",
    x: 57,
    y: 34,
    width: 12,
    items: [
      { id: "api-581", label: "API 581", href: "#", variant: "api" },
      { id: "asme-pcc-3", label: "ASME PCC-3", href: "#", variant: "nonApi" },
      { id: "api-580", label: "API 580", href: "#", variant: "api" },
      { id: "api-691", label: "API 691", href: "#", variant: "api" },
    ],
  },
  {
    id: "fitness-service",
    title: "Fitness-For-Service",
    x: 59,
    y: 51,
    width: 10,
    items: [
      {
        id: "api-579-1",
        label: "API 579-1 / ASME FFS-1",
        href: "#",
        variant: "api",
      },
      { id: "api-579-2", label: "API 579-2", href: "#", variant: "api" },
    ],
  },
  {
    id: "corrosion-under-insulation",
    title: "Corrosion Under Insulation / Fireproofing",
    x: 79,
    y: 58,
    width: 15,
    items: [
      { id: "api-583", label: "API 583", href: "#", variant: "api" },
      { id: "ampp-sp0198", label: "AMPP SP0198", href: "#", variant: "nonApi" },
      { id: "ampp-tm0194", label: "AMPP TM0194", href: "#", variant: "nonApi" },
    ],
  },

  {
    id: "damage-mechanism",
    title: "Damage Mechanism",
    x: 89,
    y: 39,
    width: 11,
    items: [
      { id: "api-571", label: "API 571", href: "#", variant: "api" },
      { id: "api-938-a", label: "API 938-A", href: "#", variant: "api" },
      { id: "api-939-c", label: "API 939-C", href: "#", variant: "api" },
      { id: "api-939-c-2", label: "API 939-C", href: "#", variant: "api" },
      { id: "api-939-e", label: "API 939-E", href: "#", variant: "api" },
      { id: "api-941", label: "API 941", href: "#", variant: "api" },
      { id: "api-945", label: "API 945", href: "#", variant: "api" },
      { id: "api-932-b", label: "API 932-B", href: "#", variant: "api" },
      { id: "nace-mr0103", label: "NACE MR0103", href: "#", variant: "nonApi" },
      { id: "nace-sp0170", label: "NACE SP0170", href: "#", variant: "nonApi" },
      { id: "nace-sp0296", label: "NACE SP0296", href: "#", variant: "nonApi" },
      { id: "nace-sp0403", label: "NACE SP0403", href: "#", variant: "nonApi" },
      { id: "nace-mr0175", label: "NACE MR0175", href: "#", variant: "nonApi" },
      { id: "nace-sp0472", label: "NACE SP0472", href: "#", variant: "nonApi" },
      { id: "nace-tm0177", label: "NACE TM0177", href: "#", variant: "nonApi" },
    ],
  },
  {
    id: "corrosion-control",
    title: "Corrosion Control",
    x: 89,
    y: 76,
    width: 11,
    items: [
      { id: "api-584", label: "API 584", href: "#", variant: "api" },
      { id: "api-651", label: "API 651", href: "#", variant: "api" },
      { id: "api-652", label: "API 652", href: "#", variant: "api" },
      { id: "api-970", label: "API 970", href: "#", variant: "api" },
      { id: "nace-sp0169", label: "NACE SP0169", href: "#", variant: "nonApi" },
      { id: "nace-sp0572", label: "NACE SP0572", href: "#", variant: "nonApi" },
      { id: "iso-15589-1", label: "ISO 15589-1", href: "#", variant: "nonApi" },
    ],
  },

  {
    id: "prds-left",
    title: "PRDs",
    x: 2,
    y: 27,
    width: 12,
    items: [
      { id: "api-576", label: "API 576", href: "#", variant: "api" },
      { id: "api-527", label: "API 527", href: "#", variant: "api" },
      { id: "nbic-part-4", label: "NBIC Part 4", href: "#", variant: "nonApi" },
      { id: "api-520-a", label: "API 520", href: "#", variant: "api" },
      { id: "api-570-b", label: "API 570", href: "#", variant: "api" },
    ],
  },
  {
    id: "frp-asset",
    title: "FRP Asset",
    x: 2,
    y: 48,
    width: 12,
    items: [
      { id: "mtl-129-99", label: "MTI 129-99", href: "#", variant: "nonApi" },
      { id: "etaa-2007-1", label: "ETAA 2007-1", href: "#", variant: "nonApi" },
      { id: "ampp-sp9100", label: "AMPP SP9100", href: "#", variant: "nonApi" },
      { id: "ampp-wp380", label: "AMPP WP380", href: "#", variant: "nonApi" },
      { id: "asme-rtp1", label: "ASME RTP-1", href: "#", variant: "nonApi" },
      { id: "api-15hr", label: "API 15HR", href: "#", variant: "nonApi" },
      { id: "pffa", label: "PFFA", href: "#", variant: "nonApi" },
      { id: "ppi", label: "PPI", href: "#", variant: "nonApi" },
    ],
  },

  {
    id: "welding",
    title: "Welding",
    x: 11,
    y: 68,
    width: 12,
    items: [
      { id: "api-577", label: "API 577", href: "#", variant: "api" },
      { id: "asme-ix", label: "ASME IX", href: "#", variant: "nonApi" },
      { id: "api-582", label: "API 582", href: "#", variant: "api" },
    ],
  },
  {
    id: "heater-boiler",
    title: "Heater / Boiler",
    x: 2,
    y: 79,
    width: 15,
    items: [
      { id: "api-530", label: "API 530", href: "#", variant: "api" },
      { id: "api-538", label: "API 538", href: "#", variant: "api" },
      { id: "api-560", label: "API 560", href: "#", variant: "api" },
      { id: "asme-i", label: "ASME I", href: "#", variant: "nonApi" },
    ],
  },
  {
    id: "pressure-vessel-bottom",
    title: "Pressure Vessel",
    x: 2,
    y: 90,
    width: 18,
    items: [
      { id: "api-510-b", label: "API 510", href: "#", variant: "api" },
      { id: "asme-viii-1", label: "ASME VIII-1", href: "#", variant: "nonApi" },
      { id: "asme-viii-2", label: "ASME VIII-2", href: "#", variant: "nonApi" },
    ],
  },
  {
    id: "aboveground-storage-tanks-bottom",
    title: "Aboveground Storage Tanks",
    x: 2,
    y: 101,
    width: 24,
    items: [
      { id: "api-650", label: "API 650", href: "#", variant: "api" },
      { id: "api-620", label: "API 620", href: "#", variant: "api" },
      { id: "api-12f", label: "API 12F", href: "#", variant: "api" },
      { id: "api-653-bottom", label: "API 653", href: "#", variant: "api" },
    ],
  },
  {
    id: "piping-pipelines-bottom",
    title: "Piping / Pipelines",
    x: 27,
    y: 101,
    width: 27,
    items: [
      { id: "api-570-bottom", label: "API 570", href: "#", variant: "api" },
      { id: "asme-b31-1", label: "ASME B31.1", href: "#", variant: "nonApi" },
      { id: "asme-b31-3", label: "ASME B31.3", href: "#", variant: "nonApi" },
      { id: "asme-b31-4", label: "ASME B31.4", href: "#", variant: "nonApi" },
      { id: "asme-b31-8", label: "ASME B31.8", href: "#", variant: "nonApi" },
      { id: "asme-b31-12", label: "ASME B31.12", href: "#", variant: "nonApi" },
    ],
  },
  {
    id: "quality-control",
    title: "Quality Control",
    x: 23,
    y: 57,
    items: [
      { id: "api-588", label: "API 588", href: "#", variant: "api" },
      { id: "api-578", label: "API 578", href: "#", variant: "api" },
    ],
  },
  {
    id: "repair",
    title: "Repair",
    x: 34,
    y: 57,
    width: 10,
    items: [
      { id: "asme-pcc-1", label: "ASME PCC-1", href: "#", variant: "nonApi" },
      { id: "nbic-part-3", label: "NBIC Part 3", href: "#", variant: "nonApi" },
      { id: "asme-pcc-2", label: "ASME PCC-2", href: "#", variant: "nonApi" },
    ],
  },
  {
    id: "materials",
    title: "Materials",
    x: 56,
    y: 80,
    width: 16,
    items: [
      { id: "astm", label: "ASTM", href: "#", variant: "nonApi" },
      { id: "api-5l", label: "API 5L", href: "#", variant: "api" },
      { id: "asme-ii", label: "ASME II", href: "#", variant: "nonApi" },
      { id: "mss-sp", label: "MSS-SP", href: "#", variant: "nonApi" },
    ],
  },
  {
    id: "prds-center",
    title: "PRDs",
    x: 53,
    y: 69,
    width: 13,
    items: [
      { id: "api-2000", label: "API 2000", href: "#", variant: "api" },
      { id: "api-521", label: "API 521", href: "#", variant: "api" },
      { id: "api-520-center", label: "API 520", href: "#", variant: "api" },
    ],
  },
  {
    id: "flare",
    title: "Flare",
    x: 60,
    y: 91,
    items: [{ id: "api-537", label: "API 537", href: "#", variant: "api" }],
  },
  {
    id: "heat-exchangers",
    title: "Heat Exchangers",
    x: 55,
    y: 101,
    width: 25,
    items: [
      { id: "api-660", label: "API 660", href: "#", variant: "api" },
      { id: "api-661", label: "API 661", href: "#", variant: "api" },
      { id: "api-662", label: "API 662", href: "#", variant: "api" },
      { id: "tema", label: "TEMA", href: "#", variant: "nonApi" },
      { id: "alpeema", label: "ALPEMA", href: "#", variant: "nonApi" },
      {
        id: "asme-viii-1-heat",
        label: "ASME VIII-1",
        href: "#",
        variant: "nonApi",
      },
    ],
  },
  {
    id: "injection-process-mix-points",
    title: "Injection / Process Mix Points",
    x: 81,
    y: 91,
    width: 12,
    items: [
      { id: "nace-sp0114", label: "NACE SP0114", href: "#", variant: "nonApi" },
    ],
  },
];

/**
 * Decorative SVG connections.
 * Coordinates are percentage-based and tuned for the current layout.
 */
export const DIAGRAM_CONNECTIONS: DiagramConnection[] = [
  // In-Service Inspection hub connections
  { id: "c-1", from: { x: 31, y: 43 }, to: { x: 12, y: 20 } },
  { id: "c-2", from: { x: 31, y: 43 }, to: { x: 21, y: 20 } },
  { id: "c-3", from: { x: 31, y: 43 }, to: { x: 35, y: 20 } },
  { id: "c-4", from: { x: 31, y: 43 }, to: { x: 49, y: 20 } },
  { id: "c-5", from: { x: 31, y: 43 }, to: { x: 63, y: 20 } },
  { id: "c-6", from: { x: 31, y: 43 }, to: { x: 8, y: 35 } },
  { id: "c-7", from: { x: 31, y: 43 }, to: { x: 8, y: 56 } },
  { id: "c-8", from: { x: 31, y: 43 }, to: { x: 63, y: 40 } },
  { id: "c-9", from: { x: 31, y: 43 }, to: { x: 64, y: 56 } },

  // Design & Repair hub connections
  { id: "c-10", from: { x: 31, y: 76 }, to: { x: 17, y: 73 } },
  { id: "c-11", from: { x: 31, y: 76 }, to: { x: 8, y: 84 } },
  { id: "c-12", from: { x: 31, y: 76 }, to: { x: 11, y: 95 } },
  { id: "c-13", from: { x: 31, y: 76 }, to: { x: 18, y: 106 } },
  { id: "c-14", from: { x: 31, y: 76 }, to: { x: 40, y: 106 } },
  { id: "c-15", from: { x: 31, y: 76 }, to: { x: 39, y: 62 } },
  { id: "c-16", from: { x: 31, y: 76 }, to: { x: 27, y: 62 } },
  { id: "c-17", from: { x: 31, y: 76 }, to: { x: 62, y: 75 } },
  { id: "c-18", from: { x: 31, y: 76 }, to: { x: 65, y: 87 } },
  { id: "c-19", from: { x: 31, y: 76 }, to: { x: 68, y: 106 } },

  // MI Engineering / Process Safety hub connections
  { id: "c-20", from: { x: 72, y: 43 }, to: { x: 76, y: 23 } },
  { id: "c-21", from: { x: 72, y: 43 }, to: { x: 86, y: 23 } },
  { id: "c-22", from: { x: 72, y: 43 }, to: { x: 95, y: 23 } },
  { id: "c-23", from: { x: 72, y: 43 }, to: { x: 92, y: 50 } },
  { id: "c-24", from: { x: 72, y: 43 }, to: { x: 86, y: 63 } },
  { id: "c-25", from: { x: 72, y: 43 }, to: { x: 63, y: 40 } },
  { id: "c-26", from: { x: 72, y: 43 }, to: { x: 64, y: 56 } },

  // Corrosion hub connections
  { id: "c-27", from: { x: 72, y: 76 }, to: { x: 86, y: 63 } },
  { id: "c-28", from: { x: 72, y: 76 }, to: { x: 92, y: 84 } },
  { id: "c-29", from: { x: 72, y: 76 }, to: { x: 87, y: 95 } },
  { id: "c-30", from: { x: 72, y: 76 }, to: { x: 64, y: 87 } },
  { id: "c-31", from: { x: 72, y: 76 }, to: { x: 65, y: 106 } },

  // Cross-hub connections
  { id: "c-32", from: { x: 31, y: 43 }, to: { x: 72, y: 43 } },
  { id: "c-33", from: { x: 31, y: 76 }, to: { x: 72, y: 76 } },
  { id: "c-34", from: { x: 31, y: 43 }, to: { x: 31, y: 76 } },
  { id: "c-35", from: { x: 72, y: 43 }, to: { x: 72, y: 76 } },
];
