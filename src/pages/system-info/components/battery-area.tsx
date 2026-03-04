import { usePowerState } from '@kirz/react-native-device-info';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { UiText } from '@/ui/ui-text';
import calcDeviceRemainingTime from '@/utils/calc-device-remaining-time';

import ProgressBar from './progress-bar';

export default function BatteryArea() {
  const { batteryLevel, batteryState } = usePowerState();

  const [currentBatteryLevel, setCurrentBatteryLevel] = useState(1);
  const [currentDeviceRemainingTime, setCurrentDeviceRemainingTime] =
    useState('');

  useEffect(() => {
    const newBatteryLevel =
      batteryState === 'unknown' || !batteryLevel
        ? 0
        : Math.round((batteryLevel ?? 0) * 100);
    setCurrentBatteryLevel(newBatteryLevel);
    setCurrentDeviceRemainingTime(calcDeviceRemainingTime(newBatteryLevel));
  }, [batteryLevel, batteryState]);

  return (
    <View className="rounded-2xl bg-grayLight gap-y-3 p-5">
      <UiText className="text-sm font-semibold">
        {t('pages.system-info.battery')}
      </UiText>
      <View className="flex-row items-center justify-between px-2">
        <View className="flex-row items-center gap-x-4">
          <UiText className="text-sm font-medium text-grayDark">
            {t('pages.system-info.remaining')}: {currentDeviceRemainingTime}
          </UiText>
          <UiText className="font-medium">{currentBatteryLevel}%</UiText>
        </View>
      </View>
      <ProgressBar progress={currentBatteryLevel} color="#92C380" />
    </View>
  );
}
