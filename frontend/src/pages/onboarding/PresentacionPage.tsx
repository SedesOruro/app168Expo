import { type ReactElement, useEffect } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import ccesd from '../../assets/logos/ccesd.png';
import sedes from '../../assets/logos/sedes.png';
import { institucion, servicio } from '../../constants/institucion';
import { radius, spacing } from '../../theme/tokens';

/** Milisegundos que la presentacion permanece antes de continuar sola. */
const DURACION = 2800;

/**
 * Unico lugar donde aparece el respaldo institucional. Se muestra al abrir y no
 * vuelve: dentro de la aplicacion los sellos restan espacio a pedir ayuda rapido.
 * Los sellos van sobre una placa clara porque estan disenados para papel blanco.
 */
export const PresentacionPage = ({ onTerminar }: { onTerminar: () => void }): ReactElement => {
  useEffect(() => {
    const temporizador = setTimeout(onTerminar, DURACION);
    return () => clearTimeout(temporizador);
  }, [onTerminar]);

  return (
    <ButtonBase
      aria-label="Continuar"
      onClick={onTerminar}
      sx={{
        width: '100%',
        minHeight: '100dvh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        pt: 'env(safe-area-inset-top)',
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      <Box sx={{ pt: `${spacing.xl}px`, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ p: `${spacing.sm}px`, borderRadius: `${radius.md}px`, bgcolor: 'app.onFill' }}>
          <Box component="img" src={sedes} alt="SEDES Oruro" sx={{ width: 76, height: 76, objectFit: 'contain', display: 'block' }} />
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: `${spacing.xl}px`, gap: `${spacing.sm}px` }}>
        <Box sx={{ mb: `${spacing.lg}px`, p: `${spacing.md}px`, borderRadius: '50%', bgcolor: 'app.onFill' }}>
          <Box
            component="img"
            src={ccesd}
            alt="Centro Coordinador de Emergencias en Salud Departamental"
            sx={{ width: 132, height: 132, objectFit: 'contain', display: 'block' }}
          />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: 72, lineHeight: '82px', color: 'app.dangerFill' }}>{servicio.numero}</Typography>
        <Typography variant="h2">{servicio.nombre}</Typography>
        <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
          {servicio.descripcionCorta}
        </Typography>
      </Box>

      <Box sx={{ px: `${spacing.xl}px`, pb: `${spacing.xxl}px` }}>
        <Typography variant="caption" component="p" color="text.secondary" sx={{ textAlign: 'center' }}>
          {institucion.nombreCompleto}
          <br />
          {institucion.entidadSuperior}
        </Typography>
      </Box>
    </ButtonBase>
  );
};
