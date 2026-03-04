import { View } from 'react-native';

export function InnerShadow({
  color = 'rgba(0, 0, 0, 0.3)',
  // radius = 16,
  offset = { width: 0, height: 0 },
  // opacity = 0.3,
}: {
  color?: string;
  radius?: number;
  offset?: { width: number; height: number };
  opacity?: number;
}) {
  return (
    <View
      style={{
        shadowColor: color,
        shadowOffset: offset,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        borderTopWidth: 16,
        borderRightWidth: 16,
        borderColor: '#000',
        position: 'absolute',
        top: -16,
        left: 0,
        right: -16,
        bottom: 0,
      }}
    />
  );
}
