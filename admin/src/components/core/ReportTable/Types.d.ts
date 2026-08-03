import { ReactElement, CSSProperties, Dispatch, SetStateAction } from 'react';

export interface MyTableModel {
    id: number;
    [key: string]: string | number | boolean | (string | number | boolean)[];
}

export type ReportFilters = {
    [key: string]: string | number | boolean | (string | number | boolean)[];
};

export type FilterOption = {
    value: string | number;
    label: string;
};

export type HeaderFilter = {
    type: 'text' | 'select';
    options?: FilterOption[];
};

export type TableInfoData = {
    id: string;
    value: string | number;
};

export type TableInfoHeader = {
    id: string;
    label: string;
    filter?: HeaderFilter;
    visible?: boolean;
};

export type TableGroupData = {
    id: string;
    value: string[];
};

export type TableGroupHeader = {
    id: string;
    label1: string[];
    label2: string[];
    label3: string[];
};

export type ExcelCell = {
    type?: 'number' | 'string';
    value?: string | number;
    colspan?: number;
    props?: any;
    R: number; // row postiion (comienza desde el 1)
    C: number; // col position (comienza desde el 1)
    cloned?: boolean; // indica si la celda ha sido clonada (colspan)
};

export type UpdateParams<TableModel> = {
    count: number;
    infoHeader: TableInfoHeader[],
    headerExcel: ExcelCell[][],
    bodyExcel: ExcelCell[][],
    rowsPerPage: number;
    page: number;
    order?: 'asc' | 'desc';
    orderBy?: keyof TableModel;
    searchText?: string;
    filters?: ReportFilters;
    data?: any;
};

export type OnUpdateOptions = {
    setLoading: (valur: boolean) => void;
};

export type TableRefProps = {
    refresh: (updateParams?: UpdateParams<TableModel>) => void;
};

export type DataTableProps = {
    updateParams: UpdateParams<TableModel>;
    showActionBar?: boolean;
    hiddenPagination?: boolean;
    onUpdate?: (params: UpdateParams<TableModel>, options: OnUpdateOptions) => void;
    mobileComponent?: (tableModel: TableModel) => ReactElement;
    renderTable?: (params: UpdateParams<TableModel>) => ReactElement;
};

export type DataTableHeaderProps = {
    updateParams: UpdateParams<TableModel>;
    filterOpen: boolean;
    onFilterChange: (filters: ReportFilters) => void;
    onOrderChange: (order: 'asc' | 'desc', orderBy: string) => void;
    loading?: boolean;
};

export type DataTableBodyProps = {
    updateParams: UpdateParams<TableModel>;
    loading?: boolean;
};

export type ActionBarProps = {
    onFilterClick?: () => void;
    onResfreshClick?: (fechaDesde: string, fechaHasta: string) => void;
    onSearchClick?: () => void;
    onSearchTextChange?: (searchText: string) => void;
    updateParams: UpdateParams<MyTableModel>;
    loading?: boolean;
};

export type DataListProps = {
    updateParams: UpdateParams<TableModel>;
    mobileComponent: (tableModel: TableModel) => ReactElement;
};
