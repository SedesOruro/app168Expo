import React, { ReactElement, useMemo, useState } from 'react';
import { Modal } from 'react-native';
import { MaterialIcons as MaterialIcon } from '@expo/vector-icons';
import styled from 'styled-components/native';

import { PrimaryButton } from '../buttons/PrimaryButton';
import type { DateRange } from '../../types/filters';
import {
  buildMonthDays,
  formatDateRange,
  getMonthLabel,
  isBeforeDay,
  isSameDay,
  isWithinRange,
  startOfDay,
} from '../../utils/date';

type DateRangePickerProps = {
  visible: boolean;
  value: DateRange;
  minimumDate?: Date;
  onChange: (range: DateRange) => void;
  onClose: () => void;
};

const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const Backdrop = styled.Pressable`
  flex: 1;
  justify-content: flex-end;
  background-color: ${({ theme }) => theme.colors.overlay};
`;

const Sheet = styled.View`
  border-top-left-radius: ${({ theme }) => theme.radius.xl}px;
  border-top-right-radius: ${({ theme }) => theme.radius.xl}px;
  padding: ${({ theme }) => theme.spacing.xl}px;
  background-color: ${({ theme }) => theme.colors.background};
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const MonthTitle = styled.Text`
  ${({ theme }) => theme.typography.h2};
  color: ${({ theme }) => theme.colors.text};
`;

const MonthButton = styled.Pressable`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radius.pill}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const RangeLabel = styled.Text`
  ${({ theme }) => theme.typography.bodyStrong};
  color: ${({ theme }) => theme.colors.primaryDark};
`;

const Grid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

const WeekDay = styled.Text`
  width: 14.285%;
  text-align: center;
  ${({ theme }) => theme.typography.caption};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const DayCell = styled.Pressable<{
  $active: boolean;
  $inRange: boolean;
  $disabled: boolean;
}>`
  width: 14.285%;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.pill}px;
  background-color: ${({ theme, $active, $inRange }) => {
    if ($active) {
      return theme.colors.primary;
    }
    if ($inRange) {
      return theme.colors.cardTint;
    }
    return 'transparent';
  }};
  opacity: ${({ $disabled }) => ($disabled ? 0.3 : 1)};
`;

const DayText = styled.Text<{ $active: boolean }>`
  ${({ theme }) => theme.typography.bodyStrong};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.textInverse : theme.colors.text};
`;

const Actions = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const ActionCell = styled.View`
  flex: 1;
`;

const Placeholder = styled.View`
  width: 14.285%;
  min-height: 44px;
`;

export const DateRangePicker = ({
  visible,
  value,
  minimumDate,
  onChange,
  onClose,
}: DateRangePickerProps): ReactElement => {
  const initialMonth = value.startDate ?? minimumDate ?? new Date();
  const [visibleMonth, setVisibleMonth] = useState(startOfDay(initialMonth));
  const [draftRange, setDraftRange] = useState<DateRange>(value);
  const days = useMemo(() => buildMonthDays(visibleMonth), [visibleMonth]);
  const minDate = minimumDate ? startOfDay(minimumDate) : null;

  const moveMonth = (direction: -1 | 1): void => {
    setVisibleMonth(
      current => new Date(current.getFullYear(), current.getMonth() + direction, 1),
    );
  };

  const selectDay = (day: Date): void => {
    if (minDate && isBeforeDay(day, minDate)) {
      return;
    }

    if (
      !draftRange.startDate ||
      draftRange.endDate ||
      isBeforeDay(day, draftRange.startDate)
    ) {
      setDraftRange({ startDate: day, endDate: null });
      return;
    }

    setDraftRange({ startDate: draftRange.startDate, endDate: day });
  };

  const apply = (): void => {
    onChange(draftRange);
    onClose();
  };

  const reset = (): void => {
    setDraftRange({ startDate: null, endDate: null });
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Backdrop accessibilityLabel="Close calendar" onPress={onClose}>
        <Sheet onStartShouldSetResponder={() => true}>
          <Header>
            <MonthButton
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              onPress={() => moveMonth(-1)}
            >
              <MaterialIcon name="chevron-left" size={26} color="#0AA7A5" />
            </MonthButton>
            <MonthTitle>{getMonthLabel(visibleMonth)}</MonthTitle>
            <MonthButton
              accessibilityRole="button"
              accessibilityLabel="Next month"
              onPress={() => moveMonth(1)}
            >
              <MaterialIcon name="chevron-right" size={26} color="#0AA7A5" />
            </MonthButton>
          </Header>

          <RangeLabel>{formatDateRange(draftRange)}</RangeLabel>

          <Grid>
            {WEEK_DAYS.map((label, index) => (
              <WeekDay key={`${label}-${index}`}>{label}</WeekDay>
            ))}
            {days.map((day, index) => {
              if (!day) {
                return <Placeholder key={`empty-${index}`} />;
              }

              const isStart = draftRange.startDate
                ? isSameDay(day, draftRange.startDate)
                : false;
              const isEnd = draftRange.endDate
                ? isSameDay(day, draftRange.endDate)
                : false;
              const disabled = minDate ? isBeforeDay(day, minDate) : false;

              return (
                <DayCell
                  key={day.toISOString()}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${day.getDate()}`}
                  $active={isStart || isEnd}
                  $inRange={isWithinRange(day, draftRange)}
                  $disabled={disabled}
                  disabled={disabled}
                  onPress={() => selectDay(day)}
                >
                  <DayText $active={isStart || isEnd}>{day.getDate()}</DayText>
                </DayCell>
              );
            })}
          </Grid>

          <Actions>
            <ActionCell>
              <PrimaryButton title="Reset" variant="ghost" onPress={reset} />
            </ActionCell>
            <ActionCell>
              <PrimaryButton title="Apply dates" onPress={apply} />
            </ActionCell>
          </Actions>
        </Sheet>
      </Backdrop>
    </Modal>
  );
};
