import userPlans from '@/pages/select-plan/constants/user-plans';
import CustomPlan from '@/types/custom-plan';
import ScheduleItem from '@/types/schedule-item';

export function createDailySchedule(
  currentTimestamp: number,
  fullFastingTime: number,
  fullEatingTime: number,
  isFastingMode: boolean
) {
  const schedule: ScheduleItem[] = [];

  for (let i = 1; i <= 10; i++) {
    const currentIsFastingMode = i % 2 === (isFastingMode ? 1 : 0);
    const leftFastingTimes = Math.ceil(i / 2);
    const leftEatingTimes = Math.ceil((i - 1) / 2);

    const scheduleItem: ScheduleItem = {
      isFastingMode: currentIsFastingMode,
      cyclesInRow: leftEatingTimes,
      endTimestamp:
        currentTimestamp +
        leftFastingTimes * fullFastingTime +
        leftEatingTimes * fullEatingTime,
    };
    schedule.push(scheduleItem);
  }

  return schedule;
}

export function createWeeklySchedule(selectedPlanName: string) {
  const schedule: ScheduleItem[] = [];
  let currentDay = new Date();
  let currentWeekDay = currentDay.getDay();
  const isMWFPlan = selectedPlanName === 'MWF';
  const isTTSPlan = selectedPlanName === 'TTS';

  if (isMWFPlan) {
    const isFirstDayFastingDay =
      currentWeekDay === 1 || currentWeekDay === 3 || currentWeekDay === 5;

    for (let i = 1; i <= 10; i++) {
      const cyclesInRow = isFirstDayFastingDay
        ? Math.ceil((i - 1) / 2)
        : Math.ceil((i - 2) / 2);
      const tomorrow = new Date(
        currentDay.getFullYear(),
        currentDay.getMonth(),
        currentDay.getDate() + 1
      );

      if (currentWeekDay === 0) {
        const scheduleItem: ScheduleItem = {
          isFastingMode: false,
          cyclesInRow,
          endTimestamp: tomorrow.getTime(),
        };
        schedule.push(scheduleItem);
        currentDay = tomorrow;
        currentWeekDay = currentWeekDay + 1;
        continue;
      }

      if (
        currentWeekDay === 1 ||
        currentWeekDay === 3 ||
        currentWeekDay === 5
      ) {
        const scheduleItem: ScheduleItem = {
          isFastingMode: true,
          cyclesInRow,
          endTimestamp: tomorrow.getTime(),
        };
        schedule.push(scheduleItem);
        currentDay = tomorrow;
        currentWeekDay = currentWeekDay + 1;
        continue;
      }

      if (currentWeekDay === 2 || currentWeekDay === 4) {
        const scheduleItem: ScheduleItem = {
          isFastingMode: false,
          cyclesInRow,
          endTimestamp: tomorrow.getTime(),
        };
        schedule.push(scheduleItem);
        currentDay = tomorrow;
        currentWeekDay = currentWeekDay + 1;
        continue;
      }

      if (currentWeekDay === 6) {
        const theDayAfterTomorrow = new Date(
          currentDay.getFullYear(),
          currentDay.getMonth(),
          currentDay.getDate() + 2
        );
        const scheduleItem: ScheduleItem = {
          isFastingMode: false,
          cyclesInRow,
          endTimestamp: theDayAfterTomorrow.getTime(),
        };
        schedule.push(scheduleItem);
        currentDay = theDayAfterTomorrow;
        currentWeekDay = 1;
        continue;
      }
    }
  }

  if (isTTSPlan) {
    const isFirstDayFastingDay =
      currentWeekDay === 2 || currentWeekDay === 4 || currentWeekDay === 6;

    for (let i = 1; i <= 10; i++) {
      const cyclesInRow = isFirstDayFastingDay
        ? Math.ceil((i - 1) / 2)
        : Math.ceil((i - 2) / 2);

      const tomorrow = new Date(
        currentDay.getFullYear(),
        currentDay.getMonth(),
        currentDay.getDate() + 1
      );

      if (currentWeekDay === 1) {
        const scheduleItem: ScheduleItem = {
          isFastingMode: false,
          cyclesInRow,
          endTimestamp: tomorrow.getTime(),
        };
        schedule.push(scheduleItem);
        currentDay = tomorrow;
        currentWeekDay = currentWeekDay + 1;
        continue;
      }

      if (
        currentWeekDay === 2 ||
        currentWeekDay === 4 ||
        currentWeekDay === 6
      ) {
        const scheduleItem: ScheduleItem = {
          isFastingMode: true,
          cyclesInRow,
          endTimestamp: tomorrow.getTime(),
        };
        schedule.push(scheduleItem);
        currentDay = tomorrow;
        currentWeekDay = currentWeekDay === 6 ? 0 : currentWeekDay + 1;
        continue;
      }

      if (currentWeekDay === 3 || currentWeekDay === 5) {
        const scheduleItem: ScheduleItem = {
          isFastingMode: false,
          cyclesInRow,
          endTimestamp: tomorrow.getTime(),
        };
        schedule.push(scheduleItem);
        currentDay = tomorrow;
        currentWeekDay = currentWeekDay + 1;
        continue;
      }

      if (currentWeekDay === 0) {
        const theDayAfterTomorrow = new Date(
          currentDay.getFullYear(),
          currentDay.getMonth(),
          currentDay.getDate() + 2
        );
        const scheduleItem: ScheduleItem = {
          isFastingMode: false,
          cyclesInRow,
          endTimestamp: theDayAfterTomorrow.getTime(),
        };
        schedule.push(scheduleItem);
        currentDay = theDayAfterTomorrow;
        currentWeekDay = currentWeekDay + 2;
        continue;
      }
    }
  }

  return schedule;
}

