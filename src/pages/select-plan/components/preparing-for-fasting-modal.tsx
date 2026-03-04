import { scaleX } from '@kirz/nativewind-scale';
import { BlurView } from 'expo-blur';
import { useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';

import { useModals } from '@/hooks/use-modals';
import { useSetStorage } from '@/hooks/use-storage';
import { Checkbox } from '@/ui/checkbox';
import { UiButton } from '@/ui/ui-button';
import { UiText } from '@/ui/ui-text';

export function PreparingForFastingModal() {
  const { closeModal } = useModals();
  const setIsPreparingForFastingModalNeedToShow = useSetStorage(
    'isPreparingForFastingModalNeedToShow'
  );
  const [isDontShowAgain, setIsDontShowAgain] = useState(true);
  const { width, height } = useWindowDimensions();
  const points = [
    t('pages.select-plan.preparing-for-fasting-text-first'),
    t('pages.select-plan.preparing-for-fasting-text-second'),
    t('pages.select-plan.preparing-for-fasting-text-third'),
    t('pages.select-plan.preparing-for-fasting-text-fours'),
  ];

  function handleContinue() {
    if (isDontShowAgain) {
      setIsPreparingForFastingModalNeedToShow(false);
    }
    closeModal('PreparingForFastingModal');
  }

  return (
    <View className="items-center justify-center" style={{ width, height }}>
      <BlurView className="absolute inset-0" intensity={40} tint="dark" />
      <View
        className="rounded-3xl bg-white gap-y-4 p-5"
        style={{ width: width - scaleX(32) }}
      >
        <UiText className="text-center text-lg font-medium">
          {t('pages.select-plan.preparing-for-fasting-title')}
        </UiText>
        <View className="gap-y-2">
          {points.map((point) => (
            <View key={point} className="flex-row items-center gap-x-2.5">
              <View className="rounded-full bg-primary size-2" />
              <UiText className="text-sm text-grayDark">{point}</UiText>
            </View>
          ))}
        </View>
        <Pressable
          className="flex-row items-center justify-center gap-x-2"
          onPress={() => setIsDontShowAgain((prev) => !prev)}
        >
          <UiText className="text-xs text-grayDark">
            {t('basic.dont-show-again')}
          </UiText>
          <Checkbox
            checked={isDontShowAgain}
            onChange={() => setIsDontShowAgain((prev) => !prev)}
            className="size-4"
          />
        </Pressable>
        <View className="items-center">
          <UiButton onPress={handleContinue}>{t('basic.continue')}</UiButton>
        </View>
      </View>
    </View>
  );
}
