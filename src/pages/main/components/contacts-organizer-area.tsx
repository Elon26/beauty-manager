import { router } from 'expo-router';
import { useMemo } from 'react';

import ContactOrganizerItemImage from '@/images/contact-organizer-item.png';
import { useContactsSimilarByField } from '@/modules/contacts-kit/react';
import PhoneIcon from '@/svg/phone.svg';

import OtherLinkItem from './other-link-item';

export default function ContactsOrganizerArea() {
  const { idGroups: phoneGroups, status: phoneStatus } =
    useContactsSimilarByField('phone');

  const { idGroups: nameGroups, status: nameStatus } =
    useContactsSimilarByField('name');

  const isLoading = phoneStatus === 'loading' || nameStatus === 'loading';

  const totalContacts = useMemo(() => {
    const phoneCount = phoneGroups.reduce((acc, g) => acc + g.length, 0);
    const nameCount = nameGroups.reduce((acc, g) => acc + g.length, 0);
    return phoneCount + nameCount;
  }, [phoneGroups, nameGroups]);
  return (
    <OtherLinkItem
      Icon={PhoneIcon}
      quantity={isLoading ? null : totalContacts > 0 ? totalContacts : null}
      isLoading={isLoading}
      title={t('pages.main.contacts-organizer')}
      handler={() => router.navigate('/contacts-cleaner')}
      AdditionalImage={ContactOrganizerItemImage}
    />
  );
}
