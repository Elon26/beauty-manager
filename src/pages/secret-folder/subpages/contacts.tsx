import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { usePrivateContactIds } from '@/modules/contacts-kit/react';
import { useSelectedContacts } from '@/pages/contacts-cleaner/hooks/use-selected-contacts';
import { Page } from '@/ui/page';
import { PageHeader } from '@/ui/page-header';
import { Pressable } from '@/ui/pressable';
import { UiText } from '@/ui/ui-text';

import ContactsFolder from '../components/contacts-folder';

export function SecretContactsPage() {
  const { ids: contactIds } = usePrivateContactIds();

  const {
    selectAllContacts,
    deselectAllContacts,
    isAllSelected: isAllContactsSelected,
  } = useSelectedContacts(contactIds);

  return (
    <Page>
      <PageHeader pageName={t('pages.secret-folder.main.secret-contacts')}>
        {contactIds.length === 0 ? (
          <View className="size-10" />
        ) : (
          <Pressable
            className="items-end justify-center size-10"
            onPress={() => {
              if (isAllContactsSelected) {
                deselectAllContacts();
              } else {
                selectAllContacts();
              }
            }}
          >
            <UiText
              className={twMerge(
                'text-sm font-medium -ml-12',
                isAllContactsSelected ? 'text-red' : 'text-primary'
              )}
            >
              {isAllContactsSelected ? 'Deselect all' : 'Select all'}
            </UiText>
          </Pressable>
        )}
      </PageHeader>

      <View className="flex-1">
        <ContactsFolder />
      </View>
    </Page>
  );
}
