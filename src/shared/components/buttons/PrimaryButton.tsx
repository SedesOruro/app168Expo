import React, { ReactElement } from 'react';
import { ActivityIndicator, PressableProps } from 'react-native';
import styled from 'styled-components/native';

type PrimaryButtonVariant = 'primary' | 'secondary' | 'ghost';

type PrimaryButtonProps = PressableProps & {
  title: string;
  variant?: PrimaryButtonVariant;
  loading?: boolean;
};

const ButtonContainer = styled.Pressable<{ $variant: PrimaryButtonVariant }>`
  min-height: 48px;
  border-radius: ${({ theme }) => theme.radius.pill}px;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.xl}px;
  background-color: ${({ theme, $variant }) => {
    if ($variant === 'secondary') {
      return theme.colors.secondary;
    }
    if ($variant === 'ghost') {
      return 'transparent';
    }
    return theme.colors.primary;
  }};
  border-width: ${({ $variant }) => ($variant === 'ghost' ? 1 : 0)}px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const ButtonText = styled.Text<{ $variant: PrimaryButtonVariant }>`
  ${({ theme }) => theme.typography.bodyStrong};
  color: ${({ theme, $variant }) =>
    $variant === 'ghost' ? theme.colors.text : theme.colors.textInverse};
`;

export const PrimaryButton = ({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  ...props
}: PrimaryButtonProps): ReactElement => (
  <ButtonContainer
    accessibilityRole="button"
    accessibilityLabel={title}
    $variant={variant}
    disabled={disabled || loading}
    style={({ pressed }) => ({ opacity: disabled ? 0.5 : pressed ? 0.82 : 1 })}
    {...props}
  >
    {loading ? (
      <ActivityIndicator color={variant === 'ghost' ? '#0AA7A5' : '#FFFFFF'} />
    ) : (
      <ButtonText $variant={variant}>{title}</ButtonText>
    )}
  </ButtonContainer>
);
