import type { ReactElement } from 'react';
import { ButtonBase, Paper, Typography } from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import PlaceIcon from '@mui/icons-material/Place';
import { useNavigate } from 'react-router';
import { rutas } from '../constants/rutas';
import { shadows, spacing } from '../theme/tokens';

export type TabKey = 'Dashboard' | 'HealthCenters' | 'History' | 'Information' | 'Profile';

const tabs = [
  { key: 'Dashboard', Icono: HomeIcon, label: 'Inicio', ruta: rutas.inicio },
  { key: 'HealthCenters', Icono: PlaceIcon, label: 'Mapa', ruta: rutas.centrosSalud },
  { key: 'History', Icono: HistoryIcon, label: 'Historial', ruta: rutas.historial },
  { key: 'Information', Icono: ExploreIcon, label: 'Info', ruta: rutas.informacion },
  { key: 'Profile', Icono: PersonIcon, label: 'Perfil', ruta: rutas.perfil },
] as const;

/**
 * Barra inferior segun el kit: tarjeta redondeada sobre `surfaceMuted`, icono con
 * la etiqueta visible debajo y la pestana activa marcada con el color del acento.
 */
export const BottomTabBar = ({ active }: { active: TabKey }): ReactElement => {
  const navigate = useNavigate();

  return (
    <Paper
      component="nav"
      aria-label="Navegacion principal"
      sx={(t) => ({
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        width: `calc(min(100%, 480px) - ${spacing.lg * 2}px)`,
        bottom: `calc(${spacing.xl}px + env(safe-area-inset-bottom))`,
        minHeight: 76,
        py: `${spacing.md}px`,
        bgcolor: t.palette.app.surfaceMuted,
        borderRadius: '28px',
        boxShadow: shadows.md,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: t.zIndex.appBar,
      })}
    >
      {tabs.map(({ key, Icono, label, ruta }) => {
        const activa = key === active;
        return (
          <ButtonBase
            key={key}
            aria-label={label}
            aria-current={activa ? 'page' : undefined}
            onClick={() => navigate(ruta)}
            sx={(t) => ({
              flex: 1,
              flexDirection: 'column',
              gap: '3px',
              borderRadius: 3,
              color: activa ? t.palette.app.accentText : t.palette.app.text,
            })}
          >
            <Icono sx={{ fontSize: 26 }} />
            <Typography sx={{ fontWeight: 600, fontSize: 13, lineHeight: '17px', color: 'inherit' }} noWrap>
              {label}
            </Typography>
          </ButtonBase>
        );
      })}
    </Paper>
  );
};
