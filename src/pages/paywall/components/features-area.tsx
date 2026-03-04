import { View } from 'react-native';

import CameraImage from '@/images/camera.png';
import DiagramImage from '@/images/diagram.png';
import GoldenCupImage from '@/images/golden-cup.png';
import HourglassImage from '@/images/hourglass.png';

import { Feature } from './feature';

export function FeaturesArea() {
  return (
    <View className="flex-row flex-wrap rounded-2xl -m-1 pt-7">
      <Feature
        title={t('pages.paywall.features.title-one')}
        description={t('pages.paywall.features.description-one')}
        ImageName={HourglassImage}
      />
      <Feature
        title={t('pages.paywall.features.title-two')}
        description={t('pages.paywall.features.description-two')}
        ImageName={GoldenCupImage}
      />
      <Feature
        title={t('pages.paywall.features.title-three')}
        description={t('pages.paywall.features.description-three')}
        ImageName={CameraImage}
      />
      <Feature
        title={t('pages.paywall.features.title-four')}
        description={t('pages.paywall.features.description-four')}
        ImageName={DiagramImage}
      />
    </View>
  );
}
