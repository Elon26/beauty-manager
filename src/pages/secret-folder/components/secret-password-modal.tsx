import { type Dispatch, type SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Switch, useWindowDimensions, View } from 'react-native';
import { type ModalComponentProp, useModal } from 'react-native-modalfy';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ModalStackParams } from '@/components/modals';
import { colors } from '@/config/theme';
import { ButtonPrimary } from '@/ui/button-primary';
import { UiText } from '@/ui/ui-text';
import { UiTextInput } from '@/ui/ui-text-input';

import { SfSymbol } from '@/ui/sf-symbol';
import { scaleX } from '@kirz/nativewind-scale';
import {
  addPassword,
  updatePassword,
  useSecretPassword,
} from '../hooks/use-secret-passwords';
import {
  charSets,
  generatePassword,
} from '../hooks/use-secret-passwords/helper';
import { PasswordLengthSlider } from './password-length-slider';

type Charset = keyof typeof charSets;
const DEFAULT_CHARSET: Charset[] = ['digits', 'letters'];
const DEFAULT_PASSWORD_LENGTH = 8;

export function SecretPasswordModal({
  modal: { params },
}: ModalComponentProp<ModalStackParams, object, 'SecretPasswordModal'>) {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const id = params?.id;
  const pw = useSecretPassword(id ?? '');

  let initialCharset: Charset[] = DEFAULT_CHARSET;
  let initialPasswordLength = DEFAULT_PASSWORD_LENGTH;
  if (pw?.password?.length) {
    const p = pw.password;
    initialCharset = [];
    initialPasswordLength = p.length;
    for (const [name, chars] of Object.entries(charSets)) {
      if (new RegExp(`[${chars}]`, 'g').test(p)) {
        initialCharset.push(name as Charset);
      }
    }
  }

  const [charset, setCharset] = useState(initialCharset);
  const [passwordLength, setPasswordLength] = useState(initialPasswordLength);

  const useLink = useState(pw?.link ?? '');
  const useUsername = useState(pw?.login ?? '');
  const usePassword = useState(
    pw?.password ?? generatePassword(initialPasswordLength, charset)
  );

  const [link, login, password] = [useLink[0], useUsername[0], usePassword[0]];

  const getStateHash = () => JSON.stringify({ link, login, password });

  const [initialHash] = useState(() => getStateHash());

  const isChanged = initialHash !== getStateHash();

  const submitDisabled = !link || !login || !password || !isChanged;
  const modal = useModal<ModalStackParams>();

  const handleSubmit = () => {
    if (id) {
      updatePassword({
        id,
        link,
        login,
        password,
      });
    } else {
      addPassword({
        link,
        login,
        password,
      });
    }
  };

  return (
    <View
      className="bg-white px-edge"
      style={{
        width,
        height,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View className="justify-center mb-2">
        <Pressable
          className="z-10 flex-row items-center top-6"
          onPress={() => {
            modal.closeModal('SecretPasswordModal');
          }}
        >
          <SfSymbol
            name="chevron.backward"
            tintColor={colors.text.toString()}
            size={scaleX(16)}
          />
          <UiText className="text-black ml-1">{t('basic.back')}</UiText>
        </Pressable>

        <UiText className="text-center text-lg font-medium mt-1">
          {id === undefined
            ? t('pages.secret-folder.passwords.modal.title')
            : t('pages.secret-folder.passwords.modal.edit-password')}
        </UiText>
      </View>
      <Form
        charsets={charset}
        passwordLength={passwordLength}
        setPasswordLength={setPasswordLength}
        useLink={useLink}
        usePassword={usePassword}
        useUsername={useUsername}
      />
      <Buttons
        currentCharsets={charset}
        handleSubmit={handleSubmit}
        passwordLength={passwordLength}
        setCharset={setCharset}
        setPassword={usePassword[1]}
        submitDisabled={submitDisabled}
      />
    </View>
  );
}

type FormProps = {
  useLink: [string, Dispatch<SetStateAction<string>>];
  useUsername: [string, Dispatch<SetStateAction<string>>];
  usePassword: [string, Dispatch<SetStateAction<string>>];
  passwordLength: number;
  setPasswordLength: Dispatch<SetStateAction<number>>;
  charsets: Charset[];
};

function Form({
  useLink,
  usePassword,
  useUsername,
  passwordLength,
  setPasswordLength,
  charsets,
}: FormProps) {
  const { t } = useTranslation();
  const [link, setLink] = useLink;
  const [username, setUsername] = useUsername;
  const [password, setPassword] = usePassword;

  return (
    <View className="gap-6 my-1.5">
      <View className="rounded-2xl bg-[#F8F8F8] gap-2 p-4">
        <UiTextInput
          autoCapitalize="none"
          keyboardType="url"
          label={t('pages.secret-folder.passwords.modal.link-label')}
          onChangeText={setLink}
          placeholder={t(
            'pages.secret-folder.passwords.modal.link-placeholder'
          )}
          value={link}
        />
        <UiTextInput
          keyboardType="default"
          label={t('pages.secret-folder.passwords.username')}
          onChangeText={setUsername}
          placeholder={t(
            'pages.secret-folder.passwords.modal.username-placeholder'
          )}
          value={username}
        />
        <UiTextInput
          keyboardType="visible-password"
          label={t('pages.secret-folder.passwords.password')}
          onChangeText={setPassword}
          placeholder={t(
            'pages.secret-folder.passwords.modal.password-placeholder'
          )}
          returnKeyType="done"
          isPassword
          submitBehavior="blurAndSubmit"
          value={password}
        />
      </View>
      <Pressable
        className="items-center rounded-full bg-primary mx-10 py-2.5"
        onPress={() => setPassword(generatePassword(passwordLength, charsets))}
      >
        <UiText className="text-lg font-semibold text-white">
          {t('pages.secret-folder.passwords.modal.generate-password')}
        </UiText>
      </Pressable>

      <PasswordLengthSlider
        onChange={(val) => {
          setPasswordLength(val);
          if (typeof val === 'number') {
            setPassword(generatePassword(val, charsets));
          }
        }}
        value={passwordLength}
      />
    </View>
  );
}

const options: [string, string, Charset][] = [
  ['Digits', 'e.g. 123', 'digits'],
  ['Letters', 'e.g. abc', 'letters'],
  ['Symbols', 'e.g.%!#', 'symbols'],
];

type ButtonsProps = {
  currentCharsets: Charset[];
  setCharset: Dispatch<SetStateAction<Charset[]>>;
  setPassword: Dispatch<SetStateAction<string>>;
  passwordLength: number;
  submitDisabled: boolean;
  handleSubmit: () => void;
};

function Buttons({
  currentCharsets,
  setCharset,
  setPassword,
  passwordLength,
  submitDisabled,
  handleSubmit,
}: ButtonsProps) {
  const { t } = useTranslation();
  const modal = useModal<ModalStackParams>();

  const isCharsetEnabled = (name: Charset) => currentCharsets.includes(name);

  const toggleCharset = (name: Charset) => {
    setCharset((charsets) => {
      const newCS = charsets.includes(name)
        ? charsets.filter((charset) => charset !== name)
        : [...charsets, name];

      if (newCS.length === 0) {
        setPassword(generatePassword(passwordLength, ['letters']));
        return ['letters'];
      }
      setPassword(generatePassword(passwordLength, newCS));
      return newCS;
    });
  };

  console.log(options);

  return (
    <View>
      <View className="rounded-2xl bg-[#F8F8F8] gap-4 p-4">
        {options.map(([title, subtitle, charset]) => (
          <View className="flex-row items-center gap-2" key={title}>
            <UiText className="font-medium">
              {t(
                `pages.secret-folder.passwords.modal.options.${title.toLowerCase()}`
              )}
            </UiText>
            <UiText className="text-sm text-[#9C9C9C]">
              (
              {t(
                `pages.secret-folder.passwords.modal.options.${title.toLowerCase()}-example`,
                { defaultValue: subtitle }
              )}
              )
            </UiText>
            <View className="flex-1" />

            <Switch
              onValueChange={() => toggleCharset(charset)}
              thumbColor={colors.white.toString()}
              value={isCharsetEnabled(charset)}
            />
          </View>
        ))}
      </View>
      <View className="gap-2 pt-6">
        <ButtonPrimary
          disabled={submitDisabled}
          label={t('basic.continue')}
          onPress={() => {
            if (!submitDisabled) {
              handleSubmit();
              modal.closeModal('SecretPasswordModal');
            }
          }}
        />
      </View>
    </View>
  );
}
