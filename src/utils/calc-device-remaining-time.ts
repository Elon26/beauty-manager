const FULL_CHARGE = 1000 * 60 * 60 * 20;
const HOUR = 1000 * 60 * 60;
const MINUTE = 1000 * 60;

export default function calcDeviceRemainingTime(batteryLevel: number): string {
  const currentChargeTime = (FULL_CHARGE * batteryLevel) / 100;

  if (currentChargeTime >= HOUR)
    return t('pages.system-info.hour', {
      hours: Math.round(currentChargeTime / HOUR),
    });
  if (currentChargeTime >= MINUTE)
    return t('pages.system-info.minute', {
      minutes: Math.round(currentChargeTime / MINUTE),
    });

  return t('pages.system-info.minute', { minutes: 1 });
}
