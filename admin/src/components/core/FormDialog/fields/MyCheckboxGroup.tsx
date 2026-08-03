import React, { ReactElement, useState, useEffect } from 'react';
import { useField, FormikValues, FormikProps } from 'formik';

// material-ui
import { FormControl, FormHelperText, FormControlLabel, FormLabel, Checkbox, FormGroup, useTheme } from '@mui/material';

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

export const MyCheckboxGroup = (props: Props): ReactElement => {
    const { name, label, error, helperText, formik } = props;
    const [field, meta] = useField<string>(name);

    const theme = useTheme();
    const errorText = meta.error && meta.touched ? meta.error : '';

    const OPTIONS = typeof props.options === 'function' ? props.options(formik?.values as FormValue) : props.options;
    const INLINE_DISPLAY = typeof props.inlineDisplay === 'boolean' ? props.inlineDisplay : DEFAULT_INLINE_DISPLAY;
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

    // controlled or uncontrolled
    const _val = typeof props.value !== 'undefined' ? props.value : field.value;
    let VALUE: { [key: string]: boolean } = {};
    try {
        VALUE = _val ? JSON.parse(_val || '{}') : {};
    } catch (err) {
        console.log(err);
    }

    const handleChange = (option: SelectOption, checked: boolean) => {
        const newFieldValue = { ...VALUE, [option.value]: checked };
        const newValue = JSON.stringify(newFieldValue);
        if (props.onChange) props.onChange(newValue, formik);
        else formik?.setFieldValue(name, newValue);
    };

    return (
        <FormControl sx={{ width: '100%' }} component="fieldset" error={error || !!errorText}>
            <FormLabel component="legend">{label}</FormLabel>
            <FormGroup
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'wrap',
                    ...(INLINE_DISPLAY && {
                        flexDirection: 'row',
                        flexWrap: 'wrap'
                    })
                }}
            >
                {OPTIONS.map((option) => (
                    <FormControlLabel
                        key={option.value}
                        control={
                            <Checkbox
                                checked={VALUE[option.value] || false}
                                onChange={(event) => handleChange(option, event.target.checked)}
                                name={name}
                                disabled={DISABLED}
                                indeterminate={VALUE[option.value] === null}
                            />
                        }
                        label={option.label}
                    />
                ))}
            </FormGroup>
            <FormHelperText>{helperText || errorText}</FormHelperText>
        </FormControl>
    );
};
