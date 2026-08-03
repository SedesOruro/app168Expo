import { useSnackbar } from 'notistack';

export const useNotify = () => {
    const { enqueueSnackbar } = useSnackbar();

    return {
        success: (message: string) => enqueueSnackbar(message, { variant: 'success' }),
        error: (message: string) => enqueueSnackbar(message, { variant: 'error' }),
        info: (message: string) => enqueueSnackbar(message, { variant: 'info' }),
        warning: (message: string) => enqueueSnackbar(message, { variant: 'warning' })
    };
};
