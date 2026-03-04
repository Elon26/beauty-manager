import { scaleY } from '@kirz/nativewind-scale';
import { Slider } from '@miblanchard/react-native-slider';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { colors } from '@/config/theme';
import { UiText } from '@/ui/ui-text';

export type PasswordLengthSliderProps = {
  value: number;
  onChange: React.Dispatch<React.SetStateAction<number>>;
};

export function PasswordLengthSlider({
  value,
  onChange,
}: PasswordLengthSliderProps) {
  const [innerValue, setInnerValue] = useState(value);

  useEffect(() => {
    if (innerValue !== value) {
      impactAsync(ImpactFeedbackStyle.Light);
      onChange(innerValue);
    }
  }, [innerValue, onChange, value]);

  return (
    <View className="mx-2 mb-3">
      <View className="relative justify-center pb-2">
        <View
          className="absolute flex-row justify-between inset-x-0"
          style={{
            top: 7,
            zIndex: 1,
          }}
        >
          {[0, 16, 32].map((n) => (
            <View
              className="rounded-full mt-2.5 size-1.5"
              key={n}
              style={{
                backgroundColor: '#D9D9D9',
              }}
            />
          ))}
        </View>
        <View style={{ zIndex: 10 }}>
          <Slider
            maximumTrackTintColor="#D9D9D9"
            maximumValue={32}
            minimumTrackStyle={{
              height: scaleY(3),
              borderRadius: 1.5,
              backgroundColor: colors.primary.toString(),
              marginHorizontal: 2,
              marginTop: 1,
            }}
            minimumTrackTintColor={colors.primary.toString()}
            minimumValue={0}
            onValueChange={(v) => setInnerValue(v[0])}
            thumbTouchSize={{ width: 50, height: 50 }}
            renderThumbComponent={() => (
              <View
                style={{ zIndex: 100 }}
                className="items-center justify-center rounded-full bg-primary size-8"
              >
                <UiText className="text-sm text-white">{innerValue}</UiText>
              </View>
            )}
            step={1}
            thumbTintColor={colors.primary.toString()}
            trackStyle={{
              height: 2,
              borderRadius: 3,
              backgroundColor: '#D9D9D9',
            }}
            value={innerValue}
          />
        </View>
      </View>

      <View className="flex-row justify-between -mt-3">
        <UiText className="text-sm font-medium text-[#999999]">0</UiText>
        <UiText className="text-sm font-medium text-[#999999]">16</UiText>
        <UiText className="text-sm font-medium text-[#999999]">32</UiText>
      </View>
    </View>
  );
}
