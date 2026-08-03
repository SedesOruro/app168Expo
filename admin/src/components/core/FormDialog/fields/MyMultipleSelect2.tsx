import React, { ReactElement, useEffect, useState } from 'react';
import { useField, FormikProps, FormikValues } from 'formik';
import { TextField, Box, Typography, SelectChangeEvent, useTheme, Checkbox, List, ListItem, CircularProgress, Popover, Button, FormControl, FormHelperText, InputLabel } from '@mui/material';
import { FormValue, SelectOption, OnChangeFunction } from '../Types';

const DEFAULT_SELECT = 'filled';
const SIN_OPCIONES_TEXT = '>>> Sin opciones <<<';
const MARCAR_TODOS_TEXT = 'Marcar TODOS';
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
    onChange     ?: OnChangeFunction;
};

export const MyMultipleSelect2 = (props: Props): ReactElement => {
    const { name, label, error, helperText, formik } = props;
    const [field, meta] = useField<(number | string)[]>(name);
    const theme = useTheme();
    const errorText = meta.error && meta.touched ? meta.error : '';

    const OPTIONS = typeof props.options === 'function' ? props.options(formik?.values as FormValue) : props.options;
    const OPTIONS_VALUE = OPTIONS.map((opt) => opt.value);
    const _val = typeof props.value !== 'undefined' ? props.value : field.value;
    const VALUE = OPTIONS.filter((opt) => _val && _val.includes(opt.value)).map((opt) => opt.value);

    const [allSelected, setAllSelected] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [visibleItems, setVisibleItems] = useState(10); // Mostrar 10 ítems inicialmente
    const [isLoading, setIsLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    // Filtrar opciones según el término de búsqueda
    const filteredOptions = OPTIONS.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()));
    const totalItems = filteredOptions.length;

    useEffect(() => {
        const newAllSelected = VALUE.length > 0 ? JSON.stringify(VALUE.sort()) === JSON.stringify(OPTIONS.map((opt) => opt.value).sort()) : false;
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

    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
        if (scrollTop + clientHeight >= scrollHeight - 10 && !isLoading) {
            if (visibleItems < totalItems) {
                setIsLoading(true);
                setTimeout(() => {
                    setVisibleItems((prev) => prev + 10); // Cargar 10 elementos más
                    setIsLoading(false);
                }, 500); // Simula el tiempo de carga
            }
        }
    };

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

    const handleSelect = (value: string | number) => {
        const newValue = VALUE.includes(value)
            ? VALUE.filter((v) => v !== value) // Deseleccionar item
            : [...VALUE, value];               // Seleccionar item

        if (props.onChange) props.onChange(newValue, formik);
        else formik?.setFieldValue(name, newValue);
    };

    const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const buttonWidth = anchorEl?.getBoundingClientRect().width;

    return (
        <>
        <FormControl sx={{ width: '100%' }} error={error || !!errorText}>
            <Typography id={`${name}-label`} sx={{ fontSize: '11.5px' }}>{label}</Typography>
            <Button
                onClick={handleOpen}
                variant="outlined"
                disabled={DISABLED}
                name={name}
                sx={{
                    width: '100%',
                    fontWeight: 'normal',
                    margin: theme.spacing(0),
                    padding: theme.spacing(1)
                }}
            >
                {VALUE.map(v => OPTIONS.find(opt => opt.value === v)?.label).join(',') || 'Seleccione...'}
            </Button>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                sx={{
                    '.MuiPaper-elevation8': {
                        width: buttonWidth,
                    }
                }}
            >
                <Box sx={{ padding: theme.spacing(2), width: '100%' }}>
                    <TextField
                        variant="outlined"
                        placeholder="Buscar..."
                        size="small"
                        sx={{ marginBottom: theme.spacing(2) }}
                        fullWidth
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Box
                        sx={{
                            maxHeight: 260,
                            overflowY: 'auto',
                            border: '1px solid #ccc',
                            width: '100%',
                            padding: theme.spacing(1)
                        }}
                        onScroll={handleScroll}
                    >
                        <List dense>
                            <ListItem key="select_all" disableGutters>
                                <Checkbox
                                    checked={allSelected}
                                    color="primary"
                                    onClick={() => handleChange({ target: { value: allSelected ? [] : OPTIONS_VALUE } } as SelectChangeEvent<any>)}
                                />
                                <Typography variant="body2">{allSelected ? DESMARCAR_TODOS_TEXT : MARCAR_TODOS_TEXT}</Typography>
                            </ListItem>
                            {filteredOptions.slice(0, visibleItems).map((option) => (
                                <ListItem key={option.value} sx={{ padding: 0, marginTop: 1 }}>
                                    <Checkbox
                                        checked={VALUE.includes(option.value)}
                                        color="primary"
                                        onChange={() => handleSelect(option.value)}
                                    />
                                    <Box>
                                        <Typography variant="body2">{option.label}</Typography>
                                        {option.caption && (
                                            <Typography sx={{ color: '#aaaaaa', lineHeight: 1 }} variant="subtitle2" component='p'>
                                                {option.caption}
                                            </Typography>
                                        )}
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                        {isLoading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
                                <CircularProgress size={24} /><Typography variant='caption' >Cargando más elementos...</Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Popover>
            <FormHelperText>{helperText || errorText}</FormHelperText>
            </FormControl>
        </>
    );
};
