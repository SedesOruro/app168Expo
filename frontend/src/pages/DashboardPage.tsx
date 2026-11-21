import type { ReactElement } from 'react';
import { Box, Link, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import PlaceIcon from '@mui/icons-material/Place';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router';
import { AvisoInstalar } from '../components/AvisoInstalar';
import { BottomTabBar } from '../components/BottomTabBar';
import { CirculoSos } from '../components/CirculoSos';
import { servicio } from '../constants/institucion';
import { rutas } from '../constants/rutas';
import { useAuth } from '../context/AuthContext';
import { useEmergencyFlow } from '../context/EmergencyFlowContext';
import { leerEstadoRed, useEstadoRed } from '../hooks/useEstadoRed';
import { PageContainer } from '../layouts/PageContainer';
import { decidirCanalDeEmergencia } from '../services/emergencias/decidirCanalDeEmergencia';
import { llamarDirecto } from '../services/emergencias/llamadaDirecta';
import { radius, spacing } from '../theme/tokens';

export const DashboardPage = (): ReactElement => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user, status, sinConexion, pedirRegistro } = useAuth();
  const { registrarAlerta } = useEmergencyFlow();
  const registrado = status === 'authenticated';

  // El boton dice de antemano lo que va a hacer, en vez de descubrirlo tras un
  // tiempo de espera agotado con la persona esperando.
  const sinDatos = decidirCanalDeEmergencia(useEstadoRed()) === 'llamada';

  /**
   * El boton es otra forma de llamar al 168: la llamada sale de inmediato. Con
   * cuenta y datos, ademas se registra la alerta con la ubicacion y la app espera
   * en el triaje para completar los datos. Sin datos la llamada basta.
   */
  const pedirAyuda = async (): Promise<void> => {
    try {
      await llamarDirecto(servicio.numero);
    } catch {
      enqueueSnackbar(`No se pudo iniciar la llamada. Marca el ${servicio.numero} desde la aplicacion de llamadas.`, {
        variant: 'error',
      });
    }

    if (!registrado) return;
    if (decidirCanalDeEmergencia(leerEstadoRed()) !== 'app') return;

    void registrarAlerta();
    navigate(rutas.triaje);
  };

  return (
    <PageContainer conBarraInferior>
      <Box sx={{ px: `${spacing.xl}px`, pt: `${spacing.xl}px`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mb: `${spacing.xl}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">
              Ubicacion actual
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.xs}px` }}>
              <PlaceIcon sx={{ fontSize: 18, color: 'app.accentText' }} />
              <Typography sx={{ fontWeight: 600 }} noWrap>
                Se comparte al enviar la alerta
              </Typography>
            </Box>
          </Box>
          <Typography sx={{ fontWeight: 600, color: 'text.secondary', flexShrink: 0 }} noWrap>
            {user?.name?.split(' ')[0] || 'Visitante'}
          </Typography>
        </Box>

        <AvisoInstalar />

        {sinConexion ? (
          <Box
            role="status"
            sx={{
              width: '100%',
              mb: `${spacing.md}px`,
              py: `${spacing.sm}px`,
              px: `${spacing.md}px`,
              borderRadius: `${radius.md}px`,
              bgcolor: 'app.warningSoft',
              display: 'flex',
              alignItems: 'center',
              gap: `${spacing.sm}px`,
            }}
          >
            <CloudOffIcon sx={{ fontSize: 18, color: 'app.warningText' }} />
            <Typography variant="caption" sx={{ flex: 1, color: 'app.warningText' }}>
              Sin conexion con la Central. Tu registro sigue en este dispositivo.
            </Typography>
          </Box>
        ) : null}

        <Typography variant="h1" sx={{ textAlign: 'center' }}>
          Centro de emergencias 168
        </Typography>
        <Typography color="text.secondary" sx={{ mt: `${spacing.sm}px`, textAlign: 'center' }}>
          {registrado && !sinDatos
            ? 'Un toque llama al 168. Despues puedes completar los datos.'
            : 'Un toque llama al 168, como una llamada normal.'}
        </Typography>

        <Box sx={{ mt: `${spacing.xl}px` }}>
          <CirculoSos etiqueta="LLAMAR 168" onPress={() => void pedirAyuda()} />
        </Box>

        {!registrado ? (
          <Link
            component="button"
            type="button"
            onClick={() => pedirRegistro().catch(() => undefined)}
            sx={{ mt: `${spacing.xl}px`, fontWeight: 600, fontSize: 16, color: 'app.accentText', textAlign: 'center', textDecorationColor: 'inherit' }}
          >
            Registrate para que la central reciba tu ubicacion y tu perfil medico.
          </Link>
        ) : null}

        <Box
          sx={{
            width: '100%',
            mt: `${spacing.xl}px`,
            minHeight: 54,
            borderRadius: `${radius.md}px`,
            bgcolor: 'app.surfaceMuted',
            border: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: `${spacing.sm}px`,
          }}
        >
          <CheckCircleIcon sx={{ color: 'success.main' }} />
          <Typography sx={{ fontWeight: 600 }}>Estado: Listo para llamar</Typography>
        </Box>
      </Box>
      <BottomTabBar active="Dashboard" />
    </PageContainer>
  );
};