export function createCustomSchedule(customPlan: CustomPlan) {
  let schedule: ScheduleItem[] = [];
  const today = new Date();
  let todayWeekDay = today.getDay();
  if (todayWeekDay === 0) todayWeekDay = 7;
  const isFastingPlanedForToday = customPlan.weekDays.includes(todayWeekDay);

  if (isFastingPlanedForToday) {
    schedule = createTodayCustomSchedule(customPlan, today, todayWeekDay);
  }

  schedule = createRestCustomSchedule(
    customPlan,
    schedule,
    todayWeekDay,
    !!schedule.length
  );

  return schedule;
}

export function updateDailySchedule(
  fastingSchedule: ScheduleItem[],
  fullFastingTime: number,
  fullEatingTime: number
) {
  const currentTimestamp = Date.now();
  const updatedSchedule = fastingSchedule.filter(
    (item) => item.endTimestamp >= currentTimestamp
  );
  const savedLength = updatedSchedule.length;
  const lastTimestamp =
    updatedSchedule[updatedSchedule.length - 1].endTimestamp;
  const lastIsFastingMode =
    updatedSchedule[updatedSchedule.length - 1].isFastingMode;
  const savedCyclesInRow = updatedSchedule[savedLength - 1].cyclesInRow;

  for (let i = 1; i <= 10 - savedLength; i++) {
    const currentIsFastingMode = i % 2 === (lastIsFastingMode ? 0 : 1);
    const leftFastingTimes = lastIsFastingMode
      ? Math.ceil((i - 1) / 2)
      : Math.ceil(i / 2);
    const leftEatingTimes = lastIsFastingMode
      ? Math.ceil(i / 2)
      : Math.ceil((i - 1) / 2);

    const scheduleItem: ScheduleItem = {
      isFastingMode: currentIsFastingMode,
      cyclesInRow: savedCyclesInRow + leftEatingTimes,
      endTimestamp:
        lastTimestamp +
        leftFastingTimes * fullFastingTime +
        leftEatingTimes * fullEatingTime,
    };
    updatedSchedule.push(scheduleItem);
  }

  return updatedSchedule;
}

