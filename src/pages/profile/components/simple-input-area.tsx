import { TextInput, View } from 'react-native';
import { isNumber } from 'remeda';

import { UiText } from '@/ui/ui-text';

type Props = {
  name: string;
  value: string;
  setValue: (val: string) => void;
  placeholder: string;
};

export default function SimpleInputArea({
  name,
  value,
  setValue,
  placeholder,
}: Props) {
  function handleSetValue(val: string) {
    if (name === 'Name' || isNumber(+val)) setValue(val);
  }

  return (
    <View className="gap-y-1">
      <UiText className="font-semibold ml-4">{name}</UiText>
      <TextInput
        className="rounded-full bg-grayLight text-sm font-medium p-4"
        value={value === '0' ? '' : value}
        placeholder={placeholder}
        onChangeText={handleSetValue}
      />
    </View>
  );
}
