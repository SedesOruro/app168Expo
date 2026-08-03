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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import type { MainStackParamList } from '../../../../app/navigation/types';
import { BottomTabBar } from '../components/BottomTabBar';
import { emergencyApi } from '../../data/EmergencyApi';
import { useEmergencyFlow } from '../providers/EmergencyFlowProvider';

type HistoryNavigation = NativeStackNavigationProp<MainStackParamList, 'History'>;

const RED = '#F63F5F';

export const HistoryScreen = (): ReactElement => {
  const navigation = useNavigation<HistoryNavigation>();
  const { setCurrentEmergency } = useEmergencyFlow();
  const query = useQuery({
    queryKey: ['emergency-history'],
    queryFn: emergencyApi.listEmergencies,
  });
  const emergencies = query.data ?? [];

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Mis emergencias</Text>
        <Text style={styles.subtitle}>Codigo, tipo, estado y fecha del evento.</Text>

        {query.isLoading ? <ActivityIndicator size="large" color={RED} /> : null}
        {emergencies.map(item => (
          <Pressable
            key={item.uuid}
            style={styles.card}
            onPress={() => {
              setCurrentEmergency(item);
              navigation.navigate('CaseTracking', { emergencyUuid: item.uuid });
            }}
          >
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="clipboard-pulse" size={28} color={RED} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.code}>{item.codigo_publico}</Text>
              <Text style={styles.meta}>
                {item.tipo?.nombre ?? 'Emergencia'} | {item.estado?.nombre ?? 'Sin estado'}
              </Text>
              <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
            </View>
          </Pressable>
        ))}
        {!query.isLoading && emergencies.length === 0 ? (
          <Text style={styles.emptyText}>Todavia no registro emergencias.</Text>
        ) : null}
      </ScrollView>
      <BottomTabBar active="History" navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  content: {
    paddingHorizontal: 26,
    paddingTop: 52,
    paddingBottom: 130,
  },
  title: {
    color: RED,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    marginBottom: 20,
    color: '#666666',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  card: {
    marginTop: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    backgroundColor: '#FFFFFF',
    padding: 18,
    flexDirection: 'row',
    gap: 14,
    elevation: 3,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE8EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
  },
  code: {
    color: '#303030',
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
  },
  meta: {
    marginTop: 6,
    color: RED,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
  },
  date: {
    marginTop: 6,
    color: '#666666',
    fontSize: 15,
    lineHeight: 20,
  },
  emptyText: {
    marginTop: 30,
    color: '#666666',
    fontSize: 16,
    textAlign: 'center',
  },
});
