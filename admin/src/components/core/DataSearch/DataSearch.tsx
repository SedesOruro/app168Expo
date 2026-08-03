import React, { ReactElement } from 'react';

import { InputAdornment, OutlinedInput, styled, useMediaQuery, useTheme } from '@mui/material';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import { UpdateParams, MyTableModel } from '../DataTable';
import Iconify from '../_internal/Iconify';

type ActionSearchProps = {
    onSearchClick?: (searchText: string) => void;
    onSearchTextChange?: (searchText: string) => void;
    updateParams?: UpdateParams<MyTableModel>;
    onUpdate?: (params: UpdateParams<MyTableModel>) => void;
    loading?: boolean;
};

const SearchStyle = styled(OutlinedInput)(() => {
    const theme = useTheme<any>();
    return {
        width: 240,
        height: 48,
        transition: theme.transitions.create(['box-shadow', 'width'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shorter
        }),
        '&.Mui-focused': { width: 300, boxShadow: theme.customShadows.z8 },
        '& fieldset': {
            borderWidth: `1px !important`,
            borderColor: `${theme.palette.grey[500_32]} !important`
        }
    };
});

export const DataSearch = ({ updateParams, onSearchClick, onSearchTextChange, onUpdate, loading }: ActionSearchProps): ReactElement => {
    const theme = useTheme();
    const direccion = useMediaQuery(theme.breakpoints.up('sm'));
    const [currentSearchText, setCurrentSearchText] = React.useState<string>((updateParams && updateParams.searchText) || '');

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
                rows: updateParams.rows,
                count: updateParams.count,
                rowsPerPage: updateParams.rowsPerPage,
                page: 1,
                order: updateParams.order,
                orderBy: updateParams.orderBy,
                searchText: currentSearchText,
                filters: updateParams.filters
            });
        }

        if (onSearchClick) {
            onSearchClick(currentSearchText);
        }
    };

    return (
        <SearchStyle
            value={currentSearchText}
            onChange={handleChange}
            placeholder="Buscar..."
            disabled={loading}
            sx={{ my: direccion ? 0 : 2 }}
            endAdornment={
                <InputAdornment position="start">
                    <IconButton aria-label="toggle visibility" onClick={handleSubmit}>
                        <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 24, height: 24 }} />
                    </IconButton>
                </InputAdornment>
            }
        />
    );
};
