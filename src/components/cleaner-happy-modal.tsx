import { useAnalytics } from '@kirz/expo-toolkit';
import { scaleX, scaleY } from '@kirz/nativewind-scale';
import { Image } from 'expo-image';
import { View } from 'moti';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';
import type { ModalComponentProp } from 'react-native-modalfy';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HappyImage from '@/images/contacts-cleaner/success.png';
import { ButtonPrimary } from '@/ui/button-primary';
import { UiText } from '@/ui/ui-text';

import type { ModalStackParams } from './modals';

type CleanerHappyModalProps = ModalComponentProp<
  ModalStackParams,
  void,
  'CleanerHappyModal'
>;

export function CleanerHappyModal({ modal }: CleanerHappyModalProps) {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { logEvent } = useAnalytics();

  useEffect(() => {
    logEvent('great_work');
  }, [logEvent]);

  return (
    <View
      className="bg-white px-4"
      style={{ width, height, paddingBottom: insets.bottom + scaleY(10) }}
    >
      <View className="flex-1 items-center justify-center gap-8">
        <Image
          source={HappyImage}
          style={{ width: scaleX(350), height: scaleX(350) }}
        />

        <View>
          <UiText className="text-center text-3xl font-semibold">
            {t('cleaner.happy-modal.title')}
          </UiText>

          <UiText className="text-center text-lg font-semibold pt-4">
            {t('cleaner.happy-modal.subtitle')}
          </UiText>
        </View>

        <View className="items-center">{modal.params?.children}</View>
      </View>

      <ButtonPrimary onPress={() => modal.closeModal('CleanerHappyModal')}>
        <UiText className="text-center font-semibold text-white">
          {t('basic.continue')}
        </UiText>
      </ButtonPrimary>
    </View>
  );
}
