import React, { ReactElement } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DashboardScreen } from '../../features/dashboard/presentation/screens/DashboardScreen';
import { ApiCentralScreen } from '../../features/emergency/presentation/screens/ApiCentralScreen';
import { CaseTrackingScreen } from '../../features/emergency/presentation/screens/CaseTrackingScreen';
import { EmergencyScreen } from '../../features/emergency/presentation/screens/EmergencyScreen';
import { EmergencyTypeScreen } from '../../features/emergency/presentation/screens/EmergencyTypeScreen';
import { EvidenceScreen } from '../../features/emergency/presentation/screens/EvidenceScreen';
import { HealthCentersScreen } from '../../features/emergency/presentation/screens/HealthCentersScreen';
import { HistoryScreen } from '../../features/emergency/presentation/screens/HistoryScreen';
import { InformationScreen } from '../../features/emergency/presentation/screens/InformationScreen';
import { ProfileEditScreen } from '../../features/emergency/presentation/screens/ProfileEditScreen';
import { ProfileScreen } from '../../features/emergency/presentation/screens/ProfileScreen';
import { TriageScreen } from '../../features/emergency/presentation/screens/TriageScreen';
import type { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator = (): ReactElement => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen name="Emergency" component={EmergencyScreen} />
    <Stack.Screen name="EmergencyType" component={EmergencyTypeScreen} />
    <Stack.Screen name="Triage" component={TriageScreen} />
    <Stack.Screen name="ApiCentral" component={ApiCentralScreen} />
    <Stack.Screen name="CaseTracking" component={CaseTrackingScreen} />
    <Stack.Screen name="Evidence" component={EvidenceScreen} />
    <Stack.Screen name="HealthCenters" component={HealthCentersScreen} />
    <Stack.Screen name="Information" component={InformationScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
    <Stack.Screen name="History" component={HistoryScreen} />
  </Stack.Navigator>
);
