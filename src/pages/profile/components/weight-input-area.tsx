import { TextInput, View } from 'react-native';
import { isNumber } from 'remeda';
import { twMerge } from 'tailwind-merge';

import { Pressable } from '@/ui/pressable';
import { UiText } from '@/ui/ui-text';

type Props = {
  name: string;
  value: string;
  setValue: (val: string) => void;
  placeholder: string;
  measure: 'kg' | 'lbs';
  setMeasure: (measure: 'kg' | 'lbs') => void;
};

export default function WeightInputArea({
  name,
  value,
  setValue,
  placeholder,
  measure,
  setMeasure,
}: Props) {
  function handleSetValue(val: string) {
    if (isNumber(+val)) setValue(val);
  }

  return (
    <View className="gap-y-1">
      <UiText className="font-semibold ml-4">{name}</UiText>
      <View className="flex-row gap-x-2">
        <TextInput
          className="flex-1 rounded-full bg-grayLight text-sm font-medium p-4"
          value={value === '0' ? '' : value}
          placeholder={placeholder}
          onChangeText={handleSetValue}
        />
        <Pressable
          className={twMerge(
            'flex-row items-center justify-center rounded-full border bg-grayLight gap-x-1.5 h-full w-20',
            measure === 'kg' ? 'border-primary' : 'border-grayLight'
          )}
          onPress={() => setMeasure('kg')}
        >
          <UiText>{t('pages.profile.kg')}</UiText>
        </Pressable>
        <Pressable
          className={twMerge(
            'flex-row items-center justify-center rounded-full border bg-grayLight gap-x-1.5 h-full w-20',
            measure === 'lbs' ? 'border-primary' : 'border-grayLight'
          )}
          onPress={() => setMeasure('lbs')}
        >
          <UiText>{t('pages.profile.lbs')}</UiText>
        </Pressable>
      </View>
    </View>
  );
}
