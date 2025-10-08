// Unified, accessible color system with light & dark tokens.
// Keep default export for backward-compat (falls back to Light).

export const Light = {
  primary: '#0B3B77',       // deep navy
  primaryMuted: '#295A99',
  accent: '#12C2A3',        // teal
  background: '#FFFFFF',
  surface: '#F6F7F9',
  textDark: '#1F2937',      // gray-800
  text: '#334155',          // gray-700
  textMuted: '#6B7280',     // gray-500
  borderDefault: '#E5E7EB',
  buttonDisabled: '#93A3B3',
  success: '#10B981',
  warn: '#F59E0B',
  error: '#EF4444',
};

export const Dark = {
  primary: '#66A3FF',
  primaryMuted: '#3B82F6',
  accent: '#2DD4BF',
  background: '#0B1220',
  surface: '#111827',
  textDark: '#F3F4F6',
  text: '#E5E7EB',
  textMuted: '#9CA3AF',
  borderDefault: '#1F2937',
  buttonDisabled: '#374151',
  success: '#34D399',
  warn: '#FBBF24',
  error: '#F87171',
};

const Colors = Light;
export default Colors;
