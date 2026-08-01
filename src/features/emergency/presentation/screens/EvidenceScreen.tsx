import React, { ReactElement, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { MainStackParamList } from '../../../../app/navigation/types';

type EvidenceNavigation = NativeStackNavigationProp<MainStackParamList, 'Evidence'>;

const RED = '#F63F5F';

const evidenceActions = [
  { icon: 'camera', label: 'Tomar foto' },
  { icon: 'microphone', label: 'Grabar audio 10 seg' },
  { icon: 'note-text', label: 'Escribir nota' },
] as const;

export const EvidenceScreen = (): ReactElement => {
  const navigation = useNavigation<EvidenceNavigation>();
  const [note, setNote] = useState(
    'Paciente con dolor fuerte en el pecho. Estoy junto a la puerta principal.',
  );

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
        <Text style={styles.headerTitle}>Evidencia opcional</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Agregar informacion</Text>
        <Text style={styles.subtitle}>
          Esto no frena la emergencia. Solo suma datos para el operador.
        </Text>

        {evidenceActions.map(action => (
          <Pressable
            key={action.label}
            accessibilityRole="button"
            style={styles.actionButton}
          >
            <MaterialCommunityIcons name={action.icon} size={30} color={RED} />
            <Text style={styles.actionText}>{action.label}</Text>
          </Pressable>
        ))}

        <TextInput
          label="Nota"
          mode="outlined"
          value={note}
          multiline
          numberOfLines={5}
          onChangeText={setNote}
          style={styles.noteInput}
          contentStyle={styles.noteContent}
          outlineColor="#D0D0D0"
          activeOutlineColor={RED}
        />

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}
          onPress={() => navigation.navigate('CaseTracking')}
        >
          <Text style={styles.sendText}>Enviar al operador</Text>
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
  },
  title: {
    color: '#303030',
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    marginBottom: 22,
    color: '#666666',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  actionButton: {
    minHeight: 66,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    color: '#303030',
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
  },
  noteInput: {
    marginTop: 22,
    minHeight: 138,
    backgroundColor: '#FFFFFF',
  },
  noteContent: {
    fontSize: 17,
    lineHeight: 23,
  },
  sendButton: {
    marginTop: 24,
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
  sendText: {
    color: '#FFFFFF',
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '900',
  },
});
