import React, { ReactElement, useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { useTheme, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SendIcon from '@mui/icons-material/Send';
import CommentIcon from '@mui/icons-material/Comment';
import { useIsMounted } from '../../../_internal/useIsMounted';
import { ConfirmDialog } from '../../../ConfirmDialog';

type Props = {
    deleteMessage?: string | ReactElement;
    onEditClick?: () => Promise<void>;
    onLockOpenClick?: () => Promise<any>;
    onDeleteClick?: () => Promise<any>;
    onViewClick?: () => void;
    onSendClick?: () => void;
    onCommentClick?: () => void;
    onLockOpenMessage?: string | ReactElement;
    size?: 'small' | 'medium';
};

export const ActionColumn = ({ deleteMessage, onEditClick, onLockOpenClick, onDeleteClick, onViewClick, onSendClick, onCommentClick, onLockOpenMessage, size }: Props): ReactElement => {
    const theme = useTheme();
    const isMounted = useIsMounted();

    const [loading, setLoading] = useState<boolean>(false);
    const [openReset, setOpenReset] = useState<boolean>(false);
    const [openDelete, setOpenDelete] = useState<boolean>(false);

    const handleEvent = (fn?: () => Promise<void>) => () => {
        if (loading || !fn) return;

        isMounted() && setLoading(true);
        fn()
            .then(() => isMounted() && setLoading(false))
            .catch(() => isMounted() && setLoading(false));
    };

    return (
        <div
            style={{
                padding: theme.spacing(0, 1),
                margin: theme.spacing(0, 2),
                display: 'flex',
                justifyContent: 'center'
            }}
        >
            {onViewClick && (
                <Tooltip title="Ver">
                    <IconButton color="primary" aria-label="view" component="span" onClick={onViewClick} size={size}>
                        <VisibilityIcon />
                    </IconButton>
                </Tooltip>
            )}

            {onEditClick && (
                <Tooltip title="Editar">
                    <IconButton color="primary" aria-label="edit" component="span" disabled={loading} onClick={handleEvent(onEditClick)} size={size}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>
            )}

            {onSendClick && (
                <Tooltip title="Enviar">
                    <IconButton color="primary" aria-label="send" component="span" onClick={onSendClick} size={size}>
                        <SendIcon />
                    </IconButton>
                </Tooltip>
            )}

            {onDeleteClick && (
                <>
                    <ConfirmDialog
                        title="Confirmar"
                        message={deleteMessage || 'Quiere eliminar el registro?'}
                        open={openDelete}
                        onAccept={async () =>
                            onDeleteClick()
                                .then(() => isMounted() && setOpenDelete(false))
                                .catch(() => isMounted() && setOpenDelete(false))
                        }
                        onCancel={() => isMounted() && setOpenDelete(false)}
                    />
                    <Tooltip title="Borrar">
                        <IconButton color="primary" aria-label="delete" component="span" onClick={() => setOpenDelete(true)} size={size}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </>
            )}

            {onLockOpenClick && (
                <>
                    <ConfirmDialog
                        title="Confirmar"
                        message={onLockOpenMessage || 'Quiere reestablecer la contrasena del usuario?'}
                        open={openReset}
                        onAccept={async () => onLockOpenClick().then(() => isMounted() && setOpenReset(false))}
                        onCancel={() => isMounted() && setOpenReset(false)}
                    />
                    <Tooltip title="Reset">
                        <IconButton color="primary" aria-label="reset" component="span" onClick={() => isMounted() && setOpenReset(true)} size={size}>
                            <LockOpenIcon />
                        </IconButton>
                    </Tooltip>
                </>
            )}

            {onCommentClick && (
                <IconButton color="default" aria-label="comment" component="span" onClick={onCommentClick} size={size}>
                    <CommentIcon />
                </IconButton>
            )}
        </div>
    );
};
