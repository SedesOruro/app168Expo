import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { useField, FormikProps, FormikValues } from 'formik';

import { MenuItem, TextField, Box, Typography, SelectChangeEvent, useTheme } from '@mui/material';
import { FormValue, SelectOption, OnChangeFunction } from '../Types';
import Checkbox from '@mui/material/Checkbox';

const DEFAULT_SELECT       = 'filled';
const SIN_OPCIONES_TEXT    = ' >>> Sin opciones <<<';
const MARCAR_TODOS_TEXT    = 'Marcar TODOS';
const DESMARCAR_TODOS_TEXT = 'Desmarcar TODOS';

type Props = {
    name          : string;
    label         : string;
    disabled     ?: boolean;
    value        ?: (number | string)[];
    error        ?: boolean;
    helperText   ?: string;
    formik       ?: FormikProps<FormikValues>;
    options       : SelectOption[] | ((formValue: FormValue) => SelectOption[]);
    fieldRequired?: string;
    variant      ?: 'filled' | 'standard' | 'outlined';
    onChange     ?: OnChangeFunction;
};

export const MyMultipleSelect = (props: Props): ReactElement => {
    const { name, label, error, helperText, formik } = props;
    const [field, meta] = useField<(number | string)[]>(name);
    const theme = useTheme();
    const errorText = meta.error && meta.touched ? meta.error : '';

    const OPTIONS = typeof props.options === 'function' ? props.options(formik?.values as FormValue) : props.options;
    const OPTIONS_VALUE = OPTIONS.map((opt) => opt.value);
    const VARIANT_SELECT = props.variant || DEFAULT_SELECT;

    // controlled or uncontrolled
    const _val = typeof props.value !== 'undefined' ? props.value : field.value;
    const VALUE = OPTIONS.filter((opt) => _val && _val.includes(opt.value)).map((opt) => opt.value);

    const [allSelected, setAllSelected] = useState<boolean>(false);

    const [visibleOptions, setVisibleOptions] = useState<SelectOption[]>([]);
    const [itemsToShow, setItemsToShow] = useState(10);
    const listInnerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const newAllSelected = VALUE && VALUE.length > 0 ? JSON.stringify(VALUE) === JSON.stringify(OPTIONS.map((opt) => opt.value)) : false;
        setAllSelected(newAllSelected);
    }, [VALUE, OPTIONS]);

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
        let newValue = event.target.value as unknown as any[];
        if (newValue.includes(SIN_OPCIONES_TEXT)) return;

        const marcarTodosClicked = newValue.includes(MARCAR_TODOS_TEXT);
        if (marcarTodosClicked) {
            newValue = OPTIONS_VALUE;
        }

        const desmarcarTodosClicked = newValue.includes(DESMARCAR_TODOS_TEXT);
        if (desmarcarTodosClicked) {
            newValue = [];
        }

        if (props.onChange) props.onChange(newValue, formik);
        else formik?.setFieldValue(name, newValue);
    };

    useEffect(() => {
        // Load the initial items to show
        if (typeof OPTIONS === 'function') {
            setVisibleOptions(OPTIONS);
        } else {
            setVisibleOptions(OPTIONS.slice(0, itemsToShow));
        }
    }, [OPTIONS, itemsToShow]);

    const handleScroll = () => {
        if (listInnerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = listInnerRef.current;
            if (scrollTop + clientHeight >= scrollHeight) {
                loadMoreItems();
            }
        }
    };

    const [loading, setLoading] = useState(false);

    const loadMoreItems = () => {
        if (itemsToShow >= OPTIONS.length) return; // Evita cargar más si ya se llegó al final
        setLoading(true);
        setTimeout(() => {
            setItemsToShow((prev) => Math.min(prev + 10, OPTIONS.length)); // Limita el máximo a la longitud de OPTIONS
            setLoading(false);
        }, 1000); // Simula un retraso de carga de 1 segundo
    };

    return (
        <TextField
            variant={VARIANT_SELECT}
            error={error || !!errorText}
            select
            label={label}
            helperText={helperText || errorText}
            disabled={DISABLED}
            slotProps={{
              select: {
                MenuProps: {
                    style: {
                      maxHeight: 260, // Ajusta este valor para limitar la altura de la lista
                    },
                    slotProps: {
                        paper: {
                            onScroll: handleScroll,
                            ref: listInnerRef,
                        }
                    },
                },
                name: name,
                multiple: true,
                renderValue: (selected: any) => {
                    return selected.map((value: any) => String(OPTIONS.find((opt) => opt.value === value)?.label)).join(', ');
                },
                value: OPTIONS.length === 0 ? [] : VALUE || [],
                onChange: handleChange
              }
            }}
            sx={{
                width: '100%',
                margin: theme.spacing(0),
                padding: theme.spacing(0),
                '& .MuiSelect-nativeInput': {
                    width: 'unset'
                },
                '& .MuiSelect-select': {
                    fontSize: '14px'
                }
            }}
        >
            <MenuItem
                key="select_all"
                value={OPTIONS.length > 0 ? (allSelected ? DESMARCAR_TODOS_TEXT : MARCAR_TODOS_TEXT) : SIN_OPCIONES_TEXT}
                dense
                disableGutters
                sx={{
                    paddingTop: 0,
                    paddingBottom: 0,
                    borderBottom: 'solid lightgrey 1px',
                    background: allSelected ? 'rgba(0, 0, 0, 0.08)' : 'unset'
                }}
            >
                {OPTIONS.length > 0 ? <Checkbox checked={allSelected} color="primary" style={{ padding: 6 }} /> : <></>}
                <Box sx={{
                    p: OPTIONS.length > 0 ? 0 : 1
                }}>
                    <Typography variant="body2">{OPTIONS.length > 0 ? (allSelected ? DESMARCAR_TODOS_TEXT : MARCAR_TODOS_TEXT) : SIN_OPCIONES_TEXT}</Typography>
                </Box>
            </MenuItem>
            {visibleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value} dense disableGutters style={{ paddingTop: 0, paddingBottom: 0 }}>
                    <Checkbox checked={VALUE.includes(option.value)} color="primary" style={{ padding: 6 }} />
                    <Box>
                        <Typography variant="body2" sx={{width: '320px'}}>{option.label}</Typography>
                        {option.caption && (
                            <Typography sx={{ color: '#aaaaaa' }} variant="caption">
                                {option.caption}
                            </Typography>
                        )}
                    </Box>
                </MenuItem>
            ))}
            {loading && itemsToShow < OPTIONS.length && (
                <MenuItem disabled>
                    <Typography>Cargando más elementos...</Typography>
                </MenuItem>
            )}
        </TextField>
    );
};
