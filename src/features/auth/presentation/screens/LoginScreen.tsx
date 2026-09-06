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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (): Promise<void> => {
    if (!isValidEmail(email)) {
      Alert.alert('Correo no valido', 'Ingrese un correo electronico valido.');
      return;
    }

    setLoading(true);
    try {
      await signIn({ email, password });
    } catch (error) {
      Alert.alert(
        'No se pudo iniciar sesion',
        error instanceof Error ? error.message : 'Revise sus credenciales.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="EMERGENCIAS 168"
      subtitle="Ingrese con su cuenta para solicitar y seguir asistencia."
    >
      <Form>
        <TextInput
          accessibilityLabel="Correo electronico"
          label="Correo electronico"
          value={email}
          mode="outlined"
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
        />
        <TextInput
          accessibilityLabel="Contrasena"
          label="Contrasena"
          value={password}
          mode="outlined"
          secureTextEntry
          onChangeText={setPassword}
        />
        <PrimaryButton title="Ingresar" loading={loading} onPress={onSubmit} />
        <LinkButton
          accessibilityRole="button"
          accessibilityLabel="Crear cuenta"
          onPress={() => navigation.navigate('Register')}
        >
          <LinkText>Crear cuenta</LinkText>
        </LinkButton>
      </Form>
    </AuthLayout>
  );
};
