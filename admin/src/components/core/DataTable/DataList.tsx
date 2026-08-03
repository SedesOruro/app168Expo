import React, { ReactElement } from 'react';

// material-ui
import { Box, Typography, useTheme } from '@mui/material';

// types
import { DataListProps } from './Types';

export const DataList = ({ updateParams, mobileComponent, loading }: DataListProps): ReactElement => {
    const { rows } = updateParams;
    const theme = useTheme();
    const renderEmptyTable = () => {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: theme.spacing(6) }}>
                <Typography align="center">{loading ? 'Cargando...' : 'Sin registros'}</Typography>
            </Box>
        );
    };

    return (
        <Box>
            {rows.map((row, index) => {
                const rowId = `${row.id || index}`;
                return (
                    <React.Fragment key={rowId}>
                        <Box>{mobileComponent(row)}</Box>
                    </React.Fragment>
                );
            })}
            {rows.length === 0 && renderEmptyTable()}
        </Box>
    );
};
