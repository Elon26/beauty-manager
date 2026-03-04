import { OnboardingLayout, OnboardingSlide } from '../onboarding-layout';
import { OnboardingA1 } from './onboarding-a-1';
import { OnboardingA2 } from './onboarding-a-2';
import { OnboardingA3 } from './onboarding-a-3';

export function OnboardingA({ hideSlide }: { hideSlide?: boolean }) {
  const allSlides: OnboardingSlide[] = [
    ['0', OnboardingA1, ''],
    ['1', OnboardingA2, ''],
    ['2', OnboardingA3, ''],
  ];

  const slides = hideSlide
    ? allSlides.filter(([key]) => key !== '2')
    : allSlides;

  return <OnboardingLayout slides={slides} />;
}
