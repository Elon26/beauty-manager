import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStorage } from '@/hooks/use-storage';
import { Page } from '@/ui/page';
import { PageHeader } from '@/ui/page-header';
import { UiButton } from '@/ui/ui-button';

import HeightInputArea from './components/height-input-area';
import Intro from './components/intro';
import SexArea from './components/sex-area';
import SimpleInputArea from './components/simple-input-area';
import NameInputArea from './components/simple-input-area';
import WeightInputArea from './components/weight-input-area';

export default function ProfilePage() {
  const insets = useSafeAreaInsets();

  const [userProfile, setUserProfile] = useStorage('userProfile');
  const [userName, setUserName] = useState(userProfile.name);
  const [userSex, setUserSex] = useState(userProfile.sex);
  const [userAge, setUserAge] = useState(userProfile.age);
  const [userHeight, setUserHeight] = useState(userProfile.height);
  const [userWeight, setUserWeight] = useState(userProfile.weight);
  const [userHeightMeasure, setUserHeightMeasure] = useState(
    userProfile.heightMeasure
  );
  const [userWeightMeasure, setUserWeightMeasure] = useState(
    userProfile.weightMeasure
  );
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    if (userName.trim() && userSex && userAge && userHeight && userWeight) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [userName, userSex, userAge, userHeight, userWeight]);

  function handleSave() {
    setUserProfile({
      name: userName.trim(),
      sex: userSex,
      age: userAge,
      height: userHeight,
      heightMeasure: userHeightMeasure,
      weight: userWeight,
      weightMeasure: userWeightMeasure,
    });
    router.navigate('/fasting-tracker');
  }

  return (
    <Page>
      <PageHeader pageName={t('pages.profile.page-name')} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom,
        }}
      >
        <View className="gap-y-4">
          <Intro />
          <NameInputArea
            name={t('pages.profile.name')}
            value={userName}
            setValue={(val) => setUserName(val)}
            placeholder={t('pages.profile.enter-your-name')}
          />
          <SexArea
            name={t('pages.profile.sex')}
            currentSex={userSex}
            setCurrentSex={setUserSex}
          />
          <SimpleInputArea
            name={t('pages.profile.age')}
            value={userAge.toString()}
            setValue={(val) => setUserAge(+val)}
            placeholder="25"
          />
          <HeightInputArea
            name={t('pages.profile.height')}
            value={userHeight.toString()}
            setValue={(val) => setUserHeight(+val)}
            placeholder="175"
            measure={userHeightMeasure}
            setMeasure={(val) => setUserHeightMeasure(val)}
          />
          <WeightInputArea
            name={t('pages.profile.weight')}
            value={userWeight.toString()}
            setValue={(val) => setUserWeight(+val)}
            placeholder="60"
            measure={userWeightMeasure}
            setMeasure={(val) => setUserWeightMeasure(val)}
          />
        </View>
      </ScrollView>
      <View className="items-center mt-6">
        <UiButton disabled={isDisabled} onPress={handleSave}>
          {t('basic.save')}
        </UiButton>
      </View>
    </Page>
  );
}
