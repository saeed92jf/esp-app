// src/data/equipmentDiagram.ts
import { DiagramNode, DiagramEdge } from "@/types/nodes";

// ---------------------------------------------------------------------------
// Color tokens — change once, apply everywhere
// ---------------------------------------------------------------------------
export const COLORS = {
  api: "#22c55e",
  asme: "#6b7280",
  astm: "#6b7280",
  nace: "#6b7280",
  nbic: "#6b7280",
  other: "#6b7280",
  hub: "#f3f4f6",
  category: "#f3f4f6",
} as const;

// ---------------------------------------------------------------------------
// Edge style presets
// ---------------------------------------------------------------------------
const HUB_EDGE = { animated: true, style: { stroke: "#94a3b8" } } as const;
const CHILD_EDGE = { style: { stroke: "#cbd5e1" } } as const;

// ---------------------------------------------------------------------------
// Node factory helpers
// ---------------------------------------------------------------------------

/** Creates a top-level Hub node */
function hub(
  id: string,
  label: string,
  position: { x: number; y: number },
  description = "",
): DiagramNode {
  return {
    id,
    type: "hub",
    position,
    data: { label, color: COLORS.hub, type: "hub", description },
  };
}

/** Creates a Category node as a child of a hub */
function category(
  id: string,
  label: string,
  parentId: string,
  position: { x: number; y: number }, // relative to parent hub
  categoryLabel: string,
): DiagramNode {
  return {
    id,
    type: "category",
    parentId,
    // extent: "parent",  // uncomment to restrict dragging inside parent bounds
    position,
    data: {
      label,
      color: COLORS.category,
      type: "category",
    },
  };
}

type StandardType = "API" | "ASME" | "ASTM" | "NACE" | "NBIC" | "OTHER";

/** Creates a Standard node (leaf) */
function standard(
  id: string,
  stdType: StandardType,
  stdNumber: string,
  parentId: string,
  position: { x: number; y: number }, // relative to parent hub
  fullName = "",
  url = "",
): DiagramNode {
  const colorMap: Record<StandardType, string> = {
    API: COLORS.api,
    ASME: COLORS.asme,
    ASTM: COLORS.astm,
    NACE: COLORS.nace,
    NBIC: COLORS.nbic,
    OTHER: COLORS.other,
  };
  return {
    id,
    type: "standard",
    parentId,
    // extent: "parent",
    position,
    data: {
      label: `${stdType}\n${stdNumber}`,
      color: colorMap[stdType],
      type: "standard",
      standardType: stdType,
      standardNumber: stdNumber,
      fullName,
      url,
    },
  };
}

/** Creates a hub→category or category→standard edge */
function edge(
  id: string,
  source: string,
  target: string,
  preset: typeof HUB_EDGE | typeof CHILD_EDGE = CHILD_EDGE,
): DiagramEdge {
  return { id, source, target, ...preset };
}

// ---------------------------------------------------------------------------
// HUB POSITIONS  (absolute — these are the drag anchors)
// ---------------------------------------------------------------------------
const HUB_POS = {
  inService: { x: 500, y: 400 },
  designRepair: { x: 500, y: 1000 },
  miEngineering: { x: 1300, y: 400 },
  corrosion: { x: 1300, y: 900 },
} as const;

