import { TouchableOpacity, View } from 'react-native';

import {
  presentContactViewer,
  useContact,
  usePrivateContact,
} from '@/modules/contacts-kit/react';
import PointIcon from '@/svg/contacts-cleaner/point.svg';
import { Checkbox } from '@/ui/checkbox';
import { UiText } from '@/ui/ui-text';

type ContactListItemProps = {
  id: string;
  isSelected?: boolean;
  handleSelect?: (id: string) => void;
  type?: 'address-book' | 'private-contacts';
  searchQuery?: string;
  groupBy?: 'name' | 'phone';
};

function norm(s?: string) {
  return (s ?? '').toLowerCase().trim();
}

function onlyDigits(s?: string) {
  return (s ?? '').replace(/\D+/g, '');
}

function extractPhones(contact: any): string[] {
  const raw = Array.isArray(contact?.phoneNumbers) ? contact.phoneNumbers : [];
  return raw
    .map((p: any) =>
      typeof p === 'string' ? p : (p?.value ?? p?.number ?? '')
    )
    .filter(Boolean);
}

function getTitleSubtitle(params: {
  displayName?: string;
  phonesLine: string;
  groupBy: 'name' | 'phone';
}) {
  const { displayName, phonesLine, groupBy } = params;

  const safeName = displayName?.trim() ? displayName : '—';
  const safePhones = phonesLine.trim() ? phonesLine : '—';

  const title = groupBy === 'phone' ? safePhones : safeName;
  const subtitle = groupBy === 'phone' ? safeName : safePhones;

  return { title, subtitle };
}

export function ContactListItem({
  id,
  isSelected,
  handleSelect,
  type = 'address-book',
  searchQuery = '',
  groupBy = 'name',
}: ContactListItemProps) {
  const contactAddress = useContact(id);
  const contactPrivate = usePrivateContact(id);

  const contact = type === 'address-book' ? contactAddress : contactPrivate;
  if (!contact) return null;

  const q = norm(searchQuery);
  const qd = onlyDigits(searchQuery);

  const nameNorm = norm(contact.displayName || '');
  const phones = extractPhones(contact);
  const phoneDigits = phones.map(onlyDigits);

  const textHit = q ? nameNorm.includes(q) : false;
  const phoneHit =
    qd.length >= 3 ? phoneDigits.some((p) => p.includes(qd)) : false;

  const matches = !q && !qd ? true : textHit || phoneHit;
  if (!matches) return null;

  const phonesLine = phones.join(', ');

  const { title, subtitle } = getTitleSubtitle({
    displayName: contact.displayName,
    phonesLine,
    groupBy,
  });

  return (
    <TouchableOpacity
      className="flex-row items-center pl-15 px-4 py-2"
      onPress={() => {
        presentContactViewer({
          appearance: 'light',
          ...(type === 'address-book' ? { contactId: id } : { privateId: id }),
        });
      }}
    >
      <View className="absolute left-7 bottom-6">
        <PointIcon />
      </View>

      <View className="flex-1 gap-1 pl-11">
        <UiText className="font-medium pr-2 w-full" numberOfLines={1}>
          {title}
        </UiText>

        <UiText
          className="text-xs font-medium text-gray w-full"
          numberOfLines={1}
        >
          {subtitle}
        </UiText>
      </View>

      <Checkbox checked={isSelected} onChange={() => handleSelect?.(id)} />
    </TouchableOpacity>
  );
}
