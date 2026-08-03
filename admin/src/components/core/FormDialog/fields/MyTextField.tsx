import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { useField, FormikValues, FormikProps } from 'formik';
import { useDebouncedCallback } from 'use-debounce';

// material-ui
import { TextField } from '@mui/material';
import { OnChangeFunction } from '../Types';

// tiempo en milisegundos para que se guarden los datos
const DEFAULT_DELAY = 0;

// tipo de dato por defecto
const DEFAULT_TYPE = 'text';

const DEFAULT_VARIANT = 'filled';

type Props = {
    name: string;
    label: string;
    value?: string;
    disabled?: boolean;
    error?: boolean;
    uppercase?: boolean;
    helperText?: string;
    formik?: FormikProps<FormikValues>;
    type?: 'text' | 'number' | 'hidden';
    fieldRequired?: string;
    variant?: 'filled' | 'standard' | 'outlined';
    onChange?: OnChangeFunction;
    delay?: number;
};

export const MyTextField = (props: Props): ReactElement => {
    const { name, label, error, helperText, formik, delay, uppercase } = props;
    const [field, meta] = useField<string>(name);
    const [errorNumber, setErrorNumber] = useState<string>('');

    const errorText = meta.error && meta.touched ? meta.error : '';

    // controlled or uncontrolled
    const VALUE = typeof props.value !== 'undefined' ? props.value : field.value;
    const [innerValue, setInnerValue] = useState(VALUE || '');

    const TYPE = props.type || DEFAULT_TYPE;
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

    const parseValue = (value: string): string => {
        const newValue = TYPE === 'number' ? removeNonNumericChars(value) : value;
        if (TYPE === 'number') {
            if (isNaN(Number(newValue))) setErrorNumber('Número inválido');
            else setErrorNumber('');
        }
        return String(newValue);
    };

    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseValue(event.target.value);
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
            const eventValue = event.currentTarget.value;
            const safeValue = TYPE === 'number' ? removeNonNumericChars(eventValue) : eventValue;
            setInnerValue(safeValue);
            debouncedHandleOnChange(event);
        },
        [debouncedHandleOnChange, TYPE]
    );

    useEffect(() => {
        if (TYPE === 'number') {
            if (VALUE && isNaN(Number(VALUE))) setErrorNumber('Número inválido');
            else setErrorNumber('');
        }
        setInnerValue(VALUE || '');
    }, [VALUE, TYPE]);

    return (
        <TextField
            variant={VARIANT}
            sx={{
                width: '100%',
                margin: 0
            }}
            type={TYPE === 'number' ? 'text' : TYPE}
            id={name}
            label={label}
            value={delay === 0 ? VALUE : innerValue}
            disabled={DISABLED}
            onChange={delay === 0 ? handleChange : handleOnChange}
            error={error || !!errorText || !!errorNumber}
            slotProps={{ htmlInput: uppercase ? { style: { textTransform: 'uppercase' } } : {} }}
            helperText={helperText || errorText || errorNumber}
        />
    );
};

/**
 * Interpreta una cadena de texto y devuelve su valor numérico con un máximo de 2 dígitos.
 * Es útil para obtener números válidos desde un campo de entrada de texto.
 * @param {String} value - Cadena de texto.
 * @return {number}
 */
export const sanitizeStringToNumber = (value: string | number): string => {
    const normalizedValue = removeNonNumericChars(String(value));
    const numericValue = parseFloat(normalizedValue);
    if (isNaN(numericValue)) return '0';
    return `${roundTo(numericValue, 2)}`;
};

const removeNonNumericChars = (text: string): string => {
    return text
        .trim()
        .replace(/,/g, '.')
        .replace(/[^\d.-]/g, '');
};

const roundTo = (value: number, places = 2): number => {
    const power = Math.pow(10, places);
    return Math.round(value * power) / power;
};
