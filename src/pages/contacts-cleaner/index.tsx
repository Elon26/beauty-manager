import { useModals } from '@/hooks/use-modals';
import { usePaywall } from '@/hooks/use-paywall';
import { useSheetPrompt } from '@/hooks/use-sheet-prompt';
import {
  mergeContacts,
  useContactsSimilarByField,
} from '@/modules/contacts-kit/react';
import {
  type SimilarityField,
  SimilarityFields,
} from '@/modules/contacts-kit/react/constants';
import { ButtonPrimary } from '@/ui/button-primary';
import { Page } from '@/ui/page';

import { PageHeader } from '@/ui/page-header';
import { UiText } from '@/ui/ui-text';
import { scaleX } from '@kirz/nativewind-scale';
import { BlurView } from 'expo-blur';
import * as Contacts from 'expo-contacts';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActionSheetIOS,
  Alert,
  Linking,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import {
  ContactsGroupsSkeleton,
  SkeletonLine,
} from './components/contacts-skeleton';
import { GroupContactsListView } from './components/group-contacts-list-view';
import { TabButton } from './components/tab-button';
import { useSelectedContacts } from './hooks/use-selected-contacts';

const normalize = (s: string) =>
  (s ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const onlyDigits = (s: string) => (s ?? '').replace(/\D+/g, '');

function useContactsSearchIds(query: string) {
  const deferred = useDeferredValue(query);
  const [matched, setMatched] = useState<Set<string> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const q = normalize(deferred);
      const qDigits = onlyDigits(deferred);

      if (!q && !qDigits) {
        if (!cancelled) setMatched(null);
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        pageSize: 5000,
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.Emails,
          Contacts.Fields.PhoneNumbers,
        ],
      });

      const ids = new Set<string>();
      for (const c of data) {
        const name = normalize(`${c.name ?? ''}`);
        const emails = normalize(
          (c.emails ?? []).map((e) => e.email ?? '').join(' ')
        );
        const phonesJoined = (c.phoneNumbers ?? [])
          .map((p) => p.number ?? '')
          .join(' ');
        const phonesDigits = onlyDigits(phonesJoined);

        const nameHit = q && name.includes(q);
        const emailHit = q && emails.includes(q);
        const phoneHit = qDigits.length >= 2 && phonesDigits.includes(qDigits);

        if (nameHit || emailHit || phoneHit) ids.add(c.id as string);
      }

      if (!cancelled) setMatched(ids);
    };

    const t = setTimeout(run, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [deferred]);

  return matched;
}

