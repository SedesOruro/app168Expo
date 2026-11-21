import { type ReactElement, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import CloseIcon from '@mui/icons-material/Close';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import IosShareIcon from '@mui/icons-material/IosShare';
import { useInstalarPwa } from '../hooks/useInstalarPwa';
import { radius, spacing } from '../theme/tokens';

const CLAVE_DESCARTE = 'e168.aviso_instalar_descartado';

const leerDescartado = (): boolean => {
  try {
    return localStorage.getItem(CLAVE_DESCARTE) === 'true';
  } catch {
    return false;
  }
};

/**
 * Invita a instalar la app en la pantalla de inicio. En Android/Chrome abre el
 * dialogo nativo; Safari en iPhone no tiene ese dialogo, asi que se explican los
 * dos pasos del menu Compartir.
 */
export const AvisoInstalar = (): ReactElement | null => {
  const { forma, instalar } = useInstalarPwa();
  const [descartado, setDescartado] = useState(leerDescartado);
  const [verPasosIos, setVerPasosIos] = useState(false);

  if (descartado || forma === 'instalada' || forma === 'no_disponible') return null;

  const descartar = (): void => {
    setDescartado(true);
    try {
      localStorage.setItem(CLAVE_DESCARTE, 'true');
    } catch {
      // Sin almacenamiento el aviso vuelve a salir en la proxima visita.
    }
  };

  const alPulsar = (): void => {
    if (forma === 'ios') setVerPasosIos(true);
    else void instalar();
  };

  return (
    <>
      <Box
        role="region"
        aria-label="Instalar aplicacion"
        sx={{
          width: '100%',
          mb: `${spacing.md}px`,
          p: `${spacing.md}px`,
          borderRadius: `${radius.md}px`,
          bgcolor: 'app.surface',
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: `${spacing.sm}px`,
        }}
      >
        <InstallMobileIcon sx={{ color: 'app.accentText', fontSize: 30 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, lineHeight: '20px' }}>Instala Emergencias 168</Typography>
          <Typography variant="caption" color="text.secondary">
            Abrela desde tu pantalla de inicio, aun sin conexion.
          </Typography>
        </Box>
        <Button
          size="small"
          onClick={alPulsar}
          sx={{ bgcolor: 'app.accentFill', color: 'app.onFill', fontWeight: 700, '&:hover': { bgcolor: 'app.accentFill' } }}
        >
          Instalar
        </Button>
        <IconButton aria-label="Ocultar aviso de instalacion" size="small" onClick={descartar}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Dialog open={verPasosIos} onClose={() => setVerPasosIos(false)}>
        <DialogTitle>Instalar en iPhone</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <IosShareIcon sx={{ color: 'app.accentText' }} />
            <Typography>1. Toca Compartir en la barra de Safari.</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddBoxOutlinedIcon sx={{ color: 'app.accentText' }} />
            <Typography>2. Elige "Agregar a inicio".</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerPasosIos(false)}>Entendido</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
