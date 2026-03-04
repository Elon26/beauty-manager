import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'moti';

import { usePaywall } from '@/hooks/use-paywall';
import { Pressable } from '@/ui/pressable';
import { UiText } from '@/ui/ui-text';

export function Banner() {
  const { showPaywall } = usePaywall();

  return (
    <Pressable onPress={() => showPaywall()} className="h-18">
      <View className="absolute overflow-hidden rounded-full h-full w-full">
        <LinearGradient
          colors={['#1E99F9', '#68BDFF', '#096AB9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </View>
      <View className="flex-row items-center justify-between px-4 h-full">
        <UiText className="text-2xl font-semibold text-white">
          {t('pages.settings.upgrade-to-pro')}
        </UiText>
        <UiText className="rounded-full bg-white font-semibold capitalize text-primary px-4 py-1">
          {t('basic.pro')}
        </UiText>
      </View>
    </Pressable>
  );
}
