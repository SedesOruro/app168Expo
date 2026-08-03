import React, { ReactElement, useEffect, useState } from 'react';
import { useField, FormikProps, FormikValues } from 'formik';

// material-ui
import { FormControl, FormGroup, FormControlLabel, FormHelperText, useTheme } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import { OnChangeFunction } from '../Types';

const DEFAULT_ERROR_MESSAGE = 'El campo es obligatorio';
// const DEFAULT_VARIANT = 'filled';

type Props = {
    name: string;
    label: string;
    value?: boolean | null;
    disabled?: boolean;
    fieldRequired?: string;
    error?: boolean;
    helperText?: string;
    formik?: FormikProps<FormikValues>;
    variant?: 'filled' | 'standard' | 'outlined';
    onChange?: OnChangeFunction;
};

export const MyCheckbox = (props: Props): ReactElement => {
    const { name, label, error, helperText, formik } = props;
    const [field, meta] = useField<boolean | null>(name);
    const theme = useTheme();
    const errorText = error ? DEFAULT_ERROR_MESSAGE : meta.error && meta.touched ? meta.error : '';

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

    const handleChange = (value: boolean) => {
        const newValue = value;

        if (props.onChange) props.onChange(newValue, formik);
        else formik?.setFieldValue(name, newValue);
    };

    // controlled or uncontrolled
    const VALUE = typeof props.value !== 'undefined' ? props.value : field.value;
    const INDETERMINATE = VALUE === null;

    return (
        <FormControl error={error || !!errorText} component="fieldset" sx={{ padding: theme.spacing(0, 1.5) }}>
            <FormGroup>
                <FormControlLabel
                    control={<Checkbox checked={VALUE || false} onChange={(event) => handleChange(event.target.checked)} name={name} disabled={DISABLED} indeterminate={INDETERMINATE} />}
                    label={label}
                />
            </FormGroup>
            <FormHelperText>{helperText || errorText}</FormHelperText>
        </FormControl>
    );
};
