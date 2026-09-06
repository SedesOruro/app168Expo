import React, { ReactElement } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { MainStackParamList } from '../../../../app/navigation/types';
import type { AppTheme } from '../../../../shared/theme';
import { coloresTriaje } from '../../../../shared/theme/colors';
import { BottomTabBar } from '../components/BottomTabBar';

type InformationNavigation = NativeStackNavigationProp<
  MainStackParamList,
  'Information'
>;

type NivelTriaje = {
  numero: string;
  titulo: string;
  /** Etiqueta breve de la insignia: el tiempo de espera del nivel. */
  espera: string;
  color: (typeof coloresTriaje)[keyof typeof coloresTriaje];
  texto: string;
};

const niveles: NivelTriaje[] = [
  {
    numero: '1',
    titulo: 'Resucitacion',
    espera: 'Inmediata',
    color: coloresTriaje.resucitacion,
    texto:
      'Atencion al paciente en condiciones que amenazan la vida, requiriendo una intervencion medica inmediata. Algunos ejemplos son: personas con dificultad respiratoria severa, estado de inconsciencia, convulsiones o ausencia de signos vitales.',
  },
  {
    numero: '2',
    titulo: 'Emergencia',
    espera: '10-20 min',
    color: coloresTriaje.emergencia,
    texto:
      'Vigilancia del paciente que puede respirar por si mismo, esta consciente, pero tiene un problema que amenaza la vida o perdida de una extremidad u organo. Se atiende a personas agitadas, con dolor severo y afecciones en las cuales el tiempo es critico para iniciar el tratamiento.',
  },
  {
    numero: '3',
    titulo: 'Urgencia',
    espera: 'Hasta 1 hora',
    color: coloresTriaje.urgencia,
    texto:
      'Cuidado del paciente estable en condiciones que pueden progresar hacia una emergencia. Se tratan molestias que interfieren en el trabajo o las actividades cotidianas, perdidas de sangre y dolor moderado.',
  },
  {
    numero: '4',
    titulo: 'Urgencia menor',
    espera: 'Hasta 2 horas',
    color: coloresTriaje.urgenciaMenor,
    texto:
      'Atencion al paciente en condiciones relacionadas con su edad, pero con angustia, deterioro potencial o sintomas que disminuiran con la intervencion medica o lo tranquilizaran dentro de 1 o 2 horas.',
  },
  {
    numero: '5',
    titulo: 'Sin urgencia',
    espera: 'Hasta 4 horas',
    color: coloresTriaje.sinUrgencia,
    texto:
      'Atencion al paciente en condiciones que pueden ser agudas, pero que no comprometen su estado general y no representan un riesgo evidente. Tambien se valoran problemas cronicos sin evidencia de deterioro.',
  },
];

