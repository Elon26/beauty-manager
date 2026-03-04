import { router } from 'expo-router';
import { useMemo } from 'react';

import GalleryOrganizerItemImage from '@/images/gallery-organizer-item.png';
import {
  useBlurryPhotos,
  useLookupState,
  useSimilarPhotos,
  useSmartAlbum,
} from '@/modules/gallery-cleaner-kit/react';
import GalleryIcon from '@/svg/gallery.svg';

import OtherLinkItem from './other-link-item';

export default function GalleryCleanerArea() {
  const selfies = useSmartAlbum('selfies');
  const live = useSmartAlbum('livePhotos');
  const screenshots = useSmartAlbum('screenshots');
  const blurry = useBlurryPhotos();
  const similarGroups = useSimilarPhotos();

  const quantity = useMemo(() => {
    const similarItems = similarGroups.reduce(
      (acc: number, g: any) => acc + (g.items?.length ?? g.assets?.length ?? 0),
      0
    );

    return (
      selfies.length +
      live.length +
      screenshots.length +
      blurry.length +
      similarItems
    );
  }, [selfies, live, screenshots, blurry, similarGroups]);

  const states = [
    useLookupState('selfies'),
    useLookupState('livePhotos'),
    useLookupState('screenshots'),
    useLookupState('blurryPhotos'),
    useLookupState('similarPhotos'),
  ];

  const isLoading = quantity === 0 && states.some((s) => s !== 'done');
  return (
    <OtherLinkItem
      Icon={GalleryIcon}
      quantity={quantity}
      isLoading={isLoading}
      title={t('pages.main.gallery-organizer')}
      handler={() =>
        router.navigate({
          pathname: '/gallery-cleaner',
          params: { tab: 'similarPhotos' },
        })
      }
      AdditionalImage={GalleryOrganizerItemImage}
    />
  );
}
