import React, { ReactElement } from 'react';
import { MaterialIcons as MaterialIcon } from '@expo/vector-icons';
import styled, { useTheme } from 'styled-components/native';

import type { AppTheme } from '../../theme';

type InfoBadgeProps = {
  label: string;
  icon?: React.ComponentProps<typeof MaterialIcon>['name'];
  tone?: 'primary' | 'neutral' | 'accent';
};

const BadgeContainer = styled.View<{ $tone: NonNullable<InfoBadgeProps['tone']> }>`
  min-height: 32px;
  border-radius: ${({ theme }) => theme.radius.pill}px;
  flex-direction: row;
  align-items: center;
  align-self: flex-start;
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme, $tone }) => {
    if ($tone === 'primary') {
      return theme.colors.cardTint;
    }
    if ($tone === 'accent') {
      return theme.colors.highlight;
    }
    return theme.colors.surfaceMuted;
  }};
`;

const BadgeText = styled.Text`
  ${({ theme }) => theme.typography.caption};
  color: ${({ theme }) => theme.colors.text};
`;

export const InfoBadge = ({
  label,
  icon,
  tone = 'neutral',
}: InfoBadgeProps): ReactElement => {
  const tema = useTheme() as AppTheme;

  return (
  <BadgeContainer $tone={tone} accessibilityLabel={label}>
    {icon ? (
      <MaterialIcon
        name={icon}
        size={16}
        color={tema.colors.primary}
        style={{ marginRight: 4 }}
      />
    ) : null}
    <BadgeText>{label}</BadgeText>
  </BadgeContainer>
  );
};
