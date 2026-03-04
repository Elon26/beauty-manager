import { URL } from 'react-native-url-polyfill';

export function extractFavicon(url: string) {
  try {
    return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(new URL(url.startsWith('http') ? url : `http://${url}`).host)}`;
  } catch {
    return 'https://www.google.com/s2/favicons?sz=128&domain_url=google.com';
  }
}
