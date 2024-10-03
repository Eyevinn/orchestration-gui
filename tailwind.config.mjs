import colors from 'tailwindcss/colors';

const BRAND_COLOR = '#1DB954';
const GREEN_COLOR = '#57B660';
const INDICATOR_YELLOW = '#CA8D31';
const INDICATOR_RED = '#CA3A31';
const BORDER = '#E5E7EB99';
/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        background: colors.zinc['900'],
        container: colors.zinc['800'],
        light: colors.zinc['600'],
        indicatorGreen: GREEN_COLOR,
        indicatorYellow: INDICATOR_YELLOW,
        indicatorRed: INDICATOR_RED,
        monitoringBorder: BORDER,
        p: colors.gray['200'],
        ['button-bg']: BRAND_COLOR,
        ['button-hover-bg']: colors.green['500'],
        ['button-hover-red-bg']: colors.red['500'],
        ['button-text']: colors.zinc['800'],
        ['button-delete']: colors.red['600'],
        ['button-abort']: colors.stone['300'],
        ['button-abort-hover']: colors.stone['100'],
        ['confirm']: BRAND_COLOR,
        brand: BRAND_COLOR,
        ['unclickable-bg']: colors.zinc['600'],
        ['unclickable-text']: colors.zinc['500'],
        error: colors.red['600']
      },
      boxShadow: {
        tooltip: 'box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15)'
      }
    }
  },
  plugins: []
};

export default config;
