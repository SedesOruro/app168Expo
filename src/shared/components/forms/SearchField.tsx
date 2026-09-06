import React, { ReactElement } from 'react';
import { TextInputProps } from 'react-native';
import { MaterialIcons as MaterialIcon } from '@expo/vector-icons';
import styled, { useTheme } from 'styled-components/native';

import type { AppTheme } from '../../theme';

type SearchFieldProps = TextInputProps & {
  label: string;
};

const Container = styled.View`
  min-height: 52px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
  flex-direction: row;
  align-items: center;
  padding-horizontal: ${({ theme }) => theme.spacing.lg}px;
  ${({ theme }) => theme.shadows.sm};
`;

const Input = styled.TextInput`
  flex: 1;
  ${({ theme }) => theme.typography.body};
  color: ${({ theme }) => theme.colors.text};
  padding-vertical: ${({ theme }) => theme.spacing.sm}px;
`;

export const SearchField = ({
  label,
  placeholder = 'Search',
  ...props
}: SearchFieldProps): ReactElement => {
  const tema = useTheme() as AppTheme;

  return (
  <Container accessibilityLabel={label}>
    <Input
      accessibilityLabel={label}
      placeholder={placeholder}
      placeholderTextColor={tema.colors.textMuted}
      {...props}
    />
    <MaterialIcon name="search" size={24} color={tema.colors.textMuted} />
  </Container>
  );
};
