import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import {
  Alert,
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
import { llamarDirecto } from '../../../emergency/data/llamadaDirecta';
import { useEmergencyFlow } from '../../../emergency/presentation/providers/EmergencyFlowProvider';
import { useAuth } from '../../../../app/providers/AuthProvider';

type DashboardNavigation = NativeStackNavigationProp<
  MainStackParamList,
  'Dashboard'
>;

export const DashboardScreen = (): ReactElement => {
  const navigation = useNavigation<DashboardNavigation>();
  const { user, status, sinConexion, pedirRegistro } = useAuth();
  const { registrarAlerta } = useEmergencyFlow();
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
   * El boton es otra forma de llamar al 168: la llamada sale de inmediato, sin
   * pasos previos. Con cuenta y datos moviles, ademas se registra la alerta con
   * la ubicacion mientras se habla, y al volver de la llamada la app espera en
   * el triage para completar los datos. Sin datos la llamada basta por si sola.
   */
  const pedirAyuda = async (): Promise<void> => {
    // La llamada va primero y se espera a que salga antes de pedir la
    // ubicacion, para que los dos dialogos de permiso no se pisen.
    try {
      await llamarDirecto(servicio.numero);
    } catch {
      Alert.alert(
        'No se pudo iniciar la llamada',
        `Marca el ${servicio.numero} desde la aplicacion de llamadas.`,
      );
    }
    if (!registrado) return;

    let hayDatos = true;
    try {
      hayDatos = decidirCanalDeEmergencia(await Network.getNetworkStateAsync()) === 'app';
    } catch {
      // Ante la duda se intenta el registro: si falla, la llamada ya salio.
    }
    setSinDatos(!hayDatos);
    if (!hayDatos) return;

    void registrarAlerta();
    navigation.navigate('Triage');
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
          {registrado && !sinDatos
            ? 'Un toque llama al 168. Despues puedes completar los datos.'
            : 'Un toque llama al 168, como una llamada normal.'}
        </Text>

        <View style={estilos.envoltorioBoton}>
          <CirculoSos etiqueta="LLAMAR 168" onPress={() => void pedirAyuda()} />
        </View>

        {!registrado ? (
          <Text
            accessibilityRole="link"
            style={estilos.enlaceRegistro}
            onPress={() => pedirRegistro().catch(() => undefined)}
          >
            Registrate para que la central reciba tu ubicacion y tu perfil medico.
          </Text>
        ) : null}

        <View style={estilos.panelListo}>
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color={tema.colors.success}
          />
          <Text style={estilos.textoListo}>Estado: Listo para llamar</Text>
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
    envoltorioBoton: {
      marginTop: tema.spacing.xl,
    },
    enlaceRegistro: {
      ...tema.estilosTexto.bodyStrong,
      marginTop: tema.spacing.xl,
      color: tema.colors.accentText,
      textAlign: 'center',
      textDecorationLine: 'underline',
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
