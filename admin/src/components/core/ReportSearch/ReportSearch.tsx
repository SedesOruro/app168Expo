import React, { ReactElement } from 'react';
import clsx from 'clsx';

import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import { UpdateParams, MyTableModel } from '../ReportTable';

type ActionSearchProps = {
    variant?: 'light' | 'dark';
    onSearchClick?: (searchText: string) => void;
    onSearchTextChange?: (searchText: string) => void;
    updateParams?: UpdateParams<MyTableModel>;
    onUpdate?: (params: UpdateParams<MyTableModel>) => void;
    loading?: boolean;
};

export const ReportSearch = ({
    variant,
    updateParams,
    onSearchClick,
    onSearchTextChange,
    onUpdate,
    loading,
}: ActionSearchProps): ReactElement => {
    const { classes } = useStyles();

    const [currentSearchText, setCurrentSearchText] = React.useState<string>(
        (updateParams && updateParams.searchText) || '',
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchText = e.target.value;
        setCurrentSearchText(newSearchText);

        if (onSearchTextChange) {
            onSearchTextChange(e.target.value);
        }
    };

    const handleSubmit = (event: React.MouseEvent) => {
        event.preventDefault();

        if (onUpdate && updateParams) {
            return onUpdate({
                infoHeader: updateParams.infoHeader,
                headerExcel: updateParams.headerExcel,
                bodyExcel: updateParams.bodyExcel,
                count: updateParams.count,
                rowsPerPage: updateParams.rowsPerPage,
                page: 1,
                order: updateParams.order,
                orderBy: updateParams.orderBy,
                searchText: currentSearchText,
                filters: updateParams.filters,
            });
        }

        if (onSearchClick) {
            onSearchClick(currentSearchText);
        }
    };

    return (
        <Paper component="form" className={clsx(classes.root, { light: variant === 'light' })}>
            <InputBase
                className={clsx(classes.input, { light: variant === 'light' })}
                placeholder="Buscar"
                inputProps={{ 'aria-label': 'buscar lista' }}
                disabled={loading}
                onChange={handleChange}
                value={currentSearchText}
            />
            <IconButton
                type="submit"
                className={classes.iconButton}
                aria-label="buscar"
                disabled={loading}
                onClick={handleSubmit}
            >
                <SearchIcon />
            </IconButton>
        </Paper>
    );
};

const useStyles = makeStyles()((theme: Theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        height: theme.spacing(5),
        minWidth: theme.spacing(20),
        padding: theme.spacing(0),
        margin: theme.spacing(0),
        background: '#fff',
        boxShadow: 'unset',
        border: 'solid #c1c1c1 1px',
        '&.light': {
            background: '#eeeeee',
            border: 'solid #e0e0e0 1px',
        },
    },
    input: {
        margin: theme.spacing(0, 1, 0, 1),
        flex: 1,
    },
    iconButton: {
        margin: 0,
        padding: theme.spacing(1),
        borderTopLeftRadius: theme.spacing(0),
        borderBottomLeftRadius: theme.spacing(0),
        borderTopRightRadius: theme.spacing(0.5),
        borderBottomRightRadius: theme.spacing(0.5),
        background: theme.palette.primary.main,
        color: 'white',
        '&:hover': {
            background: theme.palette.primary.dark,
        },
    },
}));
