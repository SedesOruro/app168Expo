import React, { ReactElement } from 'react';
import { TextInputProps } from 'react-native';
import { MaterialIcons as MaterialIcon } from '@expo/vector-icons';
import styled from 'styled-components/native';

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
}: SearchFieldProps): ReactElement => (
  <Container accessibilityLabel={label}>
    <Input
      accessibilityLabel={label}
      placeholder={placeholder}
      placeholderTextColor="#7D8E98"
      {...props}
    />
    <MaterialIcon name="search" size={24} color="#7D8E98" />
  </Container>
);
