import { type PeriodUnit, useAnalytics } from '@kirz/expo-toolkit';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSharedValue } from 'react-native-reanimated';

import { useConfig } from '@/hooks/use-config';
import { useHasPremiumWithBackdoor } from '@/hooks/use-developer-purchases';
import { usePaywall } from '@/hooks/use-paywall';
import { useSetStorage } from '@/hooks/use-storage';
import { UiButton } from '@/ui/ui-button';
import { UiText } from '@/ui/ui-text';

import { AnimatedDot } from './animated-dot';
import { Page } from '@/ui/page';

type TrialDTO = {
  periodUnit: PeriodUnit;
  numberOfPeriods: number;
  daysInTrial: number;
};

export type OnboardingSlide = [
  string,
  React.ComponentType<{ trial?: TrialDTO }>,
  string,
  TrialDTO?,
];

type OnboardingLayoutProps = {
  slides: OnboardingSlide[];
};

export function OnboardingLayout({ slides }: OnboardingLayoutProps) {
  const hasPremium = useHasPremiumWithBackdoor();

  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const { logEvent } = useAnalytics();
  const setIsOnboardingFinished = useSetStorage('isOnboardingFinished');
  const { onboarding_paywall_id, onboarding_id } = useConfig();
  const { showPaywall } = usePaywall();
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    logEvent(`af_show_paywall_v_${onboarding_paywall_id}`);
  }, [onboarding_paywall_id, logEvent]);

  const handleNext = () => {
    if (!pagerRef.current) return;

    if (currentPage < slides.length - 1) {
      pagerRef.current.setPage(currentPage + 1);
      logEvent(`af_onboarding_v_${onboarding_id}_${currentPage + 1}`);
      setCurrentPage(currentPage + 1);
    } else {
      setIsOnboardingFinished(true);
      logEvent(`af_onboarding_v_${onboarding_id}_finished`);
      router.replace('/main');
      if (!hasPremium) showPaywall(onboarding_paywall_id);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <PagerView
        style={{ flex: 1 }}
        initialPage={0}
        ref={pagerRef}
        onPageScroll={({ nativeEvent: { position, offset } }) => {
          setCurrentPage(position);
          animatedValue.value = position + offset;
        }}
      >
        {slides.map(([key, Slide, title, trial]) => (
          <View
            key={key}
            className="flex-1 items-center justify-between overflow-hidden"
          >
            <Slide trial={trial} />
            <UiText className="text-center text-xl font-bold mb-2">
              {title}
            </UiText>
          </View>
        ))}
      </PagerView>
      <View className="absolute items-center gap-y-4 left-0 right-0 bottom-8">
        <View className="flex-row items-center">
          {slides.map(([index], i) => (
            <AnimatedDot key={index} index={i} animatedValue={animatedValue} />
          ))}
        </View>
        <UiButton onPress={handleNext}>
          {t(
            currentPage < slides.length - 1 ? 'basic.continue' : 'basic.start'
          )}
        </UiButton>
      </View>
    </View>
  );
}
