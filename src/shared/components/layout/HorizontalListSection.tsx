import React, { ReactElement } from 'react';
import { FlatList, ListRenderItemInfo } from 'react-native';
import styled from 'styled-components/native';

type HorizontalListSectionProps<T> = {
  title: string;
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (info: ListRenderItemInfo<T>) => ReactElement;
};

const Container = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const Header = styled.Text`
  ${({ theme }) => theme.typography.h2};
  color: ${({ theme }) => theme.colors.text};
  padding-horizontal: ${({ theme }) => theme.spacing.lg}px;
`;

export const HorizontalListSection = <T,>({
  title,
  data,
  keyExtractor,
  renderItem,
}: HorizontalListSectionProps<T>): ReactElement => (
  <Container>
    <Header>{title}</Header>
    <FlatList
      horizontal
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
    />
  </Container>
);
