/**
 * src/modules/vessel-weight/data/pipeDimensions.ts
 * ASME B36.10 pipe dimensions for nozzles and shells built from pipe.
 * OD is constant for a given NPS. WT varies by schedule.
 * OD and WT are in mm.
 */

export type PipeNPS = "0.5" | "0.75" | "1" | "1.5" | "2" | "3" | "4" | "6" | "8" | "10" | "12" | "14" | "16" | "18" | "20" | "24";
export type PipeSchedule = "STD" | "XS" | "XXS" | "SCH10" | "SCH20" | "SCH30" | "SCH40" | "SCH60" | "SCH80" | "SCH100" | "SCH120" | "SCH140" | "SCH160";

export const PIPE_DIMENSIONS: Record<string, Record<string, { OD: number; WT: number }>> = {
  "0.5": {  STD: { OD: 21.3, WT: 2.77 }, XS: { OD: 21.3, WT: 3.73 }, SCH80: { OD: 21.3, WT: 3.73 } },
  "0.75": { STD: { OD: 26.7, WT: 2.87 }, XS: { OD: 26.7, WT: 3.91 } },
  "1":    { STD: { OD: 33.4, WT: 3.38 }, XS: { OD: 33.4, WT: 4.55 }, XXS: { OD: 33.4, WT: 9.09 } },
  "1.5":  { STD: { OD: 48.3, WT: 3.68 }, XS: { OD: 48.3, WT: 5.08 }, XXS: { OD: 48.3, WT: 10.16 } },
  "2":    { STD: { OD: 60.3, WT: 3.91 }, XS: { OD: 60.3, WT: 5.54 }, XXS: { OD: 60.3, WT: 11.07 } },
  "3":    { STD: { OD: 88.9, WT: 5.49 }, XS: { OD: 88.9, WT: 7.62 }, XXS: { OD: 88.9, WT: 15.24 } },
  "4":    { STD: { OD: 114.3, WT: 6.02 }, XS: { OD: 114.3, WT: 8.56 }, XXS: { OD: 114.3, WT: 17.12 }, SCH10: { OD: 114.3, WT: 3.05 }, SCH40: { OD: 114.3, WT: 6.02 } },
  "6":    { STD: { OD: 168.3, WT: 7.11 }, XS: { OD: 168.3, WT: 10.97 }, SCH10: { OD: 168.3, WT: 3.4 }, SCH40: { OD: 168.3, WT: 7.11 }, SCH80: { OD: 168.3, WT: 10.97 } },
  "8":    { STD: { OD: 219.1, WT: 8.18 }, XS: { OD: 219.1, WT: 12.70 }, SCH10: { OD: 219.1, WT: 3.76 }, SCH40: { OD: 219.1, WT: 8.18 }, SCH80: { OD: 219.1, WT: 12.70 } },
  "10":   { STD: { OD: 273.1, WT: 9.27 }, XS: { OD: 273.1, WT: 12.70 }, SCH10: { OD: 273.1, WT: 4.19 }, SCH40: { OD: 273.1, WT: 9.27 }, SCH80: { OD: 273.1, WT: 12.70 } },
  "12":   { STD: { OD: 323.9, WT: 9.53 }, XS: { OD: 323.9, WT: 12.70 }, SCH10: { OD: 323.9, WT: 4.57 }, SCH40: { OD: 323.9, WT: 10.31 }, SCH80: { OD: 323.9, WT: 12.70 } },
  "14":   { STD: { OD: 355.6, WT: 9.53 }, XS: { OD: 355.6, WT: 12.70 }, SCH40: { OD: 355.6, WT: 11.13 }, SCH80: { OD: 355.6, WT: 15.09 } },
  "16":   { STD: { OD: 406.4, WT: 9.53 }, XS: { OD: 406.4, WT: 12.70 }, SCH40: { OD: 406.4, WT: 12.7 }, SCH80: { OD: 406.4, WT: 16.66 } },
  "18":   { STD: { OD: 457.0, WT: 9.53 }, XS: { OD: 457.0, WT: 12.70 }, SCH40: { OD: 457.0, WT: 14.27 } },
  "20":   { STD: { OD: 508.0, WT: 9.53 }, XS: { OD: 508.0, WT: 12.70 }, SCH40: { OD: 508.0, WT: 15.09 } },
  "24":   { STD: { OD: 609.6, WT: 9.53 }, XS: { OD: 609.6, WT: 12.70 }, SCH40: { OD: 609.6, WT: 17.48 } },
};