export function updateWeeklySchedule(
  selectedPlanName: string,
  fastingSchedule: ScheduleItem[]
) {
  const currentTimestamp = Date.now();
  const isMWFPlan = selectedPlanName === 'MWF';
  const isTTSPlan = selectedPlanName === 'TTS';
  const updatedSchedule = fastingSchedule.filter(
    (item) => item.endTimestamp >= currentTimestamp
  );
  const savedLength = updatedSchedule.length;
  const lastDay = new Date(updatedSchedule[savedLength - 1].endTimestamp);
  let currentDay = new Date(
    lastDay.getFullYear(),
    lastDay.getMonth(),
    lastDay.getDate()
  );
  let currentWeekDay = currentDay.getDay();

  if (isMWFPlan) {
    const isFirstDayFastingDay =
      currentWeekDay === 1 || currentWeekDay === 3 || currentWeekDay === 5;

    for (let i = 1; i <= 10 - savedLength; i++) {
      const cyclesInRow = isFirstDayFastingDay
        ? Math.ceil((i - 1) / 2)
        : Math.ceil((i - 2) / 2);
      const tomorrow = new Date(
        currentDay.getFullYear(),
        currentDay.getMonth(),
        currentDay.getDate() + 1
      );

      if (
        currentWeekDay === 1 ||
        currentWeekDay === 3 ||
        currentWeekDay === 5
      ) {
        const scheduleItem: ScheduleItem = {
          isFastingMode: true,
          cyclesInRow,
          endTimestamp: tomorrow.getTime(),
        };
        updatedSchedule.push(scheduleItem);
        currentDay = tomorrow;
        currentWeekDay = currentWeekDay + 1;
        continue;
      }

      if (currentWeekDay === 2 || currentWeekDay === 4) {
        const scheduleItem: ScheduleItem = {
          isFastingMode: false,
          cyclesInRow,
          endTimestamp: tomorrow.getTime(),
        };
        updatedSchedule.push(scheduleItem);
        currentDay = tomorrow;
        currentWeekDay = currentWeekDay + 1;
        continue;
      }

      if (currentWeekDay === 6) {
        const theDayAfterTomorrow = new Date(
          currentDay.getFullYear(),
          currentDay.getMonth(),
          currentDay.getDate() + 2
        );
        const scheduleItem: ScheduleItem = {
          isFastingMode: false,
          cyclesInRow,
          endTimestamp: theDayAfterTomorrow.getTime(),
        };
        updatedSchedule.push(scheduleItem);
        currentDay = theDayAfterTomorrow;
        currentWeekDay = 1;
        continue;
      }
    }
  }

  if (isTTSPlan) {
    const isFirstDayFastingDay =
      currentWeekDay === 2 || currentWeekDay === 4 || currentWeekDay === 6;

    for (let i = 1; i <= 10 - savedLength; i++) {
      const cyclesInRow = isFirstDayFastingDay
        ? Math.ceil((i - 1) / 2)
        : Math.ceil((i - 2) / 2);

      const tomorrow = new Date(
        currentDay.getFullYear(),
        currentDay.getMonth(),
        currentDay.getDate() + 1
      );

      if (
        currentWeekDay === 2 ||
        currentWeekDay === 4 ||
        currentWeekDay === 6
      ) {
        const scheduleItem: ScheduleItem = {
          isFastingMode: true,
          cyclesInRow,
          endTimestamp: tomorrow.getTime(),
        };
        updatedSchedule.push(scheduleItem);
        currentDay = tomorrow;
        currentWeekDay = currentWeekDay === 6 ? 0 : currentWeekDay + 1;
        continue;
      }

      if (currentWeekDay === 3 || currentWeekDay === 5) {
        const scheduleItem: ScheduleItem = {
          isFastingMode: false,
          cyclesInRow,
          endTimestamp: tomorrow.getTime(),
        };
        updatedSchedule.push(scheduleItem);
        currentDay = tomorrow;
        currentWeekDay = currentWeekDay + 1;
        continue;
      }

      if (currentWeekDay === 0) {
        const theDayAfterTomorrow = new Date(
          currentDay.getFullYear(),
          currentDay.getMonth(),
          currentDay.getDate() + 2
        );
        const scheduleItem: ScheduleItem = {
          isFastingMode: false,
          cyclesInRow,
          endTimestamp: theDayAfterTomorrow.getTime(),
        };
        updatedSchedule.push(scheduleItem);
        currentDay = theDayAfterTomorrow;
        currentWeekDay = currentWeekDay + 2;
        continue;
      }
    }
  }

  return updatedSchedule;
}

