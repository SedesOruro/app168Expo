import React, { ReactElement, useState } from 'react';
import { Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { TextInput } from 'react-native-paper';
import styled from 'styled-components/native';

import { useAuth } from '../../../../app/providers/AuthProvider';
import type { AuthStackParamList } from '../../../../app/navigation/types';
import { PrimaryButton } from '../../../../shared/components/buttons/PrimaryButton';
import { AuthLayout } from '../../../../shared/layouts/AuthLayout';
import { isValidEmail } from '../../../../shared/utils/validators';

type LoginNavigation = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const Form = styled.View`
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

const LinkButton = styled.Pressable`
  min-height: 48px;
  align-items: center;
  justify-content: center;
`;

const LinkText = styled.Text`
  ${({ theme }) => theme.typography.bodyStrong};
  color: ${({ theme }) => theme.colors.primaryDark};
`;

export const LoginScreen = (): ReactElement => {
  const navigation = useNavigation<LoginNavigation>();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('product@desarrollo.dev');
  const [password, setPassword] = useState('production');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (): Promise<void> => {
    if (!isValidEmail(email)) {
      Alert.alert('Invalid email', 'Please enter a valid email.');
      return;
    }

    setLoading(true);
    try {
      await signIn({ email, password });
    } catch {
      Alert.alert('Login failed', 'Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="DESARROLLO MOVIL"
      subtitle="Base full lista para auth, API, sockets y UI reusable."
    >
      <Form>
        <TextInput
          accessibilityLabel="Email"
          label="Email"
          value={email}
          mode="outlined"
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
        />
        <TextInput
          accessibilityLabel="Password"
          label="Password"
          value={password}
          mode="outlined"
          secureTextEntry
          onChangeText={setPassword}
        />
        <PrimaryButton title="Sign in" loading={loading} onPress={onSubmit} />
        <LinkButton
          accessibilityRole="button"
          accessibilityLabel="Create account"
          onPress={() => navigation.navigate('Register')}
        >
          <LinkText>Create account</LinkText>
        </LinkButton>
      </Form>
    </AuthLayout>
  );
};
