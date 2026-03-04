import * as Contacts from 'expo-contacts';
import * as MediaLibrary from 'expo-media-library';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import ContactOrganizerItemImage from '@/images/contact-organizer-item.png';
import GalleryOrganizerItemImage from '@/images/gallery-organizer-item.png';
import { useSecretPasswords } from '@/pages/secret-folder/hooks/use-secret-passwords';
import GalleryIcon from '@/svg/gallery.svg';
import InfoIcon from '@/svg/info.svg';
import LockIcon from '@/svg/lock.svg';
import PhoneIcon from '@/svg/phone.svg';
import SettingsIcon from '@/svg/settings.svg';
import WiFiIcon from '@/svg/wi-fi.svg';

import ContactsOrganizerArea from './contacts-organizer-area';
import GalleryCleanerArea from './gallery-cleaner-area';
import OtherLinkItem from './other-link-item';

export default function OtherLinksArea() {
  const { passwords } = useSecretPasswords();
  const [contactsPerm, setContactsPerm] = useState<
    'unknown' | 'granted' | 'denied'
  >('unknown');

  const [galleryPerm, setGalleryPerm] = useState<
    'unknown' | 'granted' | 'denied'
  >('unknown');

  useFocusEffect(
    useCallback(() => {
      Contacts.getPermissionsAsync().then((p) => {
        setContactsPerm(p.status === 'granted' ? 'granted' : 'denied');
      });
      MediaLibrary.getPermissionsAsync().then((p) => {
        setGalleryPerm(p.status === 'granted' ? 'granted' : 'denied');
      });
    }, [])
  );

  return (
    <View className="flex-row flex-wrap -m-1">
      {contactsPerm === 'granted' ? (
        <ContactsOrganizerArea />
      ) : (
        <OtherLinkItem
          locked
          Icon={PhoneIcon}
          quantity={null}
          title={t('pages.main.contacts-organizer')}
          handler={() => router.navigate('/contacts-cleaner')}
          AdditionalImage={ContactOrganizerItemImage}
        />
      )}
      {galleryPerm === 'granted' ? (
        <GalleryCleanerArea />
      ) : (
        <OtherLinkItem
          locked
          Icon={GalleryIcon}
          quantity={null}
          title={t('pages.main.gallery-organizer')}
          handler={() =>
            router.navigate({
              pathname: '/gallery-cleaner',
              params: { tab: 'similarPhotos' },
            })
          }
          AdditionalImage={GalleryOrganizerItemImage}
        />
      )}
      <OtherLinkItem
        Icon={LockIcon}
        quantity={passwords?.length ?? 0}
        title={t('pages.main.my-passwords')}
        handler={() => router.navigate('/secret-folder/passwords')}
        AdditionalImage={null}
      />
      <OtherLinkItem
        Icon={WiFiIcon}
        quantity={null}
        title={t('pages.main.speed-test')}
        handler={() => router.navigate('/speed-test')}
        AdditionalImage={null}
      />
      <OtherLinkItem
        Icon={InfoIcon}
        quantity={null}
        title={t('pages.main.system-info')}
        handler={() => router.navigate('/system-info')}
        AdditionalImage={null}
      />
      <OtherLinkItem
        Icon={SettingsIcon}
        quantity={null}
        title={t('pages.main.settings')}
        handler={() => router.navigate('/settings')}
        AdditionalImage={null}
      />
    </View>
  );
}
