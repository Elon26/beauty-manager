import { router } from 'expo-router';
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { Pressable } from '@/ui/pressable';
import { UiText } from '@/ui/ui-text';

type Props = {
  quantity: number;
  type: 'Photos' | 'Contacts';
  isPincodeSet: boolean | undefined;
};

export default function ItemsRow({ quantity, type, isPincodeSet }: Props) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <UiText className="text-grayDark text-sm font-medium">
        {quantity} {type === 'Photos' ? 'item' : 'contact'}
        {quantity !== 1 && 's'}
      </UiText>

      {/* <Pressable
        className={twMerge(
          'items-center justify-center rounded-xl size-8',
          isPincodeSet ? 'bg-primary' : 'bg-red'
        )}
        onPress={() => router.navigate('/set-pin')}
      >
        {isPincodeSet ? <LockIcon /> : <UnlockIcon />}
      </Pressable> */}
    </View>
  );
}
