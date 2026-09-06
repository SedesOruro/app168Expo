import React, { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from 'styled-components/native';

import type { AppTheme } from '../../../../shared/theme';

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
// mas tenue por fuera. Se apilan a mano porque en Android `shadowColor` se ignora
// y no hay forma de conseguir un halo de color con la sombra nativa.
const AROS = [
  { escala: 1.38, tipo: 'tenue' as const },
  { escala: 1.16, tipo: 'superficie' as const },
];

export const CirculoSos = ({
  onPress,
  estado = 'reposo',
  etiqueta = 'EMERGENCIA',
  deshabilitado = false,
}: CirculoSosProps): ReactElement => {
  const tema = useTheme() as AppTheme;
  const estilos = crearEstilos(tema);
  const confirmado = estado === 'confirmado';

  const degradado: readonly [string, string] = confirmado
    ? [tema.colors.success, tema.colors.success]
    : [tema.colors.dangerFill, tema.colors.dangerFillDeep];

  return (
    <View style={estilos.marco}>
      {AROS.map(aro => (
        <View
          key={aro.escala}
          pointerEvents="none"
          style={[
            aro.tipo === 'tenue' ? estilos.aroTenue : estilos.aroSuperficie,
            {
              width: DIAMETRO * aro.escala,
              height: DIAMETRO * aro.escala,
              borderRadius: (DIAMETRO * aro.escala) / 2,
            },
            estado === 'presionado' && estilos.aroPresionado,
          ]}
        />
      ))}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Linea gratuita 168, pedir ayuda"
        accessibilityState={{ disabled: deshabilitado, busy: estado === 'presionado' }}
        disabled={deshabilitado}
        onPress={onPress}
        style={({ pressed }) => [
          estilos.boton,
          (pressed || estado === 'presionado') && estilos.botonPresionado,
          deshabilitado && estilos.botonDeshabilitado,
        ]}
      >
        <LinearGradient
          colors={degradado}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={estilos.degradado}
        >
          <Text style={estilos.numero}>{confirmado ? '✓' : '168'}</Text>
          <Text style={estilos.etiqueta}>{confirmado ? 'ENVIADA' : etiqueta}</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
};

const crearEstilos = (tema: AppTheme) =>
  StyleSheet.create({
    marco: {
      width: DIAMETRO * 1.38,
      height: DIAMETRO * 1.38,
      alignItems: 'center',
      justifyContent: 'center',
    },
    aroSuperficie: {
      position: 'absolute',
      backgroundColor: tema.colors.surface,
    },
    aroTenue: {
      position: 'absolute',
      backgroundColor: tema.colors.surfaceMuted,
    },
    aroPresionado: {
      backgroundColor: tema.colors.dangerGlow,
    },
    boton: {
      width: DIAMETRO,
      height: DIAMETRO,
      borderRadius: DIAMETRO / 2,
      overflow: 'hidden',
    },
    botonPresionado: {
      transform: [{ scale: 0.96 }],
    },
    botonDeshabilitado: {
      opacity: 0.5,
    },
    degradado: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    numero: {
      ...tema.estilosTexto.display,
      color: tema.colors.onFill,
      fontSize: 64,
      lineHeight: 74,
    },
    etiqueta: {
      ...tema.estilosTexto.caption,
      marginTop: 2,
      color: tema.colors.onFill,
      letterSpacing: 1.6,
    },
  });
