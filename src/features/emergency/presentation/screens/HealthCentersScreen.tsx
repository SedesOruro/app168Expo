import React, { ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Camera,
  Map,
  Marker,
  type CameraRef,
} from '@maplibre/maplibre-react-native';
import { useQuery } from '@tanstack/react-query';

import type { MainStackParamList } from '../../../../app/navigation/types';
import type { AppTheme } from '../../../../shared/theme';
import { diagnosticarFalloCentros } from '../utils/diagnosticarFalloCentros';
import { obtenerCentrosSalud } from '../../data/obtenerCentrosSalud';
import { env } from '../../../../shared/config/env';
import { BottomTabBar } from '../components/BottomTabBar';
import { emergencyApi, type Coordinates, type HealthCenter } from '../../data/EmergencyApi';
import { getCurrentCoordinates } from '../../data/locationService';

type HealthCentersNavigation = NativeStackNavigationProp<
  MainStackParamList,
  'HealthCenters'
>;

const ORURO_KM_ZERO: Coordinates = {
  latitude: -17.9695681,
  longitude: -67.1147287,
};
const ORURO_CITY_RADIUS_KM = 10;

const centerCoordinates = (
  center: HealthCenter,
): { latitude: number; longitude: number } | null => {
  const latitude = Number(center.latitud);
  const longitude = Number(center.longitud);
  return Number.isFinite(latitude) && Number.isFinite(longitude)
    ? { latitude, longitude }
    : null;
};

