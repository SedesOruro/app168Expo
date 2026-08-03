import { makeStyles } from 'tss-react/mui';
import React, { ReactElement, useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Formik, Form, FormikProps } from 'formik';
import { Theme, Dialog, DialogContent, DialogActions, Button, Typography, CircularProgress, Box, LinearProgress, DialogTitle } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import SendIcon from '@mui/icons-material/Send';
import { FormDialogPropsV3, MyFormModel, FormDialogRefPropsV2, FormOptionsV3, MyFormParams } from './Types';

// Configuración global para los mensajes de error en los formularios
import { setLocale } from 'yup';
import clsx from 'clsx';
import { useIsMounted } from '../_internal/useIsMounted';
import { useNotify } from '../_internal/useNotify';

setLocale({
    mixed: {
        default: 'No es válido ',
        required: 'El campo es obligatorio ',
        notType: 'El campo no tiene el formato correcto ',
    },
});

const FormDialogV3Component = (props: FormDialogPropsV3, ref: React.Ref<FormDialogRefPropsV2>): ReactElement => {
    const {
        addTitle,
        editTitle,
        validationSchema,
        labelAceptar,
        labelCancelar,
        labelGuardar,
        debug,
        statusBar,
        headerComponent,
        submit,
        refresh,
        dialogContent,
        disableSave,
        disableSend,
    } = props;
    const { classes } = useStyles();
    const notify = useNotify();
    const isMounted = useIsMounted();

    const [loading, setLoading] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [formOptions, setFormOptions] = useState<FormOptionsV3>({});
    const [formModel, setFormModel] = useState<MyFormModel>({});
    const [formParams, setFormParams] = useState<MyFormParams>();
    const [open, setOpen] = useState<boolean>(false);

    const fullScreen = true;

    const handleCancel = () => {
        setOpen(false);
        setFormModel({});
        setFormParams(undefined);
        if (formOptions.onClose) return formOptions.onClose();
    };

    const handleSave = (data: MyFormModel) => {
        setOpen(false);
        setFormModel({});
        setFormParams(undefined);
        if (formOptions.onSave) return formOptions.onSave(data);
    };

    const handleComplete = (data: MyFormModel) => {
        setOpen(false);
        setFormModel({});
        setFormParams(undefined);
        if (formOptions.onSend) return formOptions.onSend(data);
    };

    function renderFormLayout(formik: FormikProps<typeof formModel>): ReactElement {
        return (
            <>
                <LinearProgress className={classes.loader} color="primary" variant="indeterminate" hidden={!loading} />
                {dialogContent(formik, formParams)}
            </>
        );
    }

    const formikRef = useRef<FormikProps<MyFormModel>>(null);
    useEffect(() => formikRef.current?.resetForm({}), [formikRef, formModel]);

    const refHandler: () => FormDialogRefPropsV2 = () => ({
        open: (options?: FormOptionsV3) => {
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

    const renderCancelButton = (formik: FormikProps<typeof formModel>): ReactElement => {
        return (
            <Button className={classes.btnCancelar} onClick={handleCancel} disabled={formik.isSubmitting || loading}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "30px"
                    }}>
                    <CloseIcon fontSize="small" />
                </Box>
                <span className={classes.btnLabel}>{labelCancelar || 'Cerrar'}</span>
            </Button>
        );
    };

    const renderSaveButton = (formik: FormikProps<typeof formModel>): ReactElement => {
        if (disableSave || formik.values.estado === 'LLENADO') return <></>;
        return (
            <Button
                className={classes.btnGuardar}
                onClick={() => {
                    if (formik.isSubmitting) return;
                    setSaving(true);
                    formik.setFieldValue('estado', 'PENDIENTE');
                    formik.handleSubmit();
                }}
                disabled={formik.isSubmitting || loading}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "30px"
                    }}>
                    {formik.isSubmitting && saving && <CircularProgress size={18} color="inherit" />}
                    {(!formik.isSubmitting || !saving) && <CheckIcon fontSize="small" />}
                </Box>
                <span className={classes.btnLabel}>{labelGuardar || 'Guardar'}</span>
            </Button>
        );
    };

    const renderSendButton = (formik: FormikProps<typeof formModel>): ReactElement => {
        if (disableSend || formik.values.estado === 'LLENADO') return <></>;
        return (
            <Button
                className={clsx(classes.btnAceptar)}
                autoFocus
                onClick={() => {
                    if (formik.isSubmitting) return;
                    if (!formik.isValid) {
                        return notify.error('Existen campos vacíos, verifique e inténtelo nuevamente.');
                    }
                    formik.setFieldValue('estado', 'LLENADO');
                    formik.handleSubmit();
                }}
                disabled={formik.isSubmitting || loading}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "30px"
                    }}>
                    {formik.isSubmitting && !saving && <CircularProgress size={18} color="inherit" />}
                    {(!formik.isSubmitting || saving) && <SendIcon fontSize="small" />}
                </Box>
                <span className={classes.btnLabel}>{labelAceptar || 'Enviar'}</span>
            </Button>
        );
    };

    return (
        <Formik
            initialValues={formModel}
            onSubmit={(data, { setSubmitting, validateForm }) => {
                if (!isMounted()) return;
                setSubmitting(true);
                validateForm().then((result) => {
                    const isValid = Object.keys(result).length === 0;
                    if (!isValid) {
                        setSubmitting(false);
                        return notify.error('Por favor complete el formulario.');
                    }
                    submit(data, formOptions.data).then((success) => {
                        if (!isMounted()) return;
                        setSubmitting(false);
                        if (success && saving) handleSave(data);
                        if (success && !saving) handleComplete(data);
                        setSaving(false);
                    });
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
                            <DialogTitle className={classes.dialogTitle}>
                                <Typography variant="body1">{formOptions.isEdit ? editTitle || 'Editar' : addTitle || 'Agregar'}</Typography>
                            </DialogTitle>
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
                                    {renderCancelButton(formik)}
                                    {renderSaveButton(formik)}
                                    {renderSendButton(formik)}
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
        padding: theme.spacing(1.5, 2),
        borderBottom: `1px solid ${theme.palette.divider}`,
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
        [theme.breakpoints.down('xs')]: { 
            justifyContent: 'center',
        },
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
        [theme.breakpoints.down('xs')]: {
            fontSize: '80%',
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
        [theme.breakpoints.down('xs')]: {
            fontSize: '80%',
        },
    },
    btnGuardar: {
        backgroundColor: theme.palette.primary.main,
        '&:hover': {
            backgroundColor: theme.palette.primary.light,
        },
        color: theme.palette.common.white,
        width: theme.spacing(18),
        margin: theme.spacing(1),
        '&.Mui-disabled': {
            backgroundColor: '#e0e0e0',
            color: '#6a6a6a',
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: '80%',
        },
    },
    btnLabel: {
        maxWidth: theme.spacing(14),
        marginLeft: theme.spacing(0.5),
        [theme.breakpoints.down('xs')]: {
            marginLeft: theme.spacing(0),
        },
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

export const FormDialogV3 = forwardRef(FormDialogV3Component);
