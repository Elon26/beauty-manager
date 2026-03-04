import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { useStorageValue } from '@/hooks/use-storage';
import Icon from '@/svg/profile.svg';
import { UiText } from '@/ui/ui-text';

type AnagramProps = {
  className?: string;
};

export function FastingTrackerAnagram({ className }: AnagramProps) {
  const userProfile = useStorageValue('userProfile');

  const [firstName, secondName, ...rest] = userProfile.name.split(' ');

  const hasFirstAndLastName = !!firstName && !!secondName;
  const hasFirstName = !!firstName;

  const anagram = hasFirstAndLastName ? (
    `${firstName[0]}${secondName[0]}`
  ) : hasFirstName ? (
    `${firstName[0]}`
  ) : (
    <Icon />
  );

  const [fontSize, setFontSize] = useState(0);

  return (
    <Pressable
      className={twMerge(
        'items-center justify-center rounded-full size-10',
        className
      )}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setFontSize(width * 0.4);
      }}
      onPress={() => router.navigate('/profile')}
    >
      <View className="absolute overflow-hidden rounded-3xl left-0 right-0 h-10">
        <LinearGradient
          colors={['#1E99F9', '#68BDFF', '#096AB9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </View>
      <UiText
        className="text-center font-semibold uppercase text-white"
        numberOfLines={1}
        style={{ fontSize }}
      >
        {anagram}
      </UiText>
    </Pressable>
  );
}