export function ContactsCleaner() {
  const [permissionStatus, setPermissionStatus] =
    useState<Contacts.PermissionStatus | null>(null);
  const permissionAlertShown = useRef(false);
  const { t } = useTranslation();

  useEffect(() => {
    const checkPermission = async () => {
      const res = await Contacts.getPermissionsAsync();

      if (res.status === 'granted') {
        setPermissionStatus('granted' as Contacts.PermissionStatus);
        return;
      }

      if (res.canAskAgain) {
        const req = await Contacts.requestPermissionsAsync();
        setPermissionStatus(req.status as Contacts.PermissionStatus);
        return;
      }

      setPermissionStatus(res.status as Contacts.PermissionStatus);

      if (!permissionAlertShown.current) {
        permissionAlertShown.current = true;

        Alert.alert(
          'Allow access to contacts',
          'Please allow access to your contacts to continue.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
    };

    checkPermission();
  }, []);

  const { premiumAction } = usePaywall();
  const { openModal, closeModal } = useModals();

  const { folder } = useLocalSearchParams<{ folder?: string }>();
  const originSmartCleaner = Object.keys(SimilarityFields).includes(
    folder as SimilarityField
  );

  const initialTab = originSmartCleaner ? (folder as SimilarityField) : 'name';
  const [activeTab, setActiveTab] = useState<SimilarityField>(initialTab);
  const [internalActiveTab, setInternalActiveTab] =
    useState<SimilarityField>(initialTab);

  const [searchQuery, setSearchQuery] = useState('');
  const {
    idGroups: similarIds,
    status: similarStatus,
    refetch: refetchSimilar,
  } = useContactsSimilarByField(internalActiveTab);

  const searchMatchedIds = useContactsSearchIds(searchQuery);

  const filteredGroups = useMemo(() => {
    if (!searchMatchedIds) return similarIds;

    return similarIds
      .map((g) => g.filter((id) => searchMatchedIds.has(id)))
      .filter((g) => g.length > 1);
  }, [similarIds, searchMatchedIds]);

  const visibleIds = useMemo(() => filteredGroups.flat(), [filteredGroups]);

  const {
    selectedContacts,
    handleContactSelect,
    isContactSelected,
    selectAllContacts,
    deselectAllContacts,
    isAllSelected,
    setSelectedContacts,
    setSelectionMode,
  } = useSelectedContacts(visibleIds);

  const resultRef = useRef(0);

  const [sheetPromptDescription, setSheetPromptDescription] = useState('');
  const { prompt: promptMerge, SheetPromptComponent } = useSheetPrompt({
    description: sheetPromptDescription,
    actions: [
      {
        label: t('cleaner.contacts-organiser.merge-contacts.action'),
        value: true,
      },
    ],
  });

  const handleMerge = async (groups: string[][]) => {
    if (groups.length === 0) return;

    const total = groups.flat().length;
    const groupsCount = groups.length;

    setSheetPromptDescription(
      t('cleaner.contacts-organiser.merge-contacts.description', {
        total,
        groups: groupsCount,
      })
    );

    const doMerge = await promptMerge();
    if (!doMerge) return;

    openModal('CleaningModal');
    try {
      await mergeContacts(groups);
      deselectAllContacts();
      closeModal('CleaningModal');

      openModal('CleanerHappyModal', {
        children: (
          <UiText className="text-lg font-semibold text-primary">
            {t(
              resultRef.current === 1
                ? 'cleaner.contacts-organiser.merge-success.merged-contacts_one'
                : 'cleaner.contacts-organiser.merge-success.merged-contacts_other',
              { count: resultRef.current }
            )}
          </UiText>
        ),
      });
    } catch (error) {
      closeModal('CleaningModal');
      console.error('Error merging contacts:', error);
    }
  };

  const mergeGroup = premiumAction(() => {
    const mergeableGroups: string[][] = [];
    for (const group of similarIds) {
      const g = group.filter((id) => selectedContacts.has(id));
      if (g.length > 1) mergeableGroups.push(g);
    }
    if (mergeableGroups.length === 0) return;

    resultRef.current = mergeableGroups.flat().length - mergeableGroups.length;
    handleMerge(mergeableGroups);
  });

  const handleDeleteContacts = premiumAction(async () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [
          t('basic.cancel'),
          t('cleaner.contacts-organiser.delete-contacts.action', {
            count: selectedContacts.size,
          }),
        ],
        cancelButtonIndex: 0,
        destructiveButtonIndex: 1,
        title: t('cleaner.contacts-organiser.delete-contacts.title'),
        message: t('cleaner.contacts-organiser.delete-contacts.message', {
          count: selectedContacts.size,
        }),
      },
      async (buttonIndex) => {
        if (buttonIndex !== 1) return;

        try {
          const count = selectedContacts.size;

          await Promise.all(
            Array.from(selectedContacts).map(async (id) => {
              try {
                await Contacts.removeContactAsync(id);
              } catch (e) {
                console.warn(`Failed to remove contact ${id}:`, e);
              }
            })
          );

          deselectAllContacts();

          openModal('CleanerHappyModal', {
            children: (
              <UiText className="text-lg font-semibold text-primary">
                {t(
                  'cleaner.contacts-organiser.delete-contacts.message-success'
                )}
              </UiText>
            ),
          });
        } catch (error) {
          console.error('Error deleting contacts:', error);
        }
      }
    );
  });

  useEffect(() => {
    setSelectionMode(true);
    if (originSmartCleaner) return () => {};
    deselectAllContacts();
    return () => {
      setSelectionMode(false);
      deselectAllContacts();
    };
  }, [setSelectionMode, deselectAllContacts, originSmartCleaner]);

  const handleTabPress = (tab: SimilarityField) => {
    setActiveTab(tab);
    setSearchQuery('');
    setSelectedContacts(new Set<string>());
    setTimeout(() => setInternalActiveTab(tab), 10);
  };

  const groupBy: 'name' | 'phone' =
    internalActiveTab === 'phone' ? 'phone' : 'name';

  const totalContacts = useMemo(
    () => filteredGroups.reduce((acc, g) => acc + g.length, 0),
    [filteredGroups]
  );

  const selectedCount = selectedContacts.size;

  return (
    <Page noSafeArea>
      <PageHeader pageName={t('cleaner.contacts-organiser.title')}>
        <TouchableOpacity
          className="items-end rounded-xl bg-[#FFFFFF70] w-18"
          onPress={() =>
            isAllSelected ? deselectAllContacts() : selectAllContacts()
          }
        >
          <UiText className={`${isAllSelected ? 'color-red' : 'color-text'}`}>
            {isAllSelected
              ? t('basic.cancel')
              : t('cleaner.contacts-organiser.select-all')}
          </UiText>
        </TouchableOpacity>
      </PageHeader>

      <View className="flex-row flex-wrap items-center justify-between rounded-lg bg-[#7878801F] gap-2 p-0.5">
        <TabButton
          active={activeTab === 'phone'}
          onPress={() => handleTabPress('phone')}
          title={t('cleaner.contacts-organiser.tabs.duplicate-numbers')}
        />
        <TabButton
          active={activeTab === 'name'}
          onPress={() => handleTabPress('name')}
          title={t('cleaner.contacts-organiser.tabs.duplicate-contacts')}
        />
      </View>

      <View className="flex-row items-center justify-between pt-5">
        <View className="flex-row items-center">
          <UiText className="text-sm color-gray pl-2">
            {t('cleaner.contacts-organiser.total')}:{' '}
          </UiText>
          {similarStatus === 'loading' ? (
            <SkeletonLine wClass="w-20" hClass="h-3" />
          ) : (
            <Animated.View
              key={`${internalActiveTab}-${similarStatus}-${totalContacts}`}
              entering={FadeIn.duration(180)}
              exiting={FadeOut.duration(120)}
            >
              <UiText className="text-sm color-gray">
                {t('cleaner.contacts-organiser.items', {
                  count: totalContacts,
                })}
              </UiText>
            </Animated.View>
          )}
        </View>

        {similarStatus === 'loading' || totalContacts === 0 ? null : (
          <Animated.View
            key={selectedCount}
            entering={FadeIn.duration(160)}
            exiting={FadeOut.duration(120)}
          >
            <UiText className="text-sm color-gray pl-2">
              {t('cleaner.contacts-organiser.selected', {
                count: selectedCount,
              })}
            </UiText>
          </Animated.View>
        )}
      </View>

      {similarStatus === 'loading' ? (
        <ContactsGroupsSkeleton />
      ) : (
        <>
          <Animated.View
            key={internalActiveTab}
            className="flex-1"
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(500)}
          >
            <LinearGradient
              colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: scaleX(12),
                zIndex: 10,
              }}
              pointerEvents="none"
            />

            <GroupContactsListView
              data={filteredGroups}
              handleContactSelect={handleContactSelect}
              isContactSelected={isContactSelected}
              isRefreshing={similarStatus === 'idle'}
              refresh={refetchSimilar}
              groupBy={groupBy}
            />

            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: scaleX(103),
                zIndex: 20,
              }}
            >
              <BlurView intensity={12} tint="light" style={{ flex: 1 }} />
              <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.95)']}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              />
            </View>
          </Animated.View>

          <View
            style={{ zIndex: 30 }}
            className="absolute left-0 right-0 bottom-8"
          >
            <ButtonPrimary
              className="mb-5"
              label={
                selectedCount === 0
                  ? t('cleaner.contacts-organiser.cta.select-contacts')
                  : selectedCount === 1
                    ? t('cleaner.contacts-organiser.delete-contacts.action', {
                        count: 1,
                      })
                    : t('cleaner.contacts-organiser.cta.merge')
              }
              disabled={selectedCount === 0}
              onPress={() => {
                if (originSmartCleaner) {
                  router.back();
                  return;
                }

                if (selectedCount === 1) {
                  handleDeleteContacts();
                  return;
                }

                mergeGroup();
              }}
            />
          </View>
        </>
      )}
      <SheetPromptComponent />
    </Page>
  );
}
