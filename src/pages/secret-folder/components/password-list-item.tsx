import type { ModalStackParams } from '@/components/modals';
import { colors } from '@/config/theme';
import CopyIcon from '@/svg/secret-folder/copy.svg';
import EyeCloseIcon from '@/svg/secret-folder/eye-close.svg';
import EyeIcon from '@/svg/secret-folder/eye-open.svg';
import TrashIcon from '@/svg/secret-folder/trash.svg';
import { Checkbox } from '@/ui/checkbox';
import { SfSymbol } from '@/ui/sf-symbol';
import { UiText } from '@/ui/ui-text';
import { scaleX } from '@kirz/nativewind-scale';
import * as Clipboard from 'expo-clipboard';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';
import { useModal } from 'react-native-modalfy';
import type { Password } from '../hooks/use-secret-passwords/types';

type PasswordListItemProps = {
  item: Password;
  selectionMode: boolean;
  selected: boolean;

  onSelect: (id: string, selected: boolean) => void;
  onDelete: (item: Password) => void;
};

export function PasswordListItem({
  item,
  selectionMode,
  selected,
  onSelect,
  onDelete,
}: PasswordListItemProps) {
  const { t } = useTranslation();
  const modal = useModal<ModalStackParams>();
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedLogin, setCopiedLogin] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const currentColor = calcRandomColor();

  const handleCopyPassword = async () => {
    if (item.password) {
      await Clipboard.setStringAsync(item.password);
      setCopiedPassword(true);
      impactAsync(ImpactFeedbackStyle.Light);
      setTimeout(() => setCopiedPassword(false), 1500);
    }
  };

  const handleCopyLogin = async () => {
    if (item.login) {
      await Clipboard.setStringAsync(item.login);
      setCopiedLogin(true);
      impactAsync(ImpactFeedbackStyle.Light);
      setTimeout(() => setCopiedLogin(false), 1500);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
    impactAsync(ImpactFeedbackStyle.Light);
  };

  function calcRandomColor() {
    return `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, '0')}`;
  }

  function getFirstLetter(str: string) {
    let handledStr = str;
    if (handledStr.startsWith('https'))
      handledStr = handledStr.replace('https://', '');
    if (handledStr.startsWith('http'))
      handledStr = handledStr.replace('http://', '');
    return handledStr[0].toUpperCase();
  }

  return (
    <View
      style={{
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      }}
      className="mx-[1] flex-row items-center rounded-2xl bg-[#F8F8F8] p-4"
    >
      <View className="flex-1 gap-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            {item.image ? (
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: scaleX(10),
                  borderRadius: scaleX(14),
                }}
              >
                <Image
                  style={{
                    width: scaleX(30),
                    height: scaleX(30),
                  }}
                  source={{ uri: item.image }}
                />
              </View>
            ) : (
              <View
                className="items-center justify-center rounded-xl size-12"
                style={{ backgroundColor: currentColor + '20' }}
              >
                <UiText
                  className="text-2xl font-bold"
                  style={{ color: currentColor }}
                >
                  {getFirstLetter(item.link)}
                </UiText>
              </View>
            )}
            <View className="gap-1">
              <UiText className="text-xl font-medium" numberOfLines={1}>
                {item.name
                  ? item.name.length > 10
                    ? item.name.slice(0, 10) + '…'
                    : item.name
                  : null}
              </UiText>
              <UiText className="text-xs text-grayDark" numberOfLines={1}>
                {item.link?.length > 23
                  ? `${item.link.slice(0, 23)}...`
                  : (item.link ?? '')}
              </UiText>
            </View>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => {
                if (!selectionMode) {
                  modal.openModal('SecretPasswordModal', { id: item.id });
                }
              }}
              activeOpacity={0.7}
              className="items-center justify-center rounded-full bg-[#229DFB]"
              style={{
                width: scaleX(40),
                height: scaleX(22),
              }}
              hitSlop={10}
            >
              <SfSymbol
                name="square.and.pencil"
                tintColor={colors.white.toString()}
                size={scaleX(12)}
                weight="semibold"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete(item)}
              activeOpacity={0.7}
              className="items-center justify-center rounded-full bg-red"
              style={{
                width: scaleX(40),
                height: scaleX(22),
              }}
              hitSlop={10}
            >
              <TrashIcon />
            </TouchableOpacity>

            {selectionMode && (
              <Checkbox
                checked={selected}
                onChange={(checked) => onSelect(item.id, checked)}
                className="rounded-full"
              />
            )}
          </View>
        </View>
        <View className="gap-2.5">
          <UiText className="text-sm font-medium text-gray">
            {t('pages.secret-folder.passwords.username')}
          </UiText>
          <View className="flex-row items-center rounded-full bg-[#F2F2F2] px-4 py-2 w-full">
            <UiText className="flex-1 text-xs color-gray" numberOfLines={1}>
              {item.login}
            </UiText>
            <TouchableOpacity
              onPress={handleCopyLogin}
              activeOpacity={0.7}
              className="ml-2 p-1"
              hitSlop={10}
              disabled={!item.login}
            >
              {copiedLogin ? (
                <View className="flex-row items-center">
                  <UiText className="text-xs text-primary mr-1">✓</UiText>
                  <UiText className="text-xs text-gray">
                    {t('pages.secret-folder.passwords.copied')}
                  </UiText>
                </View>
              ) : (
                <CopyIcon />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View className="gap-2.5">
          <UiText className="text-sm font-medium text-gray">
            {t('pages.secret-folder.passwords.password')}
          </UiText>
          <View className="flex-row items-center rounded-full bg-[#F2F2F2] px-4 py-2 w-full">
            <UiText className="flex-1 text-xs color-gray" numberOfLines={1}>
              {isPasswordVisible ? item.password : '••••••••'}
            </UiText>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                activeOpacity={0.7}
                className="p-1"
                hitSlop={10}
              >
                {isPasswordVisible ? (
                  <EyeIcon width={20} height={20} />
                ) : (
                  <EyeCloseIcon width={20} height={20} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCopyPassword}
                activeOpacity={0.7}
                className="p-1"
                hitSlop={10}
                disabled={!item.password}
              >
                {copiedPassword ? (
                  <View className="flex-row items-center">
                    <UiText className="text-xs text-primary mr-1">✓</UiText>
                    <UiText className="text-xs text-gray">
                      {t('pages.secret-folder.passwords.copied')}
                    </UiText>
                  </View>
                ) : (
                  <CopyIcon />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
