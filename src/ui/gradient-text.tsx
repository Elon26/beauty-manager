import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { twMerge } from 'tailwind-merge';

import { type TextProps, UiText } from './ui-text';

type GradientTextProps = TextProps & {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  className?: string;
};

/**
 * A styled text component with gradient overlay.
 *
 * @param {GradientTextProps} props - The properties for the styled text component.
 * @returns {JSX.Element} The styled text component.
 */
export function GradientText({
  colors,
  start,
  className,
  end,
  ...rest
}: GradientTextProps): JSX.Element {
  return (
    <MaskedView maskElement={<UiText {...rest} className={className} />}>
      <LinearGradient
        colors={colors}
        start={start ?? { x: 0.5, y: -1 }}
        end={end ?? { x: 0.7, y: 1 }}
      >
        <UiText {...rest} className={twMerge('opacity-0', className)}>
          {rest.children}
        </UiText>
      </LinearGradient>
    </MaskedView>
  );
}
