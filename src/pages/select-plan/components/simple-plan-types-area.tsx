import { Dispatch, SetStateAction } from 'react';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import StarIcon from '@/svg/star-without-color.svg';
import UserPlan from '@/types/user-plan';
import UserPlanType from '@/types/user-plan-type';
import { UiText } from '@/ui/ui-text';

type Props = {
  planType: UserPlanType;
  userPlans: UserPlan[];
  selectedPlan: string;
  setSelectedPlan: Dispatch<SetStateAction<string>>;
};

export default function SimplePlanTypesArea({
  planType,
  userPlans,
  selectedPlan,
  setSelectedPlan,
}: Props) {
  return (
    <View className="gap-y-2">
      <UiText className="font-semibold">
        {planType === 'begin' && t('pages.select-plan.for-beginners')}
        {planType === 'advanced' && t('pages.select-plan.advanced')}
        {planType === 'pro' && t('pages.select-plan.pro')}
      </UiText>
      <View className="flex-row flex-wrap -m-1">
        {userPlans.map((plan) => {
          const currentColor =
            plan.quantityOfStars === 3
              ? '#FE5C5E'
              : plan.quantityOfStars === 2
                ? '#DEB763'
                : '#229DFB';

          return (
            <View className="w-[50%] p-1" key={plan.name}>
              <Pressable
                className={twMerge(
                  'rounded-2xl border-2 bg-grayLight gap-y-1.5 p-4',
                  selectedPlan === plan.name
                    ? 'border-primary'
                    : 'border-grayLight'
                )}
                onPress={() => setSelectedPlan(plan.name)}
              >
                <UiText className="text-lg font-semibold">{plan.name}</UiText>
                <View className="flex-row gap-x-1">
                  <StarIcon fill={currentColor} />
                  <StarIcon
                    fill={plan.quantityOfStars >= 2 ? currentColor : '#9C9C9C'}
                  />
                  <StarIcon
                    fill={plan.quantityOfStars >= 3 ? currentColor : '#9C9C9C'}
                  />
                </View>
                <View className="gap-y-1">
                  <UiText className="text-sm">
                    ·{' '}
                    {t('pages.select-plan.hours-fasting', {
                      hours: plan.fastingTime,
                    })}
                  </UiText>
                  <UiText className="text-sm">
                    ·{' '}
                    {t('pages.select-plan.hours-eating', {
                      hours: plan.eatingTime,
                    })}
                  </UiText>
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
