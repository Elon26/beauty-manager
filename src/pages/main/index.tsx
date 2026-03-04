import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotificationProvider } from '@/hooks/use-notifications';
import { Page } from '@/ui/page';

import FastingTrackerArea from './components/fasting-tracker-area';
import OtherLinksArea from './components/other-links-area';
import SecretFolderArea from './components/secret-folder-area';
import SmartCleanerArea from './components/smart-cleaner-area';

export default function MainPage() {
  const insets = useSafeAreaInsets();

  return (
    <NotificationProvider>
      <Page>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
        >
          <View className="gap-y-3">
            <FastingTrackerArea />
            <SmartCleanerArea />
            <SecretFolderArea />
            <OtherLinksArea />
          </View>
        </ScrollView>
      </Page>
    </NotificationProvider>
  );
}
