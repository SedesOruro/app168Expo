import React, { ReactElement, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import type { MainStackParamList } from '../../../../app/navigation/types';
import { EmergencyFlowSteps } from '../components/EmergencyFlowSteps';
import { emergencyApi } from '../../data/EmergencyApi';
import { useEmergencyFlow } from '../providers/EmergencyFlowProvider';

type CaseTrackingNavigation = NativeStackNavigationProp<
  MainStackParamList,
  'CaseTracking'
>;
type CaseTrackingRoute = RouteProp<MainStackParamList, 'CaseTracking'>;

const RED = '#F63F5F';

export const CaseTrackingScreen = (): ReactElement => {
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

  const callOperator = async (): Promise<void> => {
    const phone = emergency?.operador?.telefono;
    if (!phone) {
      Alert.alert('Operador no disponible', 'La central aun no asigno un numero de contacto.');
      return;
    }
    await Linking.openURL(`tel:${phone}`);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={RED} />
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Inicio"
          style={styles.backButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <MaterialCommunityIcons name="home" size={30} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Seguimiento del caso</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <EmergencyFlowSteps activeStep={6} />

        {!emergency && query.isLoading ? <ActivityIndicator size="large" color={RED} /> : null}
        <View style={styles.successIcon}>
          <MaterialCommunityIcons name="check-bold" size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>
          {emergency?.estado?.es_final ? 'Atencion concluida' : 'Emergencia en seguimiento'}
        </Text>
        <Text style={styles.code}>Codigo: {emergency?.codigo_publico ?? 'Sin registro'}</Text>

        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Estado en tiempo real</Text>
          {(emergency?.historial ?? []).map((item, index, history) => (
            <View key={item.id} style={styles.timelineRow}>
              <View style={styles.timelineMarkerWrap}>
                <View style={[styles.dot, styles.dotDone]} />
                {index < history.length - 1 ? <View style={styles.line} /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.timelineText, styles.timelineTextDone]}>
                  {item.estadoNuevo?.nombre ?? 'Actualizacion'}
                </Text>
                <Text style={styles.timelineDate}>
                  {new Date(item.created_at).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
          {!emergency?.historial?.length ? (
            <Text style={styles.timelineText}>Esperando actualizaciones de la central.</Text>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.operatorButton, pressed && styles.pressed]}
          onPress={callOperator}
        >
          <MaterialCommunityIcons name="phone" size={24} color="#FFFFFF" />
          <Text style={styles.operatorText}>LLAMAR OPERADOR</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          style={styles.secondaryButton}
          onPress={() =>
            navigation.navigate('Evidence', { emergencyUuid: emergency?.uuid })
          }
        >
          <MaterialCommunityIcons name="camera-plus" size={24} color={RED} />
          <Text style={styles.secondaryText}>Agregar evidencia opcional</Text>
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
    alignItems: 'center',
  },
  successIcon: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#138A49',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 22,
    color: '#303030',
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
    textAlign: 'center',
  },
  code: {
    marginTop: 8,
    color: RED,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
  },
  timelineCard: {
    width: '100%',
    marginTop: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    paddingHorizontal: 22,
    paddingVertical: 22,
  },
  sectionTitle: {
    marginBottom: 18,
    color: '#303030',
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '900',
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
    borderColor: '#8C8C8C',
    backgroundColor: '#FFFFFF',
  },
  dotDone: {
    borderColor: RED,
    backgroundColor: RED,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#D6D6D6',
  },
  timelineText: {
    flex: 1,
    color: '#6A6A6A',
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '700',
  },
  timelineTextDone: {
    color: '#303030',
    fontWeight: '900',
  },
  timelineDate: {
    marginTop: 3,
    color: '#777777',
    fontSize: 13,
    lineHeight: 18,
  },
  operatorButton: {
    width: '100%',
    marginTop: 30,
    minHeight: 66,
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
  operatorText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
  },
  secondaryButton: {
    width: '100%',
    marginTop: 16,
    minHeight: 58,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  secondaryText: {
    color: RED,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
  },
});
