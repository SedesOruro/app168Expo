import { makeStyles } from 'tss-react/mui';
import React, { ReactElement } from 'react';
import { Theme, TableCell, TableRow, TableBody, Typography } from '@mui/material';
import { DataTableBodyProps } from './Types';
import clsx from 'clsx';
import { CSSProperties } from 'react';

export const DataTableBody = (props: DataTableBodyProps): ReactElement => {
    const { updateParams, loading } = props;
    const { bodyExcel } = updateParams;
    const { classes } = useStyles();

    const buildCellStyle = (props: any, colIndex: number): CSSProperties => {
        const styles: any = {};
        if (props.alignment && props.alignment.horizontal && props.alignment.horizontal === 'center') {
            styles.textAlign = 'center';
        }
        if (props.alignment && props.alignment.horizontal && props.alignment.horizontal === 'left') {
            styles.textAlign = 'left';
        }
        if (props.alignment && props.alignment.horizontal && props.alignment.horizontal === 'right') {
            styles.textAlign = 'right';
        }
        if (props.font && props.font.bold) {
            styles.fontWeight = 'bold';
        }
        if (props.fill && props.fill.fgColor) {
            styles.backgroundColor = `#${props.fill.fgColor.argb}`;
        }
        if (props.font && props.font.color) {
            styles.color = `#${props.font.color.argb}`;
        }
        if (colIndex === 0) {
            styles.zIndex = 3;
            styles.position = 'sticky';
            styles.top = 0;
            styles.left = 0;
            styles.borderRight = '1px solid #8a8a8a';
        }
        return styles;
    };

    const renderEmptyTable = () => {
        return (
            <TableRow>
                <TableCell colSpan={9999} className={classes.info}>
                    <Typography align="center">{loading ? 'Cargando...' : 'Sin registros'}</Typography>
                </TableCell>
            </TableRow>
        );
    };

    return (
        <TableBody>
            {bodyExcel.map((row, rowIndex) => {
                return (
                    <TableRow key={rowIndex} className={classes.tableRow}>
                        {row.map((col, colIndex) => {
                            if (col.cloned) return <React.Fragment key={colIndex} />;
                            return (
                                <TableCell
                                    className={clsx(classes.excelCell, classes.noWrapCell)}
                                    colSpan={col.colspan}
                                    key={colIndex}
                                    style={buildCellStyle(col.props, colIndex)}
                                >
                                    {col.value}
                                </TableCell>
                            );
                        })}
                    </TableRow>
                );
            })}
            {bodyExcel.length === 0 && renderEmptyTable()}
        </TableBody>
    );
};

const useStyles = makeStyles()((theme: Theme) => ({
    excelCell: {
        borderTop: '1px solid #8a8a8a',
        borderRight: 'unset',
        borderBottom: 'unset',
        borderLeft: '1px solid #8a8a8a',
        padding: '4px',
        fontWeight: 'normal',
        fontSize: '14px',
        lineHeight: 1.43,
        textAlign: 'center',
    },
    noWrapCell: {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    cell: {
        borderTop: '1px solid rgba(224, 224, 224, 1)',
        borderRight: 'unset',
        borderBottom: 'unset',
        borderLeft: '1px solid rgba(224, 224, 224, 1)',
    },
    group1: {
        background: '#f2f7fb',
    },
    group2: {
        background: '#f6faf2',
    },
    loading: {
        background: '#f7f7f7',
    },
    totalCell: {
        fontWeight: 'bold',
        padding: theme.spacing(1, 2),
    },
    tableRow: {
        '&:hover > td': {
            background: '#f5f5f5 !important',
        },
    },
    info: {
        height: theme.spacing(6),
    },
}));
