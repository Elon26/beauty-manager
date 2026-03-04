import { scaleX } from '@kirz/nativewind-scale';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable as NativePressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { colors } from '@/config/theme';
import { useHasPremiumWithBackdoor } from '@/hooks/use-developer-purchases';
import { useStorage } from '@/hooks/use-storage';
import { calcFullTimes } from '@/pages/fasting-tracker/helpers/fasting-tracker-helper';
import StartIcon from '@/svg/star.svg';
import ScheduleItem from '@/types/schedule-item';
import { Pressable } from '@/ui/pressable';
import { SfSymbol } from '@/ui/sf-symbol';
import { UiText } from '@/ui/ui-text';
import formatTime from '@/utils/format-time';

import FastingTrackerProgressBar from './fasting-tracker-progress-bar';

export default function FastingTrackerArea() {
  const hasPremium = useHasPremiumWithBackdoor();
  const [isSelectPlanScreenShown, setIsSelectPlanScreenShown] = useStorage(
    'isSelectPlanScreenShown'
  );
  const [selectedPlan] = useStorage('selectedPlan');
  const [isTimerActive] = useStorage('isTimerActive');
  const [isFastingMode] = useStorage('isFastingMode');
  const [fastingSchedule] = useStorage('fastingSchedule');
  const [customPlan] = useStorage('customPlan');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const { fullFastingTime, fullEatingTime } = calcFullTimes(
    selectedPlan,
    customPlan
  );

  const [hourLeft, setHourLeft] = useState('');
  const [minuteLeft, setMinuteLeft] = useState('');
  const [secondLeft, setSecondLeft] = useState('');
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentFastingMode, setCurrentFastingMode] = useState(isFastingMode);

  function startTimer(fastingSchedule: ScheduleItem[]) {
    if (fastingSchedule.length) {
      setTimeLeft(fastingSchedule[0].endTimestamp - Date.now());
      let currentOrder = 0;
      let currentFastingMode = isFastingMode;
      intervalRef.current = setInterval(() => {
        const timeToCheck = fastingSchedule[currentOrder].endTimestamp;
        const currentTimeLeft = timeToCheck - Date.now();

        if (currentTimeLeft >= 0) {
          setTimeLeft(currentTimeLeft);
        } else {
          currentOrder += 1;
          setCurrentFastingMode(!currentFastingMode);
          setCurrentProgress(0);
          currentFastingMode = !currentFastingMode;
          setTimeLeft(
            (isFastingMode ? fullFastingTime : fullEatingTime) - 1000
          );
        }
      }, 1000);
    }
  }
  function stopTimer() {
    intervalRef.current && clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  function handlePressForNativePressable() {
    if (!hasPremium) return;
    if (isSelectPlanScreenShown) {
      router.navigate('/fasting-tracker');
    } else {
      setIsSelectPlanScreenShown(true);
      router.navigate('/select-plan');
    }
  }

  useEffect(() => {
    stopTimer();
    if (fastingSchedule.length) {
      startTimer(fastingSchedule);
    }
  }, [fastingSchedule]);

  useEffect(() => {
    if (isTimerActive) {
      setCurrentProgress(
        Math.round(
          100 -
            (timeLeft /
              (currentFastingMode ? fullFastingTime : fullEatingTime)) *
              100
        )
      );
    } else {
      setCurrentProgress(0);
    }
  }, [isTimerActive, timeLeft]);

  useEffect(() => {
    const [hour, minute, second] = formatTime(timeLeft).split(':');
    setHourLeft(hour);
    setMinuteLeft(minute);
    setSecondLeft(second);
  }, [timeLeft]);

  return (
    <NativePressable onPress={handlePressForNativePressable}>
      <View className="absolute overflow-hidden rounded-2xl h-full w-full">
        <LinearGradient
          colors={['#1E99F9', '#68BDFF', '#096AB9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </View>
      <View className="gap-y-3 p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-x-2.5">
            <UiText className="text-xl font-semibold text-white">
              {t('basic.fasting-tracker')}
            </UiText>
            {!hasPremium && <StartIcon />}
          </View>
          {hasPremium && (
            <SfSymbol
              name="chevron.right"
              tintColor={colors.gray.toString()}
              size={scaleX(20)}
              weight="medium"
            />
          )}
        </View>
        <FastingTrackerProgressBar progress={currentProgress} />
        {hasPremium ? (
          <View className="gap-y-2">
            <View className="flex-row items-center justify-between">
              <UiText className="text-white">
                {t('pages.main.your-plan')}
              </UiText>
              <UiText className="text-white">{selectedPlan}</UiText>
            </View>
            <View className="flex-row items-center justify-between">
              <UiText className="text-white">
                {t(
                  currentFastingMode
                    ? 'pages.main.fasting-time-left'
                    : 'pages.main.eating-time-left'
                )}
              </UiText>
              {isTimerActive ? (
                <View className="flex-row items-center">
                  <UiText
                    className={twMerge(
                      'text-white',
                      hourLeft.length >= 3
                        ? 'text-right w-8'
                        : 'text-center w-5'
                    )}
                  >
                    {hourLeft}
                  </UiText>
                  <UiText className="text-white">:</UiText>
                  <UiText className="text-center text-white w-5">
                    {minuteLeft}
                  </UiText>
                  <UiText className="text-white">:</UiText>
                  <UiText className="text-center text-white w-5">
                    {secondLeft}
                  </UiText>
                </View>
              ) : (
                <UiText className="text-white">{t('basic.timer-off')}</UiText>
              )}
            </View>
          </View>
        ) : (
          <View>
            <View className="flex-row items-center justify-between">
              <UiText className="text-white" />
              <Pressable
                className="items-center justify-center rounded-3xl bg-white px-4 py-2"
                onPress={() => router.navigate('/fasting-tracker')}
              >
                <UiText>
                  {t(isTimerActive ? 'basic.stop' : 'basic.start')}
                </UiText>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </NativePressable>
  );
}
