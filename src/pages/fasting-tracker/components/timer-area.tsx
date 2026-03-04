import { scaleX } from '@kirz/nativewind-scale';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Alert, Switch, View } from 'react-native';

import { colors } from '@/config/theme';
import { useHasPremiumWithBackdoor } from '@/hooks/use-developer-purchases';
import { useModals } from '@/hooks/use-modals';
import { usePaywall } from '@/hooks/use-paywall';
import { useStorage } from '@/hooks/use-storage';
import userPlans from '@/pages/select-plan/constants/user-plans';
import AlarmIcon from '@/svg/alarm.svg';
import ClockIcon from '@/svg/clock.svg';
import DiaryIcon from '@/svg/diary.svg';
import StartIcon from '@/svg/start.svg';
import StopIcon from '@/svg/stop.svg';
import CustomPlan from '@/types/custom-plan';
import ScheduleItem from '@/types/schedule-item';
import { Pressable } from '@/ui/pressable';
import { SfSymbol } from '@/ui/sf-symbol';
import { UiButton } from '@/ui/ui-button';
import { UiButtonStatic } from '@/ui/ui-button-static';
import { UiText } from '@/ui/ui-text';

import {
  calcFullTimes,
  createCustomSchedule,
  createDailySchedule,
  createWeeklySchedule,
  updateCustomSchedule,
  updateDailySchedule,
  updateWeeklySchedule,
} from '../helpers/fasting-tracker-helper';
import Ark from './ark';
import Timer from './timer';

