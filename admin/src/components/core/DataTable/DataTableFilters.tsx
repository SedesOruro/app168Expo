import React, { forwardRef, ReactElement, useEffect, useImperativeHandle, useRef, useState } from 'react';

// material-ui
import { useTheme, Box } from '@mui/material';

// types
import { DataTableHeaderProps, Filters } from './Types';
import { SelectFilter } from './filters/SelectFilter';
import { TextFilter } from './filters/TextFilter';
import { DateFilter } from './filters/DateFilter';

export type DataTableFiltersHandle = { apply: () => void };

export const DataTableFilters = forwardRef<DataTableFiltersHandle, DataTableHeaderProps>((props, ref) => {
    const { headers, updateParams, filterOpen, onFilterChange, onResfreshClick } = props;
    const theme = useTheme();
    const [stateFilters, setStateFilters] = useState<Filters>(updateParams.filters || {});
    const prevFilterOpenRef = useRef<boolean | undefined>(filterOpen);

    // Aplica (commit) los filtros vigentes y refresca
    const applyCurrentFilters = (): void => {
        const cleaned: Filters = { ...stateFilters };
        Object.keys(cleaned).forEach((k) => cleaned[k] === '' && delete cleaned[k]);
        setStateFilters(cleaned);
        onFilterChange(cleaned);
        onResfreshClick?.();
    };

    useImperativeHandle(ref, () => ({
        apply: applyCurrentFilters
    }));

    // 🔄 Re-sync externo
    useEffect(() => {
        setStateFilters(updateParams.filters || {});
    }, [updateParams.filters]);

    useEffect(() => {
        const wasOpen = prevFilterOpenRef.current;
        const isOpen = filterOpen;
        if (wasOpen && isOpen === false) {
            setStateFilters({});
            onFilterChange({});
        }
        prevFilterOpenRef.current = isOpen;
    }, [filterOpen, onFilterChange]);

    const renderFilterRow = (): ReactElement => {
        return (
            <Box
                sx={[
                    {
                        display: 'flex',
                        justifyContent: 'left',
                        height: theme.spacing(0),
                        alignItems: 'center',
                        overflow: 'hidden',
                        transition: 'height .5s, marginTop .5s',
                        borderRadius: 0,
                        background: '#eee'
                    },
                    filterOpen && {
                        overflowX: 'auto',
                        height: theme.spacing(9)
                    }
                ]}
            >
                {headers.map((column, columnIndex) => {
                    const name = column.id as string;
                    const value = String(stateFilters[name] ?? '');

                    if (column.filter?.type === 'text') {
                        // 👉 solo estado local; Enter hace commit + refresh
                        return (
                            <Box key={columnIndex} sx={{ minWidth: '80px', margin: theme.spacing(0, 1) }}>
                                <TextFilter
                                    name={name}
                                    label={column.label}
                                    value={value}
                                    onChange={(n, v) => setStateFilters((prev) => ({ ...prev, [n]: v }))}
                                    onEnterPress={applyCurrentFilters}
                                    onKeyDown={(e: { key: string }) => {
                                        if (e.key === 'Enter') applyCurrentFilters();
                                    }}
                                />
                            </Box>
                        );
                    }

                    if (column.filter?.type === 'select') {
                        // ✅ ahora: solo actualiza estado local (NO commit inmediato)
                        return (
                            <Box key={columnIndex} sx={{ minWidth: '120px', margin: theme.spacing(0, 1) }}>
                                <SelectFilter
                                    name={name}
                                    label={column.label}
                                    value={value}
                                    options={column.filter.options || []}
                                    onChange={(n, v) => setStateFilters((prev) => ({ ...prev, [n]: v }))}
                                />
                            </Box>
                        );
                    }

                    if (column.filter?.type === 'date') {
                        // ✅ ahora: solo actualiza estado local (NO commit inmediato)
                        return (
                            <Box key={columnIndex} sx={{ minWidth: '80px', margin: theme.spacing(0, 1) }}>
                                <DateFilter name={name} label={column.label} value={value} onChange={(n, v) => setStateFilters((prev) => ({ ...prev, [n]: v }))} />
                            </Box>
                        );
                    }

                    return null;
                })}
            </Box>
        );
    };

    return renderFilterRow();
});
