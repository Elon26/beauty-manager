import { scaleY } from '@kirz/nativewind-scale';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, View } from 'react-native';

import { EmptyList } from '@/components/empty-list';
import { useHasPremiumWithBackdoor } from '@/hooks/use-developer-purchases';
import { usePaywall } from '@/hooks/use-paywall';
import { useStorage } from '@/hooks/use-storage';
import { ButtonPrimary } from '@/ui/button-primary';
import { Page } from '@/ui/page';
import { PageHeader } from '@/ui/page-header';
import { UiText } from '@/ui/ui-text';
import { uuid } from '@/utils/uuid';

import { PasswordListItem } from '../components/password-list-item';
import {
  deletePassword,
  useSecretPasswords,
} from '../hooks/use-secret-passwords';
import type { Password } from '../hooks/use-secret-passwords/types';
import { usePinSettings } from 'expo-with-pincode';
import { useModals } from '@/hooks/use-modals';

const FREE_LIMIT = 3;

export function SecretPasswordsPage() {
  const [isProtectSecretFolderModalNeedToShow] = useStorage(
    'isProtectSecretFolderModalNeedToShow'
  );
  const { openModal, closeModal } = useModals();
  const { isPincodeSet } = usePinSettings();
  const { passwords, autofillEnabled } = useSecretPasswords();
  const hasPremium = useHasPremiumWithBackdoor();
  const { showPaywall } = usePaywall();

  const [autofillGuideShown, setAutofillGuideShown] =
    useStorage('autofillGuideShown');

  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Password[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!isPincodeSet && isProtectSecretFolderModalNeedToShow) {
        openModal('ProtectSecretFolderModal', {
          handleAdd: () => {
            router.navigate('/set-pin');
            closeModal('ProtectSecretFolderModal');
          },
          close: () => {
            closeModal('ProtectSecretFolderModal');
          },
        });
      }
    }, [isPincodeSet])
  );

  const handleDelete = () => {
    Alert.alert(
      t('pages.secret-folder.passwords.delete-multiple.title'),
      t('pages.secret-folder.passwords.delete-multiple.description'),
      [
        { text: t('basic.cancel'), style: 'cancel' },
        {
          text: t('basic.delete'),
          style: 'destructive',
          onPress: () => {
            selected.forEach(deletePassword);
            setSelected([]);
            setSelectionMode(false);
          },
        },
      ]
    );
  };

  const handleAddNew = () => {
    if (!hasPremium && FREE_LIMIT <= (passwords?.length ?? 0)) {
      showPaywall();
      return;
    }
    if (autofillEnabled === false && !autofillGuideShown) {
      setAutofillGuideShown(true);
      router.navigate('/secret-folder/enable-autofill');
    } else {
      openModal('SecretPasswordModal');
    }
  };

  const isSelected = (id: string) => selected.some((p) => p.id === id);

  const handleSelect = (item: Password, checked: boolean) => {
    setSelected((prev) => {
      if (checked) {
        return prev.some((p) => p.id === item.id) ? prev : [...prev, item];
      }
      return prev.filter((p) => p.id !== item.id);
    });
  };

  const handleDeleteOne = (item: Password) => {
    Alert.alert(
      t('pages.secret-folder.passwords.delete-single.title'),
      t('pages.secret-folder.passwords.delete-single.description'),
      [
        { text: t('basic.cancel'), style: 'cancel' },
        {
          text: t('basic.delete'),
          style: 'destructive',
          onPress: () => {
            deletePassword(item);
            setSelected((prev) => prev.filter((p) => p.id !== item.id));
          },
        },
      ]
    );
  };

  return (
    <Page noSafeArea className="bg-[#F8F8F8]">
      <PageHeader pageName={t('pages.secret-folder.passwords.page-name')} />

      {!passwords?.length ? (
        <EmptyList icon>
          <View className="items-center gap-1">
            <UiText className="font-medium text-grayDark">
              {t('pages.secret-folder.passwords.empty-list.title')}
            </UiText>
            <UiText className="font-medium text-grayDark">
              {t('pages.secret-folder.passwords.empty-list.subtitle')}
            </UiText>
          </View>
        </EmptyList>
      ) : (
        <FlatList
          data={passwords}
          keyExtractor={(item) => item.id ?? uuid()}
          contentContainerStyle={{
            paddingTop: scaleY(5),
            paddingBottom: scaleY(120),
          }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={({ item }) => (
            <PasswordListItem
              item={item}
              selectionMode={selectionMode}
              selected={isSelected(item.id)}
              onSelect={(id, checked) => handleSelect(item, checked)}
              onDelete={handleDeleteOne}
            />
          )}
        />
      )}

      <View className="absolute inset-x-0 bottom-0 pb-10 pt-6">
        {selectionMode ? (
          <ButtonPrimary
            className="flex-1 h-12"
            disabled={selected.length === 0}
            label={t('basic.delete')}
            onPress={handleDelete}
            style={{
              shadowColor: '#FF4D4F',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
            }}
          />
        ) : (
          <ButtonPrimary
            className="flex-1 h-12"
            label={
              passwords?.length
                ? t('pages.secret-folder.passwords.generate-new')
                : t('pages.secret-folder.passwords.add-password')
            }
            onPress={handleAddNew}
            style={{
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
            }}
          />
        )}
      </View>
    </Page>
  );
}
