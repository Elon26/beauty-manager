function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  'worklet';

  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export function buildSvgArcPath(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  inverse: true
) {
  'worklet';

  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  const d = [
    'M',
    inverse ? end.x : start.x,
    inverse ? end.y : start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    inverse ? 1 : 0,
    inverse ? start.x : end.x,
    inverse ? start.y : end.y,
  ].join(' ');

  return d;
}
