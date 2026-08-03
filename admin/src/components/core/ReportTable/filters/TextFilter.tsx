import { makeStyles } from 'tss-react/mui';
import React, { ReactElement } from 'react';

import { Theme, FormControl, TextField } from '@mui/material';

type Props = {
    name: string;
    label: string;
    value?: string;
    onChange: (name: string, value: string) => void;
};

export const TextFilter = ({ name, label, value, onChange }: Props): ReactElement => {
    const { classes } = useStyles();

    return (
        <FormControl className={classes.formControl}>
            <TextField
                name={name}
                label={label}
                value={value || ''}
                onChange={(evt) => onChange(evt.target.name as string, evt.target.value as string)}
            />
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
