import { type FormEvent, type ReactElement, useState } from 'react';
import { Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router';
import { CabeceraFlujo } from '../../components/CabeceraFlujo';
import { PageContainer } from '../../layouts/PageContainer';
import { emergencyApi } from '../../services/emergencias/EmergenciasService';
import { spacing } from '../../theme/tokens';

const MINIMO = 8;

export const CambiarContrasenaPage = (): ReactElement => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [guardando, setGuardando] = useState(false);

  const corta = nueva.length > 0 && nueva.length < MINIMO;
  const distinta = confirmacion.length > 0 && confirmacion !== nueva;
  const listo = Boolean(actual) && nueva.length >= MINIMO && confirmacion === nueva;

  const guardar = async (evento: FormEvent): Promise<void> => {
    evento.preventDefault();
    if (!listo) return;
    setGuardando(true);
    try {
      await emergencyApi.changePassword({ currentPassword: actual, newPassword: nueva });
      enqueueSnackbar('Contrasena actualizada. Usa la nueva contrasena la proxima vez que ingreses.', { variant: 'success' });
      navigate(-1);
    } catch (error) {
      enqueueSnackbar(`No se pudo cambiar la contrasena: ${error instanceof Error ? error.message : 'Intente nuevamente.'}`, { variant: 'error' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <PageContainer>
      <CabeceraFlujo titulo="Cambiar contrasena" onVolver={() => navigate(-1)} />
      <Stack component="form" onSubmit={(e) => void guardar(e)} spacing={`${spacing.md}px`} sx={{ px: `${spacing.xl}px`, pt: `${spacing.xl}px` }}>
        <Typography color="text.secondary">Si la Central restablecio tu contrasena, la actual es tu numero de cedula.</Typography>
        <TextField label="Contrasena actual" type="password" autoComplete="current-password" value={actual} onChange={(e) => setActual(e.target.value)} />
        <TextField
          label={`Nueva contrasena (minimo ${MINIMO} caracteres)`}
          type="password"
          autoComplete="new-password"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          error={corta}
          helperText={corta ? `La contrasena necesita ${MINIMO} caracteres.` : undefined}
        />
        <TextField
          label="Repetir nueva contrasena"
          type="password"
          autoComplete="new-password"
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
          error={distinta}
          helperText={distinta ? 'Las contrasenas no coinciden.' : undefined}
        />
        <Button
          type="submit"
          fullWidth
          disabled={!listo || guardando}
          sx={{
            minHeight: 56,
            borderRadius: '8px',
            bgcolor: 'app.accentFill',
            color: 'app.onFill',
            fontSize: 18,
            '&:hover': { bgcolor: 'app.accentFill' },
            '&.Mui-disabled': { bgcolor: 'app.accentFill', color: 'app.onFill', opacity: 0.45 },
          }}
        >
          {guardando ? <CircularProgress size={24} sx={{ color: 'app.onFill' }} /> : 'Guardar'}
        </Button>
      </Stack>
    </PageContainer>
  );
};
