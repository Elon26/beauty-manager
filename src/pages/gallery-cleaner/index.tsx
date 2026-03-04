import { ModalStackParams } from '@/components/modals';
import { useModals } from '@/hooks/use-modals';
import { usePaywall } from '@/hooks/use-paywall';
import {
  deletePHAsset,
  startLookup,
  useBlurryPhotos,
  useLookupState,
  useSimilarPhotos,
  useSmartAlbum,
} from '@/modules/gallery-cleaner-kit/react';
import { Gallery, type GalleryConfig } from '@/modules/gallery/react';
import Tab from '@/types/tab';
import { Page } from '@/ui/page';
import { PageHeader } from '@/ui/page-header';
import { UiText } from '@/ui/ui-text';
import { scaleX } from '@kirz/nativewind-scale';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  AppState,
  Linking,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { GalleryTabs } from './components/gallery-tabs';
import SkeletonGrid from './components/skeleton';

type Props = {
  importedTab: Tab;
};

function GalleryCleanerContent({ importedTab }: Props) {
  const { t } = useTranslation();
  const { openModal, closeModal } = useModals();
  const { premiumAction } = usePaywall();
  const ref = useRef<Gallery>(null);
  const premiumActionRef = useRef(premiumAction);
  const [tab, setTab] = useState<Tab>(importedTab);
  const [selectMode, setSelectMode] = useState(false);
  const [allSelected, setAllSelected] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const lookupStartedRef = useRef(false);

  const selfies = useSmartAlbum('selfies');
  const live = useSmartAlbum('livePhotos');
  const screenshots = useSmartAlbum('screenshots');
  const similarGroups = useSimilarPhotos();
  const blurryIds = useBlurryPhotos();
  const lookupState = useLookupState(tab);

  const startAllLookups = () => {
    if (lookupStartedRef.current) return;
    lookupStartedRef.current = true;
    startLookup('similarPhotos');
    startLookup('blurryPhotos');
  };

  useEffect(() => {
    startAllLookups();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        startAllLookups();
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    premiumActionRef.current = premiumAction;
  }, [premiumAction]);

  const data = useMemo(() => {
    switch (tab) {
      case 'selfies':
        return selfies;
      case 'livePhotos':
        return live;
      case 'screenshots':
        return screenshots;
      case 'blurryPhotos':
        return blurryIds;
      case 'similarPhotos':
        return similarGroups;
      default:
        return [];
    }
  }, [tab, selfies, live, screenshots, blurryIds, similarGroups]);

  const dataLength = useMemo(() => {
    if (tab === 'similarPhotos') return similarGroups.length;
    return Array.isArray(data) ? data.length : 0;
  }, [tab, data, similarGroups.length]);

  const isLoading = lookupState !== 'done' && dataLength === 0;

  const clearSelectionState = async () => {
    setSelectedIds([]);
    setAllSelected(false);
    await ref.current?.clearSelection?.();
  };

  useEffect(() => {
    setSelectMode(false);
    void clearSelectionState();
  }, [tab]);

  useEffect(() => {
    ref.current?.setConfig?.({
      cellConfiguration: selectMode ? 'checkbox' : 'default',
      toggleSelectionOnTap: selectMode,
    });
    if (!selectMode) void clearSelectionState();
  }, [selectMode]);

  const onSelectionChange = (ids: string[]) => {
    if (!selectMode) return;
    setSelectedIds(ids);
    if (tab !== 'similarPhotos') {
      const total = Array.isArray(data) ? data.length : 0;
      setAllSelected(total > 0 && ids.length === total);
    } else {
      setAllSelected(ids.length > 0);
    }
  };

  const onHeaderButtonPress = async () => {
    if (!selectMode) {
      setSelectMode(true);
      return;
    }
    if (!allSelected) {
      await ref.current?.selectAll?.();
      return;
    }
    setSelectMode(false);
  };

  const headerButtonLabel = !selectMode
    ? t('cleaner.gallery-cleaner.cta.select')
    : !allSelected
      ? t('cleaner.gallery-cleaner.cta.select-all')
      : t('cleaner.gallery-cleaner.cta.cancel');

  const headerButtonClassName = allSelected ? 'color-red' : 'color-text';

  const onDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const ids = selectedIds.slice();
    openModal('CleaningModal');
    try {
      await deletePHAsset(ids);
      await clearSelectionState();
      setSelectMode(false);
      closeModal('CleaningModal');
      openModal('CleanerHappyModal', {
        children: (
          <UiText className="text-lg font-semibold text-primary">
            {ids.length}{' '}
            {t(
              ids.length === 1
                ? 'cleaner.gallery-cleaner.delete.file'
                : 'cleaner.gallery-cleaner.delete.files'
            )}
          </UiText>
        ),
      });
    } catch (e) {
      closeModal('CleaningModal');
      console.error('Error deleting media:', e);
    }
  };

  const { width } = useWindowDimensions();
  const columns = 3;
  const gap = 3;
  const horizontalInset = scaleX(20) * 2;
  const tileSize = (width - horizontalInset - gap * (columns - 1)) / columns;

  const baseConfig = useMemo(
    () => makeGalleryConfig(t, premiumActionRef, openModal, tab),
    [t, openModal, tab]
  );

  return (
    <Page noSafeArea>
      <PageHeader pageName={t('cleaner.gallery-cleaner.title')}>
        <TouchableOpacity
          className="items-end rounded-xl bg-[#FFFFFF70] w-17"
          onPress={onHeaderButtonPress}
        >
          <UiText className={headerButtonClassName}>{headerButtonLabel}</UiText>
        </TouchableOpacity>
      </PageHeader>
      <GalleryTabs
        tab={tab}
        setTab={setTab}
        onChange={() => {
          setSelectMode(false);
          void clearSelectionState();
        }}
      />
      <UiText className="text-center font-medium color-primary">
        {tab === 'selfies' &&
          t('cleaner.gallery-cleaner.count.items', {
            count: selfies.length,
          })}
        {tab === 'livePhotos' &&
          t('cleaner.gallery-cleaner.count.items', { count: live.length })}
        {tab === 'screenshots' &&
          t('cleaner.gallery-cleaner.count.items', {
            count: screenshots.length,
          })}
        {tab === 'blurryPhotos' &&
          t('cleaner.gallery-cleaner.count.items', { count: blurryIds.length })}
        {tab === 'similarPhotos' &&
          t('cleaner.gallery-cleaner.count.groups', {
            count: similarGroups.length,
          })}
      </UiText>
      <View className="flex-1">
        <LinearGradient
          colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: scaleX(8),
            zIndex: 10,
          }}
          pointerEvents="none"
        />
        <Gallery
          key={tab}
          ref={ref}
          className="flex-1 -mx-edge pb-40 pt-1"
          config={baseConfig}
          data={data}
          onSelectionChange={onSelectionChange}
        />
        {isLoading && (
          <View className="absolute items-center inset-0 pt-1">
            <SkeletonGrid tileSize={tileSize} gap={gap} count={15} />
          </View>
        )}
      </View>
      {selectMode && selectedIds.length > 0 && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: scaleX(32),
            zIndex: 50,
            elevation: 50,
          }}
        >
          <TouchableOpacity
            className="items-center justify-center rounded-full bg-red h-14"
            activeOpacity={0.9}
            onPress={premiumAction(onDeleteSelected)}
          >
            <UiText className="text-white">
              {t('cleaner.gallery-cleaner.delete.action')}{' '}
              <UiText className="text-white opacity-50">
                {t('cleaner.gallery-cleaner.delete.count', {
                  count: selectedIds.length,
                })}
              </UiText>
            </UiText>
          </TouchableOpacity>
        </View>
      )}
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.85)']}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: scaleX(100),
          zIndex: 10,
        }}
        pointerEvents="none"
      />
    </Page>
  );
}

