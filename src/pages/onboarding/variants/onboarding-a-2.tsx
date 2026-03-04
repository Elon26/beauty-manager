import { useAnalytics } from '@kirz/expo-toolkit';
import { scaleX, scaleY } from '@kirz/nativewind-scale';
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import OnboardingImage from '@/images/onboarding-a-2.png';
import { Page } from '@/ui/page';
import { UiText } from '@/ui/ui-text';

export function OnboardingA2() {
  const insets = useSafeAreaInsets();
  const { logEvent } = useAnalytics();

  useEffect(() => {
    logEvent('af_onbording_v1_step_2');
  }, []);

  return (
    <Page>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + scaleY(16) }}
      >
        <View className="items-center gap-y-4">
          <Image
            source={OnboardingImage}
            style={{ width: scaleX(313), height: scaleY(463) }}
          />
          <UiText className="text-center text-3xl font-bold">
            {t('pages.onboarding.title-a-2')}
          </UiText>
          <UiText className="text-center text-lg font-medium">
            {t('pages.onboarding.text-a-2')}
          </UiText>
        </View>
      </ScrollView>
    </Page>
  );
}
