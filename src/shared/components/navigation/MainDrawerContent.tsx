import React, { ReactElement } from 'react';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { MaterialIcons as MaterialIcon } from '@expo/vector-icons';
import styled from 'styled-components/native';

import { useAuth } from '../../../app/providers/AuthProvider';
import { AppImages } from '../../assets';

type DrawerLink = {
  label: string;
  icon: React.ComponentProps<typeof MaterialIcon>['name'];
  route: string;
};

const LINKS: DrawerLink[] = [
  { label: 'Dashboard', icon: 'dashboard', route: 'Dashboard' },
  { label: 'Components', icon: 'widgets', route: 'ComponentsShowcase' },
  { label: 'Layouts', icon: 'view-quilt', route: 'LayoutShowcase' },
  { label: 'Theme', icon: 'palette', route: 'ThemeShowcase' },
];

const Container = styled.View`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xl}px ${({ theme }) => theme.spacing.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const Avatar = styled.Image`
  width: 88px;
  height: 88px;
  border-radius: ${({ theme }) => theme.radius.pill}px;
`;

const Name = styled.Text`
  ${({ theme }) => theme.typography.h3};
  color: ${({ theme }) => theme.colors.text};
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const Email = styled.Text`
  ${({ theme }) => theme.typography.caption};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const LinkButton = styled.Pressable<{ $active: boolean }>`
  min-height: 48px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  flex-direction: row;
  align-items: center;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.cardTint : 'transparent'};
`;

const LinkText = styled.Text<{ $active: boolean }>`
  ${({ theme }) => theme.typography.bodyStrong};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primaryDark : theme.colors.text};
  margin-left: ${({ theme }) => theme.spacing.md}px;
`;

const FooterButton = styled.Pressable`
  min-height: 48px;
  flex-direction: row;
  align-items: center;
  margin-top: auto;
`;

export const MainDrawerContent = ({
  state,
  navigation,
}: DrawerContentComponentProps): ReactElement => {
  const { user, signOut } = useAuth();
  const activeRoute = state.routeNames[state.index];

  return (
    <Container>
      <Avatar source={AppImages.profile} />
      <Name>{user?.name ?? 'Product Builder'}</Name>
      <Email>{user?.email ?? 'product@desarrollo.dev'}</Email>

      {LINKS.map(link => {
        const active = activeRoute === link.route;

        return (
          <LinkButton
            key={link.route}
            accessibilityRole="button"
            accessibilityLabel={link.label}
            $active={active}
            onPress={() => navigation.navigate(link.route)}
          >
            <MaterialIcon
              name={link.icon}
              size={22}
              color={active ? '#057C7B' : '#5F7180'}
            />
            <LinkText $active={active}>{link.label}</LinkText>
          </LinkButton>
        );
      })}

      <FooterButton
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        onPress={() => {
          signOut().catch(() => undefined);
        }}
      >
        <MaterialIcon name="logout" size={22} color="#D92D20" />
        <LinkText $active={false}>Sign out</LinkText>
      </FooterButton>
    </Container>
  );
};
