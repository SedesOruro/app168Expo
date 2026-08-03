import React, { ReactElement, useState } from 'react';

import Scrollbar from '../../_internal/Scrollbar';
import { FormikProps, FormikValues, useField } from 'formik';
//@mui
import { TextField, Paper, Box, Table, TableBody, TableCell, TableHead, TableRow, FormControl, FormHelperText, Select, MenuItem, SelectChangeEvent, InputLabel } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import SaveAsIcon from '@mui/icons-material/SaveAs';

import { OnSaveDataFunction } from '../Types';


const SIN_OPCIONES_TEXT = ' >>> Sin opciones <<<';

type Props<MyFormModel> = {
    name       : string;
    model      : MyFormModel;
    data?      : MyFormModel[];
    error?     : boolean;
    helperText?: string;
    optionsModel?: any[];
    onSaveData?: OnSaveDataFunction;
    formik    ?: FormikProps<FormikValues>;
};

export const MyGrid = <MyFormModel extends { id: number | string }>(props: Props<MyFormModel>): ReactElement => {
    const { model, formik, name, helperText, error, optionsModel, data } = props;
    const [field, meta] = useField<string | number>(name);
    const model_aux = optionsModel && optionsModel.map((item) => item.field);
    let OPTIONS: any[] = [];

    const errorText = meta.error && meta.touched ? meta.error : '';

    const [rows, setRows] = useState<MyFormModel[]>(data || []);
    const [rows1, setRows1] = useState<string[]>([]);
    const [currentRow, setCurrentRow] = useState<MyFormModel>({ ...model });

    const handleInputChange = (field: keyof MyFormModel, value: any) => {
        setCurrentRow((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddRow = () => {
        const ROW_ID = crypto.randomUUID();
        setRows((prevRows) => [...prevRows, { ...currentRow, id: ROW_ID as MyFormModel['id'] }]);
        setCurrentRow({ ...model });
        rows1.push(ROW_ID);
        formik?.setFieldValue(name, rows1);
        setRows1(rows1);
    };

    const handleDeleteRow = (id: number | string) => {
        setRows(rows.filter((row) => row.id !== id));
        const r = rows1.filter((row) => row !== id);
        setRows1(r);
        formik?.setFieldValue(name, r);
    };

    const handleSaveData = () => {
        if (props.onSaveData) props.onSaveData(rows)
    };

    const renderInputFields = () => {

        return Object.keys(model).map((key) => {
            if (key === 'id') return null; // Skip the 'id' field for inputs
            if(model_aux?.includes(key)) {
                OPTIONS = optionsModel && optionsModel?.find((item) => item.field === key).value || [];
                const selectWidth = model_aux.length === 1 ? '100%' : '45%';
                return (
                    <Box sx={{ width: selectWidth, display: 'inline-block', m:1 }} key={key}>
                        <FormControl sx={{ width: '100%' }} variant="filled" size="small" >
                            <InputLabel id={`${key}-label`}>{key}</InputLabel>
                            <Select
                                sx={{
                                    width: '100%',
                                    margin: 0,
                                }}
                                labelId={`${key}-label`}
                                id={key}
                                value={(currentRow as any)[key] || ''}
                                onChange={(e) => handleInputChange(key as keyof MyFormModel, e.target.value)}
                            >
                                {OPTIONS.length === 0 && (
                                    <MenuItem key={SIN_OPCIONES_TEXT} value={SIN_OPCIONES_TEXT} style={{ whiteSpace: 'normal' }} dense>
                                        {SIN_OPCIONES_TEXT}
                                    </MenuItem>
                                )}
                                {OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value} style={{ whiteSpace: 'normal' }} dense>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                );
            }
            return (
                <Box sx={{ display: 'inline-block', m:1 }} key={key}>
                    <TextField
                        label={key}
                        value={(currentRow as any)[key] || ''}
                        onChange={(e) => handleInputChange(key as keyof MyFormModel, e.target.value)}
                        variant="filled"
                        size="small"
                        fullWidth
                    />
                </Box>
            );
        });
    };

    return (
        <>
            <Paper variant='outlined' sx={{ borderBottomColor: errorText?'red':''}}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <Box sx={{ display: 'inline', flex: 1, gap: 2 }}>
                        {renderInputFields()}
                    </Box>
                    <IconButton aria-label="add" size="small" onClick={handleAddRow} color="info" sx={{ alignSelf: 'center' }}>
                        <AddCircleIcon fontSize="small" />
                    </IconButton>
                    <IconButton aria-label="add" size="small" onClick={handleSaveData} color="error" sx={{ alignSelf: 'center' }}>
                        <SaveAsIcon fontSize="small" />
                    </IconButton>
                </Box>
                <Scrollbar>
                <Box sx={{ overflowY: 'auto', transition: 'height .5s, marginTop .5s', height: 'auto' }}>
                    <Table sx={{ marginTop: 2 }} size='small'>
                        <TableHead>
                            <TableRow>
                                {Object.keys(model).map((key) => (
                                    <TableCell
                                        key={key}
                                        sx={{ padding: '4px', width: `calc(100% / ${Object.keys(model).length + 1})` }}
                                    >
                                        {key}
                                    </TableCell>
                                ))}
                                <TableCell sx={{ padding: '4px', width: '5%', whiteSpace: 'nowrap' }}>Ops</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow key={row.id}>
                                    {Object.keys(model).map((key) => (
                                        <TableCell key={key} sx={{ padding: '4px', whiteSpace: 'nowrap' }}>
                                            {(row as any)[key]}
                                        </TableCell>
                                    ))}
                                    <TableCell sx={{ padding: '4px', width: '5%', whiteSpace: 'nowrap' }}>
                                        <IconButton aria-label="delete" color="error" size="small" onClick={() => handleDeleteRow(row.id)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
                </Scrollbar>
            </Paper>
            <FormControl sx={{ width: '100%' }} error={error || !!errorText}>
                <FormHelperText>{helperText || errorText}</FormHelperText>
            </FormControl>
        </>
    );
};
