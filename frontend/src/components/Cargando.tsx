import type { ReactElement } from 'react';
import { Box, CircularProgress } from '@mui/material';

export const Cargando = (): ReactElement => (
  <Box role="status" aria-label="Cargando" sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
    <CircularProgress size={48} />
  </Box>
);
