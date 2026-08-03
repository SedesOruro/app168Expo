import { Breakpoint, useMediaQuery, useTheme } from '@mui/material';

export const useResponsive = (query: 'up' | 'down' | 'only', key: Breakpoint) => {
    const theme = useTheme();
    const queries = {
        up: theme.breakpoints.up(key),
        down: theme.breakpoints.down(key),
        only: theme.breakpoints.only(key)
    };

    return useMediaQuery(queries[query]);
};
