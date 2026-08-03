import { makeStyles } from 'tss-react/mui';
import React, { ReactElement, useState, useImperativeHandle, forwardRef } from 'react';
import { Theme, Dialog, DialogContent, Typography, LinearProgress, AppBar, Toolbar, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { FormDialogPropsV4, FormOptionsV4, MyFormParams, FormDialogRefPropsV4 } from './Types';
import { useIsMounted } from '../_internal/useIsMounted';

const MyComponent = (props: FormDialogPropsV4, ref: React.Ref<FormDialogRefPropsV4>): ReactElement => {
    const {
        title,
        subtitle,
        refresh,
        dialogContent,
    } = props;
    const { classes } = useStyles();
    const isMounted = useIsMounted();

    const [loading, setLoading] = useState<boolean>(false);
    const [formOptions, setFormOptions] = useState<FormOptionsV4>({});
    const [formParams, setFormParams] = useState<MyFormParams>();
    const [open, setOpen] = useState<boolean>(false);

    const fullScreen = true;

    const handleComplete = () => {
        setOpen(false);
        setFormParams(undefined);
        if (formOptions.onComplete) return formOptions.onComplete();
    };

    function renderFormLayout(): ReactElement {
        return (
            <>
                <LinearProgress className={classes.loader} color="primary" variant="indeterminate" hidden={!loading} />
                {dialogContent(formParams)}
            </>
        );
    }

    const renderDialogTitle = (): ReactElement => {
        return (
            <AppBar className={classes.appBar}>
                <Toolbar>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%"
                        }}>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                width: "calc(100% - 50px)"
                            }}>
                            <Typography variant="h6" className={classes.title} noWrap>
                                {title}
                            </Typography>
                            <Typography variant="body2" className={classes.title} noWrap>
                                {subtitle}
                            </Typography>
                        </Box>
                        <Box sx={{
                            ml: "auto"
                        }}>
                            <IconButton edge="start" color="inherit" onClick={handleComplete} aria-label="close">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>
        );
    };

    const refHandler: () => FormDialogRefPropsV4 = () => ({
        open: (options?: FormOptionsV4) => {
            if (!isMounted()) return;
            const newFormOptions = options ? options : {};
            setFormOptions(newFormOptions);
            setOpen(true);
            setLoading(true);
            refresh(newFormOptions.data).then((result) => {
                if (!isMounted()) return;
                setLoading(false);
                if (!result) return;
                const { params: newFormParams } = result;
                if (newFormParams) setFormParams(newFormParams);
            });
        },
        getOptions: () => formOptions,
    });
    useImperativeHandle(ref, refHandler, [formOptions]);

    return (
        <Dialog
            open={open}
            onClose={handleComplete}
            fullWidth
            fullScreen={fullScreen}
           
        >
            {renderDialogTitle()}
            <DialogContent dividers className={classes.dialogContent}>
                {renderFormLayout()}
            </DialogContent>
        </Dialog>
    );
};

const useStyles = makeStyles()((theme: Theme) => ({
    dialogTitle: {
        padding: theme.spacing(1),
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
        padding: '0',
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
    appBar: {
        position: 'relative',
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    linker: {
        padding: theme.spacing(1),
        display: 'flex',
    },
    logo: {
        marginRight: '15px',
        maxWidth: '70%',
        width: '30%',
        [theme.breakpoints.down('xs')]: {
            maxWidth: '4.25rem',
            marginRight: '35px',
            width: '50%',
        },
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
}));

export const FormDialogV4 = forwardRef(MyComponent);
