import { useAnalytics } from '@kirz/expo-toolkit';
import { scaleX, scaleY } from '@kirz/nativewind-scale';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import OnboardingImage from '@/images/onboarding-b-3.png';
import { Page } from '@/ui/page';
import { UiText } from '@/ui/ui-text';

export function OnboardingB3() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { logEvent } = useAnalytics();

  useEffect(() => {
    logEvent('af_onbording_v2_step_3');
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
            <UiText className="text-center text-4xl font-medium text-white mx-edge">
              {t('pages.onboarding.title-b-3')}
            </UiText>
            <View className="my-1">
              <Image
                source={OnboardingImage}
                style={{ width: scaleX(287), height: scaleX(287) }}
              />
              <UiText
                className="absolute text-center text-4xl font-bold text-primary"
                style={{ top: scaleX(120), left: scaleX(112) }}
              >
                {t('pages.onboarding.6hr')}
              </UiText>
            </View>
            <View className="bg-white mb-16 w-full" style={{ width }}>
              <UiText className="text-center text-4xl font-bold text-primary py-6">
                {t('pages.onboarding.subtitle-b-3')}
              </UiText>
            </View>
            <UiText className="text-center text-xl mx-edge">
              {t('pages.onboarding.text-b-3')}
            </UiText>
          </View>
        </ScrollView>
      </Page>
    </View>
  );
}
