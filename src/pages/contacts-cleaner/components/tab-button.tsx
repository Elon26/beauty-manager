import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { TouchableOpacity } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { shadows } from '@/config/theme/shadows';
import { UiText } from '@/ui/ui-text';

type TabBtnProps = {
  title: string;
  onPress: () => void;
  active?: boolean;
};

export function TabButton({ title, onPress, active }: TabBtnProps) {
  return (
    <TouchableOpacity
      className={twMerge(
        'items-center justify-center rounded-lg px-6 h-7',
        active ? 'bg-white' : 'bg-transparent'
      )}
      onPress={() => {
        impactAsync(ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={shadows.md}
    >
      <UiText
        className={twMerge(
          'text-xs text-black',
          active ? 'font-semibold' : 'font-regular'
        )}
      >
        {title}
      </UiText>
    </TouchableOpacity>
  );
}
