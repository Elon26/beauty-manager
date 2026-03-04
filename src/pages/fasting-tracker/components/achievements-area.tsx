import { scaleX } from '@kirz/nativewind-scale';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { colors } from '@/config/theme';
import { useStorageValue } from '@/hooks/use-storage';
import achievementsDatabase from '@/pages/achievements/constants/achievements-database';
import { SfSymbol } from '@/ui/sf-symbol';
import { UiText } from '@/ui/ui-text';

import AchievementItemOnTheFastingTrackerPage from './achievement-item-on-the-fasting-tracker-page';

export default function AchievementsArea() {
  const maxDaysInARow = useStorageValue('maxDaysInARow');
  const currentDaysInARow = useStorageValue('currentDaysInARow');
  const [achievementsToShow, setAchievementsToShow] = useState(
    achievementsDatabase.slice(0, 3)
  );

  function calcStartIndex() {
    if (maxDaysInARow < achievementsDatabase[2].days) return 0;
    if (
      maxDaysInARow >=
      achievementsDatabase[achievementsDatabase.length - 2].days
    )
      return achievementsDatabase.length - 3;

    return (
      achievementsDatabase.findIndex((item) => maxDaysInARow < item.days) - 2
    );
  }

  useEffect(() => {
    const startIndex = calcStartIndex();
    setAchievementsToShow(
      achievementsDatabase.slice(startIndex, startIndex + 3)
    );
  }, [maxDaysInARow]);

  return (
    <Pressable
      className="rounded-3xl bg-grayLight gap-y-4 p-4"
      onPress={() => router.navigate('/achievements')}
    >
      <View className="flex-row items-center justify-between">
        <UiText>{t('pages.achievements.page-name')}</UiText>
        <SfSymbol
          name="chevron.right"
          size={scaleX(16)}
          weight="medium"
          tintColor={colors.grayDark.toString()}
        />
      </View>
      <View className="gap-y-2">
        {achievementsToShow.map((item) => {
          const isAchieved = maxDaysInARow >= item.days;
          return (
            <AchievementItemOnTheFastingTrackerPage
              key={item.name}
              name={item.name}
              days={item.days}
              icon={isAchieved ? item.fillIcon : item.unfillIcon}
              isAchieved={isAchieved}
              currentDaysInARow={currentDaysInARow}
            />
          );
        })}
      </View>
    </Pressable>
  );
}
