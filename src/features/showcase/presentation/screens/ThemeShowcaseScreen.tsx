import React, { ReactElement } from 'react';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import styled, { useTheme } from 'styled-components/native';

import type { MainDrawerParamList } from '../../../../app/navigation/types';
import { AppHeader } from '../../../../shared/components/layout/AppHeader';
import { AppScreen } from '../../../../shared/layouts/AppScreen';

type ThemeNavigation = DrawerNavigationProp<MainDrawerParamList, 'ThemeShowcase'>;

const Section = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.lg}px;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const SwatchGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const Swatch = styled.View<{ $color: string }>`
  width: 96px;
  height: 96px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ $color }) => $color};
  justify-content: flex-end;
  padding: ${({ theme }) => theme.spacing.sm}px;
`;

const SwatchText = styled.Text`
  ${({ theme }) => theme.typography.caption};
  color: white;
`;

const TypeBlock = styled.View`
  padding: ${({ theme }) => theme.spacing.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radius.lg}px;
`;

const H1 = styled.Text`
  ${({ theme }) => theme.typography.h1};
  color: ${({ theme }) => theme.colors.text};
`;

const Body = styled.Text`
  ${({ theme }) => theme.typography.body};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

export const ThemeShowcaseScreen = (): ReactElement => {
  const navigation = useNavigation<ThemeNavigation>();
  const theme = useTheme();
  const colorEntries: [string, string][] = [
    ['primary', theme.colors.primary],
    ['secondary', theme.colors.secondary],
    ['accent', theme.colors.accent],
    ['surface', theme.colors.surface],
    ['text', theme.colors.text],
    ['danger', theme.colors.danger],
  ];

  return (
    <AppScreen>
      <AppHeader
        title="Theme"
        subtitle={theme.isDark ? 'Dark mode active' : 'Light mode active'}
        leftIcon="menu"
        leftLabel="Open menu"
        onLeftPress={() => navigation.openDrawer()}
      />
      <Section>
        <SwatchGrid>
          {colorEntries.map(([label, color]) => (
            <Swatch key={label} $color={color}>
              <SwatchText>{label}</SwatchText>
            </Swatch>
          ))}
        </SwatchGrid>

        <TypeBlock>
          <H1>WorkSans typography</H1>
          <Body>
            Scale, radius, spacing, shadows and Paper colors live in one theme.
          </Body>
        </TypeBlock>
      </Section>
    </AppScreen>
  );
};
