module.exports = {
  content: ['./index.html', './src/frontend/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
      },
      colors: {
        'brand-primary': {
          DEFAULT: '#1f2937',
          light: '#374151',
          dark: '#111827',
        },
        'brand-secondary': '#6b7280',
        base: {
          100: 'rgba(255, 255, 255, 0.65)',
          200: '#f8fafc',
          300: '#f1f5f9',
          400: '#e2e8f0',
        },
        contrast: {
          100: '#0f172a',
          200: '#334155',
          300: '#64748b',
        },
      },
    },
  },
  plugins: [],
};
