import * as WebBrowser from 'expo-web-browser';
import { WebBrowserPresentationStyle } from 'expo-web-browser';
import { useCallback } from 'react';

/**
 * Hook to open a web browser modal.
 */
export function useWebViewModal() {
  const openModal = useCallback(async (href: string) => {
    await WebBrowser.openBrowserAsync(href, {
      dismissButtonStyle: 'close',
      presentationStyle: WebBrowserPresentationStyle.PAGE_SHEET,
    });
  }, []);

  return { openModal };
}
