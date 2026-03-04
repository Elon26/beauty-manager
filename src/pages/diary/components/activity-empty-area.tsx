import { Pressable, View } from 'react-native';

import { usePaywall } from '@/hooks/use-paywall';
import LockIcon from '@/svg/lock-alt.svg';
import { UiText } from '@/ui/ui-text';

export default function ActivityEmptyArea() {
  const { showPaywall } = usePaywall();

  return (
    <Pressable
      className="rounded-2xl bg-grayLight gap-y-1 p-4"
      onPress={() => showPaywall()}
    >
      <View className="flex-row items-center justify-between">
        <UiText>{t('pages.diary.premium-features')}</UiText>
        <View className="items-center justify-center rounded-full bg-primary h-7 w-16">
          <LockIcon />
        </View>
      </View>
      <View>
        <UiText className="text-sm text-grayDark">
          {t('pages.diary.you-using-free-version')}
        </UiText>
        <UiText className="text-sm text-grayDark">
          {t('pages.diary.upgrade-to-premium')}
        </UiText>
      </View>
    </Pressable>
  );
}
