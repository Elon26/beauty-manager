import { useEffect } from 'react';
import { View } from 'react-native';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import RadarAnimation from '@/animations/radar.json';
import { LottieView } from '@/ui/lottie';

const ANIMATION_DURATION = 2000;

export function SearchAnimation() {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(2, {
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.ease),
      }),
      -1,
      false
    );

    opacity.value = withRepeat(
      withTiming(0, {
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.ease),
      }),
      -1,
      false
    );
  }, [opacity, scale]);

  const opacity2 = useSharedValue(0);
  const animatedStyle2 = useAnimatedStyle(() => ({
    opacity: opacity2.value,
  }));
  useEffect(() => {
    opacity2.value = withRepeat(withTiming(1, { duration: ANIMATION_DURATION / 2 }), -1, true);
  }, [opacity2]);

  return (
    <View className="size-72">
      {/* <OuterCircle className="absolute size-full" />
      <Animated.View className="absolute size-full" style={animatedStyle}>
        <InnerCircle className="flex-1" />
      </Animated.View>
      <Animated.View className="absolute size-full" style={animatedStyle2}>
        <Dots className="flex-1" />
      </Animated.View> */}
      <LottieView autoPlay className="h-full w-full" loop source={RadarAnimation} />
    </View>
  );
}
