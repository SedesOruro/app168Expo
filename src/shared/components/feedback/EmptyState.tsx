import React, { ReactElement } from 'react';
import styled from 'styled-components/native';

import { PrimaryButton } from '../buttons/PrimaryButton';

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

const Container = styled.View`
  padding: ${({ theme }) => theme.spacing.xl}px;
  align-items: center;
`;

const Title = styled.Text`
  ${({ theme }) => theme.typography.h2};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

const Message = styled.Text`
  ${({ theme }) => theme.typography.body};
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const EmptyState = ({
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps): ReactElement => (
  <Container>
    <Title>{title}</Title>
    <Message>{message}</Message>
    {actionLabel && onAction ? (
      <PrimaryButton title={actionLabel} onPress={onAction} />
    ) : null}
  </Container>
);
