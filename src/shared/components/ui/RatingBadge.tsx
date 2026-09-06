import React, { ReactElement } from 'react';
import { MaterialIcons as MaterialIcon } from '@expo/vector-icons';
import styled, { useTheme } from 'styled-components/native';

import type { AppTheme } from '../../theme';

type RatingBadgeProps = {
  value: number;
  reviews?: number;
};

const Container = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Text = styled.Text`
  ${({ theme }) => theme.typography.caption};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-left: ${({ theme }) => theme.spacing.xs}px;
`;

export const RatingBadge = ({ value, reviews }: RatingBadgeProps): ReactElement => {
  const tema = useTheme() as AppTheme;

  return (
  <Container accessibilityLabel={`Rating ${value}`}>
    <MaterialIcon name="star" size={18} color={tema.colors.accent} />
    <Text>
      {value.toFixed(1)}
      {reviews !== undefined ? ` (${reviews})` : ''}
    </Text>
  </Container>
  );
};
