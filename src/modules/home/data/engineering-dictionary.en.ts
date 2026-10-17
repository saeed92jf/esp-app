export interface EnglishDictionaryTerm {
  id: string;
  category: "materials" | "equipment" | "jargon" | "inspection" | "experience" | "corporate";
  categoryName: string;
  term: string;
  abbreviation?: string;
  shortDesc: string;
  keyTip: string;
  standards?: string[];
  tags: string[];
}

export const DICTIONARY_CATEGORIES_EN = [
  { id: "all", label: "All Terms", count: 80 },
  { id: "corporate", label: "Organizational Terms", count: 46 },
  { id: "materials", label: "Materials & Metallurgy", count: 8 },
  { id: "equipment", label: "Process Equipment", count: 8 },
  { id: "jargon", label: "Site Jargon & Operations", count: 8 },
  { id: "inspection", label: "NDT & Inspection", count: 6 },
  { id: "experience", label: "Field Experience & Tips", count: 4 },
] as const;

export const ENGINEERING_TERMS_EN: EnglishDictionaryTerm[] = [
  // ─── 1. MATERIALS & METALLURGY ──────────────────────────────────────────
  {
    id: "sa516-gr70",
    category: "materials",
    categoryName: "Materials & Metallurgy",
    term: "ASME SA-516 Gr. 70 Carbon Steel Plate",
    abbreviation: "SA-516-70",
    shortDesc: "Standard killed carbon steel plate with excellent notch toughness, primarily used for welded pressure vessels in moderate to lower temperature service.",
    keyTip: "Always specify vacuum degassing and HIC testing per supplementary requirement S83 when intended for sour service.",
    standards: ["ASME BPVC Sec II Part A", "ASTM A516"],
    tags: ["steel", "carbon steel", "plate", "pressure vessel", "killed steel", "A516", "vessel"]
  },
  {
    id: "duplex-2205",
    category: "materials",
    categoryName: "Materials & Metallurgy",
    term: "Duplex 2205 Stainless Steel (UNS S31803 / S32205)",
    abbreviation: "DSS 2205",
    shortDesc: "A 50/50 austenitic-ferritic stainless steel offering twice the yield strength of 316L and superior resistance to chloride stress corrosion cracking.",
    keyTip: "Keep interpass temperatures strictly below 150°C during welding to avoid the precipitation of brittle intermetallic sigma phase.",
    standards: ["ASTM A240", "NACE MR0175", "ASME B31.3"],
    tags: ["duplex", "stainless steel", "corrosion", "chloride", "2205", "alloy", "ferritic"]
  },
  {
    id: "inconel-625",
    category: "materials",
    categoryName: "Materials & Metallurgy",
    term: "Inconel 625 Superalloy (UNS N06625)",
    abbreviation: "Alloy 625",
    shortDesc: "A high-performance nickel-chromium-molybdenum superalloy renowned for remarkable pitting resistance and strength up to 980°C.",
    keyTip: "Commonly applied as a 3mm weld overlay (cladding) on carbon steel flanges to yield extreme corrosion resistance at a fraction of solid alloy cost.",
    standards: ["ASTM B443", "ASME Sec VIII Div 1", "API 6A"],
    tags: ["nickel", "superalloy", "inconel", "sour gas", "cladding", "overlay", "high temp"]
  },
  {
    id: "nace-mr0175",
    category: "materials",
    categoryName: "Materials & Metallurgy",
    term: "Sour Service Materials Standard (NACE MR0175 / ISO 15156)",
    abbreviation: "NACE MR0175",
    shortDesc: "The essential global standard governing metallic material selection to prevent sulfide stress cracking (SSC) in oilfield sour service environments.",
    keyTip: "Strictly enforces a 22 HRC (248 HV) maximum hardness limit on base metal and welds to suppress catastrophic sulfide stress cracking.",
    standards: ["NACE MR0175", "ISO 15156", "EEMUA 158"],
    tags: ["nace", "sour", "h2s", "hardness", "cracking", "sulfide", "oilfield"]
  },
  {
    id: "hic-cracking",
    category: "materials",
    categoryName: "Materials & Metallurgy",
    term: "Hydrogen-Induced Cracking (HIC)",
    abbreviation: "HIC",
    shortDesc: "Subsurface stepwise cracking and blistering in carbon steels triggered by atomic hydrogen recombination in wet H2S environments.",
    keyTip: "Calcium treatment during steel refining spherodizes MnS inclusions, dramatically slashing susceptibility to planar HIC delamination.",
    standards: ["NACE TM0284", "API Spec 5L"],
    tags: ["hic", "hydrogen", "sour service", "cracking", "blistering", "delamination"]
  },
  {
    id: "corrosion-allowance",
    category: "materials",
    categoryName: "Materials & Metallurgy",
    term: "Corrosion Allowance (CA)",
    abbreviation: "CA",
    shortDesc: "Additional wall thickness engineered into pressure vessels or piping beyond design requirements to accommodate metal loss over plant life.",
    keyTip: "Stainless and nickel alloys typically require 0 mm CA, whereas untreated hydrocarbon carbon steel lines usually warrant 3 mm to 6 mm CA.",
    standards: ["ASME B31.3", "ASME Sec VIII Div 1", "API 570"],
    tags: ["corrosion", "thickness", "design", "piping", "margin", "wall loss"]
  },
  {
    id: "galvanic-corrosion",
    category: "materials",
    categoryName: "Materials & Metallurgy",
    term: "Galvanic & Bimetallic Corrosion",
    abbreviation: "Bimetallic",
    shortDesc: "Accelerated electrochemical degradation of the less noble (anodic) metal when in electrical contact with a noble (cathodic) metal inside an electrolyte.",
    keyTip: "Always install dielectric insulation flange kits (isolating sleeves and non-conductive washers) when joining dissimilar metals.",
    standards: ["ASTM G71", "NACE SP0286"],
    tags: ["galvanic", "flange", "insulation", "bimetallic", "electrolyte", "anode", "cathode"]
  },
  {
    id: "ss316l",
    category: "materials",
    categoryName: "Materials & Metallurgy",
    term: "Low-Carbon Austenitic Stainless Steel (AISI 316L)",
    abbreviation: "AISI 316L",
    shortDesc: "Low-carbon austenitic stainless steel with 2-3% molybdenum providing improved resistance to chloride pitting and avoiding weld sensitization.",
    keyTip: "The 'L' designation ensures low carbon (<0.03%), which prevents intergranular sensitization during field welding without requiring PWHT.",
    standards: ["ASTM A312", "ASME SA-240", "EN 10088-3"],
    tags: ["316l", "stainless", "molybdenum", "austenite", "pitting", "welding"]
  },

  // ─── 2. PROCESS EQUIPMENT & PIPING ──────────────────────────────────────
  {
    id: "npsh-pump",
    category: "equipment",
    categoryName: "Process Equipment",
    term: "Net Positive Suction Head (NPSH)",
    abbreviation: "NPSH",
    shortDesc: "The margin between absolute suction pressure and fluid vapor pressure at pump nozzle. NPSH available must exceed NPSH required to avert cavitation.",
    keyTip: "Maintain a safety margin where NPSHa exceeds NPSHr by at least 0.6 m (or 10-15%) across all anticipated operational operating regimes.",
    standards: ["API 610", "HI 9.6.1"],
    tags: ["pump", "npsh", "cavitation", "hydraulics", "suction", "centrifugal", "head"]
  },
  {
    id: "psv-valve",
    category: "equipment",
    categoryName: "Process Equipment",
    term: "Pressure Safety Valve (PSV)",
    abbreviation: "PSV / PRV",
    shortDesc: "An automated failsafe pressure relief device that opens instantaneously at a predetermined set pressure to protect vessels from structural failure.",
    keyTip: "Inlet piping frictional pressure drop must not exceed 3% of valve set pressure to prevent destructive rapid cycling known as chattering.",
    standards: ["API 520", "API 526", "ASME Sec VIII Div 1"],
    tags: ["psv", "safety", "valve", "relief", "overpressure", "chattering", "discharge"]
  },
  {
    id: "shell-tube-hex",
    category: "equipment",
    categoryName: "Process Equipment",
    term: "Shell & Tube Heat Exchanger (STHE)",
    abbreviation: "STHE",
    shortDesc: "The quintessential process heat exchange unit consisting of an outer pressure shell enclosing an array of fluid carrying tubes built to TEMA standards.",
    keyTip: "Allocate the more fouling, corrosive, or higher pressure fluid to the tube side where mechanical pigging and chemical cleaning are significantly easier.",
    standards: ["TEMA Standards", "ASME Sec VIII", "API 660"],
    tags: ["heat exchanger", "tema", "shell", "tube", "bundle", "fouling", "thermal"]
  },
  {
    id: "ko-drum",
    category: "equipment",
    categoryName: "Process Equipment",
    term: "Knock-Out Drum (K.O. Drum)",
    abbreviation: "K.O. Drum",
    shortDesc: "A gravity settling vessel installed upstream of flares or compressors to decouple liquid droplets from high-velocity vapor streams.",
    keyTip: "Sizing is dictated by the Souders-Brown terminal settling velocity equation to prevent droplet entrainment into flare burners.",
    standards: ["API 521", "GPSA Engineering Data Book"],
    tags: ["drum", "flare", "separator", "vapor", "droplet", "liquid", "scrubber"]
  },
  {
    id: "spectacle-blind",
    category: "equipment",
    categoryName: "Process Equipment",
    term: "Spectacle Blind / Figure-8 Positive Isolation",
    abbreviation: "Figure-8",
    shortDesc: "A safety device featuring connected solid and open discs configured in a figure-8 shape, providing indisputable visual confirmation of positive isolation.",
    keyTip: "In heavy lines (>8\") or high pressure classes (600#+), use separate paddle blinds and spacers to reduce lifting weight and simplify rotation.",
    standards: ["ASME B16.48", "ASME B16.5"],
    tags: ["blind", "figure-8", "isolation", "flange", "paddle", "spacer", "piping"]
  },
  {
    id: "pig-launcher",
    category: "equipment",
    categoryName: "Process Equipment",
    term: "Pipeline Pig Launcher & Receiver Trap",
    abbreviation: "Pig Trap",
    shortDesc: "Pressurized terminal barrel stations installed at pipeline extremities to launch and capture cleaning, batching, or smart inspection pigs without interrupting flow.",
    keyTip: "Mandate pressure-warning safety interlocks on Quick Opening Closures (QOC) so doors cannot be breached while residual pressure exists.",
    standards: ["ASME B31.4", "ASME B31.8", "NACE SP0102"],
    tags: ["pig", "pipeline", "launcher", "receiver", "trap", "inspection", "mfl"]
  },
  {
    id: "orifice-plate",
    category: "equipment",
    categoryName: "Process Equipment",
    term: "Concentric Orifice Flow Meter Plate",
    abbreviation: "FE / Orifice",
    shortDesc: "A precision machined bore constriction plate inserted between flanges to generate a measurable differential pressure proportional to fluid flow rate.",
    keyTip: "Ensure the beveled edge faces downstream; installing an orifice plate backwards causes up to a 20% measurement deficit in flow readings.",
    standards: ["ISO 5167", "AGA Report No. 3", "ASME MFC-3M"],
    tags: ["orifice", "flow", "instrumentation", "dp", "differential", "flange", "metering"]
  },
  {
    id: "steam-trap",
    category: "equipment",
    categoryName: "Process Equipment",
    term: "Thermodynamic / Mechanical Steam Trap",
    abbreviation: "Steam Trap",
    shortDesc: "An automatic valve that purges condensate and non-condensable gases from steam lines while preventing live steam from blowing through.",
    keyTip: "A failed-open steam trap wastes massive boiler fuel energy; verify integrity every quarter with ultrasonic acoustic stethoscopes and thermography.",
    standards: ["ISO 6552", "FCI 69-1"],
    tags: ["steam", "trap", "energy", "condensate", "thermodynamic", "efficiency"]
  },

  // ─── 3. SITE JARGON & OPERATIONS ────────────────────────────────────────
  {
    id: "hot-tapping",
    category: "jargon",
    categoryName: "Site Jargon & Operations",
    term: "Pressurized Live Hot Tapping",
    abbreviation: "Hot Tap",
    shortDesc: "The specialized execution of drilling and cutting into an active, pressurized pipeline or vessel to tie in a branch connection without interruption.",
    keyTip: "Verify minimum fluid flow rate during hot tap sleeve welding to avoid localized heat stagnation that could precipitate dangerous burn-through.",
    standards: ["API RP 2201", "ASME B31.3", "ASME B31.8"],
    tags: ["hot tap", "pipeline", "welding", "branch", "tie-in", "pressurized", "drilling"]
  },
  {
    id: "tie-in",
    category: "jargon",
    categoryName: "Site Jargon & Operations",
    term: "Piping Tie-In Boundary Point",
    abbreviation: "TIE-IN",
    shortDesc: "The exact designated physical boundary location where new piping or equipment interfaces with an existing operational plant system.",
    keyTip: "Develop a chronological tie-in matrix during turnaround planning to pre-fabricate spools and verify flange ratings prior to shutdown day.",
    standards: ["ASME B31.3", "P&ID Standards"],
    tags: ["tie-in", "piping", "shutdown", "spool", "boundary", "interface"]
  },
  {
    id: "pipe-spool",
    category: "jargon",
    categoryName: "Site Jargon & Operations",
    term: "Prefabricated Piping Spool",
    abbreviation: "Spool",
    shortDesc: "A prefabricated assembly of pipes and fittings fabricated offsite in a shop, non-destructively tested, and transported to the field for erection.",
    keyTip: "Include a 100 mm Field Fit Weld (FFW) green cut allowance on terminating spools to absorb concrete foundation and nozzle orientation tolerances.",
    standards: ["ASME B31.3", "PFI Standards"],
    tags: ["spool", "piping", "prefabrication", "erection", "welding", "fitting", "ffw"]
  },
  {
    id: "punch-list",
    category: "jargon",
    categoryName: "Site Jargon & Operations",
    term: "Mechanical Completion Punch List",
    abbreviation: "Punch List",
    shortDesc: "A formalized schedule of remaining deficiencies or non-conformances identified during walkdowns that must be rectified prior to handover.",
    keyTip: "Category A items represent critical safety or containment impediments and must be cleared 100% before system commissioning sign-off.",
    standards: ["Project Quality Plan", "ISO 9001"],
    tags: ["punch", "commissioning", "handover", "inspection", "walkdown", "qa", "qc"]
  },
  {
    id: "turnaround",
    category: "jargon",
    categoryName: "Site Jargon & Operations",
    term: "Refinery Turnaround & Overhaul (TA)",
    abbreviation: "TA / Overhaul",
    shortDesc: "A planned periodic shutdown of an entire refinery complex to execute comprehensive internal vessel inspections, catalyst replacements, and revamps.",
    keyTip: "Beware pyrophoric iron sulfides in sour vessels during initial opening to air; continuously water-wet internals until thoroughly neutralized.",
    standards: ["API 510", "API 570", "OSHA 1910.119"],
    tags: ["turnaround", "overhaul", "shutdown", "refinery", "maintenance", "inspection"]
  },
  {
    id: "walkthrough",
    category: "jargon",
    categoryName: "Site Jargon & Operations",
    term: "P&ID Field Walkthrough & Verification",
    abbreviation: "Walkdown",
    shortDesc: "A methodical field physical inspection tracking piping and instrumentation along the installed route with P&IDs to verify operational layout.",
    keyTip: "Scrutinize valve handwheel clearances, flow arrow directional stamps, and minimum slope lines to guarantee pocket-free draining.",
    standards: ["P&ID Specifications", "ISA 5.1"],
    tags: ["walkthrough", "p&id", "field", "audit", "inspection", "layout", "verification"]
  },
  {
    id: "hazop",
    category: "jargon",
    categoryName: "Site Jargon & Operations",
    term: "Hazard and Operability Study (HAZOP)",
    abbreviation: "HAZOP",
    shortDesc: "A structured, brainstorming team assessment utilizing guide words (No, More, Less, Reverse) to discover potential operational vulnerabilities.",
    keyTip: "Evaluate high pressure/low flow consequences for every node and rigorously check that independent protection layers (IPLs) are adequate.",
    standards: ["IEC 61882", "API RP 754"],
    tags: ["hazop", "safety", "process", "risk", "nodes", "ipl", "operability"]
  },
  {
    id: "moc",
    category: "jargon",
    categoryName: "Site Jargon & Operations",
    term: "Management of Change (MOC) Governance",
    abbreviation: "MOC",
    shortDesc: "A formal regulatory governance process ensuring that safety, health, and environmental risks are evaluated before modifying plant facilities.",
    keyTip: "Even minor temporary alterations (like swapping gasket materials or bypassing alarms) must undergo complete MOC technical scrutiny.",
    standards: ["OSHA PSM 1910.119", "CCPS Guidelines"],
    tags: ["moc", "safety", "change", "procedure", "governance", "psm", "risk"]
  },

  // ─── 4. NDT, TESTING & INSPECTION ─────────────────────────────────────────
  {
    id: "hydrotest",
    category: "inspection",
    categoryName: "NDT & Inspection",
    term: "Hydrostatic Proof Pressure Test",
    abbreviation: "Hydrotest",
    shortDesc: "A mandatory proof test where piping or vessels are completely flooded with water and pressurized to 1.3-1.5x design pressure to confirm integrity.",
    keyTip: "Ensure testing water chloride content is strictly verified <50 ppm (preferably <30 ppm) on stainless steel systems to prevent severe pitting.",
    standards: ["ASME B31.3 Para 345.4", "ASME Sec VIII Div 1 UG-99"],
    tags: ["hydrotest", "pressure test", "inspection", "piping", "proof", "water", "leak"]
  },
  {
    id: "rt-inspection",
    category: "inspection",
    categoryName: "NDT & Inspection",
    term: "Volumetric Radiographic Testing (RT)",
    abbreviation: "RT",
    shortDesc: "A volumetric non-destructive testing method leveraging penetrating X-rays or gamma rays to generate permanent film records of internal weld flaws.",
    keyTip: "Every radiograph must display the designated Image Quality Indicator (IQI wire) clearly to prove contrast and density sensitivity per code.",
    standards: ["ASME Sec V Article 2", "API 1104", "ISO 17636"],
    tags: ["rt", "radiography", "weld", "ndt", "gamma", "x-ray", "iqi", "penetrameter"]
  },
  {
    id: "ut-thickness",
    category: "inspection",
    categoryName: "NDT & Inspection",
    term: "Ultrasonic & Phased Array Testing (UT/PAUT)",
    abbreviation: "UT / PAUT",
    shortDesc: "High-frequency acoustic beam interrogation yielding precise digital wall thickness measurements and three-dimensional flaw profiling.",
    keyTip: "Phased Array UT (PAUT) and TOFD are progressively displacing radioactive RT on live sites due to inherent safety and instant scan archival.",
    standards: ["ASME Sec V Article 4", "ASTM E164"],
    tags: ["ut", "ultrasonic", "ndt", "paut", "thickness", "acoustic", "tofd"]
  },
  {
    id: "pmi-testing",
    category: "inspection",
    categoryName: "NDT & Inspection",
    term: "Positive Material Identification (PMI)",
    abbreviation: "PMI",
    shortDesc: "Fast field non-destructive alloy verification utilizing handheld X-ray fluorescence (XRF) spectrometers to prevent dangerous material mix-ups.",
    keyTip: "100% of high-alloy spools, fittings, and weld caps must be PMI-verified to prevent inadvertent installation of inadequate metallurgy.",
    standards: ["API RP 578", "PFI ES-42"],
    tags: ["pmi", "alloy", "xrf", "metallurgy", "spectrometer", "chemistry", "verification"]
  },
  {
    id: "pwht",
    category: "inspection",
    categoryName: "NDT & Inspection",
    term: "Post-Weld Heat Treatment (PWHT)",
    abbreviation: "PWHT",
    shortDesc: "Controlled uniform thermal reheating of welded joints below lower critical transformation temperature to relieve residual stresses and soften HAZ.",
    keyTip: "Strictly govern heating and cooling gradients per ASME requirements to prevent secondary cracking induced by thermal shock.",
    standards: ["ASME Sec VIII Div 1 UCS-56", "ASME B31.3 Table 331.1.1"],
    tags: ["pwht", "heat treatment", "welding", "stress relief", "thermal", "haz", "hardness"]
  },
  {
    id: "holiday-test",
    category: "inspection",
    categoryName: "NDT & Inspection",
    term: "High-Voltage Holiday Spark Detector Test",
    abbreviation: "Holiday",
    shortDesc: "A high-voltage electrical continuity spark survey across exterior pipe coatings to locate microscopic pinholes and voids before backfilling.",
    keyTip: "Calibrate spark voltage strictly according to coating dry film thickness (DFT); excess voltage will puncture otherwise sound insulation.",
    standards: ["NACE SP0188", "ASTM G62"],
    tags: ["holiday", "coating", "corrosion", "pipeline", "spark", "pinhole", "insulation"]
  },

  // ─── 5. FIELD EXPERIENCE & TIPS ──────────────────────────────────────────
  {
    id: "cui-corrosion",
    category: "experience",
    categoryName: "Field Experience & Tips",
    term: "Corrosion Under Insulation (CUI)",
    abbreviation: "CUI",
    shortDesc: "One of the most insidious industrial damage mechanisms where entrapped moisture underneath thermal insulation corrodes piping unseen.",
    keyTip: "The danger zone for aggressive CUI is 50°C to 120°C; always mandate thermally sprayed aluminum (TSA) or high-temp epoxy under insulation.",
    standards: ["API 583", "NACE SP0198"],
    tags: ["cui", "insulation", "corrosion", "hidden", "tsa", "moisture", "piping"]
  },
  {
    id: "star-torquing",
    category: "experience",
    categoryName: "Field Experience & Tips",
    term: "Incremental Star-Pattern Flange Torquing",
    abbreviation: "Torquing",
    shortDesc: "A cross-pattern incremental bolt tensioning sequence ensuring uniform circumferential gasket seating without pinching or crushing.",
    keyTip: "Always conclude with a final circular clockwise verification pass at 100% torque to compensate for cross-talk relaxation of preceding bolts.",
    standards: ["ASME PCC-1", "EN 1591-4"],
    tags: ["torque", "flange", "bolt", "gasket", "tensioning", "seating", "leak prevention"]
  },
  {
    id: "water-hammer",
    category: "experience",
    categoryName: "Field Experience & Tips",
    term: "Water Hammer & Transient Surge Mitigation",
    abbreviation: "Surge",
    shortDesc: "Engineering controls to arrest destructive pressure surge shockwaves induced by sudden fluid deceleration upon abrupt valve closure.",
    keyTip: "Valve closure time must exceed the Joukowsky critical wave transit period; configure soft-start VFDs and surge accumulators on long transfer mains.",
    standards: ["AWWA M51", "ASME B31.3"],
    tags: ["water hammer", "surge", "hydraulics", "piping", "joukowsky", "transient", "accumulator"]
  },
  {
    id: "deadlegs",
    category: "experience",
    categoryName: "Field Experience & Tips",
    term: "Piping Deadleg & Stagnant Branch Management",
    abbreviation: "Deadleg",
    shortDesc: "Piping segments carrying stagnant or zero flow where entrained water, debris, and anaerobic microbes pool, fostering intense localized corrosion.",
    keyTip: "Classify any un-flowed branch longer than 3x nominal diameter (L > 3D) as a critical deadleg requiring prioritized quarterly UT corrosion profiling.",
    standards: ["API 570", "API 574"],
    tags: ["deadleg", "corrosion", "stagnant", "piping", "microbial", "profiling", "stagnation"]
  },

  // ─── 6. EPC & CORPORATE PROJECTS (ESP) ──────────────────────────────────
  {
    id: "transmittal-dtn",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Document Transmittal Note (DTN)",
    abbreviation: "DTN",
    shortDesc: "The formal, legally binding record and tracking instrument used to officially transfer engineering drawings, calculation reports, and contract communications between client, consultant, and vendor.",
    keyTip: "Ensure the transmittal reference number and revision codes match the DCC central document database precisely; revision date mismatches result in immediate DCC rejection.",
    standards: ["ISO 9001", "DCC Procedures", "PMBOK"],
    tags: ["transmittal", "dtn", "dcc", "document control", "submittal", "drawings", "formal transfer"]
  },
  {
    id: "vdis-vpis",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Vendor Document Index & Schedule (VDIS / VPIS)",
    abbreviation: "VDIS / VPIS",
    shortDesc: "The master contractual matrix detailing all vendor engineering deliverables, submittal milestones (e.g., 4WAPO = 4 weeks after purchase order), and required approval codes.",
    keyTip: "VDIS milestone progress directly controls milestone payment stage releases; submittal delays trigger contractual delay liquidated damages (LDs).",
    standards: ["EPC Coordination", "ISO 10006", "Project Specs"],
    tags: ["vdis", "vpis", "vdrs", "vendor schedule", "milestones", "submittal dates", "deliverables"]
  },
  {
    id: "crs-crt",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Comment Resolution Sheet (CRS / CRT)",
    abbreviation: "CRS",
    shortDesc: "The formal tabular register used to log, track, systematically answer, and officially close out technical comments raised by the engineering consultant or third-party inspector on drawings.",
    keyTip: "Never provide vague responses; explicitly state 'Incorporated / Agreed' alongside the exact revised drawing cloud number, sheet, and detail tag.",
    standards: ["EPC QA/QC", "Quality Audit", "ISO 9001"],
    tags: ["crs", "crt", "comment resolution", "consultant", "review response", "audit trail"]
  },
  {
    id: "review-status-codes",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Document Review Status Codes (Code 1, 2, 3, 4)",
    abbreviation: "Status Code 1/2/3",
    shortDesc: "Standard international engineering approval statuses: Code 1 (Approved / No Comments), Code 2 (Approved as Noted), Code 3 (Revise & Resubmit / Rejected), and Code 4 (Information Only).",
    keyTip: "Fabrication may proceed under Code 2 provided noted comments are incorporated into shop production; fabrication under Code 3 is strictly unauthorized and at vendor's commercial risk.",
    standards: ["EPC Coordination Spec", "Client Procedures"],
    tags: ["code 1", "code 2", "code 3", "status code", "approval", "revise and resubmit", "accepted"]
  },
  {
    id: "itp-quality-plan",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Inspection and Test Plan (ITP / QCP)",
    abbreviation: "ITP",
    shortDesc: "The master quality assurance schedule defining sequential manufacturing verification stages, governing test codes, acceptance criteria, and participant involvement points (Hold, Witness, Review, Monitor).",
    keyTip: "Never bypass a contractual Hold Point (H) without written waiver from the client inspection agency; unauthorized progress constitutes grounds for complete component rejection.",
    standards: ["ISO 9001", "API Spec Q1", "ASME BPVC"],
    tags: ["itp", "qcp", "hold point", "witness point", "quality plan", "testing schedule", "surveillance"]
  },
  {
    id: "mtc-31-en10204",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Mill Test Certificate (MTC / MTR EN 10204 3.1)",
    abbreviation: "MTC 3.1",
    shortDesc: "Official material test certificate declaring chemical heat analysis and mechanical test properties, certified by the manufacturer's inspection department independent of the production line.",
    keyTip: "Every steel plate or pipe stenciled heat number must correlate 100% with the mill certificate; any stamping discrepancy halts customs clearance and material receiving inspection.",
    standards: ["EN 10204 Type 3.1", "ISO 10474", "ASTM A20"],
    tags: ["mtc", "mtr", "heat number", "en 10204", "chemical analysis", "tensile test", "traceability"]
  },
  {
    id: "rfq-commercial-quote",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Request for Quotation (RFQ) & Commercial Proposal",
    abbreviation: "RFQ / Quotation",
    shortDesc: "The formal procurement enquiry package containing technical specifications, deliverable schedules, commercial terms, and itemized vendor pricing breakdown.",
    keyTip: "Ensure the commercial quote explicitly states price validity period, raw metal index escalation formulas (LME), and export seaworthy crating inclusions.",
    standards: ["PMBOK Procurement", "Incoterms 2020", "FIDIC"],
    tags: ["rfq", "quotation", "commercial proposal", "bidding", "financial quote", "validity"]
  },
  {
    id: "itb-tender-docs",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Invitation to Bid (ITB) & Tender Package",
    abbreviation: "ITB / Tender",
    shortDesc: "Comprehensive bidding documentation issued to qualified vendors/contractors encompassing General and Special Conditions of Contract, detailed Scope of Work, and bond formats.",
    keyTip: "Any technical or commercial deviation must be formally submitted and approved via written Technical Query (TQ) prior to the official tender bid closing deadline.",
    standards: ["FIDIC Conditions of Contract", "PMBOK", "Tendering Acts"],
    tags: ["itb", "tender", "bidding documents", "scope of work", "evaluation", "tender package"]
  },
  {
    id: "bank-guarantees-bonds",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Bid Bond & Performance Bank Guarantee (PBG)",
    abbreviation: "Bank Guarantee",
    shortDesc: "Irrevocable, unconditional on-demand financial security instruments issued by approved tier-1 banks guaranteeing bid validity (typically 5%) and contract performance (typically 10%).",
    keyTip: "Ensure guarantee validity extends beyond provisional acceptance certificate (PAC) milestones and contains standard ICC URDG 758 reference wording.",
    standards: ["URDG 758", "ICC No. 758", "FIDIC Clause 4.2"],
    tags: ["bid bond", "performance bond", "bank guarantee", "on demand", "financial security"]
  },
  {
    id: "mr-mto-bom",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Material Requisition (MR) & Material Take-Off (MTO)",
    abbreviation: "MR / MTO",
    shortDesc: "The primary engineering deliverables quantifying raw materials, specialty fittings, structural steel, and equipment items required to trigger purchase orders (PO).",
    keyTip: "Always integrate a 3% to 5% scrap and test coupon margin into the initial MTO to protect against mid-fabrication material stockout emergencies.",
    standards: ["EPC Engineering Procedures", "PFI Standards"],
    tags: ["mr", "mto", "bom", "material requisition", "take off", "procurement", "bill of materials"]
  },
  {
    id: "incoterms-2020",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "International Commercial Terms (Incoterms 2020)",
    abbreviation: "Incoterms 2020",
    shortDesc: "Standardized rules published by the International Chamber of Commerce defining risk transfer points, freight logistics, insurance liabilities, and export/import duties between buyer and seller.",
    keyTip: "For large fabricated process vessels, FOB (Free on Board port of origin) or CIF (Cost, Insurance & Freight) represent the industry standard risk allocation boundaries.",
    standards: ["ICC Incoterms 2020", "International Maritime Law"],
    tags: ["incoterms", "fob", "cif", "exw", "ddp", "freight logistics", "customs risk", "maritime"]
  },
  {
    id: "customs-bl-packing",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Bill of Lading (BL), Packing List (PL) & HS Code",
    abbreviation: "BL / PL / HS Code",
    shortDesc: "The indispensable commercial shipping packet comprising the negotiable title document (BL), itemized container packing list with gross/net weights, certificate of origin, and tariff code.",
    keyTip: "Even a 1kg gross weight discrepancy between the ocean Bill of Lading and physical crate manifest can cause customs holds and exorbitant port container demurrage penalties.",
    standards: ["WCO Harmonized System", "ICC Uniform Rules", "Customs Acts"],
    tags: ["bl", "packing list", "hs code", "bill of lading", "customs clearance", "demurrage", "tariff"]
  },
  {
    id: "drawings-ifa-ifc",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Drawing Lifecycle: IFA, IFC & As-Built",
    abbreviation: "IFA / IFC / As-Built",
    shortDesc: "The formal evolution lifecycle of project engineering deliverables: Issued for Approval (IFA), Approved for Construction with certified stamp (IFC), and final certified As-Built drawing.",
    keyTip: "Shop fabrication against unapproved IFA drawings constitutes a severe contractual breach; all fabrication changes must be redlined and consolidated into the final As-Built package.",
    standards: ["ASME Y14.100", "ISO 128", "DCC Procedures"],
    tags: ["ifc", "ifa", "as built", "engineering drawing", "redline", "construction drawing", "approval"]
  },
  {
    id: "ncr-quality-report",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Non-Conformance Report (NCR)",
    abbreviation: "NCR",
    shortDesc: "The formal QA/QC document recording any identified deficiency where materials, tolerances, or manufacturing processes fail to satisfy approved engineering drawings or contractual specifications.",
    keyTip: "Each NCR requires an agreed engineering disposition (Scrap, Rework, Repair, or Use-As-Is) followed by mandatory re-inspection signoff from the Lead Quality Inspector (TPI).",
    standards: ["ISO 9001 Clause 8.7", "API Spec Q1", "ASME BPVC"],
    tags: ["ncr", "non conformance", "quality discrepancy", "rework", "disposition", "corrective action"]
  },
  {
    id: "fat-sat-testing",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Factory Acceptance Test (FAT) & Site Acceptance Test (SAT)",
    abbreviation: "FAT / SAT",
    shortDesc: "Comprehensive mechanical, electrical, and control loop verification protocols executed at the vendor assembly plant (FAT) and verified after on-site installation and field wiring (SAT).",
    keyTip: "Always complete an internal pre-FAT dry run with zero outstanding punch points before issuing formal inspection notification to the client representative.",
    standards: ["IEEE 1012", "API 670", "Project Functional Specs"],
    tags: ["fat", "sat", "factory acceptance", "site acceptance", "functional test", "commissioning"]
  },
  {
    id: "mdr-mdl-register",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Master Document Register (MDR / MDL)",
    abbreviation: "MDR / MDL",
    shortDesc: "The central Document Control (DCC) database matrix listing every engineering deliverable, document code, current revision status, transmittal history, and earned progress weighting.",
    keyTip: "Engineering physical progress payments are audited directly from the weighted milestone percentages recorded in the live Master Document Register.",
    standards: ["ISO 9001", "PMBOK Scope & Progress Management"],
    tags: ["mdr", "mdl", "dcc", "document control", "progress weighting", "milestone tracking"]
  },
  {
    id: "final-book-mdb",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Manufacturing Data Book (MDB / MRB / Final Book)",
    abbreviation: "Final Book",
    shortDesc: "The authoritative final project technical dossier compiling verified As-Built drawings, mill test certificates (MTC), NDT reports, hydrostatic test charts, WPS/PQR weld logs, and signed IRN release certificates.",
    keyTip: "Release of the final contract retention payment (typically 5% to 10%) strictly requires client and third-party inspection sign-off on the complete Manufacturing Data Book.",
    standards: ["ISO 9001", "ASME Sec VIII", "Project Specification"],
    tags: ["final book", "mdb", "mrb", "manufacturing data book", "handover", "quality dossier", "traceability"]
  },
  {
    id: "datasheet-mds-pds",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Process & Mechanical Equipment Datasheet (PDS / MDS)",
    abbreviation: "Datasheet",
    shortDesc: "The primary tabular engineering deliverable consolidating design variables, operating parameters (temperatures, design pressure, flow rates), materials of construction, and allowable nozzle loads.",
    keyTip: "The equipment datasheet holds primary legal precedence; in cases of conflict between schematic drawings and the datasheet, tabulated datasheet values govern fabrication.",
    standards: ["API Standards", "ISO 13702", "ASME BPVC"],
    tags: ["datasheet", "pds", "mds", "equipment datasheet", "process conditions", "design pressure", "metallurgy"]
  },
  {
    id: "irn-inspection-release",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Inspection Release Note (IRN / Shipping Release)",
    abbreviation: "IRN",
    shortDesc: "The formal written authorization issued by the Third Party Inspection (TPI) agency or client certifying that all ITP inspections, punch list clearances, and preservation steps are fully accepted for factory dispatch.",
    keyTip: "Shipment without a verified physical IRN constitutes a severe breach of contract; site receiving warehousing will reject offloading and refuse receipt vouchers.",
    standards: ["ISO 9001 QA/QC", "Project Contract Procedures"],
    tags: ["irn", "shipping release", "tpi", "inspection release", "factory dispatch", "warehouse receipt"]
  },
  {
    id: "evm-scurve-progress",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Earned Value Management (EVM) & Progress S-Curve",
    abbreviation: "EVM / S-Curve",
    shortDesc: "The international standard project performance measurement methodology integrating Planned Value (PV), Earned Value (EV), and Actual Cost (AC) to derive Cost Performance Index (CPI) and Schedule Performance Index (SPI).",
    keyTip: "An SPI below 1.0 indicates schedule slippage; the gradual early slope of the S-curve reflects engineering gestation, while the steep mid-body represents bulk procurement and shop fabrication.",
    standards: ["PMBOK Guide", "ISO 21502", "AACE International"],
    tags: ["evm", "s curve", "cpi", "spi", "project control", "earned value", "schedule variance", "progress"]
  },
  {
    id: "wbs-work-breakdown",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Work Breakdown Structure (WBS & Work Package)",
    abbreviation: "WBS",
    shortDesc: "The hierarchical decomposition of the total project scope into deliverable-oriented work packages providing the foundational framework for budgeting, scheduling, and engineering accountability.",
    keyTip: "The lowest level element is the Work Package (typically Level 4 or 5); the 100% Rule dictates that the WBS must capture all project scope without omitting or defining rogue out-of-scope tasks.",
    standards: ["PMBOK Practice Standard for WBS", "ISO 21500"],
    tags: ["wbs", "work package", "work breakdown structure", "scope management", "cost control", "project plan"]
  },
  {
    id: "mechanical-completion-punch",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Mechanical Completion (MC) & Punch List Clearance",
    abbreviation: "MC / Punch List",
    shortDesc: "The milestone certifying complete fabrication, pressure testing, and erection of process equipment prior to fluid introduction, categorizing punch items into Category A (critical) and Category B (non-critical).",
    keyTip: "Issuance of the Mechanical Completion Certificate (MCC) required to enter pre-commissioning strictly prohibits any outstanding Category A punch items without client executive waiver.",
    standards: ["ISO 10006", "EPC Handover Specification"],
    tags: ["mc", "punch list", "mcc", "mechanical completion", "handover", "walkdown", "category a punch"]
  },
  {
    id: "coc-certificate-conformance",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Certificate of Conformance / Compliance (COC / COA)",
    abbreviation: "COC",
    shortDesc: "The certified legal declaration executed by the manufacturer's Quality Assurance Director asserting that delivered components comply 100% with purchase order specifications, ASME/API codes, and approved drawings.",
    keyTip: "The COC must cross-reference the client purchase order number, unique heat/serial numbers, and relevant mill test certs, bearing the manufacturer's QA corporate seal.",
    standards: ["ISO 9001 Clause 8.6", "EN 10204", "API Spec Q1"],
    tags: ["coc", "coa", "certificate of conformance", "compliance", "quality assurance", "authenticity"]
  },
  {
    id: "ga-drawing-general-arrangement",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "General Arrangement Drawing (GA / Assembly Drawing)",
    abbreviation: "GA Drawing",
    shortDesc: "The master equipment layout drawing displaying overall envelope dimensions, operating and flooded weights, tabulated nozzle schedules (coordinates, ratings, orientations), and foundation anchor details.",
    keyTip: "Client approval of the vendor GA drawing under IFC status is a mandatory prerequisite for freezing civil foundation design and interconnecting piping isometrics.",
    standards: ["ASME Y14.100", "PIP VEFV1100", "ISO 128"],
    tags: ["ga drawing", "nozzle schedule", "dimensions", "assembly drawing", "orientation", "foundation design"]
  },
  {
    id: "pid-pfd-diagrams",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Piping & Instrumentation Diagram (P&ID / PFD)",
    abbreviation: "P&ID / PFD",
    shortDesc: "The fundamental schematic blueprint illustrating process stream flow, line sizes, piping classes, control valves, pressure relief devices, instrumentation loops, and interlock logic.",
    keyTip: "During process hazard and operability reviews (HAZOP), approved P&IDs serve as the immutable benchmark for line lists, valve schedules, and safety shutdown system (ESD) design.",
    standards: ["ISA 5.1", "ISO 10628", "PIP PIC001"],
    tags: ["p&id", "pfd", "piping and instrumentation", "process diagram", "control loop", "instrumentation"]
  },
  {
    id: "cpm-critical-path",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Critical Path Method (CPM & Float Calculation)",
    abbreviation: "CPM",
    shortDesc: "The sequence of scheduled activities with zero total float representing the longest cumulative path through the project network; any delay to a critical activity directly delays the completion date.",
    keyTip: "Long Lead Items (such as titanium clad plates, heavy forgings, and specialty pumps) invariably lie on the critical path and demand daily procurement expediting.",
    standards: ["PMBOK Time Management", "AACE International 29R-03"],
    tags: ["cpm", "critical path", "float", "project scheduling", "lead time", "expediting", "network diagram"]
  },
  {
    id: "ecn-dcn-change-notice",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Engineering Change Notice (ECN) / Design Change Notice (DCN)",
    abbreviation: "ECN / DCN",
    shortDesc: "The structured engineering control procedure documenting, evaluating, cost-estimating, and approving alterations to design specifications or drawings after issuance of Issued for Construction (IFC) prints.",
    keyTip: "Never execute shop modifications based on verbal agreements; a fully signed ECN is the vendor's primary contractual defense for securing time extensions and change orders (Claims).",
    standards: ["ISO 9001 Clause 8.5.6", "PMBOK Change Control"],
    tags: ["ecn", "dcn", "change notice", "design alteration", "change order", "claim", "engineering revision"]
  },
  {
    id: "kom-kickoff-meeting",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Kick-Off Meeting (KOM) & Pre-Inspection Meeting (PIM)",
    abbreviation: "KOM / PIM",
    shortDesc: "The inaugural formal conference uniting client, consultant, fabricator, and inspection agencies to align on communication protocols, document transmittal procedures, ITP intervention points, and key milestones.",
    keyTip: "The official Minutes of Meeting (MOM) must formally establish authorized document signatories, comment return turnaround times (typically 10 to 14 days), and inspection notification lead times.",
    standards: ["ISO 10006", "PMBOK Communications Management"],
    tags: ["kom", "pim", "kick off meeting", "pre-inspection", "mom", "project alignment", "protocol"]
  },
  {
    id: "wps-pqr-welding",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Welding Procedure Specification (WPS), PQR & Welder Qualification (WPQ)",
    abbreviation: "WPS / PQR / WPQ",
    shortDesc: "The mandatory tripartite welding quality framework: the operational procedure (WPS), qualification record backed by mechanical destruction testing (PQR), and certified welder ability (WPQ).",
    keyTip: "Any change in an essential variable (e.g., base metal P-number, filler metal F-number, welding process, deletion of PWHT) automatically invalidates the WPS and mandates a new PQR.",
    standards: ["ASME BPVC Sec IX", "AWS D1.1", "ISO 15614"],
    tags: ["wps", "pqr", "wpq", "welding procedure", "quality control", "welder qualification", "destructive testing"]
  },
  {
    id: "pqp-qcp-quality-plan",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Project Quality Plan (PQP) & Quality Control Plan (QCP)",
    abbreviation: "PQP / QCP",
    shortDesc: "The overarching strategic QA/QC roadmap defining quality objectives, inspection organizational chart, audit schedules, corrective action workflows, and quality governance.",
    keyTip: "The PQP must be submitted within the first 30 days of contract award and approved by the consultant before manufacturing mobilization can proceed.",
    standards: ["ISO 10005", "ISO 9001", "API Spec Q1"],
    tags: ["pqp", "qcp", "project quality plan", "quality assurance", "quality control", "iso 10005"]
  },
  {
    id: "calibration-traceability",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Equipment Calibration Certificate & Metrological Traceability",
    abbreviation: "Calibration",
    shortDesc: "Certified documentation verifying measurement accuracy and uncertainty limits for pressure gauges, torque wrenches, DFT gauges, and thermometers against accredited primary standards.",
    keyTip: "Conducting a hydrotest with an expired calibration certificate or uncertified manifold gauges leads to immediate test cancellation by the client TPI inspector.",
    standards: ["ISO/IEC 17025", "ASME BPVC", "NIST Traceability"],
    tags: ["calibration", "traceability", "gauge", "metrology", "iso 17025", "quality control"]
  },
  {
    id: "baseline-schedule-p6",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Approved Project Baseline Schedule (BL) & Target Program",
    abbreviation: "Baseline",
    shortDesc: "The frozen, contractually binding Primavera P6 target schedule against which actual physical progress, milestone completions, and float consumption are measured.",
    keyTip: "Re-baselining is strictly prohibited without an authorized Change Order or approved Extension of Time; resetting the baseline simply to mask contractor delays is a contractual breach.",
    standards: ["PMBOK Schedule Management", "AACE International 23R-02", "Primavera P6 Standards"],
    tags: ["baseline", "schedule", "p6", "primavera", "project control", "schedule variance", "target plan"]
  },
  {
    id: "cashflow-milestone-payment",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Project Cash Flow Projection & Milestone Payment Certificate",
    abbreviation: "Cash Flow",
    shortDesc: "The financial forecasting model synchronizing project revenue inflow and capital expenditures against verified physical delivery milestones (engineering approval, material receipt, hydrotest).",
    keyTip: "Always account for statutory retentions (typically 10% performance holdback) and advance payment amortizations to prevent severe liquidity shortages during peak shop procurement.",
    standards: ["FIDIC Red/Silver Book Clause 14", "PMBOK Financial Management"],
    tags: ["cash flow", "milestone payment", "billing", "financial control", "project finance", "progress payment"]
  },
  {
    id: "eot-claim-delay",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Extension of Time (EOT) Claim & Forensic Delay Analysis",
    abbreviation: "EOT / Claim",
    shortDesc: "The technical and contractual process of quantifying owner-caused or excusable delays via Time Impact Analysis (TIA) to secure schedule extensions and avert liquidated damages (LD).",
    keyTip: "Under FIDIC conditions, failure to submit a formal Notice of Claim within 28 days of becoming aware of the event forever bars the contractor from entitlement to time and cost relief.",
    standards: ["FIDIC Clause 20.1 / 8.4", "SCL Delay and Disruption Protocol", "AACE 29R-03"],
    tags: ["eot", "claim", "extension of time", "delay analysis", "liquidated damages", "fidic", "contract management"]
  },
  {
    id: "progress-reports-dpr-wpr",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Periodic Progress Reports: Daily (DPR), Weekly (WPR) & Monthly (MPR)",
    abbreviation: "DPR / WPR / MPR",
    shortDesc: "The formal communication deliverables tracking daily site logs, manpower histogram, equipment utilization, fabrication tonnage, weekly physical variances, and executive monthly S-curves.",
    keyTip: "Daily Progress Reports (DPR) must be countersigned daily by the resident client inspector; unsigned DPRs are routinely dismissed in contractual arbitration.",
    standards: ["PMBOK Communications Management", "ISO 21502"],
    tags: ["dpr", "wpr", "mpr", "daily report", "progress report", "project monitoring", "man-hours"]
  },
  {
    id: "risk-register-matrix",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Project Risk Register & Probability-Impact Assessment Matrix",
    abbreviation: "Risk Register",
    shortDesc: "The dynamic risk repository identifying, scoring, and prioritizing technical, commercial, supply chain, and safety risks alongside concrete mitigation plans and ownership assignments.",
    keyTip: "High-severity red-zone risks mandate dedicated cost and schedule contingency reserves that remain under the direct governance of the Project Director.",
    standards: ["ISO 31000", "PMBOK Risk Management"],
    tags: ["risk register", "risk matrix", "risk management", "contingency", "mitigation", "project control"]
  },
  {
    id: "expediting-vendor-surveillance",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Procurement Expediting & Shop Vendor Surveillance",
    abbreviation: "Expediting",
    shortDesc: "The active procurement control process involving physical factory visits and fabrication surveillance to audit raw material procurement, unblock production bottlenecks, and safeguard delivery dates.",
    keyTip: "Relying strictly on desk/telephone expediting is risky; physical unannounced shop audits frequently expose hidden sub-vendor manufacturing stalls.",
    standards: ["ISO 9001 Clause 8.4", "CIPS Procurement Guidelines"],
    tags: ["expediting", "vendor surveillance", "procurement expediting", "shop visits", "supply chain control"]
  },
  {
    id: "pre-commissioning-commissioning",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Plant Pre-Commissioning (Cold Runs) & Commissioning (Live Start-Up)",
    abbreviation: "Commissioning",
    shortDesc: "The transition from mechanical completion to operating readiness involving line blowing, instrument loop checks, motor solo runs, nitrogen purging, and live hydrocarbon feed introduction.",
    keyTip: "Before introducing live hydrocarbon feed, nitrogen purging must reduce internal system oxygen concentrations to below 0.5% by volume to avert explosive gas atmospheres.",
    standards: ["ISO 10006", "API RP 1SC", "Project Handover Specs"],
    tags: ["pre-commissioning", "commissioning", "start-up", "loop check", "inerting", "hot commissioning"]
  },
  {
    id: "pac-fac-handover",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Provisional (PAC) & Final Acceptance Certificate (FAC) & DLP",
    abbreviation: "PAC / FAC",
    shortDesc: "The formal contract closure certificates: PAC marks successful completion of the 72-hour performance test and triggers the Defect Liability Period (DLP); FAC confirms warranty expiration and full bond release.",
    keyTip: "PAC execution officially transfers asset custody, insurance, and risk of loss from contractor to client, immediately triggering the release of 50% of retained performance funds.",
    standards: ["FIDIC Clause 10 & 11", "PMBOK Procurement Closure"],
    tags: ["pac", "fac", "dlp", "handover", "provisional acceptance", "final acceptance", "warranty", "fidic"]
  },
  {
    id: "coating-blasting-inspection",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Surface Preparation Blasting (Sa 2.5) & Industrial Coating Inspection",
    abbreviation: "Coating / Sa 2.5",
    shortDesc: "Quality control of anti-corrosion protection encompassing Sa 2.5 blast profile verification, Wet/Dry Film Thickness (WFT/DFT) measurement, and cross-cut adhesion evaluation.",
    keyTip: "Coating application is strictly banned unless substrate steel temperature is at least 3°C (5°F) above the atmospheric dew point to prevent trapping invisible condensed moisture under the primer.",
    standards: ["ISO 8501-1", "SSPC-SP 10", "ASTM D4417", "NACE Coating Standards"],
    tags: ["coating", "blasting", "sa 2.5", "dft", "surface preparation", "quality control", "corrosion protection"]
  },
  {
    id: "tq-technical-query",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Technical Query (TQ) & Clarification Request",
    abbreviation: "TQ",
    shortDesc: "Formal contractual form used to request clarification or resolution for ambiguities, conflicts, or discrepancies within project engineering documents, job specifications, and design drawings.",
    keyTip: "Informal email discussions hold no contractual validity; approved TQ responses become legally binding and serve as the technical basis for any subsequent Variation or Change Orders.",
    standards: ["ISO 10006","Project DCC Procedures","FIDIC Red Book Clause 3"],
    tags: ["tq","technical query","clarification","engineering clarification","contract administration","design discrepancy"]
  },
  {
    id: "clarification-tbe-cbe",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Technical & Commercial Clarifications (TBE / CBE)",
    abbreviation: "Clarification",
    shortDesc: "Formal process of querying, reconciling, and aligning vendor technical and commercial proposals with project bid specifications before final evaluation and contract award.",
    keyTip: "All agreements made during clarification meetings must be promptly documented in an official signed Minutes of Meeting (MoM); unrecorded commitments are legally unenforceable.",
    standards: ["PMBOK Procurement Management","FIDIC Tendering Procedure","CIPS Standards"],
    tags: ["clarification","tbe","cbe","vendor evaluation","procurement","bid clarification","commercial alignment"]
  },
  {
    id: "mom-minutes-of-meeting",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Minutes of Meeting (MoM)",
    abbreviation: "MoM",
    shortDesc: "Official contractual document recording key project decisions, engineering agreements, commercial commitments, and the assigned Action Items matrix with binding target deadlines.",
    keyTip: "The standard contractual window to contest draft MoM minutes is 48 to 72 hours; lack of written objection within this timeframe constitutes full legal acceptance.",
    standards: ["FIDIC Contract Administration","ISO 21500","PMBOK Integration"],
    tags: ["mom","minutes of meeting","action items","project governance","contractual records","meeting protocol"]
  },
  {
    id: "rfi-request-for-info",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Request for Information (RFI)",
    abbreviation: "RFI",
    shortDesc: "Standardized construction management query submitted by site contractors to resolve missing dimensions, conflicting drawing details, or unforeseen field conditions.",
    keyTip: "While an RFI resolves field discrepancies or clarifies existing drawing intent, a TQ is reserved for formal engineering inquiries regarding technical design specifications or code departures.",
    standards: ["AIA Document G716","CII Best Practices","ISO 9001"],
    tags: ["rfi","request for information","field engineering","site queries","drawing clarification","construction management"]
  },
  {
    id: "deviation-list-vdr",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Technical & Commercial Deviation List (VDR)",
    abbreviation: "Deviation / VDR",
    shortDesc: "Formal schedule submitted by vendors detailing explicit deviations, material substitutions, or design departures from the client's mandatory project specifications.",
    keyTip: "Any technical requirement omitted from the Deviation List is deemed fully compliant; vendors cannot later claim cost or schedule relief for unlisted exceptions.",
    standards: ["ISO 9001:2015 Clause 8.2","Shell DEP 01.00.01.30","Total GS Specs"],
    tags: ["deviation","vdr","vendor deviation","spec departure","technical compliance","bid exceptions"]
  },
  {
    id: "vo-variation-change-order",
    category: "corporate",
    categoryName: "Organizational Terms",
    term: "Variation Order (VO) & Change Order",
    abbreviation: "VO / Change Order",
    shortDesc: "Official written instruction from the client or engineer authorizing alterations to the scope of work, material specifications, contract price, or milestone schedule.",
    keyTip: "Contractors should never commence out-of-scope work on verbal assurances alone; without an authorized VO in place, compensation claims face immediate rejection.",
    standards: ["FIDIC Red/Silver Book Clause 13","PMBOK Scope Management","NEC4 Contracts"],
    tags: ["vo","variation order","change order","scope change","contract amendment","extra works","commercial adjustment"]
  }
];
