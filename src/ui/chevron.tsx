import { colors } from '@/config/theme';
import { scaleX } from '@kirz/nativewind-scale';
import { SfSymbol } from './sf-symbol';

type ChevronProps = {
  color?: string;
};

export function ChevronRight({ color = colors.white.toString() }: ChevronProps) {
  return <SfSymbol name="chevron.right" size={scaleX(10)} weight="black" tintColor={color} />;
}
