import React, { ReactElement, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { MainStackParamList } from '../../../../app/navigation/types';
import { EmergencyFlowSteps } from '../components/EmergencyFlowSteps';

type TriageNavigation = NativeStackNavigationProp<MainStackParamList, 'Triage'>;

const RED = '#F63F5F';

const triageQuestions = [
  { key: 'breathing', label: 'La persona respira?', options: ['Si', 'No', 'No se'] },
  { key: 'conscious', label: 'Esta consciente?', options: ['Si', 'No', 'No se'] },
  { key: 'danger', label: 'Hay riesgo en el lugar?', options: ['Si', 'No'] },
];

export const TriageScreen = (): ReactElement => {
  const navigation = useNavigation<TriageNavigation>();
  const [answers, setAnswers] = useState<Record<string, string>>({
    breathing: 'No se',
    conscious: 'No se',
    danger: 'Si',
  });

  const setAnswer = (key: string, value: string): void => {
    setAnswers(current => ({ ...current, [key]: value }));
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={RED} />
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={32} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Triage rapido</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <EmergencyFlowSteps activeStep={4} />

        <Text style={styles.intro}>Datos minimos de salud y riesgo</Text>

        {triageQuestions.map(question => (
          <View key={question.key} style={styles.questionBlock}>
            <Text style={styles.question}>{question.label}</Text>
            <View style={styles.optionRow}>
              {question.options.map(option => {
                const isActive = answers[question.key] === option;

                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    style={[styles.optionButton, isActive && styles.optionButtonActive]}
                    onPress={() => setAnswer(question.key, option)}
                  >
                    <Text
                      style={[styles.optionText, isActive && styles.optionTextActive]}
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
          style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}
          onPress={() => navigation.navigate('ApiCentral')}
        >
          <MaterialCommunityIcons name="send" size={24} color="#FFFFFF" />
          <Text style={styles.sendText}>Enviar ahora</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 64,
    backgroundColor: RED,
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
    color: '#FFFFFF',
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 38,
  },
  intro: {
    color: RED,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  questionBlock: {
    marginTop: 30,
  },
  question: {
    color: '#303030',
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '900',
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
    borderColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  optionButtonActive: {
    backgroundColor: RED,
  },
  optionText: {
    color: RED,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
    textAlign: 'center',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  sendButton: {
    marginTop: 38,
    minHeight: 68,
    borderRadius: 8,
    backgroundColor: RED,
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
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
  },
});
