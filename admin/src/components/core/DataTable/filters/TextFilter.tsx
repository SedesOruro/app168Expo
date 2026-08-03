import React, { ReactElement } from 'react';

import { useTheme, FormControl, TextField } from '@mui/material';

type Props = {
    name         : string;
    label        : string;
    value       ?: string;
    onChange     : (name: string, value: string) => void;
    onEnterPress?: () => void;
    onKeyDown   ?: (e: { key: string; }) => void
};

export const TextFilter = ({ name, label, value, onChange, onEnterPress }: Props): ReactElement => {
    const theme = useTheme();
    return (
        <FormControl
            sx={{
                width: '100%',
                //margin: theme.spacing(0, 1),
                bgcolor: theme.palette.common.white
                //overflow: 'hidden'
            }}
        >
            <TextField
                name={name}
                label={label}
                value={value || ''}
                variant="outlined"
                size="small"
                sx={{
                    '& .MuiInputLabel-root': { color: '#919EAB' }
                }}
                onChange={(evt) => onChange(evt.target.name as string, evt.target.value as string)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        if (typeof onEnterPress === 'function') {
                            onEnterPress();
                        }
                    }
                }}
            />
        </FormControl>
    );
};
