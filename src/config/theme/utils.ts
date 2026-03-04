import Color from 'color';
import fontColorContrast from 'font-color-contrast';

export function getContrastColor(color: string) {
  return fontColorContrast(Color(color).hex()) === '#000000' ? 'dark' : 'light';
}
