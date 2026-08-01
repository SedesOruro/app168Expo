export type DateRange = {
  startDate: Date | null;
  endDate: Date | null;
};

export type FilterOption = {
  label: string;
  value: string;
};

export type FilterSection = {
  id: string;
  title: string;
  options: FilterOption[];
};

export type SelectedFilters = Record<string, string>;
