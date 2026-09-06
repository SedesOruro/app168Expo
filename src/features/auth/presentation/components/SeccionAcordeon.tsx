import React, { ReactElement, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'styled-components/native';

import type { AppTheme } from '../../../../shared/theme';

export type EstadoSeccion = 'completo' | 'en_curso' | 'sin_empezar';

type SeccionAcordeonProps = {
  numero: number;
  titulo: string;
  estado: EstadoSeccion;
  abierta: boolean;
  onAlternar: () => void;
  children: ReactNode;
};

const rotulos: Record<EstadoSeccion, string> = {
  completo: 'Completo',
  en_curso: 'En curso',
  sin_empezar: 'Sin empezar',
};

/**
 * Seccion plegable del registro. Se pueden completar en cualquier orden, por eso
 * cada una lleva su propio estado visible en la cabecera en vez de depender de un
 * asistente lineal.
 */
export const SeccionAcordeon = ({
  numero,
  titulo,
  estado,
  abierta,
  onAlternar,
  children,
}: SeccionAcordeonProps): ReactElement => {
  const tema = useTheme() as AppTheme;
  const estilos = crearEstilos(tema);
  const completo = estado === 'completo';

  return (
    <View style={[estilos.tarjeta, abierta && estilos.tarjetaAbierta]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${titulo}. ${rotulos[estado]}`}
        accessibilityState={{ expanded: abierta }}
        onPress={onAlternar}
        style={estilos.cabecera}
      >
        <View style={[estilos.indice, completo && estilos.indiceCompleto]}>
          {completo ? (
            <MaterialCommunityIcons
              name="check"
              size={18}
              color={tema.colors.onFill}
            />
          ) : (
            <Text style={estilos.textoIndice}>{numero}</Text>
          )}
        </View>

        <Text style={estilos.titulo}>{titulo}</Text>

        {abierta ? (
          <MaterialCommunityIcons
            name="chevron-up"
            size={24}
            color={tema.colors.textMuted}
          />
        ) : (
          <Text style={[estilos.estado, completo && estilos.estadoCompleto]}>
            {rotulos[estado]}
          </Text>
        )}
      </Pressable>

      {abierta ? <View style={estilos.cuerpo}>{children}</View> : null}
    </View>
  );
};

const crearEstilos = (tema: AppTheme) =>
  StyleSheet.create({
    tarjeta: {
      borderRadius: tema.radius.lg,
      backgroundColor: tema.colors.surface,
      borderWidth: 1,
      borderColor: tema.colors.border,
      overflow: 'hidden',
    },
    tarjetaAbierta: {
      borderColor: tema.colors.primary,
    },
    cabecera: {
      minHeight: 64,
      paddingHorizontal: tema.spacing.lg,
      paddingVertical: tema.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: tema.spacing.md,
    },
    indice: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: tema.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    indiceCompleto: {
      borderColor: tema.colors.success,
      backgroundColor: tema.colors.success,
    },
    textoIndice: {
      ...tema.estilosTexto.caption,
      color: tema.colors.textMuted,
    },
    titulo: {
      ...tema.estilosTexto.bodyStrong,
      flex: 1,
      color: tema.colors.text,
    },
    estado: {
      ...tema.estilosTexto.caption,
      color: tema.colors.textMuted,
    },
    estadoCompleto: {
      color: tema.colors.primaryDark,
    },
    cuerpo: {
      paddingHorizontal: tema.spacing.lg,
      paddingBottom: tema.spacing.lg,
      gap: tema.spacing.md,
    },
  });
