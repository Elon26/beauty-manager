import { useModals } from '@/hooks/use-modals';
import { scaleX, scaleY } from '@kirz/nativewind-scale';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useEffect, type PropsWithChildren } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { KeyboardController } from 'react-native-keyboard-controller';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { twMerge } from 'tailwind-merge';

type ModalWrapperProps = PropsWithChildren<{
  backgroundImage?: string;
  className?: string;
}>;

export function ModalWrapper({ children, backgroundImage, className }: ModalWrapperProps) {
  const { width, height } = useWindowDimensions();
  const modal = useModals();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    KeyboardController.dismiss();
  }, []);

  return (
    <View style={{ width, height }}>
      <BlurView tint="dark" intensity={5} className="absolute inset-0" />
      <Pressable onPress={() => modal.closeAllModals()} className="absolute inset-0" />
      <Animated.View
        className={twMerge(
          'absolute inset-x-4 px-2.5 rounded-4.5xl bg-background pt-44 pb-4 overflow-hidden',
          className
        )}
        style={{
          bottom: insets.bottom + scaleY(32),
          shadowColor: 'black',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.2,
          shadowRadius: scaleX(32),
        }}
        entering={FadeInDown.springify()}
      >
        {backgroundImage && (
          <Image
            source={backgroundImage}
            className="absolute inset-x-0 top-0 aspect-[1/2]"
            contentFit="contain"
            contentPosition="top center"
          />
        )}
        {children}
      </Animated.View>
    </View>
  );
}
