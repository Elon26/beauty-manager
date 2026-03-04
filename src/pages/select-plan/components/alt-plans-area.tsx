import { Dispatch, SetStateAction } from 'react';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { useModals } from '@/hooks/use-modals';
import { UiText } from '@/ui/ui-text';

type Props = {
  selectedPlan: string;
  setSelectedPlan: Dispatch<SetStateAction<string>>;
};

export default function AltPlansArea({ selectedPlan, setSelectedPlan }: Props) {
  const { openModal, closeModal } = useModals();

  return (
    <View className="gap-y-2">
      <UiText className="font-semibold">
        {t('pages.select-plan.alternative-schemes')}
      </UiText>
      <View className="flex-row flex-wrap -m-1">
        <View className="w-[50%] p-1">
          <Pressable
            className={twMerge(
              'rounded-2xl border-2 bg-grayLight gap-y-1.5 p-4',
              selectedPlan === 'MWF' ? 'border-primary' : 'border-grayLight'
            )}
            onPress={() => setSelectedPlan('MWF')}
          >
            <UiText className="text-lg font-semibold">
              {t('pages.select-plan.mwf-title')}
            </UiText>
            <View className="flex-row gap-x-2">
              <UiText className="text-sm">·</UiText>
              <UiText className="text-sm">
                {t('pages.select-plan.mwf-text')}
              </UiText>
            </View>
          </Pressable>
        </View>
        <View className="w-[50%] p-1">
          <Pressable
            className={twMerge(
              'rounded-2xl border-2 bg-grayLight gap-y-1.5 p-4',
              selectedPlan === 'TTS' ? 'border-primary' : 'border-grayLight'
            )}
            onPress={() => setSelectedPlan('TTS')}
          >
            <UiText className="text-lg font-semibold">
              {t('pages.select-plan.tts-title')}
            </UiText>
            <View className="flex-row gap-x-2">
              <UiText className="text-sm">·</UiText>
              <UiText className="text-sm">
                {t('pages.select-plan.tts-text')}
              </UiText>
            </View>
          </Pressable>
        </View>
        <View className="w-[50%] p-1">
          <Pressable
            className={twMerge(
              'rounded-2xl border-2 bg-grayLight gap-y-1.5 p-4',
              selectedPlan === 'Custom' ? 'border-primary' : 'border-grayLight'
            )}
            onPress={() =>
              openModal('CreatePlanModal', {
                setPlan: () => {
                  setSelectedPlan('Custom');
                },
                close: () => closeModal('CreatePlanModal'),
              })
            }
          >
            <UiText className="text-lg font-semibold">
              {t('pages.select-plan.custom-plan')}
            </UiText>
            <View className="flex-row gap-x-2">
              <UiText className="text-sm">·</UiText>
              <UiText className="text-sm">
                {t('pages.select-plan.set-your-own')}
              </UiText>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
