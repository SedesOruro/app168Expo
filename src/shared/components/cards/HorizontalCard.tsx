import React, { ReactElement } from 'react';
import { ImageSourcePropType } from 'react-native';
import styled from 'styled-components/native';

import { BaseCard } from './BaseCard';
import { InfoBadge } from '../ui/InfoBadge';
import { RatingBadge } from '../ui/RatingBadge';

type HorizontalCardProps = {
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
  badge: string;
  rating?: number;
  onPress?: () => void;
};

const Content = styled.View`
  flex-direction: row;
  width: 320px;
  min-height: 132px;
`;

const Image = styled.Image`
  width: 118px;
  height: 132px;
`;

const Body = styled.View`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg}px;
  justify-content: space-between;
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

const Footer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const HorizontalCard = ({
  title,
  subtitle,
  image,
  badge,
  rating,
  onPress,
}: HorizontalCardProps): ReactElement => (
  <BaseCard padded={false} onPress={onPress} accessibilityLabel={title}>
    <Content>
      <Image source={image} resizeMode="cover" />
      <Body>
        <InfoBadge label={badge} tone="primary" />
        <Title numberOfLines={2}>{title}</Title>
        <Subtitle numberOfLines={1}>{subtitle}</Subtitle>
        <Footer>{rating ? <RatingBadge value={rating} /> : null}</Footer>
      </Body>
    </Content>
  </BaseCard>
);
