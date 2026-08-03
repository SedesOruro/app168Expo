import React, { ReactElement, useEffect, useRef, useState } from 'react';
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
import { TextInput } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

import type { MainStackParamList } from '../../../../app/navigation/types';
import { emergencyApi } from '../../data/EmergencyApi';
import { useEmergencyFlow } from '../providers/EmergencyFlowProvider';

type EvidenceNavigation = NativeStackNavigationProp<MainStackParamList, 'Evidence'>;
type EvidenceRoute = RouteProp<MainStackParamList, 'Evidence'>;

const RED = '#F63F5F';

export const EvidenceScreen = (): ReactElement => {
  const navigation = useNavigation<EvidenceNavigation>();
  const route = useRoute<EvidenceRoute>();
  const { currentEmergency } = useEmergencyFlow();
  const emergencyUuid = route.params?.emergencyUuid ?? currentEmergency?.uuid;
  const [note, setNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppingRef = useRef(false);
  const durationRef = useRef(0);

  useEffect(() => {
    durationRef.current = recorderState.durationMillis;
  }, [recorderState.durationMillis]);

  const requireEmergency = (): string => {
    if (!emergencyUuid) throw new Error('No existe una emergencia activa.');
    return emergencyUuid;
  };

  const takePhoto = async (): Promise<void> => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) throw new Error('Debe permitir el acceso a la camara.');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.75,
      });
      if (result.canceled || !result.assets[0]) return;
      setUploading(true);
      const asset = result.assets[0];
      const upload = await emergencyApi.uploadFile(
        asset.uri,
        asset.fileName || `evidencia-${Date.now()}.jpg`,
        asset.mimeType || 'image/jpeg',
      );
      await emergencyApi.addEvidence(requireEmergency(), {
        type: 'FOTO',
        fileUrl: upload.file,
        mimeType: upload.mimeType,
      });
      Alert.alert('Fotografia enviada', 'La evidencia ya esta disponible para el operador.');
    } catch (error) {
      Alert.alert(
        'No se pudo enviar la fotografia',
        error instanceof Error ? error.message : 'Intente nuevamente.',
      );
    } finally {
      setUploading(false);
    }
  };

  const stopAndSendAudio = async (): Promise<void> => {
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    const durationSeconds = Math.max(1, Math.round(durationRef.current / 1000));
    try {
      await recorder.stop();
      if (!recorder.uri) throw new Error('No se genero el archivo de audio.');
      setUploading(true);
      const upload = await emergencyApi.uploadFile(
        recorder.uri,
        `evidencia-${Date.now()}.m4a`,
        'audio/mp4',
      );
      await emergencyApi.addEvidence(requireEmergency(), {
        type: 'AUDIO',
        fileUrl: upload.file,
        mimeType: upload.mimeType,
        durationSeconds,
      });
      Alert.alert('Audio enviado', 'La grabacion ya esta disponible para el operador.');
    } catch (error) {
      Alert.alert(
        'No se pudo enviar el audio',
        error instanceof Error ? error.message : 'Intente nuevamente.',
      );
    } finally {
      setUploading(false);
      stoppingRef.current = false;
      await setAudioModeAsync({ allowsRecording: false }).catch(() => undefined);
    }
  };

  const toggleRecording = async (): Promise<void> => {
    if (recorderState.isRecording) {
      await stopAndSendAudio();
      return;
    }
    try {
      requireEmergency();
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) throw new Error('Debe permitir el uso del microfono.');
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      timerRef.current = setTimeout(() => {
        stopAndSendAudio().catch(() => undefined);
      }, 10_000);
    } catch (error) {
      Alert.alert(
        'No se pudo iniciar la grabacion',
        error instanceof Error ? error.message : 'Intente nuevamente.',
      );
    }
  };

  const sendNote = async (): Promise<void> => {
    if (!note.trim()) {
      Alert.alert('Nota vacia', 'Escriba informacion antes de enviarla.');
      return;
    }
    setUploading(true);
    try {
      await emergencyApi.addEvidence(requireEmergency(), {
        type: 'NOTA',
        content: note.trim(),
      });
      setNote('');
      Alert.alert('Nota enviada', 'La informacion ya esta disponible para el operador.');
      navigation.navigate('CaseTracking', { emergencyUuid });
    } catch (error) {
      Alert.alert(
        'No se pudo enviar la nota',
        error instanceof Error ? error.message : 'Intente nuevamente.',
      );
    } finally {
      setUploading(false);
    }
  };

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

        <Pressable
          accessibilityRole="button"
          disabled={uploading || recorderState.isRecording}
          style={styles.actionButton}
          onPress={takePhoto}
        >
          <MaterialCommunityIcons name="camera" size={30} color={RED} />
          <Text style={styles.actionText}>Tomar y enviar fotografia</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={uploading}
          style={styles.actionButton}
          onPress={toggleRecording}
        >
          <MaterialCommunityIcons
            name={recorderState.isRecording ? 'stop-circle' : 'microphone'}
            size={30}
            color={RED}
          />
          <Text style={styles.actionText}>
            {recorderState.isRecording
              ? `Detener y enviar (${Math.round(recorderState.durationMillis / 1000)} s)`
              : 'Grabar audio de hasta 10 segundos'}
          </Text>
        </Pressable>

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
          disabled={uploading}
          style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}
          onPress={sendNote}
        >
          {uploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.sendText}>Enviar nota al operador</Text>
          )}
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
