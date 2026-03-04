import LockIcon from '@/svg/lock.svg';
import { UiText } from '@/ui/ui-text';
import { TouchableOpacity } from 'react-native';
import { twMerge } from 'tailwind-merge';

type LockableButtonProps = {
  locked: boolean;
  onPress?: () => void;
  className?: string;
  inverted?: boolean;
  children?: string | JSX.Element;
};

export function LockableButton({
  locked,
  onPress,
  className,
  inverted,
  children,
}: LockableButtonProps) {
  return (
    <TouchableOpacity
      className={twMerge(
        'w-20 h-9 rounded-full justify-center items-center',
        inverted ? 'bg-white' : 'bg-primary',
        onPress === undefined ? 'pointer-events-none' : '',
        className
      )}
      onPress={onPress}
    >
      {locked ? (
        <LockIcon className={twMerge('w-5 h-5', inverted ? 'color-primary' : 'color-white')} />
      ) : typeof children === 'string' ? (
        <UiText className={twMerge('font-medium ', inverted ? 'text-primary' : 'text-white')}>
          {children}
        </UiText>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}
