import React, { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'styled-components/native';

import type { AppTheme } from '../../../../shared/theme';

type TabKey = 'Dashboard' | 'HealthCenters' | 'History' | 'Information' | 'Profile';

type BottomTabBarProps = {
  active: TabKey;
  navigation: {
    navigate: (screen: TabKey) => void;
  };
};

type MaterialCommunityIconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>['name'];

const tabs: {
  key: TabKey;
  icon: MaterialCommunityIconName;
  label: string;
}[] = [
  { key: 'Dashboard', icon: 'home', label: 'Inicio' },
  { key: 'HealthCenters', icon: 'map-marker', label: 'Mapa' },
  { key: 'History', icon: 'clipboard-text-clock', label: 'Historial' },
  { key: 'Information', icon: 'compass', label: 'Info' },
  { key: 'Profile', icon: 'account', label: 'Perfil' },
];

/**
 * Barra inferior segun el kit: tarjeta redondeada sobre `surfaceMuted`, icono con
 * la etiqueta visible debajo, y la pestana activa marcada por el color del acento
 * en icono y texto. Antes las etiquetas estaban ocultas y la activa se senalaba con
 * una barrita superior, que el kit no usa.
 */
export const BottomTabBar = ({
  active,
  navigation,
}: BottomTabBarProps): ReactElement => {
  const tema = useTheme() as AppTheme;
  const estilos = crearEstilos(tema);

  return (
    <View style={estilos.envoltorio}>
      {tabs.map(tab => {
        const activa = tab.key === active;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: activa }}
            onPress={() => navigation.navigate(tab.key)}
            style={estilos.elemento}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={26}
              color={activa ? tema.colors.accentText : tema.colors.text}
            />
            <Text
              style={[estilos.etiqueta, activa && estilos.etiquetaActiva]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const crearEstilos = (tema: AppTheme) =>
  StyleSheet.create({
    envoltorio: {
      position: 'absolute',
      left: tema.spacing.lg,
      right: tema.spacing.lg,
      bottom: tema.spacing.xl,
      minHeight: 76,
      paddingVertical: tema.spacing.md,
      backgroundColor: tema.colors.surfaceMuted,
      borderRadius: 28,
      elevation: 7,
      shadowColor: tema.shadows.md.shadowColor,
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
    },
    elemento: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
    },
    etiqueta: {
      ...tema.estilosTexto.bodyStrong,
      fontSize: 13,
      lineHeight: 17,
      color: tema.colors.text,
    },
    etiquetaActiva: {
      color: tema.colors.accentText,
    },
  });
