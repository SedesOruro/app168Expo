import React, { ReactElement } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import { IconButton, SvgIconTypeMap } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { OverridableComponent } from '@mui/material/OverridableComponent';

export type ConfigMenuItem = {
    title: string;
    icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
    onClick: () => void;
};

type Props = {
    items: ConfigMenuItem[];
};

const ConfigMenuView = (props: Props): ReactElement => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton onClick={handleClick}>
                <MoreVertIcon />
            </IconButton>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                variant="selectedMenu"
                style={{ zIndex: 999999 }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {props.items.map((item, index) => {
                    return (
                        <MenuItem
                            key={index}
                            onClick={() => {
                                setAnchorEl(null);
                                item.onClick();
                            }}
                        >
                            <ListItemIcon>
                                <item.icon />
                            </ListItemIcon>
                            <Typography variant="body2">{item.title}</Typography>
                        </MenuItem>
                    );
                })}
            </Menu>
        </>
    );
};

export const ConfigMenu = ConfigMenuView;
