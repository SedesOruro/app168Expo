import { makeStyles } from 'tss-react/mui';
import React, { ReactElement } from 'react';

import { Theme, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

import { FilterOption } from '../Types';

type Props = {
    name: string;
    label: string;
    value?: string;
    options: FilterOption[];
    onChange: (name: string, value: string | number) => void;
};

export const SelectFilter = ({ name, label, value, options, onChange }: Props): ReactElement => {
    const { classes } = useStyles();

    return (
        <FormControl className={classes.formControl}>
            <InputLabel id={`${name}Label`}>{label}</InputLabel>
            <Select
                labelId={`${name}Label`}
                name={name}
                onChange={(evt) => onChange(evt.target.name as string, evt.target.value as string | number)}
                value={options.map(opt => opt.value).includes(`${value}`) ? value : 'TODOS'}
                // disabled={options.length === 1}
            >
                <MenuItem key="0" value="TODOS">
                    TODOS
                </MenuItem>
                {options.map((opt, optIndex) => {
                    return (
                        <MenuItem key={optIndex} value={opt.value}>
                            {opt.label}
                        </MenuItem>
                    );
                })}
            </Select>
        </FormControl>
    );
};

const useStyles = makeStyles()((theme: Theme) => ({
    formControl: {
        width: '100%',
        margin: theme.spacing(0, 1),
        overflow: 'hidden',
    },
}));
