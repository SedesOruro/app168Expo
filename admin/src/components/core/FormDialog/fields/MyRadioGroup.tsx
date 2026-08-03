import React, { ReactElement, useEffect, useState } from 'react';
import { useField, FormikValues, FormikProps } from 'formik';

// material-ui
import { FormControl, FormHelperText, RadioGroup, FormControlLabel, Radio, FormLabel, useTheme } from '@mui/material';

import { FormValue, SelectOption, OnChangeFunction } from '../Types';

const DEFAULT_INLINE_DISPLAY = false;
// const DEFAULT_VARIANT = 'filled';

type Props = {
    name: string;
    label: string;
    value?: string;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
    formik?: FormikProps<FormikValues>;
    options: SelectOption[] | ((formValue: FormValue) => SelectOption[]);
    inlineDisplay?: boolean;
    fieldRequired?: string;
    onChange?: OnChangeFunction;
    variant?: 'filled' | 'standard' | 'outlined';
};

export const MyRadioGroup = (props: Props): ReactElement => {
    const { name, label, error, helperText, formik } = props;
    const [field, meta] = useField<string>(name);
    const theme = useTheme();
    const errorText = meta.error && meta.touched ? meta.error : '';

    const OPTIONS = typeof props.options === 'function' ? props.options(formik?.values as FormValue) : props.options;
    const INLINE_DISPLAY = typeof props.inlineDisplay === 'boolean' ? props.inlineDisplay : DEFAULT_INLINE_DISPLAY;

    // const VARIANT = props.variant  || DEFAULT_VARIANT;
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

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = String(event.target.value);
        if (props.onChange) props.onChange(newValue, formik);
        else formik?.setFieldValue(name, newValue);
    };

    // controlled or uncontrolled
    const VALUE = typeof props.value !== 'undefined' ? props.value : field.value;

    return (
        <FormControl sx={{ width: '100%' }} component="fieldset" error={error || !!errorText}>
            <FormLabel component="legend">{label}</FormLabel>
            <RadioGroup
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'wrap',
                    ...(INLINE_DISPLAY && {
                        flexDirection: 'row',
                        flexWrap: 'wrap'
                    })
                }}
                name={name}
                value={OPTIONS.length === 0 ? '' : VALUE || ''}
                onChange={handleChange}
            >
                {OPTIONS.map((option) => (
                    <FormControlLabel sx={{ padding: theme.spacing(0, 2, 0, 0) }} key={option.value} value={option.value} control={<Radio />} label={option.label} disabled={DISABLED} />
                ))}
            </RadioGroup>
            <FormHelperText>{helperText || errorText}</FormHelperText>
        </FormControl>
    );
};
