import React, { ReactElement, useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import Scrollbar from '../_internal/Scrollbar';

// material-ui
import { Table, TableContainer, TablePagination, LinearProgress, useMediaQuery, useTheme, Box, Card, Paper } from '@mui/material';

// components
import { ActionBar } from './ActionBar';
import { DataTableHeader } from './DataTableHeader';
import { DataTableBody } from './DataTableBody';

// types
import { DataTableProps, DataTableRefProps, Filters, UpdateParams, MyTableModel } from './Types';
import { DataList } from './DataList';
import { useIsMounted } from '../_internal/useIsMounted';
import { DataTableFilters, DataTableFiltersHandle } from './DataTableFilters';

const DataTableComponent = (props: DataTableProps, ref: React.Ref<DataTableRefProps>): ReactElement => {
    const {
        updateParams,
        headers,
        showActionBar,
        showFilters,
        showRefresh,
        showSearch,
        hiddenPagination,
        isLoading,
        isLoadingE,
        onUpdate,
        rowStyles,
        onRowClick,
        onActionAddClick,
        onDownloadClick,
        onDownloadExcel,
        collapsableComponent,
        mobileComponent,
        vScroll
    } = props;

    const { rows, count, rowsPerPage, page, order, orderBy, searchText, filters, data } = updateParams;
    const isMounted = useIsMounted();
    const debounceRef = useRef<number | null>(null);
    const filtersRef = useRef<DataTableFiltersHandle>(null);

    const [filterOpen, setFilterOpen] = useState(false);
    const [loading, setLoadingState] = useState<boolean>(false);

    const setLoading = (value: boolean) => {
        if (isMounted()) setLoadingState(value);
    };

    const [currentFilters, setCurrentFilters] = useState<Filters | undefined>(filters);
    const [currentSearchtext, setCurrentSearchtext] = useState<string | undefined>(searchText);

    const actionBarEnable = typeof showActionBar === 'undefined' || showActionBar;

    const handleChangePage = (_event: unknown, newPage: number) => {
        if (!onUpdate) return;
        if (newPage + 1 === page) return;
        onUpdate(
            {
                ...updateParams,
                page: newPage + 1
            },
            { setLoading }
        );
    };

    const onResfreshClick = () => {
        if (!onUpdate) return;
        onUpdate(
            {
                ...updateParams,
                filters: currentFilters,
                searchText: currentSearchtext
            },
            { setLoading }
        );
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        if (!onUpdate) return;
        if (newRowsPerPage === rowsPerPage) return;
        onUpdate(
            {
                ...updateParams,
                rowsPerPage: newRowsPerPage,
                page: 1
            },
            { setLoading }
        );
    };

    const handleClickFilter = () => {
        setFilterOpen(!filterOpen);
    };

    const handleClickRefresh = () => {
        if (filtersRef.current?.apply) {
            filtersRef.current.apply();
            return;
        }
        if (!onUpdate) return;
        onUpdate(
            {
                rows,
                count,
                rowsPerPage,
                page: 1,
                order,
                orderBy,
                searchText: currentSearchtext,
                filters: filterOpen ? currentFilters : {},
                data
            },
            { setLoading }
        );
    };

    const handleChangeFilter = (newFilters: Filters) => {
        setCurrentFilters(newFilters);
    };

    const handleChangeOrder = (newOrder: 'asc' | 'desc', newOrderBy: string) => {
        if (!onUpdate) return;
        onUpdate(
            {
                rows,
                count,
                rowsPerPage,
                page: 1,
                order: newOrder,
                orderBy: newOrderBy,
                searchText: currentSearchtext,
                filters: filterOpen ? currentFilters : {},
                data
            },
            { setLoading }
        );
    };

    const handleClickActionAdd = () => {
        if (onActionAddClick) {
            onActionAddClick();
        }
    };

    const handleClickDownload = () => {
        if (onDownloadClick) {
            onDownloadClick();
        }
    };
    const handleClickDownloadExcel = () => {
        if (onDownloadExcel) {
            onDownloadExcel();
        }
    };

    const handleClickSearch = () => {
        if (!onUpdate) return;
        onUpdate(
            {
                rows,
                count,
                rowsPerPage,
                page: 1,
                order,
                orderBy,
                searchText: currentSearchtext,
                filters: filterOpen ? currentFilters : {},
                data
            },
            { setLoading }
        );
    };

    const handleChangeSearchText = (newSearchText: string) => {
        setCurrentSearchtext(newSearchText);
    };

    const tableHandler = () => ({
        refresh: (newUpdateParams?: UpdateParams<MyTableModel>) => {
            if (onUpdate) {
                onUpdate(newUpdateParams || updateParams, { setLoading });
            }
        }
    });

    useImperativeHandle(ref, tableHandler, [updateParams]);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const actionBarHeight = actionBarEnable ? 70 : 0;
    const paginationHeight = hiddenPagination ? 0 : 52;
    const filterHeight = filterOpen ? 64 : 0;
    const tableHeightStyle = `calc(100% - ${actionBarHeight + paginationHeight + filterHeight}px)`;

    const renderTableData = () => {
        if (mobileComponent && isSmallScreen) {
            const dataList = <DataList updateParams={updateParams} mobileComponent={mobileComponent} loading={loading} />;
            return (
                <Box sx={{ overflowY: 'auto', transition: 'height .5s, marginTop .5s', height: tableHeightStyle }}>
                    {vScroll && <Scrollbar>{dataList}</Scrollbar>}
                    {!vScroll && dataList}
                </Box>
            );
        }

        const table = (
            <Table stickyHeader>
                <DataTableHeader headers={headers} updateParams={updateParams} filterOpen={filterOpen} onFilterChange={handleChangeFilter} onOrderChange={handleChangeOrder} />
                <DataTableBody headers={headers} updateParams={updateParams} rowStyles={rowStyles} onRowClick={onRowClick} collapsableComponent={collapsableComponent} loading={loading} />
            </Table>
        );
        return (
            <>
                <DataTableFilters
                    ref={filtersRef}
                    headers={headers}
                    updateParams={updateParams}
                    filterOpen={filterOpen}
                    onFilterChange={handleChangeFilter}
                    onOrderChange={handleChangeOrder}
                    onResfreshClick={onResfreshClick}
                />
                <TableContainer sx={{ overflowY: 'auto', transition: 'height .5s, marginTop .5s', height: tableHeightStyle }}>
                    {vScroll && <Scrollbar>{table}</Scrollbar>}
                    {!vScroll && table}
                </TableContainer>
            </>
        );
    };

    useEffect(() => {
        if (!onUpdate) return;
        if (!filterOpen) return; // aplica cuando el panel de filtros esté activo, ajusta a tu UX

        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
            onUpdate(
                {
                    ...updateParams,
                    page: 1,
                    searchText: currentSearchtext,
                    filters: currentFilters
                },
                { setLoading }
            );
        }, 400);
    }, [currentSearchtext, currentFilters]);

    return (
        <Paper
            sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingBottom: '16px',
                paddingTop: '4px'
            }}
            variant="outlined"
            square
        >
            {actionBarEnable && (
                <ActionBar
                    onFilterClick={isSmallScreen || (typeof showFilters !== 'undefined' && !showFilters) ? undefined : handleClickFilter}
                    onResfreshClick={typeof showRefresh !== 'undefined' && !showRefresh ? undefined : handleClickRefresh}
                    onSearchClick={typeof showSearch !== 'undefined' && !showSearch ? undefined : handleClickSearch}
                    onSearchTextChange={handleChangeSearchText}
                    onActionAddClick={onActionAddClick ? handleClickActionAdd : undefined}
                    onDownloadClick={onDownloadClick ? handleClickDownload : undefined}
                    onDownloadExcel={onDownloadExcel ? handleClickDownloadExcel : undefined}
                    updateParams={updateParams}
                    headers={headers}
                    loading={isLoading || undefined}
                    loadingE={isLoadingE || undefined}
                />
            )}
            {loading && <LinearProgress sx={{ height: '4px', background: '#e0e0e0', zIndex: 9 }} color="primary" variant="indeterminate" />}
            {renderTableData()}
            {!hiddenPagination && (
                <Box>
                    <TablePagination
                        labelDisplayedRows={({ from, to, count }) => `Mostrando ${from}-${to} de ${count}`}
                        labelRowsPerPage="Filas por pagina"
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={count}
                        rowsPerPage={rowsPerPage}
                        page={page - 1}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Box>
            )}
        </Paper>
    );
};

export const DataTable = forwardRef(DataTableComponent);
