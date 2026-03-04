import {
  type BottomSheetBackdropProps,
  BottomSheetModal,
  type BottomSheetModalProps,
  useBottomSheetModal,
} from '@gorhom/bottom-sheet';
import { scaleX, scaleY } from '@kirz/nativewind-scale';
import { BlurView } from 'expo-blur';
import { forwardRef, type PropsWithChildren } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

export const SheetModal = forwardRef<BottomSheetModal, PropsWithChildren<BottomSheetModalProps>>(
  function SheetModal({ children, ...props }, ref) {
    return (
      <BottomSheetModal
        ref={ref}
        style={{
          backgroundColor: 'transparent',
        }}
        containerStyle={{
          backgroundColor: 'transparent',
        }}
        backgroundStyle={{
          backgroundColor: 'transparent',
        }}
        snapPoints={[scaleY(660)]}
        maxDynamicContentSize={scaleY(660)}
        handleIndicatorStyle={{
          width: scaleX(64),
          height: scaleY(4),
          backgroundColor: 'white',
          borderRadius: 10,
          opacity: 0.3,
        }}
        backdropComponent={BDComponent}
        backgroundComponent={() => (
          <View className="absolute inset-0 rounded-t-4.5xl overflow-hidden bg-background/90">
            <BlurView intensity={20} className="flex-1" tint="dark" />
          </View>
        )}
        {...props}
      >
        {children}
      </BottomSheetModal>
    );
  }
);

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function BDComponent(props: BottomSheetBackdropProps) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(props.animatedIndex.value, [-1, 0], [0, 1]),
  }));
  const { dismiss } = useBottomSheetModal();
  return (
    <AnimatedPressable style={style} className="absolute inset-0" onPress={() => dismiss()}>
      <BlurView className="absolute inset-0" tint="dark" intensity={5} />
    </AnimatedPressable>
  );
}
