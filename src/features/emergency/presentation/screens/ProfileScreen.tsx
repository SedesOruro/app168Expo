import React, { ReactElement } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import type { MainStackParamList } from '../../../../app/navigation/types';
import type { AppTheme } from '../../../../shared/theme';
import {
  useTemaApp,
  type PreferenciaTema,
} from '../../../../app/providers/ThemeProvider';
import { BottomTabBar } from '../components/BottomTabBar';
import { emergencyApi } from '../../data/EmergencyApi';

type ProfileNavigation = NativeStackNavigationProp<MainStackParamList, 'Profile'>;


const opcionesApariencia: { valor: PreferenciaTema; etiqueta: string }[] = [
  { valor: 'claro', etiqueta: 'Claro' },
  { valor: 'oscuro', etiqueta: 'Oscuro' },
  { valor: 'sistema', etiqueta: 'Sistema' },
];

export const ProfileScreen = (): ReactElement => {
  const tema = useTheme() as AppTheme;
  const estilos = crearEstilos(tema);
  const navigation = useNavigation<ProfileNavigation>();
  const { preferencia, cambiarPreferencia } = useTemaApp();
  const query = useQuery({ queryKey: ['emergency-profile'], queryFn: emergencyApi.getProfile });
  const data = query.data;
  const contact = data?.contacts?.[0];
  const profileRows = [
    {
      icon: 'account-outline',
      label: 'Nombre / CI / Celular',
      value: data
        ? `${data.profile.nombres} ${data.profile.apellidos} | ${data.profile.cedula_identidad}${data.profile.complemento_ci ? `-${data.profile.complemento_ci}` : ''} | ${data.phone}`
        : 'Sin datos',
    },
    { icon: 'home-outline', label: 'Direccion', value: data?.profile.direccion || 'No registrada' },
    { icon: 'blood-bag', label: 'Grupo sanguineo', value: data?.profile.tipo_sangre || 'No registrado' },
    { icon: 'alert-circle-outline', label: 'Alergias', value: data?.profile.alergias || 'No registradas' },
    { icon: 'medical-bag', label: 'Enfermedades', value: data?.profile.enfermedades_cronicas || 'No registradas' },
    { icon: 'pill', label: 'Medicamentos', value: data?.profile.medicamentos_actuales || 'No registrados' },
    {
      icon: 'account-heart-outline',
      label: 'Contacto referencia',
      value: contact ? `${contact.nombre_completo} | ${contact.telefono}` : 'No registrado',
    },
  ] as const;

  return (
    <SafeAreaView style={estilos.screen}>
      <StatusBar barStyle={tema.isDark ? 'light-content' : 'dark-content'} backgroundColor={tema.colors.surface} />
      <ScrollView contentContainerStyle={estilos.content}>
        <Text style={estilos.title}>Mi perfil de emergencia</Text>
        <Text style={estilos.subtitle}>
          Datos guardados una sola vez para ayudar al operador.
        </Text>

        {query.isLoading ? <ActivityIndicator size="large" color={tema.colors.accentText} /> : null}
        <View style={estilos.card}>
          {profileRows.map((item, index) => (
            <View key={item.label} style={estilos.dataRow}>
              <MaterialCommunityIcons name={item.icon} size={27} color={tema.colors.accentText} />
              <View style={estilos.rowCopy}>
                <Text style={estilos.rowLabel}>{item.label}</Text>
                <Text style={estilos.dataText}>{item.value}</Text>
              </View>
              {index < profileRows.length - 1 && <View style={estilos.rowDivider} />}
            </View>
          ))}
        </View>

        {/*
          El modo oscuro es opcional: la aplicacion arranca en claro y solo cambia
          si se elige aqui. "Sistema" lo deja seguir al ajuste del telefono.
        */}
        <View style={estilos.aparienciaBloque}>
          <Text style={estilos.aparienciaTitulo}>Apariencia</Text>
          <View style={estilos.aparienciaFila}>
            {opcionesApariencia.map(opcion => {
              const activa = opcion.valor === preferencia;

              return (
                <Pressable
                  key={opcion.valor}
                  accessibilityRole="button"
                  accessibilityLabel={`Apariencia ${opcion.etiqueta}`}
                  accessibilityState={{ selected: activa }}
                  style={[
                    estilos.aparienciaOpcion,
                    activa && estilos.aparienciaOpcionActiva,
                  ]}
                  onPress={() => {
                    cambiarPreferencia(opcion.valor).catch(() => undefined);
                  }}
                >
                  <Text
                    style={[
                      estilos.aparienciaTexto,
                      activa && estilos.aparienciaTextoActivo,
                    ]}
                  >
                    {opcion.etiqueta}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cambiar contrasena"
          style={({ pressed }) => [estilos.seguridadBoton, pressed && { opacity: 0.86 }]}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <MaterialCommunityIcons name="lock-reset" size={22} color={tema.colors.accentText} />
          <Text style={estilos.seguridadTexto}>Cambiar contrasena</Text>
        </Pressable>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Editar perfil de emergencia"
        style={estilos.editButton}
        onPress={() => navigation.navigate('ProfileEdit')}
      >
        <MaterialCommunityIcons name="content-save-edit" size={30} color={tema.colors.onFill} />
      </Pressable>
      <BottomTabBar active="Profile" navigation={navigation} />
    </SafeAreaView>
  );
};

const crearEstilos = (tema: AppTheme) =>
  StyleSheet.create({
  seguridadBoton: {
    marginTop: 20,
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: tema.colors.accentText,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  seguridadTexto: {
    color: tema.colors.accentText,
    fontSize: 16,
    lineHeight: 21,
    fontFamily: tema.fuentes.bold,
  },
  aparienciaBloque: {
    marginTop: 20,
    gap: 10,
  },
  aparienciaTitulo: {
    color: tema.colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: tema.fuentes.bold,
  },
  aparienciaFila: {
    flexDirection: 'row',
    gap: 10,
  },
  aparienciaOpcion: {
    flex: 1,
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: tema.colors.border,
    backgroundColor: tema.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aparienciaOpcionActiva: {
    borderColor: tema.colors.accentFill,
    backgroundColor: tema.colors.accentFill,
  },
  aparienciaTexto: {
    color: tema.colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: tema.fuentes.bold,
  },
  aparienciaTextoActivo: {
    color: tema.colors.onFill,
  },
  screen: {
    flex: 1,
    backgroundColor: tema.colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 150,
  },
  title: {
    color: tema.colors.accentText,
    fontSize: 29,
    lineHeight: 35,
    fontFamily: tema.fuentes.bold,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    color: tema.colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  card: {
    marginTop: 28,
    backgroundColor: tema.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tema.colors.border,
    paddingHorizontal: 18,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: tema.shadows.md.shadowColor,
    shadowOpacity: 0.12,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
  },
  dataRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rowCopy: {
    flex: 1,
  },
  rowLabel: {
    color: tema.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: tema.fuentes.semiBold,
  },
  dataText: {
    marginTop: 3,
    color: tema.colors.text,
    fontSize: 17,
    lineHeight: 22,
    fontFamily: tema.fuentes.bold,
  },
  rowDivider: {
    position: 'absolute',
    left: 42,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: tema.colors.surfaceMuted,
  },
  editButton: {
    position: 'absolute',
    right: 34,
    bottom: 152,
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: tema.colors.accentFill,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: tema.shadows.md.shadowColor,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
});
