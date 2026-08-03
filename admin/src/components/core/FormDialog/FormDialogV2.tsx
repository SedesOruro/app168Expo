import { makeStyles } from 'tss-react/mui';
import React, { ReactElement, useRef, useEffect, createRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Formik, Form, FormikProps } from 'formik';

import { useTheme, useMediaQuery, Theme, Dialog, DialogContent, DialogActions, Button, Typography, IconButton, CircularProgress, Box, LinearProgress } from '@mui/material';
import MuiDialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

import {
    FormDialogPropsV2,
    FormGroup,
    FormRow,
    FormControl,
    MyFormModel,
    FormDialogRefProps,
    FormDialogRefPropsV2,
    FormOptions,
    MyFormParams,
} from './Types';

import {
    MyDatePicker,
    MyTimePicker,
    MyAutocomplete,
    MyTextField,
    MySelect,
    MyMultipleSelect,
    MyDropzone,
    MyEditor,
    MyChipInput,
    MyDateTimePicker,
    MyCheckbox,
    MyTextArea,
    MyPasswordTextField,
    MyRadioGroup,
    MyCheckboxGroup,
} from './fields';

// Configuración global para los mensajes de error en los formularios
import { setLocale } from 'yup';
import clsx from 'clsx';
import { useNotify } from '../_internal/useNotify';
import { useIsMounted } from '../_internal/useIsMounted';

setLocale({
    mixed: {
        default: 'No es válido ',
        required: 'El campo es obligatorio ',
        notType: 'El campo no tiene el formato correcto ',
    },
});

