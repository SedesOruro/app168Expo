import React, { ReactElement, useEffect } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';

import { institucion, servicio } from '../../../../shared/constants/institucion';
import type { AppTheme } from '../../../../shared/theme';
import { BrandStrip } from '../../../emergency/presentation/components/BrandStrip';

/** Milisegundos que la presentacion permanece antes de continuar sola. */
const DURACION = 2400;

type PresentacionScreenProps = {
  onTerminar: () => void;
};

/**
 * Unico lugar de la aplicacion donde aparece el respaldo institucional. Se muestra
 * al arrancar y no vuelve: dentro de la aplicacion los sellos restan espacio y
 * atencion a lo que importa, que es pedir ayuda rapido.
 *
 * Se puede tocar para saltarla; si no, continua sola pasados DURACION ms.
 */
export const PresentacionScreen = ({
  onTerminar,
}: PresentacionScreenProps): ReactElement => {
  const tema = useTheme() as AppTheme;
  const estilos = crearEstilos(tema);

  useEffect(() => {
    const temporizador = setTimeout(onTerminar, DURACION);
    return () => clearTimeout(temporizador);
  }, [onTerminar]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Continuar"
      onPress={onTerminar}
      style={estilos.raiz}
    >
      <SafeAreaView style={estilos.raiz}>
        <StatusBar
          barStyle={tema.isDark ? 'light-content' : 'dark-content'}
          backgroundColor={tema.colors.background}
        />

        <View style={estilos.centro}>
          <Text style={estilos.numero}>{servicio.numero}</Text>
          <Text style={estilos.nombre}>{servicio.nombre}</Text>
          <Text style={estilos.descripcion}>{servicio.descripcionCorta}</Text>
        </View>

        <View style={estilos.pie}>
          <BrandStrip />
          <Text style={estilos.institucion}>
            {institucion.nombreCompleto}
            {'\n'}
            {institucion.entidadSuperior}
          </Text>
        </View>
      </SafeAreaView>
    </Pressable>
  );
};

const crearEstilos = (tema: AppTheme) =>
  StyleSheet.create({
    raiz: {
      flex: 1,
      backgroundColor: tema.colors.background,
    },
    centro: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: tema.spacing.xl,
      gap: tema.spacing.sm,
    },
    numero: {
      ...tema.estilosTexto.display,
      fontSize: 72,
      lineHeight: 82,
      color: tema.colors.dangerFill,
    },
    nombre: {
      ...tema.estilosTexto.h2,
      color: tema.colors.text,
    },
    descripcion: {
      ...tema.estilosTexto.body,
      color: tema.colors.textMuted,
      textAlign: 'center',
    },
    pie: {
      paddingHorizontal: tema.spacing.xl,
      paddingBottom: tema.spacing.xxl,
      gap: tema.spacing.md,
    },
    institucion: {
      ...tema.estilosTexto.caption,
      color: tema.colors.textMuted,
      textAlign: 'center',
    },
  });
