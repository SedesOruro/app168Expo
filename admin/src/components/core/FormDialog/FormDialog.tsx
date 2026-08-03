import React, { ReactElement, useRef, useEffect, createRef } from 'react';
import { Formik, Form, FormikProps } from 'formik';

import { useTheme, useMediaQuery, Dialog, DialogContent, DialogActions, Button, Typography, IconButton, CircularProgress, Box, styled } from '@mui/material';
import MuiDialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

import { FormDialogProps, FormGroup, FormRow, FormControl, MyFormModel, FormDialogRefProps } from './Types';
import {
    MyDatePicker,
    MyTimePicker,
    MyAutocomplete,
    MyTextField,
    MyLabel,
    MyGrid,
    MySelect,
    MyMultipleSelect,
    MyMultipleSelect2,
    MyEditor,
    MyChipInput,
    MyDateTimePicker,
    MyCheckbox,
    MyDropzone,
    MyTextArea,
    MyPasswordTextField,
    MyRadioGroup,
    MyCheckboxGroup
} from './fields';

// Configuración global para los mensajes de error en los formularios
import { setLocale } from 'yup';

import { useNotify } from '../_internal/useNotify';
import { useIsMounted } from '../_internal/useIsMounted';

setLocale({
    mixed: {
        default: 'No es válido ',
        required: 'El campo es obligatorio ',
        notType: 'El campo no tiene el formato correcto '
    }
});

const RootStyle = styled('div')(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(1),
    [theme.breakpoints.down('xs')]: {
        padding: theme.spacing(1, 0)
    }
}));

const GridStyle = styled('div')(({ theme }) => ({
    width: '100%',
    margin: theme.spacing(0, 0, 2, 0)
}));

const ControlTitleStyle = styled('div')(({ theme }) => ({
    fontWeight: 'bold',
    margin: theme.spacing(0, 1, 0, 0),
    padding: theme.spacing(0, 1)
}));

const ButtonAceptarStyle = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.secondary.main,
    '&:hover': {
        backgroundColor: theme.palette.secondary.light
    },
    color: theme.palette.common.white,
    width: theme.spacing(18),
    margin: theme.spacing(1),
    '&.Mui-disabled': {
        backgroundColor: '#e0e0e0',
        color: '#6a6a6a'
    }
}));

const ButtonCloseStyle = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.error.main,
    '&:hover': {
        backgroundColor: theme.palette.error.light
    },
    color: theme.palette.common.white,
    width: theme.spacing(18),
    margin: theme.spacing(1),
    '&.Mui-disabled': {
        backgroundColor: '#e0e0e0',
        color: '#6a6a6a'
    }
}));

const RowStyle = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'stretch',
    width: '100%',
    padding: theme.spacing(0),
    [theme.breakpoints.down('xs')]: {
        flexDirection: 'column'
    }
}));

