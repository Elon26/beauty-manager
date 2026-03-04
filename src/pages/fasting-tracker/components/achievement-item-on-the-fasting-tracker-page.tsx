import { scaleX } from '@kirz/nativewind-scale';
import { Image } from 'expo-image';
import { View } from 'react-native';

import { UiText } from '@/ui/ui-text';

import AchievementProgressBar from './achievement-progress-bar';

type Props = {
  days: number;
  name: string;
  icon: string;
  currentDaysInARow: number;
  isAchieved: boolean;
};

export default function AchievementItemOnTheFastingTrackerPage({
  days,
  name,
  icon,
  currentDaysInARow,
  isAchieved,
}: Props) {
  return (
    <View className="flex-row items-center gap-x-2">
      <View className="overflow-hidden rounded-3xl size-20">
        <Image
          source={icon}
          style={{ width: scaleX(80), height: scaleX(80) }}
        />
      </View>
      <View className="flex-1 gap-y-3">
        <View className="gap-y-0.5">
          <View className="">
            <UiText className="text-sm font-medium">{name}</UiText>
          </View>
          <UiText className="text-xs text-grayDark">
            {t('pages.achievements.days-is-a-row', { count: days })}
          </UiText>
        </View>
        <AchievementProgressBar
          currentDaysInARow={currentDaysInARow}
          days={days}
          isAchieved={isAchieved}
        />
      </View>
    </View>
  );
}
