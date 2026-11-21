import type { ReactElement } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';

/** Los tres estados del circulo, equivalentes a las variantes del kit. */
export type EstadoSos = 'reposo' | 'presionado' | 'confirmado';

type CirculoSosProps = {
  onPress: () => void;
  estado?: EstadoSos;
  etiqueta?: string;
  deshabilitado?: boolean;
};

const DIAMETRO = 216;

// Aros concentricos al estilo del kit: uno de superficie pegado al boton y otro
// mas tenue por fuera.
const AROS = [
  { escala: 1.38, color: 'app.surfaceMuted' },
  { escala: 1.16, color: 'app.surface' },
] as const;

export const CirculoSos = ({ onPress, estado = 'reposo', etiqueta = 'EMERGENCIA', deshabilitado = false }: CirculoSosProps): ReactElement => {
  const confirmado = estado === 'confirmado';
  const presionado = estado === 'presionado';

  return (
    <Box
      sx={{
        width: DIAMETRO * 1.38,
        height: DIAMETRO * 1.38,
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {AROS.map((aro) => (
        <Box
          key={aro.escala}
          aria-hidden
          sx={{
            position: 'absolute',
            width: DIAMETRO * aro.escala,
            height: DIAMETRO * aro.escala,
            borderRadius: '50%',
            bgcolor: presionado ? 'app.dangerGlow' : aro.color,
          }}
        />
      ))}
      <ButtonBase
        aria-label="Linea gratuita 168, pedir ayuda"
        aria-busy={presionado}
        disabled={deshabilitado}
        onClick={onPress}
        sx={(t) => ({
          width: DIAMETRO,
          height: DIAMETRO,
          borderRadius: '50%',
          flexDirection: 'column',
          background: confirmado
            ? t.palette.app.success
            : `linear-gradient(150deg, ${t.palette.app.dangerFill} 15%, ${t.palette.app.dangerFillDeep} 85%)`,
          color: t.palette.app.onFill,
          transition: 'transform .12s',
          transform: presionado ? 'scale(0.96)' : undefined,
          '&:active': { transform: 'scale(0.96)' },
          '&.Mui-disabled': { opacity: 0.5 },
        })}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 64, lineHeight: '74px', color: 'inherit' }}>{confirmado ? '✓' : '168'}</Typography>
        <Typography variant="caption" sx={{ mt: '2px', letterSpacing: 1.6, color: 'inherit' }}>
          {confirmado ? 'ENVIADA' : etiqueta}
        </Typography>
      </ButtonBase>
    </Box>
  );
};
