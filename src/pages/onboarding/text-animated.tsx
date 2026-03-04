import { scaleX } from '@kirz/nativewind-scale';
import { useEffect } from 'react';
import { StyleProp, TextInput, TextStyle, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';

const alphabet = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#\$%^&*()_+-=[]\;',./<>?:"{}|`;

Animated.addWhitelistedNativeProps({
  text: true,
  value: true,
});

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type ReTextProps = {
  text: SharedValue<string>;
  style: StyleProp<TextStyle>;
};

type WordProps = {
  char: string;
  uppercase?: boolean;
  shouldAnimate?: boolean;
  style: StyleProp<TextStyle>;
};

type SentenceProps = {
  text: string;
  style: StyleProp<TextStyle>;
  uppercase?: boolean;
};

const ReText = ({ style, text }: ReTextProps) => {
  const animatedProps = useAnimatedProps(() => {
    return {
      text: String(text.value),
      defaultValue: String(text.value),
    };
  });

  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      style={style}
      animatedProps={animatedProps}
    />
  );
};

const Word = ({ char, shouldAnimate, style, uppercase }: WordProps) => {
  const value = useSharedValue(0);
  const maxTimes = useSharedValue(Math.floor(Math.random() * 10) + 10);

  useEffect(() => {
    const random = () => Math.floor(Math.random() * (alphabet.length - 1));
    const randomTimeout = Math.floor(Math.random() * 20) + 10;
    let times = 0;
    let timeoutId: NodeJS.Timeout | null = null;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const animate = () => {
      timeoutId = setTimeout(() => {
        if (times === maxTimes.value) {
          value.value = alphabet.indexOf(
            uppercase ? String(char).toUpperCase() : char
          );
          return;
        }
        value.value = random();
        times += 1;
        animate();
      }, randomTimeout);
    };

    if (shouldAnimate) {
      animate();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    // value.value = withTiming(random(), {duration: 1000, delay: 0});
  }, [char]);

  const animatedChar = useDerivedValue(() => {
    return alphabet[value.value] as string;
  });

  return <ReText text={animatedChar} style={style} />;
};

export function HackerText({ text, style, uppercase }: SentenceProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {text.split(' ').map((word, index) => {
        return (
          <View
            key={`word-${index}`}
            style={{
              flexDirection: 'row',
              marginRight: scaleX(10),
            }}
          >
            {word.split('').map((char, index) => {
              return (
                <Word
                  key={`${char}-${index}`}
                  char={char}
                  style={[style, { fontFamily: 'Menlo' }]}
                  uppercase={uppercase}
                  shouldAnimate={
                    char.indexOf(`!@#$%^&*()_+-=[]\;',./<>?:"{}|`) === -1 ||
                    char === ' '
                  }
                />
              );
            })}
          </View>
        );
      })}
    </View>
  );
}
