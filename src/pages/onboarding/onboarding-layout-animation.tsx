import {
  type PeriodUnit,
  useAnalytics,
  usePurchases,
} from '@kirz/expo-toolkit';
import { scaleX, scaleY } from '@kirz/nativewind-scale';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import PagerView from 'react-native-pager-view';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useConfig } from '@/hooks/use-config';
import { usePaywall } from '@/hooks/use-paywall';
import { useSetStorage, useStorageValue } from '@/hooks/use-storage';
import { UiButton } from '@/ui/ui-button';

import { AnimatedDot } from './animated-dot';
import { HackerText } from './text-animated';

type TrialDTO = {
  periodUnit: PeriodUnit;
  numberOfPeriods: number;
  daysInTrial: number;
};

export type OnboardingAnimationSlide = [
  string,
  React.ComponentType<{ slide: number; trial?: TrialDTO }>,
  string,
  string,
  TrialDTO?,
];

type OnboardingLayoutProps = {
  slides: OnboardingAnimationSlide[];
};

export function OnboardingLayoutAnimation({ slides }: OnboardingLayoutProps) {
  const hasDeveloperPremium = useStorageValue('hasDeveloperPremium');
  const { hasPremium: hasBusinessPremium } = usePurchases();
  const hasPremium = hasDeveloperPremium || hasBusinessPremium;

  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const { logEvent } = useAnalytics();
  const setIsOnboardingFinished = useSetStorage('isOnboardingFinished');
  const { onboarding_paywall_id, onboarding_id } = useConfig();
  const { showPaywall } = usePaywall();
  const animatedValue = useSharedValue(0);
  const backgroundOpacity = useSharedValue(0);

  useEffect(() => {
    backgroundOpacity.value = withTiming(1, { duration: 1000 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: '#DCD3E3',
    opacity: backgroundOpacity.value,
  }));

  useEffect(() => {
    logEvent(`af_show_paywall_v_${onboarding_paywall_id}`);
  }, [onboarding_paywall_id, logEvent]);

  const [index, setIndex] = useState(0);
  const timer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const changeSentence = () => {
      timer.current = setTimeout(() => {
        setIndex((index) => {
          return (index + 1) % slides.length;
        });
        changeSentence();
      }, 2000);
    };

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [currentPage]);

  const handleNext = useCallback(() => {
    if (!pagerRef.current) return;
    if (currentPage < slides.length - 1) {
      pagerRef.current.setPage(currentPage + 1);
      logEvent(`af_onboarding_v_${onboarding_id}_${currentPage + 1}`);
      setCurrentPage((prev) => prev + 1);
    } else {
      setIsOnboardingFinished(true);
      logEvent(`af_onboarding_v_${onboarding_id}_finished`);
      router.replace('/main');
      if (!hasPremium) showPaywall(onboarding_paywall_id);
    }
  }, [
    currentPage,
    slides.length,
    hasPremium,
    setIsOnboardingFinished,
    showPaywall,
    onboarding_paywall_id,
    logEvent,
    onboarding_id,
  ]);

  return (
    <View className="bg-background flex-1">
      <HackerText
        text={slides[currentPage][2]}
        style={{
          fontSize: scaleX(16),
          color: '#262626',
          opacity: 0.3,
          paddingTop: scaleY(80),
        }}
      />

      <Animated.View
        style={[
          {
            height: scaleY(425),
            marginTop: scaleX(20),
            borderRadius: scaleX(18),
            borderWidth: scaleX(3),
            borderColor: '#F4F3F7',
          },
          animatedStyle,
        ]}
      >
        <PagerView
          style={{ flex: 1 }}
          initialPage={0}
          ref={pagerRef}
          onPageSelected={({ nativeEvent }) => {
            setCurrentPage(nativeEvent.position);
          }}
          onPageScroll={({ nativeEvent: { position, offset } }) => {
            animatedValue.value = position + offset;
            setIndex(currentPage);
          }}
        >
          {slides.map(([key, Slide, _, __, trial]) => (
            <View key={key} className="flex-1 items-center justify-center">
              <Slide slide={currentPage} trial={trial} />
            </View>
          ))}
        </PagerView>
      </Animated.View>
      <View className="absolute left-0 right-0 bottom-8">
        <SafeAreaView className="items-center gap-5">
          <HackerText
            text={slides[currentPage][3]}
            style={{
              fontSize: scaleX(26),
              color: '#262626',
            }}
          />
          <View className="flex-row items-center">
            {slides.map(([index], i) => (
              <AnimatedDot
                key={index}
                index={i}
                animatedValue={animatedValue}
              />
            ))}
          </View>

          <UiButton onPress={handleNext}>Continue</UiButton>
        </SafeAreaView>
      </View>
    </View>
  );
}
