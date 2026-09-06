import React, { ReactElement, useEffect, useState } from 'react';
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
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { MainStackParamList } from '../../../../app/navigation/types';
import type { AppTheme } from '../../../../shared/theme';
import { EmergencyFlowSteps } from '../components/EmergencyFlowSteps';
import { emergencyApi } from '../../data/EmergencyApi';
import { getCurrentCoordinates } from '../../data/locationService';
import { useEmergencyFlow } from '../providers/EmergencyFlowProvider';

type EmergencyNavigation = NativeStackNavigationProp<
  MainStackParamList,
  'Emergency'
>;
type EmergencyRoute = RouteProp<MainStackParamList, 'Emergency'>;


export const EmergencyScreen = (): ReactElement => {
  const tema = useTheme() as AppTheme;
  const estilos = crearEstilos(tema);
  const navigation = useNavigation<EmergencyNavigation>();
  const route = useRoute<EmergencyRoute>();
  const { draft, updateDraft, setCurrentEmergency } = useEmergencyFlow();
  const [canSpeak, setCanSpeak] = useState(true);
  const [locating, setLocating] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const flow = route.params?.flow ?? 'guided';
  const isDirectFlow = flow === 'direct';
  const emergencyLabel = isDirectFlow
    ? 'Alerta directa 168'
    : route.params?.quickAccess ?? 'Emergencia medica';
  const flowLabels = isDirectFlow
    ? ['168', 'Confirmar']
    : ['Acceso', 'Confirmar', 'Tipo', 'Triage', 'Central', 'Seguimiento'];

  useEffect(() => {
    updateDraft({ flow });
    getCurrentCoordinates()
      .then(location => updateDraft({ location }))
      .catch(error =>
        Alert.alert(
          'Ubicacion requerida',
          error instanceof Error ? error.message : 'No se pudo obtener la ubicacion.',
        ),
      )
      .finally(() => setLocating(false));
  }, [flow, updateDraft]);

  useEffect(() => {
    updateDraft({ canSpeak });
  }, [canSpeak, updateDraft]);

  const onConfirm = async (): Promise<void> => {
    let location = draft.location;
    if (!location) {
      setLocating(true);
      try {
        location = await getCurrentCoordinates();
        updateDraft({ location });
      } catch (error) {
        Alert.alert(
          'No se puede enviar la alerta',
          error instanceof Error ? error.message : 'Ubicacion no disponible.',
        );
        return;
      } finally {
        setLocating(false);
      }
    }

    updateDraft({ flow, canSpeak, location });
    if (!isDirectFlow) {
      navigation.navigate('EmergencyType');
      return;
    }

    setSubmitting(true);
    try {
      const emergency = await emergencyApi.createEmergency({
        ...location,
        typeCode: 'MEDICA',
        severity: 'ALTA',
        canSpeak,
        locationConfirmed: true,
        flow: 'direct',
        triage: draft.triage,
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
        <Text style={estilos.headerTitle}>
          {isDirectFlow ? 'Confirmar alerta 168' : 'Confirmar emergencia'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={estilos.content}>
        <EmergencyFlowSteps activeStep={2} labels={flowLabels} />

        {isDirectFlow ? (
          <View style={estilos.fastNotice}>
            <MaterialCommunityIcons name="flash" size={24} color={tema.colors.accentText} />
            <Text style={estilos.fastNoticeText}>
              Flujo rapido: con esta confirmacion se envia ubicacion, perfil y
              disponibilidad para hablar a la Central 168.
            </Text>
          </View>
        ) : null}

        <View style={estilos.summaryCard}>
          <View style={estilos.summaryRow}>
            <Text style={estilos.summaryLabel}>Tipo</Text>
            <Text style={estilos.summaryValue}>{emergencyLabel}</Text>
          </View>
          <View style={estilos.summaryRow}>
            <Text style={estilos.summaryLabel}>Ubicacion</Text>
            <Text style={estilos.summaryValue}>
              {locating
                ? 'Detectando...'
                : draft.location
                  ? `${draft.location.latitude.toFixed(5)}, ${draft.location.longitude.toFixed(5)}`
                  : 'No disponible'}
            </Text>
          </View>
          <View style={estilos.summaryRow}>
            <Text style={estilos.summaryLabel}>Modo</Text>
            <Text style={estilos.summaryValue}>{canSpeak ? 'Puede hablar' : 'Silencioso'}</Text>
          </View>
        </View>

        <Text style={estilos.question}>Puedes hablar?</Text>
        <View style={estilos.choiceRow}>
          {[true, false].map(value => {
            const isActive = value === canSpeak;
            const label = value ? 'Si' : 'No';

            return (
              <Pressable
                key={label}
                accessibilityRole="button"
                style={[estilos.choiceButton, isActive && estilos.choiceButtonActive]}
                onPress={() => setCanSpeak(value)}
              >
                <MaterialCommunityIcons
                  name={value ? 'microphone' : 'microphone-off'}
                  size={26}
                  color={isActive ? tema.colors.onFill : tema.colors.accentText}
                />
                <Text style={[estilos.choiceText, isActive && estilos.choiceTextActive]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {!canSpeak ? (
          <View style={estilos.silentMode}>
            <MaterialCommunityIcons name="volume-off" size={24} color={tema.colors.warningText} />
            <Text style={estilos.silentText}>
              Se enviara como modo silencioso para que el operador priorice chat,
              datos y ubicacion.
            </Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={locating || submitting}
          style={({ pressed }) => [estilos.sendButton, pressed && estilos.pressed]}
          onPress={onConfirm}
        >
          {submitting || locating ? (
            <ActivityIndicator color={tema.colors.onFill} />
          ) : (
            <Text style={estilos.sendButtonText}>
              {isDirectFlow ? 'ENVIAR ALERTA 168' : 'CONFIRMAR Y CLASIFICAR'}
            </Text>
          )}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          style={estilos.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={estilos.cancelText}>Cancelar</Text>
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
    paddingHorizontal: 26,
    paddingTop: 34,
    paddingBottom: 38,
  },
  fastNotice: {
    marginBottom: 18,
    borderRadius: 8,
    backgroundColor: tema.colors.dangerSoft,
    borderWidth: 1,
    borderColor: tema.colors.dangerSoft,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
  },
  fastNoticeText: {
    flex: 1,
    color: tema.colors.dangerText,
    fontSize: 14,
    lineHeight: 19,
    fontFamily: tema.fuentes.bold,
  },
  summaryCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tema.colors.border,
    backgroundColor: tema.colors.background,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  summaryRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: tema.colors.border,
  },
  summaryLabel: {
    color: tema.colors.textMuted,
    fontSize: 16,
    lineHeight: 21,
  },
  summaryValue: {
    color: tema.colors.text,
    fontSize: 17,
    lineHeight: 22,
    fontFamily: tema.fuentes.bold,
  },
  question: {
    marginTop: 42,
    color: tema.colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontFamily: tema.fuentes.bold,
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
    borderColor: tema.colors.accentText,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  choiceButtonActive: {
    backgroundColor: tema.colors.accentFill,
  },
  choiceText: {
    color: tema.colors.accentText,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: tema.fuentes.bold,
  },
  choiceTextActive: {
    color: tema.colors.onFill,
  },
  silentMode: {
    marginTop: 20,
    borderRadius: 8,
    backgroundColor: tema.colors.warningSoft,
    borderWidth: 1,
    borderColor: tema.colors.warningSoft,
    padding: 16,
    flexDirection: 'row',
    gap: 10,
  },
  silentText: {
    flex: 1,
    color: tema.colors.warningText,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: tema.fuentes.semiBold,
  },
  sendButton: {
    marginTop: 34,
    minHeight: 68,
    borderRadius: 8,
    backgroundColor: tema.colors.accentFill,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  pressed: {
    opacity: 0.86,
  },
  sendButtonText: {
    color: tema.colors.onFill,
    fontSize: 20,
    lineHeight: 25,
    fontFamily: tema.fuentes.bold,
  },
  cancelButton: {
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: tema.colors.textMuted,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: tema.fuentes.semiBold,
  },
});
