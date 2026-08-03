import { makeStyles } from 'tss-react/mui';
import React, { ReactElement, useState } from 'react';
import { Theme } from '@mui/material/styles';
import { Button, Box } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format, parse as dateParse, isValid } from 'date-fns';

import { ReportSearch } from '../ReportSearch';
import { ActionBarProps } from './Types';

const FORMAT = 'dd/MM/yyyy';

function parseDate(value: string): Date | null {
    if (!value) return null;
    const parsed = dateParse(value, FORMAT, new Date());
    return isValid(parsed) ? parsed : null;
}

function formatDate(value: Date | null): string {
    return value && isValid(value) ? format(value, FORMAT) : '';
}

export const ActionBar = ({
    updateParams,
    onFilterClick,
    onResfreshClick,
    onSearchClick,
    onSearchTextChange,
    loading,
}: ActionBarProps): ReactElement => {
    const { classes } = useStyles();
    const [fechaDesde, setFechaDesde] = useState<string>(updateParams.data?.mainFilters?.fecha_desde || '');
    const [fechaHasta, setFechaHasta] = useState<string>(updateParams.data?.mainFilters?.fecha_hasta || '');

    const renderDateFilter = (): ReactElement => (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Box
                sx={{
                    display: "flex",
                    minWidth: '320px'
                }}>
                <Box sx={{
                    px: 1
                }}>
                    <DatePicker
                        label="Fecha desde"
                        disabled={loading}
                        format={FORMAT}
                        value={parseDate(fechaDesde)}
                        onChange={(date) => setFechaDesde(formatDate(date))}
                        slotProps={{ textField: { variant: 'standard', helperText: '' } }}
                    />
                </Box>
                <Box sx={{
                    px: 1
                }}>
                    <DatePicker
                        label="Fecha hasta"
                        disabled={loading}
                        format={FORMAT}
                        value={parseDate(fechaHasta)}
                        onChange={(date) => setFechaHasta(formatDate(date))}
                        slotProps={{ textField: { variant: 'standard', helperText: '' } }}
                    />
                </Box>
            </Box>
        </LocalizationProvider>
    );

    return (
        <Box className={classes.buttonsBar}>
            {onFilterClick && (
                <Button className={classes.btn} variant="contained" color="secondary" onClick={onFilterClick} disabled={loading || updateParams.infoHeader.length === 0} disableElevation>
                    <FilterListIcon /> &nbsp; <span className={classes.buttonText}>Filtrar</span>
                </Button>
            )}
            {onResfreshClick && (
                <Button className={classes.iconButton} variant="contained" disabled={loading} disableElevation onClick={() => onResfreshClick(fechaDesde, fechaHasta)}>
                    <RefreshIcon />
                </Button>
            )}
            {renderDateFilter()}
            <Box sx={{
                mx: "auto"
            }} />
            {onSearchClick && (
                <ReportSearch variant="light" updateParams={updateParams} onSearchClick={onSearchClick} onSearchTextChange={onSearchTextChange} loading={loading} />
            )}
        </Box>
    );
};

const useStyles = makeStyles()((theme: Theme) => ({
    btn: { color: '#fff', marginRight: theme.spacing(1) },
    iconButton: { color: '#000', marginRight: theme.spacing(1) },
    buttonsBar: {
        height: '65px',
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1, 1.5),
        overflowX: 'auto',
    },
    buttonText: {
        [theme.breakpoints.down('sm')]: { display: 'none' },
    },
}));
