export type NPS = '2' | '3' | '4' | '6' | '8' | '10' | '12' | '14' | '16' | '18' | '20' | '24';
export type PipeSchedule = 'STD' | 'XS' | 'SCH40' | 'SCH80' | 'SCH160';

// Structure: { [nps]: { OD_mm: number, schedules: { [sch]: thickness_mm } } }
export const PipeDimensions: Record<NPS, { OD_mm: number, schedules: Partial<Record<PipeSchedule, number>> }> = {
  '2': { OD_mm: 60.3, schedules: { 'STD': 3.91, 'XS': 5.54, 'SCH40': 3.91, 'SCH80': 5.54, 'SCH160': 8.74 } },
  '3': { OD_mm: 88.9, schedules: { 'STD': 5.49, 'XS': 7.62, 'SCH40': 5.49, 'SCH80': 7.62, 'SCH160': 11.13 } },
  '4': { OD_mm: 114.3, schedules: { 'STD': 6.02, 'XS': 8.56, 'SCH40': 6.02, 'SCH80': 8.56, 'SCH160': 13.49 } },
  '6': { OD_mm: 168.3, schedules: { 'STD': 7.11, 'XS': 10.97, 'SCH40': 7.11, 'SCH80': 10.97, 'SCH160': 18.26 } },
  '8': { OD_mm: 219.1, schedules: { 'STD': 8.18, 'XS': 12.7, 'SCH40': 8.18, 'SCH80': 12.7, 'SCH160': 23.01 } },
  '10': { OD_mm: 273.1, schedules: { 'STD': 9.27, 'XS': 12.7, 'SCH40': 9.27, 'SCH80': 15.09, 'SCH160': 28.58 } },
  '12': { OD_mm: 323.8, schedules: { 'STD': 9.53, 'XS': 12.7, 'SCH40': 10.31, 'SCH80': 17.48, 'SCH160': 33.32 } },
  '14': { OD_mm: 355.6, schedules: { 'STD': 9.53, 'XS': 12.7, 'SCH40': 11.13, 'SCH80': 19.05, 'SCH160': 35.71 } },
  '16': { OD_mm: 406.4, schedules: { 'STD': 9.53, 'XS': 12.7, 'SCH40': 12.7, 'SCH80': 21.44, 'SCH160': 40.49 } },
  '18': { OD_mm: 457.0, schedules: { 'STD': 9.53, 'XS': 12.7, 'SCH40': 14.27, 'SCH80': 23.83, 'SCH160': 45.24 } },
  '20': { OD_mm: 508.0, schedules: { 'STD': 9.53, 'XS': 12.7, 'SCH40': 15.09, 'SCH80': 26.19, 'SCH160': 50.01 } },
  '24': { OD_mm: 609.6, schedules: { 'STD': 9.53, 'XS': 12.7, 'SCH40': 17.48, 'SCH80': 30.96, 'SCH160': 59.54 } },
};
