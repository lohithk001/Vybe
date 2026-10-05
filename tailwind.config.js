/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './data/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        loopa: {
          bg: '#F5F0E6',
          dark: '#111111',
          yellow: '#FFE229',
          pink: '#FF5CA8',
          purple: '#8E7CFF',
          mint: '#55D6BE',
          orange: '#FF8A3D',
          blue: '#6DB7FF',
          cream: '#FFFDF9',
        },
        vybe: {
          bg: '#F5F0E6',
          dark: '#111111',
          yellow: '#FFE229',
          pink: '#FF5CA8',
          purple: '#8E7CFF',
          mint: '#55D6BE',
          orange: '#FF8A3D',
          blue: '#6DB7FF',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Fredoka', 'Space Grotesk', 'sans-serif'],
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
        handwritten: ['var(--font-handwritten)', 'Caveat', 'cursive'],
      },
      boxShadow: {
        'brutal-xs': '2px 2px 0px #111111',
        'brutal-sm': '3px 3px 0px #111111',
        'brutal': '4px 4px 0px #111111',
        'brutal-md': '5px 5px 0px #111111',
        'brutal-lg': '6px 6px 0px #111111',
        'brutal-xl': '8px 8px 0px #111111',
        'brutal-2xl': '12px 12px 0px #111111',
      },
      borderWidth: {
        '3': '3px',
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
      },
    },
  },
  plugins: [],
};