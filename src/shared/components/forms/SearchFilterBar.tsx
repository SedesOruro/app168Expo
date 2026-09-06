import React, { ReactElement } from 'react';
import { MaterialIcons as MaterialIcon } from '@expo/vector-icons';
import styled, { useTheme } from 'styled-components/native';

import type { AppTheme } from '../../theme';

import { SearchField } from './SearchField';

type SearchFilterBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onFilterPress: () => void;
  onCalendarPress?: () => void;
  activeFilterCount?: number;
  placeholder?: string;
};

const Container = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const SearchWrap = styled.View`
  flex: 1;
`;

const ActionButton = styled.Pressable`
  width: 52px;
  height: 52px;
  border-radius: ${({ theme }) => theme.radius.pill}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surface};
  ${({ theme }) => theme.shadows.sm};
`;

const CountBadge = styled.View`
  min-width: 18px;
  height: 18px;
  border-radius: ${({ theme }) => theme.radius.pill}px;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: ${({ theme }) => theme.colors.accent};
`;

const CountText = styled.Text`
  ${({ theme }) => theme.typography.caption};
  color: ${({ theme }) => theme.colors.text};
`;

export const SearchFilterBar = ({
  query,
  onQueryChange,
  onFilterPress,
  onCalendarPress,
  activeFilterCount = 0,
  placeholder = 'Search',
}: SearchFilterBarProps): ReactElement => {
  const tema = useTheme() as AppTheme;

  return (
  <Container>
    <SearchWrap>
      <SearchField
        label="Search"
        placeholder={placeholder}
        value={query}
        onChangeText={onQueryChange}
      />
    </SearchWrap>

    {onCalendarPress ? (
      <ActionButton
        accessibilityRole="button"
        accessibilityLabel="Open calendar"
        onPress={onCalendarPress}
      >
        <MaterialIcon name="calendar-today" size={22} color={tema.colors.primary} />
      </ActionButton>
    ) : null}

    <ActionButton
      accessibilityRole="button"
      accessibilityLabel="Open filters"
      onPress={onFilterPress}
    >
      <MaterialIcon name="tune" size={24} color={tema.colors.primary} />
      {activeFilterCount > 0 ? (
        <CountBadge>
          <CountText>{activeFilterCount}</CountText>
        </CountBadge>
      ) : null}
    </ActionButton>
  </Container>
  );
};
