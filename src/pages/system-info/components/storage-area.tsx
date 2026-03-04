import { prettyBytes, useStorageUsage } from '@kirz/react-native-device-info';
import { View } from 'react-native';

import CircularProgress from '@/pages/main/components/circular-progress';
import { UiText } from '@/ui/ui-text';

export default function StorageArea() {
  const { free, total } = useStorageUsage();

  return (
    <View className="rounded-2xl bg-grayLight gap-y-3 p-5">
      <UiText className="text-sm font-semibold">
        {t('pages.system-info.storage')}
      </UiText>
      <View className="flex-row items-center justify-between px-2">
        <View className="flex-row items-center gap-x-4">
          <View className="gap-y-1">
            <UiText className="text-sm text-grayDark">
              {t('pages.system-info.free-storage')}
            </UiText>
            <UiText className="font-medium">{prettyBytes(free)}</UiText>
          </View>
          <View className="w-[1px] bg-gray h-8" />
          <View className="gap-y-1">
            <UiText className="text-sm text-grayDark">
              {t('pages.system-info.total-storage')}
            </UiText>
            <UiText className="font-medium">{prettyBytes(total)}</UiText>
          </View>
          <View>
            <CircularProgress
              size={76}
              strokeWidth={10}
              percentage={Math.round((free / total) * 100)}
              textColor="#8BCEFF"
            />
          </View>
        </View>
      </View>
    </View>
  );
}
