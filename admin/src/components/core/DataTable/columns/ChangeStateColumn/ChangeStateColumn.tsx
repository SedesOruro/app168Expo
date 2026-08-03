import React, { ReactElement, useState } from 'react';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

type Props = {
    data: string ;
    options: string[];
    label?: string;
    onChange?: (newValue: string) => Promise<any>;
};

export const ChangeStateColumn = ({ data, options, label, onChange }: Props): ReactElement => {
    const [loading, setLoading] = useState<boolean>(false);
    const [value, setValue] = React.useState(data);

    const handleChange = (event: SelectChangeEvent) => {
        const newValue = event.target.value;
        setLoading(true);
        if (onChange)
            onChange(newValue)
                .then(() => setLoading(false))
                .catch(() => setLoading(false));
        setValue(newValue);
    };

    return (
        <FormControl sx={{ minWidth: 50 }} size="small">
            <Select
                labelId="demo-select-small"
                id="demo-select-small"
                value={value}
                label={label}
                disabled={loading}
                onChange={handleChange}
                sx={{
                    fontSize: 10.5
                }}
            >
                {options.map((item, optIndex) => {
                    return (
                        <MenuItem
                            key={optIndex}
                            value={item}
                            sx={{
                                fontSize: 10.5
                            }}
                        >
                            {item}
                        </MenuItem>
                    );
                })}
            </Select>
        </FormControl>
    );
};
