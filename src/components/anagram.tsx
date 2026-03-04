import { useState } from 'react';
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import type { RContact } from '@/modules/contacts-kit/react/types';
import { UiText } from '@/ui/ui-text';

type AnagramProps = {
  contact: RContact;
  className?: string;
};

export function Anagram({ contact, className }: AnagramProps) {
  const hasFirstAndLastName = contact.givenName && contact.familyName;
  const hasTwoWords = contact.givenName?.split(' ').length === 2;
  const hasFirstName = contact.givenName;

  const anagram = hasFirstAndLastName
    ? `${contact.givenName?.[0]}${contact.familyName?.[0]}`
    : hasTwoWords
      ? `${contact.givenName?.split(' ')[0][0]}${contact.givenName?.split(' ')[1][0]}`
      : `${(hasFirstName ?? 'U')[0]}`;

  const [fontSize, setFontSize] = useState(0);

  return (
    <View
      className={twMerge(
        'items-center justify-center rounded-full bg-primary size-10',
        className
      )}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setFontSize(width * 0.4);
      }}
    >
      <UiText
        className="text-center font-semibold uppercase text-white"
        numberOfLines={1}
        style={{ fontSize }}
      >
        {anagram}
      </UiText>
    </View>
  );
}
