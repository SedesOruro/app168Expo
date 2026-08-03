import { makeStyles } from 'tss-react/mui';
import { Card, Divider, IconButton, List, ListItemAvatar, ListItemButton, ListItemSecondaryAction, ListItemText, Theme, Typography } from '@mui/material';
import React, { ReactElement } from 'react';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export type ModuleListItem = {
    icon: 'folder';
    color: string;
    title: string;
    subtitle?: string;
    onClick: () => void;
};

type Props = {
    items: ModuleListItem[];
};

export const ModuleList = (props: Props): ReactElement => {
    const { classes } = useStyles();

    return (
        <Card className={classes.root}>
            <List>
                {props.items.map((item, index) => (
                    <React.Fragment key={index}>
                        <ListItemButton onClick={item.onClick}>
                            <ListItemAvatar style={{ width: '35px', minWidth: '0px' }}>
                                <FolderOpenOutlinedIcon style={{ color: item.color }} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <React.Fragment>
                                        <Typography variant="body2" style={{ color: item.color }}>
                                            <strong>{item.title}</strong>
                                        </Typography>
                                    </React.Fragment>
                                }
                                secondary={
                                    item.subtitle ? (
                                        <React.Fragment>
                                            <Typography variant="caption" style={{ color: item.color }}>
                                                {item.subtitle}
                                            </Typography>
                                        </React.Fragment>
                                    ) : undefined
                                }
                            />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" aria-label="arrow" onClick={item.onClick}>
                                    <ArrowForwardIosIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItemButton>
                        <Divider />
                    </React.Fragment>
                ))}
            </List>
        </Card>
    );
};

const useStyles = makeStyles()((theme: Theme) => ({
    root: {
        margin: theme.spacing(2),
    },
}));
