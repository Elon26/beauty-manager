import { Env } from '@kirz/expo-env';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useHasPremiumWithBackdoor } from '@/hooks/use-developer-purchases';
import SettingsIcon from '@/svg/settings.svg';
import ShineIcon from '@/svg/shine.svg';

import { Pressable } from './pressable';
import { UiText } from './ui-text';

export function MainPageHeader() {
  const { t } = useTranslation('translation');
  const hasPremium = useHasPremiumWithBackdoor();

  return (
    <View className="flex-row items-center justify-between py-4">
      {hasPremium ? (
        <View className="flex-row items-center rounded-2xl bg-primary/10 gap-x-0.5 p-2">
          <ShineIcon />
          <UiText className="font-semibold capitalize color-primary">
            {t('basic.pro')}
          </UiText>
        </View>
      ) : (
        <View className="w-10" />
      )}
      <UiText className="text-xl font-semibold">{Env.APP_NAME}</UiText>
      <Pressable
        className="items-center justify-center rounded-xl bg-white size-10"
        style={{
          shadowOffset: {
            width: 1,
            height: 1,
          },
          shadowOpacity: 0.1,
        }}
        onPress={() => router.navigate('/settings')}
      >
        <SettingsIcon />
      </Pressable>
    </View>
  );
}
