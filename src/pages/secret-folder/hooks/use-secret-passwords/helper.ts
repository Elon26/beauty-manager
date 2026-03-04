import axios from 'axios';
import { z } from 'zod';

export async function getSiteIcon(url: string) {
  const iconUrl = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=256`;
  const response = await axios.get(iconUrl);
  const sizeImage = response.headers['content-length'];
  if (Number(sizeImage) > 1500) {
    return iconUrl;
  }
}

export const charSets = {
  digits: '0123456789',
  letters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  symbols: '!@#$%^&*()',
} as const;

export function isWeakPassword(password: string): boolean {
  const minLength = 8;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const safetySum =
    Number(hasLowercase) + Number(hasUppercase) + Number(hasNumber) + Number(hasSpecialChar);

  return password.length < minLength || safetySum < 3;
}

export function generatePassword(length: number, chars: (keyof typeof charSets)[]) {
  const cs = chars.map((i) => charSets[i]).join('');
  return Array.from({ length }, () => cs[Math.floor(Math.random() * cs.length)]).join('');
}

export async function getNameAndFavicon(link: string) {
  const linkLowerCase = link.toLowerCase();
  const url = linkLowerCase.startsWith('http') ? linkLowerCase : `http://${linkLowerCase}`;

  const urlSchema = z.string().url();
  const isUrl = urlSchema.safeParse(url);

  const image = isUrl.success ? await getSiteIcon(url).catch(() => undefined) : undefined;
  let name = isUrl.success ? new URL(url).hostname.split('.')[0] : url;
  name = name.charAt(0).toUpperCase() + name.slice(1);
  return { name, image, url };
}
