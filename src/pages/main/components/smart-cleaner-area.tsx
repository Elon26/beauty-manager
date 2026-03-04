import { scaleY } from '@kirz/nativewind-scale';
import { prettyBytes, useStorageUsage } from '@kirz/react-native-device-info';
import { router } from 'expo-router';
import { View } from 'react-native';

import { useHasPremiumWithBackdoor } from '@/hooks/use-developer-purchases';
import BrushIcon from '@/svg/brush.svg';
import { UiButton } from '@/ui/ui-button';
import { UiText } from '@/ui/ui-text';

import CircularProgress from './circular-progress';

export default function SmartCleanerArea() {
  const hasPremium = useHasPremiumWithBackdoor();
  const { used, total } = useStorageUsage();
  const [sizeNumber, sizeOrder] = prettyBytes(used).split(' ');
  const usedPercent = hasPremium ? Math.round((used / total) * 100) : null;

  return (
    <View className="rounded-2xl bg-grayLight gap-y-2 p-4">
      <View className="flex-row items-center gap-x-3">
        <View>
          <CircularProgress
            percentage={usedPercent}
            size={scaleY(100)}
            strokeWidth={scaleY(10)}
          />
        </View>
        <View className="gap-y-2">
          <UiText className="text-xl font-semibold">
            {t('pages.main.smart-cleaning')}
          </UiText>
          <UiText className="text-xs">
            {t('pages.main.your-system-is-loaded')}
          </UiText>
          <View className="flex-row items-end gap-x-1">
            <UiText className="text-lg font-semibold">
              {hasPremium ? sizeNumber : '--'}
            </UiText>
            <UiText className="bottom-[1] text-sm text-grayDark">
              {hasPremium ? sizeOrder : 'GB'}
            </UiText>
          </View>
        </View>
      </View>
      <UiButton
        className="flex-row gap-x-2.5 w-full"
        onPress={() => {
          router.navigate('/smart-cleaner');
        }}
      >
        <BrushIcon />
        <UiText className="font-medium text-white">
          {t('pages.main.smart-clean-up')}
        </UiText>
      </UiButton>
    </View>
  );
}
