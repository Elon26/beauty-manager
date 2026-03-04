import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function SkeletonGrid({
  tileSize,
  gap,
  count,
}: {
  tileSize: number;
  gap: number;
  count: number;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonTile
          key={i}
          size={tileSize}
          gap={gap}
          isLastInRow={(i + 1) % 3 === 0}
        />
      ))}
    </View>
  );
}

function SkeletonTile({
  size,
  gap,
  isLastInRow,
}: {
  size: number;
  gap: number;
  isLastInRow: boolean;
}) {
  const x = useSharedValue(-size);

  useEffect(() => {
    x.value = withRepeat(
      withTiming(size * 1.6, {
        duration: 1100,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false
    );
  }, [size, x]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 11,
        backgroundColor: '#EEF0F3',
        marginRight: isLastInRow ? 0 : gap,
        marginBottom: gap,
        overflow: 'hidden',
      }}
    >
      <AnimatedLinearGradient
        colors={[
          'rgba(255,255,255,0)',
          'rgba(255,255,255,0.55)',
          'rgba(255,255,255,0)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: size * 1.2,
          },
          shimmerStyle,
        ]}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.02)', 'rgba(0,0,0,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      />
    </View>
  );
}
