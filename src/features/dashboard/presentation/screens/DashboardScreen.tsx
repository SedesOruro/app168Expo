import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Network from 'expo-network';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'styled-components/native';

import type { MainStackParamList } from '../../../../app/navigation/types';
import type { AppTheme } from '../../../../shared/theme';
import { servicio } from '../../../../shared/constants/institucion';
import { decidirCanalDeEmergencia } from '../../../emergency/domain/decidirCanalDeEmergencia';
import { BottomTabBar } from '../../../emergency/presentation/components/BottomTabBar';
import { CirculoSos } from '../../../emergency/presentation/components/CirculoSos';
import { EmergencyFlowSteps } from '../../../emergency/presentation/components/EmergencyFlowSteps';
import { useAuth } from '../../../../app/providers/AuthProvider';

type DashboardNavigation = NativeStackNavigationProp<
  MainStackParamList,
  'Dashboard'
>;

const accesosRapidos = [
  { icon: 'ambulance', label: 'Ambulancia', tono: 'danger' },
  { icon: 'fire', label: 'Bomberos', tono: 'warning' },
  { icon: 'police-badge', label: 'Policia', tono: 'secondary' },
  { icon: 'dots-horizontal', label: 'Otro', tono: 'textMuted' },
] as const;

export const DashboardScreen = (): ReactElement => {
  const navigation = useNavigation<DashboardNavigation>();
  const { user, status, sinConexion, pedirRegistro } = useAuth();
  const tema = useTheme() as AppTheme;
  const estilos = crearEstilos(tema);
  const registrado = status === 'authenticated';
  const [sinDatos, setSinDatos] = useState(false);

  /**
   * Se consulta el estado de la red al entrar y al volver a la pantalla para que el
   * boton diga de antemano lo que va a hacer, en vez de descubrirlo tras un tiempo
   * de espera agotado con la persona esperando.
   */
  const revisarRed = useCallback(async (): Promise<void> => {
    try {
      const estado = await Network.getNetworkStateAsync();
      setSinDatos(decidirCanalDeEmergencia(estado) === 'llamada');
    } catch {
      // Si la comprobacion falla se asume que hay datos: el envio por la
      // aplicacion lleva ubicacion y perfil, y merece la pena intentarlo.
      setSinDatos(false);
    }
  }, []);

  useEffect(() => {
    void revisarRed();
    const suscripcion = Network.addNetworkStateListener(estado => {
      setSinDatos(decidirCanalDeEmergencia(estado) === 'llamada');
    });
    return () => suscripcion.remove();
  }, [revisarRed]);

  /**
   * Sin datos moviles la alerta no puede salir por la aplicacion, pero la red de
   * voz suele seguir en pie. Se ofrece marcar el 168 en vez de dejar a la persona
   * ante un envio que va a fallar.
   */
  const llamarAlServicio = (): void => {
    Alert.alert(
      'Sin conexion de datos',
      `No se puede enviar la alerta por la aplicacion. Puedes llamar al ${servicio.numero}, que funciona con la señal del telefono.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: `Llamar al ${servicio.numero}`,
          onPress: () => {
            Linking.openURL(`tel:${servicio.numero}`).catch(() =>
              Alert.alert(
                'No se pudo abrir el telefono',
                `Marca el ${servicio.numero} desde la aplicacion de llamadas.`,
              ),
            );
          },
        },
      ],
    );
  };

  /**
   * Sin cuenta no se puede emitir una alerta: la Central necesita saber a quien
   * atiende y a que numero devolver la llamada. Al pulsar se sale del modo
   * exploracion, con lo que RootNavigator devuelve al formulario de registro.
   */
  const irAEmergencia = (destino: () => void): void => {
    if (!registrado) {
      pedirRegistro().catch(() => undefined);
      return;
    }

    // Se vuelve a mirar la red en el momento de pulsar: entre que se cargo la
    // pantalla y ahora la conexion puede haberse caido.
    Network.getNetworkStateAsync()
      .then(estado => {
        if (decidirCanalDeEmergencia(estado) === 'llamada') {
          setSinDatos(true);
          llamarAlServicio();
          return;
        }
        setSinDatos(false);
        destino();
      })
      .catch(() => destino());
  };

  return (
    <SafeAreaView style={estilos.pantalla}>
      <StatusBar
        barStyle={tema.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={tema.colors.background}
      />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.estadoSuperior}>
          <View style={estilos.bloqueUbicacion}>
            <Text style={estilos.rotuloUbicacion}>Ubicacion actual</Text>
            <View style={estilos.filaUbicacion}>
              <MaterialCommunityIcons
                name="map-marker"
                size={18}
                color={tema.colors.accentText}
              />
              <Text style={estilos.textoUbicacion} numberOfLines={1}>
                Se comparte al enviar la alerta
              </Text>
            </View>
          </View>
          <Text style={estilos.saludo} numberOfLines={1}>
            {user?.name?.split(' ')[0] || 'Visitante'}
          </Text>
        </View>

        {sinConexion ? (
          <View style={estilos.avisoSinConexion}>
            <MaterialCommunityIcons
              name="cloud-off-outline"
              size={18}
              color={tema.colors.warningText}
            />
            <Text style={estilos.textoSinConexion}>
              Sin conexion con la Central. Tu registro sigue en el telefono.
            </Text>
          </View>
        ) : null}

        <Text style={estilos.titulo}>Centro de emergencias 168</Text>
        <Text style={estilos.subtitulo}>
          {registrado
            ? 'Pedir ayuda en maximo 2 taps.'
            : 'Estas explorando la aplicacion. Para pedir ayuda hay que registrarse.'}
        </Text>

        <View style={estilos.envoltorioPasos}>
          <EmergencyFlowSteps activeStep={1} />
        </View>

        <CirculoSos
          etiqueta={sinDatos ? 'LLAMAR' : 'EMERGENCIA'}
          onPress={() =>
            irAEmergencia(() =>
              navigation.navigate('Emergency', { flow: 'direct' }),
            )
          }
        />

        <Text style={estilos.textoEleccion}>Accesos rapidos</Text>

        <View style={estilos.opciones}>
          {accesosRapidos.map(acceso => (
            <Pressable
              key={acceso.label}
              accessibilityRole="button"
              accessibilityLabel={acceso.label}
              style={({ pressed }) => [estilos.chip, pressed && estilos.presionado]}
              onPress={() =>
                irAEmergencia(() =>
                  navigation.navigate('Emergency', {
                    flow: 'guided',
                    quickAccess: acceso.label,
                  }),
                )
              }
            >
              <View style={estilos.circuloIcono}>
                <MaterialCommunityIcons
                  name={acceso.icon}
                  size={18}
                  color={tema.colors[acceso.tono]}
                />
              </View>
              <Text style={estilos.textoChip}>{acceso.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={estilos.panelListo}>
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color={tema.colors.success}
          />
          <Text style={estilos.textoListo}>Estado: Listo para enviar</Text>
        </View>
      </ScrollView>

      <BottomTabBar active="Dashboard" navigation={navigation} />
    </SafeAreaView>
  );
};

const crearEstilos = (tema: AppTheme) =>
  StyleSheet.create({
    pantalla: {
      flex: 1,
      backgroundColor: tema.colors.background,
    },
    contenido: {
      paddingHorizontal: tema.spacing.xl,
      paddingTop: tema.spacing.xl,
      paddingBottom: 128,
      alignItems: 'center',
    },
    estadoSuperior: {
      width: '100%',
      marginBottom: tema.spacing.xl,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    bloqueUbicacion: {
      flexShrink: 1,
    },
    rotuloUbicacion: {
      ...tema.estilosTexto.caption,
      color: tema.colors.textMuted,
    },
    filaUbicacion: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tema.spacing.xs,
    },
    textoUbicacion: {
      ...tema.estilosTexto.bodyStrong,
      flexShrink: 1,
      color: tema.colors.text,
    },
    saludo: {
      ...tema.estilosTexto.bodyStrong,
      color: tema.colors.textMuted,
    },
    avisoSinConexion: {
      width: '100%',
      marginBottom: tema.spacing.md,
      paddingVertical: tema.spacing.sm,
      paddingHorizontal: tema.spacing.md,
      borderRadius: tema.radius.md,
      backgroundColor: tema.colors.warningSoft,
      flexDirection: 'row',
      alignItems: 'center',
      gap: tema.spacing.sm,
    },
    textoSinConexion: {
      ...tema.estilosTexto.caption,
      flex: 1,
      color: tema.colors.warningText,
    },
    titulo: {
      ...tema.estilosTexto.h1,
      color: tema.colors.text,
      textAlign: 'center',
    },
    subtitulo: {
      ...tema.estilosTexto.body,
      marginTop: tema.spacing.sm,
      color: tema.colors.textMuted,
      textAlign: 'center',
    },
    envoltorioPasos: {
      width: '100%',
      marginTop: tema.spacing.xl,
    },
    presionado: {
      opacity: 0.88,
    },
    textoEleccion: {
      ...tema.estilosTexto.h3,
      width: '100%',
      marginTop: tema.spacing.xl,
      color: tema.colors.text,
    },
    opciones: {
      width: '100%',
      marginTop: tema.spacing.lg,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: tema.spacing.sm,
    },
    chip: {
      minHeight: 44,
      borderRadius: tema.radius.pill,
      borderWidth: 1,
      borderColor: tema.colors.border,
      backgroundColor: tema.colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: tema.spacing.xs,
      paddingRight: tema.spacing.lg,
      gap: tema.spacing.sm,
    },
    circuloIcono: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: tema.colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textoChip: {
      ...tema.estilosTexto.bodyStrong,
      fontSize: 14,
      color: tema.colors.text,
    },
    panelListo: {
      width: '100%',
      marginTop: tema.spacing.xl,
      minHeight: 54,
      borderRadius: tema.radius.md,
      backgroundColor: tema.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: tema.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tema.spacing.sm,
    },
    textoListo: {
      ...tema.estilosTexto.bodyStrong,
      color: tema.colors.text,
    },
  });