export default function TimerArea() {
  const { openModal } = useModals();
  const [isDuringFastingModalNeedToShow] = useStorage(
    'isDuringFastingModalNeedToShow'
  );
  const [maxDaysInARow, setMaxDaysInARow] = useStorage('maxDaysInARow');
  const [, setCurrentDaysInARow] = useStorage('currentDaysInARow');
  const [selectedPlanName] = useStorage('selectedPlan');
  const [fastingSchedule, setFastingSchedule] = useStorage('fastingSchedule');
  const [customPlan] = useStorage('customPlan');
  const selectedPlanObject = userPlans.find(
    (plan) => plan.name === selectedPlanName
  );
  const { fullFastingTime, fullEatingTime } = calcFullTimes(
    selectedPlanName,
    customPlan
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isFastingMode, setIsFastingMode] = useStorage('isFastingMode');
  const [isTimerActive, setIsTimerActive] = useStorage('isTimerActive');
  const [timeLeft, setTimeLeft] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const hasPremium = useHasPremiumWithBackdoor();
  const { showPaywall } = usePaywall();
  const [selectedPlan] = useStorage('selectedPlan');
  const [
    isStartFastingNotificationsActive,
    setIsStartFastingNotificationsActive,
  ] = useStorage('isStartFastingNotificationsActive');
  const [isEndFastingNotificationsActive, setIsEndFastingNotificationsActive] =
    useStorage('isEndFastingNotificationsActive');

  function handleChangePlan() {
    if (hasPremium) {
      if (isTimerActive) {
        Alert.alert(
          t('basic.warning'),
          t('pages.fasting-tracker.change-plan-warning'),
          [
            {
              text: t('basic.continue'),
              onPress: () => {
                stopTimer();
                router.navigate('/select-plan');
              },
            },
            {
              text: t('basic.cancel'),
              style: 'cancel',
            },
          ]
        );
      } else {
        router.navigate('/select-plan');
      }
    } else {
      showPaywall();
    }
  }

  function handleStart() {
    setIsTimerActive(true);
    const currentTimestamp = Date.now();
    const newSchedule = selectedPlanObject
      ? createDailySchedule(
          currentTimestamp,
          fullFastingTime,
          fullEatingTime,
          isFastingMode
        )
      : selectedPlanName === 'Custom' && customPlan
        ? createCustomSchedule(customPlan)
        : createWeeklySchedule(selectedPlanName);

    const currentTimeLeft =
      newSchedule[0].endTimestamp -
      Date.now() -
      (selectedPlanObject ? 1000 : 0);
    const currentPercentage = selectedPlanObject
      ? 100
      : Math.round(
          ((newSchedule[0].endTimestamp - Date.now()) /
            (isFastingMode ? fullFastingTime : fullEatingTime)) *
            100
        );

    setTimeLeft(currentTimeLeft);
    setPercentage(currentPercentage);
    setIsFastingMode(newSchedule[0].isFastingMode);
    setFastingSchedule(newSchedule);
    if (selectedPlanName === 'Custom' && customPlan) {
      startCustomTimer(newSchedule, customPlan);
    } else {
      startTimer(newSchedule);
    }

    if (isDuringFastingModalNeedToShow) {
      openModal('DuringFastingModal');
    }
  }

  function handleStop() {
    Alert.alert(
      t('basic.warning'),
      t('pages.fasting-tracker.stop-tracker-warning'),
      [
        {
          text: t('basic.stop'),
          onPress: () => stopTimer(),
        },
        {
          text: t('basic.cancel'),
          style: 'cancel',
        },
      ]
    );
  }

  function stopTimer() {
    setIsTimerActive(false);
    setIsFastingMode(true);
    setTimeLeft(0);
    setPercentage(0);
    clearSchedule();
    setCurrentDaysInARow(0);
  }

  function startTimer(schedule: ScheduleItem[]) {
    let currentOrder = 0;
    let currentFastingMode = isFastingMode;
    intervalRef.current = setInterval(() => {
      const timeToCheck = schedule[currentOrder].endTimestamp;
      const currentTimeLeft = timeToCheck - Date.now();
      if (currentTimeLeft >= 0) {
        setTimeLeft(currentTimeLeft);
        setPercentage(
          Math.round(
            (currentTimeLeft /
              (currentFastingMode ? fullFastingTime : fullEatingTime)) *
              100
          )
        );
      } else {
        currentFastingMode = !currentFastingMode;
        setIsFastingMode((prev) => !prev);
        currentOrder += 1;
        setTimeLeft(
          (currentFastingMode ? fullFastingTime : fullEatingTime) - 1000
        );
        setPercentage(100);
      }
    }, 1000);
  }

  function startCustomTimer(schedule: ScheduleItem[], customPlan: CustomPlan) {
    let currentOrder = 0;
    let currentFastingMode = isFastingMode;
    intervalRef.current = setInterval(() => {
      const timeToCheck = schedule[currentOrder].endTimestamp;
      const currentTimeLeft = timeToCheck - Date.now();
      if (currentTimeLeft >= 0) {
        setTimeLeft(currentTimeLeft);
      } else {
        currentFastingMode = !currentFastingMode;
        setIsFastingMode((prev) => !prev);
        currentOrder += 1;
      }
    }, 1000);
  }

  function clearSchedule() {
    intervalRef.current && clearInterval(intervalRef.current);
    intervalRef.current = null;
    setFastingSchedule([]);
  }

  useFocusEffect(
    useCallback(() => {
      if (isTimerActive) {
        const currentTimestamp = Date.now();
        const filteredSchedule = fastingSchedule.filter(
          (item) => item.endTimestamp >= currentTimestamp
        );
        setIsFastingMode(
          filteredSchedule[0] ? filteredSchedule[0].isFastingMode : true
        );

        if (hasPremium) {
          const currentDaysInARowForCalc = filteredSchedule[0]
            ? filteredSchedule[0].cyclesInRow
            : 0;

          setCurrentDaysInARow(currentDaysInARowForCalc);
          if (currentDaysInARowForCalc > maxDaysInARow)
            setMaxDaysInARow(currentDaysInARowForCalc);
        }

        if (filteredSchedule.length) {
          const currentTimeLeft =
            filteredSchedule[0].endTimestamp - currentTimestamp;
          setTimeLeft(currentTimeLeft);
          setPercentage(
            (currentTimeLeft /
              (isFastingMode ? fullFastingTime : fullEatingTime)) *
              100
          );
          const newSchedule = selectedPlanObject
            ? updateDailySchedule(
                fastingSchedule,
                fullFastingTime,
                fullEatingTime
              )
            : selectedPlanName === 'Custom' && customPlan
              ? updateCustomSchedule(customPlan, fastingSchedule)
              : updateWeeklySchedule(selectedPlanName, fastingSchedule);

          setFastingSchedule(newSchedule);

          if (selectedPlanName === 'Custom' && customPlan) {
            startCustomTimer(newSchedule, customPlan);
          } else {
            startTimer(newSchedule);
          }
        } else {
          handleStart();
        }
      }

      return () => {
        intervalRef.current && clearInterval(intervalRef.current);
        intervalRef.current = null;
      };
    }, [])
  );

  return (
    <View className="gap-y-4">
      <View className="items-center gap-y-10">
        <Timer
          timeLeft={timeLeft}
          percentage={percentage}
          currentMode={isFastingMode ? 'fasting' : 'eating'}
          isActive={isTimerActive}
        />
        <View className="overflow-hidden w-full">
          <View className="absolute -left-8 bottom-4">
            <Ark />
          </View>
          <View className="absolute -right-8 bottom-4">
            <Ark />
          </View>
          <View className="items-center">
            <UiButtonStatic onPress={isTimerActive ? handleStop : handleStart}>
              <View className="flex-row items-center gap-x-1">
                {isTimerActive ? <StopIcon /> : <StartIcon />}
                <UiText className="text-white">
                  {t(isTimerActive ? 'basic.stop' : 'basic.start')}
                </UiText>
              </View>
            </UiButtonStatic>
          </View>
        </View>
      </View>

      <View className="gap-y-3 px-edge">
        <Pressable
          className="flex-row items-center justify-between rounded-full bg-grayLight p-4"
          onPress={handleChangePlan}
        >
          <View className="flex-row items-center gap-x-2">
            <ClockIcon />
            <UiText>{t('pages.fasting-tracker.change-your-plan')}</UiText>
          </View>
          <View className="flex-row items-center gap-x-2">
            <UiText>{selectedPlan}</UiText>
            <SfSymbol
              name="chevron.right"
              size={scaleX(16)}
              weight="medium"
              tintColor={colors.grayDark.toString()}
            />
          </View>
        </Pressable>
        <View className="flex-row items-center justify-between rounded-full bg-grayLight p-4">
          <View className="flex-row items-center gap-x-2">
            <AlarmIcon />
            <UiText>
              {t('pages.fasting-tracker.notify-me-when-fasting-starts')}
            </UiText>
          </View>
          <View className="flex-row items-center gap-x-2 mr-2">
            <Switch
              value={isStartFastingNotificationsActive}
              onChange={() =>
                setIsStartFastingNotificationsActive((prev) => !prev)
              }
            />
          </View>
        </View>
        <View className="flex-row items-center justify-between rounded-full bg-grayLight p-4">
          <View className="flex-row items-center gap-x-2">
            <AlarmIcon />
            <UiText>
              {t('pages.fasting-tracker.notify-me-when-fasting-ends')}
            </UiText>
          </View>
          <View className="flex-row items-center gap-x-2 mr-2">
            <Switch
              value={isEndFastingNotificationsActive}
              onChange={() =>
                setIsEndFastingNotificationsActive((prev) => !prev)
              }
            />
          </View>
        </View>
        <UiButton className="w-full" onPress={() => router.navigate('/diary')}>
          <View className="flex-row items-center justify-between px-4 w-full">
            <View className="flex-row items-center gap-x-2">
              <DiaryIcon />
              <UiText className="text-white">
                {t('pages.fasting-tracker.photo-diary')}
              </UiText>
            </View>
            <SfSymbol
              name="chevron.right"
              size={scaleX(16)}
              weight="medium"
              tintColor={colors.white.toString()}
            />
          </View>
        </UiButton>
      </View>
    </View>
  );
}
