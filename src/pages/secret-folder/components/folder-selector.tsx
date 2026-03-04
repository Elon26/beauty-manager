import { Dispatch, SetStateAction, useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import { UiText } from '@/ui/ui-text';

type Props = {
  folder: 'Photos' | 'Contacts';
  setCurrentFolder: Dispatch<SetStateAction<'Photos' | 'Contacts'>>;
};

export default function FolderSelector({ folder, setCurrentFolder }: Props) {
  const left = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    left: `${left.value * 100}%`,
  }));

  useEffect(() => {
    left.value = withTiming(folder === 'Photos' ? 0 : 0.5, {
      duration: 300,
    });
  }, [folder]);

  function handlePress() {
    if (folder === 'Photos') setCurrentFolder('Contacts');
    if (folder === 'Contacts') setCurrentFolder('Photos');
  }

  return (
    <Pressable
      className="flex-row items-center justify-around rounded-xl bg-gray h-10"
      onPress={handlePress}
    >
      <Animated.View
        className="absolute w-[50%] rounded-xl bg-primary h-full"
        style={animatedStyle}
      />
      <UiText
        className={
          (twMerge('text-sm font-semibold'),
          folder === 'Photos' ? 'text-white' : 'text-grayDark')
        }
      >
        Photos
      </UiText>
      <UiText
        className={twMerge(
          'text-sm font-semibold',
          folder === 'Contacts' ? 'text-white' : 'text-grayDark'
        )}
      >
        Contacts
      </UiText>
    </Pressable>
  );
}
