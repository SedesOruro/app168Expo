import React, { ReactElement, CSSProperties } from 'react';
import { useTheme, TableCell, TableSortLabel, TableHead, TableRow, Box } from '@mui/material';
import { DataTableHeaderProps, TableHeader, MyTableModel } from './Types';

// constants
export const DEFAULT_COLUMN_WIDTH = 'auto';
export const DEFAULT_COLUMN_MIN_WIDTH = 'auto';
export const DEFAULT_COLUMN_MAX_WIDTH = 'auto';
export const DEFAULT_COLUMN_ALIGN = 'center';

export const DataTableHeader = ({ headers, updateParams, onOrderChange }: DataTableHeaderProps): ReactElement => {
    const { order, orderBy } = updateParams;
    const theme = useTheme();

    const handleChangeOrder = React.useCallback((property: string) => () => {
        const newOrderBy = property;
        const isAsc = orderBy === newOrderBy && order === 'asc';
        const newOrder = isAsc ? 'desc' : 'asc';
        onOrderChange(newOrder, newOrderBy);
    }, [order, orderBy, onOrderChange]);

    const renderTitle = React.useCallback((column: TableHeader<MyTableModel>): ReactElement => {
    if (typeof column.sort === 'undefined' || column.sort) {
        return (
        <TableSortLabel
            active={orderBy === column.id}
            direction={orderBy === column.id ? order : 'asc'}
            onClick={handleChangeOrder(column.id as string)}
            style={buildJustifyContentStyle(column)}
        >
            <Box sx={{ padding: theme.spacing(0, 2) }} style={buildTextAlignStyle(column)}>
            {column.label}
            </Box>
            {orderBy === column.id && (
            <span
                style={{
                                border: 0,
                                clip: 'rect(0 0 0 0)',
                                height: 1,
                                margin: -1,
                                overflow: 'hidden',
                                padding: 0,
                                position: 'absolute',
                                top: 20,
                                width: 1
                            }}
            >
                {order === 'desc' ? 'orden descendente' : 'orden ascendente'}
            </span>
            )}
        </TableSortLabel>
        );
    }
    return <>{column.label}</>;
    }, [order, orderBy, handleChangeOrder, theme]);

    function buildTextAlignStyle(column: TableHeader<MyTableModel>): CSSProperties {
        return { textAlign: column.align || DEFAULT_COLUMN_ALIGN };
    }

    function buildJustifyContentStyle(column: TableHeader<MyTableModel>): CSSProperties {
        const textAlign = column.align || DEFAULT_COLUMN_ALIGN;
        if (textAlign === 'left') return { justifyContent: 'flex-start' };
        if (textAlign === 'right') return { justifyContent: 'flex-end' };
        return { justifyContent: 'center' };
    }

    function buildWidthStyle(column: TableHeader<MyTableModel>): CSSProperties {
        return {
            width: column.width || DEFAULT_COLUMN_WIDTH,
            minWidth: column.minWidth || (column.width ? column.width : DEFAULT_COLUMN_MIN_WIDTH),
            maxWidth: column.maxWidth || (column.width ? column.width : DEFAULT_COLUMN_MAX_WIDTH)
        };
    }

    const renderTableCell = (column: TableHeader<MyTableModel>, columnIndex: number): ReactElement => {
        return (
            <TableCell
                sx={{
                    padding: theme.spacing(0),
                    fontSize: '0.975rem',
                    lineHeight: '1.0',
                    [theme.breakpoints.down('sm')]: {
                        fontSize: '0.875rem'
                    }
                }}
                style={buildWidthStyle(column)}
                key={columnIndex}
                sortDirection={orderBy === column.id ? order : false}
            >
                <Box
                    sx={{
                        height: '50px',
                        overflow: 'hidden',
                        background: '#fff',
                        display: 'flex',
                        py: theme.spacing(3),
                        alignItems: 'center',
                        borderTop: '1px solid rgba(224, 224, 224, 1)'
                    }}
                    style={buildJustifyContentStyle(column)}
                >
                    {renderTitle(column)}
                </Box>
            </TableCell>
        );
    };

    return (
        <TableHead>
            <TableRow>{headers.map((column, columnIndex) => renderTableCell(column, columnIndex))}</TableRow>
        </TableHead>
    );
};