// ---------------------------------------------------------------------------
// NODES
// ---------------------------------------------------------------------------
export const initialNodes: DiagramNode[] = [
  // =========================================================================
  // HUB 1 — In-Service Inspection
  // =========================================================================
  hub(
    "in-service",
    "In-Service\nInspection",
    HUB_POS.inService,
    "Central hub for in-service inspection standards and codes",
  ),

  // --- Pressure Vessel ---
  category(
    "pressure-vessel",
    "Pressure Vessel",
    "in-service",
    { x: -400, y: -350 },
    "In-Service Inspection",
  ),
  standard(
    "api-510",
    "API",
    "510",
    "in-service",
    { x: -500, y: -450 },
    "Pressure Vessel Inspection Code",
    "https://www.api.org/products-and-services/standards/api-510",
  ),
  standard(
    "api-572",
    "API",
    "572",
    "in-service",
    { x: -380, y: -450 },
    "Inspection of Pressure Vessels",
    "https://www.api.org/products-and-services/standards/api-572",
  ),
  standard(
    "nbic-part-3",
    "NBIC",
    "Part 3",
    "in-service",
    { x: -260, y: -450 },
    "National Board Inspection Code Part 3",
    "https://www.nationalboard.org/index.aspx?pageID=108",
  ),

  // --- Piping ---
  category(
    "piping",
    "Piping",
    "in-service",
    { x: -150, y: -350 },
    "In-Service Inspection",
  ),
  standard(
    "api-570",
    "API",
    "570",
    "in-service",
    { x: -200, y: -450 },
    "Piping Inspection Code",
    "https://www.api.org/products-and-services/standards/api-570",
  ),
  standard(
    "api-574",
    "API",
    "574",
    "in-service",
    { x: -80, y: -450 },
    "Inspection Practices for Piping System Components",
    "https://www.api.org/products-and-services/standards/api-574",
  ),

  // --- Aboveground Storage Tank ---
  category(
    "storage-tank",
    "Aboveground\nStorage Tank",
    "in-service",
    { x: 80, y: -350 },
    "In-Service Inspection",
  ),
  standard(
    "api-653",
    "API",
    "653",
    "in-service",
    { x: 20, y: -450 },
    "Tank Inspection, Repair, Alteration, and Reconstruction",
    "https://www.api.org/products-and-services/standards/api-653",
  ),
  standard(
    "sti-sp001",
    "OTHER",
    "SP001",
    "in-service",
    { x: 100, y: -450 },
    "Standard for Inspection of In-Service Shop Fabricated Aboveground Tanks",
    "https://www.steeltank.com/Publications/STISPandSTIRPublications/STIPUBSP001/tabid/151/Default.aspx",
  ),
  standard(
    "api-650-ast",
    "API",
    "650",
    "in-service",
    { x: 180, y: -450 },
    "Welded Tanks for Oil Storage",
    "https://www.api.org/products-and-services/standards/api-650",
  ),
  standard(
    "api-12r1",
    "API",
    "12R1",
    "in-service",
    { x: 260, y: -450 },
    "Setting, Maintenance, Inspection, Operation and Repair of Tanks",
    "https://www.api.org/products-and-services/standards/api-12r1",
  ),

  // --- NDE ---
  category(
    "nde",
    "NDE",
    "in-service",
    { x: 320, y: -350 },
    "In-Service Inspection",
  ),
  standard(
    "api-580",
    "API",
    "580",
    "in-service",
    { x: 260, y: -450 }, // reuse slot ok — different parent path
    "Risk-Based Inspection",
    "https://www.api.org/products-and-services/standards/api-580",
  ),
  standard(
    "asme-v",
    "ASME",
    "V",
    "in-service",
    { x: 340, y: -450 },
    "Nondestructive Examination",
    "https://www.asme.org/codes-standards/find-codes-standards/bpvc-v-bpvc-section-v",
  ),
  standard(
    "astm-nde",
    "ASTM",
    "Various",
    "in-service",
    { x: 420, y: -450 },
    "ASTM NDE Standards",
    "https://www.astm.org/products-services/standards-and-publications/standards.html",
  ),

  // --- Pipeline ---
  category(
    "pipeline",
    "Pipeline",
    "in-service",
    { x: 480, y: -350 },
    "In-Service Inspection",
  ),
  standard(
    "api-1104",
    "API",
    "1104",
    "in-service",
    { x: 380, y: -450 },
    "Welding of Pipelines and Related Facilities",
    "https://www.api.org/products-and-services/standards/api-1104",
  ),
  standard(
    "api-1163",
    "API",
    "1163",
    "in-service",
    { x: 460, y: -450 },
    "In-line Inspection Systems Qualification",
    "https://www.api.org/products-and-services/standards/api-1163",
  ),
  standard(
    "api-1169",
    "API",
    "1169",
    "in-service",
    { x: 540, y: -450 },
    "Pipeline Construction Inspection",
    "https://www.api.org/products-and-services/standards/api-1169",
  ),
  standard(
    "api-1171",
    "API",
    "1171",
    "in-service",
    { x: 620, y: -450 },
    "Functional Integrity Management for Natural Gas Storage",
    "https://www.api.org/products-and-services/standards/api-1171",
  ),
  standard(
    "api-1173",
    "API",
    "1173",
    "in-service",
    { x: 700, y: -450 },
    "Pipeline Safety Management Systems",
    "https://www.api.org/products-and-services/standards/api-1173",
  ),

  // --- Risk Based Inspection ---
  category(
    "rbi",
    "Risk Based\nInspection",
    "in-service",
    { x: 450, y: -100 },
    "In-Service Inspection",
  ),
  standard(
    "api-580-rbi",
    "API",
    "580",
    "in-service",
    { x: 520, y: -200 },
    "Risk-Based Inspection",
    "https://www.api.org/products-and-services/standards/api-580",
  ),
  standard(
    "api-581",
    "API",
    "581",
    "in-service",
    { x: 620, y: -200 },
    "Risk-Based Inspection Methodology",
    "https://www.api.org/products-and-services/standards/api-581",
  ),
  standard(
    "asme-rbi",
    "ASME",
    "PCC-3",
    "in-service",
    { x: 720, y: -200 },
    "Inspection Planning Using Risk-Based Methods",
    "https://www.asme.org/codes-standards/find-codes-standards/pcc-3-inspection-planning-using-risk-based-methods",
  ),

  // --- Fitness-For-Service ---
  category(
    "ffs",
    "Fitness-For-\nService",
    "in-service",
    { x: 450, y: 150 },
    "In-Service Inspection",
  ),
  standard(
    "api-579",
    "API",
    "579-1",
    "in-service",
    { x: 520, y: 250 },
    "Fitness-For-Service",
    "https://www.api.org/products-and-services/standards/api-579",
  ),
  standard(
    "asme-ffs",
    "ASME",
    "FFS-1",
    "in-service",
    { x: 640, y: 250 },
    "Fitness-For-Service",
    "https://www.asme.org/codes-standards/find-codes-standards/ffs-1-fitness-for-service",
  ),

  // --- PRDs ---
  category(
    "prds",
    "PRDs",
    "in-service",
    { x: -400, y: -100 },
    "In-Service Inspection",
  ),
  standard(
    "api-576",
    "API",
    "576",
    "in-service",
    { x: -520, y: -200 },
    "Inspection of Pressure-Relieving Devices",
    "https://www.api.org/products-and-services/standards/api-576",
  ),
  standard(
    "api-520",
    "API",
    "520",
    "in-service",
    { x: -400, y: -200 },
    "Sizing, Selection, and Installation of PRDs Part I",
    "https://www.api.org/products-and-services/standards/api-520",
  ),
  standard(
    "api-521",
    "API",
    "521",
    "in-service",
    { x: -280, y: -200 },
    "Pressure-Relieving and Depressuring Systems",
    "https://www.api.org/products-and-services/standards/api-521",
  ),
  standard(
    "nbic-part-3-prd",
    "NBIC",
    "Part 3",
    "in-service",
    { x: -400, y: -300 },
    "National Board Inspection Code Part 3",
    "https://www.nationalboard.org/index.aspx?pageID=108",
  ),

  // --- FRP Asset ---
  category(
    "frp-asset",
    "FRP Asset",
    "in-service",
    { x: -400, y: 150 },
    "In-Service Inspection",
  ),
  standard(
    "api-12p",
    "API",
    "12P",
    "in-service",
    { x: -520, y: 280 },
    "Specification for Fiberglass Reinforced Plastic Tanks",
    "https://www.api.org/products-and-services/standards/api-12p",
  ),
  standard(
    "astm-frp-1",
    "ASTM",
    "Various",
    "in-service",
    { x: -400, y: 280 },
    "ASTM Standards for FRP",
    "https://www.astm.org",
  ),
  standard(
    "astm-frp-2",
    "ASTM",
    "Various",
    "in-service",
    { x: -280, y: 280 },
    "ASTM Standards for FRP (additional)",
    "https://www.astm.org",
  ),
  standard(
    "asme-rtpx",
    "ASME",
    "RTP-X",
    "in-service",
    { x: -160, y: 280 },
    "Reinforced Thermoset Plastic Corrosion-Resistant Equipment",
    "https://www.asme.org/codes-standards/find-codes-standards/rtp-1-reinforced-thermoset-plastic-corrosion-resistant-equipment",
  ),

  // --- Fired Heaters ---
  category(
    "fired-heaters",
    "Fired\nHeaters",
    "in-service",
    { x: -150, y: 150 },
    "In-Service Inspection",
  ),
  standard(
    "api-573",
    "API",
    "573",
    "in-service",
    { x: -200, y: 280 },
    "Inspection of Fired Boilers and Heaters",
    "https://www.api.org/products-and-services/standards/api-573",
  ),
  standard(
    "astm-fh-1",
    "ASTM",
    "Various",
    "in-service",
    { x: -80, y: 280 },
    "ASTM Standards for Fired Heaters",
    "https://www.astm.org",
  ),
  standard(
    "astm-fh-2",
    "ASTM",
    "Various",
    "in-service",
    { x: 40, y: 280 },
    "ASTM Standards for Fired Heaters (additional)",
    "https://www.astm.org",
  ),
  standard(
    "ppta",
    "OTHER",
    "PPTA",
    "in-service",
    { x: 160, y: 280 },
    "Petroleum and Petrochemical Tubular Association",
    "",
  ),

  // --- Quality ---
  category(
    "quality",
    "Quality",
    "in-service",
    { x: 80, y: 150 },
    "In-Service Inspection",
  ),
  standard(
    "api-577",
    "API",
    "577",
    "in-service",
    { x: 60, y: 280 },
    "Welding Inspection and Metallurgy",
    "https://www.api.org/products-and-services/standards/api-577",
  ),
  standard(
    "api-578",
    "API",
    "578",
    "in-service",
    { x: 180, y: 280 },
    "Material Verification Program for New and Existing High-Pressure Equipment",
    "https://www.api.org/products-and-services/standards/api-578",
  ),

  // =========================================================================
  // HUB 2 — Design & Repair
  // =========================================================================
  hub(
    "design-repair",
    "Design & Repair",
    HUB_POS.designRepair,
    "Central hub for design and repair standards",
  ),

  // --- Repair ---
  category(
    "repair",
    "Repair",
    "design-repair",
    { x: -100, y: -200 },
    "Design & Repair",
  ),
  standard(
    "asme-pcc-2",
    "ASME",
    "PCC-2",
    "design-repair",
    { x: -200, y: -300 },
    "Repair of Pressure Equipment and Piping",
    "https://www.asme.org/codes-standards/find-codes-standards/pcc-2-repair-pressure-equipment-piping",
  ),
  standard(
    "nbic-part-3-repair",
    "NBIC",
    "Part 3",
    "design-repair",
    { x: -40, y: -300 },
    "National Board Inspection Code Part 3",
    "https://www.nationalboard.org/index.aspx?pageID=108",
  ),

  // --- Welding ---
  category(
    "welding",
    "Welding",
    "design-repair",
    { x: -350, y: -100 },
    "Design & Repair",
  ),
  standard(
    "api-577-weld",
    "API",
    "577",
    "design-repair",
    { x: -480, y: -200 },
    "Welding Inspection and Metallurgy",
    "https://www.api.org/products-and-services/standards/api-577",
  ),
  standard(
    "asme-ix",
    "ASME",
    "IX",
    "design-repair",
    { x: -360, y: -200 },
    "Welding, Brazing, and Fusing Qualifications",
    "https://www.asme.org/codes-standards/find-codes-standards/bpvc-ix-bpvc-section-ix",
  ),
  standard(
    "api-1104-weld",
    "API",
    "1104",
    "design-repair",
    { x: -240, y: -200 },
    "Welding of Pipelines and Related Facilities",
    "https://www.api.org/products-and-services/standards/api-1104",
  ),

  // --- Heater / Boiler ---
  category(
    "heater-boiler",
    "Heater/Boiler",
    "design-repair",
    { x: -550, y: -100 },
    "Design & Repair",
  ),
  standard(
    "api-530",
    "API",
    "530",
    "design-repair",
    { x: -680, y: -200 },
    "Calculation of Heater-Tube Thickness in Petroleum Refineries",
    "https://www.api.org/products-and-services/standards/api-530",
  ),
  standard(
    "api-560",
    "API",
    "560",
    "design-repair",
    { x: -560, y: -200 },
    "Fired Heaters for General Refinery Service",
    "https://www.api.org/products-and-services/standards/api-560",
  ),
  standard(
    "api-556",
    "API",
    "556",
    "design-repair",
    { x: -440, y: -200 },
    "Instrumentation and Control Systems for Fired Heaters",
    "https://www.api.org/products-and-services/standards/api-556",
  ),
  standard(
    "asme-i-hb",
    "ASME",
    "I",
    "design-repair",
    { x: -560, y: -300 },
    "Power Boilers",
    "https://www.asme.org/codes-standards/find-codes-standards/bpvc-i-bpvc-section-i",
  ),

  // --- Pressure Vessel Design ---
  category(
    "pv-design",
    "Pressure Vessel",
    "design-repair",
    { x: -550, y: 150 },
    "Design & Repair",
  ),
  standard(
    "api-510-design",
    "API",
    "510",
    "design-repair",
    { x: -680, y: 280 },
    "Pressure Vessel Inspection Code",
    "https://www.api.org/products-and-services/standards/api-510",
  ),
  standard(
    "asme-viii-1-design",
    "ASME",
    "VIII-1",
    "design-repair",
    { x: -560, y: 280 },
    "Rules for Construction of Pressure Vessels Division 1",
    "https://www.asme.org/codes-standards/find-codes-standards/bpvc-viii-1-bpvc-section-viii-division-1",
  ),
  standard(
    "asme-viii-2-design",
    "ASME",
    "VIII-2",
    "design-repair",
    { x: -440, y: 280 },
    "Rules for Construction of Pressure Vessels Division 2",
    "https://www.asme.org/codes-standards/find-codes-standards/bpvc-viii-2-bpvc-section-viii-division-2",
  ),

  // --- Aboveground Storage Tanks Design ---
  category(
    "ast-design",
    "Aboveground Storage Tanks",
    "design-repair",
    { x: -200, y: 150 },
    "Design & Repair",
  ),
  standard(
    "api-620-design",
    "API",
    "620",
    "design-repair",
    { x: -360, y: 280 },
    "Design and Construction of Large, Welded, Low-Pressure Storage Tanks",
    "https://www.api.org/products-and-services/standards/api-620",
  ),
  standard(
    "api-650-design",
    "API",
    "650",
    "design-repair",
    { x: -240, y: 280 },
    "Welded Tanks for Oil Storage",
    "https://www.api.org/products-and-services/standards/api-650",
  ),
  standard(
    "api-12f-design",
    "API",
    "12F",
    "design-repair",
    { x: -120, y: 280 },
    "Specification for Shop Welded Tanks for Storage of Production Liquids",
    "https://www.api.org/products-and-services/standards/api-12f",
  ),
  standard(
    "api-12d-design",
    "API",
    "12D",
    "design-repair",
    { x: 0, y: 280 },
    "Specification for Field Welded Tanks for Storage of Production Liquids",
    "https://www.api.org/products-and-services/standards/api-12d",
  ),

  // --- Piping / Pipelines Design ---
  category(
    "piping-design",
    "Piping / Pipelines",
    "design-repair",
    { x: 200, y: 150 },
    "Design & Repair",
  ),
  standard(
    "api-570-design",
    "API",
    "570",
    "design-repair",
    { x: 20, y: 280 },
    "Piping Inspection Code",
    "https://www.api.org/products-and-services/standards/api-570",
  ),
  standard(
    "asme-b31-3-design",
    "ASME",
    "B31.3",
    "design-repair",
    { x: 140, y: 280 },
    "Process Piping",
    "https://www.asme.org/codes-standards/find-codes-standards/b31-3-process-piping",
  ),
  standard(
    "asme-b31-4-design",
    "ASME",
    "B31.4",
    "design-repair",
    { x: 260, y: 280 },
    "Pipeline Transportation Systems for Liquid Hydrocarbons",
    "https://www.asme.org/codes-standards/find-codes-standards/b31-4-pipeline-transportation-systems",
  ),
  standard(
    "asme-b31-8-design",
    "ASME",
    "B31.8",
    "design-repair",
    { x: 380, y: 280 },
    "Gas Transmission and Distribution Piping Systems",
    "https://www.asme.org/codes-standards/find-codes-standards/b31-8-gas-transmission-distribution-piping-systems",
  ),
  standard(
    "api-1104-design",
    "API",
    "1104",
    "design-repair",
    { x: 500, y: 280 },
    "Welding of Pipelines and Related Facilities",
    "https://www.api.org/products-and-services/standards/api-1104",
  ),

  // --- Heat Exchangers Design ---
  category(
    "heat-exchangers-design",
    "Heat Exchangers",
    "design-repair",
    { x: 500, y: 150 },
    "Design & Repair",
  ),
  standard(
    "tema-design",
    "OTHER",
    "TEMA",
    "design-repair",
    { x: 440, y: 280 },
    "Standards of the Tubular Exchanger Manufacturers Association",
    "https://www.tema.org/tema-standards.html",
  ),
  standard(
    "api-660-design",
    "API",
    "660",
    "design-repair",
    { x: 560, y: 280 },
    "Shell-and-Tube Heat Exchangers",
    "https://www.api.org/products-and-services/standards/api-660",
  ),
  standard(
    "api-661-design",
    "API",
    "661",
    "design-repair",
    { x: 680, y: 280 },
    "Air-Cooled Heat Exchangers",
    "https://www.api.org/products-and-services/standards/api-661",
  ),

  // --- Rotating Equipment Design ---
  category(
    "rotating-equipment-design",
    "Rotating Equipment",
    "design-repair",
    { x: 350, y: -100 },
    "Design & Repair",
  ),
  standard(
    "api-610-design",
    "API",
    "610",
    "design-repair",
    { x: 200, y: -200 },
    "Centrifugal Pumps for Petroleum, Petrochemical and Natural Gas Industries",
    "https://www.api.org/products-and-services/standards/api-610",
  ),
  standard(
    "api-617-design",
    "API",
    "617",
    "design-repair",
    { x: 320, y: -200 },
    "Axial and Centrifugal Compressors",
    "https://www.api.org/products-and-services/standards/api-617",
  ),
  standard(
    "api-672-design",
    "API",
    "672",
    "design-repair",
    { x: 440, y: -200 },
    "Packaged, Integrally Geared Centrifugal Air Compressors",
    "https://www.api.org/products-and-services/standards/api-672",
  ),
  standard(
    "api-618-design",
    "API",
    "618",
    "design-repair",
    { x: 560, y: -200 },
    "Reciprocating Compressors for Petroleum",
    "https://www.api.org/products-and-services/standards/api-618",
  ),
  standard(
    "ahri-design",
    "OTHER",
    "AHRI",
    "design-repair",
    { x: 680, y: -200 },
    "Air-Conditioning, Heating, and Refrigeration Institute Standards",
    "https://www.ahrinet.org/standards",
  ),

  // =========================================================================
  // HUB 3 — MI Engineering / Process Safety
  // =========================================================================
  hub(
    "mi-engineering",
    "MI Engineering /\nProcess Safety",
    HUB_POS.miEngineering,
    "Central hub for mechanical integrity engineering and process safety",
  ),

  // --- Relief Systems ---
  category(
    "relief-systems",
    "Relief Systems",
    "mi-engineering",
    { x: -400, y: -250 },
    "MI Engineering / Process Safety",
  ),
  standard(
    "api-520-relief",
    "API",
    "520",
    "mi-engineering",
    { x: -520, y: -380 },
    "Sizing, Selection, and Installation of PRDs Part I",
    "https://www.api.org/products-and-services/standards/api-520",
  ),
  standard(
    "api-521-relief",
    "API",
    "521",
    "mi-engineering",
    { x: -400, y: -380 },
    "Pressure-Relieving and Depressuring Systems",
    "https://www.api.org/products-and-services/standards/api-521",
  ),
  standard(
    "asme-i-relief",
    "ASME",
    "I",
    "mi-engineering",
    { x: -280, y: -380 },
    "Power Boilers",
    "https://www.asme.org/codes-standards/find-codes-standards/bpvc-i-bpvc-section-i",
  ),

  // --- Blowdown & Flare Systems ---
  category(
    "blowdown-flare",
    "Blowdown &\nFlare Systems",
    "mi-engineering",
    { x: -150, y: -250 },
    "MI Engineering / Process Safety",
  ),
  standard(
    "api-521-flare",
    "API",
    "521",
    "mi-engineering",
    { x: -220, y: -380 },
    "Pressure-Relieving and Depressuring Systems",
    "https://www.api.org/products-and-services/standards/api-521",
  ),
  standard(
    "api-537-flare",
    "API",
    "537",
    "mi-engineering",
    { x: -100, y: -380 },
    "Flare Details for General Refinery and Petrochemical Service",
    "https://www.api.org/products-and-services/standards/api-537",
  ),

  // --- Piping System (MI) ---
  category(
    "piping-system-mi",
    "Piping System",
    "mi-engineering",
    { x: 100, y: -250 },
    "MI Engineering / Process Safety",
  ),
  standard(
    "asme-b31-3-mi",
    "ASME",
    "B31.3",
    "mi-engineering",
    { x: 0, y: -380 },
    "Process Piping",
    "https://www.asme.org/codes-standards/find-codes-standards/b31-3-process-piping",
  ),
  standard(
    "mss-sp-mi",
    "OTHER",
    "SP",
    "mi-engineering",
    { x: 120, y: -380 },
    "Manufacturers Standardization Society Standard Practices",
    "https://www.mss-hq.org/Standards/StandardsList.cfm",
  ),
  standard(
    "pfi-mi",
    "OTHER",
    "PFI",
    "mi-engineering",
    { x: 240, y: -380 },
    "Pipe Fabrication Institute Standards",
    "https://www.pfi-institute.org",
  ),

  // --- Tank Venting & Flashing ---
  category(
    "tank-venting",
    "Tank Venting &\nFlashing",
    "mi-engineering",
    { x: 350, y: -250 },
    "MI Engineering / Process Safety",
  ),
  standard(
    "api-2000-venting",
    "API",
    "2000",
    "mi-engineering",
    { x: 300, y: -380 },
    "Venting Atmospheric and Low-Pressure Storage Tanks",
    "https://www.api.org/products-and-services/standards/api-2000",
  ),
  standard(
    "api-2003-venting",
    "API",
    "2003",
    "mi-engineering",
    { x: 420, y: -380 },
    "Protection Against Ignitions Arising Out of Static, Lightning, and Stray Currents",
    "https://www.api.org/products-and-services/standards/api-2003",
  ),

  // --- Process Hazard Analysis ---
  category(
    "pha",
    "Process Hazard\nAnalysis",
    "mi-engineering",
    { x: -400, y: 0 },
    "MI Engineering / Process Safety",
  ),
  standard(
    "api-14c-pha",
    "API",
    "14C",
    "mi-engineering",
    { x: -520, y: -120 },
    "Analysis, Design, Installation and Testing of Safety Systems",
    "https://www.api.org/products-and-services/standards/api-14c",
  ),
  standard(
    "iec-61511",
    "OTHER",
    "61511",
    "mi-engineering",
    { x: -400, y: -120 },
    "Functional Safety - Safety Instrumented Systems",
    "https://webstore.iec.ch/publication/5427",
  ),
  standard(
    "api-754-pha",
    "API",
    "754",
    "mi-engineering",
    { x: -280, y: -120 },
    "Process Safety Performance Indicators",
    "https://www.api.org/products-and-services/standards/api-754",
  ),

  // --- Safety Instrumented Systems ---
  category(
    "sis",
    "Safety Instrumented\nSystems",
    "mi-engineering",
    { x: -150, y: 0 },
    "MI Engineering / Process Safety",
  ),
  standard(
    "iec-61508",
    "OTHER",
    "61508",
    "mi-engineering",
    { x: -220, y: -120 },
    "Functional Safety of E/E/PE Safety-Related Systems",
    "https://webstore.iec.ch/publication/5515",
  ),
  standard(
    "iec-61511-sis",
    "OTHER",
    "61511",
    "mi-engineering",
    { x: -100, y: -120 },
    "Functional Safety - Safety Instrumented Systems",
    "https://webstore.iec.ch/publication/5427",
  ),
  standard(
    "api-14c-sis",
    "API",
    "14C",
    "mi-engineering",
    { x: 20, y: -120 },
    "Analysis, Design, Installation and Testing of Safety Systems",
    "https://www.api.org/products-and-services/standards/api-14c",
  ),

  // --- LOPC / BLEVE / MI Programs ---
  category(
    "lopc-mi",
    "LOPC / BLEVE /\nMI Programs",
    "mi-engineering",
    { x: 100, y: 0 },
    "MI Engineering / Process Safety",
  ),
  standard(
    "api-754-lopc",
    "API",
    "754",
    "mi-engineering",
    { x: 20, y: -120 },
    "Process Safety Performance Indicators",
    "https://www.api.org/products-and-services/standards/api-754",
  ),
  standard(
    "api-770",
    "API",
    "770",
    "mi-engineering",
    { x: 140, y: -120 },
    "A Manager's Guide to Reducing Human Errors",
    "https://www.api.org/products-and-services/standards/api-770",
  ),
  standard(
    "api-689",
    "API",
    "689",
    "mi-engineering",
    { x: 260, y: -120 },
    "Collection and Exchange of Reliability and Maintenance Data",
    "https://www.api.org/products-and-services/standards/api-689",
  ),

  // --- Material Selection ---
  category(
    "material-selection",
    "Material\nSelection",
    "mi-engineering",
    { x: 350, y: 0 },
    "MI Engineering / Process Safety",
  ),
  standard(
    "api-571",
    "API",
    "571",
    "mi-engineering",
    { x: 280, y: -120 },
    "Damage Mechanisms Affecting Fixed Equipment in the Refining Industry",
    "https://www.api.org/products-and-services/standards/api-571",
  ),
  standard(
    "api-939c",
    "API",
    "939-C",
    "mi-engineering",
    { x: 400, y: -120 },
    "Guidelines for Avoiding Sulfidation Corrosion Failures",
    "https://www.api.org/products-and-services/standards/api-939c",
  ),
  standard(
    "api-941",
    "API",
    "941",
    "mi-engineering",
    { x: 520, y: -120 },
    "Steels for Hydrogen Service at Elevated Temperatures and Pressures",
    "https://www.api.org/products-and-services/standards/api-941",
  ),
  standard(
    "nace-mr0175",
    "NACE",
    "MR0175",
    "mi-engineering",
    { x: 640, y: -120 },
    "Sulfide Stress Cracking Resistant Metallic Materials for Oil Field Equipment",
    "https://store.nace.org/nace-mr0175-iso-15156-1",
  ),

  // --- Heat Exchangers (MI) ---
  category(
    "heat-exchangers-mi",
    "Heat Exchangers",
    "mi-engineering",
    { x: -400, y: 250 },
    "MI Engineering / Process Safety",
  ),
  standard(
    "api-660-mi",
    "API",
    "660",
    "mi-engineering",
    { x: -520, y: 380 },
    "Shell-and-Tube Heat Exchangers",
    "https://www.api.org/products-and-services/standards/api-660",
  ),
  standard(
    "api-661-mi",
    "API",
    "661",
    "mi-engineering",
    { x: -400, y: 380 },
    "Air-Cooled Heat Exchangers",
    "https://www.api.org/products-and-services/standards/api-661",
  ),
  standard(
    "tema-mi",
    "OTHER",
    "TEMA",
    "mi-engineering",
    { x: -280, y: 380 },
    "Standards of the Tubular Exchanger Manufacturers Association",
    "https://www.tema.org/tema-standards.html",
  ),

  // --- Electrical Equipment ---
  category(
    "electrical-mi",
    "Electrical\nEquipment",
    "mi-engineering",
    { x: -150, y: 250 },
    "MI Engineering / Process Safety",
  ),
  standard(
    "nfpa-70",
    "OTHER",
    "NFPA 70",
    "mi-engineering",
    { x: -220, y: 380 },
    "National Electrical Code",
    "https://www.nfpa.org/codes-and-standards/all-codes-and-standards/list-of-codes-and-standards/detail?code=70",
  ),
  standard(
    "nfpa-70e",
    "OTHER",
    "NFPA 70E",
    "mi-engineering",
    { x: -100, y: 380 },
    "Standard for Electrical Safety in the Workplace",
    "https://www.nfpa.org/codes-and-standards/all-codes-and-standards/list-of-codes-and-standards/detail?code=70E",
  ),
  standard(
    "ieee-mi",
    "OTHER",
    "IEEE",
    "mi-engineering",
    { x: 20, y: 380 },
    "IEEE Standards for Electrical Equipment",
    "https://standards.ieee.org",
  ),

  // --- Rotating Equipment (MI) ---
  category(
    "rotating-equipment-mi",
    "Rotating Equipment",
    "mi-engineering",
    { x: 100, y: 250 },
    "MI Engineering / Process Safety",
  ),
  standard(
    "api-670-mi",
    "API",
    "670",
    "mi-engineering",
    { x: 20, y: 380 },
    "Machinery Protection Systems",
    "https://www.api.org/products-and-services/standards/api-670",
  ),
  standard(
    "api-686-mi",
    "API",
    "686",
    "mi-engineering",
    { x: 140, y: 380 },
    "Recommended Practice for Machinery Installation",
    "https://www.api.org/products-and-services/standards/api-686",
  ),
  standard(
    "api-687-mi",
    "API",
    "687",
    "mi-engineering",
    { x: 260, y: 380 },
    "Rotor Repair",
    "https://www.api.org/products-and-services/standards/api-687",
  ),
  standard(
    "iso-18436",
    "OTHER",
    "ISO 18436",
    "mi-engineering",
    { x: 380, y: 380 },
    "Condition monitoring and diagnostics of machines",
    "https://www.iso.org/standard/62933.html",
  ),

  // --- Controls & Instrumentation ---
  category(
    "controls-instrumentation",
    "Controls &\nInstrumentation",
    "mi-engineering",
    { x: 350, y: 250 },
    "MI Engineering / Process Safety",
  ),
  standard(
    "isa-5-1",
    "OTHER",
    "ISA 5.1",
    "mi-engineering",
    { x: 280, y: 380 },
    "Instrumentation Symbols and Identification",
    "https://www.isa.org/products/ansi-isa-5-1-2009-instrumentation-symbols-and-ident",
  ),
  standard(
    "isa-18-2",
    "OTHER",
    "ISA 18.2",
    "mi-engineering",
    { x: 400, y: 380 },
    "Management of Alarm Systems for the Process Industries",
    "https://www.isa.org/products/ansi-isa-18-2-2016-management-of-alarm-systems-for",
  ),
  standard(
    "api-554-ci",
    "API",
    "554",
    "mi-engineering",
    { x: 520, y: 380 },
    "Process Control Systems",
    "https://www.api.org/products-and-services/standards/api-554",
  ),

  // =========================================================================
  // HUB 4 — Corrosion / Materials
  // =========================================================================
  hub(
    "corrosion",
    "Corrosion /\nMaterials",
    HUB_POS.corrosion,
    "Central hub for corrosion control and materials standards",
  ),

  // --- Protective Coatings ---
  category(
    "protective-coatings",
    "Protective Coatings",
    "corrosion",
    { x: -400, y: -200 },
    "Corrosion / Materials",
  ),
  standard(
    "sspc-sp-coatings",
    "NACE",
    "SP0188",
    "corrosion",
    { x: -520, y: -320 },
    "Discontinuity (Holiday) Testing of New Protective Coatings",
    "https://store.nace.org/sp0188-2006",
  ),
  standard(
    "nace-rp0394",
    "NACE",
    "RP0394",
    "corrosion",
    { x: -400, y: -320 },
    "Application, Performance, and Quality Control of Plant-Applied Coatings",
    "https://store.nace.org",
  ),
  standard(
    "api-582-coatings",
    "API",
    "582",
    "corrosion",
    { x: -280, y: -320 },
    "Welding Guidelines for the Chemical, Oil, and Gas Industries",
    "https://www.api.org/products-and-services/standards/api-582",
  ),
  standard(
    "sspc-vis-1",
    "NACE",
    "VIS 1",
    "corrosion",
    { x: -160, y: -320 },
    "Guide and Reference Photographs for Steel Surfaces",
    "https://www.sspc.org/publications/standards-guides/",
  ),

  // --- Corrosion Assessment ---
  category(
    "corrosion-assessment",
    "Corrosion\nAssessment",
    "corrosion",
    { x: -150, y: -200 },
    "Corrosion / Materials",
  ),
  standard(
    "api-571-ca",
    "API",
    "571",
    "corrosion",
    { x: -220, y: -320 },
    "Damage Mechanisms Affecting Fixed Equipment in the Refining Industry",
    "https://www.api.org/products-and-services/standards/api-571",
  ),
  standard(
    "api-939c-ca",
    "API",
    "939-C",
    "corrosion",
    { x: -100, y: -320 },
    "Guidelines for Avoiding Sulfidation Corrosion Failures",
    "https://www.api.org/products-and-services/standards/api-939c",
  ),
  standard(
    "nace-sp0204",
    "NACE",
    "SP0204",
    "corrosion",
    { x: 20, y: -320 },
    "Stress Corrosion Cracking of Carbon Steel in Fuel Ethanol Service",
    "https://store.nace.org/sp0204-2008",
  ),

  // --- Cathodic Protection ---
  category(
    "cathodic-protection",
    "Cathodic\nProtection",
    "corrosion",
    { x: 100, y: -200 },
    "Corrosion / Materials",
  ),
  standard(
    "nace-sp0169",
    "NACE",
    "SP0169",
    "corrosion",
    { x: 20, y: -320 },
    "Control of External Corrosion on Underground or Submerged Metallic Piping",
    "https://store.nace.org/sp0169-2013",
  ),
  standard(
    "nace-sp0193",
    "NACE",
    "SP0193",
    "corrosion",
    { x: 140, y: -320 },
    "External Cathodic Protection of On-Grade Metallic Storage Tank Bottoms",
    "https://store.nace.org/sp0193-2001",
  ),
  standard(
    "nace-sp0285",
    "NACE",
    "SP0285",
    "corrosion",
    { x: 260, y: -320 },
    "External Corrosion Control of Underground Storage Tank Systems",
    "https://store.nace.org/sp0285-2011",
  ),
  standard(
    "api-651-cp",
    "API",
    "651",
    "corrosion",
    { x: 380, y: -320 },
    "Cathodic Protection of Aboveground Petroleum Storage Tanks",
    "https://www.api.org/products-and-services/standards/api-651",
  ),

  // --- Chemical Treatment ---
  category(
    "chemical-treatment",
    "Chemical\nTreatment",
    "corrosion",
    { x: 350, y: -200 },
    "Corrosion / Materials",
  ),
  standard(
    "nace-sp0191",
    "NACE",
    "SP0191",
    "corrosion",
    { x: 280, y: -320 },
    "The Application of Internal Plastic Coatings",
    "https://store.nace.org/sp0191-2016",
  ),
  standard(
    "api-945",
    "API",
    "945",
    "corrosion",
    { x: 400, y: -320 },
    "Avoiding Environmental Cracking in Amine Units",
    "https://www.api.org/products-and-services/standards/api-945",
  ),
  standard(
    "nace-tm0169",
    "NACE",
    "TM0169",
    "corrosion",
    { x: 520, y: -320 },
    "Laboratory Corrosion Testing of Metals",
    "https://store.nace.org/tm0169-tm0169-2012",
  ),

  // --- Material Testing ---
  category(
    "material-testing",
    "Material Testing",
    "corrosion",
    { x: -400, y: 100 },
    "Corrosion / Materials",
  ),
  standard(
    "astm-a370",
    "ASTM",
    "A370",
    "corrosion",
    { x: -520, y: 220 },
    "Standard Test Methods for Mechanical Testing of Steel Products",
    "https://www.astm.org/a0370-22.html",
  ),
  standard(
    "astm-e92",
    "ASTM",
    "E92",
    "corrosion",
    { x: -400, y: 220 },
    "Standard Test Methods for Vickers Hardness and Knoop Hardness",
    "https://www.astm.org/e0092-17.html",
  ),
  standard(
    "astm-e18",
    "ASTM",
    "E18",
    "corrosion",
    { x: -280, y: 220 },
    "Standard Test Methods for Rockwell Hardness of Metallic Materials",
    "https://www.astm.org/e0018-22.html",
  ),
  standard(
    "astm-g1",
    "ASTM",
    "G1",
    "corrosion",
    { x: -160, y: 220 },
    "Standard Practice for Preparing, Cleaning, and Evaluating Corrosion Test Specimens",
    "https://www.astm.org/g0001-03r11.html",
  ),

  // --- Alloy / Materials Specs ---
  category(
    "alloy-specs",
    "Alloy /\nMaterials Specs",
    "corrosion",
    { x: -150, y: 100 },
    "Corrosion / Materials",
  ),
  standard(
    "asme-ii-a",
    "ASME",
    "II-A",
    "corrosion",
    { x: -220, y: 220 },
    "Materials — Ferrous Material Specifications",
    "https://www.asme.org/codes-standards/find-codes-standards/bpvc-ii-a-bpvc-section-ii-part-a",
  ),
  standard(
    "asme-ii-b",
    "ASME",
    "II-B",
    "corrosion",
    { x: -100, y: 220 },
    "Materials — Nonferrous Material Specifications",
    "https://www.asme.org/codes-standards/find-codes-standards/bpvc-ii-b-bpvc-section-ii-part-b",
  ),
  standard(
    "asme-ii-c",
    "ASME",
    "II-C",
    "corrosion",
    { x: 20, y: 220 },
    "Materials — Specifications for Welding Rods, Electrodes, and Filler Metals",
    "https://www.asme.org/codes-standards/find-codes-standards/bpvc-ii-c-bpvc-section-ii-part-c",
  ),
  standard(
    "astm-a106",
    "ASTM",
    "A106",
    "corrosion",
    { x: 140, y: 220 },
    "Seamless Carbon Steel Pipe for High-Temperature Service",
    "https://www.astm.org/a0106_a0106m-19a.html",
  ),

  // --- CUI (Corrosion Under Insulation) ---
  category(
    "cui",
    "CUI",
    "corrosion",
    { x: 100, y: 100 },
    "Corrosion / Materials",
  ),
  standard(
    "api-583",
    "API",
    "583",
    "corrosion",
    { x: 20, y: 220 },
    "Corrosion Under Insulation and Fireproofing",
    "https://www.api.org/products-and-services/standards/api-583",
  ),
  standard(
    "nace-sp0198",
    "NACE",
    "SP0198",
    "corrosion",
    { x: 140, y: 220 },
    "Control of Corrosion Under Thermal Insulation and Fireproofing Materials",
    "https://store.nace.org/sp0198-2010",
  ),

  // --- Corrosion Monitoring ---
  category(
    "corrosion-monitoring",
    "Corrosion\nMonitoring",
    "corrosion",
    { x: 350, y: 100 },
    "Corrosion / Materials",
  ),
  standard(
    "api-570-cm",
    "API",
    "570",
    "corrosion",
    { x: 280, y: 220 },
    "Piping Inspection Code",
    "https://www.api.org/products-and-services/standards/api-570",
  ),
  standard(
    "nace-sp0775",
    "NACE",
    "SP0775",
    "corrosion",
    { x: 400, y: 220 },
    "Preparation, Installation, Analysis, and Interpretation of Corrosion Coupons",
    "https://store.nace.org/sp0775-2018",
  ),
  standard(
    "api-939e",
    "API",
    "939-E",
    "corrosion",
    { x: 520, y: 220 },
    "Identification, Repair, and Mitigation of Cracking of Carbon Steel Welds",
    "https://www.api.org/products-and-services/standards/api-939e",
  ),
];

