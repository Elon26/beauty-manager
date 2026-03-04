import { View } from 'react-native';

import { UiText } from '@/ui/ui-text';

type Props = {
  hasConnection: boolean;
  ipAddress: string;
};

export default function InfoArea({ hasConnection, ipAddress }: Props) {
  return (
    <View className="rounded-2xl bg-grayLight gap-y-6 p-4">
      <View className="flex-row justify-between">
        <UiText>{t('pages.speed-test.connection-type')}</UiText>
        <UiText>
          {t(
            hasConnection
              ? 'pages.system-info.wi-fi'
              : 'pages.system-info.mobile'
          )}
        </UiText>
      </View>
      <View className="flex-row justify-between">
        <UiText>{t('pages.speed-test.ip-address')}</UiText>
        <UiText>{ipAddress}</UiText>
      </View>
    </View>
  );
}
