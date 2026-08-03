import { makeStyles } from 'tss-react/mui';
import React, { ReactElement, useEffect, useState } from 'react';
import clsx from 'clsx';

// material-ui
import { Theme, Box } from '@mui/material';

// types
import { DataTableHeaderProps, ReportFilters } from './Types';
import { SelectFilter } from './filters/SelectFilter';
import { TextFilter } from './filters/TextFilter';

export const DataTableFilters = (props: DataTableHeaderProps): ReactElement => {
    const { updateParams, onFilterChange, filterOpen } = props;
    const { infoHeader } = updateParams;
    const { classes } = useStyles();

    const [stateFilters, setStateFilters] = useState<ReportFilters>(updateParams.filters || {});

    const handleChangeFilterSelect = (name: string, value: string | number) => {
        const newFilters = { ...stateFilters, [name]: value };
        setStateFilters(newFilters);
        onFilterChange(newFilters);
    };

    useEffect(() => {
        setStateFilters(updateParams.filters || {});
    }, [updateParams.filters]);

    const renderFilterRow = (): ReactElement => {
      if (infoHeader.length === 0) return <></>;
        return (
            <Box className={clsx(classes.filterBox, { [classes.filterBoxOpen]: filterOpen })}>
                {infoHeader.map((column, columnIndex) => {
                    if (column.filter && column.filter.type === 'text') {
                        return (
                            <Box key={columnIndex} className={classes.filterItem}>
                                <TextFilter
                                    name={column.id as string}
                                    label={column.label}
                                    onChange={handleChangeFilterSelect}
                                    value={stateFilters ? (stateFilters[column.id] as string) : ''}
                                />
                            </Box>
                        );
                    }
                    if (column.filter && column.filter.type === 'select') {
                        return (
                            <Box key={columnIndex} className={classes.filterItem}>
                                <SelectFilter
                                    name={column.id as string}
                                    label={column.label}
                                    options={column.filter.options || []}
                                    onChange={handleChangeFilterSelect}
                                    value={stateFilters ? (stateFilters[column.id] as string) : ''}
                                />
                            </Box>
                        );
                    }
                    return <Box key={columnIndex}></Box>;
                })}
            </Box>
        );
    };

    return renderFilterRow();
};

const useStyles = makeStyles()((theme: Theme) => ({
    filterBox: {
        display: 'flex',
        justifyContent: 'left',
        height: theme.spacing(0),
        alignItems: 'center',
        overflow: 'hidden',
        transition: 'height .5s, marginTop .5s',
        background: '#eee',
        overflowX: 'auto',
    },
    filterBoxOpen: {
        height: theme.spacing(8),
    },
    filterItem: {
        minWidth: '120px',
        margin: theme.spacing(0, 2),
    },
}));
