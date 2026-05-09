import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#620707',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      // Comprehensive responsive typography scale
      fontSize: {
        // Display sizes (hero/banner headings)
        'display-xl': ['clamp(2.5rem, 8vw, 4rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-lg': ['clamp(2rem, 6vw, 3.5rem)', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '800' }],
        'display-md': ['clamp(1.75rem, 5vw, 3rem)', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '800' }],

        // Heading sizes (h1-h6)
        'h1': ['clamp(1.75rem, 5vw, 2.5rem)', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'h2': ['clamp(1.5rem, 4vw, 2rem)', { lineHeight: '1.3', letterSpacing: '-0.005em', fontWeight: '700' }],
        'h3': ['clamp(1.25rem, 3.5vw, 1.75rem)', { lineHeight: '1.35', fontWeight: '700' }],
        'h4': ['clamp(1.1rem, 2.5vw, 1.375rem)', { lineHeight: '1.4', fontWeight: '600' }],
        'h5': ['clamp(1rem, 2vw, 1.25rem)', { lineHeight: '1.4', fontWeight: '600' }],
        'h6': ['clamp(0.9375rem, 1.75vw, 1.125rem)', { lineHeight: '1.5', fontWeight: '600' }],

        // Body text sizes
        'body-lg': ['clamp(1rem, 2vw, 1.125rem)', { lineHeight: '1.6', fontWeight: '400' }],
        'body-base': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['clamp(0.875rem, 1.5vw, 1rem)', { lineHeight: '1.6', fontWeight: '400' }],

        // Captions and metadata
        'caption': ['0.875rem', { lineHeight: '1.5', fontWeight: '500' }],
        'caption-sm': ['0.8125rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption-xs': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],

        // Label and button text
        'label': ['0.875rem', { lineHeight: '1.4', fontWeight: '600' }],
        'button-lg': ['1rem', { lineHeight: '1.4', fontWeight: '600' }],
        'button-md': ['0.9375rem', { lineHeight: '1.4', fontWeight: '600' }],
        'button-sm': ['0.875rem', { lineHeight: '1.4', fontWeight: '600' }],
      },
      letterSpacing: {
        tight: '-0.02em',
        snug: '-0.01em',
        normal: '0em',
        wide: '0.01em',
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.hidden-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    }),
  ],
};

export default config;
