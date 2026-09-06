import React, { ReactElement } from 'react';
import { ImageSourcePropType } from 'react-native';
import { MaterialIcons as MaterialIcon } from '@expo/vector-icons';
import styled, { useTheme } from 'styled-components/native';

import type { AppTheme } from '../../theme';

import { BaseCard } from './BaseCard';
import { RatingBadge } from '../ui/RatingBadge';

type FeatureCardProps = {
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
  meta: string;
  rating?: number;
  onPress?: () => void;
};

const Container = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const Image = styled.Image`
  width: 100%;
  height: 132px;
  border-radius: ${({ theme }) => theme.radius.md}px;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Content = styled.View`
  flex: 1;
`;

const Title = styled.Text`
  ${({ theme }) => theme.typography.h3};
  color: ${({ theme }) => theme.colors.text};
`;

const Subtitle = styled.Text`
  ${({ theme }) => theme.typography.caption};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

const Meta = styled.Text`
  ${({ theme }) => theme.typography.bodyStrong};
  color: ${({ theme }) => theme.colors.primary};
`;

export const FeatureCard = ({
  title,
  subtitle,
  image,
  meta,
  rating,
  onPress,
}: FeatureCardProps): ReactElement => {
  const tema = useTheme() as AppTheme;

  return (
  <BaseCard onPress={onPress} accessibilityLabel={title}>
    <Container>
      <Image source={image} resizeMode="cover" />
      <Row>
        <Content>
          <Title numberOfLines={2}>{title}</Title>
          <Subtitle numberOfLines={1}>{subtitle}</Subtitle>
        </Content>
        <MaterialIcon name="arrow-forward" size={22} color={tema.colors.primary} />
      </Row>
      <Row>
        <Content>{rating ? <RatingBadge value={rating} /> : null}</Content>
        <Meta>{meta}</Meta>
      </Row>
    </Container>
  </BaseCard>
  );
};
