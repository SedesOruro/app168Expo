import { OptionsObject, SnackbarKey, SnackbarMessage, useSnackbar } from 'notistack';

type Notify = {
    success: (message: SnackbarMessage, options?: OptionsObject) => SnackbarKey;
    error: (message: SnackbarMessage, options?: OptionsObject) => SnackbarKey;
    info: (message: SnackbarMessage, options?: OptionsObject) => SnackbarKey;
    warning: (message: SnackbarMessage, options?: OptionsObject) => SnackbarKey;
};

export const useNotify = (): Notify => {
    const { enqueueSnackbar } = useSnackbar();

    return {
        success: (message, options) => enqueueSnackbar(message, { ...options, variant: 'success' }),
        error: (message, options) => enqueueSnackbar(message, { ...options, variant: 'error' }),
        info: (message, options) => enqueueSnackbar(message, { ...options, variant: 'info' }),
        warning: (message, options) => enqueueSnackbar(message, { ...options, variant: 'warning' })
    };
};
