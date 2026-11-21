import type { ReactElement, ReactNode } from 'react';
import { Box, ButtonBase, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { spacing } from '../theme/tokens';

type CabeceraFlujoProps = {
  titulo: string;
  onVolver: () => void;
  /** Icono y etiqueta del boton izquierdo; por defecto flecha "Volver". */
  iconoVolver?: ReactNode;
  etiquetaVolver?: string;
  /** Accion de texto a la derecha (p. ej. "Omitir"). */
  accion?: { etiqueta: string; ariaLabel?: string; onClick: () => void };
  derecha?: ReactNode;
};

/** Cabecera naranja del flujo de emergencia (triaje, seguimiento, evidencias). */
export const CabeceraFlujo = ({ titulo, onVolver, iconoVolver, etiquetaVolver = 'Volver', accion, derecha }: CabeceraFlujoProps): ReactElement => (
  <Box
    component="header"
    sx={{
      position: 'sticky',
      top: 0,
      zIndex: 2,
      height: 64,
      px: `${spacing.sm}px`,
      bgcolor: 'app.accentFill',
      color: 'app.onFill',
      display: 'flex',
      alignItems: 'center',
      gap: `${spacing.sm}px`,
    }}
  >
    <IconButton aria-label={etiquetaVolver} onClick={onVolver} sx={{ color: 'inherit', width: 46, height: 46 }}>
      {iconoVolver ?? <ArrowBackIcon sx={{ fontSize: 32 }} />}
    </IconButton>
    <Typography variant="h3" component="h1" sx={{ flex: 1, color: 'inherit' }} noWrap>
      {titulo}
    </Typography>
    {accion ? (
      <ButtonBase aria-label={accion.ariaLabel ?? accion.etiqueta} onClick={accion.onClick} sx={{ minHeight: 46, px: `${spacing.md}px`, borderRadius: 2 }}>
        <Typography sx={{ fontWeight: 600, color: 'inherit' }}>{accion.etiqueta}</Typography>
      </ButtonBase>
    ) : null}
    {derecha}
  </Box>
);
