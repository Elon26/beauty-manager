// eslint-disable-next-line simple-import-sort/imports
import { useAnalytics } from '@kirz/expo-toolkit';
import { scaleY } from '@kirz/nativewind-scale';
import { Suspense, useEffect, useState } from 'react';
import {
  Alert,
  InteractionManager,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { groupBy } from 'remeda';

import { EmptyList } from '@/components/empty-list';
import { Loader } from '@/components/scan-loader';
import {
  createOrImportPrivateContact,
  deletePrivateContacts,
  usePrivateCnContacts,
  usePrivateContactIds,
} from '@/modules/contacts-kit/react';
import { UiButton } from '@/ui/ui-button';
import { UiText } from '@/ui/ui-text';
import { Deferred } from '@/utils/deferred';

import GroupContactsListView from './group-contacts-list-view';
import { useSelectedContacts } from '@/pages/contacts-cleaner/hooks/use-selected-contacts';
import { useHasPremiumWithBackdoor } from '@/hooks/use-developer-purchases';
import { usePaywall } from '@/hooks/use-paywall';

const LIMIT = 3;

export default function ContactsFolder() {
  const { showPaywall } = usePaywall();
  const hasPremium = useHasPremiumWithBackdoor();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const { logEvent } = useAnalytics();
  const { ids, refetch, status } = usePrivateContactIds();
  const contacts = usePrivateCnContacts();

  const [zipped, setZipped] = useState<[string, string[]][]>([]);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      const groupedByAlphabet = groupBy(ids, (id) => {
        const { familyName, givenName } = contacts[id] ?? {};
        return (familyName ?? givenName ?? '#').charAt(0).toUpperCase();
      });

      const z = Object.entries(groupedByAlphabet).sort(([a], [b]) =>
        a.localeCompare(b)
      );
      setZipped(z);
      setLoading(false);
    });
  }, [contacts, ids]);

  const {
    selectedContacts,
    handleContactSelect,
    isContactSelected,
    setSelectedContacts,
  } = useSelectedContacts(ids);

  const handleAddContact = async () => {
    if (!hasPremium && ids.length >= 3) {
      showPaywall();
      return;
    }
    setLoading(true);
    const limit = hasPremium ? 9999999999 : LIMIT - ids.length;
    await createOrImportPrivateContact({ limit });
    logEvent('tap_add_to_secret_folder');
    setLoading(false);
  };

  const handleDeleteContacts = async () => {
    setLoading(true);
    try {
      await deletePrivateContacts(Array.from(selectedContacts), async () => {
        const d = new Deferred<boolean>();
        Alert.alert(
          'Are you sure you want to delete?',
          'This action is permanent. Deleted files can’t be restored.',
          [
            {
              text: 'Cancel',
              onPress: () => d.reject(),
              style: 'cancel',
            },
            {
              text: 'Delete',
              onPress: () => d.resolve(false),
              style: 'destructive',
            },
          ]
        );
        return await d.promise;
      });
      setSelectedContacts(new Set<string>());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      setSelectedContacts(new Set<string>());
    };
  }, [setSelectedContacts]);

  return (
    <View className="flex-1">
      {!ids.length && (
        <EmptyList icon>
          <View className="items-center gap-1">
            <UiText className="font-medium text-grayDark">
              {t('pages.secret-folder.passwords.empty-list.title')}
            </UiText>
            <UiText className="font-medium text-grayDark">
              {t('pages.secret-folder.passwords.empty-list.subtitle-contact')}
            </UiText>
          </View>
        </EmptyList>
      )}
      {ids.length > 0 && (
        <View className="flex-1">
          <Suspense fallback={<Loader />}>
            <Animated.View className="flex-1" entering={FadeIn}>
              <GroupContactsListView
                data={zipped.map((group) => group[1])}
                groupHeader={(_, index) => zipped[index][0]}
                handleContactSelect={handleContactSelect}
                isContactSelected={isContactSelected}
                isRefreshing={status === 'loading'}
                refresh={refetch}
                type="private-contacts"
              />
            </Animated.View>
          </Suspense>
        </View>
      )}
      <View
        className="absolute inset-x-2 bottom-0"
        style={{ paddingBottom: insets.bottom + scaleY(10) }}
      >
        {selectedContacts.size ? (
          <TouchableOpacity
            className="items-center justify-center overflow-hidden rounded-3xl bg-red h-12 w-full"
            disabled={selectedContacts.size === 0 || loading}
            onPress={handleDeleteContacts}
          >
            <UiText className="text-base font-semibold text-white">
              Delete {selectedContacts.size} Contact
              {selectedContacts.size === 1 ? '' : 's'}
            </UiText>
          </TouchableOpacity>
        ) : (
          <UiButton
            className="h-12 w-full"
            disabled={loading}
            loading={loading}
            onPress={handleAddContact}
          >
            <UiText className="text-base font-semibold text-white">
              {t('pages.secret-folder.contacts.add-contact')}
            </UiText>
          </UiButton>
        )}
      </View>
    </View>
  );
}
