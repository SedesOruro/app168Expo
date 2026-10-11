import React, { ReactElement, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-paper';
import { useTheme } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { MainStackParamList } from '../../../../app/navigation/types';
import type { AppTheme } from '../../../../shared/theme';
import { emergencyApi } from '../../data/EmergencyApi';

type ChangePasswordNavigation = NativeStackNavigationProp<
  MainStackParamList,
  'ChangePassword'
>;

const MINIMO = 8;

/**
 * Cambio de contrasena del ciudadano. Tambien es el paso obligado tras un
 * restablecimiento: la Central deja como contrasena temporal la cedula.
 */
export const ChangePasswordScreen = (): ReactElement => {
  const tema = useTheme() as AppTheme;
  const estilos = crearEstilos(tema);
  const navigation = useNavigation<ChangePasswordNavigation>();
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [guardando, setGuardando] = useState(false);

  const corta = nueva.length > 0 && nueva.length < MINIMO;
  const distinta = confirmacion.length > 0 && confirmacion !== nueva;
  const listo = Boolean(actual) && nueva.length >= MINIMO && confirmacion === nueva;

  const guardar = async (): Promise<void> => {
    setGuardando(true);
    try {
      await emergencyApi.changePassword({ currentPassword: actual, newPassword: nueva });
      Alert.alert('Contrasena actualizada', 'Usa la nueva contrasena la proxima vez que ingreses.');
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'No se pudo cambiar la contrasena',
        error instanceof Error ? error.message : 'Intente nuevamente.',
      );
    } finally {
      setGuardando(false);
    }
  };

  const campo = (
    etiqueta: string,
    valor: string,
    cambiar: (texto: string) => void,
  ): ReactElement => (
    <TextInput
      label={etiqueta}
      mode="outlined"
      value={valor}
      onChangeText={cambiar}
      secureTextEntry
      autoCapitalize="none"
      style={estilos.campo}
      outlineColor={tema.colors.border}
      activeOutlineColor={tema.colors.primary}
    />
  );

  return (
    <SafeAreaView style={estilos.screen}>
      <StatusBar barStyle={tema.isDark ? 'light-content' : 'dark-content'} backgroundColor={tema.colors.accentText} />
      <View style={estilos.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          style={estilos.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={32} color={tema.colors.onFill} />
        </Pressable>
        <Text style={estilos.headerTitle}>Cambiar contrasena</Text>
      </View>

      <ScrollView contentContainerStyle={estilos.content} keyboardShouldPersistTaps="handled">
        <Text style={estilos.ayuda}>
          Si la Central restablecio tu contrasena, la actual es tu numero de cedula.
        </Text>
        {campo('Contrasena actual', actual, setActual)}
        {campo(`Nueva contrasena (minimo ${MINIMO} caracteres)`, nueva, setNueva)}
        {corta ? (
          <Text style={estilos.error}>La contrasena necesita {MINIMO} caracteres.</Text>
        ) : null}
        {campo('Repetir nueva contrasena', confirmacion, setConfirmacion)}
        {distinta ? <Text style={estilos.error}>Las contrasenas no coinciden.</Text> : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !listo || guardando }}
          disabled={!listo || guardando}
          style={({ pressed }) => [
            estilos.boton,
            (!listo || guardando) && estilos.botonInactivo,
            pressed && estilos.presionado,
          ]}
          onPress={() => void guardar()}
        >
          {guardando ? (
            <ActivityIndicator color={tema.colors.onFill} />
          ) : (
            <Text style={estilos.textoBoton}>Guardar</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const crearEstilos = (tema: AppTheme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: tema.colors.surface,
    },
    header: {
      height: 64,
      backgroundColor: tema.colors.accentFill,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 6,
    },
    backButton: {
      position: 'absolute',
      left: 18,
      width: 46,
      height: 46,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      color: tema.colors.onFill,
      fontSize: 21,
      lineHeight: 26,
      fontFamily: tema.fuentes.bold,
    },
    content: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 38,
      gap: 12,
    },
    ayuda: {
      ...tema.estilosTexto.body,
      color: tema.colors.textMuted,
    },
    campo: {
      backgroundColor: tema.colors.surface,
    },
    error: {
      ...tema.estilosTexto.caption,
      color: tema.colors.danger,
    },
    boton: {
      marginTop: 12,
      minHeight: 56,
      borderRadius: 8,
      backgroundColor: tema.colors.accentFill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    botonInactivo: {
      opacity: 0.5,
    },
    presionado: {
      opacity: 0.86,
    },
    textoBoton: {
      color: tema.colors.onFill,
      fontSize: 18,
      lineHeight: 23,
      fontFamily: tema.fuentes.bold,
    },
  });
