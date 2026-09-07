import React, { ReactElement, useEffect } from 'react';
import { Image, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';

import { logosInstitucionales } from '../../../../shared/assets/logos';
import { institucion, servicio } from '../../../../shared/constants/institucion';
import type { AppTheme } from '../../../../shared/theme';

/** Milisegundos que la presentacion permanece antes de continuar sola. */
const DURACION = 2800;

type PresentacionScreenProps = {
  onTerminar: () => void;
};

/**
 * Unico lugar de la aplicacion donde aparece el respaldo institucional. Se muestra
 * al arrancar y no vuelve: dentro de la aplicacion los sellos restan espacio y
 * atencion a lo que importa, que es pedir ayuda rapido.
 *
 * Reparto: los respaldos departamentales arriba, el sello del servicio que opera la
 * linea al centro junto al nombre de la aplicacion, y la entidad al pie.
 *
 * Los sellos se apoyan sobre una placa clara porque estan disenados para papel
 * blanco; asi se leen igual con la aplicacion en claro o en oscuro.
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

        <View style={estilos.franjaSuperior}>
          <View style={estilos.placa}>
            <Image
              source={logosInstitucionales.sedes.fuente}
              style={estilos.selloSuperior}
              resizeMode="contain"
              accessibilityLabel={logosInstitucionales.sedes.titulo}
            />
          </View>
        </View>

        <View style={estilos.centro}>
          <View style={estilos.placaCentral}>
            <Image
              source={logosInstitucionales.coordinacionRedes.fuente}
              style={estilos.selloCentral}
              resizeMode="contain"
              accessibilityLabel={logosInstitucionales.coordinacionRedes.titulo}
            />
          </View>

          <Text style={estilos.numero}>{servicio.numero}</Text>
          <Text style={estilos.nombre}>{servicio.nombre}</Text>
          <Text style={estilos.descripcion}>{servicio.descripcionCorta}</Text>
        </View>

        <View style={estilos.pie}>
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
    franjaSuperior: {
      paddingTop: tema.spacing.xl,
      paddingHorizontal: tema.spacing.xl,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tema.spacing.md,
    },
    placa: {
      padding: tema.spacing.sm,
      borderRadius: tema.radius.md,
      backgroundColor: tema.colors.onFill,
    },
    selloSuperior: {
      width: 76,
      height: 76,
    },
    centro: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: tema.spacing.xl,
      gap: tema.spacing.sm,
    },
    placaCentral: {
      marginBottom: tema.spacing.lg,
      padding: tema.spacing.md,
      borderRadius: tema.radius.pill,
      backgroundColor: tema.colors.onFill,
    },
    selloCentral: {
      width: 132,
      height: 132,
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
    },
    institucion: {
      ...tema.estilosTexto.caption,
      color: tema.colors.textMuted,
      textAlign: 'center',
    },
  });
