/* eslint-disable react-compiler/react-compiler */
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { colors } from '@/config/theme';
import { UiText } from '@/ui/ui-text';

type Props = {
  currentDaysInARow: number;
  days: number;
  isAchieved: boolean;
};

export default function AchievementProgressBar({
  currentDaysInARow,
  days,
  isAchieved,
}: Props) {
  const progress = (isAchieved ? 1 : currentDaysInARow / days) * 100;
  const duration = 500;
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: duration,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const width = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View className="overflow-hidden rounded-xl bg-white h-6 w-full">
      <Animated.View
        className="rounded-xl h-full"
        style={{ width, backgroundColor: colors.primary.toString() }}
      />
      {isAchieved ? (
        <UiText className="absolute text-white left-[40%] top-0.5">
          {t('basic.done')}
        </UiText>
      ) : (
        <UiText
          className={twMerge(
            'absolute left-[45%] top-0.5',
            progress > 60 ? 'text-white' : 'text-black'
          )}
        >
          {`${currentDaysInARow}/${days}`}
        </UiText>
      )}
    </View>
  );
}
