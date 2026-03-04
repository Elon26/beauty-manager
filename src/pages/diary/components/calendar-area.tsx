import { scaleX } from '@kirz/nativewind-scale';
import { Dispatch, SetStateAction } from 'react';
import { Pressable, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { twMerge } from 'tailwind-merge';

import { colors } from '@/config/theme';
import { useStorageValue } from '@/hooks/use-storage';
import CalendarDate from '@/types/calendar-date';
import { SfSymbol } from '@/ui/sf-symbol';
import { UiText } from '@/ui/ui-text';

type Props = {
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
};

export default function CalendarArea({ selectedDate, setSelectedDate }: Props) {
  const storedImages = useStorageValue('storedImages');
  const startDateYear = selectedDate.getFullYear();
  const startDateMonth = selectedDate.getMonth() + 1;
  const startDateDay = selectedDate.getDate();

  function selectDate(date: CalendarDate) {
    const today = new Date(date.timestamp);
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0
    );

    setSelectedDate(todayDate);
  }

  return (
    <View className="rounded-3xl">
      <Calendar
        style={{
          borderRadius: 24,
          overflow: 'hidden',
          backgroundColor: colors.grayLight.toString(),
        }}
        current={
          startDateYear.toString() +
          '-' +
          startDateMonth.toString() +
          '-' +
          startDateDay
        }
        firstDay={1}
        theme={{
          calendarBackground: colors.grayLight.toString(),
          textMonthFontWeight: 'bold',
          monthTextColor: '#23242B',
          arrowColor: '#23242B',
          textSectionTitleColor: '#23242B',
        }}
        dayComponent={({
          date,
          state,
        }: {
          date: CalendarDate;
          state: String;
        }) => {
          const today = new Date();
          const isToday =
            date.year === today.getFullYear() &&
            date.month === today.getMonth() + 1 &&
            date.day === today.getDate();
          const isSelectedDay =
            date.year === startDateYear &&
            date.month === startDateMonth &&
            date.day === startDateDay;
          const hasPhoto = storedImages.some((item) => {
            const dateTime = new Date(item.date).getTime();
            const widgetDate = new Date(date.timestamp);
            const selectedDate = new Date(
              widgetDate.getFullYear(),
              widgetDate.getMonth(),
              widgetDate.getDate(),
              0,
              0,
              0
            );
            const selectedDateTime = selectedDate.getTime();

            return dateTime === selectedDateTime;
          });

          return (
            <Pressable
              className={twMerge(
                'items-center justify-center rounded-lg border gap-y-2.5 size-8',
                isToday ? 'bg-primary' : '',
                isSelectedDay ? 'border-primary' : 'border-grayLight'
              )}
              onPress={() => {
                selectDate(date);
              }}
            >
              <UiText
                style={{
                  color:
                    state === 'disabled'
                      ? '#B9B9B9'
                      : isToday
                        ? 'white'
                        : 'black',
                }}
              >
                {date.day}
              </UiText>
              {hasPhoto && (
                <View className="absolute rounded-full bg-green -right-1 -top-1 size-3" />
              )}
            </Pressable>
          );
        }}
        renderArrow={(direction: string) => (
          <View className="items-center justify-center rounded-xl size-7">
            {direction === 'left' ? (
              <SfSymbol
                name="chevron.left"
                size={scaleX(16)}
                weight="medium"
                tintColor={colors.grayDark.toString()}
              />
            ) : (
              <SfSymbol
                name="chevron.right"
                size={scaleX(16)}
                weight="medium"
                tintColor={colors.grayDark.toString()}
              />
            )}
          </View>
        )}
      />
    </View>
  );
}
