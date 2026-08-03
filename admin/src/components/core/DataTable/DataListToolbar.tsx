import React from 'react';
// material
import { styled } from '@mui/material/styles';
import { Toolbar, Tooltip, IconButton, Typography, Box } from '@mui/material';
import Iconify from '../_internal/Iconify';
import { DataListToolbarProps } from './Types';
// component

// ----------------------------------------------------------------------

const RootStyle = styled(Toolbar)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 1, 0, 3),
    margin: theme.spacing(1, 0)
}));

export default function DataListToolbar({ numSelected, input, onActionOption1Click, onActionOption2Click }: DataListToolbarProps) {
    if (!(numSelected > 0)) return <>{input}</>;

    return (
        <RootStyle
            sx={{
                ...(numSelected > 0 && {
                    color: 'primary.main',
                    bgcolor: 'primary.lighter'
                })
            }}
        >
            {numSelected > 0 && (
                <Typography component="div" variant="subtitle1">
                    {numSelected} selected
                </Typography>
            )}

            {numSelected > 0 && (
                <Box>
                    {
                        onActionOption2Click && <Tooltip title="Opcion 2">
                                                    <IconButton onClick={onActionOption2Click}>
                                                        <Iconify icon="lucide:list-todo" />
                                                    </IconButton>
                                                </Tooltip>
                    }
                    <Tooltip title="Opcion 1">
                        <IconButton onClick={onActionOption1Click}>
                            <Iconify icon="lucide:list-x" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}
        </RootStyle>
    );
}
