import { scaleX } from '@kirz/nativewind-scale';

import { colors } from '@/config/theme';
import { Pressable } from '@/ui/pressable';
import { SfSymbol } from '@/ui/sf-symbol';
import { UiText } from '@/ui/ui-text';

type Props = {
  title: string;
  handler: () => void;
};

export function SettingsItem({ title, handler }: Props) {
  return (
    <Pressable
      className="flex-row items-center justify-between rounded-full bg-grayLight px-4 py-4.5"
      onPress={handler}
    >
      <UiText className="font-medium">{title}</UiText>
      <SfSymbol
        name="chevron.right"
        tintColor={colors.grayDark.toString()}
        size={scaleX(16)}
        weight="semibold"
      />
    </Pressable>
  );
}
