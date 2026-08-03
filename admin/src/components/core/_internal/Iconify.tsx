import React from 'react';
// icons
import { Icon } from '@iconify/react';
// @mui
import { styled, SxProps, Theme } from '@mui/material/styles';
// ----------------------------------------------------------------------

const IconRoot = styled('span')({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
});

interface Props extends React.ComponentPropsWithoutRef<typeof IconRoot> {
    icon: React.ComponentProps<typeof Icon>['icon'];
    sx?: SxProps<Theme>;
}

export default function Iconify(props: Props) {
    const { icon, sx, ...rest } = props;
    return (
        <IconRoot sx={sx} {...rest}>
            <Icon icon={icon} style={{ width: '100%', height: '100%' }} />
        </IconRoot>
    );
}
