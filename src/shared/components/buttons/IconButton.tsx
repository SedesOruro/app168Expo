import React, { ReactElement } from 'react';
import { PressableProps } from 'react-native';
import { MaterialIcons as MaterialIcon } from '@expo/vector-icons';
import styled, { useTheme } from 'styled-components/native';

import type { AppTheme } from '../../theme';

export type AppIconName = React.ComponentProps<typeof MaterialIcon>['name'];

type AppIconButtonProps = PressableProps & {
  name: AppIconName;
  label: string;
  size?: number;
  tone?: 'surface' | 'primary';
};

const IconButtonContainer = styled.Pressable<{ $tone: 'surface' | 'primary' }>`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radius.pill}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $tone }) =>
    $tone === 'primary' ? theme.colors.primary : theme.colors.surface};
  ${({ theme }) => theme.shadows.sm};
`;

export const AppIconButton = ({
  name,
  label,
  size = 24,
  tone = 'surface',
  ...props
}: AppIconButtonProps): ReactElement => {
  const tema = useTheme() as AppTheme;

  return (
  <IconButtonContainer
    accessibilityRole="button"
    accessibilityLabel={label}
    $tone={tone}
    style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}
    {...props}
  >
    <MaterialIcon
      name={name}
      size={size}
      color={tone === 'primary' ? tema.colors.onFill : tema.colors.text}
    />
  </IconButtonContainer>
  );
};
