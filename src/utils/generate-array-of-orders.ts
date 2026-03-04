export function generateArrayOfOrders(num: number) {
  const result = ['1st'];

  if (num >= 2) {
    result.push('2nd');
  }

  if (num >= 3) {
    result.push('3rd');
  }

  if (num >= 4) {
    for (let i = 4; i <= num; i++) {
      result.push(`${i}th`);
    }
  }

  return result;
}
