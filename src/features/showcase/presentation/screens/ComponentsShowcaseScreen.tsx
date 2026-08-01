import React, { ReactElement, useMemo, useState } from 'react';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';

import type { MainDrawerParamList } from '../../../../app/navigation/types';
import { AppImages } from '../../../../shared/assets';
import { PrimaryButton } from '../../../../shared/components/buttons/PrimaryButton';
import { FeatureCard } from '../../../../shared/components/cards/FeatureCard';
import { HorizontalCard } from '../../../../shared/components/cards/HorizontalCard';
import { EmptyState } from '../../../../shared/components/feedback/EmptyState';
import { DateRangePicker } from '../../../../shared/components/forms/DateRangePicker';
import { FilterSheet } from '../../../../shared/components/forms/FilterSheet';
import { SearchFilterBar } from '../../../../shared/components/forms/SearchFilterBar';
import { SearchField } from '../../../../shared/components/forms/SearchField';
import { AppHeader } from '../../../../shared/components/layout/AppHeader';
import { InfoBadge } from '../../../../shared/components/ui/InfoBadge';
import { MetricBadge } from '../../../../shared/components/ui/MetricBadge';
import { RatingBadge } from '../../../../shared/components/ui/RatingBadge';
import { AppScreen } from '../../../../shared/layouts/AppScreen';
import type {
  DateRange,
  FilterSection,
  SelectedFilters,
} from '../../../../shared/types/filters';
import { formatDateRange } from '../../../../shared/utils/date';

type ShowcaseNavigation = DrawerNavigationProp<
  MainDrawerParamList,
  'ComponentsShowcase'
>;

const Section = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const Row = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const SectionTitle = styled.Text`
  ${({ theme }) => theme.typography.h2};
  color: ${({ theme }) => theme.colors.text};
`;

const filterSections: FilterSection[] = [
  {
    id: 'price',
    title: 'Price',
    options: [
      { label: 'Any', value: 'any' },
      { label: '$', value: 'low' },
      { label: '$$', value: 'mid' },
      { label: '$$$', value: 'high' },
    ],
  },
  {
    id: 'distance',
    title: 'Distance',
    options: [
      { label: 'Any', value: 'any' },
      { label: '< 2 km', value: '2' },
      { label: '< 5 km', value: '5' },
    ],
  },
];

export const ComponentsShowcaseScreen = (): ReactElement => {
  const navigation = useNavigation<ShowcaseNavigation>();
  const [query, setQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    price: 'any',
    distance: 'any',
  });
  const activeFilterCount = useMemo(
    () => Object.values(selectedFilters).filter(value => value !== 'any').length,
    [selectedFilters],
  );

  return (
    <AppScreen>
      <AppHeader
        title="Components"
        subtitle="Cards, search, filters, calendar and feedback"
        leftIcon="menu"
        leftLabel="Open menu"
        onLeftPress={() => navigation.openDrawer()}
      />

      <Section>
        <SectionTitle>Search, filters and calendar</SectionTitle>
        <SearchFilterBar
          query={query}
          onQueryChange={setQuery}
          placeholder="Search stays, courses, content"
          activeFilterCount={activeFilterCount}
          onFilterPress={() => setFilterVisible(true)}
          onCalendarPress={() => setCalendarVisible(true)}
        />
        <Row>
          <InfoBadge label={`Query: ${query || 'all'}`} icon="search" />
          <InfoBadge label={formatDateRange(dateRange)} icon="event" />
          <InfoBadge label={`${activeFilterCount} filters`} icon="tune" />
        </Row>
      </Section>

      <Section>
        <SectionTitle>Actions</SectionTitle>
        <PrimaryButton title="Primary action" onPress={() => undefined} />
        <PrimaryButton
          title="Secondary action"
          variant="secondary"
          onPress={() => undefined}
        />
        <PrimaryButton
          title="Ghost action"
          variant="ghost"
          onPress={() => undefined}
        />
      </Section>

      <Section>
        <SectionTitle>Inputs and badges</SectionTitle>
        <SearchField label="Search showcase" placeholder="Search patterns" />
        <Row>
          <InfoBadge label="Reusable" icon="widgets" tone="primary" />
          <InfoBadge label="Accessible" icon="visibility" tone="accent" />
          <RatingBadge value={4.8} reviews={128} />
        </Row>
      </Section>

      <Section>
        <SectionTitle>Cards</SectionTitle>
        <FeatureCard
          title="Feature Card"
          subtitle="Inspired by course cards"
          image={AppImages.courseInterfaceFour}
          meta="$208"
          rating={4.9}
        />
        <HorizontalCard
          title="Horizontal Card"
          subtitle="Inspired by hotel rows"
          image={AppImages.hotelThree}
          badge="Compact"
          rating={4.6}
        />
      </Section>

      <Section>
        <SectionTitle>Feedback</SectionTitle>
        <Row>
          <MetricBadge value="99%" label="Reusable" />
          <MetricBadge value="48px" label="Touch min" />
        </Row>
        <EmptyState
          title="Ready for future modules"
          message="Use these primitives to build new features without reviving demo folders."
        />
      </Section>

      <FilterSheet
        visible={filterVisible}
        title="Filter results"
        sections={filterSections}
        selectedFilters={selectedFilters}
        onSelect={(sectionId, value) =>
          setSelectedFilters(current => ({ ...current, [sectionId]: value }))
        }
        onApply={() => setFilterVisible(false)}
        onReset={() => setSelectedFilters({ price: 'any', distance: 'any' })}
        onClose={() => setFilterVisible(false)}
      />

      <DateRangePicker
        visible={calendarVisible}
        value={dateRange}
        minimumDate={new Date()}
        onChange={setDateRange}
        onClose={() => setCalendarVisible(false)}
      />
    </AppScreen>
  );
};
