import { ReactElement, CSSProperties, Dispatch, SetStateAction } from 'react';

export interface MyTableModel {
    id: number;
    [key: string]: string | number | boolean | (string | number | boolean)[];
}

export type FilterOption = {
    value: string | number ;
    label: string;
};

export type Filters = {
    [key: string]: string | number | boolean | (string | number | boolean)[];
};

export type HeaderFilter = {
    type: 'text' | 'select' | 'date'| 'range';
    options?: FilterOption[];
    value?: any;
};

export type RenderOptions = {
    handleClickCollapse: () => void;
    collapseOpen: boolean;
};

export type TableHeader<TableModel> = {
    id: keyof TableModel;
    label: string;
    width?: number | string;
    minWidth?: number | string;
    maxWidth?: number | string;
    align?: 'left' | 'right' | 'inherit' | 'center' | 'justify';
    sort?: boolean;
    truncate?: boolean;
    render?: (tableModel: TableModel, renderOptions: RenderOptions) => ReactElement;
    onCellClick?: (tableModel: TableModel, column: TableHeader<TableModel>) => void;
    filter?: HeaderFilter;
};

export type UpdateParams<TableModel> = {
    rows: TableModel[];
    count: number;
    rowsPerPage: number;
    page: number;
    order?: 'asc' | 'desc';
    orderBy?: keyof TableModel;
    searchText?: string;
    filters?: Filters;
    data?: any;
};

export type OnUpdateOptions = {
    setLoading: (valur: boolean) => void;
};

export type DataTableRefProps = {
    refresh: (updateParams?: UpdateParams<TableModel>) => void;
};

export type DataTableProps = {
    headers: TableHeader<TableModel>[];
    updateParams: UpdateParams<TableModel>;
    showActionBar?: boolean;
    showFilters?: boolean;
    showRefresh?: boolean;
    showSearch?: boolean;
    hiddenPagination?: boolean;
    truncate?: boolean;
    onUpdate?: (params: UpdateParams<TableModel>, options: OnUpdateOptions) => void;
    onRowClick?: (tableModel: TableModel) => void;
    rowStyles?: (tableModel: TableModel) => CSSProperties;
    onActionAddClick?: () => void;
    onActionOption1Click?: (s: any[]) => void;
    onActionOption2Click?: (s: any[]) => void;
    onDownloadClick?: () => void;
    onDownloadExcel?: () => void;
    collapsableComponent?: (tableModel: TableModel) => ReactElement;
    mobileComponent?: (tableModel: TableModel) => ReactElement;
    vScroll?: boolean;
    autorize?: boolean;
    isLoading?: boolean;
    isLoadingE?: boolean;
};

export type DataTableRefPropsV2 = {
    handleUpdateTable: (params: UpdateParams<TableModel>) => void;
    tableParams: UpdateParams<TableModel>;
};
export type DataTablePropsV2 = {
    headers: TableHeader<TableModel>[];
    refresh: (params: UpdateParams<TableModel>) => Promise<UpdateParams<TableModel> | undefined>;
    showActionBar?: boolean;
    showFilters?: boolean;
    showRefresh?: boolean;
    showSearch?: boolean;
    hiddenPagination?: boolean;
    onRowClick?: (tableModel: TableModel) => void;
    rowStyles?: (tableModel: TableModel) => CSSProperties;
    onActionAddClick?: () => void;
    collapsableComponent?: (tableModel: TableModel) => ReactElement;
    mobileComponent?: (tableModel: TableModel) => ReactElement;
    vScroll?: boolean;
};

export type DataTableHeaderProps = {
    headers: TableHeader<TableModel>[];
    updateParams: UpdateParams<TableModel>;
    filterOpen: boolean;
    onFilterChange: (filters: Filters) => void;
    onOrderChange: (order: 'asc' | 'desc', orderBy: string) => void;
    onSelectAllClick?: (tableModel: TableModel) => void;
    onResfreshClick?: () => void;
};

export type DataTableHeaderProps2 = {
    headers: TableHeader<TableModel>[];
    updateParams: UpdateParams<TableModel>;
    filterOpen: boolean;
    numSelected: number;
    rowCount: number;
    onFilterChange: (filters: Filters) => void;
    onOrderChange: (order: 'asc' | 'desc', orderBy: string) => void;
    onSelectAllClick?: (tableModel: TableModel) => void;
};

export type DataTableBodyProps = {
    headers: TableHeader<TableModel>[];
    updateParams: UpdateParams<TableModel>;
    rowStyles?: (tableModel: TableModel) => CSSProperties;
    onRowClick?: (tableModel: TableModel) => void;
    collapsableComponent?: (tableModel: TableModel) => ReactElement;
    loading?: boolean;
};

export type DataTableBodyProps2 = {
    headers: TableHeader<TableModel>[];
    updateParams: UpdateParams<TableModel>;
    selected: any[];
    setSelected: (d: any) => useState;
    rowStyles?: (tableModel: TableModel) => CSSProperties;
    onRowClick?: (tableModel: TableModel) => void;
    collapsableComponent?: (tableModel: TableModel) => ReactElement;
    loading?: boolean;
};

export type ActionBarProps = {
    onFilterClick?: () => void;
    onResfreshClick?: () => void;
    onSearchClick?: () => void;
    onSearchTextChange?: (searchText: string) => void;
    onActionAddClick?: () => void;
    onDownloadClick?: () => void;
    onDownloadExcel?: () => void;
    updateParams: UpdateParams<TableModel>;
    headers: TableHeader<TableModel>[];
    loading?: boolean;
    loadingE?: boolean;
};

export type DataListProps = {
    updateParams: UpdateParams<TableModel>;
    mobileComponent: (tableModel: TableModel) => ReactElement;
    loading?: boolean;
};

export type DataListToolbarProps = {
    numSelected: number;
    input: ReactElement;
    onActionOption1Click?: () => void;
    onActionOption2Click?: () => void;
};
