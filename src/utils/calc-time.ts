const HOUR = 1000 * 60 * 60;
const MINUTE = 1000 * 60;
const SECOND = 1000;

export default function calcTime(timeLeft: number): string {
  let currentTimeLeft = timeLeft;

  const fullHours = Math.floor(timeLeft / HOUR);
  currentTimeLeft = timeLeft % HOUR;

  const fullMinutes = Math.floor(currentTimeLeft / MINUTE);
  currentTimeLeft = currentTimeLeft % MINUTE;
  const seconds = Math.floor(currentTimeLeft / SECOND);

  return `${handleTime(fullHours)}:${handleTime(fullMinutes)}:${handleTime(seconds)}`;
}

function handleTime(time: number): string {
  return time >= 10 ? time.toString() : '0' + time;
}
