import { type ReactElement, useEffect } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import CheckIcon from '@mui/icons-material/Check';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useNavigate, useParams } from 'react-router';
import { CabeceraFlujo } from '../../components/CabeceraFlujo';
import { servicio } from '../../constants/institucion';
import { conUuid, rutas } from '../../constants/rutas';
import { useEmergencyFlow } from '../../context/EmergencyFlowContext';
import { PageContainer } from '../../layouts/PageContainer';
import { emergencyApi } from '../../services/emergencias/EmergenciasService';
import { llamarDirecto } from '../../services/emergencias/llamadaDirecta';
import { spacing } from '../../theme/tokens';

export const SeguimientoPage = (): ReactElement => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { uuid } = useParams();
  const { currentEmergency, setCurrentEmergency } = useEmergencyFlow();
  const emergencyUuid = uuid ?? currentEmergency?.uuid;

  const query = useQuery({
    queryKey: ['emergency', emergencyUuid],
    queryFn: () => emergencyApi.getEmergency(String(emergencyUuid)),
    enabled: Boolean(emergencyUuid),
    refetchInterval: 10_000,
  });

  const emergency = query.data ?? currentEmergency;

  useEffect(() => {
    if (query.data) setCurrentEmergency(query.data);
  }, [query.data, setCurrentEmergency]);

  // Si la central ya asigno operador con telefono se le llama directo; si no,
  // se llama al 168, que siempre atiende.
  const telefonoOperador = emergency?.operador?.telefono;

  const callOperator = async (): Promise<void> => {
    try {
      await llamarDirecto(telefonoOperador || servicio.numero);
    } catch {
      enqueueSnackbar(`No se pudo iniciar la llamada. Marca el ${telefonoOperador || servicio.numero}.`, { variant: 'error' });
    }
  };

  const historial = emergency?.historial ?? [];

  return (
    <PageContainer>
      <CabeceraFlujo
        titulo="Seguimiento del caso"
        onVolver={() => navigate(rutas.inicio)}
        etiquetaVolver="Inicio"
        iconoVolver={<HomeIcon sx={{ fontSize: 30 }} />}
      />
      <Box sx={{ px: `${spacing.xl}px`, pt: `${spacing.xl}px`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {!emergency && query.isLoading ? <CircularProgress size={40} sx={{ color: 'app.accentText', mb: 2 }} /> : null}

        <Box sx={{ width: 86, height: 86, borderRadius: '50%', bgcolor: 'success.main', display: 'grid', placeItems: 'center' }}>
          <CheckIcon sx={{ fontSize: 48, color: 'app.onFill' }} />
        </Box>
        <Typography variant="h2" component="h2" sx={{ mt: `${spacing.lg}px`, textAlign: 'center' }}>
          {emergency?.estado?.es_final ? 'Atencion concluida' : 'Emergencia en seguimiento'}
        </Typography>
        <Typography sx={{ mt: `${spacing.xs}px`, fontWeight: 600, color: 'app.accentText' }}>
          Codigo: {emergency?.codigo_publico ?? 'Sin registro'}
        </Typography>

        <Box sx={{ width: '100%', mt: `${spacing.xl}px`, p: `${spacing.lg}px`, borderRadius: '8px', border: 1, borderColor: 'divider', bgcolor: 'app.surface' }}>
          <Typography variant="h3" component="h3" sx={{ mb: `${spacing.md}px` }}>
            Estado en tiempo real
          </Typography>
          <Box component="ol" aria-live="polite" sx={{ m: 0, p: 0, listStyle: 'none' }}>
            {historial.map((item, index) => (
              <Box component="li" key={item.id} sx={{ display: 'flex', gap: `${spacing.sm}px`, minHeight: 54 }}>
                <Box sx={{ width: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', pt: '3px' }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', border: 2, borderColor: 'app.accentFill', bgcolor: 'app.accentFill' }} />
                  {index < historial.length - 1 ? <Box sx={{ width: 2, flex: 1, bgcolor: 'divider' }} /> : null}
                </Box>
                <Box sx={{ flex: 1, pb: `${spacing.sm}px` }}>
                  <Typography sx={{ fontWeight: 600 }}>{item.estadoNuevo?.nombre ?? 'Actualizacion'}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.created_at).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
          {!historial.length ? <Typography color="text.secondary">Esperando actualizaciones de la central.</Typography> : null}
        </Box>

        <Button
          fullWidth
          onClick={() => void callOperator()}
          startIcon={<PhoneIcon />}
          sx={{
            mt: `${spacing.xl}px`,
            minHeight: 66,
            borderRadius: '8px',
            bgcolor: 'app.accentFill',
            color: 'app.onFill',
            fontSize: 18,
            fontWeight: 700,
            '&:hover': { bgcolor: 'app.accentFill' },
          }}
        >
          {telefonoOperador ? 'LLAMAR OPERADOR' : `LLAMAR AL ${servicio.numero}`}
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddAPhotoIcon />}
          onClick={() => navigate(conUuid(rutas.evidencias, emergency?.uuid))}
          sx={{ mt: `${spacing.md}px`, minHeight: 58, borderRadius: '8px', color: 'app.accentText', borderColor: 'app.accentText' }}
        >
          Agregar evidencia opcional
        </Button>
      </Box>
    </PageContainer>
  );
};
