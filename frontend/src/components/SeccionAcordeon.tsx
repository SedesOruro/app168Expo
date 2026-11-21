import type { ReactElement, ReactNode } from 'react';
import { Box, ButtonBase, Collapse, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { radius, spacing } from '../theme/tokens';

export type EstadoSeccion = 'completo' | 'en_curso' | 'sin_empezar';

const rotulos: Record<EstadoSeccion, string> = {
  completo: 'Completo',
  en_curso: 'En curso',
  sin_empezar: 'Sin empezar',
};

type SeccionAcordeonProps = {
  numero: number;
  titulo: string;
  estado: EstadoSeccion;
  abierta: boolean;
  onAlternar: () => void;
  children: ReactNode;
};

/**
 * Seccion plegable del registro. Se pueden completar en cualquier orden, por eso
 * cada una lleva su propio estado visible en la cabecera.
 */
export const SeccionAcordeon = ({ numero, titulo, estado, abierta, onAlternar, children }: SeccionAcordeonProps): ReactElement => {
  const completo = estado === 'completo';

  return (
    <Box
      sx={{
        borderRadius: `${radius.lg}px`,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: abierta ? 'primary.main' : 'divider',
        overflow: 'hidden',
      }}
    >
      <ButtonBase
        aria-expanded={abierta}
        aria-label={`${titulo}. ${rotulos[estado]}`}
        onClick={onAlternar}
        sx={{
          width: '100%',
          minHeight: 64,
          px: `${spacing.lg}px`,
          py: `${spacing.md}px`,
          display: 'flex',
          gap: `${spacing.md}px`,
          justifyContent: 'flex-start',
        }}
      >
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            border: 1,
            borderColor: completo ? 'success.main' : 'divider',
            bgcolor: completo ? 'success.main' : 'transparent',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          {completo ? (
            <CheckIcon sx={{ fontSize: 18, color: 'app.onFill' }} />
          ) : (
            <Typography variant="caption" color="text.secondary">
              {numero}
            </Typography>
          )}
        </Box>
        <Typography sx={{ fontWeight: 600, flex: 1, textAlign: 'left' }}>{titulo}</Typography>
        {abierta ? (
          <ExpandLessIcon sx={{ color: 'text.secondary' }} />
        ) : (
          <Typography variant="caption" sx={{ color: completo ? 'primary.dark' : 'text.secondary' }}>
            {rotulos[estado]}
          </Typography>
        )}
      </ButtonBase>
      <Collapse in={abierta} unmountOnExit>
        <Box sx={{ px: `${spacing.lg}px`, pb: `${spacing.lg}px`, display: 'flex', flexDirection: 'column', gap: `${spacing.md}px` }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
};
