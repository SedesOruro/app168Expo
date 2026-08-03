import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { useField, FormikProps, FormikValues } from 'formik';

// material-ui
import { Theme, FormControl, FormLabel, FormHelperText, useTheme } from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';
import { OnChangeFunction } from '../Types';
import { useDebouncedCallback } from 'use-debounce';
import { EDITOR_API_KEY } from 'config/env';

// tiempo en milisegundos para que se guarden los datos
const DEFAULT_DELAY = 500;

// const DEFAULT_VARIANT = 'filled';

type Props = {
    name: string;
    label: string;
    value?: string;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
    formik?: FormikProps<FormikValues>;
    fieldRequired?: string;
    variant?: 'filled' | 'standard' | 'outlined';
    onChange?: OnChangeFunction;
    delay?: number;
};

export const MyEditor = (props: Props): ReactElement => {
    const { name, label, error, helperText, formik, delay } = props;
    const [field, meta] = useField<string>(name);
    const theme = useTheme();
    const errorText = meta.error && meta.touched ? meta.error : '';

    // controlled or uncontrolled
    const VALUE = typeof props.value !== 'undefined' ? props.value : field.value;
    const [innerValue, setInnerValue] = useState(VALUE || '');

    const DELAY = delay || DEFAULT_DELAY;
    // const VARIANT = props.variant  || DEFAULT_VARIANT;
    // const FIELD_REQUIRED = props.fieldRequired;
    // const [DISABLED, setDisabled] = useState(false);
    // const requiredValue = FIELD_REQUIRED ? formik?.values[FIELD_REQUIRED] : undefined;
    // useEffect(() => {
    //     const disableByProp = typeof props.disabled !== 'undefined' ? props.disabled : false;
    //     let newFieldDisabled = disableByProp;
    //     if (!disableByProp && FIELD_REQUIRED) {
    //         newFieldDisabled =
    //             requiredValue === undefined ||
    //             requiredValue === '' ||
    //             requiredValue === null ||
    //             requiredValue === '[]' || // Para los archivos adjuntos (MyDropzone)
    //             requiredValue === '{}' || // Para los grupos de checkbox (MyCheckboxGroup)
    //             (Array.isArray(requiredValue) && requiredValue.length === 0);
    //     }
    //     setDisabled(newFieldDisabled);
    // }, [props.disabled, FIELD_REQUIRED, requiredValue]);

    const handleChange = (content: string) => {
        const newValue = content;
        if (typeof props.onChange !== 'undefined') {
            return props.onChange(newValue, formik);
        }
        formik?.setFieldValue(name, newValue);
    };

    const debouncedHandleOnChange = useDebouncedCallback((content: string) => {
        handleChange(content);
    }, DELAY);

    const handleOnChange = useCallback(
        (content: string) => {
            const eventValue = content;
            const safeValue = eventValue;
            setInnerValue(safeValue);
            debouncedHandleOnChange(content);
        },
        [debouncedHandleOnChange]
    );

    useEffect(() => {
        setInnerValue(VALUE || '');
    }, [VALUE]);

    return (
        <FormControl sx={{ width: '100%', paddingTop: 0 }} error={error || !!errorText}>
            <div
                style={{
                    borderTopLeftRadius: theme.spacing(0.5),
                    borderTopRightRadius: theme.spacing(0.5),
                    minHeight: theme.spacing(29),
                    background: '#e8e8e8'
                }}
            >
                <FormLabel component="legend" sx={{ padding: theme.spacing(1, 1, 1, 1.5) }}>
                    {label}
                </FormLabel>
                <Editor
                    apiKey={EDITOR_API_KEY}
                    cloudChannel="8"
                    // disabled={DISABLED} // Ocurre un error, algunas veces no se asigna el valor correctamente
                    id={name}
                    init={{
                        height: 200,
                        convert_urls: true,
                        menubar: false,
                        plugins: [
                            'advlist autolink lists link image charmap preview anchor',
                            'searchreplace visualblocks code fullscreen',
                            'insertdatetime media table code help wordcount'
                        ],
                        toolbar:
                            'undo redo | ' +
                            'blocks | ' +
                            'bold italic backcolor | ' +
                            'alignleft aligncenter alignright alignjustify | ' +
                            'bullist numlist outdent indent | ' +
                            'removeformat | ' +
                            'help',
                        placeholder: 'Escriba aquí el contenido.',
                        contextmenu: false
                    }}
                    value={delay === 0 ? VALUE : innerValue}
                    inline={false}
                    tagName="div"
                    onEditorChange={delay === 0 ? handleChange : handleOnChange}
                />
            </div>
            <FormHelperText sx={{ paddingLeft: theme.spacing(1.5) }}>{helperText || errorText}</FormHelperText>
        </FormControl>
    );
};
