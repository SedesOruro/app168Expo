import { ReactElement } from 'react';

export interface MyTableModel {
    id: number;
    [key: string]: string | number | boolean | (string | number | boolean)[];
}

export type TableHeader<TableModel> = {
    id: keyof TableModel;
    label: string;
    width?: number | string;
    minWidth?: number | string;
    maxWidth?: number | string;
    align?: 'left' | 'right' | 'inherit' | 'center' | 'justify';
    bgColor?: string;
    render?: (tableModel: TableModel) => ReactElement;
};

export type UpdateParams<TableModel> = {
    rows: TableModel[];
};

export type DataTableProps = {
    headers: TableHeader<TableModel>[];
    updateParams: UpdateParams<TableModel>;
    total?: string | ReactElement;
    submitting?: boolean;
    mobileComponent?: (tableModel: TableModel) => ReactElement;
};

export type DataListProps = {
    updateParams: UpdateParams<TableModel>;
    mobileComponent: (tableModel: TableModel) => ReactElement;
    loading?: boolean;
};
