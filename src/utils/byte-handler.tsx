function numberFixer(num: number): string {
  if (num === 100) return '00';
  if (num < 10) return '0' + num;
  return num.toString();
}

export default function byteHandler(bytes: number) {
  let restNum = bytes;

  const gigaBytes = Math.floor(restNum / (1000 * 1000 * 1000));
  restNum = restNum % (1000 * 1000 * 1000);
  if (gigaBytes)
    return {
      order: 'Gb',
      integers: gigaBytes.toString(),
      hundredths: numberFixer(
        Math.round((restNum / (1000 * 1000 * 1000)) * 100)
      ),
    };

  const megaBytes = Math.floor(restNum / (1000 * 1000));
  restNum = restNum % (1000 * 1000);
  if (megaBytes)
    return {
      order: 'Mb',
      integers: megaBytes.toString(),
      hundredths: numberFixer(Math.round((restNum / (1000 * 1000)) * 100)),
    };

  const kiloBytes = Math.floor(restNum / 1000);
  restNum = restNum % 1000;
  if (kiloBytes)
    return {
      order: 'Kb',
      integers: kiloBytes.toString(),
      hundredths: numberFixer(Math.round((restNum / 1000) * 100)),
    };

  const restBytes = restNum % 1000;
  return {
    order: 'Bytes',
    integers: restBytes.toString(),
    hundredths: '00',
  };
}
