import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useHasPremiumWithBackdoor } from '@/hooks/use-developer-purchases';
import { Page } from '@/ui/page';
import { PageHeader } from '@/ui/page-header';

import ActivityEmptyArea from './components/activity-empty-area';
import ActivityFillArea from './components/activity-fiil-area';
import CalendarArea from './components/calendar-area';
import PhotosArea from './components/photos-area';

export default function DiaryPage() {
  const hasPremium = useHasPremiumWithBackdoor();

  const today = new Date();
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0
  );
  const [selectedDate, setSelectedDate] = useState(todayDate);

  return (
    <Page noSafeArea fullWidth>
      <View className="px-edge">
        <PageHeader pageName={t('pages.diary.page-name')} />
      </View>
      <View className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="gap-y-7">
            <View className="gap-y-3 px-edge">
              <CalendarArea
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
              {hasPremium ? <ActivityFillArea /> : <ActivityEmptyArea />}
            </View>
            <PhotosArea selectedDate={selectedDate} />
          </View>
        </ScrollView>
      </View>
    </Page>
  );
}
