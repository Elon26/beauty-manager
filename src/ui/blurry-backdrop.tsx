import { BlurView } from 'expo-blur';
import type { PropsWithChildren } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type BlurryBackdropProps = PropsWithChildren;

export function BlurryBackdrop({ children }: BlurryBackdropProps) {
  const { width, height } = useWindowDimensions();
  return (
    <View className="justify-center items-center" style={{ width, height }}>
      <Animated.View entering={FadeIn.duration(500)} exiting={FadeOut} className="absolute inset-0">
        <BlurView intensity={10} tint="dark" className="absolute inset-0" />
      </Animated.View>
      {children}
    </View>
  );
}
