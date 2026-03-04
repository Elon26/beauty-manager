import { scaleX } from '@kirz/nativewind-scale';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { twMerge } from 'tailwind-merge';

import { UiText } from '@/ui/ui-text';
import calcTime from '@/utils/calc-time';

type Props = {
  timeLeft: number;
  percentage: number;
  isActive: boolean;
  currentMode: 'fasting' | 'eating';
};

export default function Timer({
  timeLeft,
  percentage,
  isActive,
  currentMode,
}: Props) {
  const strokeWidth = scaleX(20);
  const size = scaleX(296);

  const PADDING = 1;
  const progressStrokeWidth = strokeWidth - PADDING * 2;

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const strokeDashoffset =
    circumference - ((percentage || 0) / 100) * circumference;

  const [hourLeft, setHourLeft] = useState('');
  const [minuteLeft, setMinuteLeft] = useState('');
  const [secondLeft, setSecondLeft] = useState('');

  useEffect(() => {
    const [hour, minute, second] = calcTime(timeLeft).split(':');
    setHourLeft(hour);
    setMinuteLeft(minute);
    setSecondLeft(second);
  }, [timeLeft]);

  return (
    <View
      className="items-center justify-center"
      style={{ width: size + 2, height: size + 2 }}
    >
      <Svg width={size + 2} height={size + 2}>
        <Defs>
          <LinearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#4FB6FF" />
            <Stop offset="100%" stopColor="#1E99F9" />
          </LinearGradient>
        </Defs>

        <Circle
          stroke="url(#blueGrad)"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        <Circle
          stroke="white"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={progressStrokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View className="absolute items-center justify-center gap-y-4">
        {isActive && (
          <View className="flex-row gap-x-1">
            {currentMode === 'fasting' && (
              <UiText className="text-lg font-bold text-primary">
                {t('pages.fasting-tracker.fasting')}
              </UiText>
            )}
            {currentMode === 'eating' && (
              <UiText className="text-lg font-bold text-green">
                {t('pages.fasting-tracker.eating')}
              </UiText>
            )}
            <UiText className="text-lg text-gray">
              — {t('pages.fasting-tracker.time-left')}
            </UiText>
          </View>
        )}
        <View className="flex-row items-center">
          <UiText
            className={twMerge(
              'text-5xl font-bold',
              hourLeft.length >= 3 ? 'text-right w-24' : 'text-center w-16'
            )}
          >
            {hourLeft}
          </UiText>
          <UiText className="text-5xl font-bold">:</UiText>
          <UiText className="text-center text-5xl font-bold w-16">
            {minuteLeft}
          </UiText>
          <UiText className="text-5xl font-bold">:</UiText>
          <UiText className="text-center text-5xl font-bold w-16">
            {secondLeft}
          </UiText>
        </View>
      </View>
    </View>
  );
}
