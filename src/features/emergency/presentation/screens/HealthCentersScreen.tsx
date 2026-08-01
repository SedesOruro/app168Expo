import React, { ReactElement } from 'react';
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { MainStackParamList } from '../../../../app/navigation/types';
import { BottomTabBar } from '../components/BottomTabBar';

type HealthCentersNavigation = NativeStackNavigationProp<
  MainStackParamList,
  'HealthCenters'
>;

const RED = '#F63F5F';

const hospitals = [
  { top: 28, left: 84 },
  { top: 74, right: 42 },
  { top: 172, left: 52 },
  { top: 212, right: 86 },
  { top: 312, left: 154 },
];

const centers = [
  {
    name: 'Hospital General',
    distance: '1.2 km',
    detail: 'Emergencias 24h',
  },
  {
    name: 'Centro Norte',
    distance: '2.4 km',
    detail: 'Atencion inmediata',
  },
  {
    name: 'Clinica Los Olivos',
    distance: '3.1 km',
    detail: 'Trauma y observacion',
  },
];

export const HealthCentersScreen = (): ReactElement => {
  const navigation = useNavigation<HealthCentersNavigation>();

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Text style={styles.title}>Centros cercanos</Text>
      </View>

      <View style={styles.map}>
        <View style={styles.gridLayer}>
          {Array.from({ length: 10 }).map((_, index) => (
            <View
              key={`v-${index}`}
              style={[styles.streetVertical, { left: index * 46 }]}
            />
          ))}
          {Array.from({ length: 10 }).map((_, index) => (
            <View
              key={`h-${index}`}
              style={[styles.streetHorizontal, { top: index * 48 }]}
            />
          ))}
        </View>
        <View style={[styles.road, styles.roadOne]} />
        <View style={[styles.road, styles.roadTwo]} />
        <View style={[styles.greenArea, styles.greenTop]} />
        <View style={[styles.greenArea, styles.greenBottom]} />
        <Text style={[styles.mapLabel, styles.labelTop]}>Avenida Siglo XX</Text>
        <Text style={[styles.mapLabel, styles.labelCenter]}>Zona Norte</Text>

        {hospitals.map(pin => (
          <View key={`${pin.top}-${pin.left}-${pin.right}`} style={[styles.pin, pin]}>
            <MaterialCommunityIcons name="map-marker" size={50} color="#C80030" />
            <Text style={styles.pinLetter}>H</Text>
          </View>
        ))}

        <View style={styles.currentPin}>
          <MaterialCommunityIcons name="map-marker" size={58} color="#1D99CC" />
          <Text style={styles.currentLetter}>C</Text>
        </View>
      </View>

      <View style={styles.listPanel}>
        {centers.map(center => (
          <View key={center.name} style={styles.centerRow}>
            <View style={styles.centerCopy}>
              <Text style={styles.centerName}>{center.name}</Text>
              <Text style={styles.centerMeta}>
                {center.distance} | {center.detail}
              </Text>
            </View>
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" style={styles.iconButton}>
                <MaterialCommunityIcons name="navigation-variant" size={22} color={RED} />
              </Pressable>
              <Pressable accessibilityRole="button" style={styles.iconButton}>
                <MaterialCommunityIcons name="phone" size={22} color={RED} />
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      <BottomTabBar active="HealthCenters" navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    elevation: 5,
  },
  title: {
    color: '#2F2F2F',
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '800',
  },
  map: {
    height: 420,
    overflow: 'hidden',
    backgroundColor: '#EFEADD',
  },
  gridLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  streetVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#FFFFFF',
    opacity: 0.75,
    transform: [{ rotate: '18deg' }],
  },
  streetHorizontal: {
    position: 'absolute',
    left: -40,
    right: -40,
    height: 3,
    backgroundColor: '#FFFFFF',
    opacity: 0.75,
    transform: [{ rotate: '-12deg' }],
  },
  road: {
    position: 'absolute',
    height: 20,
    width: 620,
    backgroundColor: '#E99C86',
    borderWidth: 2,
    borderColor: '#F3E4BD',
  },
  roadOne: {
    top: 108,
    left: -84,
    transform: [{ rotate: '14deg' }],
  },
  roadTwo: {
    top: 280,
    left: -120,
    transform: [{ rotate: '-28deg' }],
  },
  greenArea: {
    position: 'absolute',
    width: 210,
    height: 140,
    backgroundColor: '#B7D9A8',
    opacity: 0.72,
    borderRadius: 70,
  },
  greenTop: {
    top: 128,
    left: 134,
  },
  greenBottom: {
    bottom: 22,
    right: -48,
  },
  mapLabel: {
    position: 'absolute',
    color: '#8A7F61',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
  },
  labelTop: {
    top: 82,
    right: 32,
    color: '#AA6F65',
    transform: [{ rotate: '13deg' }],
  },
  labelCenter: {
    top: 202,
    left: 186,
  },
  pin: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinLetter: {
    position: 'absolute',
    top: 10,
    color: '#C80030',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
    backgroundColor: '#FFFFFF',
  },
  currentPin: {
    position: 'absolute',
    top: 176,
    left: 218,
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLetter: {
    position: 'absolute',
    top: 13,
    color: '#1D99CC',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',
    backgroundColor: '#FFFFFF',
  },
  listPanel: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 118,
    backgroundColor: '#FFFFFF',
  },
  centerRow: {
    minHeight: 72,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  centerCopy: {
    flex: 1,
  },
  centerName: {
    color: '#303030',
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
  },
  centerMeta: {
    marginTop: 4,
    color: '#666666',
    fontSize: 14,
    lineHeight: 19,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFE8EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
