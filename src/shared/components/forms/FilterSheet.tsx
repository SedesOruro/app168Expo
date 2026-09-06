import React, { ReactElement } from 'react';
import { Modal } from 'react-native';
import { MaterialIcons as MaterialIcon } from '@expo/vector-icons';
import styled, { useTheme } from 'styled-components/native';

import type { AppTheme } from '../../theme';

import { PrimaryButton } from '../buttons/PrimaryButton';
import type { FilterSection, SelectedFilters } from '../../types/filters';

type FilterSheetProps = {
  visible: boolean;
  title: string;
  sections: FilterSection[];
  selectedFilters: SelectedFilters;
  onSelect: (sectionId: string, value: string) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
};

const Backdrop = styled.Pressable`
  flex: 1;
  justify-content: flex-end;
  background-color: ${({ theme }) => theme.colors.overlay};
`;

const Sheet = styled.View`
  border-top-left-radius: ${({ theme }) => theme.radius.xl}px;
  border-top-right-radius: ${({ theme }) => theme.radius.xl}px;
  padding: ${({ theme }) => theme.spacing.xl}px;
  background-color: ${({ theme }) => theme.colors.background};
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Title = styled.Text`
  flex: 1;
  ${({ theme }) => theme.typography.h2};
  color: ${({ theme }) => theme.colors.text};
`;

const CloseButton = styled.Pressable`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
`;

const SectionTitle = styled.Text`
  ${({ theme }) => theme.typography.bodyStrong};
  color: ${({ theme }) => theme.colors.text};
`;

const Chips = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const Chip = styled.Pressable<{ $active: boolean }>`
  min-height: 40px;
  border-radius: ${({ theme }) => theme.radius.pill}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.lg}px;
  justify-content: center;
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.border};
`;

const ChipText = styled.Text<{ $active: boolean }>`
  ${({ theme }) => theme.typography.caption};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.textInverse : theme.colors.text};
`;

const Actions = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const ActionCell = styled.View`
  flex: 1;
`;

export const FilterSheet = ({
  visible,
  title,
  sections,
  selectedFilters,
  onSelect,
  onApply,
  onReset,
  onClose,
}: FilterSheetProps): ReactElement => {
  const tema = useTheme() as AppTheme;

  return (
  <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
    <Backdrop accessibilityLabel="Close filters" onPress={onClose}>
      <Sheet onStartShouldSetResponder={() => true}>
        <Header>
          <Title>{title}</Title>
          <CloseButton
            accessibilityRole="button"
            accessibilityLabel="Close filters"
            onPress={onClose}
          >
            <MaterialIcon name="close" size={24} color={tema.colors.textMuted} />
          </CloseButton>
        </Header>

        {sections.map(section => (
          <React.Fragment key={section.id}>
            <SectionTitle>{section.title}</SectionTitle>
            <Chips>
              {section.options.map(option => {
                const active = selectedFilters[section.id] === option.value;

                return (
                  <Chip
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityLabel={`${section.title}: ${option.label}`}
                    $active={active}
                    onPress={() => onSelect(section.id, option.value)}
                  >
                    <ChipText $active={active}>{option.label}</ChipText>
                  </Chip>
                );
              })}
            </Chips>
          </React.Fragment>
        ))}

        <Actions>
          <ActionCell>
            <PrimaryButton title="Reset" variant="ghost" onPress={onReset} />
          </ActionCell>
          <ActionCell>
            <PrimaryButton title="Apply" onPress={onApply} />
          </ActionCell>
        </Actions>
      </Sheet>
    </Backdrop>
  </Modal>
  );
};
