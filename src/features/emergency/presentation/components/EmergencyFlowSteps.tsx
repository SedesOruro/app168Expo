import React, { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'styled-components/native';

import type { AppTheme } from '../../../../shared/theme';

const defaultSteps = ['168', 'Confirmar', 'Tipo', 'Triage', 'Central', 'Seguimiento'];

type EmergencyFlowStepsProps = {
  activeStep: number;
  labels?: string[];
};

export const EmergencyFlowSteps = ({
  activeStep,
  labels = defaultSteps,
}: EmergencyFlowStepsProps): ReactElement => {
  const tema = useTheme() as AppTheme;
  const estilos = crearEstilos(tema);

  return (
    <View style={estilos.envoltorio}>
      {labels.map((step, index) => {
        const stepNumber = index + 1;
        const isDone = stepNumber < activeStep;
        const isActive = stepNumber === activeStep;

        return (
          <View key={step} style={estilos.envoltorioPaso}>
            <View
              style={[
                estilos.punto,
                isDone && estilos.puntoHecho,
                isActive && estilos.puntoActivo,
              ]}
            >
              <Text
                style={[
                  estilos.textoPunto,
                  (isDone || isActive) && estilos.textoPuntoActivo,
                ]}
              >
                {stepNumber}
              </Text>
            </View>
            <Text
              style={[estilos.etiqueta, isActive && estilos.etiquetaActiva]}
              numberOfLines={1}
            >
              {step}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const crearEstilos = (tema: AppTheme) =>
  StyleSheet.create({
    envoltorio: {
      width: '100%',
      marginBottom: tema.spacing.xl,
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: tema.spacing.xs,
    },
    envoltorioPaso: {
      flex: 1,
      alignItems: 'center',
    },
    punto: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: tema.colors.border,
      backgroundColor: tema.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    puntoHecho: {
      borderColor: tema.colors.accent,
      backgroundColor: tema.colors.accent,
    },
    // El paso en curso se rellena igual que los completados y se distingue por el
    // aro, no por un tono intermedio: asi el numero en blanco siempre contrasta.
    puntoActivo: {
      borderWidth: 3,
      borderColor: tema.colors.surface,
      backgroundColor: tema.colors.accent,
    },
    textoPunto: {
      ...tema.estilosTexto.caption,
      fontSize: 12,
      lineHeight: 15,
      color: tema.colors.textMuted,
    },
    textoPuntoActivo: {
      color: tema.colors.onFill,
    },
    etiqueta: {
      ...tema.estilosTexto.caption,
      marginTop: tema.spacing.xs,
      fontSize: 10,
      lineHeight: 13,
      color: tema.colors.textMuted,
    },
    etiquetaActiva: {
      color: tema.colors.accentText,
    },
  });