export const FormDialog = ({
    addTitle,
    editTitle,
    open,
    initialValues,
    formLayout,
    validationSchema,
    labelAceptar,
    labelCancelar,
    isEdit,
    debug,
    statusBar,
    headerComponent,
    onSubmit,
    onCancel
}: FormDialogProps): ReactElement => {
    const notify = useNotify();
    const isMounted = useIsMounted();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const refGroup: { [key: string]: React.RefObject<FormDialogRefProps | null> } = {};
    formLayout.forEach((layout) =>
        layout.grid.forEach((row) =>
            row.forEach((col) => {
                if (col.type === 'dropzone') refGroup[String(col.name)] = createRef();
            })
        )
    );

    const formRefs = useRef(refGroup);

    const renderControl = (row: FormRow<MyFormModel>, col: FormControl<MyFormModel>, colIndex: number, formik?: FormikProps<typeof initialValues>): ReactElement => {
        let formControl = <div key="0" />;
        const name = col.name as string;
        const label = col.label as string;
        const delay = col.delay;
        const disabled = col.disabled as boolean;
        const fieldRequired = col.fieldRequired as string;

        const controlRef = formRefs.current[name];

        if (col.type === 'text') {
            formControl = (
                <MyTextField
                    label={label}
                    name={name}
                    disabled={disabled}
                    formik={formik}
                    type={col.inputType}
                    uppercase={col.upperCaseOn}
                    onChange={col.onChange}
                    fieldRequired={fieldRequired}
                    variant={col.variant}
                    delay={delay}
                />
            );
        }
        if (col.type === 'label') {
            formControl = (
                <MyLabel
                    label={label}
                />
            );
        }
        if (col.type === 'grid') {
            formControl = (
                <MyGrid
                    name={name}
                    formik={formik}
                    model={col.model}
                    optionsModel={col.optionsModel || []}
                    onSaveData={col.onSaveData}
                />
            );
        }
        if (col.type === 'password') {
            formControl = <MyPasswordTextField label={label} name={name} disabled={disabled} fieldRequired={fieldRequired} variant={col.variant} formik={formik} onChange={col.onChange} />;
        }
        if (col.type === 'select') {
            formControl = (
                <MySelect label={label} name={name} disabled={disabled} formik={formik} options={col.options || []} fieldRequired={fieldRequired} variant={col.variant} onChange={col.onChange} />
            );
        }
        if (col.type === 'autocomplete') {
            formControl = (
                <MyAutocomplete label={label} name={name} disabled={disabled} formik={formik} options={col.options || []} fieldRequired={fieldRequired} variant={col.variant} onChange={col.onChange} />
            );
        }
        if (col.type === 'multiselect') {
            formControl = (
                <MyMultipleSelect
                    label={label}
                    name={name}
                    disabled={disabled}
                    formik={formik}
                    options={col.options || []}
                    fieldRequired={fieldRequired}
                    variant={col.variant}
                    onChange={col.onChange}
                />
            );
        }
        if (col.type === 'multiselect2') {
            formControl = (
                <MyMultipleSelect2
                    label={label}
                    name={name}
                    disabled={disabled}
                    formik={formik}
                    options={col.options || []}
                    fieldRequired={fieldRequired}
                    onChange={col.onChange}
                />
            );
        }
        if (col.type === 'dropzone') {
            formControl = (
                <MyDropzone
                    label={label}
                    name={name}
                    disabled={disabled}
                    fieldRequired={fieldRequired}
                    variant={col.variant}
                    formik={formik}
                    filesLimit={col.filesLimit}
                    filesExt={col.filesExt}
                    acceptedFiles={col.acceptedFiles}
                    maxFileSize={col.maxFileSize}
                    dropzoneText={col.dropzoneText}
                    onChange={col.onChange}
                    ref={controlRef}
                />
            );
        }
        if (col.type === 'editor') {
            formControl = <MyEditor label={label} name={name} disabled={disabled} fieldRequired={fieldRequired} variant={col.variant} formik={formik} onChange={col.onChange} delay={delay} />;
        }
        if (col.type === 'chip') {
            formControl = <MyChipInput label={label} name={name} disabled={disabled} fieldRequired={fieldRequired} variant={col.variant} formik={formik} onChange={col.onChange} />;
        }
        if (col.type === 'date') {
            formControl = (
                <MyDatePicker
                    label={label}
                    name={name}
                    disabled={disabled}
                    formik={formik}
                    disablePast={col.disablePast}
                    format={col.format}
                    fieldRequired={fieldRequired}
                    variant={col.variant}
                    onChange={col.onChange}
                />
            );
        }
        if (col.type === 'time') {
            formControl = (
                <MyTimePicker
                    label={label}
                    name={name}
                    disabled={disabled}
                    formik={formik}
                    format={col.format}
                    ampm={col.ampm}
                    fieldRequired={fieldRequired}
                    variant={col.variant}
                    onChange={col.onChange}
                    delay={col.delay}
                />
            );
        }
        if (col.type === 'datetime') {
            formControl = (
                <MyDateTimePicker
                    label={label}
                    name={name}
                    disabled={disabled}
                    formik={formik}
                    disablePast={col.disablePast}
                    format={col.format}
                    ampm={col.ampm}
                    fieldRequired={fieldRequired}
                    variant={col.variant}
                    onChange={col.onChange}
                />
            );
        }
        if (col.type === 'checkbox') {
            formControl = <MyCheckbox label={label} name={name} disabled={disabled} fieldRequired={fieldRequired} variant={col.variant} formik={formik} onChange={col.onChange} />;
        }
        if (col.type === 'checkbox-group') {
            formControl = (
                <MyCheckboxGroup
                    label={label}
                    name={name}
                    disabled={disabled}
                    formik={formik}
                    options={col.options || []}
                    onChange={col.onChange}
                    fieldRequired={fieldRequired}
                    variant={col.variant}
                    inlineDisplay={col.inlineDisplay}
                />
            );
        }
        if (col.type === 'radio-group') {
            formControl = (
                <MyRadioGroup
                    label={label}
                    name={name}
                    disabled={disabled}
                    formik={formik}
                    options={col.options || []}
                    onChange={col.onChange}
                    fieldRequired={fieldRequired}
                    variant={col.variant}
                    inlineDisplay={col.inlineDisplay}
                />
            );
        }
        if (col.type === 'textarea') {
            formControl = (
                <MyTextArea label={label} name={name} disabled={disabled} formik={formik} onChange={col.onChange} fieldRequired={fieldRequired} variant={col.variant} rows={col.rows} delay={delay} />
            );
        }

        const HIDDEN = typeof col.hidden === 'function' ? col.hidden(formik?.values) : col.hidden;
        if (HIDDEN) formControl = <></>;
        return (
            <React.Fragment key={colIndex}>
                <RootStyle sx={{ width: fullScreen ? '100%' : `${100 / row.length}%` }}>
                    <div>{formControl}</div>
                    {!!col.infoText && <div style={{ margin: '3px 14px 0', fontSize: '0.75rem' }}>{col.infoText}</div>}
                </RootStyle>
            </React.Fragment>
        );
    };

    function renderFormLayout(formik: FormikProps<typeof initialValues>): ReactElement {
        const form = formLayout.map((layout: FormGroup<MyFormModel>, layoutIndex: number): ReactElement => {
            return (
                <GridStyle key={layoutIndex}>
                    <ControlTitleStyle>{layout.title}</ControlTitleStyle>

                    {layout.grid.map((row: FormRow<MyFormModel>, rowIndex: number) => {
                        return (
                            <RowStyle key={rowIndex}>
                                {row.map((col: FormControl<MyFormModel>, colIndex: number): ReactElement => {
                                    return renderControl(row, col, colIndex, formik);
                                })}
                            </RowStyle>
                        );
                    })}
                </GridStyle>
            );
        });
        return <>{form}</>;
    }

    const renderDialogTitle = (title: string): ReactElement => {
        return (
            <MuiDialogTitle sx={{ padding: theme.spacing(1) }} id="custom-dialog-title">
                <Typography variant="body1" component="span" sx={{ display: 'flex', alignItems: 'center', margin: theme.spacing(1) }}>
                    {!isEdit && <AddIcon />}
                    {isEdit && <EditIcon />}
                    {title}
                </Typography>
                <IconButton aria-label="close" sx={{ position: 'absolute', right: theme.spacing(1), top: theme.spacing(1), color: theme.palette.grey[500] }} onClick={onCancel}>
                    <CloseIcon />
                </IconButton>
            </MuiDialogTitle>
        );
    };

    const formikRef = useRef<FormikProps<MyFormModel>>(null) as any;
    useEffect(() => formikRef.current?.resetForm({}), [formikRef, initialValues]);

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={(data, { setSubmitting }) => {
                if (isMounted()) setSubmitting(true);
                for (let key of Object.keys(formRefs.current)) {
                    const isPrepared = formRefs.current[key].current?.isPrepared();
                    if (!isPrepared) {
                        notify.info('Debe llenar todos los campos requeridos y esperar a que estén listos antes de enviar el formulario.');
                        if (isMounted()) setSubmitting(false);
                        return;
                    }
                }
                onSubmit(data).finally(() => {
                    if (isMounted()) setSubmitting(false);
                });
            }}
            enableReinitialize={true}
            validateOnChange={formikRef.validateOnChange ?? true}
            validateOnBlur={formikRef.validateOnBlur ?? true}
            innerRef={formikRef}
            validationSchema={validationSchema}
        >
            {(formik) => {
                return (
                    <Form>
                        <Dialog open={open} onClose={onCancel} fullWidth fullScreen={fullScreen}  aria-labelledby="custom-dialog-title" aria-modal="true" disableEnforceFocus disableAutoFocus>
                            {renderDialogTitle(isEdit ? editTitle || 'Editar' : addTitle || 'Agregar')}
                            <DialogContent dividers sx={{ padding: theme.spacing(1.5) }}>
                                {typeof headerComponent !== 'undefined' && (
                                    <div style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)', marginBottom: theme.spacing(1) }}>{headerComponent(formik)}</div>
                                )}
                                {renderFormLayout(formik)}
                            </DialogContent>
                            <DialogActions
                                sx={{
                                    padding: theme.spacing(0),
                                    margin: theme.spacing(0),
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'stretch'
                                }}
                            >
                                {typeof statusBar !== 'undefined' && <div style={{ overflow: 'auto', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>{statusBar(formik)}</div>}
                                {typeof debug !== 'undefined' && (
                                    <div style={{ overflow: 'auto', borderBottom: '1px solid rgba(0, 0, 0, 0.12)', padding: theme.spacing(1) }}>
                                        <strong>Values:</strong>
                                        <pre>{JSON.stringify(formik.values, null, 2)}</pre>
                                        <strong>Errors:</strong>
                                        <pre>{JSON.stringify(formik.errors, null, 2)}</pre>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: theme.spacing(0.5) }}>
                                    <ButtonCloseStyle onClick={onCancel} disabled={formik.isSubmitting}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                width: "30px"
                                            }}>
                                            <CloseIcon fontSize="small" />
                                        </Box>
                                        <span style={{ maxWidth: theme.spacing(14), marginLeft: theme.spacing(0.5) }}>{labelCancelar || 'Cancelar'}</span>
                                    </ButtonCloseStyle>
                                    <ButtonAceptarStyle autoFocus={true} onClick={() => formik.handleSubmit()} disabled={formik.isSubmitting}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                width: "30px"
                                            }}>
                                            {formik.isSubmitting && <CircularProgress size={18} color="inherit" />}
                                            {!formik.isSubmitting && <CheckIcon fontSize="small" />}
                                        </Box>
                                        <span style={{ maxWidth: theme.spacing(14), marginLeft: theme.spacing(0.5) }}>{labelAceptar || 'Aceptar'}</span>
                                    </ButtonAceptarStyle>
                                </div>
                            </DialogActions>
                        </Dialog>
                    </Form>
                );
            }}
        </Formik>
    );
};
