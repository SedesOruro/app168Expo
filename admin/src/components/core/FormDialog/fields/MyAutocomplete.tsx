import React, { ReactElement, useState, useEffect } from 'react';
import { useField, FormikValues, FormikProps } from 'formik';

// material-ui
import { TextField, Typography, Box } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { FormValue, SelectOption, OnChangeFunction } from '../Types';

const SIN_OPCIONES_TEXT = ' >>> Sin opciones <<<';
const DEFAULT_VARIANT = 'filled';

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
    onChange?: OnChangeFunction;
    variant?: 'filled' | 'standard' | 'outlined';
};

export const MyAutocomplete = (props: Props): ReactElement => {
    const { name, label, error, helperText, formik } = props;
    const [field, meta] = useField<string | number>(name);

    const errorText = meta.error && meta.touched ? meta.error : '';

    const VARIANT = props.variant || DEFAULT_VARIANT;
    const OPTIONS = typeof props.options === 'function' ? props.options(formik?.values as FormValue) : props.options;
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
    const VALUE = OPTIONS.find((opt) => opt.value === _val) || null;

    const handleChange = (event: React.ChangeEvent<unknown>, value: SelectOption | null) => {
        const newValue = value?.value || '';

        if (props.onChange) props.onChange(newValue, formik);
        else formik?.setFieldValue(name, newValue);
    };

    return (
        <Autocomplete
            loading
            renderOption = {(props: any, option: SelectOption) => {
                const { key, ...optionProps } = props;
                return (
                    <li key={Math.random()} {...optionProps}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '2px 0' }}>
                            <Typography variant="subtitle2" sx={{ lineHeight: 1 }}>
                                {option.label}
                            </Typography>
                            {option.caption && (
                                <Typography variant="caption" color="textSecondary" sx={{ lineHeight: 1 }}>
                                    {option.caption}
                                </Typography>
                            )}
                        </Box>
                    </li>
                );
            }}
            options={OPTIONS}
            getOptionLabel={(option: SelectOption) => {
                return option.caption ? `${option.label} - ${option.caption}` : `${option.label}`;
            }}
            autoHighlight
            isOptionEqualToValue={(option, value) => value.value === option.value}
            value={VALUE || null}
            disabled={DISABLED}
            noOptionsText={SIN_OPCIONES_TEXT}
            onChange={handleChange}
            sx={{ width: '100%', margin: 0 }}
            renderInput={(params) => <TextField {...params} name={name} label={label} variant={VARIANT} error={error || !!errorText} helperText={helperText || errorText} />}
        />
    );
};
