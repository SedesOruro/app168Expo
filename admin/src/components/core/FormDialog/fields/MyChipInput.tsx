import React, { ReactElement, useEffect, useState } from 'react';
import { useField, Field, FormikValues, FormikProps } from 'formik';

// material-ui
import { useTheme } from '@mui/material';
import ChipInput from '@mui/material/Chip';
import { OnChangeFunction } from '../Types';

const DEFAULT_VARIANT = 'filled';

type Props = {
    name: string;
    label: string;
    value?: string[];
    disabled?: boolean;
    fieldRequired?: string;
    error?: boolean;
    helperText?: string;
    formik?: FormikProps<FormikValues>;
    onChange?: OnChangeFunction;
    variant?: 'filled' | 'standard' | 'outlined';
};

export const MyChipInput = (props: Props): ReactElement => {
    const { name, label, error, helperText, formik } = props;
    const [field, meta] = useField<string[]>(name);
    const theme = useTheme();

    const errorText = meta.error && meta.touched ? meta.error : '';

    // controlled or uncontrolled
    const VALUE = typeof props.value !== 'undefined' ? props.value : field.value;

    const VARIANT = props.variant || DEFAULT_VARIANT;
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

    const handleAdd = (value: string) => {
        const emptyArray: string[] = [];
        const newValue = emptyArray.concat(VALUE || [], value);

        if (props.onChange) props.onChange(newValue, formik);
        else formik?.setFieldValue(name, newValue);
    };

    const handleDelete = (value: string) => {
        const emptyArray: string[] = [];
        const newValue = emptyArray.concat(VALUE).filter((item: string) => item !== value);

        if (props.onChange) props.onChange(newValue, formik);
        else formik?.setFieldValue(name, newValue);
    };

    return (
        <Field
            variant={VARIANT}
            sx={{
                width: '100%',
                height: '100%',
                marginTop: theme.spacing(0),
                marginBottom: theme.spacing(2)
            }}
            component={ChipInput}
            name={name}
            label={label}
            helperText={helperText || errorText}
            error={error || !!errorText}
            value={VALUE || []}
            onAdd={handleAdd}
            onDelete={handleDelete}
            disabled={DISABLED}
        ></Field>
    );
};
