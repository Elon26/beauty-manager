import { Dispatch, SetStateAction } from 'react';
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import AgenderIcon from '@/svg/agender.svg';
import FemaleIcon from '@/svg/female.svg';
import MaleIcon from '@/svg/male.svg';
import UserSex from '@/types/user-sex';
import { Pressable } from '@/ui/pressable';
import { UiText } from '@/ui/ui-text';

type Props = {
  name: string;
  currentSex: UserSex | null;
  setCurrentSex: Dispatch<SetStateAction<UserSex | null>>;
};

export default function SexArea({ name, currentSex, setCurrentSex }: Props) {
  return (
    <View className="gap-y-1">
      <UiText className="font-semibold ml-4">{name}</UiText>
      <View className="flex-row -mx-1">
        <Pressable
          className="w-[33%] px-1 h-12"
          onPress={() => setCurrentSex('Male')}
        >
          <View
            className={twMerge(
              'flex-row items-center justify-center rounded-full border bg-grayLight gap-x-1.5 h-full',
              currentSex === 'Male' ? 'border-primary' : 'border-grayLight'
            )}
          >
            <MaleIcon />
            <UiText className="text-sm">{t('pages.profile.male')} </UiText>
          </View>
        </Pressable>
        <Pressable
          className="w-[33%] px-1 h-12"
          onPress={() => setCurrentSex('Female')}
        >
          <View
            className={twMerge(
              'flex-row items-center justify-center rounded-full border bg-grayLight gap-x-1.5 h-full',
              currentSex === 'Female' ? 'border-primary' : 'border-grayLight'
            )}
          >
            <FemaleIcon />
            <UiText className="text-sm">{t('pages.profile.female')} </UiText>
          </View>
        </Pressable>
        <Pressable
          className="w-[33%] px-1 h-12"
          onPress={() => setCurrentSex('Agender')}
        >
          <View
            className={twMerge(
              'flex-row items-center justify-center rounded-full border bg-grayLight gap-x-1.5 h-full',
              currentSex === 'Agender' ? 'border-primary' : 'border-grayLight'
            )}
          >
            <AgenderIcon />
            <UiText className="text-sm">{t('pages.profile.agender')} </UiText>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
