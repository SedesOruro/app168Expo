import React, { ReactElement, ReactNode } from 'react';
import { ImageSourcePropType } from 'react-native';
import styled from 'styled-components/native';

import { PrimaryButton } from '../components/buttons/PrimaryButton';

type OnboardingLayoutProps = {
  title: string;
  description: string;
  image: ImageSourcePropType;
  actionLabel: string;
  onAction: () => void;
  children?: ReactNode;
};

const Container = styled.View`
  min-height: 560px;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.xl}px;
  justify-content: center;
`;

const Illustration = styled.Image`
  width: 100%;
  height: 260px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
`;

const Title = styled.Text`
  ${({ theme }) => theme.typography.h1};
  color: ${({ theme }) => theme.colors.text};
  margin-top: ${({ theme }) => theme.spacing.xl}px;
`;

const Description = styled.Text`
  ${({ theme }) => theme.typography.body};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

export const OnboardingLayout = ({
  title,
  description,
  image,
  actionLabel,
  onAction,
  children,
}: OnboardingLayoutProps): ReactElement => (
  <Container>
    <Illustration source={image} resizeMode="cover" />
    <Title>{title}</Title>
    <Description>{description}</Description>
    {children}
    <PrimaryButton title={actionLabel} onPress={onAction} />
  </Container>
);
