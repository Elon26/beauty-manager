import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStorageValue } from '@/hooks/use-storage';
import AchievementItem from '@/types/achievement-item';
import { Page } from '@/ui/page';
import { PageHeader } from '@/ui/page-header';
import { UiText } from '@/ui/ui-text';

import AchievementItemOnTheAchievementPage from './components/achievement-item-on-the-achievement-page';
import achievementsDatabase from './constants/achievements-database';

export default function AchievementsPage() {
  const insets = useSafeAreaInsets();
  const maxDaysInARow = useStorageValue('maxDaysInARow');

  const achievedAchievements: AchievementItem[] = [];
  const unachievedAchievements: AchievementItem[] = [];

  achievementsDatabase.forEach((item) => {
    if (maxDaysInARow >= item.days) {
      achievedAchievements.push(item);
    } else {
      unachievedAchievements.push(item);
    }
  });

  return (
    <Page>
      <PageHeader pageName={t('pages.achievements.page-name')} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom,
        }}
      >
        <View className="gap-y-4">
          {achievedAchievements.length > 0 && (
            <View className="rounded-2xl bg-grayLight gap-y-2 p-4">
              <UiText className="text-lg font-medium">
                {t('pages.achievements.achieved')}
              </UiText>
              <View className="flex-row flex-wrap justify-center gap-x-5 gap-y-2">
                {achievedAchievements.map((item) => (
                  <AchievementItemOnTheAchievementPage
                    key={item.name}
                    name={item.name}
                    days={item.days}
                    icon={item.fillIcon}
                  />
                ))}
              </View>
            </View>
          )}

          {unachievedAchievements.length > 0 && (
            <View className="rounded-2xl bg-grayLight gap-y-2 p-4">
              <UiText className="text-lg font-medium">
                {t('pages.achievements.in-progress')}
              </UiText>
              <View className="flex-row flex-wrap justify-center gap-x-5 gap-y-2">
                {unachievedAchievements.map((item) => (
                  <AchievementItemOnTheAchievementPage
                    key={item.name}
                    name={item.name}
                    days={item.days}
                    icon={item.unfillIcon}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </Page>
  );
}
