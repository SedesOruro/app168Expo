import React, { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { franjaInstitucional } from '../../../../shared/constants/institucion';

/**
 * Franja de respaldo institucional. Los sellos son marcadores de posicion:
 * cuando esten disponibles los archivos oficiales se sustituyen por <Image>
 * sin tocar la estructura ni los textos.
 */
export const BrandStrip = (): ReactElement => (
  <View style={styles.row}>
    {franjaInstitucional.map((entidad) => (
      <View key={entidad.id} style={styles.brandBlock}>
        <View style={[styles.seal, sellos[entidad.id]]} />
        <Text
          style={[styles.brandText, entidad.id === 'sedes' && styles.sedesText]}
          numberOfLines={2}
        >
          {entidad.titulo}
          {'\n'}
          {entidad.subtitulo}
        </Text>
      </View>
    ))}
  </View>
);

const sellos = StyleSheet.create({
  gobernacion: {
    backgroundColor: '#72B44B',
    borderColor: '#E6F2D7',
  },
  ministerio: {
    backgroundColor: '#E74545',
    borderColor: '#F6D66F',
  },
  sedes: {
    backgroundColor: '#6AC0E4',
    borderColor: '#D9F3FF',
  },
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  brandBlock: {
    flex: 1,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  seal: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 2,
  },
  brandText: {
    flexShrink: 1,
    color: '#111111',
    fontSize: 7,
    lineHeight: 8,
    fontWeight: '800',
  },
  sedesText: {
    fontSize: 10,
    lineHeight: 11,
    fontWeight: '900',
  },
});
