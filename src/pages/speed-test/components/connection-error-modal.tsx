import { scaleX } from '@kirz/nativewind-scale';
import { BlurView } from 'expo-blur';
import { useWindowDimensions, View } from 'react-native';
import type { ModalComponentProp } from 'react-native-modalfy';

import type { ModalStackParams } from '@/components/modals';
import { Pressable } from '@/ui/pressable';
import { UiButton } from '@/ui/ui-button';
import { UiText } from '@/ui/ui-text';

export function ConnectionErrorModal({
  modal: { params },
}: ModalComponentProp<ModalStackParams, object, 'ConnectionErrorModal'>) {
  const { width, height } = useWindowDimensions();
  const retry = () => params?.resolve('retry');
  const back = () => params?.resolve('back');

  return (
    <View className="items-center justify-center" style={{ width, height }}>
      <BlurView className="absolute inset-0" tint="light" intensity={60} />
      <View
        className="rounded-3xl bg-white px-5 py-8"
        style={{ width: width - scaleX(32) }}
      >
        <View>
          <UiText className="text-center text-xl font-medium">
            {t('pages.speed-test.no-connection-title')}
          </UiText>
        </View>
        <View className="items-center justify-center mb-4 mt-3">
          <UiText className="text-center text-sm text-gray w-44">
            {t('pages.speed-test.no-connection-text')}
          </UiText>
        </View>
        <View className="gap-y-2">
          <UiButton className="w-full" onPress={retry}>
            <UiText className="text-white">
              {t('pages.speed-test.try-again')}
            </UiText>
          </UiButton>
          <Pressable
            className="items-center justify-center rounded-3xl bg-gray h-12 w-full"
            onPress={back}
          >
            <UiText>{t('basic.back')}</UiText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
