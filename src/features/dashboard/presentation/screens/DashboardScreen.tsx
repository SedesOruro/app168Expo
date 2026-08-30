import { institucion } from '../../../../shared/constants/institucion';
import React, { ReactElement } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { MainStackParamList } from '../../../../app/navigation/types';
import { BrandStrip } from '../../../emergency/presentation/components/BrandStrip';
import { BottomTabBar } from '../../../emergency/presentation/components/BottomTabBar';
import { EmergencyFlowSteps } from '../../../emergency/presentation/components/EmergencyFlowSteps';
import { useAuth } from '../../../../app/providers/AuthProvider';

type DashboardNavigation = NativeStackNavigationProp<
  MainStackParamList,
  'Dashboard'
>;

const RED = '#F63F5F';
const DARK = '#272727';

const quickActions = [
  { icon: 'ambulance', label: 'Ambulancia' },
  { icon: 'fire-truck', label: 'Bomberos' },
  { icon: 'police-badge', label: 'Policia' },
  { icon: 'dots-horizontal-circle', label: 'Otro' },
] as const;

export const DashboardScreen = (): ReactElement => {
  const navigation = useNavigation<DashboardNavigation>();
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandWrap}>
          <BrandStrip />
        </View>

        <View style={styles.topStatus}>
          <Text style={styles.greeting}>
            Hola, {user?.name?.split(' ')[0] || 'ciudadano'}
          </Text>
          <View style={styles.gpsBadge}>
            <MaterialCommunityIcons name="crosshairs-gps" size={18} color="#138A49" />
            <Text style={styles.gpsText}>GPS al enviar</Text>
          </View>
        </View>

        <Text style={styles.title}>Centro de emergencias 168</Text>
        <Text style={styles.subtitle}>
          Pedir ayuda en maximo 2 taps. Atiende {institucion.sigla}.
        </Text>

        <View style={styles.flowWrap}>
          <EmergencyFlowSteps activeStep={1} />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Linea gratuita 168"
          style={({ pressed }) => [styles.ringButton, pressed && styles.pressed]}
          onPress={() => navigation.navigate('Emergency', { flow: 'direct' })}
        >
          <View style={styles.ringOuter}>
            <View style={styles.ringMiddle}>
              <View style={styles.ringInner}>
                <Text style={styles.number}>168</Text>
                <Text style={styles.freeLine}>EMERGENCIA</Text>
              </View>
            </View>
          </View>
        </Pressable>

        <Text style={styles.choiceText}>Accesos rapidos</Text>

        <View style={styles.options}>
          {quickActions.map(action => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              style={styles.optionCard}
              onPress={() =>
                navigation.navigate('Emergency', {
                  flow: 'guided',
                  quickAccess: action.label,
                })
              }
            >
              <MaterialCommunityIcons name={action.icon} size={44} color={RED} />
              <Text style={styles.optionText}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.readyPanel}>
          <MaterialCommunityIcons name="check-circle" size={24} color="#138A49" />
          <Text style={styles.readyText}>Estado: Listo para enviar</Text>
        </View>
      </ScrollView>

      <BottomTabBar active="Dashboard" navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 30,
    paddingBottom: 128,
    alignItems: 'center',
  },
  brandWrap: {
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 28,
  },
  topStatus: {
    width: '100%',
    marginBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    color: DARK,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
  },
  gpsBadge: {
    minHeight: 36,
    borderRadius: 18,
    backgroundColor: '#EAF8EF',
    borderWidth: 1,
    borderColor: '#BFE6CC',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gpsText: {
    color: '#138A49',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  title: {
    color: RED,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    color: '#333333',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  flowWrap: {
    width: '100%',
    marginTop: 22,
  },
  ringButton: {
    marginTop: 2,
  },
  pressed: {
    opacity: 0.88,
  },
  ringOuter: {
    width: 286,
    height: 286,
    borderRadius: 143,
    backgroundColor: '#FFE8EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringMiddle: {
    width: 248,
    height: 248,
    borderRadius: 124,
    backgroundColor: '#FF9AAE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 178,
    height: 178,
    borderRadius: 89,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 42,
    borderColor: RED,
  },
  number: {
    color: RED,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '900',
  },
  freeLine: {
    marginTop: 4,
    color: '#666666',
    fontSize: 15,
    lineHeight: 19,
    textAlign: 'center',
    fontWeight: '900',
  },
  choiceText: {
    marginTop: 30,
    color: '#333333',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
    textAlign: 'center',
  },
  options: {
    width: '100%',
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: '48%',
    minHeight: 92,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CFCFCF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 8,
  },
  optionText: {
    color: RED,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  readyPanel: {
    width: '100%',
    marginTop: 22,
    minHeight: 54,
    borderRadius: 8,
    backgroundColor: '#F4F4F4',
    borderWidth: 1,
    borderColor: '#E1E1E1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  readyText: {
    color: '#343434',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },
});
