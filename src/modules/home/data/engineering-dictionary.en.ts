export interface EnglishDictionaryTerm {
  id: string;
  category: "materials" | "equipment" | "jargon" | "inspection" | "experience";
  categoryName: string;
  term: string;
  abbreviation?: string;
  shortDesc: string;
  keyTip: string;
  standards?: string[];
  tags: string[];
}

export const DICTIONARY_CATEGORIES_EN = [
  { id: "all", label: "All Terms", count: 34 },
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
  }
];
