import React, { ReactElement, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import Scrollbar from '../_internal/Scrollbar';

// material-ui
import { Table, TableContainer, TablePagination, LinearProgress, useMediaQuery, useTheme, Box, Card, Paper } from '@mui/material';

// components
import { ActionBar } from './ActionBar';
import { DataTableHeader2 } from './DataTableHeader2';
import { DataTableBody2 } from './DataTableBody2';

// types
import { DataTableProps, DataTableRefProps, Filters, UpdateParams, MyTableModel } from './Types';
import { DataList } from './DataList';
import { useIsMounted } from '../_internal/useIsMounted';
import { DataTableFilters } from './DataTableFilters';
import DataListToolbar from './DataListToolbar';

const DataTableV2Component = (props: DataTableProps, ref: React.Ref<DataTableRefProps>): ReactElement => {
    const {
        updateParams,
        headers,
        showActionBar,
        showFilters,
        showRefresh,
        showSearch,
        hiddenPagination,
        isLoading,
        onUpdate,
        rowStyles,
        onRowClick,
        onActionAddClick,
        onActionOption1Click,
        onActionOption2Click,
        onDownloadClick,
        collapsableComponent,
        mobileComponent,
        vScroll
    } = props;

    const { rows, count, rowsPerPage, page, order, orderBy, searchText, filters, data } = updateParams;
    const isMounted = useIsMounted();

    const [filterOpen, setFilterOpen] = useState(false);
    const [loading, setLoadingState] = useState<boolean>(false);

    const [selected, setSelected] = useState<any[]>(rows);

    const setLoading = (value: boolean) => {
        if (isMounted()) setLoadingState(value);
    };

    const [currentFilters, setCurrentFilters] = useState<Filters | undefined>(filters);
    const [currentSearchtext, setCurrentSearchtext] = useState<string | undefined>(searchText);

    const actionBarEnable = typeof showActionBar === 'undefined' || showActionBar;

    const handleChangePage = (event: unknown, newPage: number) => {
        if (!onUpdate) return;
        onUpdate({ rows, count, rowsPerPage, page: newPage + 1, order, orderBy, searchText, filters: currentFilters, data }, { setLoading });
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!onUpdate) return;
        onUpdate(
            {
                rows,
                count,
                rowsPerPage: Number(event.target.value),
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

    const handleClickFilter = () => {
        setFilterOpen(!filterOpen);
    };

    const handleClickRefresh = () => {
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
    const tableHeightStyle = `100%`;

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

        const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
            if (event.target.checked) {
              const newSelecteds = rows.filter((s) => Boolean(s.estado) === true).map((n) => n.id);
              setSelected(newSelecteds);
              return;
            }           
            setSelected([]); 
        };

        const table = (
            <Table stickyHeader>
                <DataTableHeader2 
                    headers={headers} 
                    updateParams={updateParams} 
                    filterOpen={filterOpen} 
                    onFilterChange={handleChangeFilter} 
                    onOrderChange={handleChangeOrder}
                    rowCount={rows.filter((s) => s.estado === true).length}
                    numSelected={selected.length}
                    onSelectAllClick={handleSelectAllClick} 
                />
                <DataTableBody2 
                    headers={headers} 
                    updateParams={updateParams} 
                    rowStyles={rowStyles} 
                    onRowClick={onRowClick} 
                    collapsableComponent={collapsableComponent}
                    selected={selected}
                    setSelected={setSelected} 
                    loading={loading} 
                />
            </Table>
        );

        return (
            <>
                <DataTableFilters 
                    headers={headers} 
                    updateParams={updateParams} 
                    filterOpen={filterOpen} 
                    onFilterChange={handleChangeFilter} 
                    onOrderChange={handleChangeOrder} 
                />
                <TableContainer sx={{overflowY: 'auto', transition: 'height .5s, marginTop .5s', height: tableHeightStyle }}>
                    {vScroll && <Scrollbar>{table}</Scrollbar>}
                    {!vScroll && table}
                </TableContainer>
            </>
        );
    };    

    return (
        <Paper sx={{ 
            position: 'relative',
            width: '100%',
            height: 'auto',
            paddingLeft: '16px',
            paddingRight: '16px',
            paddingBottom: '16px',
            paddingTop: '4px', }} 
            variant="outlined" 
            square
        >
            <DataListToolbar 
                numSelected={selected.length}
                input={
                    actionBarEnable?(
                        <ActionBar
                            onFilterClick={isSmallScreen || (typeof showFilters !== 'undefined' && !showFilters) ? undefined : handleClickFilter}
                            onResfreshClick={typeof showRefresh !== 'undefined' && !showRefresh ? undefined : handleClickRefresh}
                            onSearchClick={typeof showSearch !== 'undefined' && !showSearch ? undefined : handleClickSearch}
                            onSearchTextChange={handleChangeSearchText}
                            onActionAddClick={onActionAddClick ? handleClickActionAdd : undefined}
                            onDownloadClick={onDownloadClick ? handleClickDownload : undefined}
                            updateParams={updateParams}
                            headers={headers}
                            loading={isLoading || undefined}
                        />
                    ): <></>
                }
                onActionOption1Click={() => {
                    setSelected([]);
                    return onActionOption1Click && onActionOption1Click(selected);
                }}                
            />
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

export const DataTableV2 = forwardRef(DataTableV2Component);
