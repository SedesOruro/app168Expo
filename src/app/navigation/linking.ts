import type { LinkingOptions } from '@react-navigation/native';

import type { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['emergencias168://'],
  config: {
    screens: {
      MainStack: {
        screens: {
          Dashboard: 'inicio',
          Triage: 'emergencia/triage',
          CaseTracking: 'emergencia/seguimiento',
          Evidence: 'emergencia/evidencia',
          HealthCenters: 'centros-de-salud',
          History: 'historial',
          Information: 'informacion',
          Profile: 'perfil',
          ProfileEdit: 'perfil/editar',
        },
      },
    },
  },
};
