import {
  getDeviceName,
  getModel,
  getSystemVersion,
} from '@kirz/react-native-device-info';
import * as Application from 'expo-application';
import { View } from 'react-native';

import { UiText } from '@/ui/ui-text';
import { usePromise } from '@/utils/use-promise';

export default function DeviceInfoArea() {
  const deviceName = usePromise(getDeviceName());
  const systemVersion = getSystemVersion();
  const model = getModel();
  const device = model.split(' ')[0];
  const appId = Application.getIosIdForVendorAsync();

  return (
    <View className="rounded-2xl bg-grayLight p-5">
      <View className="flex-row items-center justify-between border-b border-gray p-3">
        <UiText className="font-semibold">{t('pages.system-info.name')}</UiText>
        <UiText className="text-sm font-medium text-gray">{deviceName}</UiText>
      </View>
      <View className="flex-row items-center justify-between border-b border-gray p-3">
        <UiText className="font-semibold">
          {t('pages.system-info.version-ios')}
        </UiText>
        <UiText className="text-sm font-medium text-gray">
          {systemVersion}
        </UiText>
      </View>
      <View className="flex-row items-center justify-between border-b border-gray p-3">
        <UiText className="font-semibold">
          {t('pages.system-info.device')}
        </UiText>
        <UiText className="text-sm font-medium text-gray">{device}</UiText>
      </View>
      <View className="flex-row items-center justify-between border-b border-gray p-3">
        <UiText className="font-semibold">
          {t('pages.system-info.model')}
        </UiText>
        <UiText className="text-sm font-medium text-gray">{model}</UiText>
      </View>
      <View className="flex-row items-center justify-between gap-x-6 p-3">
        <UiText className="font-semibold">
          {t('pages.system-info.serial-number')}
        </UiText>
        <UiText
          numberOfLines={1}
          className="flex-1 text-sm font-medium text-gray"
        >
          {appId}
        </UiText>
      </View>
    </View>
  );
}