// ---------------------------------------------------------------------------
// EDGES — Hub → Category (curved Bezier by default in React Flow)
// ---------------------------------------------------------------------------
export const initialEdges: DiagramEdge[] = [
  // Hub: In-Service Inspection → its categories
  edge("e-is-pv", "in-service", "pressure-vessel", HUB_EDGE),
  edge("e-is-pip", "in-service", "piping", HUB_EDGE),
  edge("e-is-ast", "in-service", "storage-tank", HUB_EDGE),
  edge("e-is-nde", "in-service", "nde", HUB_EDGE),
  edge("e-is-pl", "in-service", "pipeline", HUB_EDGE),
  edge("e-is-rbi", "in-service", "rbi", HUB_EDGE),
  edge("e-is-ffs", "in-service", "ffs", HUB_EDGE),
  edge("e-is-prd", "in-service", "prds", HUB_EDGE),
  edge("e-is-frp", "in-service", "frp-asset", HUB_EDGE),
  edge("e-is-fh", "in-service", "fired-heaters", HUB_EDGE),
  edge("e-is-qlt", "in-service", "quality", HUB_EDGE),

  // Hub: Design & Repair → its categories
  edge("e-dr-rep", "design-repair", "repair", HUB_EDGE),
  edge("e-dr-wel", "design-repair", "welding", HUB_EDGE),
  edge("e-dr-hb", "design-repair", "heater-boiler", HUB_EDGE),
  edge("e-dr-pv", "design-repair", "pv-design", HUB_EDGE),
  edge("e-dr-ast", "design-repair", "ast-design", HUB_EDGE),
  edge("e-dr-pip", "design-repair", "piping-design", HUB_EDGE),
  edge("e-dr-hex", "design-repair", "heat-exchangers-design", HUB_EDGE),
  edge("e-dr-rot", "design-repair", "rotating-equipment-design", HUB_EDGE),

  // Hub: MI Engineering → its categories
  edge("e-mi-rel", "mi-engineering", "relief-systems", HUB_EDGE),
  edge("e-mi-fla", "mi-engineering", "blowdown-flare", HUB_EDGE),
  edge("e-mi-pip", "mi-engineering", "piping-system-mi", HUB_EDGE),
  edge("e-mi-tvf", "mi-engineering", "tank-venting", HUB_EDGE),
  edge("e-mi-pha", "mi-engineering", "pha", HUB_EDGE),
  edge("e-mi-sis", "mi-engineering", "sis", HUB_EDGE),
  edge("e-mi-lop", "mi-engineering", "lopc-mi", HUB_EDGE),
  edge("e-mi-mat", "mi-engineering", "material-selection", HUB_EDGE),
  edge("e-mi-hex", "mi-engineering", "heat-exchangers-mi", HUB_EDGE),
  edge("e-mi-elc", "mi-engineering", "electrical-mi", HUB_EDGE),
  edge("e-mi-rot", "mi-engineering", "rotating-equipment-mi", HUB_EDGE),
  edge("e-mi-ci", "mi-engineering", "controls-instrumentation", HUB_EDGE),

  // Hub: Corrosion / Materials → its categories
  edge("e-cor-pc", "corrosion", "protective-coatings", HUB_EDGE),
  edge("e-cor-ca", "corrosion", "corrosion-assessment", HUB_EDGE),
  edge("e-cor-cp", "corrosion", "cathodic-protection", HUB_EDGE),
  edge("e-cor-ct", "corrosion", "chemical-treatment", HUB_EDGE),
  edge("e-cor-mt", "corrosion", "material-testing", HUB_EDGE),
  edge("e-cor-as", "corrosion", "alloy-specs", HUB_EDGE),
  edge("e-cor-cui", "corrosion", "cui", HUB_EDGE),
  edge("e-cor-cm", "corrosion", "corrosion-monitoring", HUB_EDGE),

  // Category → Standard edges (all use CHILD_EDGE / thin gray)
  // In-Service > Pressure Vessel
  edge("e-pv-api510", "pressure-vessel", "api-510"),
  edge("e-pv-api572", "pressure-vessel", "api-572"),
  edge("e-pv-nbic3", "pressure-vessel", "nbic-part-3"),
  // In-Service > Piping
  edge("e-pip-api570", "piping", "api-570"),
  edge("e-pip-api574", "piping", "api-574"),
  // In-Service > Storage Tank
  edge("e-ast-api653", "storage-tank", "api-653"),
  edge("e-ast-sti", "storage-tank", "sti-sp001"),
  edge("e-ast-api650", "storage-tank", "api-650-ast"),
  edge("e-ast-api12r1", "storage-tank", "api-12r1"),
  // In-Service > NDE
  edge("e-nde-api580", "nde", "api-580"),
  edge("e-nde-asmev", "nde", "asme-v"),
  edge("e-nde-astm", "nde", "astm-nde"),
  // In-Service > Pipeline
  edge("e-pl-1104", "pipeline", "api-1104"),
  edge("e-pl-1163", "pipeline", "api-1163"),
  edge("e-pl-1169", "pipeline", "api-1169"),
  edge("e-pl-1171", "pipeline", "api-1171"),
  edge("e-pl-1173", "pipeline", "api-1173"),
  // In-Service > RBI
  edge("e-rbi-580", "rbi", "api-580-rbi"),
  edge("e-rbi-581", "rbi", "api-581"),
  edge("e-rbi-pcc3", "rbi", "asme-rbi"),
  // In-Service > FFS
  edge("e-ffs-579", "ffs", "api-579"),
  edge("e-ffs-ffs1", "ffs", "asme-ffs"),
  // In-Service > PRDs
  edge("e-prd-576", "prds", "api-576"),
  edge("e-prd-520", "prds", "api-520"),
  edge("e-prd-521", "prds", "api-521"),
  edge("e-prd-nbic3", "prds", "nbic-part-3-prd"),
  // In-Service > FRP
  edge("e-frp-12p", "frp-asset", "api-12p"),
  edge("e-frp-astm1", "frp-asset", "astm-frp-1"),
  edge("e-frp-astm2", "frp-asset", "astm-frp-2"),
  edge("e-frp-rtp", "frp-asset", "asme-rtpx"),
  // In-Service > Fired Heaters
  edge("e-fh-573", "fired-heaters", "api-573"),
  edge("e-fh-astm1", "fired-heaters", "astm-fh-1"),
  edge("e-fh-astm2", "fired-heaters", "astm-fh-2"),
  edge("e-fh-ppta", "fired-heaters", "ppta"),
  // In-Service > Quality
  edge("e-qlt-577", "quality", "api-577"),
  edge("e-qlt-578", "quality", "api-578"),

  // Design & Repair > Repair
  edge("e-rep-pcc2", "repair", "asme-pcc-2"),
  edge("e-rep-nbic3", "repair", "nbic-part-3-repair"),
  // Design & Repair > Welding
  edge("e-wel-577", "welding", "api-577-weld"),
  edge("e-wel-ix", "welding", "asme-ix"),
  edge("e-wel-1104", "welding", "api-1104-weld"),
  // Design & Repair > Heater/Boiler
  edge("e-hb-530", "heater-boiler", "api-530"),
  edge("e-hb-560", "heater-boiler", "api-560"),
  edge("e-hb-556", "heater-boiler", "api-556"),
  edge("e-hb-asmei", "heater-boiler", "asme-i-hb"),
  // Design & Repair > PV Design
  edge("e-pvd-510", "pv-design", "api-510-design"),
  edge("e-pvd-viii1", "pv-design", "asme-viii-1-design"),
  edge("e-pvd-viii2", "pv-design", "asme-viii-2-design"),
  // Design & Repair > AST Design
  edge("e-astd-620", "ast-design", "api-620-design"),
  edge("e-astd-650", "ast-design", "api-650-design"),
  edge("e-astd-12f", "ast-design", "api-12f-design"),
  edge("e-astd-12d", "ast-design", "api-12d-design"),
  // Design & Repair > Piping Design
  edge("e-pipd-570", "piping-design", "api-570-design"),
  edge("e-pipd-b313", "piping-design", "asme-b31-3-design"),
  edge("e-pipd-b314", "piping-design", "asme-b31-4-design"),
  edge("e-pipd-b318", "piping-design", "asme-b31-8-design"),
  edge("e-pipd-1104", "piping-design", "api-1104-design"),
  // Design & Repair > Heat Exchangers
  edge("e-hexd-tema", "heat-exchangers-design", "tema-design"),
  edge("e-hexd-660", "heat-exchangers-design", "api-660-design"),
  edge("e-hexd-661", "heat-exchangers-design", "api-661-design"),
  edge("e-hexd-viii1", "heat-exchangers-design", "asme-viii-1-hex"),
  // Design & Repair > Rotating Equipment
  edge("e-rotd-610", "rotating-equipment-design", "api-610"),
  edge("e-rotd-611", "rotating-equipment-design", "api-611"),
  edge("e-rotd-612", "rotating-equipment-design", "api-612"),
  edge("e-rotd-613", "rotating-equipment-design", "api-613"),
  edge("e-rotd-617", "rotating-equipment-design", "api-617"),
  edge("e-rotd-618", "rotating-equipment-design", "api-618"),
  edge("e-rotd-670", "rotating-equipment-design", "api-670-design"),
  edge("e-rotd-671", "rotating-equipment-design", "api-671"),
  edge("e-rotd-677", "rotating-equipment-design", "api-677"),
  edge("e-rotd-678", "rotating-equipment-design", "api-678"),
  edge("e-rotd-686", "rotating-equipment-design", "api-686-design"),

  // MI Engineering > Relief Systems
  edge("e-rel-520i", "relief-systems", "api-520-i"),
  edge("e-rel-520ii", "relief-systems", "api-520-ii"),
  edge("e-rel-521-rs", "relief-systems", "api-521-rs"),
  edge("e-rel-526", "relief-systems", "api-526"),
  edge("e-rel-527", "relief-systems", "api-527"),
  // MI Engineering > Blowdown & Flare
  edge("e-fla-521", "blowdown-flare", "api-521-flare"),
  edge("e-fla-537", "blowdown-flare", "api-537"),
  // MI Engineering > Piping System
  edge("e-mip-14e", "piping-system-mi", "api-14e"),
  edge("e-mip-b313", "piping-system-mi", "asme-b31-3-mi"),
  edge("e-mip-b318", "piping-system-mi", "asme-b31-8-mi"),
  // MI Engineering > Tank Venting
  edge("e-tvf-2000", "tank-venting", "api-2000-venting"),
  edge("e-tvf-2003", "tank-venting", "api-2003-venting"),
  // MI Engineering > PHA
  edge("e-pha-14c", "pha", "api-14c-pha"),
  edge("e-pha-61511", "pha", "iec-61511"),
  edge("e-pha-754", "pha", "api-754-pha"),
  // MI Engineering > SIS
  edge("e-sis-61508", "sis", "iec-61508"),
  edge("e-sis-61511", "sis", "iec-61511-sis"),
  edge("e-sis-14c", "sis", "api-14c-sis"),
  // MI Engineering > LOPC / BLEVE / MI Programs
  edge("e-lop-754", "lopc-mi", "api-754-lopc"),
  edge("e-lop-770", "lopc-mi", "api-770"),
  edge("e-lop-689", "lopc-mi", "api-689"),
  // MI Engineering > Material Selection
  edge("e-mat-571", "material-selection", "api-571"),
  edge("e-mat-939c", "material-selection", "api-939c"),
  edge("e-mat-941", "material-selection", "api-941"),
  edge("e-mat-mr0175", "material-selection", "nace-mr0175"),
  // MI Engineering > Heat Exchangers
  edge("e-mihex-660", "heat-exchangers-mi", "api-660-mi"),
  edge("e-mihex-661", "heat-exchangers-mi", "api-661-mi"),
  edge("e-mihex-tema", "heat-exchangers-mi", "tema-mi"),
  // MI Engineering > Electrical
  edge("e-elc-70", "electrical-mi", "nfpa-70"),
  edge("e-elc-70e", "electrical-mi", "nfpa-70e"),
  edge("e-elc-ieee", "electrical-mi", "ieee-mi"),
  // MI Engineering > Rotating Equipment
  edge("e-mirot-670", "rotating-equipment-mi", "api-670-mi"),
  edge("e-mirot-686", "rotating-equipment-mi", "api-686-mi"),
  edge("e-mirot-687", "rotating-equipment-mi", "api-687-mi"),
  edge("e-mirot-iso", "rotating-equipment-mi", "iso-18436"),
  // MI Engineering > Controls & Instrumentation
  edge("e-ci-isa51", "controls-instrumentation", "isa-5-1"),
  edge("e-ci-isa182", "controls-instrumentation", "isa-18-2"),
  edge("e-ci-554", "controls-instrumentation", "api-554-ci"),

  // Corrosion / Materials > Protective Coatings
  edge("e-pc-sp0188", "protective-coatings", "sspc-sp-coatings"),
  edge("e-pc-rp0394", "protective-coatings", "nace-rp0394"),
  edge("e-pc-582", "protective-coatings", "api-582-coatings"),
  edge("e-pc-vis1", "protective-coatings", "sspc-vis-1"),
  // Corrosion / Materials > Corrosion Assessment
  edge("e-ca-571", "corrosion-assessment", "api-571-ca"),
  edge("e-ca-939c", "corrosion-assessment", "api-939c-ca"),
  edge("e-ca-sp0204", "corrosion-assessment", "nace-sp0204"),
  // Corrosion / Materials > Cathodic Protection
  edge("e-cp-sp0169", "cathodic-protection", "nace-sp0169"),
  edge("e-cp-sp0193", "cathodic-protection", "nace-sp0193"),
  edge("e-cp-sp0285", "cathodic-protection", "nace-sp0285"),
  edge("e-cp-api651", "cathodic-protection", "api-651-cp"),
  // Corrosion / Materials > Chemical Treatment
  edge("e-ct-sp0191", "chemical-treatment", "nace-sp0191"),
  edge("e-ct-945", "chemical-treatment", "api-945"),
  edge("e-ct-tm0169", "chemical-treatment", "nace-tm0169"),
  // Corrosion / Materials > Material Testing
  edge("e-mt-a370", "material-testing", "astm-a370"),
  edge("e-mt-e92", "material-testing", "astm-e92"),
  edge("e-mt-e18", "material-testing", "astm-e18"),
  edge("e-mt-g1", "material-testing", "astm-g1"),
  // Corrosion / Materials > Alloy / Materials Specs
  edge("e-as-iia", "alloy-specs", "asme-ii-a"),
  edge("e-as-iib", "alloy-specs", "asme-ii-b"),
  edge("e-as-iic", "alloy-specs", "asme-ii-c"),
  edge("e-as-a106", "alloy-specs", "astm-a106"),
  // Corrosion / Materials > CUI
  edge("e-cui-583", "cui", "api-583"),
  edge("e-cui-sp0198", "cui", "nace-sp0198"),
  // Corrosion / Materials > Corrosion Monitoring
  edge("e-cm-570", "corrosion-monitoring", "api-570-cm"),
  edge("e-cm-sp0775", "corrosion-monitoring", "nace-sp0775"),
  edge("e-cm-939e", "corrosion-monitoring", "api-939e"),
];
