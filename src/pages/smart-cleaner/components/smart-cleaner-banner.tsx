import { prettyBytes, useStorageUsage } from '@kirz/react-native-device-info';
import * as Contacts from 'expo-contacts'; // Добавить импорт
import { useMemo, useState } from 'react';
import { Alert, useWindowDimensions, View } from 'react-native';

import { useHasPremiumWithBackdoor } from '@/hooks/use-developer-purchases';
import { useModals } from '@/hooks/use-modals';
import { usePaywall } from '@/hooks/use-paywall';
import { useContactsSimilarByField } from '@/modules/contacts-kit/react';
import {
  deletePHAsset,
  useBlurryPhotos,
  useSimilarPhotos,
  useSmartAlbum,
} from '@/modules/gallery-cleaner-kit/react';
import BrushIcon from '@/svg/brush.svg';
import { UiButton } from '@/ui/ui-button';
import { UiText } from '@/ui/ui-text';
import { scaleX } from '@kirz/nativewind-scale';

export default function SmartCleanerBanner() {
  const { width } = useWindowDimensions();
  const hasPremium = useHasPremiumWithBackdoor();
  const { showPaywall } = usePaywall();
  const { openModal, closeModal } = useModals();
  const { used } = useStorageUsage();
  const [isDeleting, setIsDeleting] = useState(false);
  const [sizeNumber, sizeOrder] = prettyBytes(used).split(' ');

  const similarGroups = useSimilarPhotos();
  const blurryIds = useBlurryPhotos();
  const screenshots = useSmartAlbum('screenshots');
  const { idGroups: phoneGroups } = useContactsSimilarByField('phone');
  const { idGroups: nameGroups } = useContactsSimilarByField('name');

  const allIdsToDelete = useMemo(() => {
    const ids: string[] = [];

    similarGroups.forEach((group) => {
      group.assets.forEach((asset: any) => {
        if (typeof asset === 'string') ids.push(asset);
        else if (asset?.id) ids.push(asset.id);
      });
    });

    ids.push(...blurryIds);
    ids.push(...screenshots);

    return ids;
  }, [similarGroups, blurryIds, screenshots]);

  const allContactIdsToDelete = useMemo(() => {
    const ids: string[] = [];
    [...phoneGroups, ...nameGroups].forEach((group) => {
      ids.push(...group);
    });
    return ids;
  }, [phoneGroups, nameGroups]);

  const totalItems = allIdsToDelete.length + allContactIdsToDelete.length;
  const hasPhotos = allIdsToDelete.length > 0;
  const hasContacts = allContactIdsToDelete.length > 0;

  const handleDeleteAll = async () => {
    if (!hasPremium) {
      showPaywall();
      return;
    }

    if (totalItems === 0) {
      Alert.alert(
        t('pages.smart-cleaner.nothing-to-delete'),
        t('pages.smart-cleaner.no-items-found')
      );
      return;
    }

    let confirmMessage = '';
    if (hasPhotos && hasContacts) {
      confirmMessage = t('pages.smart-cleaner.confirm-delete-mixed', {
        photos: allIdsToDelete.length,
        contacts: allContactIdsToDelete.length,
      });
    } else if (hasPhotos) {
      confirmMessage = t('pages.smart-cleaner.confirm-delete-photos', {
        count: allIdsToDelete.length,
      });
    } else if (hasContacts) {
      confirmMessage = t('pages.smart-cleaner.confirm-delete-contacts', {
        count: allContactIdsToDelete.length,
      });
    }

    Alert.alert(t('pages.smart-cleaner.confirm-delete'), confirmMessage, [
      { text: t('basic.cancel'), style: 'cancel' },
      {
        text: t('basic.delete'),
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          openModal('CleaningModal');

          try {
            if (allIdsToDelete.length > 0) {
              await deletePHAsset(allIdsToDelete);
            }
            if (allContactIdsToDelete.length > 0) {
              await Promise.all(
                allContactIdsToDelete.map(async (contactId) => {
                  try {
                    await Contacts.removeContactAsync(contactId);
                  } catch (error) {
                    console.error('Error deleting contact:', error);
                  }
                })
              );
            }

            closeModal('CleaningModal');

            openModal('CleanerHappyModal', {
              children: (
                <UiText className="text-lg font-semibold text-primary">
                  {t('pages.smart-cleaner.delete-success', {
                    count: totalItems,
                  })}
                </UiText>
              ),
            });
          } catch (error) {
            console.error('Error deleting items:', error);
            closeModal('CleaningModal');
            Alert.alert(
              t('basic.error'),
              t('pages.smart-cleaner.delete-error')
            );
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  function handleStartSmartClean() {
    if (!hasPremium) {
      showPaywall();
      return;
    }
    handleDeleteAll();
  }

  return (
    <View>
      <View
        className="absolute flex-row overflow-hidden rounded-3xl gap-x-2 left-0 -bottom-2"
        style={{ width: width - scaleX(40) }}
      >
        <View className="w-[40%] bg-[#FE5C5E] h-20" />
        <View className="w-[10%] bg-[#DEB763] h-20" />
        <View className="w-[20%] bg-[#EC8BFF] h-20" />
        <View className="w-[40%] bg-[#8B94FF] h-20" />
      </View>

      <View className="rounded-3xl bg-grayLight gap-y-4 p-4">
        <View className="gap-y-2">
          <UiText className="text-center text-sm">
            {t('pages.main.your-system-is-loaded')}
          </UiText>
          <View className="flex-row items-end justify-center gap-x-1">
            <UiText className="text-lg font-semibold">{sizeNumber}</UiText>
            <UiText className="bottom-[1] text-sm text-grayDark">
              {sizeOrder}
            </UiText>
          </View>

          <UiButton
            className="flex-row gap-x-2.5 w-full"
            onPress={handleStartSmartClean}
            disabled={isDeleting}
          >
            <BrushIcon />
            <UiText className="font-medium text-white">
              {isDeleting
                ? t('pages.smart-cleaner.deleting')
                : t('pages.main.smart-clean-up')}
            </UiText>
          </UiButton>
        </View>

        <View className="flex-row flex-wrap justify-between gap-y-2">
          <View className="w-[50%] flex-row items-center gap-x-1">
            <View className="rounded-md bg-[#FE5C5E] size-4.5" />
            <UiText className="text-sm">
              {t('pages.smart-cleaner.duplicate-photos')}
            </UiText>
          </View>
          <View className="w-[50%] flex-row items-center gap-x-1">
            <View className="rounded-md bg-[#DEB763] size-4.5" />
            <UiText className="text-sm">
              {t('pages.smart-cleaner.duplicate-contacts')}
            </UiText>
          </View>
          <View className="w-[50%] flex-row items-center gap-x-1">
            <View className="rounded-md bg-[#EC8BFF] size-4.5" />
            <UiText className="text-sm">
              {t('pages.smart-cleaner.screenshots')}
            </UiText>
          </View>
          <View className="w-[50%] flex-row items-center gap-x-1">
            <View className="rounded-md bg-[#8B94FF] size-4.5" />
            <UiText className="text-sm">
              {t('pages.smart-cleaner.blurry-photos')}
            </UiText>
          </View>
        </View>
      </View>
    </View>
  );
}
