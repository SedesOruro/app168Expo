import React, { ReactElement, useState, useEffect, useCallback } from 'react';
import { useField, FormikProps, FormikValues } from 'formik';
import { es } from 'date-fns/locale';
// material-ui
import { FormControl, FormHelperText } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { OnChangeFunction } from '../Types';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { useDebouncedCallback } from 'use-debounce';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// tiempo en milisegundos para que se guarden los datos
const DEFAULT_DELAY = 500;

const DEFAULT_FORMAT = 'dd/MM/yyyy';
const DEFAULT_DISABLE_PAST = false;
const DEFAULT_VARIANT = 'filled';

type Props = {
    name: string;
    label: string;
    value?: string;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
    formik?: FormikProps<FormikValues>;
    disablePast?: boolean;
    format?: string;
    fieldRequired?: string;
    variant?: 'filled' | 'standard' | 'outlined';
    onChange?: OnChangeFunction;
    delay?: number;
};

export const MyDatePicker = (props: Props): ReactElement => {
    const { name, label, error, helperText, formik, delay } = props;
    const [field, meta] = useField<string>(name);

    const errorText = meta.error && meta.touched ? meta.error : '';

    const FORMAT = props.format || DEFAULT_FORMAT;
    const DISABLE_PAST = typeof props.disablePast === 'boolean' ? props.disablePast : DEFAULT_DISABLE_PAST;
    const VARIANT = props.variant || DEFAULT_VARIANT;
    const DELAY = delay || DEFAULT_DELAY;

    const FIELD_REQUIRED = props.fieldRequired;
    const [DISABLED, setDisabled] = useState(false);
    const requiredValue = FIELD_REQUIRED ? formik?.values[FIELD_REQUIRED] : undefined;
    useEffect(() => {
        const disableByProp = typeof props.disabled !== 'undefined' ? props.disabled : false;
        let newFieldDisabled = disableByProp;
        if (!disableByProp && FIELD_REQUIRED) {
            newFieldDisabled =
                requiredValue === undefined ||
                requiredValue === '' ||
                requiredValue === null ||
                requiredValue === '[]' || // Para los archivos adjuntos (MyDropzone)
                requiredValue === '{}' || // Para los grupos de checkbox (MyCheckboxGroup)
                (Array.isArray(requiredValue) && requiredValue.length === 0);
        }
        setDisabled(newFieldDisabled);
    }, [props.disabled, FIELD_REQUIRED, requiredValue]);

    const handleChange = (value?: Date | null) => {
        const newValue = value as unknown as string;

        if (props.onChange) return props.onChange(newValue, formik);
        formik?.setFieldValue(name, newValue);
    };

    // controlled or uncontrolled
    const VALUE = typeof props.value !== 'undefined' ? props.value : field.value;
    const currentValue = VALUE ? new Date(VALUE) : null;
    //const [innerValue, setInnerValue] = useState<Date | null>(VALUE ? dateParse(VALUE, FORMAT, new Date()) : null);
    const [innerValue, setInnerValue] = useState<Date | null>(VALUE ? new Date(VALUE) : null);
    
    const debouncedHandleOnChange = useDebouncedCallback((value?: Date | null) => {
        handleChange(value);
    }, DELAY);

    const handleOnChange = useCallback(
        (value?: Date | null) => {
            debouncedHandleOnChange(value);
        },
        [debouncedHandleOnChange]
    );

    useEffect(() => {
        //setInnerValue(VALUE ? dateParse(VALUE, FORMAT, new Date()) : null);
        setInnerValue(VALUE ? new Date(VALUE) : null);
    }, [VALUE, FORMAT]);

    return (
        <FormControl sx={{ width: '100%' }} variant={VARIANT} error={error || !!errorText}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                    label={label}
                    disabled={DISABLED}
                    disablePast={DISABLE_PAST}
                    format={FORMAT}
                    value={delay === 0 ? currentValue : innerValue}
                    onChange={(newValue: any) => (delay === 0 ? handleChange(newValue) : handleOnChange(newValue))}
                    slotProps={{ textField: { variant: VARIANT } }}
                />
                <FormHelperText>{helperText || errorText}</FormHelperText>
            </LocalizationProvider>
        </FormControl>
    );
};
