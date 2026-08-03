import React, { ReactElement, CSSProperties } from 'react';
// material-ui
import { TableCell, TableRow, TableBody, Collapse, Box, Typography, SxProps, useTheme, Theme } from '@mui/material';

// types
import { TableHeader, DataTableBodyProps, MyTableModel } from './Types';

import { DEFAULT_COLUMN_WIDTH, DEFAULT_COLUMN_MIN_WIDTH, DEFAULT_COLUMN_MAX_WIDTH, DEFAULT_COLUMN_ALIGN } from './DataTableHeader';

export const DataTableBody = ({ headers, updateParams, rowStyles, onRowClick, collapsableComponent, loading }: DataTableBodyProps): ReactElement => {
    const { rows } = updateParams;
    const theme = useTheme();

    const [collapseOpen, setCollapseOpen] = React.useState<Record<string, boolean>>({});
    const [collapseComp, setCollapseComp] = React.useState<{ [key: string]: ReactElement }>({});
    const [selectedRowId, setSelectedRowId] = React.useState<string | null>(null);

    const handleCollapse = React.useCallback((row: any, rowId: string) => {
        if (!collapsableComponent) return;
        setCollapseOpen((prev) => ({
            ...prev,
            [rowId]: !prev[rowId]
        }));
    }, [collapsableComponent]);

    const handleRowClick = React.useCallback((row: any, rowId: string) => {
        onRowClick?.(row);
        setSelectedRowId(rowId);
    }, []);

    const renderValue = (row: MyTableModel, column: TableHeader<MyTableModel>): ReactElement => {
        const value = row[column.id];
        if (column.render) {
            const renderOptions = {
                handleClickCollapse: () => handleCollapse(row, `${row.id}`),
                collapseOpen: !collapseOpen[`${row.id}`]
            };
            return column.render(row, renderOptions);
        }
        if (typeof value === 'boolean') return <Box>{`${value}`}</Box>;
        if (typeof value === 'number') return <Box>{`${value}`}</Box>;
        if (typeof value === 'string') return <Box>{value}</Box>;
        return <Box />;
    };

    const buildCellStyle = (column: TableHeader<MyTableModel>): CSSProperties => {
        return {
            textAlign: column.align || DEFAULT_COLUMN_ALIGN,
            width: column.width || DEFAULT_COLUMN_WIDTH,
            minWidth: column.minWidth || (column.width ? column.width : DEFAULT_COLUMN_MIN_WIDTH),
            maxWidth: column.maxWidth || (column.width ? column.width : DEFAULT_COLUMN_MAX_WIDTH)
        };
    };

    const buildCellClassName = (column: TableHeader<MyTableModel>, rowId: string): SxProps<Theme> => {
        return [
            {
                padding: theme.spacing(0, 1.5),
                overflow: 'hidden',
                fontSize: '0.825rem',
                lineHeight: '1.2',
                [theme.breakpoints.down('sm')]: {
                    fontSize: '0.725rem'
                },
                '&:last-child': {
                    padding: theme.spacing(0, 2)
                }
            },
            column.onCellClick ? { cursor: 'pointer' } : {},
            column.truncate ? { whiteSpace: 'nowrap', textOverflow: 'ellipsis' } : {},
            typeof collapsableComponent !== 'undefined' && collapseOpen[rowId]
                ? {
                      borderTop: `solid #878787 1px`,
                      background: '#f2f2f2',
                      '&:first-child': {
                          borderLeft: `solid #878787 1px`
                      },
                      '&:last-child': {
                          borderRight: `solid #878787 1px`
                      }
                  }
                : {}
        ];
    };

    const renderTableCell = React.useCallback((
        row: any,
        rowId: string,
        column: any,
        key: string
    ) => {
        return (
            <TableCell
                key={key}
                align={column.align || 'left'}
                style={buildCellStyle(column)}
                sx={buildCellClassName(column, rowId)}
            >
            {column.render
                ? column.render(row, {
                    handleClickCollapse: () => handleCollapse(row, rowId),
                    collapseOpen: !!collapseOpen[rowId]
                })
                : row[column.id]}
            </TableCell>
        );
        }, [collapseOpen, handleCollapse]);

    const renderCollapsibleRow = (rowId: string): ReactElement => {
        return (
            <TableRow>
                <TableCell
                    sx={[
                        typeof collapsableComponent !== 'undefined' &&
                            collapseOpen[rowId] && {
                                borderBottom: `solid #878787 1px`,
                                borderLeft: `solid #878787 1px`,
                                borderRight: `solid #878787 1px`
                            },
                        { padding: 0, borderBottom: collapseOpen[rowId] ? '' : 'unset' }
                    ]}
                    colSpan={Array.from(headers).length}
                >
                    <Collapse in={collapseOpen[rowId]} timeout="auto" unmountOnExit>
                        {collapseComp && collapseComp[rowId]}
                    </Collapse>
                </TableCell>
            </TableRow>
        );
    };

    const renderEmptyTable = () => {
        return (
            <TableRow>
                <TableCell colSpan={9999} sx={{ height: theme.spacing(6) }}>
                    <Typography align="center">{loading ? 'Cargando...' : 'Sin registros'}</Typography>
                </TableCell>
            </TableRow>
        );
    };

    const memoizedRenderCollapse = React.useCallback(
        (rowId: string) => {
            return renderCollapsibleRow(rowId);
        },
        [collapseOpen, collapsableComponent] // dependencias mínimas
    );
    const memoizedRenderEmptyTable = React.useCallback(() => {
        return renderEmptyTable();
    }, []);
    return (
       <TableBody>
            {rows.map((row, index) => {
                const rowId = `${row.id || index}`;
                const isSelected = rowId === selectedRowId; 
                return (
                <MemoizedRow key={`${rowId}_${index}`}>
                    <TableRow
                    sx={[rowStyles ? rowStyles(row) : {},{ height: theme.spacing(6) },onRowClick ? { cursor: 'pointer' } : {},
                        isSelected ? { backgroundColor: 'lightblue' } : {} 
                    ]}
                    hover
                    onClick={() => handleRowClick(row, rowId)}
                    >
                    {headers.map((column, columnIndex) => renderTableCell(row, rowId, column, `${columnIndex}`))}
                    </TableRow>
                    {typeof collapsableComponent !== 'undefined' && memoizedRenderCollapse(rowId)}
                </MemoizedRow>
                );
            })}
            {rows.length === 0 && memoizedRenderEmptyTable()}
            </TableBody>
    );
};

const MemoizedRow = React.memo(function MemoizedRow(props: any) {
  return <>{props.children}</>;
});