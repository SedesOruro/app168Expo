import { makeStyles } from 'tss-react/mui';
import React, { ReactElement } from 'react';
import { Theme, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Box, Typography, LinearProgress, useTheme, useMediaQuery } from '@mui/material';
import { CSSProperties } from 'react';
import { DataTableProps, TableHeader, MyTableModel } from './Types';
import { DataList } from './DataList';

export const DEFAULT_COLUMN_WIDTH = 'auto';
export const DEFAULT_COLUMN_MIN_WIDTH = 'auto';
export const DEFAULT_COLUMN_MAX_WIDTH = 'auto';
export const DEFAULT_COLUMN_ALIGN = 'center';

export const SimpleTable = (props: DataTableProps): ReactElement => {
    const { updateParams, headers, total, submitting, mobileComponent } = props;
    const { rows } = updateParams;
    const { classes } = useStyles();

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    function buildCellStyle(column: TableHeader<MyTableModel>): CSSProperties {
        return {
            width: column.width || DEFAULT_COLUMN_WIDTH,
            minWidth: column.minWidth || (column.width ? column.width : DEFAULT_COLUMN_MIN_WIDTH),
            maxWidth: column.maxWidth || (column.width ? column.width : DEFAULT_COLUMN_MAX_WIDTH),
            backgroundColor: column.bgColor,
        };
    }

    function buildCellContentStyle(column: TableHeader<MyTableModel>): CSSProperties {
        const textAlign = column.align || DEFAULT_COLUMN_ALIGN;
        const display = 'flex';
        const isLeft = textAlign === 'left';
        const isRight = textAlign === 'right';
        const isCenter = textAlign === 'center';
        const justifyContent = isLeft ? 'flex-start' : isRight ? 'flex-end' : isCenter ? 'center' : undefined;
        return { justifyContent, textAlign, display };
    }

    const renderHeaderCell = (column: TableHeader<MyTableModel>, columnIndex: number): ReactElement => {
        return (
            <TableCell className={classes.headerCell} style={buildCellStyle(column)} key={columnIndex}>
                <Box style={buildCellContentStyle(column)}>{column.label}</Box>
            </TableCell>
        );
    };

    const renderBodyCell = (
        row: MyTableModel,
        column: TableHeader<MyTableModel>,
        columnIndex: string,
    ): ReactElement => {
        return (
            <TableCell className={classes.bodyCell} style={buildCellStyle(column)} key={columnIndex}>
                <Box style={buildCellContentStyle(column)}>{renderValue(row, column)}</Box>
            </TableCell>
        );
    };

    const renderValue = (row: MyTableModel, column: TableHeader<MyTableModel>): ReactElement => {
        const value = row[column.id];
        if (column.render) {
            return column.render(row);
        }
        if (typeof value === 'boolean') return <Box>{`${value}`}</Box>;
        if (typeof value === 'number') return <Box>{`${value}`}</Box>;
        if (typeof value === 'string') return <Box>{value}</Box>;
        return <Box />;
    };

    const renderTableData = () => {
        if (mobileComponent && isSmallScreen) {
            const dataList = (
                <DataList updateParams={updateParams} mobileComponent={mobileComponent} loading={submitting} />
            );
            return <Box>{dataList}</Box>;
        }

        const table = (
            <Table className={classes.table} size="small">
                <TableHead>
                    <TableRow>{headers.map((column, columnIndex) => renderHeaderCell(column, columnIndex))}</TableRow>
                </TableHead>
                <TableBody>
                    {rows.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={999} align="center">
                                <Typography variant="h6">Sin registros</Typography>
                            </TableCell>
                        </TableRow>
                    )}
                    {rows.map((row, index) => (
                        <React.Fragment key={index}>
                            <TableRow>
                                {headers.map((column, columnIndex) => renderBodyCell(row, column, `${columnIndex}`))}
                            </TableRow>
                        </React.Fragment>
                    ))}
                    {total && (
                        <TableRow>
                            <TableCell colSpan={999} align="center">
                                {total}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        );
        return (
            <>
                <TableContainer>{table}</TableContainer>
            </>
        );
    };

    return (
        <Paper className={classes.root} variant="outlined" square>
            <LinearProgress className={classes.loader} color="secondary" variant="indeterminate" hidden={!submitting} />
            {renderTableData()}
        </Paper>
    );
};

const useStyles = makeStyles()((theme: Theme) => ({
    root: {
        width: '100%',
        height: '100%',
    },
    table: {
        minWidth: theme.spacing(70),
    },
    headerCell: {
        fontWeight: 'bold',
        background: '#ededed',
    },
    bodyCell: {},
    loader: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: '4px',
        background: '#e0e0e0',
        zIndex: 9,
    },
}));
