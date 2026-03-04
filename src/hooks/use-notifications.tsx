import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { ReactNode, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';

import { useStorageValue } from './use-storage';

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('myNotificationChannel', {
      name: 'A channel is needed for the permissions prompt to appear',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return;
    }
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
    } catch (e) {
      token = `${e}`;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export async function schedulePushNotification(
  title: string,
  body: string,
  date: Date,
  data?: Record<string, string>
) {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      data: data || {},
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: date,
    },
  });
  return notificationId;
}

export async function cancelNotification(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const hasNotificationPermission = useStorageValue(
    'hasNotificationPermission'
  );
  const fastingSchedule = useStorageValue('fastingSchedule');
  const isEndFastingNotificationsActive = useStorageValue(
    'isEndFastingNotificationsActive'
  );
  const isStartFastingNotificationsActive = useStorageValue(
    'isStartFastingNotificationsActive'
  );

  const scheduleFastingStartPushNotifications = useCallback(async () => {
    const scheduleToHandle = fastingSchedule.filter(
      (item) => !item.isFastingMode
    );

    scheduleToHandle.forEach((scheduleItem) => {
      schedulePushNotification(
        t('notifications.fasting-start-title'),
        t('notifications.fasting-start-body'),
        new Date(scheduleItem.endTimestamp)
      );
    });
  }, [fastingSchedule]);

  const scheduleFastingEndPushNotifications = useCallback(async () => {
    const scheduleToHandle = fastingSchedule.filter(
      (item) => item.isFastingMode
    );

    scheduleToHandle.forEach((scheduleItem) => {
      schedulePushNotification(
        t('notifications.fasting-end-title'),
        t('notifications.fasting-end-body'),
        new Date(scheduleItem.endTimestamp)
      );
    });
  }, [fastingSchedule]);

  useEffect(() => {
    cancelAllNotifications();
    if (fastingSchedule.length) {
      if (isStartFastingNotificationsActive)
        scheduleFastingStartPushNotifications();
      if (isEndFastingNotificationsActive)
        scheduleFastingEndPushNotifications();
    }
  }, [
    fastingSchedule,
    isStartFastingNotificationsActive,
    isEndFastingNotificationsActive,
    scheduleFastingStartPushNotifications,
    scheduleFastingEndPushNotifications,
  ]);

  useEffect(() => {
    if (hasNotificationPermission) {
      registerForPushNotificationsAsync();
    }
  }, []);

  return <>{children}</>;
}
