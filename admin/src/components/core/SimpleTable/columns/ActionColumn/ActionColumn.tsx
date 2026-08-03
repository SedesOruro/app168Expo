import { makeStyles } from 'tss-react/mui';
import React, { ReactElement, useState } from 'react';
import clsx from 'clsx';
import { Theme, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useIsMounted } from '../../../_internal/useIsMounted';

type Props = {
    onEditClick?: () => Promise<void>;
    onDeleteClick?: () => Promise<void>;
    size?: "small" | "medium";
};

export const ActionColumn = ({ onEditClick, onDeleteClick, size }: Props): ReactElement => {
    const { classes } = useStyles();
    const [loading, setLoading] = useState<boolean>(false);
    const isMounted = useIsMounted();

    const handleEvent = (fn?: () => Promise<void>) => () => {
        if (loading) return;
        if (fn) {
            setLoading(true);
            fn().then(() => isMounted() && setLoading(false)).catch(() => isMounted() && setLoading(false));
        }
    }

    const renderEditButton = (): ReactElement => {
        return (
            <IconButton
                color="primary"
                component="span"
                size={size || "small"}
                onClick={handleEvent(onEditClick)}
            >
                <EditIcon />
            </IconButton>
        );
    };

    const renderDeleteButton = (): ReactElement => {
        return (
            <IconButton
                color="primary"
                component="span"
                size={size || "small"}
                onClick={handleEvent(onDeleteClick)}
            >
                <DeleteIcon />
            </IconButton>
        );
    };

    return (
        <div className={clsx(classes.root)}>
            {onEditClick && renderEditButton()}
            {onDeleteClick && renderDeleteButton()}
        </div>
    );
};

const useStyles = makeStyles()((theme: Theme) => ({
    root: {
        padding: theme.spacing(0, 1),
        margin: theme.spacing(0, 2),
        display: 'flex',
    },
}));
