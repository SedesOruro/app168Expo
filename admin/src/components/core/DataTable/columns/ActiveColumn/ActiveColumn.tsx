import React, { ReactElement, useState } from 'react';
import { Box, Switch } from '@mui/material';

type Props = {
    active: boolean | number | string | null | undefined;
    onActiveChange?: (newValue: boolean) => Promise<any>;
};

export const ActiveColumn = ({ active, onActiveChange }: Props): ReactElement => {
    const [loading, setLoading] = useState<boolean>(false);

    const normalizeToBool = (value: Props['active']): boolean => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value === 1;
        if (value == null) return false;

        const text = String(value).trim().toUpperCase();
        return text === '1' || text === 'TRUE' || text === 'S' || text === 'SI' || text === 'Y' || text === 'YES' || text === 'ACTIVO' || text === 'A';
    };

    const handleClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!onActiveChange) return;

        setLoading(true);
        onActiveChange(event.target.checked)
            .then(() => setLoading(false))
            .catch(() => setLoading(false));
    };

    return (
        <Box
            sx={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center'
            }}
        >
            <Switch checked={normalizeToBool(active)} onChange={handleClick} disabled={loading || !onActiveChange} name="checked" slotProps={{ input: { 'aria-label': 'active switch' } }} />
        </Box>
    );
};