export const HealthCentersScreen = (): ReactElement => {
  const tema = useTheme() as AppTheme;
  const estilos = crearEstilos(tema);
  const navigation = useNavigation<HealthCentersNavigation>();
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const cameraRef = useRef<CameraRef>(null);

  useEffect(() => {
    getCurrentCoordinates()
      .then(setLocation)
      .catch(error =>
        Alert.alert(
          'Ubicacion no disponible',
          `${error instanceof Error ? error.message : 'No se pudo obtener la ubicacion.'} Se mostraran los centros registrados.`,
        ),
      );
  }, []);

  const centersQuery = useQuery({
    queryKey: ['health-centers', 'oruro-city'],
    queryFn: () => obtenerCentrosSalud(location ?? ORURO_KM_ZERO),
  });
  const centers = centersQuery.data?.centros ?? [];
  const desdeCache = centersQuery.data?.origen === 'cache';

  const diagnostico = centersQuery.isError
    ? diagnosticarFalloCentros(centersQuery.error)
    : null;
  const mappedCenters = centers.filter(center => centerCoordinates(center));
  const cityCenters = useMemo(
    () =>
      mappedCenters.filter(
        center => center.distanceKm == null || center.distanceKm <= ORURO_CITY_RADIUS_KM,
      ),
    [mappedCenters],
  );
  const cityBounds = useMemo<[number, number, number, number] | null>(() => {
    const coordinates = cityCenters
      .map(centerCoordinates)
      .filter((item): item is { latitude: number; longitude: number } => item !== null);
    if (!coordinates.length) return null;

    return coordinates.reduce<[number, number, number, number]>(
      (bounds, coordinate) => [
        Math.min(bounds[0], coordinate.longitude),
        Math.min(bounds[1], coordinate.latitude),
        Math.max(bounds[2], coordinate.longitude),
        Math.max(bounds[3], coordinate.latitude),
      ],
      [
        ORURO_KM_ZERO.longitude,
        ORURO_KM_ZERO.latitude,
        ORURO_KM_ZERO.longitude,
        ORURO_KM_ZERO.latitude,
      ],
    );
  }, [cityCenters]);

  useEffect(() => {
    if (!mapReady || !cityBounds) return;
    cameraRef.current?.fitBounds(cityBounds, {
      padding: { top: 34, right: 34, bottom: 34, left: 34 },
      duration: 900,
    });
  }, [cityBounds, mapReady]);

  const navigateToCenter = async (center: HealthCenter): Promise<void> => {
    const coordinates = centerCoordinates(center);
    if (!coordinates) {
      Alert.alert('Ubicacion no disponible', 'Este centro no tiene coordenadas registradas.');
      return;
    }
    const destination = `${coordinates.latitude},${coordinates.longitude}`;
    const route = location
      ? `${location.latitude},${location.longitude};${destination}`
      : null;
    const url = route
      ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${encodeURIComponent(route)}`
      : `https://www.openstreetmap.org/?mlat=${coordinates.latitude}&mlon=${coordinates.longitude}#map=16/${coordinates.latitude}/${coordinates.longitude}`;
    await Linking.openURL(url);
  };

  const showCenterDetails = (center: HealthCenter): void => {
    Alert.alert(center.nombre, `${center.codigo_rues} | ${center.municipio}`, [
      { text: 'Cerrar', style: 'cancel' },
      {
        text: 'Como llegar',
        onPress: () => {
          void navigateToCenter(center);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={estilos.screen}>
      <StatusBar barStyle={tema.isDark ? 'light-content' : 'dark-content'} backgroundColor={tema.colors.surface} />
      <View style={estilos.header}>
        <Text style={estilos.title}>Centros cercanos</Text>
      </View>

      <Map
        style={estilos.map}
        mapStyle={env.mapStyleUrl}
        attribution
        attributionPosition={{ bottom: 8, right: 8 }}
        compass
        onDidFinishLoadingMap={() => setMapReady(true)}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: [ORURO_KM_ZERO.longitude, ORURO_KM_ZERO.latitude],
            zoom: 13,
          }}
        />
        <Marker
          id="oruro-km-zero"
          lngLat={[ORURO_KM_ZERO.longitude, ORURO_KM_ZERO.latitude]}
          anchor="bottom"
        >
          <View style={estilos.kmZeroMarker}>
            <MaterialCommunityIcons name="star" size={16} color={tema.colors.onFill} />
          </View>
        </Marker>
        {location ? (
          <Marker
            id="current-location"
            lngLat={[location.longitude, location.latitude]}
          >
            <View style={estilos.currentLocationMarker}>
              <MaterialCommunityIcons name="crosshairs-gps" size={20} color={tema.colors.onFill} />
            </View>
          </Marker>
        ) : null}
        {mappedCenters.map(center => {
          const coordinates = centerCoordinates(center);
          if (!coordinates) return null;
          return (
            <Marker
              key={center.uuid}
              id={center.uuid}
              lngLat={[coordinates.longitude, coordinates.latitude]}
              anchor="bottom"
              onPress={() => showCenterDetails(center)}
            >
              <View style={estilos.centerMarker}>
                <MaterialCommunityIcons name="map-marker" size={42} color={tema.colors.accentText} />
              </View>
            </Marker>
          );
        })}
      </Map>

      <View style={estilos.listPanel}>
        {desdeCache ? (
          <View style={estilos.avisoCache}>
            <MaterialCommunityIcons
              name="cloud-off-outline"
              size={16}
              color={tema.colors.warningText}
            />
            <Text style={estilos.textoCache}>
              Datos guardados en el telefono
              {centersQuery.data?.actualizadoEn
                ? ` · ${new Date(centersQuery.data.actualizadoEn).toLocaleDateString()}`
                : ''}
            </Text>
          </View>
        ) : null}

        {centersQuery.isLoading ? (
          <ActivityIndicator size="large" color={tema.colors.accentText} />
        ) : diagnostico ? (
          <View style={estilos.bloqueError}>
            <MaterialCommunityIcons
              name="cloud-off-outline"
              size={34}
              color={tema.colors.textMuted}
            />
            <Text style={estilos.tituloError}>{diagnostico.titulo}</Text>
            <Text style={estilos.detalleError}>{diagnostico.detalle}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reintentar"
              style={({ pressed }) => [
                estilos.botonReintentar,
                pressed && estilos.reintentarPresionado,
              ]}
              onPress={() => {
                void centersQuery.refetch();
              }}
            >
              <Text style={estilos.textoReintentar}>
                {centersQuery.isFetching ? 'Reintentando...' : 'Reintentar'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView>
            {centers.map(center => (
              <View key={center.uuid} style={estilos.centerRow}>
                <View style={estilos.centerCopy}>
                  <Text style={estilos.centerName}>{center.nombre}</Text>
                  <Text style={estilos.centerMeta}>
                    {center.distanceKm != null
                      ? `${center.distanceKm.toFixed(1)} km | `
                      : ''}
                    {center.nivel || center.tipo || center.municipio}
                  </Text>
                  {center.direccion ? (
                    <Text numberOfLines={1} style={estilos.address}>
                      {center.direccion}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Como llegar a ${center.nombre}`}
                  style={estilos.iconButton}
                  onPress={() => navigateToCenter(center)}
                >
                  <MaterialCommunityIcons
                    name="navigation-variant"
                    size={22}
                    color={tema.colors.accentText}
                  />
                </Pressable>
              </View>
            ))}
            {!centers.length ? (
              <Text style={estilos.emptyText}>No se encontraron centros de salud.</Text>
            ) : null}
          </ScrollView>
        )}
      </View>

      <BottomTabBar active="HealthCenters" navigation={navigation} />
    </SafeAreaView>
  );
};

const crearEstilos = (tema: AppTheme) =>
  StyleSheet.create({
    avisoCache: {
      marginBottom: tema.spacing.sm,
      paddingVertical: tema.spacing.xs,
      paddingHorizontal: tema.spacing.md,
      borderRadius: tema.radius.pill,
      backgroundColor: tema.colors.warningSoft,
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: tema.spacing.xs,
    },
    textoCache: {
      ...tema.estilosTexto.caption,
      color: tema.colors.warningText,
    },
    bloqueError: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: tema.spacing.xl,
      paddingHorizontal: tema.spacing.lg,
      gap: tema.spacing.sm,
    },
    tituloError: {
      ...tema.estilosTexto.h3,
      color: tema.colors.text,
      textAlign: 'center',
    },
    detalleError: {
      ...tema.estilosTexto.body,
      fontSize: 14,
      lineHeight: 20,
      color: tema.colors.textMuted,
      textAlign: 'center',
    },
    botonReintentar: {
      marginTop: tema.spacing.sm,
      minHeight: 44,
      paddingHorizontal: tema.spacing.xl,
      borderRadius: tema.radius.pill,
      backgroundColor: tema.colors.accentFill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    reintentarPresionado: {
      opacity: 0.86,
    },
    textoReintentar: {
      ...tema.estilosTexto.bodyStrong,
      color: tema.colors.onFill,
    },
  screen: { flex: 1, backgroundColor: tema.colors.surface },
  header: {
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tema.colors.surface,
    elevation: 5,
  },
  title: { color: tema.colors.text, fontSize: 21, lineHeight: 26, fontFamily: tema.fuentes.bold },
  map: { height: '48%', width: '100%' },
  centerMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    borderColor: tema.colors.surface,
    backgroundColor: tema.mapa.centro,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  kmZeroMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: tema.colors.surface,
    backgroundColor: tema.mapa.usuario,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  listPanel: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 112,
    backgroundColor: tema.colors.surface,
  },
  centerRow: {
    minHeight: 82,
    borderBottomWidth: 1,
    borderBottomColor: tema.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  centerCopy: { flex: 1 },
  centerName: { color: tema.colors.text, fontSize: 17, lineHeight: 22, fontFamily: tema.fuentes.bold },
  centerMeta: { marginTop: 3, color: tema.colors.accentText, fontSize: 14, lineHeight: 19, fontFamily: tema.fuentes.semiBold },
  address: { marginTop: 2, color: tema.colors.textMuted, fontSize: 13, lineHeight: 18 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: tema.colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { marginTop: 28, textAlign: 'center', color: tema.colors.textMuted, fontSize: 16 },
});
