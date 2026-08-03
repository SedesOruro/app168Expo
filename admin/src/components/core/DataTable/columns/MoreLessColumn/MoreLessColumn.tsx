import React, { ReactElement, useState } from 'react';

import { Box, Link, Typography } from '@mui/material';

type Props = {
    text: string;
    maxLength?: number;
};

export const MoreLessColumn = ({ text, maxLength = 150 }: Props): ReactElement => {

    const [expanded, setExpanded] = useState(false);

    const handleClick = () => setExpanded(!expanded);
    return (
        <Typography variant="subtitle2">
            { expanded? text: `${text.slice(0, maxLength)}... `}
            <Link
                component="button"
                variant="caption"
                onClick={handleClick}
                sx={{ textDecoration: "none", color: "blue"}}
            >
                {expanded? "... Ver menos": "  Ver mas"}
            </Link>
        </Typography>
    );
};
