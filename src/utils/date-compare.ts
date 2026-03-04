const today = new Date();

export function isToday(date: Date) {
  return (
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).toString() ===
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).toString()
  );
}

export function isTomorrow(date: Date) {
  return (
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    ).toString() ===
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).toString()
  );
}
