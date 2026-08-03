import React, { ReactElement, ChangeEvent, useEffect, useState, useCallback } from 'react';
import { useField, FormikValues, FormikProps } from 'formik';

// material-ui
import { TextField } from '@mui/material';
import { OnChangeFunction } from '../Types';
import { useDebouncedCallback } from 'use-debounce';

// tiempo en milisegundos para que se guarden los datos
const DEFAULT_DELAY = 500;

const DEFAULT_ROWS = undefined;
const DEFAULT_VARIANT = 'filled';

type Props = {
    name: string;
    label: string;
    value?: string;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
    formik?: FormikProps<FormikValues>;
    rows?: number;
    fieldRequired?: string;
    onChange?: OnChangeFunction;
    delay?: number;
    variant?: 'filled' | 'standard' | 'outlined';
};

export const MyTextArea = (props: Props): ReactElement => {
    const { name, label, error, helperText, formik, delay } = props;
    const [field, meta] = useField<string>(name);

    const errorText = meta.error && meta.touched ? meta.error : '';

    const ROWS = props.rows || DEFAULT_ROWS;
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

    // controlled or uncontrolled
    const VALUE = typeof props.value !== 'undefined' ? props.value : field.value;
    const [innerValue, setInnerValue] = useState(VALUE || '');

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue = String(event.target.value);
        if (typeof props.onChange !== 'undefined') {
            return props.onChange(newValue, formik);
        }
        formik?.setFieldValue(name, newValue);
    };

    const debouncedHandleOnChange = useDebouncedCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(event);
    }, DELAY);

    const handleOnChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            event.persist();
            setInnerValue(event.currentTarget.value);
            debouncedHandleOnChange(event);
        },
        [debouncedHandleOnChange]
    );

    useEffect(() => {
        setInnerValue(VALUE || '');
    }, [VALUE]);

    return (
        <TextField
            sx={{
                width: '100%',
                margin: 0
            }}
            name={name}
            label={label}
            multiline
            rows={ROWS}
            variant={VARIANT}
            value={delay === 0 ? VALUE : innerValue}
            helperText={helperText || errorText}
            error={error || !!errorText}
            disabled={DISABLED}
            onChange={delay === 0 ? handleChange : handleOnChange}
        />
    );
};
