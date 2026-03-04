import { forwardRef, useMemo } from 'react';
import type { TextProps as RNTextProps } from 'react-native';
import { Text as RNText } from 'react-native';
import { twMerge } from 'tailwind-merge';

export type TextProps = RNTextProps & {
  className?: string;
};

export const UiText = forwardRef<Text, TextProps>(function Text(
  { className, children, ...props }: TextProps,
  ref
) {
  const textStyle = useMemo(
    () => twMerge('text-base font-normal text-text', className),
    [className]
  );

  return (
    // @ts-ignore - ref type behaves strange
    <RNText allowFontScaling={false} className={textStyle} ref={ref} {...props}>
      {children}
    </RNText>
  );
});
