import { scaleX, scaleY } from '@kirz/nativewind-scale';
import type { ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { useConfig } from '@/hooks/use-config';

const DOT_ACTIVE_COLOR = '#229DFB';
const DOT_NO_ACTIVE_COLOR = '#F8F8F8';
const DOT_HEIGHT = scaleY(4);

type AnimatedDotProps = {
  index: number;
  animatedValue: SharedValue<number>;
};

export function AnimatedDot({ index, animatedValue }: AnimatedDotProps) {
  const { onboarding_id } = useConfig();
  const dotWidth = onboarding_id === 'a' ? scaleX(103) : scaleX(73);

  const animatedStyle = useAnimatedStyle<ViewStyle>(() => {
    const backgroundColor = interpolateColor(
      animatedValue.value,
      [index - 0.5, index],
      [DOT_NO_ACTIVE_COLOR, DOT_ACTIVE_COLOR]
    );

    return {
      backgroundColor,

      width: interpolate(
        animatedValue.value,
        [index - 1, index, index + 1],
        [dotWidth, dotWidth, dotWidth],
        'clamp'
      ),
      height: DOT_HEIGHT,
      borderRadius: 15,
      marginHorizontal: 5,
    };
  }, [animatedValue]);

  return <Animated.View style={[animatedStyle]} className="mx-1" />;
}
