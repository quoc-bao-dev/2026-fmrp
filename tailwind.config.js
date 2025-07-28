/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './containers/**/*.{js,ts,jsx,tsx}',

    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/react-tailwindcss-datepicker/dist/index.esm.js',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontSize: {
        10: [
          '10px',
          {
            lineHeight: '12px',
          },
        ],
        11: [
          '11px',
          {
            lineHeight: '14px',
          },
        ],
        13: [
          '13px',
          {
            lineHeight: '18px',
          },
        ],
        15: [
          '15px',
          {
            lineHeight: '22px',
          },
        ],
      },
      fontFamily: {
        deca: ['Lexend Deca', 'sans-serif'],
      },
      colors: {
        'gray-color': '#F4F6F8',
        'brand-color': '#003DA0',
        'new-blue': '#003DA0',
        'black-color': '#141522',
        'blue-color': '#0375F3',
        'secondary-color-text': '#637381',
        'secondary-color-text-disabled': '#919EAB',
        'light-blue-color': '#0375F3',
        primary: {
          '01': '#0F4F9E',
          '05': '#C7DFFB',
          '06': '#E2F0FE',
          '07': '#EBF5FF',
        },
        secondary: {
          '09': '#1B1A18',
        },
        neutral: {
          '00': '#FFFFFF',
          '01': '#F9FAFB',
          '02': '#9295A4',
          '03': '#667085',
          '04': '#52575E',
          '05': '#3A3E4C',
          '06': '',
          '07': '#141522',
          '08': '',
          '09': '',
          10: '',
          N400: '#D8DAE5',
        },
        green: {
          '00': '#064E3B',
          '01': '#0BAA2E',
          '02': '#EBFEF2',
        },
        red: {
          '00': '',
          '01': '#EE1E1E',
          '02': '#FFEEF0',
        },
        danger: {
          6: '#F53F3F',
        },
        grey: {
          300: '#DFE3E8',
          700: '#454F5B',
        },
        typo: {
          blue: {
            1: '#11315B',
            2: '#3276FA',
            3: '#4752E6',
            4: '#0375F3',
            5: '#25387A',
          },
          gray: {
            1: '#9295A4',
            2: '#667085',
            3: '#3A3E4C',
            4: '#637381',
            5: '#52575E',
            6: '#8E8E93',
            7: '#AEAEB2',
          },
          black: {
            1: '#141522',
            2: '#101828',
            3: '#17181A',
            4: '#1C252E',
            5: '#1F2329',
            6: '#303030',
          },
          green: {
            1: '#1A7526',
            2: '#1FC583',
            3: '#118D57',
          },
          orange: {
            1: '#FF8F0D',
          },
          red: {
            1: '#B71D18',
          },
        },
        border: {
          gray: {
            1: '#D0D5DD',
            2: '#DDDDE2',
          },
        },
        background: {
          gray: {
            1: '#D0D5DD',
            2: '#9295A4',
            3: '#F3F4F6',
            4: '#D1D1D6',
            5: '#E5E5EA',
          },
          green: {
            1: '#35BD4B',
          },
          blue: {
            1: '#5B65F5',
            2: '#0375F3',
            3: '#EBF5FF',
            4: '#0F4F9E',
          },
        },
      },
      aspectRatio: {
        '16/9': '16 / 9',
      },
      boxShadow: {
        'hover-button': '0px 1px 2px 0px #1018280D',
        'custom-blue': '4px 4px 8px 0 rgba(3, 117, 243, 0.25)',
        'custom-inner-blue': 'inset 0px -2px 0px 0px #12B0F8',
      },
      screens: {
        '3xl': '1600px',
        xl1439: '1440px',
        xxl: '1400px',
        std: '1400px',
        xlg: '1366px',
        lgd: { max: '1023px' },
        mdd: { max: '767px' },
        xs: '430px',
      },
      gridTemplateColumns: {
        13: 'repeat(13, minmax(0, 1fr))',
        14: 'repeat(14, minmax(0, 1fr))',
        15: 'repeat(15, minmax(0, 1fr))',
        16: 'repeat(16, minmax(0, 1fr))',
        17: 'repeat(17, minmax(0, 1fr))',
        18: 'repeat(18, minmax(0, 1fr))',
        19: 'repeat(19, minmax(0, 1fr))',
        20: 'repeat(20, minmax(0, 1fr))',
        21: 'repeat(21, minmax(0, 1fr))',
        22: 'repeat(22, minmax(0, 1fr))',
        23: 'repeat(23, minmax(0, 1fr))',
        24: 'repeat(24, minmax(0, 1fr))',
        25: 'repeat(25, minmax(0, 1fr))',
        26: 'repeat(26, minmax(0, 1fr))',
        27: 'repeat(27, minmax(0, 1fr))',
        28: 'repeat(28, minmax(0, 1fr))',
        29: 'repeat(29, minmax(0, 1fr))',
        30: 'repeat(30, minmax(0, 1fr))',
        31: 'repeat(31, minmax(0, 1fr))',
        32: 'repeat(32, minmax(0, 1fr))',
      },
      gridColumn: {
        'span-13': 'span 13 / span 13',
        'span-14': 'span 14 / span 14',
        'span-15': 'span 15 / span 15',
        'span-16': 'span 16 / span 16',
      },
      backgroundImage: {
        logo: "url('/logo_1.png')",
        'linear-bg-green': 'linear-gradient(to bottom right, #1FC583 0%, #1F9285 100%)',
        'linear-bg-progress-full': 'linear-gradient(to bottom right, #1FBA83 0%, #1FA484 100%)',
        'linear-background-chat': 'linear-gradient(to top left, #A0BEF8 0%, #B5F0F0 100%)',
        'linear-background-button-send': 'linear-gradient(to bottom, #12B0F8 0%, #007AFF 100%)',
        'linear-border-toggle-bot': 'linear-gradient(49.59deg, #E0FFCC 0%, #CCFFEC 100%)',
        'linear-background-toggle-bot': 'linear-gradient(155.11deg, #1FC583 0%, #1F9285 100%)',
        'linear-background-button-chat': 'linear-gradient(170.14deg, #1FC583 5.11%, #1F9285 95.28%)',
      },
    },
  },
  plugins: [
    // require("@tailwindcss/line-clamp"),
    require('tailwind-scrollbar'),
    require('@tailwindcss/aspect-ratio'),
    function ({ addUtilities }) {
      addUtilities({
        '.font-oblique': {
          'font-style': 'oblique',
        },
      })
    },
    function ({ addComponents }) {
      addComponents({
        '.responsive-text-xxs': {
          fontSize: '9px',
          lineHeight: '14px',
          '@screen 3xl': {
            fontSize: '10px',
            lineHeight: '1rem',
          },
        },
        '.responsive-text-xs': {
          fontSize: '9px',
          lineHeight: '11px',
          '@screen xl': {
            fontSize: '10px' /* text-10 */,
            lineHeight: '12px',
          },
          '@screen 2xl': {
            fontSize: '11px' /* text-11 */,
            lineHeight: '14px',
          },
          '@screen 3xl': {
            fontSize: '12px' /* text-12 */,
            lineHeight: '16px',
          },
        },
        '.responsive-text-sm': {
          fontSize: '11px',
          lineHeight: '14px',
          '@screen xl': {
            fontSize: '0.75rem' /* text-xs */,
            lineHeight: '1rem',
          },
          '@screen 2xl': {
            fontSize: '13px' /* text-13 */,
            lineHeight: '18px',
          },
          '@screen 3xl': {
            fontSize: '0.875rem' /* text-sm */,
            lineHeight: '1.25rem',
          },
        },
        '.responsive-text-base': {
          fontSize: '13px',
          lineHeight: '18px',
          '@screen xl': {
            fontSize: '0.875rem' /* text-sm */,
            lineHeight: '1.25rem',
          },
          '@screen 2xl': {
            fontSize: '15px' /* text-15 */,
            lineHeight: '22px',
          },
          '@screen 3xl': {
            fontSize: '1rem' /* text-base */,
            lineHeight: '1.5rem',
          },
        },
        '.responsive-text-lg': {
          fontSize: '15px',
          lineHeight: '22px',
          '@screen xl': {
            fontSize: '1rem' /* text-base */,
            lineHeight: '1.5rem',
          },
          '@screen 2xl': {
            fontSize: '17px' /* text-lg */,
            lineHeight: '24px',
          },
          '@screen 3xl': {
            fontSize: '18px' /* text-xl */,
            lineHeight: '28px',
          },
        },
        '.responsive-text-xl': {
          fontSize: '17px',
          lineHeight: '24px',
          '@screen xl': {
            fontSize: '18px',
            lineHeight: '28px',
          },
          '@screen 2xl': {
            fontSize: '19px',
            lineHeight: '28px',
          },
          '@screen 3xl': {
            fontSize: '1.25rem' /* text-xl */,
            lineHeight: '28px',
          },
        },
        '.responsive-text-2xl': {
          fontSize: '21px',
          lineHeight: '28px',
          '@screen xl': {
            fontSize: '22px',
            lineHeight: '2rem',
          },
          '@screen 2xl': {
            fontSize: '23px',
            lineHeight: '2rem',
          },
          '@screen 3xl': {
            fontSize: '1.5rem' /* text-2xl */,
            lineHeight: '2rem',
          },
        },
      })
    },
  ],
}
