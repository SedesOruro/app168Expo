import React, { ReactElement, useEffect, useState } from 'react';
import { parse as dateParse, format as dateFormat } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme, FormControl } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

type Props = {
    name: string;
    label: string;
    value?: string;
    onChange: (name: string, value: string) => void;
};

const DEFAULT_FORMAT = 'dd/MM/yyyy';
const DEFAULT_FORMAT_ISO = 'yyyy-MM-dd'; // Formato ISO
const DEFAULT_DISABLE_PAST = false;

export const DateFilter = ({ name, label, value, onChange }: Props): ReactElement => {
    const [innerValue, setInnerValue] = useState<Date | null>(value ? dateParse(value, DEFAULT_FORMAT_ISO, new Date()) : null);
    const theme = useTheme();

    useEffect(() => {
        setInnerValue(value ? dateParse(value, DEFAULT_FORMAT_ISO, new Date()) : null);
    }, [value]);

    const handleDateChange = (date: Date | null) => {
        if (date) {
            const formattedDate = dateFormat(date, DEFAULT_FORMAT_ISO);
            onChange(name, formattedDate);
        } else {
            onChange(name, '');
        }
    };

    return (
        <FormControl
            sx={{
                width: '100%',
                //margin: theme.spacing(0, 1),
                bgcolor: theme.palette.common.white
            }}
        >
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                    label={label}
                    disabled={false}
                    disablePast={DEFAULT_DISABLE_PAST}
                    format={DEFAULT_FORMAT}
                    value={innerValue}
                    onChange={handleDateChange}
                    slotProps={{ textField: { variant: 'outlined', size: 'small' } }}
                />
            </LocalizationProvider>
        </FormControl>
    );
};
