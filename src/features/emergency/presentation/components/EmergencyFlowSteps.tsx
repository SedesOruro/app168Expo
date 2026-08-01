import React, { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const RED = '#F63F5F';

const defaultSteps = ['168', 'Confirmar', 'Tipo', 'Triage', 'Central', 'Seguimiento'];

type EmergencyFlowStepsProps = {
  activeStep: number;
  labels?: string[];
};

export const EmergencyFlowSteps = ({
  activeStep,
  labels = defaultSteps,
}: EmergencyFlowStepsProps): ReactElement => (
  <View style={styles.wrap}>
    {labels.map((step, index) => {
      const stepNumber = index + 1;
      const isDone = stepNumber < activeStep;
      const isActive = stepNumber === activeStep;

      return (
        <View key={step} style={styles.stepWrap}>
          <View
            style={[
              styles.dot,
              isDone && styles.dotDone,
              isActive && styles.dotActive,
            ]}
          >
            <Text
              style={[
                styles.dotText,
                (isDone || isActive) && styles.dotTextActive,
              ]}
            >
              {stepNumber}
            </Text>
          </View>
          <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={1}>
            {step}
          </Text>
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  stepWrap: {
    flex: 1,
    alignItems: 'center',
  },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#D2D2D2',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    borderColor: RED,
    backgroundColor: RED,
  },
  dotActive: {
    borderColor: RED,
    backgroundColor: '#FF9AAE',
  },
  dotText: {
    color: '#777777',
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '900',
  },
  dotTextActive: {
    color: '#FFFFFF',
  },
  label: {
    marginTop: 5,
    color: '#777777',
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
  },
  labelActive: {
    color: RED,
    fontWeight: '900',
  },
});
