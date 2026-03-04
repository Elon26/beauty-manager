import { getNetworkInfo } from '@kirz/react-native-device-info';
import NetInfo from '@react-native-community/netinfo';
import { atom, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useModals } from '@/hooks/use-modals';
import { Page } from '@/ui/page';
import { PageHeader } from '@/ui/page-header';
import { UiButton } from '@/ui/ui-button';
import { usePromise } from '@/utils/use-promise';

import DiagramsArea from './components/diagrams-area';
import InfoArea from './components/info-area';
import ResultsArea from './components/results-area';
import { useSpeedTest } from './hooks/use-speedtest';

export type HistoryItem = {
  timestamp: number;
  download: number;
  upload: number;
};

export const historyAtom = atom<HistoryItem[]>([]);

export function SpeedTestPage() {
  const insets = useSafeAreaInsets();
  const nwInfo = usePromise(getNetworkInfo());
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const {
    start: startSpeedtest,
    statusAtom,
    progressAtom,
    resultsAtom,
  } = useSpeedTest();
  const progressState = useAtomValue(progressAtom);
  const speedtestStatus = useAtomValue(statusAtom);
  const speedtestResults = useAtomValue(resultsAtom);
  const { openModal, closeModal } = useModals();

  async function handleStartSpeedtest() {
    if (isConnected) {
      startSpeedtest({ tests: ['upload', 'download', 'ping'] });
    } else {
      let confirm: (value: unknown) => void = () => {};
      const confirmationPromise = new Promise<unknown>((resolve) => {
        confirm = resolve;
      });

      openModal('ConnectionErrorModal', {
        resolve: confirm,
      });

      const action = await confirmationPromise;

      if (action === 'back') {
        closeModal('ConnectionErrorModal');
      }

      if (action === 'retry') {
        closeModal('ConnectionErrorModal');
        setTimeout(() => {
          handleStartSpeedtest();
        }, 500);
      }
    }
  }

  return (
    <Page>
      <PageHeader pageName={t('pages.speed-test.page-name')} />
      <View className="flex-1 gap-y-4" style={{ paddingBottom: insets.bottom }}>
        <ResultsArea speedtestResults={speedtestResults} />
        <DiagramsArea
          speedtestResults={speedtestResults}
          progressState={progressState}
          speedtestStatus={speedtestStatus}
        />
        <InfoArea
          hasConnection={nwInfo?.connectedToWiFi === 'Yes'}
          ipAddress={nwInfo?.wiFiIPAddress || t('basic.unknown')}
        />
        <View className="items-center">
          <UiButton onPress={handleStartSpeedtest}>
            {t('pages.speed-test.start-test')}
          </UiButton>
        </View>
      </View>
    </Page>
  );
}
