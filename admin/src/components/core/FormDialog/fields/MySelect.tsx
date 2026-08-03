import React, { ReactElement, useEffect, useState } from 'react';
import { useField, FormikValues, FormikProps } from 'formik';

// material-ui
import { FormControl, InputLabel, MenuItem, Select, FormHelperText, SelectChangeEvent } from '@mui/material';

import { FormValue, SelectOption, OnChangeFunction } from '../Types';

const DEFAULT_SELECT = 'filled';
const SIN_OPCIONES_TEXT = ' >>> Sin opciones <<<';

type Props = {
    name: string;
    label: string;
    disabled?: boolean;
    value?: string | number;
    error?: boolean;
    helperText?: string;
    formik?: FormikProps<FormikValues>;
    options: SelectOption[] | ((formValue: FormValue) => SelectOption[]);
    fieldRequired?: string;
    variant?: 'filled' | 'standard' | 'outlined';
    onChange?: OnChangeFunction;
};

export const MySelect = (props: Props): ReactElement => {
    const { name, label, error, helperText, formik } = props;
    const [field, meta] = useField<string | number>(name);

    const errorText = meta.error && meta.touched ? meta.error : '';

    const OPTIONS = typeof props.options === 'function' ? props.options(formik?.values as FormValue) : props.options;
    const VARIANT_SELECT = props.variant || DEFAULT_SELECT;
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

    const handleChange = (event: SelectChangeEvent<any>) => {
        const newValue = event.target.value as number | string;
        if (newValue === SIN_OPCIONES_TEXT) return;

        if (props.onChange) props.onChange(newValue, formik);
        else formik?.setFieldValue(name, newValue);
    };

    // controlled or uncontrolled
    const _val = typeof props.value !== 'undefined' ? props.value : field.value;
    const VALUE = OPTIONS.find((opt) => opt.value === _val) ? _val : '';

    return (
        <FormControl sx={{ width: '100%' }} variant={VARIANT_SELECT} error={error || !!errorText}>
            <InputLabel id={`${name}-label`}>{label}</InputLabel>
            <Select
                sx={{
                    width: '100%',
                    margin: 0,
                    padding: 0,
                    '& .MuiSelect-nativeInput': {
                        width: 'unset'
                    },
                    '& .MuiSelect-select': {
                        fontSize: '12px'
                    }
                }}
                labelId={`${name}-label`}
                id={name}
                value={OPTIONS.length === 0 ? '' : VALUE || ''}
                onChange={handleChange}
                disabled={DISABLED}
                SelectDisplayProps={{ style: { fontSize: 14 } }}
            >
                {OPTIONS.length === 0 && (
                    <MenuItem key={SIN_OPCIONES_TEXT} value={SIN_OPCIONES_TEXT} style={{ whiteSpace: 'normal' }} dense>
                        {SIN_OPCIONES_TEXT}
                    </MenuItem>
                )}
                {OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value} style={{ whiteSpace: 'normal' }} dense>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
            <FormHelperText>{helperText || errorText}</FormHelperText>
        </FormControl>
    );
};
