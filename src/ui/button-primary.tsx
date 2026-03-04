import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';
import { twMerge } from 'tailwind-merge';

import { UiText } from './ui-text';

export type ButtonPrimaryProps = {
  onPress?: () => void;
  label?: string;
  labelClassName?: string;
  disabled?: boolean;
  disabledLabel?: string;
  className?: string;
  color?: string;
  loading?: boolean;
  style?: TouchableOpacityProps['style'];
  gradient?: boolean;
} & PropsWithChildren;

export function ButtonPrimary({
  onPress,
  disabled,
  label,
  labelClassName,
  className,
  children = null,
  loading,
  style,
  gradient = true,
}: ButtonPrimaryProps) {
  return (
    <TouchableOpacity
      className={twMerge(
        'items-center justify-center overflow-hidden rounded-full h-13',
        disabled ? 'opacity-50' : 'opacity-100',
        className
      )}
      disabled={disabled}
      onPress={onPress}
      style={style}
    >
      {gradient && (
        <LinearGradient
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          }}
          colors={['#1E99F9', '#096AB9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      )}

      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <>
          {label && (
            <UiText className={twMerge('text-base text-white', labelClassName)}>
              {label}
            </UiText>
          )}
          {children}
        </>
      )}
    </TouchableOpacity>
  );
}
