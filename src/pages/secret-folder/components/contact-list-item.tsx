import { Image } from 'expo-image';
import { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { colors } from '@/config/theme';
import {
  presentContactViewer,
  presentPrivateContactEditor,
  useContact,
  usePrivateContact,
} from '@/modules/contacts-kit/react';
import { Checkbox } from '@/ui/checkbox';
import { SfSymbol } from '@/ui/sf-symbol';
import { UiText } from '@/ui/ui-text';

type ContactListItemProps = {
  id: string;
  isSelected?: boolean;
  handleSelect?: (id: string) => void;
  selectionMode?: boolean;
  type?: 'address-book' | 'private-contacts';
  className?: string;
};

export const ContactListItem = memo(function ContactListItem({
  id,
  isSelected,
  handleSelect,
  selectionMode = true,
  type = 'address-book',
  className,
}: ContactListItemProps) {
  const useContactHook =
    type === 'address-book' ? useContact : usePrivateContact;
  const contact = useContactHook(id);

  if (!contact) return null;

  return (
    <TouchableOpacity
      className={twMerge('flex-row items-center gap-3 px-4 py-2.5', className)}
      onPress={() => {
        if (type === 'address-book') {
          presentContactViewer({
            contactId: id,
            appearance: 'dark',
          });
        } else {
          presentContactViewer({
            privateId: id,
            appearance: 'dark',
          });
        }
      }}
    >
      {contact.imageDataAvailable && contact.image?.thumbnail ? (
        <Image
          className="rounded-full size-8"
          source={{ uri: contact.image.thumbnail }}
        />
      ) : (
        <View className="items-center justify-center size-8">
          <SfSymbol
            className="size-9"
            colors={['#ffffff', '#B9B9B9']}
            name="person.crop.circle.fill"
            type="palette"
          />
        </View>
      )}
      <View className="flex-1 gap-1">
        <UiText className="font-medium w-full" numberOfLines={1}>
          {contact.displayName || '--'}
        </UiText>
        <UiText className="text-xs text-grayDark w-full" numberOfLines={1}>
          {contact.phoneNumbers?.map((n) => n.value).join(', ') || '--'}
        </UiText>
      </View>
      {type === 'private-contacts' && (
        <TouchableOpacity
          className="p-1"
          onPress={() => {
            if (type === 'private-contacts') {
              presentPrivateContactEditor({
                contactId: id,
                appearance: 'dark',
              });
            }
          }}
        >
          <SfSymbol
            className="-top-[2px] size-6"
            name="square.and.pencil"
            tintColor={colors.primary.toString()}
          />
        </TouchableOpacity>
      )}
      {selectionMode ? (
        <Checkbox
          checked={isSelected}
          onChange={() => handleSelect?.(id)}
          isAltView
        />
      ) : null}
    </TouchableOpacity>
  );
});
