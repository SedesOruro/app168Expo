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

type EmergencyTypeNavigation = NativeStackNavigationProp<
  MainStackParamList,
  'EmergencyType'
>;

const RED = '#F63F5F';

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

export const EmergencyTypeScreen = (): ReactElement => {
  const navigation = useNavigation<EmergencyTypeNavigation>();
  const [selectedType, setSelectedType] = useState('Accidente');
  const [severity, setSeverity] = useState('Alta');

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
        <Text style={styles.headerTitle}>Tipo de emergencia</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <EmergencyFlowSteps activeStep={3} />

        <Text style={styles.question}>Que ocurre?</Text>

        <View style={styles.grid}>
          {emergencyTypes.map(item => {
            const isActive = item.label === selectedType;

            return (
              <Pressable
                key={item.label}
                accessibilityRole="button"
                style={[styles.typeButton, isActive && styles.typeButtonActive]}
                onPress={() => setSelectedType(item.label)}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={34}
                  color={isActive ? '#FFFFFF' : RED}
                />
                <Text style={[styles.typeText, isActive && styles.typeTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Gravedad percibida</Text>
        <View style={styles.severityRow}>
          {severities.map(item => {
            const isActive = item === severity;

            return (
              <Pressable
                key={item}
                accessibilityRole="button"
                style={[styles.severityButton, isActive && styles.severityButtonActive]}
                onPress={() => setSeverity(item)}
              >
                <Text
                  style={[
                    styles.severityText,
                    isActive && styles.severityTextActive,
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
          style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}
          onPress={() => navigation.navigate('Triage')}
        >
          <Text style={styles.continueText}>Continuar</Text>
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
    paddingTop: 34,
    paddingBottom: 38,
  },
  question: {
    color: '#303030',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
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
    borderColor: '#D9D9D9',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: RED,
    borderColor: RED,
  },
  typeText: {
    color: '#444444',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },
  typeTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    marginTop: 32,
    color: '#303030',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '900',
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
    borderColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityButtonActive: {
    backgroundColor: RED,
  },
  severityText: {
    color: RED,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
  },
  severityTextActive: {
    color: '#FFFFFF',
  },
  continueButton: {
    marginTop: 34,
    minHeight: 66,
    borderRadius: 8,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  pressed: {
    opacity: 0.86,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
  },
});
