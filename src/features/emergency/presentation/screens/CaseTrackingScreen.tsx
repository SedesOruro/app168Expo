import React, { ReactElement, useEffect } from 'react';
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
import { useQuery } from '@tanstack/react-query';

import type { MainStackParamList } from '../../../../app/navigation/types';
import type { AppTheme } from '../../../../shared/theme';
import { servicio } from '../../../../shared/constants/institucion';
import { emergencyApi } from '../../data/EmergencyApi';
import { llamarDirecto } from '../../data/llamadaDirecta';
import { useEmergencyFlow } from '../providers/EmergencyFlowProvider';

type CaseTrackingNavigation = NativeStackNavigationProp<
  MainStackParamList,
  'CaseTracking'
>;
type CaseTrackingRoute = RouteProp<MainStackParamList, 'CaseTracking'>;


export const CaseTrackingScreen = (): ReactElement => {
  const tema = useTheme() as AppTheme;
  const estilos = crearEstilos(tema);
  const navigation = useNavigation<CaseTrackingNavigation>();
  const route = useRoute<CaseTrackingRoute>();
  const { currentEmergency, setCurrentEmergency } = useEmergencyFlow();
  const emergencyUuid = route.params?.emergencyUuid ?? currentEmergency?.uuid;
  const query = useQuery({
    queryKey: ['emergency', emergencyUuid],
    queryFn: () => emergencyApi.getEmergency(String(emergencyUuid)),
    enabled: Boolean(emergencyUuid),
    refetchInterval: 10_000,
  });
  const emergency = query.data ?? currentEmergency;

  useEffect(() => {
    if (query.data) setCurrentEmergency(query.data);
  }, [query.data, setCurrentEmergency]);

  // Si la central ya asigno operador con telefono se le llama directo; si no,
  // se llama al 168, que siempre atiende.
  const telefonoOperador = emergency?.operador?.telefono;
  const callOperator = async (): Promise<void> => {
    try {
      await llamarDirecto(telefonoOperador || servicio.numero);
    } catch {
      Alert.alert(
        'No se pudo iniciar la llamada',
        `Marca el ${telefonoOperador || servicio.numero} desde la aplicacion de llamadas.`,
      );
    }
  };

  return (
    <SafeAreaView style={estilos.screen}>
      <StatusBar barStyle={tema.isDark ? 'light-content' : 'dark-content'} backgroundColor={tema.colors.accentText} />
      <View style={estilos.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Inicio"
          style={estilos.backButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <MaterialCommunityIcons name="home" size={30} color={tema.colors.onFill} />
        </Pressable>
        <Text style={estilos.headerTitle}>Seguimiento del caso</Text>
      </View>

      <ScrollView contentContainerStyle={estilos.content}>
        {!emergency && query.isLoading ? <ActivityIndicator size="large" color={tema.colors.accentText} /> : null}
        <View style={estilos.successIcon}>
          <MaterialCommunityIcons name="check-bold" size={48} color={tema.colors.onFill} />
        </View>
        <Text style={estilos.title}>
          {emergency?.estado?.es_final ? 'Atencion concluida' : 'Emergencia en seguimiento'}
        </Text>
        <Text style={estilos.code}>Codigo: {emergency?.codigo_publico ?? 'Sin registro'}</Text>

        <View style={estilos.timelineCard}>
          <Text style={estilos.sectionTitle}>Estado en tiempo real</Text>
          {(emergency?.historial ?? []).map((item, index, history) => (
            <View key={item.id} style={estilos.timelineRow}>
              <View style={estilos.timelineMarkerWrap}>
                <View style={[estilos.dot, estilos.dotDone]} />
                {index < history.length - 1 ? <View style={estilos.line} /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[estilos.timelineText, estilos.timelineTextDone]}>
                  {item.estadoNuevo?.nombre ?? 'Actualizacion'}
                </Text>
                <Text style={estilos.timelineDate}>
                  {new Date(item.created_at).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
          {!emergency?.historial?.length ? (
            <Text style={estilos.timelineText}>Esperando actualizaciones de la central.</Text>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [estilos.operatorButton, pressed && estilos.pressed]}
          onPress={callOperator}
        >
          <MaterialCommunityIcons name="phone" size={24} color={tema.colors.onFill} />
          <Text style={estilos.operatorText}>
            {telefonoOperador ? 'LLAMAR OPERADOR' : `LLAMAR AL ${servicio.numero}`}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          style={estilos.secondaryButton}
          onPress={() =>
            navigation.navigate('Evidence', { emergencyUuid: emergency?.uuid })
          }
        >
          <MaterialCommunityIcons name="camera-plus" size={24} color={tema.colors.accentText} />
          <Text style={estilos.secondaryText}>Agregar evidencia opcional</Text>
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
    alignItems: 'center',
  },
  successIcon: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: tema.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 22,
    color: tema.colors.text,
    fontSize: 25,
    lineHeight: 31,
    fontFamily: tema.fuentes.bold,
    textAlign: 'center',
  },
  code: {
    marginTop: 8,
    color: tema.colors.accentText,
    fontSize: 17,
    lineHeight: 22,
    fontFamily: tema.fuentes.bold,
  },
  timelineCard: {
    width: '100%',
    marginTop: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tema.colors.border,
    paddingHorizontal: 22,
    paddingVertical: 22,
  },
  sectionTitle: {
    marginBottom: 18,
    color: tema.colors.text,
    fontSize: 19,
    lineHeight: 25,
    fontFamily: tema.fuentes.bold,
  },
  timelineRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineMarkerWrap: {
    width: 30,
    alignItems: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: tema.colors.border,
    backgroundColor: tema.colors.surface,
  },
  dotDone: {
    borderColor: tema.colors.accentFill,
    backgroundColor: tema.colors.accentFill,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: tema.colors.border,
  },
  timelineText: {
    flex: 1,
    color: tema.colors.textMuted,
    fontSize: 18,
    lineHeight: 23,
    fontFamily: tema.fuentes.semiBold,
  },
  timelineTextDone: {
    color: tema.colors.text,
    fontFamily: tema.fuentes.bold,
  },
  timelineDate: {
    marginTop: 3,
    color: tema.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  operatorButton: {
    width: '100%',
    marginTop: 30,
    minHeight: 66,
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
  operatorText: {
    color: tema.colors.onFill,
    fontSize: 18,
    lineHeight: 23,
    fontFamily: tema.fuentes.bold,
  },
  secondaryButton: {
    width: '100%',
    marginTop: 16,
    minHeight: 58,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: tema.colors.accentText,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  secondaryText: {
    color: tema.colors.accentText,
    fontSize: 17,
    lineHeight: 22,
    fontFamily: tema.fuentes.bold,
  },
});
