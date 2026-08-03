import React, { ReactElement, useEffect, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { MainStackParamList } from '../../../../app/navigation/types';
import { emergencyApi } from '../../data/EmergencyApi';

type ProfileEditNavigation = NativeStackNavigationProp<
  MainStackParamList,
  'ProfileEdit'
>;

type FormState = {
  document: string;
  names: string;
  surnames: string;
  birthDate: string;
  phone: string;
  address: string;
  bloodType: string;
  allergies: string;
  conditions: string;
  medicines: string;
  contactName: string;
  contactPhone: string;
};

const initialForm: FormState = {
  document: '',
  names: '',
  surnames: '',
  birthDate: '',
  phone: '',
  address: '',
  bloodType: '',
  allergies: '',
  conditions: '',
  medicines: '',
  contactName: '',
  contactPhone: '',
};

const RED = '#F63F5F';

export const ProfileEditScreen = (): ReactElement => {
  const navigation = useNavigation<ProfileEditNavigation>();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['emergency-profile'], queryFn: emergencyApi.getProfile });
  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!query.data) return;
    const contact = query.data.contacts[0];
    // El formulario solo puede inicializarse cuando finaliza la consulta remota.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      document: query.data.profile.cedula_identidad,
      names: query.data.profile.nombres,
      surnames: query.data.profile.apellidos,
      birthDate: query.data.profile.fecha_nacimiento,
      phone: query.data.phone || '',
      address: query.data.profile.direccion || '',
      bloodType: query.data.profile.tipo_sangre || '',
      allergies: query.data.profile.alergias || '',
      conditions: query.data.profile.enfermedades_cronicas || '',
      medicines: query.data.profile.medicamentos_actuales || '',
      contactName: contact?.nombre_completo || '',
      contactPhone: contact?.telefono || '',
    });
  }, [query.data]);

  const setField = (field: keyof FormState, value: string): void =>
    setForm(current => ({ ...current, [field]: value }));

  const save = async (): Promise<void> => {
    if (!form.names || !form.surnames || !form.phone || !form.address) {
      Alert.alert('Datos incompletos', 'Complete nombres, apellidos, telefono y direccion.');
      return;
    }
    setSaving(true);
    try {
      await emergencyApi.updateProfile({
        nombres: form.names,
        apellidos: form.surnames,
        fecha_nacimiento: form.birthDate,
        phone: form.phone,
        direccion: form.address,
        tipo_sangre: form.bloodType,
        alergias: form.allergies,
        enfermedades_cronicas: form.conditions,
        medicamentos_actuales: form.medicines,
        contact: { name: form.contactName, phone: form.contactPhone },
      });
      await queryClient.invalidateQueries({ queryKey: ['emergency-profile'] });
      Alert.alert('Perfil actualizado', 'Los datos fueron guardados correctamente.');
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'No se pudo actualizar',
        error instanceof Error ? error.message : 'Intente nuevamente.',
      );
    } finally {
      setSaving(false);
    }
  };

  const fields: {
    key: keyof FormState;
    label: string;
    editable?: boolean;
    keyboardType?: 'default' | 'phone-pad';
  }[] = [
    { key: 'document', label: 'Cedula de identidad', editable: false },
    { key: 'names', label: 'Nombres*' },
    { key: 'surnames', label: 'Apellidos*' },
    { key: 'birthDate', label: 'Fecha de nacimiento (AAAA-MM-DD)*' },
    { key: 'phone', label: 'Numero de celular*', keyboardType: 'phone-pad' },
    { key: 'address', label: 'Direccion de domicilio*' },
    { key: 'bloodType', label: 'Grupo sanguineo' },
    { key: 'allergies', label: 'Alergias' },
    { key: 'conditions', label: 'Enfermedades' },
    { key: 'medicines', label: 'Medicamentos' },
    { key: 'contactName', label: 'Nombre del contacto*' },
    { key: 'contactPhone', label: 'Telefono del contacto*', keyboardType: 'phone-pad' },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={RED} />
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={32} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Actualizar datos</Text>
      </View>
      {query.isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color={RED} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.description}>
            Mantenga actualizados los datos que vera el operador durante una emergencia.
          </Text>
          {fields.map(field => (
            <TextInput
              key={field.key}
              label={field.label}
              mode="outlined"
              value={form[field.key]}
              editable={field.editable !== false}
              keyboardType={field.keyboardType}
              onChangeText={value => setField(field.key, value)}
              style={styles.input}
              outlineColor="#BDBDBD"
              activeOutlineColor={RED}
            />
          ))}
          <Pressable disabled={saving} style={styles.updateButton} onPress={save}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.updateButtonText}>ACTUALIZAR</Text>
            )}
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    height: 72,
    backgroundColor: RED,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 7,
  },
  backButton: {
    position: 'absolute',
    left: 18,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 24, lineHeight: 30, fontWeight: '900' },
  loader: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 44 },
  description: {
    color: '#444444',
    fontSize: 17,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 12,
  },
  input: { marginTop: 12, backgroundColor: '#FFFFFF' },
  updateButton: {
    marginTop: 24,
    minHeight: 64,
    borderRadius: 8,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
});
