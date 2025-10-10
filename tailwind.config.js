/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A',
        'primary-muted': '#295A99',
        accent: '#10B981',
        background: '#FFFFFF',
        surface: '#F6F7F9',
        text: '#334155',
        textdark: '#1F2937',
        textmuted: '#6B7280',
        border: '#E5E7EB',
        disabled: '#93A3B3',
        success: '#10B981',
        warn: '#F59E0B',
        error: '#EF4444',

        // dark mode overrides
        'dark-background': '#0B1220',
        'dark-surface': '#111827',
        'dark-text': '#E5E7EB',
        'dark-textmuted': '#9CA3AF',
        'dark-border': '#1F2937',
      },
    },
  },
  plugins: [],
};
