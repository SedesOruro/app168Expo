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
import { env } from '../../../../shared/config/env';
import { BottomTabBar } from '../components/BottomTabBar';
import { emergencyApi, type Coordinates, type HealthCenter } from '../../data/EmergencyApi';
import { getCurrentCoordinates } from '../../data/locationService';

type HealthCentersNavigation = NativeStackNavigationProp<
  MainStackParamList,
  'HealthCenters'
>;

const RED = '#F63F5F';
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
    queryFn: () => emergencyApi.getHealthCenters(ORURO_KM_ZERO),
  });
  const centers = centersQuery.data ?? [];
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
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Text style={styles.title}>Centros cercanos</Text>
      </View>

      <Map
        style={styles.map}
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
          <View style={styles.kmZeroMarker}>
            <MaterialCommunityIcons name="star" size={16} color="#FFFFFF" />
          </View>
        </Marker>
        {location ? (
          <Marker
            id="current-location"
            lngLat={[location.longitude, location.latitude]}
          >
            <View style={styles.currentLocationMarker}>
              <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#FFFFFF" />
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
              <View style={styles.centerMarker}>
                <MaterialCommunityIcons name="map-marker" size={42} color={RED} />
              </View>
            </Marker>
          );
        })}
      </Map>

      <View style={styles.listPanel}>
        {centersQuery.isLoading ? (
          <ActivityIndicator size="large" color={RED} />
        ) : (
          <ScrollView>
            {centers.map(center => (
              <View key={center.uuid} style={styles.centerRow}>
                <View style={styles.centerCopy}>
                  <Text style={styles.centerName}>{center.nombre}</Text>
                  <Text style={styles.centerMeta}>
                    {center.distanceKm != null
                      ? `${center.distanceKm.toFixed(1)} km | `
                      : ''}
                    {center.nivel || center.tipo || center.municipio}
                  </Text>
                  {center.direccion ? (
                    <Text numberOfLines={1} style={styles.address}>
                      {center.direccion}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Como llegar a ${center.nombre}`}
                  style={styles.iconButton}
                  onPress={() => navigateToCenter(center)}
                >
                  <MaterialCommunityIcons
                    name="navigation-variant"
                    size={22}
                    color={RED}
                  />
                </Pressable>
              </View>
            ))}
            {!centers.length ? (
              <Text style={styles.emptyText}>No se encontraron centros de salud.</Text>
            ) : null}
          </ScrollView>
        )}
      </View>

      <BottomTabBar active="HealthCenters" navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    elevation: 5,
  },
  title: { color: '#2F2F2F', fontSize: 21, lineHeight: 26, fontWeight: '800' },
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
    borderColor: '#FFFFFF',
    backgroundColor: '#1D99CC',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  kmZeroMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#173B72',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  listPanel: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 112,
    backgroundColor: '#FFFFFF',
  },
  centerRow: {
    minHeight: 82,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  centerCopy: { flex: 1 },
  centerName: { color: '#303030', fontSize: 17, lineHeight: 22, fontWeight: '900' },
  centerMeta: { marginTop: 3, color: RED, fontSize: 14, lineHeight: 19, fontWeight: '700' },
  address: { marginTop: 2, color: '#666666', fontSize: 13, lineHeight: 18 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFE8EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { marginTop: 28, textAlign: 'center', color: '#666666', fontSize: 16 },
});
