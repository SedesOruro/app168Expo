import React, { ReactElement, useEffect, useState } from 'react';

// material-ui
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, useTheme, useMediaQuery, Box, CircularProgress, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import WarningIcon from '@mui/icons-material/Warning';
import { useIsMounted } from '../_internal/useIsMounted';

type Props = {
    open: boolean;
    title: string;
    labels: string[]; // 1 or 2 labels
    message: string | ReactElement;
    onAccept: (input1: string, input2?: string) => Promise<any>;
    onCancel: () => void;
};

export const ConfirmInputDialog = ({ open, onAccept, onCancel, labels, message, title }: Props): ReactElement => {
    const theme = useTheme();
    const isMounted = useIsMounted();
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));

    const [loading, setLoading] = useState<boolean>(false);
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [input1Error, setInput1Error] = useState(false);

    const handleClick = () => {
        if (loading) return;

        // Validar input1 antes de continuar
        if (!input1.trim()) {
            setInput1Error(true);
            return;
        }

        setInput1Error(false);
        if (isMounted()) setLoading(true);

        onAccept(input1, labels.length > 1 ? input2 : undefined)
            .then(() => {
                if (isMounted()) setLoading(false);
            })
            .catch(() => {
                if (isMounted()) setLoading(false);
            });
    };

    useEffect(() => {
        setInput1('');
        setInput2('');
        setInput1Error(false); // Reiniciar error al abrir el diálogo
    }, [open]);

    return (
        <Dialog
            maxWidth={'xs'}
            open={open}
            onClose={onCancel}
            fullScreen={fullScreen}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle
                id="form-dialog-title"
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <Typography component={'div'} variant={'body2'} sx={{ display: 'flex', alignItems: 'center' }}>
                    <WarningIcon color="warning" fontSize="large" />
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
                </Typography>
                <IconButton aria-label="close" onClick={onCancel}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {message}
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <TextField
                        id="input1"
                        label={labels[0]}
                        value={input1}
                        onChange={(e) => setInput1(e.target.value)}
                        error={input1Error}
                        helperText={input1Error ? 'Este campo no puede estar vacío.' : ''}
                        sx={{ mb: 2 }}
                    />
                    {labels.length > 1 && (
                        <TextField
                            id="input2"
                            label={labels[1]}
                            value={input2}
                            multiline
                            rows={2}
                            onChange={(e) => setInput2(e.target.value)}
                        />
                    )}
                </Box>
            </DialogContent>

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
