import { scaleX } from '@kirz/nativewind-scale';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import { colors } from '@/config/theme';

import { SfSymbol } from './sf-symbol';

type CheckboxProps = {
  checked?: boolean | 'mix';
  onChange?: (checked: boolean) => void;
  label?: string;
  symbolClassName?: string;
  isAltView?: boolean;
} & Omit<TouchableOpacityProps, 'children'>;

export function Checkbox({
  checked,
  onChange,
  className,
  symbolClassName,
  isAltView,
  ...props
}: CheckboxProps) {
  return (
    <TouchableOpacity
      className={twMerge(
        'items-center overflow-hidden rounded-md border size-6',
        isAltView
          ? 'border-black/20 bg-white'
          : 'border-[#9C9C9C] bg-transparent',
        props.disabled && 'opacity-30',
        checked && 'border-primary bg-primary',
        className
      )}
      onPress={() => {
        impactAsync(ImpactFeedbackStyle.Light);
        onChange?.(!checked);
      }}
      {...props}
      hitSlop={5}
    >
      {checked === true && (
        <Animated.View
          className="absolute items-center justify-center rounded-lg inset-0"
          entering={ZoomIn.springify().duration(250)}
          exiting={ZoomOut.duration(250)}
        >
          <SfSymbol
            name="checkmark"
            type="monochrome"
            tintColor={colors.white.toString()}
            className={symbolClassName}
            size={scaleX(12)}
            weight="semibold"
          />
        </Animated.View>
      )}
      {checked === 'mix' && (
        <Animated.View
          className="absolute items-center justify-center rounded-lg inset-0"
          entering={ZoomIn.springify().duration(250)}
          exiting={ZoomOut.duration(250)}
        >
          <SfSymbol
            name="minus"
            type="monochrome"
            tintColor={colors.white.toString()}
            className={symbolClassName}
            size={scaleX(12)}
            weight="semibold"
          />
        </Animated.View>
      )}
    </TouchableOpacity>
  );
}
