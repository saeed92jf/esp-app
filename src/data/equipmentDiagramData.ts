// equipmentDiagramData.ts - Complete hierarchical equipment inspection standards data

export type StandardType =
  | "API"
  | "ASME"
  | "ASTM"
  | "NACE"
  | "NBIC"
  | "TEMA"
  | "AHRI"
  | "MSS"
  | "STI"
  | "ANSI"
  | "PFI"
  | "ASTM/API"
  | "OTHER";

export interface StandardDef {
  id: string;
  stdType: StandardType;
  stdNumber: string;
  fullName: string;
  description: string;
  url: string;
  version?: string;
  lastUpdated?: string;
}

export interface CategoryDef {
  id: string;
  label: string;
  categoryLabel: string;
  description?: string;
  standards: StandardDef[];
}

export interface HubDef {
  id: string;
  label: string;
  description: string;
  categories: CategoryDef[];
}

export const equipmentData: HubDef[] = [
  // ============================================================
  // Hub 1: In-Service Inspection
  // ============================================================
  {
    id: "in-service",
    label: "In-Service\nInspection",
    description: "Central hub for in-service inspection standards and codes",
    categories: [
      // --- Pressure Vessel ---
      {
        id: "pressure-vessel",
        label: "Pressure Vessel",
        categoryLabel: "In-Service Inspection",
        description: "Standards for pressure vessel inspection and maintenance",
        standards: [
          {
            id: "api-510",
            stdType: "API",
            stdNumber: "510",
            fullName: "API 510 - Pressure Vessel Inspection Code",
            description:
              "Pressure Vessel Inspection Code: In-service Inspection, Rating, Repair, and Alteration",
            url: "https://www.api.org/products-and-services/standards/api-510",
            version: "11th Edition",
            lastUpdated: "2024",
          },
          {
            id: "api-572",
            stdType: "API",
            stdNumber: "572",
            fullName: "API 572 - Inspection of Pressure Vessels",
            description:
              "Inspection of Pressure Vessels: Guidelines and recommended practices",
            url: "https://www.api.org/products-and-services/standards/api-572",
            version: "4th Edition",
            lastUpdated: "2023",
          },
          {
            id: "nbic-part-3",
            stdType: "NBIC",
            stdNumber: "Part 3",
            fullName: "NBIC Part 3 - In-Service Inspection",
            description:
              "National Board Inspection Code Part 3: In-Service Inspection",
            url: "https://www.nationalboard.org/index.aspx?pageID=108",
            version: "2023",
            lastUpdated: "2023",
          },
        ],
      },

      // --- Piping ---
      {
        id: "piping",
        label: "Piping",
        categoryLabel: "In-Service Inspection",
        description: "Standards for piping system inspection and integrity",
        standards: [
          {
            id: "api-570",
            stdType: "API",
            stdNumber: "570",
            fullName: "API 570 - Piping Inspection Code",
            description:
              "Piping Inspection Code: In-service Inspection, Rating, Repair, and Alteration",
            url: "https://www.api.org/products-and-services/standards/api-570",
            version: "4th Edition",
            lastUpdated: "2023",
          },
          {
            id: "api-574",
            stdType: "API",
            stdNumber: "574",
            fullName: "API 574 - Inspection Practices for Piping",
            description: "Inspection Practices for Piping System Components",
            url: "https://www.api.org/products-and-services/standards/api-574",
            version: "4th Edition",
            lastUpdated: "2023",
          },
          {
            id: "asme-b31-3",
            stdType: "ASME",
            stdNumber: "B31.3",
            fullName: "ASME B31.3 - Process Piping",
            description:
              "Process Piping: Design, materials, fabrication, inspection and testing",
            url: "https://www.asme.org/codes-standards/find-codes-standards/b31-3-process-piping",
            version: "2022",
            lastUpdated: "2022",
          },
        ],
      },

      // --- Aboveground Storage Tank ---
      {
        id: "storage-tank",
        label: "Aboveground\nStorage Tank",
        categoryLabel: "In-Service Inspection",
        description: "Standards for storage tank inspection and maintenance",
        standards: [
          {
            id: "api-653",
            stdType: "API",
            stdNumber: "653",
            fullName:
              "API 653 - Tank Inspection, Repair, Alteration, and Reconstruction",
            description:
              "Tank Inspection, Repair, Alteration, and Reconstruction",
            url: "https://www.api.org/products-and-services/standards/api-653",
            version: "6th Edition",
            lastUpdated: "2024",
          },
          {
            id: "api-575",
            stdType: "API",
            stdNumber: "575",
            fullName:
              "API 575 - Inspection of Atmospheric and Low-Pressure Storage Tanks",
            description:
              "Inspection of Atmospheric and Low-Pressure Storage Tanks",
            url: "https://www.api.org/products-and-services/standards/api-575",
            version: "4th Edition",
            lastUpdated: "2023",
          },
          {
            id: "sti-sp001",
            stdType: "OTHER",
            stdNumber: "SP001",
            fullName: "STI SP001 - Inspection Standard",
            description:
              "Standard for Inspection of In-Service Shop Fabricated Aboveground Tanks",
            url: "https://www.steeltank.com",
            version: "2011",
            lastUpdated: "2011",
          },
          {
            id: "api-12r1",
            stdType: "API",
            stdNumber: "12R1",
            fullName:
              "API 12R1 - Recommended Practice for Setting, Maintenance, Inspection, and Repair of Tanks",
            description:
              "Setting, Maintenance, Inspection, Operation, and Repair of Tanks in Production Service",
            url: "https://www.api.org/products-and-services/standards/api-12r1",
            version: "9th Edition",
            lastUpdated: "2022",
          },
        ],
      },

      // --- NDE (Non-Destructive Examination) ---
      {
        id: "nde",
        label: "NDE",
        categoryLabel: "In-Service Inspection",
        description: "Non-Destructive Examination standards and methods",
        standards: [
          {
            id: "api-580",
            stdType: "API",
            stdNumber: "580",
            fullName: "API 580 - Risk-Based Inspection",
            description: "Risk-Based Inspection",
            url: "https://www.api.org/products-and-services/standards/api-580",
            version: "3rd Edition",
            lastUpdated: "2016",
          },
          {
            id: "ansi-asnt-cp-189",
            stdType: "ANSI",
            stdNumber: "CP-189",
            fullName:
              "ANSI/ASNT CP-189 - Qualification and Certification of NDT Personnel",
            description:
              "ASNT Standard for Qualification and Certification of Nondestructive Testing Personnel",
            url: "https://www.asnt.org",
            version: "2020",
            lastUpdated: "2020",
          },
          {
            id: "api-1104",
            stdType: "API",
            stdNumber: "1104",
            fullName: "API 1104 - Welding of Pipelines and Related Facilities",
            description: "Welding of Pipelines and Related Facilities",
            url: "https://www.api.org/products-and-services/standards/api-1104",
            version: "22nd Edition",
            lastUpdated: "2021",
          },
          {
            id: "asme-v",
            stdType: "ASME",
            stdNumber: "V",
            fullName: "ASME BPVC Section V - Nondestructive Examination",
            description:
              "Boiler and Pressure Vessel Code Section V: Nondestructive Examination",
            url: "https://www.asme.org/codes-standards",
            version: "2023",
            lastUpdated: "2023",
          },
        ],
      },

      // --- Pipeline ---
      {
        id: "pipeline",
        label: "Pipeline",
        categoryLabel: "In-Service Inspection",
        description: "Pipeline integrity and inspection standards",
        standards: [
          {
            id: "api-1160",
            stdType: "API",
            stdNumber: "1160",
            fullName:
              "API 1160 - Managing System Integrity for Hazardous Liquid Pipelines",
            description:
              "Managing System Integrity for Hazardous Liquid Pipelines",
            url: "https://www.api.org/products-and-services/standards/api-1160",
            version: "2nd Edition",
            lastUpdated: "2021",
          },
          {
            id: "pfi-es-7",
            stdType: "OTHER",
            stdNumber: "ES-7",
            fullName: "PFI ES-7 - Flange Bolt Torque Chart",
            description:
              "Pipe Fabrication Institute Standard for Flange Bolting",
            url: "https://www.pfi-institute.org",
            version: "2019",
            lastUpdated: "2019",
          },
          {
            id: "api-1163",
            stdType: "API",
            stdNumber: "1163",
            fullName: "API 1163 - In-line Inspection Systems Qualification",
            description: "In-line Inspection Systems Qualification",
            url: "https://www.api.org/products-and-services/standards/api-1163",
            version: "2nd Edition",
            lastUpdated: "2021",
          },
        ],
      },

      // --- PRDs (Pressure Relief Devices) ---
      {
        id: "prds",
        label: "PRDs",
        categoryLabel: "In-Service Inspection",
        description: "Pressure Relief Device standards",
        standards: [
          {
            id: "api-520-part-1",
            stdType: "API",
            stdNumber: "520 Part 1",
            fullName:
              "API 520 Part 1 - Sizing, Selection, and Installation of Pressure-relieving Devices",
            description:
              "Sizing, Selection, and Installation of Pressure-relieving Devices - Part I: Sizing and Selection",
            url: "https://www.api.org/products-and-services/standards/api-520",
            version: "10th Edition",
            lastUpdated: "2020",
          },
          {
            id: "api-527",
            stdType: "API",
            stdNumber: "527",
            fullName: "API 527 - Seat Tightness of Pressure Relief Valves",
            description: "Seat Tightness of Pressure Relief Valves",
            url: "https://www.api.org/products-and-services/standards/api-527",
            version: "7th Edition",
            lastUpdated: "2021",
          },
          {
            id: "nbic-part-2",
            stdType: "NBIC",
            stdNumber: "Part 2",
            fullName: "NBIC Part 2 - Repairs and Alterations",
            description:
              "National Board Inspection Code Part 2: Repairs and Alterations",
            url: "https://www.nationalboard.org",
            version: "2023",
            lastUpdated: "2023",
          },
        ],
      },

      // --- FRP Asset ---
      {
        id: "frp-asset",
        label: "FRP Asset",
        categoryLabel: "In-Service Inspection",
        description: "Fiber Reinforced Plastic equipment standards",
        standards: [
          {
            id: "astm-d2563",
            stdType: "ASTM",
            stdNumber: "D2563",
            fullName:
              "ASTM D2563 - Practice for Classifying Visual Defects in Glass-Reinforced Plastic Laminate Parts",
            description:
              "Classifying Visual Defects in Glass-Reinforced Plastic Laminate Parts",
            url: "https://www.astm.org/d2563-21.html",
            version: "2021",
            lastUpdated: "2021",
          },
          {
            id: "astm-d2996",
            stdType: "ASTM",
            stdNumber: "D2996",
            fullName:
              "ASTM D2996 - Specification for Filament-Wound Fiberglass Pressure Vessels",
            description:
              "Specification for Filament-Wound 'Fiberglass' (Glass-Fiber-Reinforced Thermosetting-Resin) Pressure Vessels",
            url: "https://www.astm.org/d2996-21.html",
            version: "2021",
            lastUpdated: "2021",
          },
          {
            id: "astm-d3299",
            stdType: "ASTM",
            stdNumber: "D3299",
            fullName: "ASTM D3299 - Specification for FRP Tanks and Vessels",
            description:
              "Specification for Filament-Wound Glass-Fiber-Reinforced Thermoset Resin Chemical-Resistant Tanks",
            url: "https://www.astm.org/d3299-21.html",
            version: "2021",
            lastUpdated: "2021",
          },
          {
            id: "astm-d5421",
            stdType: "ASTM",
            stdNumber: "D5421",
            fullName:
              "ASTM D5421 - Specification for Contact Molded FRP Vessels",
            description:
              "Specification for Contact-Molded 'Fiberglass' (Glass-Fiber-Reinforced Thermosetting-Resin) Chemical-Resistant Tanks",
            url: "https://www.astm.org/d5421-21.html",
            version: "2021",
            lastUpdated: "2021",
          },
          {
            id: "astm-d4097",
            stdType: "ASTM",
            stdNumber: "D4097",
            fullName:
              "ASTM D4097 - Specification for Contact Molded Glass Fiber Reinforced Thermoset Resin Corrosion Resistant Tanks",
            description:
              "Specification for Contact-Molded Glass-Fiber-Reinforced Thermoset-Resin Corrosion-Resistant Tanks",
            url: "https://www.astm.org/d4097-21.html",
            version: "2021",
            lastUpdated: "2021",
          },
          {
            id: "astm-d4021",
            stdType: "ASTM",
            stdNumber: "D4021",
            fullName:
              "ASTM D4021 - Specification for Glass-Fiber-Reinforced Polyester Manholes and Entries",
            description:
              "Specification for Glass-Fiber-Reinforced Polyester Manholes and Entries",
            url: "https://www.astm.org/d4021-21.html",
            version: "2021",
            lastUpdated: "2021",
          },
          {
            id: "ppta-nb-1",
            stdType: "OTHER",
            stdNumber: "NB-1",
            fullName:
              "PPTA NB-1 - National Board Standard for Composite Reinforced Pressure Vessels",
            description: "Portable Pressure Tank Association Standard NB-1",
            url: "https://www.nationalboard.org",
            version: "2019",
            lastUpdated: "2019",
          },
          {
            id: "pfi-es-25",
            stdType: "OTHER",
            stdNumber: "ES-25",
            fullName: "PFI ES-25 - Random Weld Joint Penetration Inspection",
            description: "Pipe Fabrication Institute Standard",
            url: "https://www.pfi-institute.org",
            version: "2017",
            lastUpdated: "2017",
          },
        ],
      },

      // --- Fired Heaters ---
      {
        id: "fired-heaters",
        label: "Fired\nHeaters",
        categoryLabel: "In-Service Inspection",
        description: "Fired heater inspection and operation standards",
        standards: [
          {
            id: "api-560",
            stdType: "API",
            stdNumber: "560",
            fullName: "API 560 - Fired Heaters for General Refinery Service",
            description: "Fired Heaters for General Refinery Service",
            url: "https://www.api.org/products-and-services/standards/api-560",
            version: "6th Edition",
            lastUpdated: "2016",
          },
          {
            id: "api-573",
            stdType: "API",
            stdNumber: "573",
            fullName: "API 573 - Inspection of Fired Boilers and Heaters",
            description: "Inspection of Fired Boilers and Heaters",
            url: "https://www.api.org/products-and-services/standards/api-573",
            version: "4th Edition",
            lastUpdated: "2023",
          },
        ],
      },

      // --- Quality Control ---
      {
        id: "quality-control",
        label: "Quality\nControl",
        categoryLabel: "In-Service Inspection",
        description: "Quality control and assurance standards",
        standards: [
          {
            id: "api-578",
            stdType: "API",
            stdNumber: "578",
            fullName: "API 578 - Material Verification Program",
            description:
              "Material Verification Program for New and Existing Alloy Piping Systems",
            url: "https://www.api.org/products-and-services/standards/api-578",
            version: "3rd Edition",
            lastUpdated: "2020",
          },
          {
            id: "api-579-1",
            stdType: "API",
            stdNumber: "579-1",
            fullName: "API 579-1/ASME FFS-1 - Fitness-For-Service",
            description: "Fitness-For-Service",
            url: "https://www.api.org/products-and-services/standards/api-579",
            version: "3rd Edition",
            lastUpdated: "2016",
          },
        ],
      },

      // --- Repair ---
      {
        id: "repair",
        label: "Repair",
        categoryLabel: "In-Service Inspection",
        description: "Equipment repair standards and procedures",
        standards: [
          {
            id: "asme-pcc-2",
            stdType: "ASME",
            stdNumber: "PCC-2",
            fullName: "ASME PCC-2 - Repair of Pressure Equipment and Piping",
            description: "Repair of Pressure Equipment and Piping",
            url: "https://www.asme.org/codes-standards/find-codes-standards/pcc-2-repair-pressure-equipment-piping",
            version: "2022",
            lastUpdated: "2022",
          },
          {
            id: "nbic-nb-23",
            stdType: "NBIC",
            stdNumber: "NB-23",
            fullName: "NBIC NB-23 - National Board Inspection Code",
            description: "National Board Inspection Code",
            url: "https://www.nationalboard.org",
            version: "2023",
            lastUpdated: "2023",
          },
          {
            id: "asme-pcc-1",
            stdType: "ASME",
            stdNumber: "PCC-1",
            fullName:
              "ASME PCC-1 - Guidelines for Pressure Boundary Bolted Flange Joint Assembly",
            description:
              "Guidelines for Pressure Boundary Bolted Flange Joint Assembly",
            url: "https://www.asme.org/codes-standards",
            version: "2019",
            lastUpdated: "2019",
          },
        ],
      },

      // --- Fitness-For-Service ---
      {
        id: "fitness-for-service",
        label: "Fitness-For-\nService",
        categoryLabel: "In-Service Inspection",
        description: "Fitness-For-Service assessment standards",
        standards: [
          {
            id: "api-579-2",
            stdType: "API",
            stdNumber: "579-2",
            fullName:
              "API 579-2/ASME FFS-2 - Fitness-For-Service Level 2 Assessment",
            description: "Fitness-For-Service Level 2 Assessment",
            url: "https://www.api.org/products-and-services/standards/api-579",
            version: "3rd Edition",
            lastUpdated: "2016",
          },
          {
            id: "api-579-3",
            stdType: "API",
            stdNumber: "579-3",
            fullName:
              "API 579-3/ASME FFS-3 - Fitness-For-Service Level 3 Assessment",
            description: "Fitness-For-Service Level 3 Assessment",
            url: "https://www.api.org/products-and-services/standards/api-579",
            version: "3rd Edition",
            lastUpdated: "2016",
          },
        ],
      },

      // --- PRDs (duplicate for connection purposes) ---
      {
        id: "prds-2",
        label: "PRDs",
        categoryLabel: "In-Service Inspection",
        description: "Pressure Relief Device additional standards",
        standards: [
          {
            id: "api-2000",
            stdType: "API",
            stdNumber: "2000",
            fullName:
              "API 2000 - Venting Atmospheric and Low-Pressure Storage Tanks",
            description: "Venting Atmospheric and Low-Pressure Storage Tanks",
            url: "https://www.api.org/products-and-services/standards/api-2000",
            version: "8th Edition",
            lastUpdated: "2021",
          },
          {
            id: "api-521",
            stdType: "API",
            stdNumber: "521",
            fullName: "API 521 - Pressure-relieving and Depressuring Systems",
            description: "Pressure-relieving and Depressuring Systems",
            url: "https://www.api.org/products-and-services/standards/api-521",
            version: "7th Edition",
            lastUpdated: "2020",
          },
          {
            id: "api-526",
            stdType: "API",
            stdNumber: "526",
            fullName: "API 526 - Flanged Steel Pressure-relief Valves",
            description: "Flanged Steel Pressure-relief Valves",
            url: "https://www.api.org/products-and-services/standards/api-526",
            version: "8th Edition",
            lastUpdated: "2017",
          },
        ],
      },

      // --- Risk Based Inspection ---
      {
        id: "risk-based-inspection",
        label: "Risk Based\nInspection",
        categoryLabel: "In-Service Inspection",
        description: "Risk-based inspection methodology standards",
        standards: [
          {
            id: "api-581",
            stdType: "API",
            stdNumber: "581",
            fullName: "API 581 - Risk-Based Inspection Methodology",
            description: "Risk-Based Inspection Methodology",
            url: "https://www.api.org/products-and-services/standards/api-581",
            version: "3rd Edition",
            lastUpdated: "2016",
          },
          {
            id: "asme-pcc-3",
            stdType: "ASME",
            stdNumber: "PCC-3",
            fullName:
              "ASME PCC-3 - Inspection Planning Using Risk-Based Methods",
            description: "Inspection Planning Using Risk-Based Methods",
            url: "https://www.asme.org/codes-standards",
            version: "2017",
            lastUpdated: "2017",
          },
          {
            id: "api-584",
            stdType: "API",
            stdNumber: "584",
            fullName: "API 584 - Integrity Operating Windows",
            description: "Integrity Operating Windows",
            url: "https://www.api.org/products-and-services/standards/api-584",
            version: "2nd Edition",
            lastUpdated: "2020",
          },
          {
            id: "api-690",
            stdType: "API",
            stdNumber: "690",
            fullName:
              "API 690 - High-frequency Electric Welding for Equipment and Piping in Petroleum Refineries",
            description:
              "High-frequency Electric Welding for Equipment and Piping",
            url: "https://www.api.org/products-and-services/standards/api-690",
            version: "2nd Edition",
            lastUpdated: "2014",
          },
        ],
      },
    ],
  },

  // ============================================================
  // Hub 2: MI Engineering / Process Safety
  // ============================================================
  {
    id: "mi-engineering",
    label: "MI Engineering /\nProcess Safety",
    description:
      "Mechanical Integrity Engineering and Process Safety Management",
    categories: [
      // --- Incident Investigation ---
      {
        id: "incident-investigation",
        label: "Incident\nInvestigation",
        categoryLabel: "MI Engineering / Process Safety",
        description: "Incident investigation and root cause analysis standards",
        standards: [
          {
            id: "api-754",
            stdType: "API",
            stdNumber: "754",
            fullName: "API 754 - Process Safety Performance Indicators",
            description:
              "Process Safety Performance Indicators for the Refining and Petrochemical Industries",
            url: "https://www.api.org/products-and-services/standards/api-754",
            version: "2nd Edition",
            lastUpdated: "2016",
          },
        ],
      },

      // --- HF Alkylation ---
      {
        id: "hf-alkylation",
        label: "HF Alkylation",
        categoryLabel: "MI Engineering / Process Safety",
        description: "Hydrofluoric Acid Alkylation Unit safety standards",
        standards: [
          {
            id: "api-751",
            stdType: "API",
            stdNumber: "751",
            fullName:
              "API 751 - Safe Operation of Hydrofluoric Acid Alkylation Units",
            description: "Safe Operation of Hydrofluoric Acid Alkylation Units",
            url: "https://www.api.org/products-and-services/standards/api-751",
            version: "4th Edition",
            lastUpdated: "2018",
          },
        ],
      },

      // --- KPI ---
      {
        id: "kpi",
        label: "KPI",
        categoryLabel: "MI Engineering / Process Safety",
        description: "Key Performance Indicator standards for process safety",
        standards: [
          {
            id: "api-754-kpi",
            stdType: "API",
            stdNumber: "754",
            fullName: "API 754 - Process Safety Performance Indicators",
            description:
              "Process Safety Performance Indicators for the Refining and Petrochemical Industries",
            url: "https://www.api.org/products-and-services/standards/api-754",
            version: "2nd Edition",
            lastUpdated: "2016",
          },
        ],
      },
    ],
  },

  // ============================================================

  // Hub 3: Design / Fabrication

  // ============================================================

  {
    id: "design-fabrication",

    label: "Design /\nFabrication",

    description: "Equipment design and fabrication standards",

    categories: [
      // — Pressure Vessel (Design) —

      {
        id: "pressure-vessel-design",

        label: "Pressure Vessel",

        categoryLabel: "Design / Fabrication",

        description: "Pressure vessel design and construction codes",

        standards: [
          {
            id: "asme-viii-div1",

            stdType: "ASME",

            stdNumber: "VIII Div 1",

            fullName:
              "ASME BPVC Section VIII Division 1 - Rules for Construction of Pressure Vessels",

            description: "Rules for Construction of Pressure Vessels",

            url: "https://www.asme.org/codes-standards",

            version: "2023",

            lastUpdated: "2023",
          },

          {
            id: "asme-viii-div2",

            stdType: "ASME",

            stdNumber: "VIII Div 2",

            fullName: "ASME BPVC Section VIII Division 2 - Alternative Rules",

            description:
              "Rules for Construction of Pressure Vessels - Alternative Rules",

            url: "https://www.asme.org/codes-standards",

            version: "2023",

            lastUpdated: "2023",
          },

          {
            id: "asme-ii-a",

            stdType: "ASME",

            stdNumber: "II Part A",

            fullName:
              "ASME BPVC Section II Part A - Ferrous Material Specifications",

            description: "Materials - Ferrous Material Specifications",

            url: "https://www.asme.org/codes-standards",

            version: "2023",

            lastUpdated: "2023",
          },
        ],
      },

      // — Piping (Design) —

      {
        id: "piping-design",

        label: "Piping",

        categoryLabel: "Design / Fabrication",

        description: "Piping system design and material standards",

        standards: [
          {
            id: "asme-b31-3-design",

            stdType: "ASME",

            stdNumber: "B31.3",

            fullName: "ASME B31.3 - Process Piping",

            description:
              "Process Piping: Design, materials, fabrication, inspection and testing",

            url: "https://www.asme.org/codes-standards",

            version: "2022",

            lastUpdated: "2022",
          },

          {
            id: "asme-b31-1",

            stdType: "ASME",

            stdNumber: "B31.1",

            fullName: "ASME B31.1 - Power Piping",

            description:
              "Power Piping: Design, materials, fabrication, inspection and testing",

            url: "https://www.asme.org/codes-standards",

            version: "2022",

            lastUpdated: "2022",
          },

          {
            id: "asme-b16-5",

            stdType: "ASME",

            stdNumber: "B16.5",

            fullName: "ASME B16.5 - Pipe Flanges and Flanged Fittings",

            description:
              "Pipe Flanges and Flanged Fittings: NPS 1/2 through NPS 24 Metric/Inch Standard",

            url: "https://www.asme.org/codes-standards",

            version: "2020",

            lastUpdated: "2020",
          },

          {
            id: "mss-sp-55",

            stdType: "MSS",

            stdNumber: "SP-55",

            fullName: "MSS SP-55 - Quality Standard for Steel Castings",

            description:
              "Quality Standard for Steel Castings for Valves, Flanges, Fittings, and Other Piping Components",

            url: "https://msshq.org",

            version: "2011",

            lastUpdated: "2011",
          },
        ],
      },

      // — Storage Tank (Design) —

      {
        id: "storage-tank-design",

        label: "Storage Tank",

        categoryLabel: "Design / Fabrication",

        description: "Storage tank design and construction standards",

        standards: [
          {
            id: "api-650",

            stdType: "API",

            stdNumber: "650",

            fullName: "API 650 - Welded Tanks for Oil Storage",

            description: "Welded Tanks for Oil Storage",

            url: "https://www.api.org/products-and-services/standards/api-650",

            version: "13th Edition",

            lastUpdated: "2020",
          },

          {
            id: "api-620",

            stdType: "API",

            stdNumber: "620",

            fullName:
              "API 620 - Design and Construction of Large, Welded, Low-Pressure Storage Tanks",

            description:
              "Design and Construction of Large, Welded, Low-Pressure Storage Tanks",

            url: "https://www.api.org/products-and-services/standards/api-620",

            version: "12th Edition",

            lastUpdated: "2013",
          },

          {
            id: "api-625",

            stdType: "API",

            stdNumber: "625",

            fullName:
              "API 625 - Tank Systems for Refrigerated Liquefied Gas Storage",

            description: "Tank Systems for Refrigerated Liquefied Gas Storage",

            url: "https://www.api.org/products-and-services/standards/api-625",

            version: "1st Edition",

            lastUpdated: "2010",
          },
        ],
      },

      // — Heat Exchanger —

      {
        id: "heat-exchanger",

        label: "Heat\nExchanger",

        categoryLabel: "Design / Fabrication",

        description: "Heat exchanger design and construction standards",

        standards: [
          {
            id: "tema",

            stdType: "TEMA",

            stdNumber: "Standards",

            fullName: "TEMA Standards - Heat Exchangers",

            description:
              "Standards of the Tubular Exchanger Manufacturers Association",

            url: "https://tema.org",

            version: "10th Edition",

            lastUpdated: "2019",
          },

          {
            id: "api-660",

            stdType: "API",

            stdNumber: "660",

            fullName: "API 660 - Shell-and-Tube Heat Exchangers",

            description: "Shell-and-Tube Heat Exchangers",

            url: "https://www.api.org/products-and-services/standards/api-660",

            version: "9th Edition",

            lastUpdated: "2015",
          },

          {
            id: "api-661",

            stdType: "API",

            stdNumber: "661",

            fullName: "API 661 - Air-Cooled Heat Exchangers",

            description:
              "Air-Cooled Heat Exchangers for General Refinery Service",

            url: "https://www.api.org/products-and-services/standards/api-661",

            version: "7th Edition",

            lastUpdated: "2013",
          },
        ],
      },
    ],
  },

  // ============================================================

  // Hub 4: Damage Mechanisms / Metallurgy

  // ============================================================

  {
    id: "damage-mechanisms",

    label: "Damage Mechanisms /\nMetallurgy",

    description: "Standards for damage mechanisms and material properties",

    categories: [
      // — Damage Mechanisms —

      {
        id: "damage-mechanisms-cat",

        label: "Damage\nMechanisms",

        categoryLabel: "Damage Mechanisms / Metallurgy",

        description: "Damage mechanisms in refinery equipment",

        standards: [
          {
            id: "api-571",

            stdType: "API",

            stdNumber: "571",

            fullName: "API 571 - Damage Mechanisms Affecting Fixed Equipment",

            description:
              "Damage Mechanisms Affecting Fixed Equipment in the Refining Industry",

            url: "https://www.api.org/products-and-services/standards/api-571",

            version: "3rd Edition",

            lastUpdated: "2020",
          },
        ],
      },

      // — Materials —

      {
        id: "materials",

        label: "Materials",

        categoryLabel: "Damage Mechanisms / Metallurgy",

        description: "Material selection and properties standards",

        standards: [
          {
            id: "api-941",

            stdType: "API",

            stdNumber: "941",

            fullName: "API 941 - Steels for Hydrogen Service",

            description:
              "Steels for Hydrogen Service at Elevated Temperatures and Pressures in Petroleum Refineries and Petrochemical Plants",

            url: "https://www.api.org/products-and-services/standards/api-941",

            version: "8th Edition",

            lastUpdated: "2016",
          },

          {
            id: "api-934-a",

            stdType: "API",

            stdNumber: "934-A",

            fullName:
              "API 934-A - Materials and Fabrication of 2 1/4Cr-1Mo, 2 1/4Cr-1Mo-1/4V, 3Cr-1Mo, and 3Cr-1Mo-1/4V Steel Heavy Wall Pressure Vessels",

            description:
              "Materials and Fabrication of Heavy Wall Pressure Vessels for High-temperature High-pressure Hydrogen Service",

            url: "https://www.api.org/products-and-services/standards/api-934",

            version: "3rd Edition",

            lastUpdated: "2019",
          },
        ],
      },

      // — Corrosion —

      {
        id: "corrosion",

        label: "Corrosion",

        categoryLabel: "Damage Mechanisms / Metallurgy",

        description: "Corrosion protection and monitoring standards",

        standards: [
          {
            id: "nace-sp0170",

            stdType: "NACE",

            stdNumber: "SP0170",

            fullName: "NACE SP0170 - Protection of Austenitic Stainless Steels",

            description:
              "Protection of Austenitic Stainless Steels and Other Austenitic Alloys from Polythionic Acid Stress Corrosion Cracking During Shutdown of Refinery Equipment",

            url: "https://www.nace.org",

            version: "2015",

            lastUpdated: "2015",
          },

          {
            id: "api-939-c",

            stdType: "API",

            stdNumber: "939-C",

            fullName:
              "API 939-C - Guidelines for Avoiding Sulfidation Corrosion Failures",

            description:
              "Guidelines for Avoiding Sulfidation (Sulfidic) Corrosion Failures in Oil Refineries",

            url: "https://www.api.org/products-and-services/standards/api-939",

            version: "2nd Edition",

            lastUpdated: "2019",
          },

          {
            id: "api-583",

            stdType: "API",

            stdNumber: "583",

            fullName: "API 583 - Corrosion Under Insulation and Fireproofing",

            description: "Corrosion Under Insulation and Fireproofing",

            url: "https://www.api.org/products-and-services/standards/api-583",

            version: "1st Edition",

            lastUpdated: "2014",
          },
        ],
      },
    ],
  },
];
