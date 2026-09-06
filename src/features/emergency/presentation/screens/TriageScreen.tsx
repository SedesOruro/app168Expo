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
import { useTheme } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { MainStackParamList } from '../../../../app/navigation/types';
import type { AppTheme } from '../../../../shared/theme';
import { EmergencyFlowSteps } from '../components/EmergencyFlowSteps';
import { emergencyApi } from '../../data/EmergencyApi';
import { getCurrentCoordinates } from '../../data/locationService';
import { useEmergencyFlow } from '../providers/EmergencyFlowProvider';

type TriageNavigation = NativeStackNavigationProp<MainStackParamList, 'Triage'>;


const triageQuestions = [
  { key: 'breathing', label: 'La persona respira?', options: ['Si', 'No', 'No se'] },
  { key: 'conscious', label: 'Esta consciente?', options: ['Si', 'No', 'No se'] },
  { key: 'danger', label: 'Hay riesgo en el lugar?', options: ['Si', 'No'] },
];

export const TriageScreen = (): ReactElement => {
  const tema = useTheme() as AppTheme;
  const estilos = crearEstilos(tema);
  const navigation = useNavigation<TriageNavigation>();
  const { draft, updateDraft, setCurrentEmergency } = useEmergencyFlow();
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({
    breathing: 'No se',
    conscious: 'No se',
    danger: 'Si',
  });

  const setAnswer = (key: string, value: string): void => {
    setAnswers(current => ({ ...current, [key]: value }));
  };

  const onSubmit = async (): Promise<void> => {
    setSubmitting(true);
    try {
      const location = draft.location ?? (await getCurrentCoordinates());
      const normalizedAnswers = Object.fromEntries(
        Object.entries(answers).map(([key, value]) => [
          key,
          value === 'Si' ? 'SI' : value === 'No' ? 'NO' : 'NO_SE',
        ]),
      );
      updateDraft({ location, triage: normalizedAnswers });
      const emergency = await emergencyApi.createEmergency({
        ...location,
        typeCode: draft.typeCode,
        severity: draft.severity,
        canSpeak: draft.canSpeak,
        locationConfirmed: true,
        flow: draft.flow,
        triage: normalizedAnswers,
      });
      setCurrentEmergency(emergency);
      navigation.navigate('ApiCentral');
    } catch (error) {
      Alert.alert(
        'No se pudo enviar la emergencia',
        error instanceof Error ? error.message : 'Intente nuevamente.',
      );
    } finally {
      setSubmitting(false);
    }
  };

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
        <Text style={estilos.headerTitle}>Triage rapido</Text>
      </View>

      <ScrollView contentContainerStyle={estilos.content}>
        <EmergencyFlowSteps activeStep={4} />

        <Text style={estilos.intro}>Datos minimos de salud y riesgo</Text>

        {triageQuestions.map(question => (
          <View key={question.key} style={estilos.questionBlock}>
            <Text style={estilos.question}>{question.label}</Text>
            <View style={estilos.optionRow}>
              {question.options.map(option => {
                const isActive = answers[question.key] === option;

                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    style={[estilos.optionButton, isActive && estilos.optionButtonActive]}
                    onPress={() => setAnswer(question.key, option)}
                  >
                    <Text
                      style={[estilos.optionText, isActive && estilos.optionTextActive]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <Pressable
          accessibilityRole="button"
          disabled={submitting}
          style={({ pressed }) => [estilos.sendButton, pressed && estilos.pressed]}
          onPress={onSubmit}
        >
          {submitting ? (
            <ActivityIndicator color={tema.colors.onFill} />
          ) : (
            <>
              <MaterialCommunityIcons name="send" size={24} color={tema.colors.onFill} />
              <Text style={estilos.sendText}>Enviar ahora</Text>
            </>
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
    paddingTop: 32,
    paddingBottom: 38,
  },
  intro: {
    color: tema.colors.accentText,
    fontSize: 24,
    lineHeight: 30,
    fontFamily: tema.fuentes.bold,
    textAlign: 'center',
  },
  questionBlock: {
    marginTop: 30,
  },
  question: {
    color: tema.colors.text,
    fontSize: 21,
    lineHeight: 27,
    fontFamily: tema.fuentes.bold,
  },
  optionRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: tema.colors.accentText,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  optionButtonActive: {
    backgroundColor: tema.colors.accentFill,
  },
  optionText: {
    color: tema.colors.accentText,
    fontSize: 16,
    lineHeight: 21,
    fontFamily: tema.fuentes.bold,
    textAlign: 'center',
  },
  optionTextActive: {
    color: tema.colors.onFill,
  },
  sendButton: {
    marginTop: 38,
    minHeight: 68,
    borderRadius: 8,
    backgroundColor: tema.colors.accentFill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    elevation: 6,
  },
  pressed: {
    opacity: 0.86,
  },
  sendText: {
    color: tema.colors.onFill,
    fontSize: 20,
    lineHeight: 25,
    fontFamily: tema.fuentes.bold,
  },
});
