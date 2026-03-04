import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import BlurryIcon from '@/svg/gallery-cleaner/blurry.svg';
import BlurryActiveIcon from '@/svg/gallery-cleaner/blurry-gradient.svg';
import LiveIcon from '@/svg/gallery-cleaner/live-photos.svg';
import LiveActiveIcon from '@/svg/gallery-cleaner/live-photos-gradient.svg';
import ScreenshotsIcon from '@/svg/gallery-cleaner/screenshots.svg';
import ScreenshotsActiveIcon from '@/svg/gallery-cleaner/screenshots-gradient.svg';
import SelfiesIcon from '@/svg/gallery-cleaner/selfies.svg';
import SelfiesActiveIcon from '@/svg/gallery-cleaner/selfies-gradient.svg';
import SimilarIcon from '@/svg/gallery-cleaner/similar.svg';
import SimilarActiveIcon from '@/svg/gallery-cleaner/similar-gradient.svg';
import { Pressable } from '@/ui/pressable';
import { UiText } from '@/ui/ui-text';

type Tab =
  | 'selfies'
  | 'livePhotos'
  | 'screenshots'
  | 'similarPhotos'
  | 'blurryPhotos';

const TABS: {
  key: Tab;
  titleKey: string;
  icon: any;
  iconActive: any;
}[] = [
  {
    key: 'similarPhotos',
    titleKey: 'cleaner.gallery-cleaner.tabs.similar',
    icon: SimilarIcon,
    iconActive: SimilarActiveIcon,
  },
  {
    key: 'blurryPhotos',
    titleKey: 'cleaner.gallery-cleaner.tabs.blurry',
    icon: BlurryIcon,
    iconActive: BlurryActiveIcon,
  },
  {
    key: 'selfies',
    titleKey: 'cleaner.gallery-cleaner.tabs.selfies',
    icon: SelfiesIcon,
    iconActive: SelfiesActiveIcon,
  },
  {
    key: 'screenshots',
    titleKey: 'cleaner.gallery-cleaner.tabs.screenshots',
    icon: ScreenshotsIcon,
    iconActive: ScreenshotsActiveIcon,
  },
  {
    key: 'livePhotos',
    titleKey: 'cleaner.gallery-cleaner.tabs.live-photos',
    icon: LiveIcon,
    iconActive: LiveActiveIcon,
  },
];

export function GalleryTabs({
  tab,
  setTab,
  onChange,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  onChange?: (t: Tab) => void;
}) {
  const { t } = useTranslation();

  return (
    <View className="pb-4">
      <View className="flex-row flex-wrap gap-2">
        {TABS.map((item) => {
          const active = tab === item.key;
          const Icon = active ? item.iconActive : item.icon;

          return (
            <Pressable
              key={item.key}
              className={twMerge(
                'flex-row items-center justify-center rounded-xl border border-[#EEEEEE] bg-[#EEEEEE] gap-2 px-3 py-2.5',
                active ? 'border-primary' : 'border-[#EEEEEE]'
              )}
              onPress={() => {
                setTab(item.key);
                onChange?.(item.key);
              }}
            >
              <Icon width={18} height={18} />

              <UiText
                className="text-[15px] font-medium text-black"
                numberOfLines={1}
              >
                {t(item.titleKey)}
              </UiText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
