import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  Dashboard: undefined;
  Emergency:
    | {
        flow?: 'direct' | 'guided';
        quickAccess?: string;
      }
    | undefined;
  EmergencyType: undefined;
  Triage: undefined;
  ApiCentral: undefined;
  CaseTracking: { emergencyUuid?: string } | undefined;
  Evidence: { emergencyUuid?: string } | undefined;
  HealthCenters: undefined;
  Information: undefined;
  Profile: undefined;
  ProfileEdit: undefined;
  History: undefined;
};

export type RootStackParamList = {
  MainStack: NavigatorScreenParams<MainStackParamList>;
};
