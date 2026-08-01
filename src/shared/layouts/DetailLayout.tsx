import React, { ReactElement, ReactNode } from 'react';
import styled from 'styled-components/native';

import { AnimatedHeader } from '../components/layout/AnimatedHeader';
import { AppScreen } from './AppScreen';

type DetailLayoutProps = {
  title: string;
  subtitle?: string;
  onBackPress: () => void;
  children: ReactNode;
};

const Content = styled.View`
  padding: ${({ theme }) => theme.spacing.lg}px;
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

export const DetailLayout = ({
  title,
  subtitle,
  onBackPress,
  children,
}: DetailLayoutProps): ReactElement => (
  <AppScreen>
    <AnimatedHeader
      title={title}
      subtitle={subtitle}
      leftIcon="arrow-back"
      leftLabel="Go back"
      onLeftPress={onBackPress}
    />
    <Content>{children}</Content>
  </AppScreen>
);
