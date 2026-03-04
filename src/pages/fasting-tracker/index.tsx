import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { registerForPushNotificationsAsync } from '@/hooks/use-notifications';
import { useStorage } from '@/hooks/use-storage';
import { Page } from '@/ui/page';
import { PageHeader } from '@/ui/page-header';

import AchievementsArea from './components/achievements-area';
import { FastingTrackerAnagram } from './components/fasting-tracker-anagram';
import TimerArea from './components/timer-area';

export default function FastingTrackerPage() {
  const insets = useSafeAreaInsets();
  const [hasNotificationPermission, setHasNotificationPermission] = useStorage(
    'hasNotificationPermission'
  );

  useEffect(() => {
    if (!hasNotificationPermission) {
      setHasNotificationPermission(true);
      registerForPushNotificationsAsync();
    }
  }, []);

  return (
    <Page fullWidth>
      <View className="px-edge">
        <PageHeader pageName={t('pages.fasting-tracker.page-name')} goHome>
          <FastingTrackerAnagram />
        </PageHeader>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom,
        }}
      >
        <View className="gap-y-4">
          <TimerArea />
          <View className="px-edge">
            <AchievementsArea />
          </View>
        </View>
      </ScrollView>
    </Page>
  );
}
