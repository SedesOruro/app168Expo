import type { ReactElement } from 'react';
import { Box, ButtonBase, CircularProgress, Typography } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { BottomTabBar } from '../components/BottomTabBar';
import { conUuid, rutas } from '../constants/rutas';
import { useEmergencyFlow } from '../context/EmergencyFlowContext';
import { PageContainer } from '../layouts/PageContainer';
import { emergencyApi } from '../services/emergencias/EmergenciasService';
import { shadows } from '../theme/tokens';

export const HistorialPage = (): ReactElement => {
  const navigate = useNavigate();
  const { setCurrentEmergency } = useEmergencyFlow();
  const query = useQuery({ queryKey: ['emergency-history'], queryFn: emergencyApi.listEmergencies });
  const emergencies = query.data ?? [];

  return (
    <PageContainer conBarraInferior>
      <Box sx={{ px: '26px', pt: '52px' }}>
        <Typography component="h1" sx={{ color: 'app.accentText', fontSize: 30, lineHeight: '36px', fontWeight: 700, textAlign: 'center' }}>
          Mis emergencias
        </Typography>
        <Typography color="text.secondary" sx={{ mt: '10px', mb: '20px', textAlign: 'center' }}>
          Codigo, tipo, estado y fecha del evento.
        </Typography>

        {query.isLoading ? (
          <Box sx={{ display: 'grid', placeItems: 'center' }}>
            <CircularProgress size={40} sx={{ color: 'app.accentText' }} />
          </Box>
        ) : null}

        {emergencies.map((item) => (
          <ButtonBase
            key={item.uuid}
            onClick={() => {
              setCurrentEmergency(item);
              navigate(conUuid(rutas.seguimiento, item.uuid));
            }}
            sx={{
              width: '100%',
              mt: '14px',
              p: '18px',
              gap: '14px',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              textAlign: 'left',
              borderRadius: '8px',
              border: 1,
              borderColor: 'divider',
              bgcolor: 'app.surface',
              boxShadow: shadows.sm,
            }}
          >
            <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'app.dangerSoft', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <AssignmentIcon sx={{ fontSize: 28, color: 'app.accentText' }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 18, lineHeight: '23px', fontWeight: 700 }}>{item.codigo_publico}</Typography>
              <Typography sx={{ mt: '6px', fontWeight: 700, color: 'app.accentText' }}>
                {item.tipo?.nombre ?? 'Emergencia'} | {item.estado?.nombre ?? 'Sin estado'}
              </Typography>
              <Typography sx={{ mt: '6px', fontSize: 15, lineHeight: '20px', color: 'text.secondary' }}>
                {new Date(item.created_at).toLocaleString()}
              </Typography>
            </Box>
          </ButtonBase>
        ))}

        {!query.isLoading && emergencies.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: '30px', textAlign: 'center' }}>
            Todavia no registro emergencias.
          </Typography>
        ) : null}
      </Box>
      <BottomTabBar active="History" />
    </PageContainer>
  );
};
