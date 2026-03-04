import { useConfig } from '@/hooks/use-config';

import { OnboardingA } from './variants/onboarding-a';
import { OnboardingB } from './variants/onboarding-b';

const Onboardings = {
  a: OnboardingA,
  b: OnboardingB,
};

export function OnboardingPage() {
  const { onboarding_id } = useConfig();
  const Onboarding = Onboardings[onboarding_id] ?? OnboardingA;

  return <Onboarding />;
}
