import { getNetworkInfo } from '@kirz/react-native-device-info';
import { View } from 'react-native';

import { useStorageValue } from '@/hooks/use-storage';
import { UiText } from '@/ui/ui-text';
import { usePromise } from '@/utils/use-promise';

export default function ConnectionInfoArea() {
  const nwInfo = usePromise(getNetworkInfo());
  const savedDownloadSpeed = useStorageValue('savedDownloadSpeed');
  const savedUploadSpeed = useStorageValue('savedUploadSpeed');

  return (
    <View className="rounded-2xl bg-grayLight p-5">
      <View className="flex-row items-center justify-between border-b border-gray p-3">
        <UiText className="font-semibold">
          {t('pages.system-info.connection')}
        </UiText>
        <UiText className="text-sm font-medium text-gray">
          {t(
            nwInfo?.connectedToWiFi
              ? 'pages.system-info.wi-fi'
              : 'pages.system-info.mobile'
          )}
        </UiText>
      </View>
      <View className="flex-row items-center justify-between border-b border-gray p-3">
        <UiText className="font-semibold">{t('pages.system-info.ip')}</UiText>
        <UiText className="text-sm font-medium text-gray">
          {nwInfo?.wiFiIPAddress}
        </UiText>
      </View>
      <View className="flex-row items-center justify-between border-b border-gray p-3">
        <UiText className="font-semibold">
          {t('pages.system-info.upload-speed-test')}
        </UiText>
        <UiText className="text-sm font-medium" style={{ color: '#EC8BFF' }}>
          {savedUploadSpeed || '--'} {t('pages.speed-test.mbs')}
        </UiText>
      </View>
      <View className="flex-row items-center justify-between p-3">
        <UiText className="font-semibold">
          {t('pages.system-info.download-speed-test')}
        </UiText>
        <UiText className="text-sm font-medium text-primary">
          {savedDownloadSpeed || '--'} {t('pages.speed-test.mbs')}
        </UiText>
      </View>
    </View>
  );
}
