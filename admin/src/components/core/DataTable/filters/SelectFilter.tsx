import React, { ReactElement, useEffect } from 'react';
import { FormControl, useTheme, InputLabel, Select, MenuItem, Divider } from '@mui/material';

import { FilterOption } from '../Types';

type Props = {
    name: string;
    label: string;
    value?: string;
    valueDefault?: string;
    options: FilterOption[];
    onChange: (name: string, value: string | number) => void;
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

export const SelectFilter = ({
    name,
    label,
    value,
    valueDefault,
    options,
    onChange,
}: Props): ReactElement => {
    const theme = useTheme();

    // Establecer valor por defecto si se pasa valueDefault
    useEffect(() => {
        if (valueDefault && !value) {
            onChange(name, valueDefault);
        }
    }, [valueDefault, value, name, onChange]);

    return (
        <FormControl
            sx={{
                width: '100%',
                maxWidth: '200px',
                minWidth: '80px',
                //margin: theme.spacing(0, 1),
                bgcolor: theme.palette.common.white,
            }}
        >
            <InputLabel id={`${name}Label`}>{label}</InputLabel>
            <Select
                labelId={`${name}Label`}
                name={name}
                value={value || ''}
                size="small"
                onChange={(evt) => onChange(evt.target.name as string, evt.target.value as string | number)}
                MenuProps={{
                    slotProps: {
                        paper: {
                            style: {
                                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                            },
                        },
                    },
                }}
            >
                <MenuItem key="0" value="" sx={{ fontSize: '0.725rem' }}>
                    TODOS
                </MenuItem>
                <Divider />
                {options.map((opt, optIndex) => (
                    <MenuItem key={optIndex} value={opt.value} sx={{ fontSize: '0.725rem' }}>
                        {opt.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};
