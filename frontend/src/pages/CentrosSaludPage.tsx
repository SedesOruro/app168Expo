import { type ReactElement, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import NavigationIcon from '@mui/icons-material/Navigation';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { BottomTabBar } from '../components/BottomTabBar';
import { MapaCentros } from '../components/MapaCentros';
import { PageContainer } from '../layouts/PageContainer';
import { diagnosticarFalloCentros } from '../services/emergencias/diagnosticarFalloCentros';
import type { Coordinates, HealthCenter } from '../services/emergencias/EmergenciasService';
import { getCurrentCoordinates } from '../services/emergencias/locationService';
import { obtenerCentrosSalud } from '../services/emergencias/obtenerCentrosSalud';
import { radius, shadows, spacing } from '../theme/tokens';

const ORURO_KM_ZERO: Coordinates = { latitude: -17.9695681, longitude: -67.1147287 };
const ORURO_CITY_RADIUS_KM = 10;

const centerCoordinates = (center: HealthCenter): { latitude: number; longitude: number } | null => {
  // Ojo con Number(null), que da 0: un centro sin coordenadas acabaria frente a Africa.
  if (center.latitud == null || center.longitud == null || center.latitud === '' || center.longitud === '') return null;
  const latitude = Number(center.latitud);
  const longitude = Number(center.longitud);
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
};

export const CentrosSaludPage = (): ReactElement => {
  const { enqueueSnackbar } = useSnackbar();
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [seleccionado, setSeleccionado] = useState<HealthCenter | null>(null);

  useEffect(() => {
    getCurrentCoordinates()
      .then(setLocation)
      .catch((error) =>
        enqueueSnackbar(
          `${error instanceof Error ? error.message : 'No se pudo obtener la ubicacion.'} Se mostraran los centros registrados.`,
          { variant: 'info' },
        ),
      );
  }, [enqueueSnackbar]);

  const centersQuery = useQuery({
    queryKey: ['health-centers', 'oruro-city'],
    queryFn: () => obtenerCentrosSalud(location ?? ORURO_KM_ZERO),
  });

  const centers = useMemo(() => centersQuery.data?.centros ?? [], [centersQuery.data]);
  const desdeCache = centersQuery.data?.origen === 'cache';
  const diagnostico = centersQuery.isError ? diagnosticarFalloCentros(centersQuery.error) : null;

  const mapped = useMemo(
    () =>
      centers.flatMap((centro) => {
        const punto = centerCoordinates(centro);
        return punto ? [{ centro, punto }] : [];
      }),
    [centers],
  );

  const cityBounds = useMemo<[number, number, number, number] | null>(() => {
    const ciudad = mapped.filter(({ centro }) => centro.distanceKm == null || centro.distanceKm <= ORURO_CITY_RADIUS_KM);
    if (!ciudad.length) return null;
    return ciudad.reduce<[number, number, number, number]>(
      (b, { punto }) => [Math.min(b[0], punto.longitude), Math.min(b[1], punto.latitude), Math.max(b[2], punto.longitude), Math.max(b[3], punto.latitude)],
      [ORURO_KM_ZERO.longitude, ORURO_KM_ZERO.latitude, ORURO_KM_ZERO.longitude, ORURO_KM_ZERO.latitude],
    );
  }, [mapped]);

  const navigateToCenter = (center: HealthCenter): void => {
    const coordinates = centerCoordinates(center);
    if (!coordinates) {
      enqueueSnackbar('Este centro no tiene coordenadas registradas.', { variant: 'warning' });
      return;
    }
    const destination = `${coordinates.latitude},${coordinates.longitude}`;
    const url = location
      ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${encodeURIComponent(`${location.latitude},${location.longitude};${destination}`)}`
      : `https://www.openstreetmap.org/?mlat=${coordinates.latitude}&mlon=${coordinates.longitude}#map=16/${coordinates.latitude}/${coordinates.longitude}`;
    window.open(url, '_blank', 'noopener');
  };

  return (
    <PageContainer conBarraInferior>
      <Box
        component="header"
        sx={{ height: 64, display: 'grid', placeItems: 'center', bgcolor: 'app.surface', boxShadow: shadows.sm, position: 'relative', zIndex: 1 }}
      >
        <Typography component="h1" sx={{ fontWeight: 700, fontSize: 21, lineHeight: '26px' }}>
          Centros cercanos
        </Typography>
      </Box>

      <MapaCentros kmCero={ORURO_KM_ZERO} ubicacion={location} centros={mapped} limites={cityBounds} onSeleccionar={setSeleccionado} />

      <Box sx={{ px: '22px', pt: '10px', bgcolor: 'app.surface' }}>
        {desdeCache ? (
          <Box
            role="status"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: `${spacing.xs}px`,
              px: `${spacing.sm}px`,
              py: `${spacing.xs}px`,
              borderRadius: `${radius.pill}px`,
              bgcolor: 'app.warningSoft',
            }}
          >
            <CloudOffIcon sx={{ fontSize: 16, color: 'app.warningText' }} />
            <Typography variant="caption" sx={{ color: 'app.warningText' }}>
              Datos guardados en este dispositivo
              {centersQuery.data?.actualizadoEn ? ` · ${new Date(centersQuery.data.actualizadoEn).toLocaleDateString()}` : ''}
            </Typography>
          </Box>
        ) : null}

        {centersQuery.isLoading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
            <CircularProgress size={40} sx={{ color: 'app.accentText' }} />
          </Box>
        ) : diagnostico ? (
          <Box sx={{ py: `${spacing.xl}px`, px: `${spacing.lg}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${spacing.sm}px` }}>
            <CloudOffIcon sx={{ fontSize: 34, color: 'text.secondary' }} />
            <Typography variant="h3" component="p" sx={{ textAlign: 'center' }}>
              {diagnostico.titulo}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              {diagnostico.detalle}
            </Typography>
            <Button
              onClick={() => void centersQuery.refetch()}
              sx={{ mt: 1, minHeight: 44, px: `${spacing.xl}px`, borderRadius: `${radius.pill}px`, bgcolor: 'app.accentFill', color: 'app.onFill', '&:hover': { bgcolor: 'app.accentFill' } }}
            >
              {centersQuery.isFetching ? 'Reintentando...' : 'Reintentar'}
            </Button>
          </Box>
        ) : (
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
            {centers.map((center) => (
              <Box
                component="li"
                key={center.uuid}
                sx={{ minHeight: 82, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 17, lineHeight: '22px' }}>{center.nombre}</Typography>
                  <Typography sx={{ mt: '3px', fontWeight: 600, fontSize: 14, lineHeight: '19px', color: 'app.accentText' }}>
                    {center.distanceKm != null ? `${center.distanceKm.toFixed(1)} km | ` : ''}
                    {center.nivel || center.tipo || center.municipio}
                  </Typography>
                  {center.direccion ? (
                    <Typography noWrap sx={{ mt: '2px', fontSize: 13, lineHeight: '18px', color: 'text.secondary' }}>
                      {center.direccion}
                    </Typography>
                  ) : null}
                </Box>
                <IconButton
                  aria-label={`Como llegar a ${center.nombre}`}
                  onClick={() => navigateToCenter(center)}
                  sx={{ width: 44, height: 44, bgcolor: 'app.dangerSoft', color: 'app.accentText' }}
                >
                  <NavigationIcon />
                </IconButton>
              </Box>
            ))}
            {!centers.length ? (
              <Typography color="text.secondary" sx={{ mt: '28px', textAlign: 'center' }}>
                No se encontraron centros de salud.
              </Typography>
            ) : null}
          </Box>
        )}
      </Box>

      <Dialog open={seleccionado !== null} onClose={() => setSeleccionado(null)}>
        <DialogTitle>{seleccionado?.nombre}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {seleccionado?.codigo_rues} | {seleccionado?.municipio}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSeleccionado(null)}>Cerrar</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (seleccionado) navigateToCenter(seleccionado);
              setSeleccionado(null);
            }}
          >
            Como llegar
          </Button>
        </DialogActions>
      </Dialog>

      <BottomTabBar active="HealthCenters" />
    </PageContainer>
  );
};
