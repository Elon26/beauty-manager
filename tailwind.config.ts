import { scaleVar } from '@kirz/nativewind-scale/vars';
import type { Config } from 'tailwindcss';

import { colors } from './src/config/theme/colors';

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset'), require('@kirz/nativewind-scale/preset')],
  darkMode: 'class',
  theme: {
    fontFamily: {},
    gradientColorStops: {},
    ringColor: {},
    ringWidth: {},
    extend: {
      width: {
        screen: scaleVar(375, 'x'),
      },
      height: {
        screen: scaleVar(812, 'y'),
      },
      spacingX: {
        edge: scaleVar(20),
      },
      spacingY: {
        edge: scaleVar(20),
      },
      fontSize: {
        '2xs': scaleVar(10),
        '1.5xl': scaleVar(22),
        '2.5xl': scaleVar(28),
        '3.5xl': scaleVar(32),
      },
      borderRadius: {
        none: scaleVar(0),
        sm: scaleVar(2),
        md: scaleVar(6),
        lg: scaleVar(8),
        '0.5xl': scaleVar(10),
        xl: scaleVar(12),
        '2xl': scaleVar(16),
        '2.5xl': scaleVar(20),
        '3xl': scaleVar(24),
        '4xl': scaleVar(28),
        '4.5xl': scaleVar(30),
        '5xl': scaleVar(32),
        full: scaleVar(9999),
      },
      colors,
    },
  },
} satisfies Config;
