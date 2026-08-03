import React, { ReactElement, useState } from 'react';

// material-ui
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, useTheme, useMediaQuery, Box, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import WarningIcon from '@mui/icons-material/Warning';
import { useIsMounted } from '../_internal/useIsMounted';

type Props = {
    open: boolean;
    title: string;
    message: string | ReactElement ;
    onAccept: () => Promise<any>;
    onCancel: () => void;
};

export const ConfirmDialog = ({ open, onAccept, onCancel, message, title }: Props): ReactElement => {
    const [loading, setLoading] = useState<boolean>(false);
    const isMounted = useIsMounted();

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));

    const handleClick = () => {
        if (loading) return;
        if (isMounted()) setLoading(true);
        onAccept()
            .then(() => {
                if (isMounted()) setLoading(false);
            })
            .catch(() => {
                if (isMounted()) setLoading(false);
            });
    };

    return (
        <Dialog maxWidth={'xs'} open={open} onClose={onCancel} fullScreen={fullScreen} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title" sx={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center' }}>
                <Typography component={'div'} variant={'body2'} sx={{ display: 'flex', alingItems: 'center' }}>
                    <WarningIcon color="warning" fontSize="large" />
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
                </Typography>
                <IconButton aria-label="close" onClick={onCancel}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>{message}</DialogContent>

            <DialogActions>
                <Button onClick={onCancel} color="error">
                    <CloseIcon fontSize="small" />
                    Cancelar
                </Button>
                <Button autoFocus onClick={handleClick} disabled={loading} color="success">
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            width: "30px"
                        }}>
                        {loading && <CircularProgress size={18} color="inherit" />}
                        {!loading && <CheckIcon fontSize="small" />}
                    </Box>
                    Aceptar
                </Button>
            </DialogActions>
        </Dialog>
    );
};