export function updateCustomSchedule(
  customPlan: CustomPlan,
  fastingSchedule: ScheduleItem[]
) {
  const todayWeekDay = new Date().getDay();
  const currentTimestamp = Date.now();
  const filteredSchedule = fastingSchedule.filter(
    (item) => item.endTimestamp >= currentTimestamp
  );
  const nextIsFastingMode =
    !filteredSchedule[filteredSchedule.length - 1].isFastingMode;
  const updatedSchedule = createRestCustomSchedule(
    customPlan,
    filteredSchedule,
    todayWeekDay,
    nextIsFastingMode
  );

  return updatedSchedule;
}

export function calcFullTimes(
  selectedPlanName: string,
  customPlan: CustomPlan | null
) {
  const selectedPlanObject = userPlans.find(
    (plan) => plan.name === selectedPlanName
  );
  const currentDay = new Date().getDay();
  let fullFastingTime = 1000 * 60 * 60 * 24;
  let fullEatingTime = 1000 * 60 * 60 * 24;

  if (selectedPlanObject) {
    fullFastingTime = 1000 * 60 * 60 * selectedPlanObject.fastingTime;
    fullEatingTime = 1000 * 60 * 60 * selectedPlanObject.eatingTime;
  }

  if (selectedPlanName === 'MWF') {
    fullFastingTime = 1000 * 60 * 60 * 24;
    fullEatingTime =
      1000 * 60 * 60 * 24 * (currentDay === 6 || currentDay === 0 ? 2 : 1);
  }

  if (selectedPlanName === 'TTS') {
    fullFastingTime = 1000 * 60 * 60 * 24;
    fullEatingTime =
      1000 * 60 * 60 * 24 * (currentDay === 0 || currentDay === 1 ? 2 : 1);
  }

  if (selectedPlanName === 'Custom' && customPlan) {
    const today = new Date();
    const fastingStartDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      customPlan.fastingStartHours,
      customPlan.fastingStartMinutes
    );
    const fastingEndDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      customPlan.fastingEndHours,
      customPlan.fastingEndMinutes
    );

    const todayWeekDay = today.getDay();
    let todayWeekDayIndex = customPlan.weekDays.findIndex(
      (day) => day >= todayWeekDay
    );
    if (todayWeekDayIndex < 0) todayWeekDayIndex = 0;
    const firstWeekDay = customPlan.weekDays[todayWeekDayIndex];
    const secondWeekDay =
      customPlan.weekDays[
        todayWeekDayIndex + 1 === customPlan.weekDays.length
          ? 0
          : todayWeekDayIndex + 1
      ];
    const daysDiff =
      secondWeekDay > firstWeekDay
        ? secondWeekDay - firstWeekDay
        : 7 - firstWeekDay + secondWeekDay;
    const eatingStartDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      customPlan.fastingEndHours,
      customPlan.fastingEndMinutes
    );
    const eatingEndDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + daysDiff,
      customPlan.fastingStartHours,
      customPlan.fastingStartMinutes
    );

    fullFastingTime = fastingEndDate.getTime() - fastingStartDate.getTime();
    fullEatingTime = eatingEndDate.getTime() - eatingStartDate.getTime();
  }

  return { fullFastingTime, fullEatingTime };
}

