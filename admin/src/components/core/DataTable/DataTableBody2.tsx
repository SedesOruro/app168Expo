import React, { ReactElement, CSSProperties, useState } from 'react';
// material-ui
import { TableCell, TableRow, TableBody, Collapse, Box, Typography, SxProps, useTheme, Theme, Checkbox } from '@mui/material';

// types
import { TableHeader, DataTableBodyProps2, MyTableModel } from './Types';

import { DEFAULT_COLUMN_WIDTH, DEFAULT_COLUMN_MIN_WIDTH, DEFAULT_COLUMN_MAX_WIDTH, DEFAULT_COLUMN_ALIGN } from './DataTableHeader';

export const DataTableBody2 = ({ headers, updateParams, selected, setSelected, rowStyles, onRowClick, collapsableComponent, loading }: DataTableBodyProps2): ReactElement => {
    const { rows } = updateParams;
    const theme = useTheme();

    const [collapseOpen, setCollapseOpen] = React.useState<{ [key: string]: boolean }>({});
    const [collapseComp, setCollapseComp] = React.useState<{ [key: string]: ReactElement }>({});

    const handleCollapse = (row: MyTableModel, rowId: string) => {
        if (!collapsableComponent) return;
        const newCollapseOpen = !collapseOpen[rowId];
        if (newCollapseOpen) setCollapseComp({ ...collapseComp, [rowId]: collapsableComponent(row) });
        setCollapseOpen({ ...collapseOpen, [rowId]: newCollapseOpen });
    };

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

    const renderTableCell = (row: MyTableModel, rowId: string, column: TableHeader<MyTableModel>, columnIndex: string): ReactElement => {
        return (
            <TableCell
                sx={buildCellClassName(column, rowId)}
                style={buildCellStyle(column)}
                key={columnIndex}
                onClick={() => {
                    if (column.onCellClick) column.onCellClick(row, column);
                }}
            >
                {renderValue(row, column)}
            </TableCell>
        );
    };

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

    const handleCheckBoxClick = (event: any, id: number) => {
        const selectedIndex = selected.indexOf(id);        
        let newSelected: any[] = [];
        if (selectedIndex === -1) {
          newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
          newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
          newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
          newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
        }
        setSelected(newSelected);
    };

    function hasEstadoField<T>(model: T | any): boolean | undefined {        
        if(model && typeof model === 'object' && model.hasOwnProperty('estado'))            
            return model['estado'] as boolean;

        return undefined;
    }

    function hasIndexField<T>(model: T | any): boolean | undefined {        
        if(model && typeof model === 'object' && model.hasOwnProperty('index'))            
            return (model['index'] as number) !== 0;

        return undefined;
    }

    return (
        <TableBody>
            {rows.map((row: MyTableModel, index: any) => {
                const rowId = `${row.id || index}`;
                const isItemSelected = selected.indexOf(row.id) !== -1;
                return (
                    <React.Fragment key={`${rowId}_${index}`}>
                        <TableRow
                            hover
                            tabIndex={-1}
                            role="checkbox"
                            selected={isItemSelected}
                            aria-checked={isItemSelected}
                            sx={[rowStyles ? rowStyles(row) : {}, { height: theme.spacing(6) }, onRowClick ? { cursor: 'pointer' } : {}]}
                            onClick={() => {
                                if (onRowClick) onRowClick(row);
                            }}
                        >
                            <TableCell padding="checkbox">
                                {
                                    (hasEstadoField(row)!== undefined && hasEstadoField(row) && hasIndexField(row))?
                                        <Checkbox 
                                            checked={isItemSelected} 
                                            onChange={(event) => handleCheckBoxClick(event, row.id)}
                                        />
                                        : <></>
                                }
                            </TableCell>
                            {headers.map((column: TableHeader<MyTableModel>, columnIndex: any) => renderTableCell(row, rowId, column, `${columnIndex}`))}
                        </TableRow>
                        {typeof collapsableComponent !== 'undefined' && renderCollapsibleRow(rowId)}
                    </React.Fragment>
                );
            })}
            {rows.length === 0 && renderEmptyTable()}
        </TableBody>
    );
};
