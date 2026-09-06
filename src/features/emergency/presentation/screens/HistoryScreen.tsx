import React, { ReactElement } from 'react';
import {
  ActivityIndicator,
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
import { useQuery } from '@tanstack/react-query';

import type { MainStackParamList } from '../../../../app/navigation/types';
import type { AppTheme } from '../../../../shared/theme';
import { BottomTabBar } from '../components/BottomTabBar';
import { emergencyApi } from '../../data/EmergencyApi';
import { useEmergencyFlow } from '../providers/EmergencyFlowProvider';

type HistoryNavigation = NativeStackNavigationProp<MainStackParamList, 'History'>;


export const HistoryScreen = (): ReactElement => {
  const tema = useTheme() as AppTheme;
  const estilos = crearEstilos(tema);
  const navigation = useNavigation<HistoryNavigation>();
  const { setCurrentEmergency } = useEmergencyFlow();
  const query = useQuery({
    queryKey: ['emergency-history'],
    queryFn: emergencyApi.listEmergencies,
  });
  const emergencies = query.data ?? [];

  return (
    <SafeAreaView style={estilos.screen}>
      <StatusBar barStyle={tema.isDark ? 'light-content' : 'dark-content'} backgroundColor={tema.colors.surface} />
      <ScrollView contentContainerStyle={estilos.content}>
        <Text style={estilos.title}>Mis emergencias</Text>
        <Text style={estilos.subtitle}>Codigo, tipo, estado y fecha del evento.</Text>

        {query.isLoading ? <ActivityIndicator size="large" color={tema.colors.accentText} /> : null}
        {emergencies.map(item => (
          <Pressable
            key={item.uuid}
            style={estilos.card}
            onPress={() => {
              setCurrentEmergency(item);
              navigation.navigate('CaseTracking', { emergencyUuid: item.uuid });
            }}
          >
            <View style={estilos.iconWrap}>
              <MaterialCommunityIcons name="clipboard-pulse" size={28} color={tema.colors.accentText} />
            </View>
            <View style={estilos.cardBody}>
              <Text style={estilos.code}>{item.codigo_publico}</Text>
              <Text style={estilos.meta}>
                {item.tipo?.nombre ?? 'Emergencia'} | {item.estado?.nombre ?? 'Sin estado'}
              </Text>
              <Text style={estilos.date}>{new Date(item.created_at).toLocaleString()}</Text>
            </View>
          </Pressable>
        ))}
        {!query.isLoading && emergencies.length === 0 ? (
          <Text style={estilos.emptyText}>Todavia no registro emergencias.</Text>
        ) : null}
      </ScrollView>
      <BottomTabBar active="History" navigation={navigation} />
    </SafeAreaView>
  );
};

const crearEstilos = (tema: AppTheme) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tema.colors.background,
  },
  content: {
    paddingHorizontal: 26,
    paddingTop: 52,
    paddingBottom: 130,
  },
  title: {
    color: tema.colors.accentText,
    fontSize: 30,
    lineHeight: 36,
    fontFamily: tema.fuentes.bold,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    marginBottom: 20,
    color: tema.colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  card: {
    marginTop: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tema.colors.border,
    backgroundColor: tema.colors.surface,
    padding: 18,
    flexDirection: 'row',
    gap: 14,
    elevation: 3,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tema.colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
  },
  code: {
    color: tema.colors.text,
    fontSize: 18,
    lineHeight: 23,
    fontFamily: tema.fuentes.bold,
  },
  meta: {
    marginTop: 6,
    color: tema.colors.accentText,
    fontSize: 16,
    lineHeight: 21,
    fontFamily: tema.fuentes.bold,
  },
  date: {
    marginTop: 6,
    color: tema.colors.textMuted,
    fontSize: 15,
    lineHeight: 20,
  },
  emptyText: {
    marginTop: 30,
    color: tema.colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
  },
});
