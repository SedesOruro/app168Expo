import { type ChangeEvent, type ReactElement, type ReactNode, useEffect, useRef, useState } from 'react';
import { Box, Button, ButtonBase, CircularProgress, TextField, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import { useSnackbar } from 'notistack';
import { useNavigate, useParams } from 'react-router';
import { CabeceraFlujo } from '../../components/CabeceraFlujo';
import { conUuid, rutas } from '../../constants/rutas';
import { useEmergencyFlow } from '../../context/EmergencyFlowContext';
import { extensionAudio, useGrabadorAudio } from '../../hooks/useGrabadorAudio';
import { PageContainer } from '../../layouts/PageContainer';
import { emergencyApi } from '../../services/emergencias/EmergenciasService';
import { spacing } from '../../theme/tokens';
import { comprimirImagen } from '../../utils/comprimirImagen';

/** Duracion maxima de un audio, igual que en el APK. */
const MAX_AUDIO_MS = 10_000;

const Accion = ({ icono, texto, onClick, disabled }: { icono: ReactNode; texto: string; onClick: () => void; disabled?: boolean }) => (
  <ButtonBase
    onClick={onClick}
    disabled={disabled}
    sx={{
      width: '100%',
      minHeight: 72,
      mt: `${spacing.md}px`,
      px: `${spacing.lg}px`,
      gap: `${spacing.md}px`,
      justifyContent: 'flex-start',
      borderRadius: '8px',
      border: 2,
      borderColor: 'app.accentText',
      bgcolor: 'app.surface',
      color: 'app.accentText',
      '&.Mui-disabled': { opacity: 0.45 },
    }}
  >
    {icono}
    <Typography sx={{ fontWeight: 600, color: 'text.primary', textAlign: 'left' }}>{texto}</Typography>
  </ButtonBase>
);

export const EvidenciasPage = (): ReactElement => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { uuid } = useParams();
  const { currentEmergency } = useEmergencyFlow();
  const emergencyUuid = uuid ?? currentEmergency?.uuid;
  const [note, setNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const inputFotoRef = useRef<HTMLInputElement>(null);
  const grabador = useGrabadorAudio();
  const deteniendoRef = useRef(false);
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (temporizadorRef.current) clearTimeout(temporizadorRef.current);
    },
    [],
  );

  const requireEmergency = (): string => {
    if (!emergencyUuid) throw new Error('No existe una emergencia activa.');
    return emergencyUuid;
  };

  const exito = (msg: string) => enqueueSnackbar(msg, { variant: 'success' });
  const fallo = (titulo: string, error: unknown) =>
    enqueueSnackbar(`${titulo}: ${error instanceof Error ? error.message : 'Intente nuevamente.'}`, { variant: 'error' });

  /** La camara se abre con un input de archivo con `capture` (equivalente a expo-image-picker). */
  const onFotoElegida = async (evento: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const archivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!archivo) return;
    setUploading(true);
    try {
      const { blob, mimeType } = await comprimirImagen(archivo);
      const upload = await emergencyApi.uploadFile(blob, `evidencia-${Date.now()}.jpg`, mimeType);
      await emergencyApi.addEvidence(requireEmergency(), { type: 'FOTO', fileUrl: upload.file, mimeType: upload.mimeType });
      exito('Fotografia enviada. La evidencia ya esta disponible para el operador.');
    } catch (error) {
      fallo('No se pudo enviar la fotografia', error);
    } finally {
      setUploading(false);
    }
  };

  const stopAndSendAudio = async (): Promise<void> => {
    if (deteniendoRef.current) return;
    deteniendoRef.current = true;
    if (temporizadorRef.current) clearTimeout(temporizadorRef.current);
    try {
      const audio = await grabador.detener();
      setUploading(true);
      const upload = await emergencyApi.uploadFile(audio.blob, `evidencia-${Date.now()}.${extensionAudio(audio.mimeType)}`, audio.mimeType);
      await emergencyApi.addEvidence(requireEmergency(), {
        type: 'AUDIO',
        fileUrl: upload.file,
        mimeType: upload.mimeType,
        durationSeconds: Math.max(1, Math.round(audio.duracionMs / 1000)),
      });
      exito('Audio enviado. La grabacion ya esta disponible para el operador.');
    } catch (error) {
      fallo('No se pudo enviar el audio', error);
    } finally {
      setUploading(false);
      deteniendoRef.current = false;
    }
  };

  const toggleRecording = async (): Promise<void> => {
    if (grabador.grabando) {
      await stopAndSendAudio();
      return;
    }
    try {
      requireEmergency();
      await grabador.iniciar();
      temporizadorRef.current = setTimeout(() => {
        stopAndSendAudio().catch(() => undefined);
      }, MAX_AUDIO_MS);
    } catch (error) {
      fallo('No se pudo iniciar la grabacion', error);
    }
  };

  const sendNote = async (): Promise<void> => {
    if (!note.trim()) {
      enqueueSnackbar('Nota vacia. Escriba informacion antes de enviarla.', { variant: 'warning' });
      return;
    }
    setUploading(true);
    try {
      await emergencyApi.addEvidence(requireEmergency(), { type: 'NOTA', content: note.trim() });
      setNote('');
      exito('Nota enviada. La informacion ya esta disponible para el operador.');
      navigate(conUuid(rutas.seguimiento, emergencyUuid));
    } catch (error) {
      fallo('No se pudo enviar la nota', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <PageContainer>
      <CabeceraFlujo titulo="Evidencia opcional" onVolver={() => navigate(-1)} />
      <Box sx={{ px: `${spacing.xl}px`, pt: `${spacing.xl}px` }}>
        <Typography variant="h2" component="h2">
          Agregar informacion
        </Typography>
        <Typography color="text.secondary" sx={{ mt: `${spacing.xs}px` }}>
          Esto no frena la emergencia. Solo suma datos para el operador.
        </Typography>

        <input ref={inputFotoRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => void onFotoElegida(e)} />
        <Accion
          icono={<PhotoCameraIcon sx={{ fontSize: 30 }} />}
          texto="Tomar y enviar fotografia"
          disabled={uploading || grabador.grabando}
          onClick={() => inputFotoRef.current?.click()}
        />
        <Accion
          icono={grabador.grabando ? <StopCircleIcon sx={{ fontSize: 30 }} /> : <MicIcon sx={{ fontSize: 30 }} />}
          texto={grabador.grabando ? `Detener y enviar (${Math.round(grabador.duracionMs / 1000)} s)` : 'Grabar audio de hasta 10 segundos'}
          disabled={uploading}
          onClick={() => void toggleRecording()}
        />

        <TextField
          label="Nota"
          value={note}
          multiline
          minRows={5}
          onChange={(e) => setNote(e.target.value)}
          sx={{ mt: `${spacing.lg}px`, '& .Mui-focused fieldset': { borderColor: 'app.accentText' }, '& label.Mui-focused': { color: 'app.accentText' } }}
        />

        <Button
          fullWidth
          disabled={uploading}
          onClick={() => void sendNote()}
          sx={{
            mt: `${spacing.lg}px`,
            minHeight: 60,
            borderRadius: '8px',
            bgcolor: 'app.accentFill',
            color: 'app.onFill',
            fontSize: 18,
            '&:hover': { bgcolor: 'app.accentFill' },
            '&.Mui-disabled': { bgcolor: 'app.accentFill', color: 'app.onFill', opacity: 0.6 },
          }}
        >
          {uploading ? <CircularProgress size={24} sx={{ color: 'app.onFill' }} /> : 'Enviar nota al operador'}
        </Button>
      </Box>
    </PageContainer>
  );
};
