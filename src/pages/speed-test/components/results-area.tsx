import { MeasureType } from '@kirz/expo-speedtest/build/types';
import { View } from 'react-native';

import DownloadIcon from '@/svg/download.svg';
import PingIcon from '@/svg/ping.svg';
import UploadIcon from '@/svg/upload.svg';
import { UiText } from '@/ui/ui-text';

type Props = {
  speedtestResults: Record<MeasureType, number | null>;
};

export default function ResultsArea({ speedtestResults }: Props) {
  return (
    <View className="flex-row items-center justify-between rounded-3xl bg-grayLight px-4 py-2">
      <View className="flex-row items-center gap-x-1">
        <View className="items-center justify-center rounded-full bg-white size-10">
          <UploadIcon />
        </View>
        <UiText className="text-sm">
          {speedtestResults.upload ? Math.round(speedtestResults.upload) : '--'}{' '}
          {t('pages.speed-test.mbs')}
        </UiText>
      </View>
      <View className="flex-row items-center gap-x-1">
        <View className="items-center justify-center rounded-full bg-white size-10">
          <DownloadIcon />
        </View>
        <UiText className="text-sm">
          {speedtestResults.download
            ? Math.round(speedtestResults.download)
            : '--'}{' '}
          {t('pages.speed-test.mbs')}
        </UiText>
      </View>
      <View className="flex-row items-center gap-x-1">
        <View className="items-center justify-center rounded-full bg-white size-10">
          <PingIcon />
        </View>
        <UiText className="text-sm">
          {speedtestResults.ping ? Math.round(speedtestResults.ping) : '--'}{' '}
          {t('pages.speed-test.ms')}
        </UiText>
      </View>
    </View>
  );
}
