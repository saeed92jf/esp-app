/**
 * src/modules/vessel-weight/data/flangeWeightTable.ts
 * ASME B16.5 Flange Weights (kg)
 * A subset of common weights for estimation purposes.
 */

export type FlangeClass = "150" | "300" | "600" | "900" | "1500" | "2500";
export type FlangeType = "WN" | "SO" | "BL" | "SW";

// Structure: [NPS][Class][Type] -> weight in kg
export const FLANGE_WEIGHTS: Record<string, Record<string, Record<string, number>>> = {
  "2": {
    "150": { WN: 2.7, SO: 2.3, BL: 2.7, SW: 2.3 },
    "300": { WN: 3.6, SO: 3.2, BL: 3.6, SW: 3.2 },
    "600": { WN: 4.1, SO: 3.6, BL: 4.1, SW: 3.6 },
  },
  "3": {
    "150": { WN: 5.4, SO: 4.5, BL: 5.4, SW: 4.5 },
    "300": { WN: 7.7, SO: 6.8, BL: 7.7, SW: 6.8 },
    "600": { WN: 8.6, SO: 7.7, BL: 8.6, SW: 7.7 },
  },
  "4": {
    "150": { WN: 7.7, SO: 6.8, BL: 7.7, SW: 6.8 },
    "300": { WN: 12.2, SO: 10.9, BL: 12.2, SW: 10.9 },
    "600": { WN: 18.6, SO: 16.3, BL: 18.6, SW: 16.3 },
  },
  "6": {
    "150": { WN: 11.8, SO: 9.1, BL: 11.8, SW: 9.1 },
    "300": { WN: 20.4, SO: 18.1, BL: 20.4, SW: 18.1 },
    "600": { WN: 35.4, SO: 30.8, BL: 35.4, SW: 30.8 },
  },
  "8": {
    "150": { WN: 19.5, SO: 14.1, BL: 21.3, SW: 14.1 },
    "300": { WN: 31.8, SO: 27.2, BL: 36.3, SW: 27.2 },
    "600": { WN: 54.4, SO: 48.1, BL: 63.5, SW: 48.1 },
  },
  "10": {
    "150": { WN: 25.4, SO: 20.4, BL: 31.8, SW: 20.4 },
    "300": { WN: 45.4, SO: 36.7, BL: 58.1, SW: 36.7 },
    "600": { WN: 85.3, SO: 76.2, BL: 106, SW: 76.2 },
  },
  // We can expand this table as needed. For missing values, 
  // the engine will prompt for manual input or use an approximation formula.
};
