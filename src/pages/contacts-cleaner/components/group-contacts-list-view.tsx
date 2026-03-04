import { scaleY } from '@kirz/nativewind-scale';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';

import { Anagram } from '@/components/anagram';
import { EmptyList } from '@/components/empty-list';
import { useContact } from '@/modules/contacts-kit/react';
import { Checkbox } from '@/ui/checkbox';
import { UiText } from '@/ui/ui-text';

import { ContactListItem } from './contact-list-item';

type ContactListViewProps = {
  data: string[][];
  isContactSelected: (id: string) => boolean;
  handleContactSelect: (id: string) => void;
  refresh: () => void;
  isRefreshing: boolean;
  type?: 'address-book' | 'private-contacts';
  groupBy: 'name' | 'phone';
};

type ContactsGroupItemProps = {
  group: string[];
  isContactSelected: (id: string) => boolean;
  handleContactSelect: (id: string) => void;
  type: 'address-book' | 'private-contacts';
  groupBy: 'name' | 'phone';
};

export function GroupContactsListView({
  data,
  isContactSelected,
  handleContactSelect,
  refresh,
  isRefreshing,
  type = 'address-book',
  groupBy,
}: ContactListViewProps) {
  const { t } = useTranslation();

  return (
    <FlatList
      alwaysBounceVertical={false}
      className="flex-1 pt-3"
      contentContainerClassName="gap-3 min-h-full"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: scaleY(175) }}
      data={data}
      keyExtractor={(group) => group[0]}
      ListEmptyComponent={() => (
        <EmptyList text={t('cleaner.contacts-organiser.list.empty')} />
      )}
      onRefresh={refresh}
      refreshing={isRefreshing}
      renderItem={({ item }) => (
        <ContactsGroupItem
          group={item}
          isContactSelected={isContactSelected}
          handleContactSelect={handleContactSelect}
          type={type}
          groupBy={groupBy}
        />
      )}
    />
  );
}

function ContactsGroupItem({
  group,
  isContactSelected,
  handleContactSelect,
  type,
  groupBy,
}: ContactsGroupItemProps) {
  const { t } = useTranslation();
  const firstContact = useContact(group[0]);

  const headerLabel =
    groupBy === 'phone'
      ? (firstContact?.phoneNumbers?.[0]?.value ??
        t('cleaner.contacts-organiser.list.unknown-number'))
      : (firstContact?.displayName ??
        t('cleaner.contacts-organiser.list.unnamed-contact'));

  const headerSubtitle =
    groupBy === 'phone'
      ? t('cleaner.contacts-organiser.list.phone-number')
      : t('cleaner.contacts-organiser.list.contact-name');

  const selectedCount = group.reduce(
    (acc, id) => acc + (isContactSelected(id) ? 1 : 0),
    0
  );

  const groupChecked: boolean | 'mix' =
    selectedCount === 0 ? false : selectedCount === group.length ? true : 'mix';

  const toggleGroup = () => {
    const shouldSelectAll = groupChecked !== true;
    for (const id of group) {
      const isSelected = isContactSelected(id);
      if (shouldSelectAll && !isSelected) handleContactSelect(id);
      if (!shouldSelectAll && isSelected) handleContactSelect(id);
    }
  };

  return (
    <View className="rounded-2xl bg-[#F8F8F8]">
      <View className="z-10 flex-row items-center rounded-2xl bg-[#F8F8F8] gap-3 pl-2 pr-4 mb-2 pt-2">
        {firstContact ? (
          <Anagram contact={firstContact} />
        ) : (
          <View className="rounded-full bg-primary opacity-40 size-10" />
        )}

        <View className="flex-1">
          <UiText className="font-medium">{headerLabel}</UiText>
        </View>
        <Checkbox checked={groupChecked} onChange={toggleGroup} />
      </View>

      {group.map((id) => (
        <ContactRowWithData
          key={id}
          id={id}
          type={type}
          isSelected={isContactSelected(id)}
          onSelect={handleContactSelect}
          groupBy={groupBy}
        />
      ))}
    </View>
  );
}

function ContactRowWithData({
  id,
  type,
  isSelected,
  onSelect,
  groupBy,
}: {
  id: string;
  type: 'address-book' | 'private-contacts';
  isSelected: boolean;
  onSelect: (id: string) => void;
  groupBy: 'name' | 'phone';
}) {
  useContact(id);

  return (
    <ContactListItem
      id={id}
      type={type}
      isSelected={isSelected}
      handleSelect={onSelect}
      groupBy={groupBy}
    />
  );
}

export default GroupContactsListView;
