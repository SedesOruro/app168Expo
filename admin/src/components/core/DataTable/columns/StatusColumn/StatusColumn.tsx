import React, { ReactElement } from 'react';

import { Box } from '@mui/material';

type Props = {
    status: string;
    color?: string;
    background?: string;
    maxWidth?: string;
};

export const StatusColumn = ({ status, color = '#000', background = '#fff', maxWidth = '200px' }: Props): ReactElement => {
    return (
        <Box component="div" sx={{ minWidth: '60px', color, background, fontSize: '0.725rem', py: 0.5, px: 1.5, borderRadius: '1.5rem', textAlign: 'center' }}>
            {status}
        </Box>
    );
};
