/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"','serif'],
        body: ['"DM Sans"','sans-serif'],
      },
      colors: {
        gold: { DEFAULT:'#C9A84C', light:'#E2C97A', dark:'#9C7A2E' },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease forwards',
        'slide-up': 'slideUp 0.25s ease forwards',
      },
      keyframes: {
        fadeIn: { from:{ opacity:0 }, to:{ opacity:1 } },
        slideUp: { from:{ opacity:0, transform:'translateY(8px)' }, to:{ opacity:1, transform:'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
