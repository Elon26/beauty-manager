import {
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetModal,
} from '@gorhom/bottom-sheet';
import { scaleX } from '@kirz/nativewind-scale';
import { BlurView } from 'expo-blur';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ButtonPrimary } from '@/ui/button-primary';
import { UiText } from '@/ui/ui-text';
import { Deferred } from '@/utils/deferred';

type UseSheetPromptOptions<T> = {
  title?: string;
  description?: string;
  actions: {
    label: string;
    value: T;
  }[];
  cancelLabel?: string;
};

export function useSheetPrompt<T extends string | boolean>({
  title,
  description,
  actions,
  cancelLabel = 'Cancel',
}: UseSheetPromptOptions<T>) {
  const [sheetIsOpen, setSheetIsOpen] = useState(false);
  const [deferred, setDeferred] = useState<Deferred<T> | null>(null);
  const prompt = useCallback(() => {
    const d = new Deferred<T>();
    setDeferred(d);
    setSheetIsOpen(true);
    return d.promise;
  }, []);

  return {
    prompt,
    SheetPromptComponent: () => (
      <SheetPrompt
        actions={actions}
        cancelLabel={cancelLabel}
        deferred={deferred}
        description={description}
        isOpened={sheetIsOpen}
        setIsOpened={setSheetIsOpen}
        title={title}
      />
    ),
  };
}

type SheetPromptProps<T> = {
  isOpened: boolean;
  setIsOpened: (isOpened: boolean) => void;
  title?: string;
  description?: string;
  actions: {
    label: string;
    value: T;
  }[];
  deferred: Deferred<T> | null;
  cancelLabel?: string;
};

function SheetPrompt<T extends string | boolean>({
  isOpened,
  setIsOpened,
  title,
  description,
  actions,
  deferred,
  cancelLabel = 'Cancel',
}: SheetPromptProps<T>) {
  const bottomSheetModalRef = useRef<BottomSheetModal | null>(null);
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (isOpened) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isOpened]);
  return (
    <BottomSheetModal
      backdropComponent={BDComponent}
      backgroundComponent={() => (
        <View
          className="absolute rounded-t-4.5xl bg-white inset-0"
          style={{
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: -6 },
            shadowOpacity: 0.07,
            shadowRadius: 12,
          }}
        />
      )}
      handleIndicatorStyle={{ backgroundColor: '#D8D8D8', width: scaleX(60) }}
      index={0}
      onDismiss={() => {
        setIsOpened(false);
        deferred?.reject('Sheet dismissed without selection');
      }}
      ref={bottomSheetModalRef}
    >
      <BottomSheetView
        className="gap-5 px-edge"
        style={{ paddingBottom: insets.bottom + 10 }}
      >
        <View className="gap-2">
          {title && (
            <UiText className="text-center text-xl font-semibold">
              {title}
            </UiText>
          )}
          {description && (
            <UiText className="text-center text-lg font-medium text-black pt-2">
              {description}
            </UiText>
          )}
        </View>
        <View className="gap-2.5 px-edge">
          {actions.map((action) => (
            <ButtonPrimary
              key={action.value.toString()}
              label={action.label}
              labelClassName="text-white font-medium"
              onPress={() => {
                deferred?.resolve(action.value);
                setIsOpened(false);
              }}
            />
          ))}
          <ButtonPrimary
            className="bg-transparent"
            label={cancelLabel}
            labelClassName="text-white font-medium"
            onPress={() => {
              setIsOpened(false);
              deferred?.reject('User cancelled the prompt');
            }}
          />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function BDComponent(props: BottomSheetBackdropProps) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(props.animatedIndex.value, [-1, 0], [0, 1]),
  }));
  const { dismiss } = useBottomSheetModal();
  return (
    <AnimatedPressable
      className="absolute inset-0"
      onPress={() => dismiss()}
      style={style}
    >
      <BlurView className="absolute inset-0" intensity={5} tint="dark" />
    </AnimatedPressable>
  );
}
