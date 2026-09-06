import React, { ReactElement, useState } from 'react';
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

type EmergencyTypeNavigation = NativeStackNavigationProp<
  MainStackParamList,
  'EmergencyType'
>;


const emergencyTypes = [
  { icon: 'car-brake-alert', label: 'Accidente' },
  { icon: 'account-alert', label: 'Desmayo' },
  { icon: 'heart-pulse', label: 'Dolor' },
  { icon: 'human-pregnant', label: 'Parto' },
  { icon: 'fire', label: 'Incendio' },
  { icon: 'shield-alert', label: 'Violencia' },
  { icon: 'dots-horizontal', label: 'Otro' },
] as const;

const severities = ['Leve', 'Media', 'Alta'];
const typeCodes: Record<string, string> = {
  Accidente: 'ACCIDENTE',
  Desmayo: 'MEDICA',
  Dolor: 'MEDICA',
  Parto: 'MEDICA',
  Incendio: 'INCENDIO',
  Violencia: 'SEGURIDAD',
  Otro: 'OTRO',
};

export const EmergencyTypeScreen = (): ReactElement => {
  const tema = useTheme() as AppTheme;
  const estilos = crearEstilos(tema);
  const navigation = useNavigation<EmergencyTypeNavigation>();
  const { updateDraft } = useEmergencyFlow();
  const [selectedType, setSelectedType] = useState('Accidente');
  const [severity, setSeverity] = useState('Alta');

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
        <Text style={estilos.headerTitle}>Tipo de emergencia</Text>
      </View>

      <ScrollView contentContainerStyle={estilos.content}>
        <EmergencyFlowSteps activeStep={3} />

        <Text style={estilos.question}>Que ocurre?</Text>

        <View style={estilos.grid}>
          {emergencyTypes.map(item => {
            const isActive = item.label === selectedType;

            return (
              <Pressable
                key={item.label}
                accessibilityRole="button"
                style={[estilos.typeButton, isActive && estilos.typeButtonActive]}
                onPress={() => setSelectedType(item.label)}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={34}
                  color={isActive ? tema.colors.onFill : tema.colors.accentText}
                />
                <Text style={[estilos.typeText, isActive && estilos.typeTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={estilos.sectionTitle}>Gravedad percibida</Text>
        <View style={estilos.severityRow}>
          {severities.map(item => {
            const isActive = item === severity;

            return (
              <Pressable
                key={item}
                accessibilityRole="button"
                style={[estilos.severityButton, isActive && estilos.severityButtonActive]}
                onPress={() => setSeverity(item)}
              >
                <Text
                  style={[
                    estilos.severityText,
                    isActive && estilos.severityTextActive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [estilos.continueButton, pressed && estilos.pressed]}
          onPress={() => {
            updateDraft({
              typeCode: typeCodes[selectedType] ?? 'OTRO',
              severity: severity.toUpperCase(),
            });
            navigation.navigate('Triage');
          }}
        >
          <Text style={estilos.continueText}>Continuar</Text>
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
    paddingTop: 34,
    paddingBottom: 38,
  },
  question: {
    color: tema.colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontFamily: tema.fuentes.bold,
    textAlign: 'center',
  },
  grid: {
    marginTop: 26,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    width: '48%',
    minHeight: 94,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: tema.colors.border,
    backgroundColor: tema.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: tema.colors.accentFill,
    borderColor: tema.colors.accentFill,
  },
  typeText: {
    color: tema.colors.text,
    fontSize: 17,
    lineHeight: 22,
    fontFamily: tema.fuentes.bold,
  },
  typeTextActive: {
    color: tema.colors.onFill,
  },
  sectionTitle: {
    marginTop: 32,
    color: tema.colors.text,
    fontSize: 20,
    lineHeight: 26,
    fontFamily: tema.fuentes.bold,
  },
  severityRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  severityButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: tema.colors.accentText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityButtonActive: {
    backgroundColor: tema.colors.accentFill,
  },
  severityText: {
    color: tema.colors.accentText,
    fontSize: 17,
    lineHeight: 22,
    fontFamily: tema.fuentes.bold,
  },
  severityTextActive: {
    color: tema.colors.onFill,
  },
  continueButton: {
    marginTop: 34,
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
  continueText: {
    color: tema.colors.onFill,
    fontSize: 20,
    lineHeight: 25,
    fontFamily: tema.fuentes.bold,
  },
});
