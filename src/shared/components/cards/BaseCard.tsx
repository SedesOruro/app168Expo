import React, { ReactElement, ReactNode } from 'react';
import { PressableProps } from 'react-native';
import styled from 'styled-components/native';

type BaseCardProps = PressableProps & {
  children: ReactNode;
  padded?: boolean;
};

const Card = styled.Pressable<{ $padded: boolean }>`
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme, $padded }) => ($padded ? theme.spacing.lg : 0)}px;
  overflow: hidden;
  ${({ theme }) => theme.shadows.md};
`;

export const BaseCard = ({
  children,
  padded = true,
  ...props
}: BaseCardProps): ReactElement => (
  <Card
    accessibilityRole={props.onPress ? 'button' : undefined}
    $padded={padded}
    style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
    {...props}
  >
    {children}
  </Card>
);
