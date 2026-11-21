import type { ReactElement, ReactNode } from 'react';
import { Box } from '@mui/material';

type PageContainerProps = {
  children: ReactNode;
  /** Deja sitio a la barra inferior flotante en las pantallas con pestanas. */
  conBarraInferior?: boolean;
};

/**
 * Equivalente web de AppScreen: columna de ancho de telefono (480px como maximo),
 * centrada en pantallas grandes y respetando las zonas seguras del dispositivo.
 */
export const PageContainer = ({ children, conBarraInferior = false }: PageContainerProps): ReactElement => (
  <Box
    component="main"
    sx={{
      minHeight: '100dvh',
      bgcolor: 'background.default',
      display: 'flex',
      justifyContent: 'center',
    }}
  >
    <Box
      sx={{
        width: '100%',
        maxWidth: 480,
        pt: 'env(safe-area-inset-top)',
        pb: conBarraInferior ? 'calc(140px + env(safe-area-inset-bottom))' : 'calc(32px + env(safe-area-inset-bottom))',
        px: 'env(safe-area-inset-left)',
      }}
    >
      {children}
    </Box>
  </Box>
);
