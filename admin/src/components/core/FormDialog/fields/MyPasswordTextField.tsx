import React, { ReactElement, useEffect, useState } from 'react';
import { Field, useField, FormikValues, FormikProps } from 'formik';

// material-ui
import { InputAdornment } from '@mui/material';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { OnChangeFunction } from '../Types';

const DEFAULT_VARIANT = 'filled';

type Props = {
    name: string;
    label: string;
    value?: string;
    disabled?: boolean;
    fieldRequired?: string;
    error?: boolean;
    helperText?: string;
    onChange?: OnChangeFunction;
    formik?: FormikProps<FormikValues>;
    variant?: 'filled' | 'standard' | 'outlined';
};

export const MyPasswordTextField = (props: Props): ReactElement => {
    const { name, label, error, helperText, formik } = props;
    const [field, meta] = useField<string>(name);

    const errorText = meta.error && meta.touched ? meta.error : '';

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [inputType, setInputType] = useState<string>('password');

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

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
        setInputType(!showPassword ? 'text' : 'password');
    };

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        const newValue = String(event.target.value);
        if (typeof props.onChange !== 'undefined') {
            return props.onChange(newValue, formik);
        }
        formik?.setFieldValue(name, newValue);
    };

    return (
        <Field
            variant={VARIANT}
            type={inputType}
            sx={{
                width: '100%',
                margin: 0
            }}
            component={TextField}
            disabled={DISABLED}
            name={name}
            label={label}
            helperText={helperText || errorText}
            error={error || !!errorText}
            onChange={handleChange}
            value={VALUE || ''}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword}>
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                    </InputAdornment>
                )
            }}
        />
    );
};
