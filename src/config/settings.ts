// src/config/settings.ts
// Central configuration for the primary-color presets.

/** Each id maps 1:1 to a CSS class `primary-color-<id>`. */
export type PrimaryColorId = 'red' | 'blue' | 'green' | 'orange' | 'purple';

export interface PrimaryColorPreset {
  id: PrimaryColorId;
  labelKey: string; // i18n key under `Settings.colors.*`
  hsl: string; // raw "H S% L%" for the swatch preview
}

/** Order here defines the order shown in the settings switcher. */
export const PRIMARY_COLORS: readonly PrimaryColorPreset[] = [
  { id: 'blue', labelKey: 'blue', hsl: '221 83% 53%' },
  { id: 'green', labelKey: 'green', hsl: '142 71% 45%' },
  { id: 'red', labelKey: 'red', hsl: '0 72% 51%' },
  { id: 'orange', labelKey: 'orange', hsl: '25 95% 53%' },
  { id: 'purple', labelKey: 'purple', hsl: '262 83% 58%' },
] as const;

export const DEFAULT_PRIMARY_COLOR: PrimaryColorId = 'blue';
export const PRIMARY_COLOR_STORAGE_KEY = 'app-primary-color';