export const InformationScreen = (): ReactElement => {
  const tema = useTheme() as AppTheme;
  const estilos = crearEstilos(tema);
  const navigation = useNavigation<InformationNavigation>();

  return (
    <SafeAreaView style={estilos.pantalla}>
      <StatusBar
        barStyle={tema.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={tema.colors.background}
      />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Text style={estilos.rotulo}>REFERENCIA CLINICA</Text>
        <Text style={estilos.titulo}>Triage Hospitalario</Text>
        <Text style={estilos.intro}>
          Sistema de seleccion y clasificacion de pacientes en los servicios de
          urgencia, segun sus necesidades terapeuticas y los recursos disponibles.
        </Text>

        <View style={estilos.filaDefiniciones}>
          <View style={[estilos.tarjetaDefinicion, estilos.bordeUrgencias]}>
            <Text style={[estilos.tituloDefinicion, estilos.tituloUrgencias]}>
              Urgencias
            </Text>
            <Text style={estilos.textoDefinicion}>
              Requiere <Text style={estilos.negrita}>asistencia medica</Text> pronta,
              sin riesgo de vida.
            </Text>
          </View>
          <View style={[estilos.tarjetaDefinicion, estilos.bordeEmergencias]}>
            <Text style={[estilos.tituloDefinicion, estilos.tituloEmergencias]}>
              Emergencias
            </Text>
            <Text style={estilos.textoDefinicion}>
              Requiere <Text style={estilos.negrita}>decisiones inmediatas</Text> por
              riesgo de vida.
            </Text>
          </View>
        </View>

        <Text style={estilos.rotuloSeccion}>DE MAYOR A MENOR PRIORIDAD</Text>

        <View style={estilos.linea}>
          {/* Hilo vertical que enlaza los niveles, por detras de los circulos. */}
          <View style={estilos.hilo} pointerEvents="none" />

          {niveles.map(nivel => (
            <View key={nivel.numero} style={estilos.fila}>
              <View style={[estilos.circulo, { backgroundColor: nivel.color.fondo }]}>
                <Text
                  style={[
                    estilos.numero,
                    {
                      color: nivel.color.textoOscuro
                        ? tema.colors.text
                        : tema.colors.onFill,
                    },
                  ]}
                >
                  {nivel.numero}
                </Text>
              </View>

              <View style={estilos.tarjetaNivel}>
                <View style={estilos.cabeceraNivel}>
                  <Text style={estilos.tituloNivel}>{nivel.titulo}</Text>
                  <View
                    style={[estilos.insignia, { backgroundColor: nivel.color.tinte }]}
                  >
                    <Text style={[estilos.textoInsignia, { color: nivel.color.texto }]}>
                      {nivel.espera}
                    </Text>
                  </View>
                </View>
                <Text style={estilos.textoNivel}>{nivel.texto}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomTabBar active="Information" navigation={navigation} />
    </SafeAreaView>
  );
};

const DIAMETRO = 34;

const crearEstilos = (tema: AppTheme) =>
  StyleSheet.create({
    pantalla: {
      flex: 1,
      backgroundColor: tema.colors.background,
    },
    contenido: {
      paddingHorizontal: tema.spacing.xl,
      paddingTop: tema.spacing.xl,
      paddingBottom: 130,
    },
    rotulo: {
      ...tema.estilosTexto.caption,
      color: tema.colors.textMuted,
      letterSpacing: 1.4,
      textAlign: 'center',
    },
    titulo: {
      ...tema.estilosTexto.h1,
      marginTop: tema.spacing.xs,
      color: tema.colors.text,
      textAlign: 'center',
    },
    intro: {
      ...tema.estilosTexto.body,
      marginTop: tema.spacing.md,
      color: tema.colors.textMuted,
      textAlign: 'center',
    },
    filaDefiniciones: {
      marginTop: tema.spacing.xl,
      flexDirection: 'row',
      gap: tema.spacing.md,
    },
    tarjetaDefinicion: {
      flex: 1,
      borderRadius: tema.radius.md,
      backgroundColor: tema.colors.surface,
      borderWidth: 1,
      borderColor: tema.colors.border,
      // La franja de color va arriba, como en la referencia.
      borderTopWidth: 4,
      padding: tema.spacing.md,
      gap: tema.spacing.xs,
    },
    bordeUrgencias: {
      borderTopColor: tema.colors.primary,
    },
    bordeEmergencias: {
      borderTopColor: tema.colors.secondary,
    },
    tituloDefinicion: {
      ...tema.estilosTexto.bodyStrong,
    },
    // Variantes oscuras: primary da 2.96 sobre blanco y secondary 4.17, ninguno
    // llega a AA como texto.
    tituloUrgencias: {
      color: tema.colors.primaryDark,
    },
    tituloEmergencias: {
      color: tema.colors.secondaryDark,
    },
    textoDefinicion: {
      ...tema.estilosTexto.caption,
      color: tema.colors.textMuted,
    },
    negrita: {
      fontFamily: tema.fuentes.bold,
      color: tema.colors.text,
    },
    rotuloSeccion: {
      ...tema.estilosTexto.caption,
      marginTop: tema.spacing.xl,
      marginBottom: tema.spacing.md,
      color: tema.colors.textMuted,
      letterSpacing: 1.2,
    },
    linea: {
      position: 'relative',
    },
    hilo: {
      position: 'absolute',
      left: DIAMETRO / 2 - 1,
      top: DIAMETRO,
      bottom: DIAMETRO / 2,
      width: 2,
      backgroundColor: tema.colors.border,
    },
    fila: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: tema.spacing.md,
      marginBottom: tema.spacing.md,
    },
    circulo: {
      width: DIAMETRO,
      height: DIAMETRO,
      borderRadius: DIAMETRO / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // 20px en negrita cuenta como texto grande, que solo pide 3.0 de contraste.
    numero: {
      fontFamily: tema.fuentes.bold,
      fontSize: 20,
      lineHeight: 24,
    },
    tarjetaNivel: {
      flex: 1,
      borderRadius: tema.radius.md,
      backgroundColor: tema.colors.surface,
      borderWidth: 1,
      borderColor: tema.colors.border,
      padding: tema.spacing.lg,
      gap: tema.spacing.sm,
    },
    cabeceraNivel: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: tema.spacing.sm,
    },
    tituloNivel: {
      ...tema.estilosTexto.h3,
      flexShrink: 1,
      color: tema.colors.text,
    },
    insignia: {
      borderRadius: tema.radius.pill,
      paddingHorizontal: tema.spacing.md,
      paddingVertical: 4,
    },
    textoInsignia: {
      ...tema.estilosTexto.caption,
      fontSize: 11,
    },
    textoNivel: {
      ...tema.estilosTexto.body,
      fontSize: 14,
      lineHeight: 20,
      color: tema.colors.textMuted,
    },
  });
