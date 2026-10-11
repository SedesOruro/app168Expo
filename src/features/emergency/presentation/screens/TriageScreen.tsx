import React, { ReactElement, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
import { useEmergencyFlow } from '../providers/EmergencyFlowProvider';

type TriageNavigation = NativeStackNavigationProp<MainStackParamList, 'Triage'>;

const pasos = ['Que pasa', 'Detalles'];

const tiposEmergencia = [
  { icon: 'heart-pulse', label: 'Salud', codigo: 'MEDICA' },
  { icon: 'car-brake-alert', label: 'Accidente', codigo: 'ACCIDENTE' },
  { icon: 'fire', label: 'Incendio', codigo: 'INCENDIO' },
  { icon: 'shield-alert', label: 'Violencia', codigo: 'SEGURIDAD' },
  { icon: 'dots-horizontal', label: 'Otro', codigo: 'OTRO' },
] as const;

const preguntasTriage = [
  { key: 'breathing', label: 'La persona respira?', options: ['Si', 'No', 'No se'] },
  { key: 'conscious', label: 'Esta consciente?', options: ['Si', 'No', 'No se'] },
  { key: 'danger', label: 'Hay riesgo en el lugar?', options: ['Si', 'No', 'No se'] },
];

const codigoRespuesta = (valor: string): string =>
  valor === 'Si' ? 'SI' : valor === 'No' ? 'NO' : 'NO_SE';

/**
 * Triage posterior a la llamada al 168. La emergencia ya se registro con la
 * ubicacion al pulsar el boton; aqui solo se completa lo que la persona pueda
 * contar, en dos pasos y siempre con la opcion de omitirlo.
 */
export const TriageScreen = (): ReactElement => {
  const tema = useTheme() as AppTheme;
  const estilos = crearEstilos(tema);
  const navigation = useNavigation<TriageNavigation>();
  const {
    currentEmergency,
    estadoRegistro,
    errorRegistro,
    registrarAlerta,
    setCurrentEmergency,
  } = useEmergencyFlow();
  const [paso, setPaso] = useState(1);
  const [tipo, setTipo] = useState<string>('MEDICA');
  const [respuestas, setRespuestas] = useState<Record<string, string>>({
    breathing: 'No se',
    conscious: 'No se',
    danger: 'No se',
  });
  const [afectados, setAfectados] = useState(1);
  const [nota, setNota] = useState('');
  const [enviando, setEnviando] = useState(false);
  const registrada = estadoRegistro === 'registrada' && Boolean(currentEmergency);

  const irASeguimiento = (): void => {
    if (registrada) {
      navigation.replace('CaseTracking', { emergencyUuid: currentEmergency?.uuid });
      return;
    }
    navigation.navigate('Dashboard');
  };

  const volver = (): void => {
    if (paso === 2) {
      setPaso(1);
      return;
    }
    navigation.goBack();
  };

  const enviar = async (): Promise<void> => {
    if (!currentEmergency) return;
    setEnviando(true);
    try {
      const actualizada = await emergencyApi.completeTriage(currentEmergency.uuid, {
        typeCode: tipo,
        triage: Object.fromEntries(
          Object.entries(respuestas).map(([clave, valor]) => [clave, codigoRespuesta(valor)]),
        ),
        affected: afectados,
        description: nota.trim() || undefined,
      });
      setCurrentEmergency(actualizada);
      navigation.replace('CaseTracking', { emergencyUuid: actualizada.uuid });
    } catch (error) {
      Alert.alert(
        'No se pudieron enviar los datos',
        error instanceof Error ? error.message : 'Intente nuevamente.',
      );
    } finally {
      setEnviando(false);
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
          onPress={volver}
        >
          <MaterialCommunityIcons name="arrow-left" size={32} color={tema.colors.onFill} />
        </Pressable>
        <Text style={estilos.headerTitle}>Completar datos</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Omitir triage"
          style={estilos.skipButton}
          onPress={irASeguimiento}
        >
          <Text style={estilos.skipText}>Omitir</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={estilos.content} keyboardShouldPersistTaps="handled">
        <EmergencyFlowSteps activeStep={paso} labels={pasos} />

        <View style={estilos.estadoAlerta}>
          {estadoRegistro === 'registrando' || estadoRegistro === 'sin_iniciar' ? (
            <>
              <ActivityIndicator color={tema.colors.accentText} />
              <Text style={estilos.estadoTexto}>Enviando tu ubicacion a la central...</Text>
            </>
          ) : null}
          {registrada ? (
            <>
              <MaterialCommunityIcons name="check-circle" size={22} color={tema.colors.success} />
              <Text style={estilos.estadoTexto}>
                Alerta registrada: {currentEmergency?.codigo_publico}
              </Text>
            </>
          ) : null}
          {estadoRegistro === 'fallida' ? (
            <View style={estilos.estadoFallido}>
              <Text style={estilos.estadoTexto}>
                {errorRegistro ?? 'No se pudo registrar la alerta.'} Tu llamada al 168
                sigue siendo valida.
              </Text>
              <Pressable
                accessibilityRole="button"
                style={estilos.retryButton}
                onPress={() => void registrarAlerta()}
              >
                <Text style={estilos.retryText}>Reintentar</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {paso === 1 ? (
          <>
            <Text style={estilos.question}>Que tipo de emergencia es?</Text>
            <View style={estilos.typeGrid}>
              {tiposEmergencia.map(opcion => {
                const activo = tipo === opcion.codigo;
                return (
                  <Pressable
                    key={opcion.codigo}
                    accessibilityRole="button"
                    accessibilityState={{ selected: activo }}
                    style={[estilos.typeChip, activo && estilos.optionButtonActive]}
                    onPress={() => setTipo(opcion.codigo)}
                  >
                    <MaterialCommunityIcons
                      name={opcion.icon}
                      size={22}
                      color={activo ? tema.colors.onFill : tema.colors.accentText}
                    />
                    <Text style={[estilos.optionText, activo && estilos.optionTextActive]}>
                      {opcion.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {preguntasTriage.map(pregunta => (
              <View key={pregunta.key} style={estilos.questionBlock}>
                <Text style={estilos.question}>{pregunta.label}</Text>
                <View style={estilos.optionRow}>
                  {pregunta.options.map(opcion => {
                    const activo = respuestas[pregunta.key] === opcion;
                    return (
                      <Pressable
                        key={opcion}
                        accessibilityRole="button"
                        accessibilityState={{ selected: activo }}
                        style={[estilos.optionButton, activo && estilos.optionButtonActive]}
                        onPress={() =>
                          setRespuestas(actuales => ({ ...actuales, [pregunta.key]: opcion }))
                        }
                      >
                        <Text style={[estilos.optionText, activo && estilos.optionTextActive]}>
                          {opcion}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [estilos.sendButton, pressed && estilos.pressed]}
              onPress={() => setPaso(2)}
            >
              <Text style={estilos.sendText}>Siguiente</Text>
              <MaterialCommunityIcons name="arrow-right" size={24} color={tema.colors.onFill} />
            </Pressable>
          </>
        ) : (
          <>
            <View style={estilos.questionBlock}>
              <Text style={estilos.question}>Cuantas personas necesitan ayuda?</Text>
              <View style={estilos.stepper}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Menos personas"
                  disabled={afectados <= 1}
                  style={[estilos.stepperButton, afectados <= 1 && estilos.disabled]}
                  onPress={() => setAfectados(valor => Math.max(1, valor - 1))}
                >
                  <MaterialCommunityIcons name="minus" size={28} color={tema.colors.accentText} />
                </Pressable>
                <Text style={estilos.stepperValue}>{afectados}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Mas personas"
                  style={estilos.stepperButton}
                  onPress={() => setAfectados(valor => Math.min(999, valor + 1))}
                >
                  <MaterialCommunityIcons name="plus" size={28} color={tema.colors.accentText} />
                </Pressable>
              </View>
            </View>

            <View style={estilos.questionBlock}>
              <Text style={estilos.question}>Algo mas que deba saber la central?</Text>
              <TextInput
                value={nota}
                onChangeText={setNota}
                placeholder="Opcional: que paso, referencias del lugar..."
                placeholderTextColor={tema.colors.textMuted}
                multiline
                maxLength={500}
                style={estilos.input}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={!registrada || enviando}
              style={({ pressed }) => [
                estilos.sendButton,
                (!registrada || enviando) && estilos.disabled,
                pressed && estilos.pressed,
              ]}
              onPress={enviar}
            >
              {enviando ? (
                <ActivityIndicator color={tema.colors.onFill} />
              ) : (
                <>
                  <MaterialCommunityIcons name="send" size={24} color={tema.colors.onFill} />
                  <Text style={estilos.sendText}>Enviar a la central</Text>
                </>
              )}
            </Pressable>
          </>
        )}
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
  skipButton: {
    position: 'absolute',
    right: 12,
    minHeight: 46,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    color: tema.colors.onFill,
    fontSize: 16,
    lineHeight: 21,
    fontFamily: tema.fuentes.bold,
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
  },
  estadoAlerta: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  estadoFallido: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  estadoTexto: {
    color: tema.colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: tema.fuentes.medium,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: tema.colors.accentText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    color: tema.colors.accentText,
    fontSize: 16,
    lineHeight: 21,
    fontFamily: tema.fuentes.bold,
  },
  typeGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeChip: {
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: tema.colors.accentText,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  questionBlock: {
    marginTop: 26,
  },
  question: {
    marginTop: 20,
    color: tema.colors.text,
    fontSize: 20,
    lineHeight: 26,
    fontFamily: tema.fuentes.bold,
  },
  optionRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    minHeight: 56,
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
  stepper: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  stepperButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.2,
    borderColor: tema.colors.accentText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    minWidth: 48,
    color: tema.colors.text,
    fontSize: 32,
    lineHeight: 38,
    fontFamily: tema.fuentes.bold,
    textAlign: 'center',
  },
  input: {
    marginTop: 12,
    minHeight: 110,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: tema.colors.accentText,
    padding: 14,
    color: tema.colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: tema.fuentes.regular,
    textAlignVertical: 'top',
  },
  sendButton: {
    marginTop: 34,
    minHeight: 68,
    borderRadius: 8,
    backgroundColor: tema.colors.accentFill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    elevation: 6,
  },
  disabled: {
    opacity: 0.5,
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
