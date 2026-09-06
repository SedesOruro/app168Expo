import { servicio } from '../../../../shared/constants/institucion';
import React, { ReactElement } from 'react';
import {
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

import type { MainStackParamList } from '../../../../app/navigation/types';
import type { AppTheme } from '../../../../shared/theme';
import { EmergencyFlowSteps } from '../components/EmergencyFlowSteps';
import { useEmergencyFlow } from '../providers/EmergencyFlowProvider';

type ApiCentralNavigation = NativeStackNavigationProp<
  MainStackParamList,
  'ApiCentral'
>;


export const ApiCentralScreen = (): ReactElement => {
  const tema = useTheme() as AppTheme;
  const estilos = crearEstilos(tema);
  const navigation = useNavigation<ApiCentralNavigation>();
  const { currentEmergency } = useEmergencyFlow();
  const payloadItems = [
    { icon: 'identifier', label: 'Codigo', value: currentEmergency?.codigo_publico ?? 'Pendiente' },
    {
      icon: 'crosshairs-gps',
      label: 'Ubicacion GPS',
      value: currentEmergency
        ? `${Number(currentEmergency.latitud).toFixed(5)}, ${Number(currentEmergency.longitud).toFixed(5)}`
        : 'No disponible',
    },
    {
      icon: 'clipboard-pulse',
      label: 'Tipo y gravedad',
      value: `${currentEmergency?.tipo?.nombre ?? 'Emergencia'} | ${currentEmergency?.gravedad ?? 'Sin clasificar'}`,
    },
    {
      icon: 'medical-bag',
      label: 'Estado inicial',
      value: currentEmergency?.estado?.nombre ?? 'Procesando',
    },
  ] as const;

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
        <Text style={estilos.headerTitle}>{servicio.central}</Text>
      </View>

      <ScrollView contentContainerStyle={estilos.content}>
        <EmergencyFlowSteps activeStep={5} />

        <View style={estilos.centralIcon}>
          <MaterialCommunityIcons name="server-network" size={50} color={tema.colors.onFill} />
        </View>
        <Text style={estilos.title}>Alerta recibida por la Central 168</Text>
        <Text style={estilos.subtitle}>
          Los datos fueron registrados y ya pueden ser atendidos por un operador.
        </Text>

        <View style={estilos.statusPanel}>
          <View style={estilos.liveDot} />
          <Text style={estilos.statusText}>Registro confirmado por {servicio.central}</Text>
        </View>

        <View style={estilos.payloadCard}>
          <Text style={estilos.sectionTitle}>Datos minimos enviados</Text>
          {payloadItems.map(item => (
            <View key={item.label} style={estilos.payloadRow}>
              <MaterialCommunityIcons name={item.icon} size={24} color={tema.colors.accentText} />
              <View style={estilos.payloadCopy}>
                <Text style={estilos.payloadLabel}>{item.label}</Text>
                <Text style={estilos.payloadValue}>{item.value}</Text>
              </View>
              <MaterialCommunityIcons name="check-circle" size={22} color={tema.colors.successText} />
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [estilos.nextButton, pressed && estilos.pressed]}
          onPress={() =>
            navigation.navigate('CaseTracking', {
              emergencyUuid: currentEmergency?.uuid,
            })
          }
        >
          <Text style={estilos.nextText}>Ver seguimiento del caso</Text>
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
    paddingTop: 28,
    paddingBottom: 38,
    alignItems: 'center',
  },
  centralIcon: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: tema.colors.accentFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 20,
    color: tema.colors.text,
    fontSize: 25,
    lineHeight: 31,
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
  statusPanel: {
    width: '100%',
    marginTop: 22,
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: tema.colors.successSoft,
    borderWidth: 1,
    borderColor: tema.colors.successSoft,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  liveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: tema.colors.success,
  },
  statusText: {
    color: tema.colors.successText,
    fontSize: 16,
    lineHeight: 21,
    fontFamily: tema.fuentes.bold,
  },
  payloadCard: {
    width: '100%',
    marginTop: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tema.colors.border,
    backgroundColor: tema.colors.background,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  sectionTitle: {
    marginBottom: 10,
    color: tema.colors.text,
    fontSize: 18,
    lineHeight: 23,
    fontFamily: tema.fuentes.bold,
  },
  payloadRow: {
    minHeight: 58,
    borderTopWidth: 1,
    borderTopColor: tema.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  payloadCopy: {
    flex: 1,
  },
  payloadLabel: {
    color: tema.colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: tema.fuentes.bold,
  },
  payloadValue: {
    marginTop: 2,
    color: tema.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  nextButton: {
    width: '100%',
    marginTop: 28,
    minHeight: 66,
    borderRadius: 8,
    backgroundColor: tema.colors.accentFill,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  pressed: {
    opacity: 0.86,
  },
  nextText: {
    color: tema.colors.onFill,
    fontSize: 18,
    lineHeight: 23,
    fontFamily: tema.fuentes.bold,
  },
});
