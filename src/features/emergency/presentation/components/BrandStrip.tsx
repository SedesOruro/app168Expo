import React, { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const BrandStrip = (): ReactElement => (
  <View style={styles.row}>
    <View style={styles.brandBlock}>
      <View style={styles.seal} />
      <Text style={styles.govText}>GOBIERNO AUTONOMO{'\n'}DEPARTAMENTAL</Text>
    </View>
    <View style={styles.brandBlock}>
      <View style={[styles.seal, styles.multiSeal]} />
      <Text style={styles.smallText}>Gobernacion{'\n'}Cochabamba</Text>
    </View>
    <View style={styles.brandBlock}>
      <View style={[styles.seal, styles.healthSeal]} />
      <Text style={styles.sedesText}>SEDES{'\n'}Cochabamba</Text>
    </View>
  </View>
);

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
    backgroundColor: '#72B44B',
    borderWidth: 2,
    borderColor: '#E6F2D7',
  },
  multiSeal: {
    backgroundColor: '#E74545',
    borderColor: '#F6D66F',
  },
  healthSeal: {
    backgroundColor: '#6AC0E4',
    borderColor: '#D9F3FF',
  },
  govText: {
    flexShrink: 1,
    color: '#111111',
    fontSize: 7,
    lineHeight: 8,
    fontWeight: '800',
  },
  smallText: {
    flexShrink: 1,
    color: '#51758D',
    fontSize: 7,
    lineHeight: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sedesText: {
    flexShrink: 1,
    color: '#111111',
    fontSize: 10,
    lineHeight: 11,
    fontWeight: '900',
  },
});
