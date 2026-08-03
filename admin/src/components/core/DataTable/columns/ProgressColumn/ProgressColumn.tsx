import React, { ReactElement } from 'react';
import CircularProgress, { CircularProgressProps } from '@mui/material/CircularProgress';
import { Box, Typography } from '@mui/material';

export const ProgressColumn = (props: CircularProgressProps & { value: number }): ReactElement => {
    return (
        <Box
            sx={{
                position: "relative",
                display: "inline-flex"
            }}>
            <CircularProgress variant="indeterminate" {...props} />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                <Typography variant="caption" component="div" color="textSecondary">
                    {`${Math.round(props.value)}%`}
                </Typography>
            </Box>
        </Box>
    );
};
