export function numberInnerWrapper(num: number): string {
  let restNum = num;

  const millions = Math.floor(restNum / 1000000);
  restNum = restNum % 1000000;

  const thousands = Math.floor(restNum / 1000);

  const integers = restNum % 1000;

  let result = '';

  if (millions) result += millions + ' ';
  if (millions || thousands) result += thousands + ' ';
  result += integers;

  const resultArr = result.split(' ').map((item, index) => {
    if (index !== 0 && item.length < 3) {
      if (item.length === 2) {
        item = '0' + item;
      }
      if (item.length === 1) {
        item = '00' + item;
      }
    }
    return item;
  });

  result = resultArr.join(' ');

  return result;
}
