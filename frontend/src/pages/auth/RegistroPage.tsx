import { type ReactElement, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  type TextFieldProps,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router';
import { SeccionAcordeon, type EstadoSeccion } from '../../components/SeccionAcordeon';
import { rutas } from '../../constants/rutas';
import { useAuth } from '../../context/AuthContext';
import { useBorradorRegistro, type DatosRegistro } from '../../hooks/useBorradorRegistro';
import { PageContainer } from '../../layouts/PageContainer';
import { ApiError } from '../../services/base/apiError';
import { radius, spacing } from '../../theme/tokens';

type ClaveSeccion = 'personales' | 'acceso' | 'contacto';

/** Formato que exige el backend en `birthDate`. */
const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

const esFechaValida = (valor: string): boolean => {
  if (!FORMATO_FECHA.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00`);
  return !Number.isNaN(fecha.getTime()) && fecha < new Date();
};

/** Hoy en AAAA-MM-DD, tope del selector de fecha de nacimiento. */
const hoyISO = (): string => {
  const f = new Date();
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
};

export const RegistroPage = (): ReactElement => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { datos, actualizar, limpiar } = useBorradorRegistro();
  const [terminos, setTerminos] = useState(false);
  const [abierta, setAbierta] = useState<ClaveSeccion | null>('personales');
  const [enviando, setEnviando] = useState(false);
  const [cuentaExistente, setCuentaExistente] = useState<string | null>(null);

  const completas = useMemo(
    () => ({
      personales: Boolean(datos.names && datos.surnames && datos.document && esFechaValida(datos.birthDate) && datos.address),
      acceso: Boolean(datos.phone && datos.email.includes('@') && datos.password.length >= 8),
      contacto: Boolean(datos.contactName && datos.contactPhone && terminos),
    }),
    [datos, terminos],
  );

  const tocadas = useMemo(
    () => ({
      personales: Boolean(datos.names || datos.surnames || datos.document || datos.birthDate || datos.address),
      acceso: Boolean(datos.phone || datos.email || datos.password),
      contacto: Boolean(datos.contactName || datos.contactPhone || terminos),
    }),
    [datos, terminos],
  );

  const estadoDe = (clave: ClaveSeccion): EstadoSeccion => {
    if (completas[clave]) return 'completo';
    return tocadas[clave] ? 'en_curso' : 'sin_empezar';
  };

  const totalCompletas = Object.values(completas).filter(Boolean).length;
  const listo = totalCompletas === 3;

  const alternar = (clave: ClaveSeccion): void => setAbierta((actual) => (actual === clave ? null : clave));

  const campo = (etiqueta: string, clave: keyof DatosRegistro, extra?: TextFieldProps): ReactElement => (
    <TextField label={etiqueta} value={datos[clave]} onChange={(e) => actualizar(clave, e.target.value)} {...extra} />
  );

  const passwordCorta = Boolean(datos.password && datos.password.length < 8);

  const onRegistrarme = async (): Promise<void> => {
    if (!listo) return;
    setEnviando(true);
    try {
      await signUp({ ...datos, acceptedTerms: terminos });
      // La cuenta ya existe: el borrador deja de tener sentido y se descarta.
      await limpiar();
    } catch (error) {
      // El correo, telefono o cedula ya tienen cuenta: suele ser alguien que
      // cambio de celular. Se le lleva a ingresar en vez de dejarlo atascado.
      if (error instanceof ApiError && error.status === 409) {
        setCuentaExistente(error.message);
        return;
      }
      enqueueSnackbar(error instanceof Error ? error.message : 'No se pudo completar el registro. Intente nuevamente.', {
        variant: 'error',
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <PageContainer>
      <Box sx={{ px: `${spacing.xl}px`, pt: `${spacing.lg}px`, pb: `${spacing.xxl}px` }}>
        <Typography variant="caption" sx={{ color: 'primary.dark', letterSpacing: 1.2 }}>
          REGISTRO UNICO
        </Typography>
        <Typography variant="h1" sx={{ mt: `${spacing.xs}px` }}>
          Vamos a conocerte
        </Typography>
        <Typography color="text.secondary" sx={{ mt: `${spacing.sm}px` }}>
          Completa las secciones en el orden que prefieras — se guardan solas.
        </Typography>
        <Link
          component="button"
          type="button"
          onClick={() => navigate(rutas.login)}
          sx={{ minHeight: 44, fontWeight: 600, fontSize: 16, color: 'app.accentText', textDecorationColor: 'inherit' }}
        >
          ¿Ya tienes cuenta? Inicia sesion
        </Link>

        <Box sx={{ height: 8, mt: `${spacing.xl}px`, borderRadius: `${radius.pill}px`, bgcolor: 'app.surfaceMuted', overflow: 'hidden' }}>
          <Box
            sx={{
              height: '100%',
              width: `${(totalCompletas / 3) * 100}%`,
              borderRadius: `${radius.pill}px`,
              bgcolor: 'primary.dark',
              transition: 'width .3s',
            }}
          />
        </Box>
        <Typography variant="caption" component="p" sx={{ mt: `${spacing.sm}px`, color: 'primary.dark' }}>
          {totalCompletas} de 3 secciones completas
        </Typography>

        <Stack spacing={`${spacing.md}px`} sx={{ mt: `${spacing.lg}px` }}>
          <SeccionAcordeon
            numero={1}
            titulo="Datos personales"
            estado={estadoDe('personales')}
            abierta={abierta === 'personales'}
            onAlternar={() => alternar('personales')}
          >
            {campo('Nombres*', 'names', { autoComplete: 'given-name' })}
            {campo('Apellidos*', 'surnames', { autoComplete: 'family-name' })}
            <Box sx={{ display: 'flex', gap: `${spacing.sm}px` }}>
              <Box sx={{ flex: 2 }}>{campo('Cedula de identidad*', 'document', { slotProps: { htmlInput: { inputMode: 'numeric' } } })}</Box>
              <Box sx={{ flex: 1 }}>{campo('Complemento', 'complement')}</Box>
            </Box>
            {campo('Fecha de nacimiento*', 'birthDate', {
              type: 'date',
              slotProps: { inputLabel: { shrink: true }, htmlInput: { max: hoyISO() } },
            })}
            {campo('Direccion*', 'address', { autoComplete: 'street-address' })}
          </SeccionAcordeon>

          <SeccionAcordeon
            numero={2}
            titulo="Acceso y contacto"
            estado={estadoDe('acceso')}
            abierta={abierta === 'acceso'}
            onAlternar={() => alternar('acceso')}
          >
            {campo('Numero de celular*', 'phone', { type: 'tel', autoComplete: 'tel' })}
            {campo('Correo electronico*', 'email', { type: 'email', autoComplete: 'email' })}
            {campo('Contrasena (minimo 8 caracteres)*', 'password', {
              type: 'password',
              autoComplete: 'new-password',
              error: passwordCorta,
              helperText: passwordCorta ? 'La contrasena necesita 8 caracteres.' : undefined,
            })}
          </SeccionAcordeon>

          <SeccionAcordeon
            numero={3}
            titulo="Contacto de emergencia"
            estado={estadoDe('contacto')}
            abierta={abierta === 'contacto'}
            onAlternar={() => alternar('contacto')}
          >
            {campo('Nombre del contacto*', 'contactName')}
            {campo('Telefono del contacto*', 'contactPhone', { type: 'tel' })}
            <FormControlLabel
              control={
                <Checkbox
                  checked={terminos}
                  onChange={(e) => setTerminos(e.target.checked)}
                  sx={{ '&.Mui-checked': { color: 'primary.dark' } }}
                />
              }
              label={
                <Typography variant="caption" color="text.secondary">
                  Acepto los terminos y el tratamiento de mis datos para atender emergencias.
                </Typography>
              }
            />
          </SeccionAcordeon>
        </Stack>

        <Button
          fullWidth
          variant="contained"
          disabled={!listo || enviando}
          onClick={() => {
            onRegistrarme().catch(() => undefined);
          }}
          sx={{
            mt: `${spacing.xl}px`,
            minHeight: 60,
            bgcolor: 'primary.dark',
            fontSize: 18,
            '&.Mui-disabled': { bgcolor: 'primary.dark', color: 'app.onFill', opacity: 0.45 },
          }}
        >
          {enviando ? 'Registrando...' : 'Registrarme'}
        </Button>
      </Box>

      <Dialog open={cuentaExistente !== null} onClose={() => setCuentaExistente(null)}>
        <DialogTitle>Ya tienes una cuenta</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {cuentaExistente}. Ingresa con tu correo y contrasena. Si no la recuerdas, pide a la Central 168 que la restablezca.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCuentaExistente(null)}>Cancelar</Button>
          <Button variant="contained" onClick={() => navigate(rutas.login, { state: { email: datos.email.trim() } })}>
            Iniciar sesion
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};
