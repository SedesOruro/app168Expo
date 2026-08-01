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
import { BottomTabBar } from '../components/BottomTabBar';

type ProfileNavigation = NativeStackNavigationProp<MainStackParamList, 'Profile'>;

const RED = '#F63F5F';

const profileRows = [
  { icon: 'account-outline', label: 'Nombre / CI / Celular', value: 'Gian Delgadillo | 4700888 | 78610186' },
  { icon: 'home-outline', label: 'Direccion', value: 'Pre Montes 1880' },
  { icon: 'blood-bag', label: 'Grupo sanguineo', value: 'O+' },
  { icon: 'alert-circle-outline', label: 'Alergias', value: 'Penicilina' },
  { icon: 'medical-bag', label: 'Enfermedades', value: 'Hipertension controlada' },
  { icon: 'pill', label: 'Medicamentos', value: 'Losartan 50 mg' },
  { icon: 'account-heart-outline', label: 'Contacto referencia', value: 'Marilyn Huanca | 79409483' },
] as const;

export const ProfileScreen = (): ReactElement => {
  const navigation = useNavigation<ProfileNavigation>();

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Mi perfil de emergencia</Text>
        <Text style={styles.subtitle}>
          Datos guardados una sola vez para ayudar al operador.
        </Text>

        <View style={styles.card}>
          {profileRows.map((item, index) => (
            <View key={item.label} style={styles.dataRow}>
              <MaterialCommunityIcons name={item.icon} size={27} color={RED} />
              <View style={styles.rowCopy}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.dataText}>{item.value}</Text>
              </View>
              {index < profileRows.length - 1 && <View style={styles.rowDivider} />}
            </View>
          ))}
        </View>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Editar perfil de emergencia"
        style={styles.editButton}
        onPress={() => navigation.navigate('ProfileEdit')}
      >
        <MaterialCommunityIcons name="content-save-edit" size={30} color="#FFFFFF" />
      </Pressable>
      <BottomTabBar active="Profile" navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 150,
  },
  title: {
    color: RED,
    fontSize: 29,
    lineHeight: 35,
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
  card: {
    marginTop: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 18,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
  },
  dataRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rowCopy: {
    flex: 1,
  },
  rowLabel: {
    color: '#777777',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  dataText: {
    marginTop: 3,
    color: '#333333',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },
  rowDivider: {
    position: 'absolute',
    left: 42,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: '#ECECEC',
  },
  editButton: {
    position: 'absolute',
    right: 34,
    bottom: 152,
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
});
