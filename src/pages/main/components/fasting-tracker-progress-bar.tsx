/* eslint-disable react-compiler/react-compiler */
import { scaleX } from '@kirz/nativewind-scale';
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import { colors } from '@/config/theme';
import { useStorage } from '@/hooks/use-storage';
import { SfSymbol } from '@/ui/sf-symbol';
import { UiText } from '@/ui/ui-text';

type Props = {
  progress: number;
};

export default function FastingTrackerProgressBar({ progress }: Props) {
  const [isTimerActive] = useStorage('isTimerActive');
  const THUMB_WIDTH = 40;
  const THUMB_HEIGHT = 20;
  const COLOR = '#86C9FD';
  const DURATION = 500;
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: DURATION,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const width = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const translateX = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -THUMB_WIDTH],
    extrapolate: 'clamp',
  });

  return (
    <View className="px-7">
      <View className="justify-center my-2">
        <View
          className="rounded-xl bg-white h-2 w-full"
          style={{ backgroundColor: COLOR }}
        >
          <Animated.View
            className="rounded-xl bg-white h-full"
            style={{ width }}
          />
        </View>

        {isTimerActive && (
          <Animated.View
            className="absolute z-10 items-center justify-center rounded-full border border-gray"
            style={{
              backgroundColor: COLOR,
              width: THUMB_WIDTH,
              height: THUMB_HEIGHT,
              left: width,
              top: -6,
              transform: [{ translateX }],
            }}
          >
            <UiText className="text-sm text-white">{progress}%</UiText>
          </Animated.View>
        )}
      </View>

      <View
        className="absolute items-center justify-center rounded-full bg-primary left-0 -top-1 size-8"
        style={{ backgroundColor: isTimerActive ? 'white' : COLOR }}
      >
        <SfSymbol
          name="xmark"
          tintColor={
            isTimerActive ? colors.primary.toString() : colors.white.toString()
          }
          size={scaleX(20)}
          weight="semibold"
        />
      </View>
      <View
        className="absolute items-center justify-center rounded-full bg-primary right-0 -top-1 size-8"
        style={{ backgroundColor: COLOR }}
      >
        <SfSymbol
          name="checkmark"
          tintColor={colors.white.toString()}
          size={scaleX(20)}
          weight="semibold"
        />
      </View>
    </View>
  );
}
