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
import { TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { MainStackParamList } from '../../../../app/navigation/types';

type ProfileEditNavigation = NativeStackNavigationProp<
  MainStackParamList,
  'ProfileEdit'
>;

const RED = '#F63F5F';

const fields = [
  {
    key: 'document',
    label: 'Cedula de identidad*',
    value: '4700888',
    helper: 'No tiene permitido modificar este campo.',
    editable: false,
  },
  { key: 'names', label: 'Nombres*', value: 'Giancarlo' },
  { key: 'surnames', label: 'Apellidos*', value: 'Delgadillo' },
  { key: 'birthDate', label: 'Fecha de Nacimiento*', value: '17/02/1979' },
  { key: 'phone', label: 'Numero de celular*', value: '78610186' },
  { key: 'address', label: 'Direccion de su domicilio*', value: 'Pre Montes 1880' },
  { key: 'bloodType', label: 'Grupo sanguineo', value: 'O+' },
  { key: 'allergies', label: 'Alergias', value: 'Penicilina' },
  { key: 'conditions', label: 'Enfermedades', value: 'Hipertension controlada' },
  { key: 'medicines', label: 'Medicamentos', value: 'Losartan 50 mg' },
  {
    key: 'contactName',
    label: 'Nombre y apellido del contacto*',
    value: 'Marilyn Sudan Huanca',
  },
  {
    key: 'contactPhone',
    label: 'Numero de celular del contacto*',
    value: '79409483',
  },
];

export const ProfileEditScreen = (): ReactElement => {
  const navigation = useNavigation<ProfileEditNavigation>();

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
          <MaterialCommunityIcons name="arrow-left" size={34} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Actualizar datos</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.description}>
          Actualice sus datos personales y clinicos una sola vez para que el
          operador los vea durante una emergencia.
        </Text>

        {fields.map(field => (
          <View key={field.key} style={styles.fieldBlock}>
            <TextInput
              label={field.label}
              mode="outlined"
              value={field.value}
              editable={field.editable !== false}
              style={styles.input}
              contentStyle={styles.inputContent}
              outlineStyle={styles.outline}
              outlineColor="#252525"
              activeOutlineColor="#252525"
              textColor="#343434"
            />
            {field.helper ? (
              <Text style={styles.helperText}>{field.helper}</Text>
            ) : null}
          </View>
        ))}

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.updateButton,
            pressed && styles.updateButtonPressed,
          ]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.updateButtonText}>Actualizar</Text>
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
    height: 84,
    backgroundColor: RED,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 7,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
  },
  backButton: {
    position: 'absolute',
    left: 18,
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '900',
  },
  content: {
    paddingHorizontal: 50,
    paddingTop: 4,
    paddingBottom: 52,
  },
  description: {
    color: '#333333',
    fontSize: 23,
    lineHeight: 30,
    textAlign: 'center',
    marginBottom: 18,
  },
  fieldBlock: {
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    minHeight: 80,
    fontSize: 24,
  },
  inputContent: {
    paddingTop: 12,
    paddingHorizontal: 22,
    fontSize: 24,
  },
  outline: {
    borderRadius: 4,
    borderWidth: 1.4,
  },
  helperText: {
    marginTop: 8,
    color: '#6E6E6E',
    fontSize: 20,
    lineHeight: 25,
  },
  updateButton: {
    marginTop: 18,
    minHeight: 72,
    borderRadius: 4,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  updateButtonPressed: {
    opacity: 0.86,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
