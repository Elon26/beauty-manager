import { useLocalSearchParams } from 'expo-router';

import GalleryCleaner from '@/pages/gallery-cleaner';
import Tab from '@/types/tab';

export default function GalleryCleanerScreen() {
  const { tab } = useLocalSearchParams<{
    tab: Tab;
  }>();

  return <GalleryCleaner importedTab={tab} />;
}
