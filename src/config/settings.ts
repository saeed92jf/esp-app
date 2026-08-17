// src/config/settings.ts
// Central configuration for the primary-color presets.

/** Each id maps 1:1 to a CSS class `primary-color-<id>`. */
export type PrimaryColorId = 'red' | 'pink' | 'purple' | 'blue' | 'green' | 'orange';

export interface PrimaryColorPreset {
  id: PrimaryColorId;
  labelKey: string; // i18n key under `Settings.colors.*`
  hsl: string; // raw "H S% L%" for the swatch preview
  hex: string;
}

/** Order here defines the order shown in the settings switcher. */
export const PRIMARY_COLORS: readonly PrimaryColorPreset[] = [
  { id: 'red', labelKey: 'red', hsl: '1 79% 48%', hex: '#dd1c1a' },
  { id: 'pink', labelKey: 'pink', hsl: '334 100% 50%', hex: '#ff006e' },
  { id: 'purple', labelKey: 'purple', hsl: '265 83% 57%', hex: '#8338ec' },
  { id: 'blue', labelKey: 'blue', hsl: '213 100% 61%', hex: '#3a86ff' },
  { id: 'green', labelKey: 'green', hsl: '164 95% 43%', hex: '#06d6a0' },
  { id: 'orange', labelKey: 'orange', hsl: '19 97% 51%', hex: '#fb5607' },
] as const;

export const DEFAULT_PRIMARY_COLOR: PrimaryColorId = 'purple';
export const PRIMARY_COLOR_STORAGE_KEY = 'app-primary-color';
