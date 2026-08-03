import { makeStyles } from 'tss-react/mui';
import React, { ReactElement } from 'react';
import clsx from 'clsx';

// material-ui
import { Theme, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import { CSSProperties } from 'react';

// types
import { DataTableHeaderProps } from './Types';

export const DataTableHeader = (props: DataTableHeaderProps): ReactElement => {
    const { updateParams } = props;
    const { headerExcel } = updateParams;
    const { classes } = useStyles();

    const buildCellStyle = (props: any, colIndex: number, colValue: any): CSSProperties => {
        const nChars = `${colValue}`.length;
        const styles: any = { minWidth: nChars > 100 ? '250px' : nChars > 30 ? '150px' : undefined };
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
            styles.zIndex = 4;
            styles.position = 'sticky';
            styles.top = 0;
            styles.left = 0;
            styles.borderRight = '1px solid #8a8a8a';
        }
        return styles;
    };

    return (
        <TableHead>
            {headerExcel.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                    {row.map((col, colIndex) => {
                        if (col.cloned) return <React.Fragment key={colIndex} />;
                        if (`${col.value}`.length > 10) {
                            return (
                                <Tooltip
                                    key={colIndex}
                                    title={
                                        <React.Fragment>
                                            <Typography sx={{
                                                color: "inherit"
                                            }}>{col.value}</Typography>
                                        </React.Fragment>
                                    }
                                    placement="top"
                                >
                                    <TableCell
                                        className={clsx(classes.excelCell, {
                                            [classes.lastRowCell]: rowIndex === headerExcel.length - 1,
                                        })}
                                        colSpan={col.colspan}
                                        style={buildCellStyle(col.props, colIndex, col.value)}
                                    >
                                        {col.value}
                                    </TableCell>
                                </Tooltip>
                            );
                        }
                        return (
                            <TableCell
                                className={clsx(classes.excelCell, {
                                    [classes.lastRowCell]: rowIndex === headerExcel.length - 1,
                                })}
                                colSpan={col.colspan}
                                key={colIndex}
                                style={buildCellStyle(col.props, colIndex, col.value)}
                            >
                                {col.value}
                            </TableCell>
                        );
                    })}
                </TableRow>
            ))}
        </TableHead>
    );
};

const useStyles = makeStyles()((theme: Theme) => ({
    excelCell: {
        borderTop: '1px solid #8a8a8a',
        borderRight: 'unset',
        borderBottom: 'unset',
        borderLeft: '1px solid #8a8a8a',
        padding: '4px',
        fontWeight: 'bold',
        fontSize: '14px',
        lineHeight: 1.43,
        textAlign: 'center',

        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    lastRowCell: {
        textOverflow: 'unset',
        whiteSpace: 'unset',
        overflow: 'unset',
        borderBottom: '1px solid #8a8a8a',
    },
    cell: {
        borderTop: 'solid 1px rgba(224, 224, 224, 1)',
        borderRight: 'unset',
        borderBottom: 'unset',
        borderLeft: 'solid 1px rgba(224, 224, 224, 1)',
        padding: theme.spacing(0.5, 1.5),
        fontWeight: 'bold',
    },
    group1: {
        background: '#5692cc',
        color: 'white',
    },
    group2: {
        background: '#85ba3f',
        color: 'white',
    },
    loading: {
        background: '#919191',
        color: 'white',
    },
}));
