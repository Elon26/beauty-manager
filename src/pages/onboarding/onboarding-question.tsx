import { useState } from 'react';
import { View } from 'react-native';

import { Checkbox } from '@/ui/checkbox';
import { UiText } from '@/ui/ui-text';

type Props = {
  question: string;
};

export function OnboardingQuestion({ question }: Props) {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <View className="flex-row items-center justify-between rounded-2xl bg-white p-5">
      <UiText className="text-sm">{question}</UiText>
      <Checkbox checked={isSelected} onChange={setIsSelected} isAltView />
    </View>
  );
}
