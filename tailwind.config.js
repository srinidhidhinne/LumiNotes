const themed = (name, shades) =>
  Object.fromEntries(shades.map((shade) => [shade, `rgb(var(--${name}-${shade}) / <alpha-value>)`]));

// Palette keys are legacy names: navy holds the charcoal ink scale and sky holds the deep purple primary scale.
// Their values live in src/index.css so light and dark themes can swap them.
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: themed('navy', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]),
        cream: themed('cream', [50, 100, 200]),
        sky: themed('sky', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
        lavender: themed('lavender', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
        blush: themed('blush', [50, 100, 200, 300, 400, 600, 800, 900]),
        sage: themed('sage', [50, 100, 200, 300, 400, 600, 800, 900]),
      },
      fontFamily: {
        sans: ['"Nunito Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(57, 51, 66, 0.04), 0 8px 24px rgba(57, 51, 66, 0.06)',
        lift: '0 12px 32px rgba(112, 85, 143, 0.16)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 200ms ease-out',
        slideUp: 'slideUp 240ms ease-out',
      },
    },
  },
  plugins: [],
};
