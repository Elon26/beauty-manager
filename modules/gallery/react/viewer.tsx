import { colors } from '@/config/theme';
import { useModals } from '@/hooks/use-modals';
import { usePaywall } from '@/hooks/use-paywall';
import { deletePHAsset } from '@/modules/gallery-cleaner-kit/react';
import ShareIcon from '@/svg/share.svg';
import { Pressable } from '@/ui/pressable';
import { SfSymbol } from '@/ui/sf-symbol';
import { UiText } from '@/ui/ui-text';
import { usePromise } from '@/utils/use-promise';
import { scaleX, scaleY } from '@kirz/nativewind-scale';
import { Image } from 'expo-image';
import { getAssetInfoAsync } from 'expo-media-library';
import { shareAsync } from 'expo-sharing';
import {
  type ComponentType,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { Gallery } from '.';
import type { GalleryTapItem, IndexPath } from '../src/Gallery.types';

export type GalleryViewerModalContentProps = {
  item: GalleryTapItem;
  dismiss: (indexPath: IndexPath) => void;
};

export type GalleryViewerModalContent =
  ComponentType<GalleryViewerModalContentProps>;

export type GalleryViewerModal = {
  present: (item: GalleryTapItem) => void;
  dismiss: (indexPath: IndexPath) => void;
};

export type GalleryViewerModalProps = {
  ref: React.RefObject<GalleryViewerModal | null>;
  content: GalleryViewerModalContent;
  galleryRef: React.RefObject<Gallery | null>;
};

export function GalleryViewerModal({
  ref,
  content: Content,
  galleryRef,
}: GalleryViewerModalProps) {
  const [visible, setVisible] = useState(false);
  const [item, setItem] = useState<GalleryTapItem | null>(null);

  useImperativeHandle(ref, () => ({
    present: (item: GalleryTapItem) => {
      setItem(item);
      setVisible(true);
    },
    dismiss: (indexPath: IndexPath) => {
      galleryRef.current?.scrollTo(indexPath.section, indexPath.item);
      setVisible(false);
    },
  }));

  if (!item) return null;

  return (
    <Modal
      animationType="fade"
      presentationStyle="fullScreen"
      transparent={false}
      visible={visible}
      statusBarTranslucent={false}
      onRequestClose={() =>
        ref.current?.dismiss({
          section: item.indexPath.section,
          item: item.indexPath.item,
        })
      }
    >
      <View style={styles.container}>
        <Content
          dismiss={(indexPath: IndexPath) => ref.current?.dismiss(indexPath)}
          item={item}
        />
      </View>
    </Modal>
  );
}

const SPRING = { damping: 32, stiffness: 320, mass: 0.9 };

export function DefaultGalleryViewerModalContent({
  dismiss,
  item,
}: GalleryViewerModalContentProps) {
  const { width: W } = useWindowDimensions();
  const { premiumAction } = usePaywall();
  const { openModal, closeModal } = useModals();
  const { t } = useTranslation();

  const section = item.section?.length ? item.section : [item.id];
  const initialIndex = (() => {
    const i = section.indexOf(item.id);
    return i !== -1 ? i : item.indexPath.item;
  })();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [deleting, setDeleting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const listRef = useRef<FlatList>(null);

  const currSrc = section[currentIndex];

  const assetPromise = useMemo(
    () => getAssetInfoAsync(currSrc?.replace('ph://', '') ?? ''),
    [currSrc]
  );
  const asset = usePromise(assetPromise);

  const displayName = asset?.filename || 'Photo';

  const offsetY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .activeOffsetY([10, -10])
    .failOffsetX([-10, 10])
    .onUpdate((e) => {
      if (e.translationY < 0) return;
      offsetY.value = e.translationY;
      opacity.value = interpolate(e.translationY, [0, 200], [1, 0], 'clamp');
    })
    .onEnd((e) => {
      if (e.translationY > 80 || e.velocityY > 500) {
        runOnJS(dismiss)({
          section: item.indexPath.section,
          item: currentIndex,
        });
      } else {
        offsetY.value = withSpring(0, SPRING);
        opacity.value = withSpring(1, SPRING);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    transform: [{ translateY: offsetY.value }],
    opacity: opacity.value,
  }));

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / W);
    setCurrentIndex(index);
  };

  const handleDelete = () => {
    if (deleting) return;
    dismiss({ section: item.indexPath.section, item: currentIndex });
    const handler = premiumAction(async () => {
      setDeleting(true);
      try {
        await deletePHAsset([currSrc]);
        const newSection = section.filter((id) => id !== currSrc);
        closeModal('CleaningModal');
        openModal('CleanerHappyModal', {
          children: (
            <UiText className="text-lg font-semibold text-primary">
              1 {t('cleaner.gallery-cleaner.delete.file')}
            </UiText>
          ),
        });
        if (newSection.length === 0) {
          dismiss({ section: item.indexPath.section, item: currentIndex });
        } else {
          item.section = newSection;
          const nextIndex = Math.min(currentIndex, newSection.length - 1);
          setCurrentIndex(nextIndex);
          listRef.current?.scrollToIndex({ index: nextIndex, animated: false });
        }
      } catch (err) {
        console.error('Error deleting photo:', err);
      } finally {
        setDeleting(false);
      }
    });
    handler();
  };

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      if (!asset?.localUri) await shareAsync(`ph://${currSrc}`);
      else await shareAsync(asset.localUri);
    } catch (err) {
      console.error('Error sharing photo:', err);
    } finally {
      setSharing(false);
    }
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle}>
        <View style={styles.root}>
          <View style={styles.header}>
            <Pressable
              style={styles.headerLeft}
              onPress={() =>
                dismiss({ section: item.indexPath.section, item: currentIndex })
              }
            >
              <SfSymbol
                size={scaleX(16)}
                name="chevron.left"
                tintColor={colors.black.toString()}
              />
              <UiText>Back</UiText>
            </Pressable>
            <View style={styles.headerCenter}>
              <UiText style={styles.headerTitle} numberOfLines={1}>
                {displayName}
              </UiText>
            </View>
            <TouchableOpacity style={styles.headerRight} onPress={handleShare}>
              <UiText style={styles.headerText}>Share</UiText>
              <ShareIcon />
            </TouchableOpacity>
          </View>
          <FlatList
            ref={listRef}
            horizontal
            pagingEnabled
            data={section}
            keyExtractor={(id) => id}
            initialScrollIndex={initialIndex}
            getItemLayout={(_, index) => ({
              length: W,
              offset: W * index,
              index,
            })}
            onScrollToIndexFailed={(info) => {
              listRef.current?.scrollToOffset({
                offset: info.index * W,
                animated: false,
              });
            }}
            renderItem={({ item: id, index: i }) => (
              <View style={[styles.slide, { width: W }]}>
                <View style={styles.card}>
                  <Image
                    contentFit="contain"
                    source={`ph://${id}`}
                    style={styles.image}
                    recyclingKey={id}
                    priority={Math.abs(i - currentIndex) <= 2 ? 'high' : 'low'}
                  />
                </View>
              </View>
            )}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumScrollEnd}
            scrollEventThrottle={16}
            decelerationRate="fast"
            bounces={false}
            style={styles.carousel}
            windowSize={5}
            maxToRenderPerBatch={3}
            initialNumToRender={3}
            removeClippedSubviews
          />
          <View style={styles.footer}>
            <Pressable
              onPress={handleDelete}
              disabled={deleting}
              style={styles.deleteButton}
            >
              <UiText style={styles.deleteButtonText}>
                {deleting ? 'Deleting...' : 'Delete'}
              </UiText>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  root: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: scaleY(65),
    paddingBottom: scaleY(20),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scaleX(20),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 16,
    minWidth: 60,
    gap: 4,
  },
  headerRight: {
    paddingVertical: 8,
    paddingLeft: 16,
    minWidth: 60,
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 2,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerText: { fontSize: 17, color: '#0385FF', fontWeight: '400' },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  carousel: {
    flex: 1,
    marginVertical: 12,
  },
  slide: {
    flex: 1,
    paddingHorizontal: scaleX(20),
  },
  card: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  image: { flex: 1 },
  footer: {
    paddingHorizontal: scaleX(20),
    paddingBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#FF6767',
    paddingVertical: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: { color: 'white', fontSize: 16, fontWeight: '400' },
});
