import { makeStyles } from 'tss-react/mui';
import React, { ReactElement, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import clsx from 'clsx';
import { Scrollbar } from 'react-scrollbars-custom';
// material-ui
import { Paper, Table, TableContainer, LinearProgress, Box, Typography, TablePagination } from '@mui/material';

// components
import { ActionBar } from './ActionBar';
import { DataTableHeader } from './DataTableHeader';
import { DataTableBody } from './DataTableBody';
import { DataTableFilters } from './DataTableFilters';

// types
import { DataTableProps, TableRefProps, ReportFilters, UpdateParams, MyTableModel } from './Types';
import { useIsMounted } from '../_internal/useIsMounted';

const DataTableComponent = (props: DataTableProps, ref: React.Ref<TableRefProps>): ReactElement => {
    const { updateParams, showActionBar, onUpdate } = props;
    const {
        infoHeader,
        headerExcel,
        bodyExcel,
        count,
        rowsPerPage,
        page,
        order,
        orderBy,
        searchText,
        filters,
        data,
    } = updateParams;
    const { classes } = useStyles();
    const isMounted = useIsMounted();

    const [filterOpen, setFilterOpen] = useState(true);
    const [loading, setLoadingState] = useState<boolean>(false);

    const setLoading = (value: boolean) => {
        if (isMounted()) setLoadingState(value);
    };

    const [currentFilters, setCurrentFilters] = useState<ReportFilters | undefined>(filters);
    const [currentSearchtext, setCurrentSearchtext] = useState<string | undefined>(searchText);

    const actionBarEnable = typeof showActionBar === 'undefined' || showActionBar;

    const handleClickFilter = () => {
        setFilterOpen(!filterOpen);
    };

    const handleClickRefresh = (fechaDesde: string, fechaHasta: string) => {
        if (!onUpdate) return;
        data.mainFilters.fecha_desde = fechaDesde;
        data.mainFilters.fecha_hasta = fechaHasta;
        onUpdate(
            {
                infoHeader,
                headerExcel,
                bodyExcel,
                count,
                rowsPerPage,
                page: 1,
                order,
                orderBy,
                searchText: currentSearchtext,
                filters: filterOpen ? currentFilters : {},
                data,
            },
            { setLoading },
        );
    };

    const handleChangeFilter = (newFilters: ReportFilters) => {
        setCurrentFilters(newFilters);
        // INI - UPDATE ON FILTER CHANGE
        if (!onUpdate) return;
        onUpdate(
            {
                infoHeader,
                headerExcel,
                bodyExcel,
                count,
                rowsPerPage,
                page: 1,
                order,
                orderBy,
                searchText: currentSearchtext,
                filters: filterOpen ? newFilters : {},
                data,
            },
            { setLoading },
        );
        // FIN - UPDATE ON FILTER CHANGE
    };

    const handleChangeOrder = (newOrder: 'asc' | 'desc', newOrderBy: string) => {
        if (!onUpdate) return;
        onUpdate(
            {
                infoHeader,
                headerExcel,
                bodyExcel,
                count,
                rowsPerPage,
                page: 1,
                order: newOrder,
                orderBy: newOrderBy,
                searchText: currentSearchtext,
                filters: filterOpen ? currentFilters : {},
                data,
            },
            { setLoading },
        );
    };

    const handleClickSearch = () => {
        if (!onUpdate) return;
        onUpdate(
            {
                infoHeader,
                headerExcel,
                bodyExcel,
                count,
                rowsPerPage,
                page: 1,
                order,
                orderBy,
                searchText: currentSearchtext,
                filters: filterOpen ? currentFilters : {},
                data,
            },
            { setLoading },
        );
    };

    const handleChangeSearchText = (newSearchText: string) => {
        setCurrentSearchtext(newSearchText);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        if (!onUpdate) return;
        onUpdate(
            {
                infoHeader,
                headerExcel,
                bodyExcel,
                count,
                rowsPerPage,
                page: newPage + 1,
                order,
                orderBy,
                searchText,
                filters: currentFilters,
                data,
            },
            { setLoading },
        );
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!onUpdate) return;
        onUpdate(
            {
                infoHeader,
                headerExcel,
                bodyExcel,
                count,
                rowsPerPage: Number(event.target.value),
                page: 1,
                order,
                orderBy,
                searchText: currentSearchtext,
                filters: filterOpen ? currentFilters : {},
                data,
            },
            { setLoading },
        );
    };

    useEffect(() => {
        if (isMounted()) setCurrentFilters(updateParams.filters);
    }, [updateParams.filters, isMounted]);

    const tableHandler = () => ({
        refresh: (newUpdateParams?: UpdateParams<MyTableModel>) => {
            if (onUpdate) {
                onUpdate(newUpdateParams || updateParams, { setLoading });
            }
        },
    });
    useImperativeHandle(ref, tableHandler, [updateParams]);

    return (
        <Paper className={classes.root} variant="outlined" square>
            {actionBarEnable && (
                <ActionBar
                    onFilterClick={handleClickFilter}
                    onResfreshClick={handleClickRefresh}
                    onSearchClick={handleClickSearch}
                    onSearchTextChange={handleChangeSearchText}
                    updateParams={updateParams}
                    loading={loading}
                />
            )}
            <LinearProgress className={classes.loader} color="secondary" variant="indeterminate" hidden={!loading} />
            {loading && infoHeader.length === 0 && (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        p: 2
                    }}>
                    <Typography>Cargando...</Typography>
                </Box>
            )}
            <DataTableFilters
                updateParams={updateParams}
                filterOpen={filterOpen}
                onFilterChange={handleChangeFilter}
                onOrderChange={handleChangeOrder}
                loading={loading}
            />
            {infoHeader.length > 0 && (
                <TableContainer className={clsx(classes.container)}>
                    <Scrollbar disableTracksWidthCompensation style={{ maxHeight: 'calc(100vh - 275px)' }} translateContentSizeYToHolder>
                        <Table
                            stickyHeader
                            style={{
                                borderColor:
                                    headerExcel && headerExcel.length > 0 ? '#8a8a8a' : 'rgba(224, 224, 224, 1)',
                            }}
                        >
                            <DataTableHeader
                                updateParams={updateParams}
                                filterOpen={filterOpen}
                                onFilterChange={handleChangeFilter}
                                onOrderChange={handleChangeOrder}
                                loading={loading}
                            />
                            <DataTableBody updateParams={updateParams} loading={loading} />
                        </Table>
                    </Scrollbar>
                </TableContainer>
            )}
            {infoHeader.length > 0 && (
                <TablePagination
                    rowsPerPageOptions={[50, 100, 250]}
                    component="div"
                    count={count}
                    rowsPerPage={rowsPerPage}
                    page={page - 1}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            )}
        </Paper>
    );
};

const useStyles = makeStyles()(() => ({
    root: {
        width: '100%',
        height: '100%',
    },
    container: {
        height: '100%',
        overflowY: 'auto',
        transition: 'height .5s, marginTop .5s',
        '& table': {
            borderTop: 'unset',
            borderRight: '1px solid #8a8a8a',
            borderBottom: '1px solid #8a8a8a',
            borderLeft: 'unset',
        },
        '& .ScrollbarsCustom-Content': {
          display: 'block !important',
        },
    },
    loader: {
        position: 'absolute',
        left: '15px',
        right: '15px',
        height: '4px',
        background: '#e0e0e0',
        zIndex: 9,
    },
    MyAwesomeScrollbarsWrapper: {
      background: 'yellow',
      padding:'10px'
    },
}));

export const ReportTable = forwardRef(DataTableComponent);
