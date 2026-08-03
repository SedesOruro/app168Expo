import { makeStyles } from 'tss-react/mui';
import React, { ReactElement } from 'react';
import clsx from 'clsx';
import { Link as RouterLink } from 'react-router';

import { Box, Link, Theme, Typography, useMediaQuery, useTheme } from '@mui/material';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { ConfigMenu, ConfigMenuItem } from './ConfigMenu';
import { ModuleInfo, PageTitleInfo } from './PageTitleInfo';

export type Props = {
    value?: string;
    info?: ModuleInfo;
    navTo?: string;

    layout?: string;
    autoHidden?: boolean;
    variant?: 'primary' | 'navbar';
    configMenu?: ConfigMenuItem[];
};

const PageTitleComponent = (props: Props): ReactElement => {
    const { value, navTo, info, autoHidden, variant, configMenu } = props;
    const { classes } = useStyles();
    const theme = useTheme();

    const isSmall = useMediaQuery(theme.breakpoints.down('xs'));
    const isMedium = useMediaQuery(theme.breakpoints.down('sm'));

    const getBackPath = (): string => {
        let newPath = navTo || '/';
        if (newPath.indexOf('?') > -1) {
            newPath = newPath.replace('?', `?action=back&`);
        } else {
            newPath = `${newPath}?action=back`;
        }
        return newPath;
    };

    const renderLeftBox = () => {
        const leftBox = (params: { isSmall: boolean; isMedium: boolean }) => (
            <>
                <Box
                    sx={{
                        pl: 1,
                        pr: params.isMedium ? 0 : 0.5
                    }}>
                    <Link className={classes.link} component={RouterLink} to={getBackPath()} underline="none">
                        <ArrowBackOutlinedIcon color="primary" />
                    </Link>
                </Box>
                <Typography variant={params.isSmall ? 'body2' : params.isMedium ? 'body1' : 'h5'} noWrap>
                    <PageTitleInfo info={info} /> {isSmall ? <strong>{value}</strong> : value}
                </Typography>
                <Box sx={{
                    px: 0.5
                }} />
            </>
        );
        if (isSmall) {
            return (
                <Box className={classes.leftBox} style={{ width: configMenu ? `calc(100% - 50px)` : '100%' }}>
                    {leftBox({ isSmall, isMedium })}
                </Box>
            );
        }
        return (
            <Box className={classes.leftBox} style={{ width: '100%' }}>
                {leftBox({ isSmall, isMedium })}
            </Box>
        );
    };

    const renderConfigBox = () => {
        if (!configMenu) return <></>;
        return (
            <Box className={classes.configBox} style={{ width: '50px' }}>
                <ConfigMenu items={configMenu} />
            </Box>
        );
    };

    if (variant && variant === 'primary') {
        if (isSmall) {
            return (
                <div className={clsx(classes.root)} style={{ background: 'white' }}>
                    {renderLeftBox()}
                    <Box sx={{
                        m: 'auto'
                    }} />
                    {renderConfigBox()}
                </div>
            );
        }
        return (
            <div className={clsx(classes.root)}>
                {renderLeftBox()}
                <Box sx={{
                    m: 'auto'
                }} />
                <></>
                <Box sx={{
                    m: 'auto'
                }} />
                <></>
            </div>
        );
    }

    if (variant && variant === 'navbar') {
        if (isSmall) {
            return (
                <div className={clsx(classes.root)} style={{ background: 'white' }}>
                    {renderLeftBox()}
                    <Box sx={{
                        m: 'auto'
                    }} />
                    {renderConfigBox()}
                </div>
            );
        }
        return <></>;
    }

    return (
        <div
            className={clsx(classes.root, {
                [classes.rootHidden]: typeof autoHidden === 'boolean' ? autoHidden : false,
            })}
        >
            <Link className={classes.link} component={RouterLink} to={navTo || '/'} underline="none">
                <ArrowBackOutlinedIcon color="primary" />
            </Link>
            <Typography variant="h5" noWrap>
                <PageTitleInfo info={info} /> {value}
            </Typography>
        </div>
    );
};

const useStyles = makeStyles()((theme: Theme) => ({
    root: {
        maxWidth: '100%',
        display: 'flex',
        height: '60px',
        alignItems: 'center',
        color: theme.palette.primary.main,
        padding: theme.spacing(2),
        [theme.breakpoints.down('xs')]: {
            padding: theme.spacing(0.5, 1),
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '56px',
            zIndex: 1250, // 1300 = formDialog  1200 = AppBar
        },
    },
    rootHidden: {
        [theme.breakpoints.down('xs')]: {
            display: 'none',
        },
    },
    leftBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
        height: '60px',
    },
    configBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        height: '60px',
    },
    link: {
        margin: theme.spacing(0),
        padding: theme.spacing(0),
        display: 'flex',
        alignItems: 'center',
        width: theme.spacing(4),
    },
}));

export default PageTitleComponent;
