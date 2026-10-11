import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: { email?: string } | undefined;
  Register: undefined;
};

export type MainStackParamList = {
  Dashboard: undefined;
  Triage: undefined;
  CaseTracking: { emergencyUuid?: string } | undefined;
  Evidence: { emergencyUuid?: string } | undefined;
  HealthCenters: undefined;
  Information: undefined;
  Profile: undefined;
  ProfileEdit: undefined;
  ChangePassword: undefined;
  History: undefined;
};

export type RootStackParamList = {
  MainStack: NavigatorScreenParams<MainStackParamList>;
};
