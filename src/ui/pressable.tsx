import { cssInterop } from 'nativewind';
import React from 'react';
import type { PressableProps as RNPressableProps, View } from 'react-native';
import { Pressable as RNPressable } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

type SpringConfig = Parameters<typeof withSpring>['1'];

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export type PressableProps = RNPressableProps & {
  animation?: 'scale' | 'none';
  className?: string;
  animationPressIn?: SpringConfig;
  animationPressOut?: SpringConfig;
};

export const Pressable = React.forwardRef<View, PressableProps>(
  ({ animation = 'scale', animationPressIn, animationPressOut, ...props }, ref) => {
    const pressAnim = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: pressAnim.value }],
        opacity: interpolate(pressAnim.value, [0.96, 1], [0.75, 1]),
      };
    });

    return (
      <AnimatedPressable
        {...props}
        ref={ref}
        style={[props.style, animatedStyle]}
        {...(animation === 'scale' && {
          onPressIn: (e) => {
            pressAnim.value = withSpring(0.96, animationPressIn ?? { damping: 20, stiffness: 500 });
            props.onPressIn?.(e);
          },
          onPressOut: (e) => {
            pressAnim.value = withSpring(1, animationPressOut ?? { damping: 20, stiffness: 1400 });
            props.onPressOut?.(e);
          },
        })}
      />
    );
  }
);

cssInterop(Pressable, {
  className: {
    target: 'style',
  },
});