const FormDialogV2Component = (props: FormDialogPropsV2, ref: React.Ref<FormDialogRefPropsV2>): ReactElement => {
    const {
        addTitle,
        editTitle,
        formLayout,
        validationSchema,
        labelAceptar,
        labelCancelar,
        debug,
        statusBar,
        headerComponent,
        submit,
        refresh,
    } = props;
    const { classes } = useStyles();
    const notify = useNotify();
    const isMounted = useIsMounted();

    const [loading, setLoading] = useState<boolean>(false);
    const [formOptions, setFormOptions] = useState<FormOptions>({});
    const [formModel, setFormModel] = useState<MyFormModel>({});
    const [formParams, setFormParams] = useState<MyFormParams>();
    const [open, setOpen] = useState<boolean>(false);

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const refGroup: { [key: string]: React.RefObject<FormDialogRefProps | null> } = {};
    const formLayoutFinal = (typeof formLayout === 'function') ? formLayout(formParams) : formLayout;
    formLayoutFinal.forEach((layout: FormGroup<MyFormModel>) =>
        layout.grid.forEach((row) =>
            row.forEach((col) => {
                if (col.type === 'dropzone') refGroup[String(col.name)] = createRef();
            }),
        ),
    );

    const formRefs = useRef(refGroup);

    const handleCancel = () => {
        setOpen(false);
        setFormModel({});
        setFormParams(undefined);
        if (formOptions.onCancel) return formOptions.onCancel();
    };

    const handleComplete = (data: MyFormModel) => {
        setOpen(false);
        setFormModel({});
        setFormParams(undefined);
        if (formOptions.onComplete) return formOptions.onComplete(data);
    };

    const renderControl = (
        row: FormRow<MyFormModel>,
        col: FormControl<MyFormModel>,
        colIndex: number,
        formik?: FormikProps<typeof formModel>,
    ): ReactElement => {
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
                    disabled={disabled || loading}
                    formik={formik}
                    type={col.inputType}
                    onChange={col.onChange}
                    fieldRequired={fieldRequired}
                    variant={col.variant}
                    delay={delay}
                />
            );
        }
        if (col.type === 'password') {
            formControl = (
                <MyPasswordTextField
                    label={label}
                    name={name}
                    disabled={disabled || loading}
                    fieldRequired={fieldRequired}
                    variant={col.variant}
                    formik={formik}
                    onChange={col.onChange}
                />
            );
        }
        if (col.type === 'select') {
            formControl = (
                <MySelect
                    label={label}
                    name={name}
                    disabled={disabled || loading}
                    formik={formik}
                    options={col.options || []}
                    fieldRequired={fieldRequired}
                    variant={col.variant}
                    onChange={col.onChange}
                />
            );
        }
        if (col.type === 'autocomplete') {
            formControl = (
                <MyAutocomplete
                    label={label}
                    name={name}
                    disabled={disabled || loading}
                    formik={formik}
                    options={col.options || []}
                    fieldRequired={fieldRequired}
                    variant={col.variant}
                    onChange={col.onChange}
                />
            );
        }
        if (col.type === 'multiselect') {
            formControl = (
                <MyMultipleSelect
                    label={label}
                    name={name}
                    disabled={disabled || loading}
                    formik={formik}
                    options={col.options || []}
                    fieldRequired={fieldRequired}
                    variant={col.variant}
                    onChange={col.onChange}
                />
            );
        }
        if (col.type === 'dropzone') {
            formControl = (
                <MyDropzone
                    label={label}
                    name={name}
                    disabled={disabled || loading}
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
            formControl = (
                <MyEditor
                    label={label}
                    name={name}
                    disabled={disabled || loading}
                    fieldRequired={fieldRequired}
                    variant={col.variant}
                    formik={formik}
                    onChange={col.onChange}
                    delay={delay}
                />
            );
        }
        if (col.type === 'chip') {
            formControl = (
                <MyChipInput
                    label={label}
                    name={name}
                    disabled={disabled || loading}
                    fieldRequired={fieldRequired}
                    variant={col.variant}
                    formik={formik}
                    onChange={col.onChange}
                />
            );
        }
        if (col.type === 'date') {
            formControl = (
                <MyDatePicker
                    label={label}
                    name={name}
                    disabled={disabled || loading}
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
                    disabled={disabled || loading}
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
                    disabled={disabled || loading}
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
            formControl = (
                <MyCheckbox
                    label={label}
                    name={name}
                    disabled={disabled || loading}
                    fieldRequired={fieldRequired}
                    variant={col.variant}
                    formik={formik}
                    onChange={col.onChange}
                />
            );
        }
        if (col.type === 'checkbox-group') {
            formControl = (
                <MyCheckboxGroup
                    label={label}
                    name={name}
                    disabled={disabled || loading}
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
                    disabled={disabled || loading}
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
                <MyTextArea
                    label={label}
                    name={name}
                    disabled={disabled || loading}
                    formik={formik}
                    onChange={col.onChange}
                    fieldRequired={fieldRequired}
                    variant={col.variant}
                    rows={col.rows}
                    delay={delay}
                />
            );
        }

        const HIDDEN = typeof col.hidden === 'function' ? col.hidden(formik?.values || {}) : col.hidden;
        if (HIDDEN) formControl = <></>;
        return (
            <React.Fragment key={colIndex}>
                <div className={classes.col} style={{ width: fullScreen ? '100%' : `${100 / row.length}%` }}>
                    <div>{formControl}</div>
                    {!!col.infoText && <div className={classes.infoText}>{col.infoText}</div>}
                </div>
            </React.Fragment>
        );
    };

    function renderFormLayout(formik: FormikProps<typeof formModel>): ReactElement {
        const formLayoutFinal = (typeof formLayout === 'function') ? formLayout(formParams) : formLayout;
        const form = formLayoutFinal.map(
            (layout: FormGroup<MyFormModel>, layoutIndex: number): ReactElement => {
                return (
                    <div key={layoutIndex} className={classes.grid}>
                        <div className={classes.controlTitle}>{layout.title}</div>

                        {layout.grid.map((row: FormRow<MyFormModel>, rowIndex: number) => {
                            return (
                                <div key={rowIndex} className={classes.row}>
                                    {row.map(
                                        (col: FormControl<MyFormModel>, colIndex: number): ReactElement => {
                                            return renderControl(row, col, colIndex, formik);
                                        },
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            },
        );
        return <>{form}</>;
    }

    const renderDialogTitle = (title: string): ReactElement => {
        return (
            <MuiDialogTitle className={classes.dialogTitle}>
                <Typography variant="h6" className={classes.dialogTitleText}>
                    {!formOptions.isEdit && <AddIcon className={classes.iconTitle} />}
                    {formOptions.isEdit && <EditIcon className={classes.iconTitle} />}
                    {title}
                </Typography>
                <IconButton aria-label="close" className={classes.closeButton} onClick={handleCancel}>
                    <CloseIcon />
                </IconButton>
                <LinearProgress
                    className={classes.loader}
                    color="secondary"
                    variant="indeterminate"
                    hidden={!loading}
                />
            </MuiDialogTitle>
        );
    };

    const formikRef = useRef<FormikProps<MyFormModel>>(null);
    useEffect(() => formikRef.current?.resetForm({}), [formikRef, formModel]);

    const refHandler: () => FormDialogRefPropsV2 = () => ({
        open: (options?: FormOptions) => {
            if (!isMounted()) return;
            const newFormOptions = options ? options : {};
            setFormOptions(newFormOptions);
            setOpen(true);
            setLoading(true);
            refresh(newFormOptions.data).then((result) => {
                if (!isMounted()) return;
                setLoading(false);
                if (!result) return;
                const { model: newFormModel, params: newFormParams } = result;
                if (newFormModel) setFormModel(newFormModel);
                if (newFormParams) setFormParams(newFormParams);
            });
        },
        getOptions: () => formOptions,
    });
    useImperativeHandle(ref, refHandler, [formOptions]);

    return (
        <Formik
            initialValues={formModel}
            onSubmit={(data, { setSubmitting }) => {
                if (!isMounted()) return;
                setSubmitting(true);
                for (let key of Object.keys(formRefs.current)) {
                    const isPrepared = formRefs.current[key].current?.isPrepared();
                    if (!isPrepared) {
                        notify.info(
                            'Debe llenar todos los campos requeridos y esperar a que estén listos antes de enviar el formulario.',
                        );
                        setSubmitting(false);
                        return;
                    }
                }

                submit(data, formOptions.data).then((success) => {
                    if (!isMounted()) return;
                    setSubmitting(false);
                    if (success) {
                        handleComplete(data);
                    }
                });
            }}
            innerRef={formikRef}
            validationSchema={validationSchema}
        >
            {(formik) => {
                return (
                    <Form>
                        <Dialog
                            open={open}
                            onClose={handleCancel}
                            fullWidth
                            fullScreen={fullScreen}
                           
                        >
                            {renderDialogTitle(formOptions.isEdit ? editTitle || 'Editar' : addTitle || 'Agregar')}
                            <DialogContent dividers className={classes.dialogContent}>
                                {typeof headerComponent !== 'undefined' && (
                                    <div className={classes.headerComponent}>{headerComponent(formik)}</div>
                                )}
                                {renderFormLayout(formik)}
                            </DialogContent>
                            <DialogActions className={classes.dialogActions}>
                                {typeof statusBar !== 'undefined' && (
                                    <div className={classes.statusBar}>{statusBar(formik)}</div>
                                )}
                                {typeof debug !== 'undefined' && (
                                    <div className={classes.debugBar}>
                                        <strong>Values:</strong>
                                        <pre>{JSON.stringify(formik.values, null, 2)}</pre>
                                        <strong>Errors:</strong>
                                        <pre>{JSON.stringify(formik.errors, null, 2)}</pre>
                                    </div>
                                )}
                                <div className={classes.actionButtons}>
                                    <Button
                                        className={classes.btnCancelar}
                                        onClick={handleCancel}
                                        disabled={formik.isSubmitting || loading}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                width: "30px"
                                            }}>
                                            <CloseIcon fontSize="small" />
                                        </Box>
                                        <span className={classes.btnLabel}>{labelCancelar || 'Cancelar'}</span>
                                    </Button>
                                    <Button
                                        className={clsx(classes.btnAceptar)}
                                        autoFocus
                                        onClick={() => formik.handleSubmit()}
                                        disabled={formik.isSubmitting || loading}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                width: "30px"
                                            }}>
                                            {formik.isSubmitting && <CircularProgress size={18} color="inherit" />}
                                            {!formik.isSubmitting && <CheckIcon fontSize="small" />}
                                        </Box>
                                        <span className={classes.btnLabel}>{labelAceptar || 'Aceptar'}</span>
                                    </Button>
                                </div>
                            </DialogActions>
                        </Dialog>
                    </Form>
                );
            }}
        </Formik>
    );
};

const useStyles = makeStyles()((theme: Theme) => ({
    dialogTitle: {
        position: 'relative',
        padding: theme.spacing(1, 0, 0, 0),
    },
    dialogTitleText: {
        display: 'flex',
        alignItems: 'center',
        margin: theme.spacing(1),
    },
    iconTitle: {
        fontSize: '38px',
        margin: theme.spacing(0, 0.5, 0, 0),
    },
    dialogContent: {
        position: 'relative',
        padding: theme.spacing(1.5),
    },
    dialogActions: {
        padding: theme.spacing(0),
        margin: theme.spacing(0),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    statusBar: {
        overflow: 'auto',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    },
    headerComponent: {
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        marginBottom: theme.spacing(1),
    },
    debugBar: {
        overflow: 'auto',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        padding: theme.spacing(1),
        maxHeight: '50vh',
    },
    actionButtons: {
        display: 'flex',
        justifyContent: 'flex-end',
        padding: theme.spacing(0.5),
    },
    grid: {
        width: '100%',
        margin: theme.spacing(0, 0, 2, 0),
    },
    row: {
        display: 'flex',
        justifyContent: 'space-evenly',
        alignItems: 'stretch',
        width: '100%',
        padding: theme.spacing(0),
        [theme.breakpoints.down('xs')]: {
            flexDirection: 'column',
        },
    },
    col: {
        flexGrow: 1,
        padding: theme.spacing(1),
        [theme.breakpoints.down('xs')]: {
            padding: theme.spacing(1, 0),
        },
    },
    input: {
        width: '100%',
        height: '100%',
    },
    controlTitle: {
        fontWeight: 'bold',
        margin: theme.spacing(0, 1, 0, 0),
        padding: theme.spacing(0, 1),
    },
    btnCancelar: {
        backgroundColor: theme.palette.error.main,
        '&:hover': {
            backgroundColor: theme.palette.error.light,
        },
        color: theme.palette.common.white,
        width: theme.spacing(18),
        margin: theme.spacing(1),
        '&.Mui-disabled': {
            backgroundColor: '#e0e0e0',
            color: '#6a6a6a',
        },
    },
    btnAceptar: {
        backgroundColor: theme.palette.secondary.main,
        '&:hover': {
            backgroundColor: theme.palette.secondary.light,
        },
        color: theme.palette.common.white,
        width: theme.spacing(18),
        margin: theme.spacing(1),
        '&.Mui-disabled': {
            backgroundColor: '#e0e0e0',
            color: '#6a6a6a',
        },
    },
    btnLabel: {
        maxWidth: theme.spacing(14),
        marginLeft: theme.spacing(0.5),
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
    textTruncate: {
        width: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    infoText: {
        margin: '3px 14px 0',
        fontSize: '0.75rem',
    },
    loader: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: '4px',
        background: '#e0e0e0',
        zIndex: 9,
    },
}));

export const FormDialogV2 = forwardRef(FormDialogV2Component);
