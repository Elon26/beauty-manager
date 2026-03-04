import { scaleX, scaleY } from '@kirz/nativewind-scale';
import { BlurView } from 'expo-blur';
import { View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { Pressable } from './pressable';
import { UiText } from './ui-text';

type BottomFloatProps = {
  title: string;
  handler: () => void;
};

export function BottomFloat({ title, handler }: BottomFloatProps) {
  return (
    <Animated.View
      className="absolute rounded-3xl bg-primary gap-4 left-edge right-edge p-4.5"
      style={{
        bottom: scaleY(50),
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: scaleX(32),
      }}
      entering={ZoomIn.duration(200)}
    >
      <View className="absolute overflow-hidden rounded-2xl inset-0">
        <BlurView tint="light" intensity={25} className="flex-1" />
      </View>
      <Pressable className="flex-row items-center gap-2.5" onPress={handler}>
        <UiText
          className="text-center font-semibold text-white w-full"
          numberOfLines={1}
        >
          {title}
        </UiText>
      </Pressable>
    </Animated.View>
  );
}
