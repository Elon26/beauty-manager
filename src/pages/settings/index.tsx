import { Env } from '@kirz/expo-env';
import { router } from 'expo-router';
import { requestReview } from 'expo-store-review';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHasPremiumWithBackdoor } from '@/hooks/use-developer-purchases';
import { useWebViewModal } from '@/hooks/use-web-view-modal';
import { Page } from '@/ui/page';
import { PageHeader } from '@/ui/page-header';

import { Banner } from './components/banner';
import { RestoreItem } from './components/restore-item';
import { SettingsItem } from './components/settings-item';

export default function SettingsPage() {
  const { openModal: openWebViewModal } = useWebViewModal();
  const hasPremium = useHasPremiumWithBackdoor();
  const insets = useSafeAreaInsets();

  return (
    <Page>
      <PageHeader pageName={t('pages.settings.page-name')} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
      >
        <View className="gap-y-4">
          {!hasPremium && <Banner />}
          <View className="gap-y-3">
            <SettingsItem
              title={t('pages.settings.change-pin-code')}
              handler={() => router.navigate('/reset-pin')}
            />
            <SettingsItem
              title={t('pages.settings.report-issue')}
              handler={() => openWebViewModal(Env.CONTACT_US)}
            />
            <RestoreItem />
            <SettingsItem
              title={t('pages.settings.privacy')}
              handler={() => openWebViewModal(Env.PRIVACY_POLICY)}
            />
            <SettingsItem
              title={t('pages.settings.terms')}
              handler={() => openWebViewModal(Env.TERMS_OF_USE)}
            />
            <SettingsItem
              title={t('pages.settings.rate')}
              handler={() => requestReview()}
            />
          </View>
        </View>
      </ScrollView>
    </Page>
  );
}
