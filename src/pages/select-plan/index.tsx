import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useModals } from '@/hooks/use-modals';
import { useStorage } from '@/hooks/use-storage';
import UserPlan from '@/types/user-plan';
import { Page } from '@/ui/page';
import { PageHeader } from '@/ui/page-header';
import { UiButton } from '@/ui/ui-button';

import AltPlansArea from './components/alt-plans-area';
import SimplePlanTypesArea from './components/simple-plan-types-area';
import userPlans from './constants/user-plans';

export default function SelectPlanPage() {
  const { openModal } = useModals();
  const insets = useSafeAreaInsets();
  const [isPreparingForFastingModalNeedToShow] = useStorage(
    'isPreparingForFastingModalNeedToShow'
  );
  const [, setCustomPlan] = useStorage('customPlan');
  const [selectedPlan, setSelectedPlan] = useStorage('selectedPlan');
  const [isUserProfileShown, setIsUserProfileShown] =
    useStorage('isUserProfileShown');

  const beginPlans: UserPlan[] = [];
  const advancedPlans: UserPlan[] = [];
  const proPlans: UserPlan[] = [];

  userPlans.forEach((plan) => {
    if (plan.type === 'begin') beginPlans.push(plan);
    if (plan.type === 'advanced') advancedPlans.push(plan);
    if (plan.type === 'pro') proPlans.push(plan);
  });

  function handleSelect() {
    if (isPreparingForFastingModalNeedToShow) {
      openModal('PreparingForFastingModal');
    }
    if (isUserProfileShown) {
      router.navigate('/fasting-tracker');
    } else {
      setIsUserProfileShown(true);
      router.navigate('/profile');
    }
  }

  useEffect(() => {
    if (selectedPlan !== 'Custom') {
      setCustomPlan(null);
    }
  }, [selectedPlan]);

  return (
    <Page>
      <PageHeader pageName={t('pages.select-plan.page-name')} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom,
        }}
      >
        <View className="gap-y-4">
          <SimplePlanTypesArea
            planType="begin"
            userPlans={beginPlans}
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
          />
          <SimplePlanTypesArea
            planType="advanced"
            userPlans={advancedPlans}
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
          />
          <SimplePlanTypesArea
            planType="pro"
            userPlans={proPlans}
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
          />
          <AltPlansArea
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
          />
        </View>
      </ScrollView>
      <View className="items-center mt-6">
        <UiButton disabled={selectedPlan === ''} onPress={handleSelect}>
          {t('pages.select-plan.page-name')}
        </UiButton>
      </View>
    </Page>
  );
}
