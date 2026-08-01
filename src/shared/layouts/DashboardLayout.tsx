import React, { ReactElement, ReactNode } from 'react';
import styled from 'styled-components/native';

import { AppHeader } from '../components/layout/AppHeader';
import { AppScreen } from './AppScreen';

type DashboardLayoutProps = {
  title: string;
  subtitle?: string;
  onMenuPress: () => void;
  children: ReactNode;
};

const Content = styled.View`
  gap: ${({ theme }) => theme.spacing.xl}px;
`;

export const DashboardLayout = ({
  title,
  subtitle,
  onMenuPress,
  children,
}: DashboardLayoutProps): ReactElement => (
  <AppScreen>
    <AppHeader
      title={title}
      subtitle={subtitle}
      leftIcon="menu"
      leftLabel="Open menu"
      onLeftPress={onMenuPress}
      rightIcon="notifications-none"
      rightLabel="Notifications"
      onRightPress={() => undefined}
    />
    <Content>{children}</Content>
  </AppScreen>
);
