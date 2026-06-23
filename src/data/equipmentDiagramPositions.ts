/**
 * Diagram Position Configuration
 * Defines absolute and relative positions for all nodes in the equipment diagram
 */

export interface NodePosition {
  x: number;
  y: number;
}

export type DiagramPositions = Record<string, NodePosition>;

/**
 * Main hub positions (absolute coordinates)
 * These serve as the anchor points for all child nodes
 */
export const hubPositions: DiagramPositions = {
  "in-service": { x: 600, y: 400 },
  "design-repair": { x: 600, y: 1200 },
  "mi-engineering": { x: 1400, y: 400 },
  corrosion: { x: 1400, y: 1000 },
};

/**
 * All node positions (categories and standards)
 * Categories are relative to their parent hubs
 * Standards are relative to their parent categories
 */
export const nodePositions: DiagramPositions = {
  // --- In-Service Inspection categories (relative to hub) ---
  "in-service-pressure-vessel": { x: -500, y: -300 },
  "in-service-piping": { x: -350, y: -300 },
  "in-service-storage-tank": { x: -200, y: -300 },
  "in-service-nde": { x: -50, y: -300 },
  "in-service-pipeline": { x: 150, y: -300 },
  "in-service-prds": { x: -550, y: -100 },
  "in-service-frp-asset": { x: -550, y: 100 },
  "in-service-fired-heaters": { x: -350, y: 100 },
  "in-service-quality-control": { x: -200, y: 100 },
  "in-service-repair": { x: -50, y: 100 },
  "in-service-welding": { x: -450, y: 300 },
  "in-service-heater-boiler": { x: -300, y: 400 },
  "in-service-rbi": { x: 300, y: 50 },
  "in-service-ffs": { x: 300, y: 200 },
  "in-service-prds-right": { x: 300, y: 350 },

  // --- Design & Repair categories (relative to hub) ---
  "design-repair-pressure-vessel": { x: -450, y: -150 },
  "design-repair-storage-tank": { x: -550, y: 0 },
  "design-repair-piping": { x: -350, y: 150 },
  "design-repair-materials": { x: 300, y: -100 },
  "design-repair-flare": { x: 300, y: 50 },
  "design-repair-heat-exchangers": { x: 450, y: 200 },
  "design-repair-injection": { x: 450, y: 350 },

  // --- MI Engineering / Process Safety categories (relative to hub) ---
  "mi-engineering-incident": { x: -450, y: -150 },
  "mi-engineering-hf": { x: -250, y: -150 },
  "mi-engineering-kpi": { x: -50, y: -150 },
  "mi-engineering-corrosion-insulation": { x: 300, y: 100 },
  "mi-engineering-damage": { x: 500, y: -100 },

  // --- Corrosion categories (relative to hub) ---
  "corrosion-control": { x: 400, y: -200 },
  "corrosion-injection": { x: 400, y: 50 },

  // --- Standards (Relative to their respective category parent) ---

  // Pressure Vessel (In-Service)
  "std-api-510": { x: 0, y: -80 },
  "std-api-579": { x: -70, y: 0 },
  "std-nbic-part2": { x: 70, y: 0 },

  // Piping (In-Service)
  "std-api-570": { x: 0, y: -80 },
  "std-api-574": { x: 0, y: 0 },

  // Aboveground Storage Tank (In-Service)
  "std-api-575": { x: -70, y: -80 },
  "std-api-653": { x: 70, y: -80 },
  "std-sti-sp001": { x: 70, y: 0 },
  "std-api-12r1": { x: -70, y: 0 },

  // NDE (In-Service)
  "std-api-571": { x: -70, y: -80 },
  "std-asnt-cp189": { x: 70, y: -80 },
  "std-api-1004": { x: 0, y: 0 },
  "std-api-577": { x: -70, y: 80 },
  "std-asme-v": { x: 70, y: 80 },

  // Pipeline (In-Service)
  "std-api-1160": { x: -100, y: -80 },
  "std-api-1163": { x: 0, y: -80 },
  "std-api-1169": { x: 100, y: -80 },
  "std-api-1171": { x: -100, y: 0 },
  "std-api-1173": { x: 0, y: 0 },
  "std-api-1176": { x: 100, y: 0 },

  // PRDs (In-Service left)
  "std-api-576": { x: -70, y: -80 },
  "std-api-527": { x: 70, y: -80 },
  "std-nbic-part3": { x: 70, y: 0 },

  // PRDs (In-Service right)
  "std-api-2000": { x: -70, y: 0 },
  "std-api-521": { x: 0, y: 0 },
  "std-api-520": { x: 70, y: 0 },

  // FRP Asset (In-Service)
  "std-astm-d4097": { x: -100, y: -80 },
  "std-astm-d5421": { x: 0, y: -80 },
  "std-astm-d5480": { x: 100, y: -80 },
  "std-astm-d3299": { x: -100, y: 0 },
  "std-astm-d2563": { x: 0, y: 0 },
  "std-astm-d2996": { x: 100, y: 0 },
  "std-astm-d3840": { x: -100, y: 80 },
  "std-astm-d2992": { x: 0, y: 80 },
  "std-astm-d2343": { x: 100, y: 80 },
  "std-astm-d3681": { x: -50, y: 160 },
  "std-api-rp1160": { x: 50, y: 160 },

  // Fired Heaters (In-Service)
  "std-api-573": { x: 0, y: 0 },

  // Quality Control (In-Service)
  "std-api-578": { x: 0, y: -80 },
  "std-api-598": { x: 0, y: 0 },

  // Repair (In-Service)
  "std-asme-pcc2": { x: -70, y: 0 },
  "std-nbic-part1": { x: 70, y: 0 },
  "std-asme-pcc3": { x: 0, y: 80 },

  // Welding (In-Service)
  "std-api-582": { x: -70, y: 0 },
  "std-asme-ix": { x: 0, y: 0 },
  "std-api-1104": { x: 70, y: 0 },

  // Heater/Boiler (In-Service)
  "std-api-530": { x: -100, y: 0 },
  "std-api-538": { x: 0, y: 0 },
  "std-asme-i": { x: 100, y: 0 },
  "std-api-560": { x: 50, y: 80 },

  // RBI (In-Service right)
  "std-api-580": { x: -70, y: -80 },
  "std-asme-xc3": { x: 70, y: -80 },
  "std-api-581": { x: 0, y: 0 },
  "std-api-584": { x: 0, y: 80 },

  // FFS (In-Service right)
  "std-api-579-ffs-1": { x: -70, y: 0 },
  "std-api-579-ffs-2": { x: 70, y: 0 },
  "std-api-579-ffs-3": { x: 0, y: 80 },

  // Pressure Vessel (Design & Repair)
  "std-api-510-dr": { x: -70, y: 0 },
  "std-asme-viii-1": { x: 0, y: 0 },
  "std-asme-viii-2": { x: 70, y: 0 },

  // Aboveground Storage Tanks (Design & Repair)
  "std-api-620": { x: -70, y: 0 },
  "std-api-650": { x: 0, y: 0 },
  "std-api-12d": { x: 70, y: 0 },
  "std-api-12f": { x: 0, y: 80 },

  // Piping (Design & Repair)
  "std-api-570-dr": { x: -100, y: 0 },
  "std-asme-b311": { x: 0, y: 0 },
  "std-asme-b314": { x: 100, y: 0 },
  "std-asme-b317": { x: -100, y: 80 },
  "std-asme-b318": { x: 0, y: 80 },
  "std-asme-b319": { x: 100, y: 80 },

  // Materials (Design & Repair)
  "std-astm-dr": { x: -70, y: 0 },
  "std-api-6a": { x: 70, y: 0 },
  "std-asme-ii": { x: 0, y: 80 },
  "std-mds-98": { x: 0, y: 160 },

  // Flare (Design & Repair)
  "std-api-521-dr": { x: 0, y: 0 },

  // Heat Exchangers (Design & Repair)
  "std-api-660": { x: -100, y: 0 },
  "std-api-661": { x: 0, y: 0 },
  "std-api-662": { x: 100, y: 0 },
  "std-tema": { x: -50, y: 80 },
  "std-alpema": { x: 50, y: 80 },
  "std-asme-bpe": { x: 0, y: 160 },

  // Injection / Process Mix Points (Design & Repair)
  "std-nace-sp0402": { x: 0, y: 0 },

  // Incident Investigation (MI Engineering)
  "std-api-754-ii": { x: 0, y: 0 },

  // HF Alkylation (MI Engineering)
  "std-api-751": { x: 0, y: 0 },

  // KPI (MI Engineering)
  "std-api-754-kpi": { x: 0, y: 0 },

  // Corrosion Under Insulation/Fireproofing (MI Engineering)
  "std-api-583": { x: -100, y: 0 },
  "std-asme-cui-1": { x: 0, y: 0 },
  "std-asme-cui-2": { x: 100, y: 0 },

  // Damage Mechanism (MI Engineering)
  "std-api-571-dm-1": { x: -100, y: -80 },
  "std-api-571-dm-2": { x: 0, y: -80 },
  "std-hn-951": { x: 100, y: -80 },
  "std-api-939-c": { x: -100, y: 0 },
  "std-api-939-e": { x: 0, y: 0 },
  "std-api-941": { x: 100, y: 0 },
  "std-nace-mr0103": { x: -100, y: 80 },
  "std-nace-mr0175": { x: 0, y: 80 },
  "std-nace-sp0304": { x: 100, y: 80 },
  "std-nace-sp0472": { x: -50, y: 160 },
  "std-nace-sp0590": { x: 50, y: 160 },

  // Corrosion Control (Corrosion)
  "std-api-581-cc": { x: -100, y: -80 },
  "std-api-651": { x: 0, y: -80 },
  "std-api-652": { x: 100, y: -80 },
  "std-api-970": { x: -50, y: 0 },
  "std-nace-sp0169": { x: 50, y: 0 },
  "std-nace-sp0572": { x: 100, y: 0 },

  // Injection / Process Mix Points (Corrosion)
  "std-nace-sp0106": { x: 0, y: 0 },
};
