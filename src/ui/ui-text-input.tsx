import * as Clipboard from 'expo-clipboard';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TextInput,
  type TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { twMerge } from 'tailwind-merge';

import CopyIcon from '@/svg/secret-folder/copy.svg';
import EyeCloseIcon from '@/svg/secret-folder/eye-close.svg';
import EyeIcon from '@/svg/secret-folder/eye-open.svg';

import { UiText } from './ui-text';

type InputProps = {
  label: string;
  inputSuffix?: string;
  inputPrefix?: string;
  showCopy?: boolean;
  copyValue?: string;
  isPassword?: boolean;
} & TextInputProps;

export function UiTextInput({
  label,
  placeholder,
  inputPrefix,
  inputSuffix,
  showCopy = true,
  copyValue,
  isPassword = false,
  className,
  value,
  editable = true,
  ...rest
}: InputProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!isPassword);

  const handleCopy = async () => {
    const textToCopy = copyValue || value?.toString() || '';
    if (textToCopy) {
      await Clipboard.setStringAsync(textToCopy);
      setCopied(true);
      impactAsync(ImpactFeedbackStyle.Light);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
    impactAsync(ImpactFeedbackStyle.Light);
  };

  return (
    <View className="w-full">
      <UiText className="text-sm font-medium text-gray mb-1.5">{label}</UiText>

      <View
        className={twMerge(
          'flex-row items-center rounded-full px-4 h-12',
          editable ? 'bg-[#F0F0F0]' : 'bg-gray-100/50'
        )}
      >
        {inputPrefix && (
          <UiText className="text-base text-gray mr-1.5">{inputPrefix}</UiText>
        )}
        <TextInput
          className={twMerge(
            'flex-1 text-base py-0',
            editable ? 'text-gray-900' : 'text-gray-500',
            'placeholder:text-gray-400',
            className
          )}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          editable={editable}
          secureTextEntry={isPassword && !isPasswordVisible}
          {...rest}
        />
        {inputSuffix && !showCopy && !isPassword && (
          <UiText className="text-gray ml-1.5">{inputSuffix}</UiText>
        )}
        {isPassword && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
            className="ml-1 p-1.5"
          >
            <UiText className="text-lg text-gray">
              {isPasswordVisible ? <EyeIcon /> : <EyeCloseIcon />}
            </UiText>
          </TouchableOpacity>
        )}
        {showCopy && (
          <TouchableOpacity
            onPress={handleCopy}
            activeOpacity={0.7}
            disabled={!value}
            className={twMerge('ml-1 p-1.5', !value && 'opacity-50')}
          >
            <View className="flex-row items-center">
              <UiText
                className={twMerge(
                  'text-sm',
                  'text-primary',
                  !value && 'text-grayDark'
                )}
              >
                {copied && value ? '✓' : <CopyIcon />}
              </UiText>
              {copied && value && (
                <UiText className="text-xs text-gray ml-1">
                  {t('pages.secret-folder.passwords.copied')}
                </UiText>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
