import React, { ReactElement } from 'react';
import styled from 'styled-components/native';

import { AppIconButton } from '../buttons/IconButton';
import type { AppIconName } from '../buttons/IconButton';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  leftIcon?: AppIconName;
  leftLabel?: string;
  onLeftPress?: () => void;
  rightIcon?: AppIconName;
  rightLabel?: string;
  onRightPress?: () => void;
};

const Container = styled.View`
  min-height: 64px;
  flex-direction: row;
  align-items: center;
  padding-horizontal: ${({ theme }) => theme.spacing.lg}px;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const TitleBlock = styled.View`
  flex: 1;
`;

const Title = styled.Text`
  ${({ theme }) => theme.typography.h2};
  color: ${({ theme }) => theme.colors.text};
`;

const Subtitle = styled.Text`
  ${({ theme }) => theme.typography.caption};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

const Spacer = styled.View`
  width: 48px;
`;

export const AppHeader = ({
  title,
  subtitle,
  leftIcon,
  leftLabel = 'Back',
  onLeftPress,
  rightIcon,
  rightLabel = 'Action',
  onRightPress,
}: AppHeaderProps): ReactElement => (
  <Container>
    {leftIcon && onLeftPress ? (
      <AppIconButton name={leftIcon} label={leftLabel} onPress={onLeftPress} />
    ) : (
      <Spacer />
    )}
    <TitleBlock>
      <Title numberOfLines={1}>{title}</Title>
      {subtitle ? <Subtitle numberOfLines={1}>{subtitle}</Subtitle> : null}
    </TitleBlock>
    {rightIcon && onRightPress ? (
      <AppIconButton name={rightIcon} label={rightLabel} onPress={onRightPress} />
    ) : (
      <Spacer />
    )}
  </Container>
);
