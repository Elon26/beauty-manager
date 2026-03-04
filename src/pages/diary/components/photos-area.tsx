import { scaleX } from '@kirz/nativewind-scale';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/config/theme';
import { useHasPremiumWithBackdoor } from '@/hooks/use-developer-purchases';
import { usePaywall } from '@/hooks/use-paywall';
import { useStorage } from '@/hooks/use-storage';
import Photo from '@/types/photo';
import { Pressable } from '@/ui/pressable';
import { SfSymbol } from '@/ui/sf-symbol';
import { UiButton } from '@/ui/ui-button';
import { UiText } from '@/ui/ui-text';

type Props = {
  selectedDate: Date;
};

export default function PhotosArea({ selectedDate }: Props) {
  const hasPremium = useHasPremiumWithBackdoor();
  const { showPaywall } = usePaywall();
  const insets = useSafeAreaInsets();
  const [storedImages, setStoredImages] = useStorage('storedImages');
  const [filteredImages, setFilteredImages] = useState<Photo[]>([]);

  const pickAndSaveImage = async (): Promise<void> => {
    if (!hasPremium && storedImages.length > 0) {
      showPaywall();
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(t('basic.error'), t('basic.access-denied'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const sourceUri = result.assets[0].uri;
      await saveToGallery(sourceUri);
    }
  };

  const saveToGallery = async (uri: string): Promise<void> => {
    try {
      const fileName = `photo_${Date.now()}.jpg`;
      const newPath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.copyAsync({
        from: uri,
        to: newPath,
      });

      const today = new Date();
      const todayDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0
      );

      const newPhoto: Photo = {
        id: Date.now().toString(),
        uri: newPath,
        date: todayDate,
      };

      const updatedImages = [newPhoto, ...storedImages];
      setStoredImages(updatedImages);
    } catch (error) {
      console.error(error);
      Alert.alert(t('basic.error'), t('pages.diary.cannot-save-the-photo'));
    }
  };

  const deleteImage = async (id: string, uri: string): Promise<void> => {
    Alert.alert(t('basic.delete'), t('pages.diary.are-you-sure'), [
      { text: t('basic.cancel'), style: 'cancel' },
      {
        text: t('basic.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await FileSystem.deleteAsync(uri, { idempotent: true });
            const updatedImages = storedImages.filter((img) => img.id !== id);
            setStoredImages(updatedImages);
          } catch (e) {
            console.error(t('pages.diary.something-went-wrong'), e);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    const currentFilteredImages = storedImages.filter((item) => {
      const dateTime = new Date(item.date).getTime();
      const selectedDateTime = selectedDate.getTime();

      return dateTime === selectedDateTime;
    });

    setFilteredImages(currentFilteredImages);
  }, [selectedDate, storedImages]);

  return (
    <View
      className="rounded-t-3xl bg-grayLight px-4 pt-4"
      style={{ paddingBottom: insets.bottom }}
    >
      <View className="px-4 mb-2">
        <UiText className="text-sm font-medium">
          {selectedDate.toLocaleDateString('default', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </UiText>
      </View>
      <View className="rounded-2xl bg-white gap-y-2 p-4 mb-4">
        <UiText className="text-sm font-medium">
          {t('pages.diary.photos')}
        </UiText>
        {filteredImages.length === 0 ? (
          <Pressable
            className="items-center justify-center rounded-2xl bg-grayLight h-20 w-24"
            onPress={pickAndSaveImage}
          >
            <SfSymbol
              name="plus"
              size={scaleX(22)}
              weight="bold"
              tintColor={colors.grayDark.toString()}
            />
          </Pressable>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredImages.map((item) => (
              <Pressable
                className="mx-0.5"
                key={item.id}
                onLongPress={() => deleteImage(item.id, item.uri)}
              >
                <Image
                  className="h-20 w-24"
                  source={{ uri: item.uri }}
                  style={{
                    margin: 2,
                    borderRadius: 24,
                    backgroundColor: '#f0f0f0',
                  }}
                />
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
      <View className="items-center">
        <UiButton onPress={pickAndSaveImage}>
          {t('pages.diary.add-photo')}
        </UiButton>
      </View>
    </View>
  );
}
