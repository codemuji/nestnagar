/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1B211A',
          secondary: '#628141',
          accent: '#8BAE66',
          cta: '#E07A2F',
          warning: '#EBD5AB',
          error: '#C94B4B',
          background: '#F7F8F3',
          white: '#FFFFFF',
        },
        text: {
          primary: '#1B211A',
          secondary: '#4B5A48',
          muted: '#7A8A77',
          disabled: '#A8B3A5',
        },
        border: {
          light: '#E4E8DE',
          default: '#D5DDC8',
          dark: '#B8C5A8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        headings: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        'button': '10px',
        'card': '14px',
        'modal': '18px',
        'input': '8px',
      },
      boxShadow: {
        'card': '0px 4px 12px rgba(27,33,26,0.08)',
        'hover': '0px 8px 24px rgba(27,33,26,0.12)',
        'modal': '0px 20px 40px rgba(27,33,26,0.15)',
      }
    },
  },
  plugins: [],
}
