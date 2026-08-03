import React, {
  ReactElement,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import type { Coordinates, EmergencyRecord } from '../../data/EmergencyApi';

export type EmergencyDraft = {
  flow: 'direct' | 'guided';
  canSpeak: boolean;
  typeCode: string;
  severity: string;
  triage: Record<string, string>;
  location: Coordinates | null;
};

const initialDraft: EmergencyDraft = {
  flow: 'guided',
  canSpeak: true,
  typeCode: 'MEDICA',
  severity: 'ALTA',
  triage: { breathing: 'NO_SE', conscious: 'NO_SE', danger: 'NO_SE' },
  location: null,
};

type EmergencyFlowContextValue = {
  draft: EmergencyDraft;
  currentEmergency: EmergencyRecord | null;
  updateDraft: (changes: Partial<EmergencyDraft>) => void;
  setCurrentEmergency: (emergency: EmergencyRecord | null) => void;
  resetDraft: () => void;
};

const EmergencyFlowContext = createContext<EmergencyFlowContextValue | undefined>(
  undefined,
);

export const EmergencyFlowProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const [draft, setDraft] = useState<EmergencyDraft>(initialDraft);
  const [currentEmergency, setCurrentEmergency] =
    useState<EmergencyRecord | null>(null);
  const updateDraft = useCallback((changes: Partial<EmergencyDraft>) => {
    setDraft(current => ({ ...current, ...changes }));
  }, []);
  const resetDraft = useCallback(() => setDraft(initialDraft), []);
  const value = useMemo(
    () => ({
      draft,
      currentEmergency,
      updateDraft,
      setCurrentEmergency,
      resetDraft,
    }),
    [currentEmergency, draft, resetDraft, updateDraft],
  );
  return (
    <EmergencyFlowContext.Provider value={value}>
      {children}
    </EmergencyFlowContext.Provider>
  );
};

export const useEmergencyFlow = (): EmergencyFlowContextValue => {
  const context = useContext(EmergencyFlowContext);
  if (!context) {
    throw new Error('useEmergencyFlow must be used inside EmergencyFlowProvider');
  }
  return context;
};
