import React, { ReactElement } from 'react';
import {
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
import { BottomTabBar } from '../components/BottomTabBar';

type HistoryNavigation = NativeStackNavigationProp<MainStackParamList, 'History'>;

const RED = '#F63F5F';

const emergencies = [
  {
    code: 'EMG-2026-000231',
    type: 'Medica',
    status: 'Finalizada',
    date: '22/05/2026 - 18:42',
  },
  {
    code: 'EMG-2026-000198',
    type: 'Accidente',
    status: 'Cancelada',
    date: '18/05/2026 - 09:10',
  },
  {
    code: 'EMG-2026-000144',
    type: 'Violencia',
    status: 'Derivada',
    date: '03/05/2026 - 22:18',
  },
];

export const HistoryScreen = (): ReactElement => {
  const navigation = useNavigation<HistoryNavigation>();

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Mis emergencias</Text>
        <Text style={styles.subtitle}>Codigo, tipo, estado y fecha del evento.</Text>

        {emergencies.map(item => (
          <View key={item.code} style={styles.card}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="clipboard-pulse" size={28} color={RED} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.code}>{item.code}</Text>
              <Text style={styles.meta}>
                {item.type} | {item.status}
              </Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
          </View>
        ))}
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
});
