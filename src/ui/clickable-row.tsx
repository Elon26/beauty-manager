import ArrowIcon from '@/svg/settings.svg';

import { Pressable } from './pressable';
import { UiText } from './ui-text';

type Props = {
  title: string;
  handler: () => void;
};

export function ClickableRow({ title, handler }: Props) {
  return (
    <Pressable
      className="flex-row items-center justify-between rounded-xl bg-white p-5"
      onPress={handler}
    >
      <UiText className="font-medium">{title}</UiText>
      <ArrowIcon />
    </Pressable>
  );
}
