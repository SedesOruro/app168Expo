import React, { ReactElement, ReactNode } from 'react';
import { ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

type AppScreenProps = {
  children: ReactNode;
  scroll?: boolean;
};

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Content = styled.View`
  flex: 1;
`;

export const AppScreen = ({
  children,
  scroll = true,
}: AppScreenProps): ReactElement => {
  const theme = useTheme();

  return (
    <Container edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {children}
        </ScrollView>
      ) : (
        <Content>{children}</Content>
      )}
    </Container>
  );
};
