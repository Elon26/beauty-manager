import { scaleY } from '@kirz/nativewind-scale';
import { FlatList, Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { EmptyList } from '@/components/empty-list';
import { Loader } from '@/components/scan-loader';
import { useLayoutInsets } from '@/hooks/use-layout-insets';
import { Separator } from '@/ui/separator';
import { UiText } from '@/ui/ui-text';

import { ContactListItem } from './contact-list-item';

type ContactListViewProps = {
  data: string[][];
  isContactSelected: (id: string) => boolean;
  handleContactSelect: (id: string) => void;
  refresh: () => void;
  isRefreshing: boolean;
  groupHeader: (group: string[], index: number) => string;
  type?: 'address-book' | 'private-contacts';
};

export function GroupContactsListView({
  data,
  isContactSelected,
  handleContactSelect,
  refresh,
  isRefreshing,
  groupHeader,
  type = 'address-book',
}: ContactListViewProps) {
  const insets = useLayoutInsets();
  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      alwaysBounceVertical={false}
      className="flex-1"
      contentContainerClassName="gap-3 min-h-full"
      contentContainerStyle={{
        paddingBottom: insets.bottom + scaleY(10) + scaleY(64),
        paddingTop: insets.top + scaleY(10),
      }}
      data={data}
      keyExtractor={(group) => group[0]}
      ListEmptyComponent={() =>
        isRefreshing ? <Loader /> : <EmptyList text={t('basic.nothing-here')} />
      }
      onRefresh={refresh}
      progressViewOffset={insets.top}
      refreshing={isRefreshing && data.length !== 0}
      renderItem={({ item, index }) => (
        <ContactsGroupItem
          group={item}
          groupHeader={groupHeader}
          handleContactSelect={handleContactSelect}
          index={index}
          isContactSelected={isContactSelected}
          type={type}
        />
      )}
    />
  );
}

type ContactsGroupItemProps = {
  group: string[];
  index: number;
  groupHeader: (group: string[], index: number) => string;
  isContactSelected: (id: string) => boolean;
  handleContactSelect: (id: string) => void;
  type: 'address-book' | 'private-contacts';
};

function ContactsGroupItem({
  group,
  index,
  groupHeader,
  isContactSelected,
  handleContactSelect,
  type,
}: ContactsGroupItemProps) {
  const allSelected = group.every((id) => isContactSelected(id));

  const toggleSelectAll = () => {
    if (allSelected) {
      for (const id of group) {
        if (isContactSelected(id)) handleContactSelect(id);
      }
    } else {
      for (const id of group) {
        if (!isContactSelected(id)) handleContactSelect(id);
      }
    }
  };

  return (
    <View className="overflow-hidden rounded-2xl border border-white/5 bg-white">
      <View className="flex-row items-center justify-between p-4">
        <UiText className="font-medium">{groupHeader(group, index)}</UiText>
        <Pressable onPress={toggleSelectAll}>
          <UiText
            className={twMerge(
              'text-sm font-medium',
              allSelected ? 'color-red' : 'color-primary'
            )}
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </UiText>
        </Pressable>
      </View>

      <Separator />

      <View>
        {group.map((contactId) => (
          <View key={contactId}>
            <View className="h-[1] bg-white/5" />
            <ContactListItem
              handleSelect={handleContactSelect}
              id={contactId}
              isSelected={isContactSelected(contactId)}
              selectionMode
              type={type}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
export default GroupContactsListView;
