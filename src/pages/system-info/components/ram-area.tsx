import { prettyBytes, useMemoryUsage } from '@kirz/react-native-device-info';
import { View } from 'react-native';

import { UiText } from '@/ui/ui-text';

import ProgressBar from './progress-bar';

export default function RamArea() {
  const { free, total } = useMemoryUsage();

  return (
    <View className="rounded-2xl bg-grayLight gap-y-3 p-5">
      <UiText className="text-sm font-semibold">
        {t('pages.system-info.ram')}
      </UiText>
      <View className="flex-row items-center justify-between px-2">
        <View className="flex-row items-center gap-x-4">
          <View className="gap-y-1">
            <UiText className="text-sm text-grayDark">
              {t('pages.system-info.free-ram')}
            </UiText>
            <UiText className="font-medium">{prettyBytes(free)}</UiText>
          </View>
          <View className="w-[1px] bg-gray h-8" />
          <View className="gap-y-1">
            <UiText className="text-sm text-grayDark">
              {t('pages.system-info.total-ram')}
            </UiText>
            <UiText className="font-medium">{prettyBytes(total)}</UiText>
          </View>
        </View>
      </View>
      <ProgressBar
        progress={Math.round((free / total) * 100) || 1}
        color="pink"
      />
    </View>
  );
}
