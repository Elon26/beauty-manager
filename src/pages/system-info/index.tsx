import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Page } from '@/ui/page';
import { PageHeader } from '@/ui/page-header';

import BatteryArea from './components/battery-area';
import ConnectionInfoArea from './components/connection-info-area';
import DeviceInfoArea from './components/device-info-area';
import RamArea from './components/ram-area';
import StorageArea from './components/storage-area';

export default function SystemInfoPage() {
  const insets = useSafeAreaInsets();

  return (
    <Page>
      <PageHeader pageName={t('pages.system-info.page-name')} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom,
        }}
      >
        <View className="gap-y-4">
          <StorageArea />
          <RamArea />
          <BatteryArea />
          <DeviceInfoArea />
          <ConnectionInfoArea />
        </View>
      </ScrollView>
    </Page>
  );
}
