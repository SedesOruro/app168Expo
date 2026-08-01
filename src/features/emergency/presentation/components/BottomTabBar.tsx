import React, { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type TabKey = 'Dashboard' | 'HealthCenters' | 'History' | 'Information' | 'Profile';

type BottomTabBarProps = {
  active: TabKey;
  navigation: {
    navigate: (screen: TabKey) => void;
  };
};

type MaterialCommunityIconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>['name'];

const tabs: {
  key: TabKey;
  icon: MaterialCommunityIconName;
  label: string;
}[] = [
  { key: 'Dashboard', icon: 'home', label: 'Inicio' },
  { key: 'HealthCenters', icon: 'map', label: 'Mapa' },
  { key: 'History', icon: 'clipboard-text-clock', label: 'Historial' },
  { key: 'Information', icon: 'information', label: 'Info' },
  { key: 'Profile', icon: 'account-circle', label: 'Perfil' },
];

export const BottomTabBar = ({
  active,
  navigation,
}: BottomTabBarProps): ReactElement => (
  <View style={styles.wrap}>
    {tabs.map(tab => {
      const isActive = tab.key === active;

      return (
        <Pressable
          key={tab.key}
          accessibilityRole="button"
          accessibilityLabel={tab.label}
          onPress={() => navigation.navigate(tab.key)}
          style={styles.item}
        >
          <View style={[styles.marker, isActive && styles.markerActive]} />
          <MaterialCommunityIcons
            name={tab.icon}
            size={32}
            color={isActive ? '#F63F5F' : '#6A6A6A'}
          />
          <Text style={styles.hiddenLabel}>{tab.label}</Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 26,
    height: 74,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CFCFCF',
    elevation: 7,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  item: {
    width: 62,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    position: 'absolute',
    top: 0,
    width: 44,
    height: 5,
    backgroundColor: 'transparent',
  },
  markerActive: {
    backgroundColor: '#F63F5F',
  },
  hiddenLabel: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
