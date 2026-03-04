import { useAnalytics } from '@kirz/expo-toolkit';
import { scaleX, scaleY } from '@kirz/nativewind-scale';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import OnboardingImage from '@/images/onboarding-b-4.png';
import { Page } from '@/ui/page';
import { UiText } from '@/ui/ui-text';

export function OnboardingB4() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { logEvent } = useAnalytics();

  useEffect(() => {
    logEvent('af_onbording_v2_step_4');
  }, []);

  return (
    <View>
      <View className="absolute">
        <LinearGradient
          style={{ width, height }}
          colors={['#D9EFFF', '#229DFB']}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
        />
      </View>
      <Page fullWidth>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + scaleY(16) }}
        >
          <View className="items-center">
            <UiText className="text-center text-4xl font-medium text-white mx-edge mb-16">
              {t('pages.onboarding.title-b-4')}
            </UiText>
            <View className="rounded-3xl bg-grayLight gap-y-2 mx-edge p-4 mb-4 h-60">
              <Image
                source={OnboardingImage}
                style={{ width: scaleX(303), height: scaleY(165) }}
              />
              <UiText className="text-center text-2xl font-semibold">
                {t('pages.onboarding.more-storage-space')}
              </UiText>
            </View>
            <View className="bg-white mb-16 w-full" style={{ width }}>
              <UiText className="text-center text-4xl font-bold text-primary py-6">
                {t('pages.onboarding.subtitle-b-4')}
              </UiText>
            </View>
            <UiText className="text-center text-xl mx-edge">
              {t('pages.onboarding.text-b-4')}
            </UiText>
          </View>
        </ScrollView>
      </Page>
    </View>
  );
}