export function createTodayCustomSchedule(
  customPlan: CustomPlan,
  today: Date,
  todayWeekDay: number
) {
  const schedule: ScheduleItem[] = [];

  const fastingStartDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    customPlan.fastingStartHours,
    customPlan.fastingStartMinutes
  );
  const fastingEndDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    customPlan.fastingEndHours,
    customPlan.fastingEndMinutes
  );
  const todayWeekDayIndex = customPlan.weekDays.findIndex(
    (day) => day === todayWeekDay
  );
  const nextWeekDay =
    customPlan.weekDays[
      todayWeekDayIndex + 1 === customPlan.weekDays.length
        ? 0
        : todayWeekDayIndex + 1
    ];
  const daysDiff =
    nextWeekDay > todayWeekDay
      ? nextWeekDay - todayWeekDay
      : 7 - todayWeekDay + nextWeekDay;

  if (today < fastingStartDate) {
    schedule.push({
      isFastingMode: false,
      cyclesInRow: 0,
      endTimestamp: fastingStartDate.getTime(),
    });
    schedule.push({
      isFastingMode: true,
      cyclesInRow: 0,
      endTimestamp: fastingEndDate.getTime(),
    });
    schedule.push({
      isFastingMode: false,
      cyclesInRow: 1,
      endTimestamp: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + daysDiff,
        customPlan.fastingStartHours,
        customPlan.fastingStartMinutes
      ).getTime(),
    });
  }

  if (today >= fastingStartDate && today < fastingEndDate) {
    schedule.push({
      isFastingMode: true,
      cyclesInRow: 0,
      endTimestamp: fastingEndDate.getTime(),
    });
    schedule.push({
      isFastingMode: false,
      cyclesInRow: 1,
      endTimestamp: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + daysDiff,
        customPlan.fastingStartHours,
        customPlan.fastingStartMinutes
      ).getTime(),
    });
  }

  if (today >= fastingEndDate) {
    schedule.push({
      isFastingMode: false,
      cyclesInRow: 0,
      endTimestamp: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + daysDiff,
        customPlan.fastingStartHours,
        customPlan.fastingStartMinutes
      ).getTime(),
    });
  }

  return schedule;
}

export function createRestCustomSchedule(
  customPlan: CustomPlan,
  schedule: ScheduleItem[],
  todayWeekDay: number,
  nextIsFastingMode: boolean
) {
  const leftItems = 10 - schedule.length;
  let currentIsFastingMode = nextIsFastingMode;
  let currentWeekDayIndex = customPlan.weekDays.findIndex(
    (day) => day > todayWeekDay
  );
  if (currentWeekDayIndex < 0) currentWeekDayIndex = 0;
  let lastWeekDay = todayWeekDay;
  let currentDay = new Date();
  const currentWeekDay = customPlan.weekDays[currentWeekDayIndex];
  const daysDiff =
    currentWeekDay > lastWeekDay
      ? currentWeekDay - lastWeekDay
      : 7 - lastWeekDay + currentWeekDay;
  currentDay = new Date(
    currentDay.getFullYear(),
    currentDay.getMonth(),
    currentDay.getDate() + daysDiff
  );
  if (schedule.length) {
    currentDay = new Date(schedule[schedule.length - 1].endTimestamp);
  }
  const savedCyclesInRow = schedule.length
    ? schedule[schedule.length - 1].cyclesInRow
    : 0;

  for (let i = 1; i <= leftItems; i++) {
    const cyclesInRow =
      savedCyclesInRow +
      (nextIsFastingMode ? Math.ceil((i - 1) / 2) : Math.ceil((i - 2) / 2));
    const currentWeekDay = customPlan.weekDays[currentWeekDayIndex];
    const daysDiff =
      currentWeekDay > lastWeekDay
        ? currentWeekDay - lastWeekDay
        : 7 - lastWeekDay + currentWeekDay;

    schedule.push({
      isFastingMode: currentIsFastingMode,
      cyclesInRow,
      endTimestamp: currentIsFastingMode
        ? new Date(
            currentDay.getFullYear(),
            currentDay.getMonth(),
            currentDay.getDate(),
            customPlan.fastingEndHours,
            customPlan.fastingEndMinutes
          ).getTime()
        : new Date(
            currentDay.getFullYear(),
            currentDay.getMonth(),
            currentDay.getDate() + daysDiff,
            customPlan.fastingStartHours,
            customPlan.fastingStartMinutes
          ).getTime(),
    });

    currentDay = currentIsFastingMode
      ? currentDay
      : new Date(
          currentDay.getFullYear(),
          currentDay.getMonth(),
          currentDay.getDate() + daysDiff
        );
    currentIsFastingMode = !currentIsFastingMode;
    currentWeekDayIndex = currentIsFastingMode
      ? currentWeekDayIndex
      : currentWeekDayIndex + 1 === customPlan.weekDays.length
        ? 0
        : currentWeekDayIndex + 1;
    lastWeekDay = currentWeekDay;
  }

  return schedule;
}
