import React, { ReactElement } from 'react';

// @mui
import { Button, Box, useTheme, useMediaQuery, CircularProgress } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import PdfIcon from '@mui/icons-material/PictureAsPdf';
import AddIcon from '@mui/icons-material/Add';

// components
import { DataSearch } from '../DataSearch';
import { ActionBarProps, TableHeader, MyTableModel } from './Types';
// hooks
import { TableView, ViewList } from '@mui/icons-material';
import Iconify from '../_internal/Iconify';

export const ActionBar = ({
    updateParams,
    headers,
    loading,
    loadingE,
    onFilterClick,
    onResfreshClick,
    onSearchClick,
    onSearchTextChange,
    onActionAddClick,
    onDownloadClick,
    onDownloadExcel,

}: ActionBarProps): ReactElement => {

    const hasHeaderFilters = headers.filter((column: TableHeader<MyTableModel>) => column.filter).length > 0;
    const theme = useTheme();
    const direccion = useMediaQuery(theme.breakpoints.up('sm'));

    const renderAddButton = (): ReactElement => {
        return (
            <Button variant="contained" color="secondary" disableElevation onClick={onActionAddClick} size="small" sx={{ mx: 1 }}>
                <AddIcon />
                Agregar
            </Button>
        );
    };

    const renderFilterButton = (): ReactElement => {
        return (
            <Button variant="contained" onClick={onFilterClick} disabled={!hasHeaderFilters} disableElevation size="small" sx={{ mx: 1 }}>
                <FilterListIcon />
            </Button>
        );
    };

    const renderResfreshButton = (): ReactElement => {
        return (
            <Button variant="contained" disableElevation onClick={onResfreshClick} size="small" sx={{ mx: 1 }}>
                <RefreshIcon />
            </Button>
        );
    };

    const renderDownloadButton = (): ReactElement => {
        return (
            <Button disabled={loading} variant="contained" onClick={onDownloadClick} sx={{ mx: 1, alignSelf: 'center' }} size="small" color="error">
                {loading ? <CircularProgress size={24} style={{ color: 'white' }} />:<PdfIcon />}
            </Button>
        );
    };

    const renderDownloadButtonExcel = (): ReactElement => {
        return (
            <Button disabled={loadingE} variant="contained" onClick={onDownloadExcel} sx={{ mx: 1, alignSelf: 'center' }} size="small" color="inherit">
                {loadingE ? <CircularProgress size={24} style={{ color: 'white' }} />: <Iconify
                                    icon={'vscode-icons:file-type-excel2'}
                                    sx={{ width: 24, height: 24, ml: 1 }}
                                />}
            </Button>
        );
    };

    return (
        <Box
            sx={{
                display: direccion ? 'flex' : 'inline',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                my: 2
            }}
        >
            <Box component="span">
                {onActionAddClick && renderAddButton()}
                {onFilterClick && renderFilterButton()}
                {onResfreshClick && renderResfreshButton()}
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                {onDownloadExcel && renderDownloadButtonExcel()}
                {onDownloadClick && renderDownloadButton()}
                {onSearchClick && <DataSearch updateParams={updateParams} onSearchClick={onSearchClick} onSearchTextChange={onSearchTextChange} />}
            </Box>

        </Box>
    );
};
