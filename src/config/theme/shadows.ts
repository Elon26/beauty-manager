import type { StyleProp, ViewStyle } from 'react-native';

export const shadows: Record<string, StyleProp<ViewStyle>> = {
  sm: {
    shadowColor: '#C3C3C3',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 0,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
} as const;
