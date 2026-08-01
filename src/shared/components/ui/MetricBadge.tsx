import React, { ReactElement } from 'react';
import styled from 'styled-components/native';

type MetricBadgeProps = {
  value: string;
  label: string;
};

const Container = styled.View`
  min-width: 84px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
  ${({ theme }) => theme.shadows.sm};
`;

const Value = styled.Text`
  ${({ theme }) => theme.typography.h3};
  color: ${({ theme }) => theme.colors.text};
`;

const Label = styled.Text`
  ${({ theme }) => theme.typography.caption};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

export const MetricBadge = ({ value, label }: MetricBadgeProps): ReactElement => (
  <Container accessibilityLabel={`${label}: ${value}`}>
    <Value>{value}</Value>
    <Label>{label}</Label>
  </Container>
);
