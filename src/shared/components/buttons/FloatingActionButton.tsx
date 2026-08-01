import React, { ReactElement } from 'react';
import { FAB } from 'react-native-paper';

type FloatingActionButtonProps = {
  icon: string;
  label: string;
  onPress: () => void;
};

export const FloatingActionButton = ({
  icon,
  label,
  onPress,
}: FloatingActionButtonProps): ReactElement => (
  <FAB
    accessibilityLabel={label}
    icon={icon}
    label={label}
    onPress={onPress}
  />
);
