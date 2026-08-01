import React, { ReactElement } from 'react';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';

import type { MainDrawerParamList } from '../../../../app/navigation/types';
import { AppImages } from '../../../../shared/assets';
import { BaseCard } from '../../../../shared/components/cards/BaseCard';
import { AppHeader } from '../../../../shared/components/layout/AppHeader';
import { InfoBadge } from '../../../../shared/components/ui/InfoBadge';
import { AppScreen } from '../../../../shared/layouts/AppScreen';
import { OnboardingLayout } from '../../../../shared/layouts/OnboardingLayout';

type LayoutNavigation = DrawerNavigationProp<
  MainDrawerParamList,
  'LayoutShowcase'
>;

const Section = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const Title = styled.Text`
  ${({ theme }) => theme.typography.h2};
  color: ${({ theme }) => theme.colors.text};
`;

const Body = styled.Text`
  ${({ theme }) => theme.typography.body};
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const LayoutShowcaseScreen = (): ReactElement => {
  const navigation = useNavigation<LayoutNavigation>();

  return (
    <AppScreen>
      <AppHeader
        title="Layouts"
        subtitle="Screen shells for feature teams"
        leftIcon="menu"
        leftLabel="Open menu"
        onLeftPress={() => navigation.openDrawer()}
      />

      <Section>
        <BaseCard>
          <InfoBadge label="DashboardLayout" tone="primary" />
          <Title>Operational overview</Title>
          <Body>
            Header, scroll content, metrics and horizontal sections are ready
            for home, analytics or marketplace modules.
          </Body>
        </BaseCard>
      </Section>

      <Section>
        <BaseCard>
          <InfoBadge label="DetailLayout" tone="accent" />
          <Title>Detail pages</Title>
          <Body>
            Uses animated header behavior from onboarding and detail emphasis
            from hotel cards.
          </Body>
        </BaseCard>
      </Section>

      <Section>
        <BaseCard padded={false}>
          <OnboardingLayout
            title="OnboardingLayout"
            description="A reusable layout inspired by the introduction animation demo."
            image={AppImages.onboardingCare}
            actionLabel="Continue"
            onAction={() => undefined}
          />
        </BaseCard>
      </Section>
    </AppScreen>
  );
};
