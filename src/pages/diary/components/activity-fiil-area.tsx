import { Pedometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { UiText } from '@/ui/ui-text';

export default function ActivityFillArea() {
  const [isChecking, setIsChecking] = useState(false);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [pastStepCount, setPastStepCount] = useState(0);

  useEffect(() => {
    setIsChecking(true);
    Pedometer.isAvailableAsync().then(
      () => setIsPedometerAvailable(true),
      () => setIsPedometerAvailable(false)
    );
    setIsChecking(false);

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 1);

    Pedometer.getStepCountAsync(start, end).then(
      (result) => setPastStepCount(result.steps),
      (error) => console.log('Could not get step count: ' + error)
    );
  }, []);

  return (
    <View className="rounded-2xl bg-grayLight gap-y-1 p-4">
      <View className="flex-row items-center justify-between">
        <UiText>{t('pages.diary.activity')}</UiText>
        <View className="items-center justify-center rounded-full bg-primary h-7 w-16">
          {isChecking ? (
            <ActivityIndicator />
          ) : (
            <UiText className="text-xs text-white">
              {pastStepCount} {t('pages.diary.steps')}
            </UiText>
          )}
        </View>
      </View>
      {isPedometerAvailable ? (
        <UiText numberOfLines={1} className="text-xs text-grayDark">
          {pastStepCount < 6000
            ? t('pages.diary.activity-bad')
            : t('pages.diary.activity-good')}
        </UiText>
      ) : (
        <UiText className="text-xs text-grayDark">
          {t('pages.diary.pedometer-unavailable')}
        </UiText>
      )}
    </View>
  );
}
