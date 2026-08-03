import React, { ReactElement, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuth } from '../../../../app/providers/AuthProvider';
import { BrandStrip } from '../../../emergency/presentation/components/BrandStrip';

const BLUE = '#1F72F2';
const TEXT = '#2E2E2E';

type RegistrationData = {
  names: string;
  surnames: string;
  document: string;
  complement: string;
  birthDate: string;
  phone: string;
  address: string;
  contactName: string;
  contactPhone: string;
  email: string;
  password: string;
};

const initialData: RegistrationData = {
  names: '',
  surnames: '',
  document: '',
  complement: '',
  birthDate: '',
  phone: '',
  address: '',
  contactName: '',
  contactPhone: '',
  email: '',
  password: '',
};

export const RegisterScreen = (): ReactElement => {
  const { signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [form, setForm] = useState<RegistrationData>(initialData);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const description = useMemo(
    () =>
      step === 3
        ? 'Proporcione datos de una persona de contacto para llamarlo en caso de emergencias.'
        : 'Llene el formulario de registro con sus datos personales para comunicarnos con usted en caso de emergencia.',
    [step],
  );

  const setField = (key: keyof RegistrationData, value: string): void => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const validateStep = (): boolean => {
    if (step === 1) {
      return Boolean(form.names && form.surnames && form.document);
    }

    if (step === 2) {
      return Boolean(
        form.birthDate &&
          form.phone &&
          form.address &&
          form.email &&
          form.password.length >= 8,
      );
    }

    return Boolean(form.contactName && form.contactPhone && acceptedTerms);
  };

  const onNext = async (): Promise<void> => {
    if (!validateStep()) {
      Alert.alert('Datos requeridos', 'Complete los campos obligatorios para continuar.');
      return;
    }

    if (step < 3) {
      setStep(current => current + 1);
      return;
    }

    setLoading(true);
    try {
      await signUp({ ...form, acceptedTerms });
    } catch (error) {
      Alert.alert(
        'No se pudo completar el registro',
        error instanceof Error ? error.message : 'Intente nuevamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  const onSetBirthDate = (): void => {
    setField('birthDate', '2005-12-31');
    setDatePickerVisible(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FF" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <BrandStrip />

          <Text style={styles.title}>Registro unico.</Text>
          <View style={styles.steps}>
            {[1, 2, 3].map(item => (
              <React.Fragment key={item}>
                <View style={[styles.stepCircle, item <= step && styles.stepCircleActive]}>
                  <Text style={[styles.stepText, item <= step && styles.stepTextActive]}>
                    {item}
                  </Text>
                </View>
                {item < 3 && <View style={styles.stepLine} />}
              </React.Fragment>
            ))}
          </View>

          <Text style={styles.description}>{description}</Text>

          {step === 1 && (
            <>
              <TextInput
                label="Nombres*"
                mode="outlined"
                value={form.names}
                onChangeText={value => setField('names', value)}
                style={styles.input}
                outlineColor="#222222"
                activeOutlineColor={BLUE}
              />
              <TextInput
                label="Apellidos*"
                mode="outlined"
                value={form.surnames}
                onChangeText={value => setField('surnames', value)}
                style={styles.input}
                outlineColor="#222222"
                activeOutlineColor={BLUE}
              />
              <View style={styles.inlineFields}>
                <TextInput
                  label="Cedula de identidad*"
                  mode="outlined"
                  value={form.document}
                  onChangeText={value => setField('document', value)}
                  keyboardType="numeric"
                  style={[styles.input, styles.inlineInputWide]}
                  outlineColor="#222222"
                  activeOutlineColor={BLUE}
                />
                <TextInput
                  label="Complemento"
                  mode="outlined"
                  value={form.complement}
                  onChangeText={value => setField('complement', value)}
                  style={[styles.input, styles.inlineInput]}
                  outlineColor="#222222"
                  activeOutlineColor={BLUE}
                />
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fecha de Nacimiento"
                onPress={() => setDatePickerVisible(true)}
              >
                <View pointerEvents="none">
                  <TextInput
                    label="Fecha de Nacimiento*"
                    mode="outlined"
                    value={form.birthDate}
                    placeholder="AAAA-MM-DD"
                    style={styles.input}
                    outlineColor="#222222"
                    activeOutlineColor={BLUE}
                    right={<TextInput.Icon icon="calendar" />}
                  />
                </View>
              </Pressable>
              <TextInput
                label="Numero de celular*"
                mode="outlined"
                value={form.phone}
                onChangeText={value => setField('phone', value)}
                keyboardType="phone-pad"
                style={styles.input}
                outlineColor="#222222"
                activeOutlineColor={BLUE}
              />
              <TextInput
                label="Direccion de su domicilio*"
                mode="outlined"
                value={form.address}
                onChangeText={value => setField('address', value)}
                style={styles.input}
                outlineColor="#222222"
                activeOutlineColor={BLUE}
              />
              <TextInput
                label="Correo electronico*"
                mode="outlined"
                value={form.email}
                onChangeText={value => setField('email', value)}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                outlineColor="#222222"
                activeOutlineColor={BLUE}
              />
              <TextInput
                label="Contrasena (minimo 8 caracteres)*"
                mode="outlined"
                value={form.password}
                onChangeText={value => setField('password', value)}
                secureTextEntry
                style={styles.input}
                outlineColor="#222222"
                activeOutlineColor={BLUE}
              />
            </>
          )}

          {step === 3 && (
            <>
              <TextInput
                label="Nombre y apellido del contacto*"
                mode="outlined"
                value={form.contactName}
                onChangeText={value => setField('contactName', value)}
                style={styles.input}
                outlineColor="#222222"
                activeOutlineColor={BLUE}
              />
              <TextInput
                label="Numero de celular del contacto*"
                mode="outlined"
                value={form.contactPhone}
                onChangeText={value => setField('contactPhone', value)}
                keyboardType="phone-pad"
                style={styles.input}
                outlineColor="#222222"
                activeOutlineColor={BLUE}
              />
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: acceptedTerms }}
                style={styles.termsRow}
                onPress={() => setAcceptedTerms(current => !current)}
              >
                <MaterialCommunityIcons
                  name={acceptedTerms ? 'checkbox-marked' : 'checkbox-blank'}
                  size={30}
                  color={acceptedTerms ? BLUE : '#444444'}
                />
                <Text style={styles.termsText}>
                  He leido y acepto los{' '}
                  <Text style={styles.termsLink}>terminos y condiciones.</Text>
                </Text>
              </Pressable>
            </>
          )}

          <Pressable
            accessibilityRole="button"
            disabled={loading}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
            onPress={onNext}
          >
            <Text style={styles.primaryButtonText}>
              {step === 3 ? 'REGISTRARSE' : 'SIGUIENTE'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      <Modal
        transparent
        visible={datePickerVisible}
        animationType="fade"
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dateDialog}>
            <View style={styles.dateHeader}>
              <Text style={styles.dateYear}>2005</Text>
              <Text style={styles.dateTitle}>Sáb, 31 dic</Text>
            </View>
            <View style={styles.calendarBody}>
              <View style={styles.calendarMonthRow}>
                <Pressable
                  accessibilityRole="button"
                  style={styles.calendarArrow}
                  onPress={() => undefined}
                >
                  <MaterialCommunityIcons name="chevron-left" size={34} color="#222222" />
                </Pressable>
                <Text style={styles.calendarMonth}>Diciembre de 2005</Text>
              </View>
              <View style={styles.weekRow}>
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                  <Text key={`${day}-${index}`} style={styles.weekDay}>
                    {day}
                  </Text>
                ))}
              </View>
              <View style={styles.daysGrid}>
                {Array.from({ length: 34 }).map((_, index) => {
                  const day = index < 3 ? '' : String(index - 2);
                  const isSelected = day === '31';

                  return (
                    <Pressable
                      key={`${index}-${day}`}
                      style={[styles.dayCell, isSelected && styles.daySelected]}
                      onPress={() => day && setField('birthDate', `2005-12-${day.padStart(2, '0')}`)}
                    >
                      <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                        {day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.dateActions}>
                <Pressable style={styles.dateAction} onPress={onSetBirthDate}>
                  <Text style={styles.dateActionText}>ESTABLECER</Text>
                </Pressable>
                <Pressable
                  style={styles.dateAction}
                  onPress={() => setDatePickerVisible(false)}
                >
                  <Text style={styles.dateActionText}>CANCELAR</Text>
                </Pressable>
                <Pressable
                  style={styles.dateAction}
                  onPress={() => {
                    setField('birthDate', '');
                    setDatePickerVisible(false);
                  }}
                >
                  <Text style={styles.dateActionText}>BORRAR</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#2F77F2',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 56,
    backgroundColor: '#2F77F2',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 26,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 7,
  },
  title: {
    marginTop: 28,
    color: BLUE,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    textAlign: 'center',
  },
  steps: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#202020',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: BLUE,
  },
  stepText: {
    color: '#222222',
    fontSize: 24,
    fontWeight: '800',
  },
  stepTextActive: {
    color: '#FFFFFF',
  },
  stepLine: {
    width: 72,
    height: 3,
    marginHorizontal: 16,
    backgroundColor: '#222222',
  },
  description: {
    marginTop: 24,
    marginBottom: 12,
    color: TEXT,
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
  },
  input: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    minHeight: 64,
    fontSize: 16,
  },
  inlineFields: {
    flexDirection: 'row',
    gap: 12,
  },
  inlineInputWide: {
    flex: 1.35,
  },
  inlineInput: {
    flex: 1,
  },
  termsRow: {
    marginTop: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  termsText: {
    flex: 1,
    color: TEXT,
    fontSize: 20,
    lineHeight: 25,
  },
  termsLink: {
    color: '#236FBC',
    textDecorationLine: 'underline',
  },
  primaryButton: {
    marginTop: 14,
    minHeight: 64,
    borderRadius: 4,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryButtonPressed: {
    opacity: 0.82,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 21,
    lineHeight: 25,
    fontWeight: '800',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  dateDialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    overflow: 'hidden',
    elevation: 12,
  },
  dateHeader: {
    backgroundColor: '#00917E',
    paddingHorizontal: 26,
    paddingTop: 24,
    paddingBottom: 28,
  },
  dateYear: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 20,
    lineHeight: 25,
  },
  dateTitle: {
    marginTop: 4,
    color: '#FFFFFF',
    fontSize: 38,
    lineHeight: 46,
    fontWeight: '400',
  },
  calendarBody: {
    paddingHorizontal: 26,
    paddingTop: 26,
    paddingBottom: 24,
  },
  calendarMonthRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarArrow: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarMonth: {
    flex: 1,
    color: '#222222',
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
  },
  weekRow: {
    marginTop: 34,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDay: {
    width: 38,
    color: '#707070',
    fontSize: 18,
    lineHeight: 23,
    textAlign: 'center',
  },
  daysGrid: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.285%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: {
    borderRadius: 24,
    backgroundColor: '#00917E',
  },
  dayText: {
    color: '#2F2F2F',
    fontSize: 18,
    lineHeight: 22,
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  dateActions: {
    marginTop: 34,
    alignItems: 'flex-end',
    gap: 18,
  },
  dateAction: {
    minHeight: 42,
    justifyContent: 'center',
  },
  dateActionText: {
    color: '#008779',
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '700',
  },
});
