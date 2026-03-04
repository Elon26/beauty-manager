import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'moti';
import { type PropsWithChildren, useCallback, useMemo } from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { colors } from '@/config/theme';

import { UiText } from './ui-text';

type UiButtonProps = PropsWithChildren<{
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}>;

export function UiButton({
  onPress,
  disabled = false,
  loading = false,
  className = '',
  children,
  ...props
}: UiButtonProps) {
  const handlePress = useCallback(() => {
    if (disabled) {
      return;
    }
    impactAsync(ImpactFeedbackStyle.Medium);
    onPress?.();
  }, [disabled, onPress]);

  const content = useMemo(() => {
    if (typeof children === 'string') {
      return (
        <UiText
          className={twMerge(
            'font-semibold',
            disabled ? 'text-white' : 'text-white'
          )}
        >
          {children}
        </UiText>
      );
    }
    return children;
  }, [children, disabled]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={twMerge('items-center justify-center h-12 w-80', className)}
      disabled={disabled}
      {...props}
    >
      <View
        className={twMerge(
          'absolute overflow-hidden rounded-3xl left-0 right-0 h-12',
          disabled && 'opacity-50'
        )}
      >
        <LinearGradient
          colors={['#1E99F9', '#68BDFF', '#096AB9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </View>
      {loading ? (
        <ActivityIndicator
          color={disabled ? colors.white.toString() : colors.white.toString()}
        />
      ) : (
        content
      )}
    </TouchableOpacity>
  );
}
