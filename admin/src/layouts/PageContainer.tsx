import { Box, SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';

type Props = {
    children: ReactNode;
    sx?: SxProps<Theme>;
};

export const PageContainer = ({ children, sx }: Props) => (
    <Box sx={{ width: 1, maxWidth: 1440, mx: 'auto', ...sx }}>
        {children}
    </Box>
);
