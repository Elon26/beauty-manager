import { scaleX } from '@kirz/nativewind-scale';
import { BlurView } from 'expo-blur';
import { View } from 'moti';
import { useEffect, useState } from 'react';
import { Keyboard, Pressable, useWindowDimensions } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import type { ModalComponentProp } from 'react-native-modalfy';
import { isNullish } from 'remeda';
import { twMerge } from 'tailwind-merge';

import { ModalStackParams } from '@/components/modals';
import { colors } from '@/config/theme';
import { shadows } from '@/config/theme/shadows';
import { useSetStorage } from '@/hooks/use-storage';
import { SfSymbol } from '@/ui/sf-symbol';
import { UiButton } from '@/ui/ui-button';
import { UiText } from '@/ui/ui-text';

export function CreatePlanModal({
  modal: { params },
}: ModalComponentProp<ModalStackParams, object, 'CreatePlanModal'>) {
  const setCustomPlan = useSetStorage('customPlan');
  const close = () => params?.close();
  const setPlan = () => params?.setPlan();
  const { width, height } = useWindowDimensions();
  const days = [
    { name: t('basic.weekdays.monday'), number: 1 },
    { name: t('basic.weekdays.tuesday'), number: 2 },
    { name: t('basic.weekdays.wednesday'), number: 3 },
    { name: t('basic.weekdays.thursday'), number: 4 },
    { name: t('basic.weekdays.friday'), number: 5 },
    { name: t('basic.weekdays.saturday'), number: 6 },
    { name: t('basic.weekdays.sunday'), number: 7 },
  ];
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [fastingStartHours, setFastingStartHours] = useState<null | number>(
    null
  );
  const [fastingEndHours, setFastingEndHours] = useState<null | number>(null);
  const [fastingStartMinutes, setFastingStartMinutes] = useState<null | number>(
    null
  );
  const [fastingEndMinutes, setFastingEndMinutes] = useState<null | number>(
    null
  );
  const [isCreatable, setIsCreatable] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [windowHeight, setWindowHeight] = useState(height);

  function handleSelectDay(dayNumber: number, isDaySelected: boolean) {
    if (isDaySelected) {
      const updatedSelectedDays = selectedDays.filter(
        (day) => day !== dayNumber
      );
      setSelectedDays(updatedSelectedDays);
    } else {
      setSelectedDays((prev) => [...prev, dayNumber]);
    }
  }

  function handleSetFastingStartHours(val: string) {
    const num = +val;
    const isNumFinite = isFinite(num);
    if (isNumFinite && num >= 0 && num <= 23) {
      setFastingStartHours(num);
    }
  }

  function handleSetFastingEndHours(val: string) {
    const num = +val;
    const isNumFinite = isFinite(num);
    if (isNumFinite && num >= 0 && num <= 23) {
      setFastingEndHours(num);
    }
  }

  function handleSetFastingStartMinutes(val: string) {
    const num = +val;
    const isNumFinite = isFinite(num);
    if (isNumFinite && num >= 0 && num <= 59) {
      setFastingStartMinutes(num);
    }
  }

  function handleSetFastingEndMinutes(val: string) {
    const num = +val;
    const isNumFinite = isFinite(num);
    if (isNumFinite && num >= 0 && num <= 59) {
      setFastingEndMinutes(num);
    }
  }

  function handleCreate() {
    const today = new Date();
    const startDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      fastingStartHours || 0,
      fastingStartMinutes || 0
    );
    const endDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      fastingEndHours || 0,
      fastingEndMinutes || 0
    );

    if (startDate < endDate) {
      setPlan();
      setCustomPlan({
        weekDays: selectedDays.sort(),
        fastingStartHours: fastingStartHours || 0,
        fastingEndHours: fastingEndHours || 0,
        fastingStartMinutes: fastingStartMinutes || 0,
        fastingEndMinutes: fastingEndMinutes || 0,
      });
      close();
    } else {
      setHasError(true);
    }
  }

  useEffect(() => {
    setHasError(false);
    if (
      selectedDays.length > 0 &&
      !isNullish(fastingStartHours) &&
      !isNullish(fastingEndHours) &&
      !isNullish(fastingStartMinutes) &&
      !isNullish(fastingEndMinutes)
    ) {
      setIsCreatable(true);
    } else {
      setIsCreatable(false);
    }
  }, [
    selectedDays,
    fastingStartHours,
    fastingEndHours,
    fastingStartMinutes,
    fastingEndMinutes,
  ]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setWindowHeight(height - e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setWindowHeight(height);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <View
      className="items-center justify-center"
      style={{ width, height: windowHeight }}
    >
      <BlurView className="absolute inset-0" intensity={40} tint="dark" />
      <View
        className="rounded-3xl bg-white gap-y-4 p-4"
        style={{ width: width - scaleX(32) }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            className="items-center justify-center size-9"
            onPress={() => close()}
          >
            <SfSymbol
              name="arrow.left"
              size={scaleX(18)}
              weight="medium"
              tintColor={colors.black.toString()}
            />
          </Pressable>
          <UiText className="text-lg font-medium">
            {t('pages.select-plan.create-plan')}
          </UiText>
          <View className="size-9" />
        </View>
        <UiText className="text-xs text-gray">
          {t('pages.select-plan.choose-days')}
        </UiText>
        <View className="flex-row justify-between">
          {days.map((day) => {
            const isDaySelected = !!selectedDays.find(
              (selectedDay) => selectedDay === day.number
            );
            return (
              <Pressable
                key={day.name}
                className="items-center justify-center rounded-lg size-10"
                style={{
                  backgroundColor: isDaySelected ? '#229DFB' : '#F8F8F8',
                }}
                onPress={() => handleSelectDay(day.number, isDaySelected)}
              >
                <UiText
                  className="text-sm"
                  style={{
                    color: isDaySelected ? 'white' : 'gray',
                  }}
                >
                  {day.name}
                </UiText>
              </Pressable>
            );
          })}
        </View>
        <View className="flex-row justify-between gap-x-2.5">
          <View
            className={twMerge(
              'flex-1 rounded-2xl bg-white gap-y-2 p-2.5',
              hasError && 'border-2 border-red'
            )}
            style={shadows.md}
          >
            <UiText className="text-xs font-medium">
              {t('pages.select-plan.fasting-starts-at')}:
            </UiText>
            <View className="flex-row items-center justify-center gap-x-1">
              <View className="rounded-lg bg-white size-8" style={shadows.md}>
                <TextInput
                  keyboardType="numeric"
                  className="text-center text-sm font-semibold text-primary size-8"
                  value={
                    fastingStartHours !== null
                      ? fastingStartHours.toString()
                      : ''
                  }
                  placeholder={t('pages.select-plan.hours-short')}
                  onChangeText={handleSetFastingStartHours}
                />
              </View>
              <UiText>:</UiText>
              <View className="rounded-lg bg-white size-8" style={shadows.md}>
                <TextInput
                  keyboardType="numeric"
                  className="text-center text-sm font-semibold text-primary size-8"
                  value={
                    fastingStartMinutes !== null
                      ? fastingStartMinutes.toString()
                      : ''
                  }
                  placeholder={t('pages.select-plan.minutes-short')}
                  onChangeText={handleSetFastingStartMinutes}
                />
              </View>
            </View>
          </View>
          <View
            className={twMerge(
              'flex-1 rounded-2xl bg-white gap-y-2 p-2.5',
              hasError && 'border-2 border-red'
            )}
            style={shadows.md}
          >
            <UiText className="text-xs font-medium">
              {t('pages.select-plan.fasting-ends-at')}:
            </UiText>
            <View className="flex-row items-center justify-center gap-x-1">
              <View className="rounded-lg bg-white size-8" style={shadows.md}>
                <TextInput
                  keyboardType="numeric"
                  className="text-center text-sm font-semibold text-primary size-8"
                  value={
                    fastingEndHours !== null ? fastingEndHours.toString() : ''
                  }
                  placeholder={t('pages.select-plan.hours-short')}
                  onChangeText={handleSetFastingEndHours}
                />
              </View>
              <UiText>:</UiText>
              <View className="rounded-lg bg-white size-8" style={shadows.md}>
                <TextInput
                  keyboardType="numeric"
                  className="text-center text-sm font-semibold text-primary size-8"
                  value={
                    fastingEndMinutes !== null
                      ? fastingEndMinutes.toString()
                      : ''
                  }
                  placeholder={t('pages.select-plan.minutes-short')}
                  onChangeText={handleSetFastingEndMinutes}
                />
              </View>
            </View>
          </View>
        </View>
        <View className="items-center">
          <UiButton disabled={!isCreatable} onPress={handleCreate}>
            {t('basic.create')}
          </UiButton>
        </View>
      </View>
    </View>
  );
}
