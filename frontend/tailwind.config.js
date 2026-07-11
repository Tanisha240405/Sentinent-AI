/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        alabaster: '#FAF9F6',
        sepia: '#CAA287',
        teal: '#3D7375',
        patina: '#2C6C73',
        umber: '#745D3B',
        obsidian: '#102221',
        // Semantic mapping for the light theme
        canvas: '#FAF9F6',
        surface: '#FFFFFF',
        'surface-alt': '#F4EFEA', // Very light sepia tint
        primary: '#2C6C73', // Patina
        secondary: '#3D7375', // Teal
        accent: '#CAA287', // Sepia
        'text-main': '#102221', // Obsidian
        'text-muted': '#745D3B', // Umber
        positive: '#2C6C73', // Using Patina for positive instead of salmon/green to fit theme
        negative: '#D9534F', // Keeping a muted red for clear negative, but could use Umber
        neutral: '#CAA287',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-dot': 'pulseDot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 28s linear infinite',
        'twinkle': 'twinkle random(2s, 7s) infinite',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(44, 108, 115, 0.5)' },
          '50%': { boxShadow: '0 0 0 8px rgba(44, 108, 115, 0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        twinkle: {
          '0%, 100%': { opacity: 0, transform: 'scale(0.6)' },
          '50%': { opacity: 1, transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
