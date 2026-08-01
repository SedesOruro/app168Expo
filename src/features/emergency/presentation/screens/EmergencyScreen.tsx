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
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { MainStackParamList } from '../../../../app/navigation/types';
import { EmergencyFlowSteps } from '../components/EmergencyFlowSteps';

type EmergencyNavigation = NativeStackNavigationProp<
  MainStackParamList,
  'Emergency'
>;
type EmergencyRoute = RouteProp<MainStackParamList, 'Emergency'>;

const RED = '#F63F5F';

export const EmergencyScreen = (): ReactElement => {
  const navigation = useNavigation<EmergencyNavigation>();
  const route = useRoute<EmergencyRoute>();
  const [canSpeak, setCanSpeak] = useState(true);
  const flow = route.params?.flow ?? 'guided';
  const isDirectFlow = flow === 'direct';
  const emergencyLabel = isDirectFlow
    ? 'Alerta directa 168'
    : route.params?.quickAccess ?? 'Emergencia medica';
  const flowLabels = isDirectFlow
    ? ['168', 'Confirmar']
    : ['Acceso', 'Confirmar', 'Tipo', 'Triage', 'Central', 'Seguimiento'];

  const onConfirm = (): void => {
    navigation.navigate(isDirectFlow ? 'ApiCentral' : 'EmergencyType');
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
        <Text style={styles.headerTitle}>
          {isDirectFlow ? 'Confirmar alerta 168' : 'Confirmar emergencia'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <EmergencyFlowSteps activeStep={2} labels={flowLabels} />

        {isDirectFlow ? (
          <View style={styles.fastNotice}>
            <MaterialCommunityIcons name="flash" size={24} color={RED} />
            <Text style={styles.fastNoticeText}>
              Flujo rapido: con esta confirmacion se envia ubicacion, perfil y
              disponibilidad para hablar a la Central 168.
            </Text>
          </View>
        ) : null}

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tipo</Text>
            <Text style={styles.summaryValue}>{emergencyLabel}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ubicacion</Text>
            <Text style={styles.summaryValue}>Detectada</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Bateria</Text>
            <Text style={styles.summaryValue}>42%</Text>
          </View>
        </View>

        <Text style={styles.question}>Puedes hablar?</Text>
        <View style={styles.choiceRow}>
          {[true, false].map(value => {
            const isActive = value === canSpeak;
            const label = value ? 'Si' : 'No';

            return (
              <Pressable
                key={label}
                accessibilityRole="button"
                style={[styles.choiceButton, isActive && styles.choiceButtonActive]}
                onPress={() => setCanSpeak(value)}
              >
                <MaterialCommunityIcons
                  name={value ? 'microphone' : 'microphone-off'}
                  size={26}
                  color={isActive ? '#FFFFFF' : RED}
                />
                <Text style={[styles.choiceText, isActive && styles.choiceTextActive]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {!canSpeak ? (
          <View style={styles.silentMode}>
            <MaterialCommunityIcons name="volume-off" size={24} color="#8A5A00" />
            <Text style={styles.silentText}>
              Se enviara como modo silencioso para que el operador priorice chat,
              datos y ubicacion.
            </Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}
          onPress={onConfirm}
        >
          <Text style={styles.sendButtonText}>
            {isDirectFlow ? 'ENVIAR ALERTA 168' : 'CONFIRMAR Y CLASIFICAR'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
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
    paddingHorizontal: 26,
    paddingTop: 34,
    paddingBottom: 38,
  },
  fastNotice: {
    marginBottom: 18,
    borderRadius: 8,
    backgroundColor: '#FFE8EC',
    borderWidth: 1,
    borderColor: '#FFC4CF',
    padding: 14,
    flexDirection: 'row',
    gap: 10,
  },
  fastNoticeText: {
    flex: 1,
    color: '#6A2431',
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
  },
  summaryCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  summaryRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  summaryLabel: {
    color: '#6A6A6A',
    fontSize: 16,
    lineHeight: 21,
  },
  summaryValue: {
    color: '#2F2F2F',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
  },
  question: {
    marginTop: 42,
    color: '#303030',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  choiceRow: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 18,
  },
  choiceButton: {
    flex: 1,
    minHeight: 76,
    borderRadius: 8,
    borderWidth: 1.4,
    borderColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  choiceButtonActive: {
    backgroundColor: RED,
  },
  choiceText: {
    color: RED,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
  },
  choiceTextActive: {
    color: '#FFFFFF',
  },
  silentMode: {
    marginTop: 20,
    borderRadius: 8,
    backgroundColor: '#FFF5D8',
    borderWidth: 1,
    borderColor: '#F0D68A',
    padding: 16,
    flexDirection: 'row',
    gap: 10,
  },
  silentText: {
    flex: 1,
    color: '#6F4B00',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  sendButton: {
    marginTop: 34,
    minHeight: 68,
    borderRadius: 8,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  pressed: {
    opacity: 0.86,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
  },
  cancelButton: {
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#555555',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
});
