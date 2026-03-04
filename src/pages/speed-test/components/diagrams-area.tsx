/* eslint-disable react-compiler/react-compiler */
import { MeasureType } from '@kirz/expo-speedtest/build/types';
import { scaleY } from '@kirz/nativewind-scale';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';

import { useSetStorage } from '@/hooks/use-storage';
import { UiText } from '@/ui/ui-text';

type ProgressState = {
  type: MeasureType;
  result: number;
  percent: number;
};

type Props = {
  speedtestResults: Record<MeasureType, number | null>;
  progressState: ProgressState | null;
  speedtestStatus: string;
};

export default function DiagramsArea({
  speedtestResults,
  progressState,
  speedtestStatus,
}: Props) {
  const setSavedDownloadSpeed = useSetStorage('savedDownloadSpeed');
  const setSavedUploadSpeed = useSetStorage('savedUploadSpeed');
  const [currentUploadSpeed, setCurrentUploadSpeed] = useState<number | null>(
    null
  );
  const [currentUploadPercent, setCurrentUploadPercent] = useState(4);
  const uploadHeightAnim = useRef(new Animated.Value(4)).current;
  const [currentDownloadSpeed, setCurrentDownloadSpeed] = useState<
    number | null
  >(null);
  const [currentDownloadPercent, setCurrentDownloadPercent] = useState(4);
  const downloadHeightAnim = useRef(new Animated.Value(4)).current;
  const [currentPingSpeed, setCurrentPingSpeed] = useState<number | null>(null);
  const [currentPingPercent, setCurrentPingPercent] = useState(4);
  const pingHeightAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    if (speedtestStatus === 'testing') {
      if (speedtestResults.ping) {
        const currentSpeed = Math.round(speedtestResults.ping);
        setCurrentPingSpeed(currentSpeed);
        setCurrentPingPercent(50);
      }
      if (speedtestResults.download) {
        const currentSpeed = Math.round(speedtestResults.download);
        setCurrentDownloadSpeed(currentSpeed);
        setSavedDownloadSpeed(currentSpeed);

        let currentPercent = (currentSpeed / scaleY(100)) * 100;
        if (currentPercent < 4) currentPercent = 4;
        if (currentPercent > 90) currentPercent = 90;
        setCurrentDownloadPercent(currentPercent);

        return;
      }
      if (speedtestResults.upload) {
        const currentSpeed = Math.round(speedtestResults.upload);
        setCurrentUploadSpeed(currentSpeed);
        setSavedUploadSpeed(currentSpeed);

        let currentPercent = (currentSpeed / scaleY(100)) * 100;
        if (currentPercent < 4) currentPercent = 4;
        if (currentPercent > 90) currentPercent = 90;
        setCurrentUploadPercent(currentPercent);

        if (speedtestResults.download) return;
      }
      if (progressState) {
        const currentSpeed = Math.round(progressState.result);
        if (progressState.type === 'upload') {
          setCurrentUploadSpeed(currentSpeed);

          let currentPercent = (currentSpeed / scaleY(100)) * 100;
          if (currentPercent < 4) currentPercent = 4;
          if (currentPercent > 90) currentPercent = 90;
          setCurrentUploadPercent(currentPercent);
        }
        if (progressState.type === 'download') {
          setCurrentDownloadSpeed(currentSpeed);

          let currentPercent = (currentSpeed / scaleY(100)) * 100;
          if (currentPercent < 4) currentPercent = 4;
          if (currentPercent > 90) currentPercent = 90;
          setCurrentDownloadPercent(currentPercent);
        }
      }
    } else {
      if (speedtestResults.ping) {
        const currentSpeed = Math.round(speedtestResults.ping);
        setCurrentPingSpeed(currentSpeed);
        setCurrentPingPercent(50);
      }
      if (speedtestResults.download) {
        const currentSpeed = Math.round(speedtestResults.download);
        setCurrentDownloadSpeed(currentSpeed);
        setSavedDownloadSpeed(currentSpeed);

        let currentPercent = (currentSpeed / scaleY(100)) * 100;
        if (currentPercent < 4) currentPercent = 4;
        if (currentPercent > 90) currentPercent = 90;
        setCurrentDownloadPercent(currentPercent);
      }
      if (speedtestResults.upload) {
        const currentSpeed = Math.round(speedtestResults.upload);
        setCurrentUploadSpeed(currentSpeed);
        setSavedUploadSpeed(currentSpeed);

        let currentPercent = (currentSpeed / scaleY(100)) * 100;
        if (currentPercent < 4) currentPercent = 4;
        if (currentPercent > 90) currentPercent = 90;
        setCurrentUploadPercent(currentPercent);
      }
    }
  }, [speedtestStatus, progressState]);

  useEffect(() => {
    Animated.timing(uploadHeightAnim, {
      toValue: currentUploadPercent,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentUploadPercent]);

  useEffect(() => {
    Animated.timing(downloadHeightAnim, {
      toValue: currentDownloadPercent,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentDownloadPercent]);

  useEffect(() => {
    Animated.timing(pingHeightAnim, {
      toValue: currentPingPercent,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentPingPercent]);

  return (
    <View className="flex-1 flex-row justify-between">
      <View className="justify-end gap-y-1 h-full w-20">
        <UiText className="text-center text-xs font-medium text-gray">
          {currentUploadSpeed || '--'} {t('pages.speed-test.mbs')}
        </UiText>
        <Animated.View
          className="overflow-hidden rounded-xl"
          style={{
            height: uploadHeightAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          }}
        >
          <LinearGradient
            colors={['#FF484B', '#FF9294', '#AA292B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
        <UiText className="text-center text-xs font-medium text-gray">
          {t('pages.speed-test.upload')}
        </UiText>
      </View>
      <View className="justify-end gap-y-1 h-full w-20">
        <UiText className="text-center text-xs font-medium text-gray">
          {currentDownloadSpeed || '--'} {t('pages.speed-test.mbs')}
        </UiText>
        <Animated.View
          className="overflow-hidden rounded-xl"
          style={{
            height: downloadHeightAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          }}
        >
          <LinearGradient
            colors={['#1E99F9', '#68BDFF', '#096AB9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
        <UiText className="text-center text-xs font-medium text-gray">
          {t('pages.speed-test.download')}
        </UiText>
      </View>
      <View className="justify-end gap-y-1 h-full w-20">
        <UiText className="text-center text-xs font-medium text-gray">
          {currentPingSpeed || '--'} {t('pages.speed-test.ms')}
        </UiText>
        <Animated.View
          className="overflow-hidden rounded-xl"
          style={{
            height: pingHeightAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          }}
        >
          <LinearGradient
            colors={['#BB8AFF', '#D4B5FF', '#6E5099']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
        <UiText className="text-center text-xs font-medium text-gray">
          {t('pages.speed-test.ping')}
        </UiText>
      </View>
    </View>
  );
}
