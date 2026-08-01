import React, { ReactElement, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { MainStackParamList } from '../../../../app/navigation/types';
import { BrandStrip } from '../components/BrandStrip';
import { BottomTabBar } from '../components/BottomTabBar';

type InformationNavigation = NativeStackNavigationProp<
  MainStackParamList,
  'Information'
>;

const RED = '#F63F5F';

const triageLevels = [
  {
    number: '1',
    title: 'Resucitación',
    subtitle: 'Atención inmediata',
    color: '#F02F35',
    text: 'Atención al paciente en condiciones que amenazan la vida, requiriendo una intervención médica inmediata. Algunos ejemplos son: Personas con dificultad respiratoria severa, estado de inconsciencia, convulsiones o ausencia de signos vitales.',
  },
  {
    number: '2',
    title: 'Emergencia',
    subtitle: 'Espera de 10 a 20 minutos',
    color: '#FF842D',
    text: 'Vigilancia del paciente que puede respirar por si mismo, esta consciente, pero tiene un problema que amenaza la vida o perdida de una extremidad u organo. Se atiende a personas agitadas, con dolor severo y afecciones en las cuales el tiempo es critico para iniciar el tratamiento.',
  },
  {
    number: '3',
    title: 'Urgencia',
    subtitle: 'Espera de hasta 1 hora',
    color: '#FFD22C',
    darkText: true,
    text: 'Cuidado del paciente estable en condiciones que pueden progresar hacia una emergencia. Se tratan molestias que interfieren en el trabajo o las actividades cotidianas, perdidas de sangre y dolor moderado.',
  },
  {
    number: '4',
    title: 'Urgencia menor',
    subtitle: 'Espera de hasta 2 horas',
    color: '#08AF61',
    text: 'Atencion al paciente en condiciones relacionadas con su edad, pero con angustia, deterioro potencial o sintomas que disminuiran con la intervencion medica o lo tranquilizaran dentro de 1 o 2 horas.',
  },
  {
    number: '5',
    title: 'Sin urgencia',
    subtitle: 'Espera de hasta 4 horas',
    color: '#4353B7',
    text: 'Atencion al paciente en condiciones que pueden ser agudas, pero que no comprometen su estado general y no representan un riesgo evidente. Tambien se valoran problemas cronicos sin evidencia de deterioro.',
  },
];

export const InformationScreen = (): ReactElement => {
  const navigation = useNavigation<InformationNavigation>();
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({
    '1': true,
  });

  const toggleLevel = (number: string): void => {
    setExpandedLevels(current => ({
      ...current,
      [number]: !current[number],
    }));
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.content}>
        <BrandStrip />
        <Text style={styles.title}>Triage Hospitalario</Text>
        <Text style={styles.intro}>
          Un sistema de seleccion y clasificacion de pacientes en los servicios
          de urgencia, basado en sus necesidades terapeuticas y los recursos
          disponibles para atenderlos.
        </Text>

        <View style={styles.definitionRow}>
          <View style={styles.definitionCard}>
            <Text style={styles.definitionTitle}>Urgencias</Text>
            <Text style={styles.definitionText}>
              Refieren a una situacion en donde se requiere{' '}
              <Text style={styles.bold}>asistencia medica</Text> en un lapso
              reducido de tiempo, pero esto no implica riesgo en la vida.
            </Text>
          </View>
          <View style={styles.definitionCard}>
            <Text style={styles.definitionTitle}>Emergencias</Text>
            <Text style={styles.definitionText}>
              Todas aquellas situaciones en las que se requieren acciones y{' '}
              <Text style={styles.bold}>decisiones medicas</Text> inmediatas
              por el riesgo de vida de los involucrados.
            </Text>
          </View>
        </View>

        {triageLevels.map(level => {
          const isExpanded = Boolean(expandedLevels[level.number]);

          return (
          <Pressable
            key={level.number}
            accessibilityRole="button"
            accessibilityLabel={`${level.title}. ${isExpanded ? 'Contraer' : 'Expandir'}`}
            onPress={() => toggleLevel(level.number)}
            style={[
              styles.triageCard,
              !isExpanded && styles.triageCardCollapsed,
              { backgroundColor: level.color },
            ]}
          >
            <View style={styles.triageHeader}>
              <View style={styles.levelCircle}>
                <Text style={[styles.levelNumber, { color: level.color }]}>
                  {level.number}
                </Text>
              </View>
              <View>
                <Text
                  style={[
                    styles.triageTitle,
                    !isExpanded && styles.triageTitleCompact,
                    level.darkText && styles.triageTextDark,
                  ]}
                >
                  {level.title}
                </Text>
                <Text
                  style={[
                    styles.triageSubtitle,
                    level.darkText && styles.triageTextDark,
                  ]}
                >
                  {level.subtitle}
                </Text>
              </View>
            </View>
            {isExpanded ? (
              <View style={styles.triageTextBox}>
                <Text
                  style={[
                    styles.triageText,
                    level.darkText && styles.triageTextDark,
                  ]}
                >
                  {level.text}
                </Text>
              </View>
            ) : null}
          </Pressable>
          );
        })}
      </ScrollView>
      <BottomTabBar active="Information" navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 26,
    paddingTop: 28,
    paddingBottom: 130,
  },
  title: {
    marginTop: 34,
    color: RED,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    textAlign: 'center',
  },
  intro: {
    marginTop: 28,
    color: '#222222',
    fontSize: 19,
    lineHeight: 25,
    textAlign: 'center',
  },
  definitionRow: {
    marginTop: 40,
    flexDirection: 'row',
    gap: 28,
  },
  definitionCard: {
    flex: 1,
    minHeight: 236,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: RED,
    paddingHorizontal: 14,
    paddingVertical: 28,
    alignItems: 'center',
  },
  definitionTitle: {
    color: RED,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  definitionText: {
    marginTop: 20,
    color: '#333333',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  bold: {
    fontWeight: '900',
  },
  triageCard: {
    marginTop: 42,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  triageCardCollapsed: {
    marginTop: 16,
    paddingVertical: 26,
  },
  triageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  levelCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
  },
  triageTitle: {
    color: '#FFFFFF',
    fontSize: 36,
    lineHeight: 42,
  },
  triageTitleCompact: {
    fontSize: 34,
    lineHeight: 40,
  },
  triageSubtitle: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  triageTextBox: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    padding: 18,
  },
  triageText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 21,
    textAlign: 'center',
    fontWeight: '700',
  },
  triageTextDark: {
    color: '#000000',
  },
});
