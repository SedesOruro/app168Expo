import React, { ReactElement } from 'react';
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

type ApiCentralNavigation = NativeStackNavigationProp<
  MainStackParamList,
  'ApiCentral'
>;

const RED = '#F63F5F';

const payloadItems = [
  { icon: 'account-check', label: 'Perfil del ciudadano', value: 'ID, telefono y contacto' },
  { icon: 'crosshairs-gps', label: 'Ubicacion GPS', value: '-17.3895, -66.1568' },
  { icon: 'clipboard-pulse', label: 'Tipo y gravedad', value: 'Accidente | Alta' },
  { icon: 'medical-bag', label: 'Triage rapido', value: 'Respira, consciente, riesgo' },
  { icon: 'battery-40', label: 'Bateria y hora', value: '42% | 18:42' },
] as const;

export const ApiCentralScreen = (): ReactElement => {
  const navigation = useNavigation<ApiCentralNavigation>();

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
        <Text style={styles.headerTitle}>API / Central 168</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <EmergencyFlowSteps activeStep={5} />

        <View style={styles.centralIcon}>
          <MaterialCommunityIcons name="server-network" size={50} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Alerta enviada al Server API</Text>
        <Text style={styles.subtitle}>
          La Central 168 recibe datos operativos para priorizar y despachar.
        </Text>

        <View style={styles.statusPanel}>
          <View style={styles.liveDot} />
          <Text style={styles.statusText}>Central conectada por Socket.IO</Text>
        </View>

        <View style={styles.payloadCard}>
          <Text style={styles.sectionTitle}>Datos minimos enviados</Text>
          {payloadItems.map(item => (
            <View key={item.label} style={styles.payloadRow}>
              <MaterialCommunityIcons name={item.icon} size={24} color={RED} />
              <View style={styles.payloadCopy}>
                <Text style={styles.payloadLabel}>{item.label}</Text>
                <Text style={styles.payloadValue}>{item.value}</Text>
              </View>
              <MaterialCommunityIcons name="check-circle" size={22} color="#138A49" />
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}
          onPress={() => navigation.navigate('CaseTracking')}
        >
          <Text style={styles.nextText}>Ver seguimiento del caso</Text>
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
    paddingTop: 28,
    paddingBottom: 38,
    alignItems: 'center',
  },
  centralIcon: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 20,
    color: '#303030',
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    color: '#666666',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  statusPanel: {
    width: '100%',
    marginTop: 22,
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: '#EAF8EF',
    borderWidth: 1,
    borderColor: '#BFE6CC',
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
    backgroundColor: '#138A49',
  },
  statusText: {
    color: '#138A49',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
  },
  payloadCard: {
    width: '100%',
    marginTop: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  sectionTitle: {
    marginBottom: 10,
    color: '#303030',
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
  },
  payloadRow: {
    minHeight: 58,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  payloadCopy: {
    flex: 1,
  },
  payloadLabel: {
    color: '#303030',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  payloadValue: {
    marginTop: 2,
    color: '#666666',
    fontSize: 13,
    lineHeight: 18,
  },
  nextButton: {
    width: '100%',
    marginTop: 28,
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
  nextText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
  },
});
