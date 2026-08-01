import React, { ReactElement, ReactNode } from 'react';
import styled from 'styled-components/native';

import { AppImages } from '../assets';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Hero = styled.ImageBackground`
  min-height: 260px;
  justify-content: flex-end;
  padding: ${({ theme }) => theme.spacing.xl}px;
`;

const Scrim = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;

const Title = styled.Text`
  ${({ theme }) => theme.typography.h1};
  color: white;
`;

const Subtitle = styled.Text`
  ${({ theme }) => theme.typography.body};
  color: rgba(255, 255, 255, 0.88);
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

const FormPanel = styled.View`
  flex: 1;
  margin-top: -24px;
  border-top-left-radius: ${({ theme }) => theme.radius.xl}px;
  border-top-right-radius: ${({ theme }) => theme.radius.xl}px;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.xl}px;
`;

export const AuthLayout = ({
  title,
  subtitle,
  children,
}: AuthLayoutProps): ReactElement => (
  <Container>
    <Hero source={AppImages.onboardingIntro} resizeMode="cover">
      <Scrim style={{ backgroundColor: 'rgba(0, 0, 0, 0.38)' }} />
      <Title>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
    </Hero>
    <FormPanel>{children}</FormPanel>
  </Container>
);
