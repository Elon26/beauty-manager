import { defaultUserProfile } from '@/pages/profile/constants/default-user-profile';
import CustomPlan from '@/types/custom-plan';
import Photo from '@/types/photo';
import ScheduleItem from '@/types/schedule-item';

/**
 * The initial state of the storage.
 *
 * @warning
 * All keys must be defined. Use `null` for `undefined` values.
 */
export const initialStorageState = {
  isOnboardingFinished: false,
  secretFolderModalIsShown: false,
  hasDeveloperPremium: false,
  savedUploadSpeed: 0,
  autofillGuideShown: false,
  savedDownloadSpeed: 0,
  selectedPlan: '16:8',
  isUserProfileShown: false,
  userProfile: defaultUserProfile,
  fastingSchedule: [] as ScheduleItem[],
  isTimerActive: false,
  isFastingMode: true,
  isStartFastingNotificationsActive: true,
  isEndFastingNotificationsActive: true,
  isSelectPlanScreenShown: false,
  maxDaysInARow: 0,
  currentDaysInARow: 0,
  customPlan: null as CustomPlan | null,
  isPreparingForFastingModalNeedToShow: true,
  isDuringFastingModalNeedToShow: true,
  storedImages: [] as Photo[],
  isProtectSecretFolderModalNeedToShow: true,
  hasNotificationPermission: false,
};

export type Storage = typeof initialStorageState;
