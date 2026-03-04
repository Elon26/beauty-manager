import { scaleX } from '@kirz/nativewind-scale';
import { BlurView } from 'expo-blur';
import { useEffect } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import type { ModalComponentProp } from 'react-native-modalfy';

import { ModalStackParams } from '@/components/modals';
import { useStorage } from '@/hooks/use-storage';
import { UiText } from '@/ui/ui-text';

export function ProtectSecretFolderModal({
  modal: { params },
}: ModalComponentProp<ModalStackParams, object, 'ProtectSecretFolderModal'>) {
  const handleAdd = () => params?.handleAdd();
  const close = () => params?.close();
  const { width, height } = useWindowDimensions();
  const [
    isProtectSecretFolderModalNeedToShow,
    setIsProtectSecretFolderModalNeedToShow,
  ] = useStorage('isProtectSecretFolderModalNeedToShow');

  useEffect(() => {
    if (isProtectSecretFolderModalNeedToShow)
      setIsProtectSecretFolderModalNeedToShow(false);
  }, []);

  return (
    <View className="items-center justify-center" style={{ width, height }}>
      <BlurView className="absolute inset-0" intensity={40} tint="dark" />
      <View
        className="rounded-3xl bg-white pt-4"
        style={{ width: width - scaleX(28) }}
      >
        <View className="mb-3">
          <UiText className="text-center text-xl font-semibold">
            {t('pages.pin-code.protect-secret-folder-title')}
          </UiText>
        </View>
        <View className="px-4 mb-5">
          <UiText className="text-center text-gray">
            {t('pages.pin-code.protect-secret-folder-text')}
          </UiText>
        </View>
        <View className="flex-row border-t border-gray">
          <Pressable
            className="flex-1 items-center justify-center border-r border-gray py-4"
            onPress={close}
          >
            <UiText className="text-lg font-semibold">
              {t('pages.pin-code.later')}
            </UiText>
          </Pressable>
          <Pressable
            className="flex-1 items-center justify-center py-4"
            onPress={handleAdd}
          >
            <UiText className="text-lg font-semibold text-primary">
              {t('pages.pin-code.add-protection')}
            </UiText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
