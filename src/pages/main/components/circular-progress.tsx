import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { UiText } from '@/ui/ui-text';

type Props = {
  size: number;
  strokeWidth: number;
  percentage: number | null;
  textColor?: string;
};

export default function CircularProgress({
  size,
  strokeWidth,
  percentage,
  textColor,
}: Props) {
  const PADDING = 1;
  const progressStrokeWidth = strokeWidth - PADDING * 2;

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const strokeDashoffset =
    circumference - ((percentage || 0) / 100) * circumference;

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

      <View className="absolute items-center justify-center">
        <UiText
          className="text-xl font-semibold"
          style={{ color: textColor || 'black' }}
        >
          {percentage === null ? '--' : percentage + '%'}
        </UiText>
      </View>
    </View>
  );
}
