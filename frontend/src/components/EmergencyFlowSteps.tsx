import type { ReactElement } from 'react';
import { Box, Typography } from '@mui/material';
import { spacing } from '../theme/tokens';

const defaultSteps = ['Que pasa', 'Detalles'];

type EmergencyFlowStepsProps = { activeStep: number; labels?: string[] };

export const EmergencyFlowSteps = ({ activeStep, labels = defaultSteps }: EmergencyFlowStepsProps): ReactElement => (
  <Box component="ol" sx={{ width: '100%', m: 0, p: 0, mb: `${spacing.xl}px`, listStyle: 'none', display: 'flex', gap: `${spacing.xs}px` }}>
    {labels.map((step, index) => {
      const numero = index + 1;
      const hecho = numero < activeStep;
      const activo = numero === activeStep;
      return (
        <Box component="li" key={step} aria-current={activo ? 'step' : undefined} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* El paso en curso se rellena igual que los completados y se distingue por el aro. */}
          <Box
            sx={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              border: activo ? 3 : 1,
              borderColor: activo ? 'app.surface' : hecho ? 'app.accent' : 'divider',
              bgcolor: hecho || activo ? 'app.accent' : 'app.surface',
              boxShadow: activo ? (t) => `0 0 0 1px ${t.palette.app.accent}` : undefined,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Typography variant="caption" sx={{ lineHeight: '15px', color: hecho || activo ? 'app.onFill' : 'text.secondary' }}>
              {numero}
            </Typography>
          </Box>
          <Typography noWrap sx={{ mt: `${spacing.xs}px`, fontSize: 10, lineHeight: '13px', fontWeight: 500, color: activo ? 'app.accentText' : 'text.secondary' }}>
            {step}
          </Typography>
        </Box>
      );
    })}
  </Box>
);
