import { type ReactElement, type ReactNode, useState } from 'react';
import { Box, Button, ButtonBase, CircularProgress, IconButton, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CarCrashIcon from '@mui/icons-material/CarCrash';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import RemoveIcon from '@mui/icons-material/Remove';
import SendIcon from '@mui/icons-material/Send';
import ShieldIcon from '@mui/icons-material/Shield';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router';
import { CabeceraFlujo } from '../../components/CabeceraFlujo';
import { EmergencyFlowSteps } from '../../components/EmergencyFlowSteps';
import { conUuid, rutas } from '../../constants/rutas';
import { useEmergencyFlow } from '../../context/EmergencyFlowContext';
import { PageContainer } from '../../layouts/PageContainer';
import { emergencyApi } from '../../services/emergencias/EmergenciasService';
import { spacing } from '../../theme/tokens';

const pasos = ['Que pasa', 'Detalles'];

const tiposEmergencia = [
  { Icono: FavoriteIcon, label: 'Salud', codigo: 'MEDICA' },
  { Icono: CarCrashIcon, label: 'Accidente', codigo: 'ACCIDENTE' },
  { Icono: LocalFireDepartmentIcon, label: 'Incendio', codigo: 'INCENDIO' },
  { Icono: ShieldIcon, label: 'Violencia', codigo: 'SEGURIDAD' },
  { Icono: MoreHorizIcon, label: 'Otro', codigo: 'OTRO' },
] as const;

const preguntasTriage = [
  { key: 'breathing', label: 'La persona respira?', options: ['Si', 'No', 'No se'] },
  { key: 'conscious', label: 'Esta consciente?', options: ['Si', 'No', 'No se'] },
  { key: 'danger', label: 'Hay riesgo en el lugar?', options: ['Si', 'No', 'No se'] },
];

const codigoRespuesta = (valor: string): string => (valor === 'Si' ? 'SI' : valor === 'No' ? 'NO' : 'NO_SE');

/** Opcion seleccionable con borde naranja; activa se rellena. */
const Opcion = ({ activo, onClick, children, minHeight = 52 }: { activo: boolean; onClick: () => void; children: ReactNode; minHeight?: number }) => (
  <ButtonBase
    aria-pressed={activo}
    onClick={onClick}
    sx={{
      flex: 1,
      minHeight,
      px: `${spacing.sm}px`,
      gap: `${spacing.sm}px`,
      borderRadius: '8px',
      border: 2,
      borderColor: 'app.accentText',
      bgcolor: activo ? 'app.accentFill' : 'app.surface',
      color: activo ? 'app.onFill' : 'app.accentText',
      fontWeight: 600,
      fontSize: 16,
    }}
  >
    {children}
  </ButtonBase>
);

const Pregunta = ({ children }: { children: ReactNode }) => (
  <Typography variant="h3" component="h2" sx={{ mb: `${spacing.md}px` }}>
    {children}
  </Typography>
);

const botonPrincipal = {
  mt: `${spacing.xl}px`,
  minHeight: 68,
  borderRadius: '8px',
  bgcolor: 'app.accentFill',
  color: 'app.onFill',
  fontSize: 18,
  gap: 1,
  '&:hover': { bgcolor: 'app.accentFill' },
  '&.Mui-disabled': { bgcolor: 'app.accentFill', color: 'app.onFill', opacity: 0.45 },
} as const;

/**
 * Triaje posterior a la llamada al 168. La emergencia ya se registro con la
 * ubicacion al pulsar el boton; aqui solo se completa lo que la persona pueda
 * contar, en dos pasos y siempre con la opcion de omitirlo.
 */
export const TriajePage = (): ReactElement => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { currentEmergency, estadoRegistro, errorRegistro, registrarAlerta, setCurrentEmergency } = useEmergencyFlow();
  const [paso, setPaso] = useState(1);
  const [tipo, setTipo] = useState<string>('MEDICA');
  const [respuestas, setRespuestas] = useState<Record<string, string>>({ breathing: 'No se', conscious: 'No se', danger: 'No se' });
  const [afectados, setAfectados] = useState(1);
  const [nota, setNota] = useState('');
  const [enviando, setEnviando] = useState(false);

  const registrada = estadoRegistro === 'registrada' && Boolean(currentEmergency);

  const irASeguimiento = (): void => {
    if (registrada) {
      navigate(conUuid(rutas.seguimiento, currentEmergency?.uuid), { replace: true });
      return;
    }
    navigate(rutas.inicio);
  };

  const volver = (): void => {
    if (paso === 2) {
      setPaso(1);
      return;
    }
    navigate(-1);
  };

  const enviar = async (): Promise<void> => {
    if (!currentEmergency) return;
    setEnviando(true);
    try {
      const actualizada = await emergencyApi.completeTriage(currentEmergency.uuid, {
        typeCode: tipo,
        triage: Object.fromEntries(Object.entries(respuestas).map(([clave, valor]) => [clave, codigoRespuesta(valor)])),
        affected: afectados,
        description: nota.trim() || undefined,
      });
      setCurrentEmergency(actualizada);
      navigate(conUuid(rutas.seguimiento, actualizada.uuid), { replace: true });
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'No se pudieron enviar los datos. Intente nuevamente.', { variant: 'error' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <PageContainer>
      <CabeceraFlujo titulo="Completar datos" onVolver={volver} accion={{ etiqueta: 'Omitir', ariaLabel: 'Omitir triaje', onClick: irASeguimiento }} />
      <Box sx={{ px: `${spacing.xl}px`, pt: `${spacing.xl}px` }}>
        <EmergencyFlowSteps activeStep={paso} labels={pasos} />

        <Box role="status" sx={{ mb: `${spacing.xl}px`, display: 'flex', alignItems: 'center', gap: `${spacing.sm}px` }}>
          {estadoRegistro === 'registrando' || estadoRegistro === 'sin_iniciar' ? (
            <>
              <CircularProgress size={20} sx={{ color: 'app.accentText' }} />
              <Typography sx={{ fontWeight: 600 }}>Enviando tu ubicacion a la central...</Typography>
            </>
          ) : null}
          {registrada ? (
            <>
              <CheckCircleIcon sx={{ color: 'success.main' }} />
              <Typography sx={{ fontWeight: 600 }}>Alerta registrada: {currentEmergency?.codigo_publico}</Typography>
            </>
          ) : null}
          {estadoRegistro === 'fallida' ? (
            <Box>
              <Typography sx={{ fontWeight: 600 }}>
                {errorRegistro ?? 'No se pudo registrar la alerta.'} Tu llamada al 168 sigue siendo valida.
              </Typography>
              <Button variant="outlined" onClick={() => void registrarAlerta()} sx={{ mt: 1, color: 'app.accentText', borderColor: 'app.accentText', borderWidth: 2 }}>
                Reintentar
              </Button>
            </Box>
          ) : null}
        </Box>

        {paso === 1 ? (
          <>
            <Pregunta>Que tipo de emergencia es?</Pregunta>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${spacing.sm}px` }}>
              {tiposEmergencia.map(({ Icono, label, codigo }) => (
                <Opcion key={codigo} activo={tipo === codigo} onClick={() => setTipo(codigo)} minHeight={56}>
                  <Icono />
                  {label}
                </Opcion>
              ))}
            </Box>

            {preguntasTriage.map((pregunta) => (
              <Box key={pregunta.key} sx={{ mt: `${spacing.xl}px` }}>
                <Pregunta>{pregunta.label}</Pregunta>
                <Box sx={{ display: 'flex', gap: `${spacing.sm}px` }}>
                  {pregunta.options.map((opcion) => (
                    <Opcion
                      key={opcion}
                      activo={respuestas[pregunta.key] === opcion}
                      onClick={() => setRespuestas((actuales) => ({ ...actuales, [pregunta.key]: opcion }))}
                    >
                      {opcion}
                    </Opcion>
                  ))}
                </Box>
              </Box>
            ))}

            <Button fullWidth onClick={() => setPaso(2)} sx={botonPrincipal}>
              Siguiente
              <ArrowForwardIcon />
            </Button>
          </>
        ) : (
          <>
            <Pregunta>Cuantas personas necesitan ayuda?</Pregunta>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: `${spacing.xl}px` }}>
              <IconButton
                aria-label="Menos personas"
                disabled={afectados <= 1}
                onClick={() => setAfectados((v) => Math.max(1, v - 1))}
                sx={{ width: 56, height: 56, border: 2, borderColor: 'app.accentText', color: 'app.accentText', '&.Mui-disabled': { opacity: 0.45 } }}
              >
                <RemoveIcon sx={{ fontSize: 28 }} />
              </IconButton>
              <Typography variant="h1" component="output" aria-live="polite">
                {afectados}
              </Typography>
              <IconButton
                aria-label="Mas personas"
                onClick={() => setAfectados((v) => Math.min(999, v + 1))}
                sx={{ width: 56, height: 56, border: 2, borderColor: 'app.accentText', color: 'app.accentText' }}
              >
                <AddIcon sx={{ fontSize: 28 }} />
              </IconButton>
            </Box>

            <Box sx={{ mt: `${spacing.xl}px` }}>
              <Pregunta>Algo mas que deba saber la central?</Pregunta>
              <TextField
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Opcional: que paso, referencias del lugar..."
                multiline
                minRows={4}
                slotProps={{ htmlInput: { maxLength: 500 } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' }, '& fieldset': { borderColor: 'app.accentText', borderWidth: 2 } }}
              />
            </Box>

            <Button fullWidth disabled={!registrada || enviando} onClick={() => void enviar()} sx={botonPrincipal}>
              {enviando ? (
                <CircularProgress size={24} sx={{ color: 'app.onFill' }} />
              ) : (
                <>
                  <SendIcon />
                  Enviar a la central
                </>
              )}
            </Button>
          </>
        )}
      </Box>
    </PageContainer>
  );
};