export default function GalleryCleaner({ importedTab }: Props) {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  useEffect(() => {
    if (!permissionResponse) {
      void requestPermission();
      return;
    }
    if (permissionResponse.status === 'granted') return;
    if (permissionResponse.canAskAgain) {
      void requestPermission();
      return;
    }
    Alert.alert(
      'Allow access to photos',
      'Please allow access to your photo library to continue.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
  }, [permissionResponse]);

  if (permissionResponse?.status !== 'granted') {
    return null;
  }

  return <GalleryCleanerContent importedTab={importedTab} />;
}

const makeGalleryConfig = (
  t: (k: string, opts?: any) => string,
  premiumActionRef: React.RefObject<((cb: () => void) => () => void) | null>,
  openModal: <N extends keyof ModalStackParams>(
    modalName: N,
    params?: ModalStackParams[N],
    callback?: () => void
  ) => void,
  tab: Tab
): GalleryConfig => ({
  actions: [
    {
      attributes: ['destructive'],
      id: 'delete',
      state: 'on',
      symbol: 'trash',
      title: t('cleaner.gallery-cleaner.delete.action'),
      action: (evt) =>
        premiumActionRef.current?.(async () => {
          try {
            const id = (evt as any).id;
            await deletePHAsset([id]);
            openModal<'CleanerHappyModal'>('CleanerHappyModal', {
              children: (
                <UiText className="text-lg font-semibold text-primary">
                  1 {t('cleaner.gallery-cleaner.delete.file')}
                </UiText>
              ),
            });
          } catch (e) {
            console.error('Error deleting media:', e);
          }
        })(),
    },
  ],
  cellConfiguration: 'default',
  contentInset: { top: 0, bottom: 80, left: 0, right: 0 },
  gap: 3,
  itemCornerRadius: 11,
  layoutType: 'flow',
  numberOfColumns: 3,
  sectionBackgroundConfiguration: 'default',
  sectionFooterConfiguration: 'default',
  sectionFooterHeight: 0,
  sectionHeaderConfiguration: tab === 'similarPhotos' ? 'custom' : 'default',
  sectionHeaderHeight: 24,
  sectionInset: {
    top: 0,
    bottom: 0,
    left: scaleX(20),
    right: scaleX(20),
  },
  toggleSelectionOnTap: false,
});
